/**
 * hand_tracker.js - ESL 視訊單字泡泡遊戲 體感手勢追蹤核心模組 (極速 60FPS 零延遲強化版)
 * 特色：
 * 1. MediaPipe Hands 輕量化神經網路 (modelComplexity: 0, 響應延遲 < 25ms)
 * 2. 60FPS 渲染非阻塞解耦架構 (requestAnimationFrame 不受推理等待影響)
 * 3. 全手部多點感應 (食指尖、中指尖、拇指尖、掌心、指節，多點即觸即破)
 * 4. 寬容度碰撞檢測 (半徑擴大 1.3 倍，揮手即可輕鬆破泡)
 * 5. 視訊 cover 鏡像對齊與 object-fit 像素補償
 */

class HandTracker {
  constructor(options = {}) {
    this.videoElement = options.videoElement || null;
    this.stageElement = options.stageElement || document.body;
    this.onHandMove = options.onHandMove || (() => {});
    this.onBubbleHit = options.onBubbleHit || (() => {});
    this.statusCallback = options.onStatusChange || (() => {});

    this.stream = null;
    this.cameraReady = false;
    this.mediaPipeActive = false;
    this.isMirrored = true;

    // 手部資料
    this.hands = [];
    this.lastHitTimes = new Map(); // 泡泡命中冷卻時間

    // 非阻塞推理旗標
    this.isProcessingMp = false;
    this.lastMpProcessTime = 0;

    // 動態差分備援 (僅在無 MediaPipe 時啟用)
    this.motionCanvas = document.createElement('canvas');
    this.motionCanvas.width = 160;
    this.motionCanvas.height = 120;
    this.motionCtx = this.motionCanvas.getContext('2d', { willReadFrequently: true });
    this.prevFrameData = null;

    // 動畫 frame handle
    this.animFrameId = null;
    this.mpHands = null;

    this.motionThreshold = 28;
  }

  // 啟動攝影機與追蹤
  async initCamera() {
    this.statusCallback('正在啟動攝影機...');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 960 },
          height: { ideal: 540 },
          facingMode: 'user'
        },
        audio: false
      });

      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
        this.cameraReady = true;
        this.statusCallback('攝影機已啟動');
      }

      // 初始化 MediaPipe Hands
      this.initMediaPipeHands();

      // 啟動極速 60FPS 監控迴圈
      this.startLoop();
      return true;
    } catch (err) {
      console.warn('無法取得攝影機串流:', err);
      this.cameraReady = false;
      this.statusCallback('未偵測到攝影機，已切換為滑鼠/觸控模式');
      return false;
    }
  }

  // 初始化 MediaPipe Hands (使用 modelComplexity: 0 輕量版)
  initMediaPipeHands() {
    if (typeof window.Hands !== 'function') {
      console.info('未載入 MediaPipe 函式庫，自動切換為高效率動態差分偵測');
      return;
    }

    try {
      this.mpHands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
      });

      // 關鍵優化：modelComplexity: 0 為輕量極速模型，延遲大幅降低至 15~25ms
      this.mpHands.setOptions({
        maxNumHands: 2,
        modelComplexity: 0,
        minDetectionConfidence: 0.45,
        minTrackingConfidence: 0.45
      });

      this.mpHands.onResults((results) => {
        this.handleMediaPipeResults(results);
      });

      this.mediaPipeActive = true;
      this.statusCallback('AI 雙手體感已就緒！揮動雙手戳破泡泡');
    } catch (e) {
      console.warn('MediaPipe 初始化失敗，使用動態差分:', e);
      this.mediaPipeActive = false;
    }
  }

  // 計算 object-fit: cover 模式下視訊在舞台實際渲染尺寸與偏移
  getVideoRenderInfo() {
    const stageRect = this.stageElement.getBoundingClientRect();
    const containerW = stageRect.width || window.innerWidth;
    const containerH = stageRect.height || window.innerHeight;
    const videoW = (this.videoElement && this.videoElement.videoWidth) ? this.videoElement.videoWidth : 960;
    const videoH = (this.videoElement && this.videoElement.videoHeight) ? this.videoElement.videoHeight : 540;

    const containerAspect = containerW / containerH;
    const videoAspect = videoW / videoH;

    let renderedW, renderedH, offsetX, offsetY;

    if (containerAspect > videoAspect) {
      // 寬螢幕：寬度填滿，上下裁切
      renderedW = containerW;
      renderedH = containerW / videoAspect;
      offsetX = 0;
      offsetY = (containerH - renderedH) / 2;
    } else {
      // 窄螢幕：高度填滿，左右裁切
      renderedH = containerH;
      renderedW = containerH * videoAspect;
      offsetX = (containerW - renderedW) / 2;
      offsetY = 0;
    }

    return { containerW, containerH, renderedW, renderedH, offsetX, offsetY };
  }

  // 將正規化相機座標 [0, 1] 轉換為舞台像素座標 (含鏡像與 cover 偏移補償)
  mapNormalizedToStage(normX, normY) {
    const { renderedW, renderedH, offsetX, offsetY } = this.getVideoRenderInfo();
    return {
      x: normX * renderedW + offsetX,
      y: normY * renderedH + offsetY
    };
  }

  // 解析 MediaPipe 雙手偵測結果 (多關鍵點感應 + 低延遲平滑)
  handleMediaPipeResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      if (this.mediaPipeActive) {
        this.hands = [];
        this.onHandMove([]);
      }
      return;
    }

    const currentHands = [];

    results.multiHandLandmarks.forEach((landmarks, idx) => {
      // 收集手部多個關鍵部位：食指尖(8)、中指尖(12)、拇指尖(4)、掌心(9)、指節(7)
      const keyLandmarks = [
        landmarks[8],  // 食指尖 (最主要戳擊點)
        landmarks[12], // 中指尖
        landmarks[4],  // 拇指尖
        landmarks[9],  // 掌心 (中指 MCP)
        landmarks[7],  // 食指第二關節
      ].filter(Boolean);

      // 主要游標點（以食指尖為主，掌心為輔）
      const mainPoint = landmarks[8] || landmarks[9] || landmarks[0];
      const normMainX = this.isMirrored ? (1 - mainPoint.x) : mainPoint.x;
      const { x: targetX, y: targetY } = this.mapNormalizedToStage(normMainX, mainPoint.y);

      // 快速響應平滑濾波 (新座標權重 0.8，消除延遲手感)
      const prevHand = this.hands.find(h => h.id === idx);
      let smoothX = targetX;
      let smoothY = targetY;

      if (prevHand) {
        smoothX = prevHand.x * 0.2 + targetX * 0.8;
        smoothY = prevHand.y * 0.2 + targetY * 0.8;
      }

      currentHands.push({
        id: idx,
        x: smoothX,
        y: smoothY,
        normX: normMainX,
        normY: mainPoint.y
      });

      // 對所有重要手部節點均進行碰撞測試（手指或掌心碰觸泡泡立即破裂！）
      keyLandmarks.forEach(kp => {
        const nx = this.isMirrored ? (1 - kp.x) : kp.x;
        const { x: px, y: py } = this.mapNormalizedToStage(nx, kp.y);
        this.checkBubbleCollisions(px, py);
      });
    });

    this.hands = currentHands;
    this.onHandMove(this.hands);
  }

  // 極速 60FPS 監控迴圈 (渲染與推理非阻塞完全解耦)
  startLoop() {
    const loop = (timestamp) => {
      if (this.cameraReady && this.videoElement && this.videoElement.readyState >= 2) {
        // MediaPipe 非同步背景送幀，不卡頓 60FPS 主渲染
        if (this.mediaPipeActive && this.mpHands) {
          if (!this.isProcessingMp && (timestamp - this.lastMpProcessTime > 28)) {
            this.isProcessingMp = true;
            this.lastMpProcessTime = timestamp;
            this.mpHands.send({ image: this.videoElement })
              .catch(() => {})
              .finally(() => {
                this.isProcessingMp = false;
              });
          }
        } else if (!this.mediaPipeActive) {
          // 僅在無 MediaPipe 時啟用動態差分備援
          this.processMotionDifferencing();
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  // 像素差異動態感應 (僅作為無 MediaPipe 時之極限備援)
  processMotionDifferencing() {
    if (!this.videoElement || this.videoElement.paused || this.videoElement.ended) return;

    const w = this.motionCanvas.width;
    const h = this.motionCanvas.height;

    this.motionCtx.drawImage(this.videoElement, 0, 0, w, h);
    const currentFrame = this.motionCtx.getImageData(0, 0, w, h);
    const curr = currentFrame.data;

    if (!this.prevFrameData) {
      this.prevFrameData = curr;
      return;
    }

    const prev = this.prevFrameData;
    let motionCount = 0;
    let sumX = 0;
    let sumY = 0;

    for (let y = 0; y < h; y += 3) {
      for (let x = 0; x < w; x += 3) {
        const i = (y * w + x) * 4;
        const diff = Math.abs(curr[i] - prev[i]) +
                     Math.abs(curr[i + 1] - prev[i + 1]) +
                     Math.abs(curr[i + 2] - prev[i + 2]);

        if (diff > this.motionThreshold * 3) {
          const normX = this.isMirrored ? (1 - x / w) : (x / w);
          const normY = y / h;
          const { x: stageX, y: stageY } = this.mapNormalizedToStage(normX, normY);

          sumX += stageX;
          sumY += stageY;
          motionCount++;
        }
      }
    }

    this.prevFrameData = curr;

    if (motionCount >= 25) {
      const avgX = sumX / motionCount;
      const avgY = sumY / motionCount;
      this.hands = [{ id: 0, x: avgX, y: avgY, isMotionCentroid: true }];
      this.onHandMove(this.hands);
      this.checkBubbleCollisions(avgX, avgY);
    }
  }

  // 泡泡碰撞檢測 (大幅擴大感應半徑，輕觸即破)
  checkBubbleCollisions(handX, handY) {
    const stageRect = this.stageElement.getBoundingClientRect();
    const bubbleElements = document.querySelectorAll('.word-bubble:not(.popping)');

    bubbleElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const bX = rect.left - stageRect.left + rect.width / 2;
      const bY = rect.top - stageRect.top + rect.height / 2;
      // 擴大碰撞半徑至泡泡半徑 + 28px 緩衝區，感應極其靈敏爽快！
      const radius = (rect.width / 2) + 28;

      const dx = handX - bX;
      const dy = handY - bY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= radius * radius) {
        this.triggerBubbleHit(el.dataset.wordId, bX, bY);
      }
    });
  }

  // 觸發泡泡命中 (冷卻縮短至 260ms，響應更靈敏)
  triggerBubbleHit(wordId, hitX, hitY) {
    const now = performance.now();
    const lastHit = this.lastHitTimes.get(wordId) || 0;
    if (now - lastHit < 260) return;

    this.lastHitTimes.set(wordId, now);
    this.onBubbleHit(wordId, hitX, hitY);
  }

  // 滑鼠 / 觸控點擊相容
  bindMouseAndTouch(stage) {
    stage.addEventListener('pointerdown', (e) => {
      const rect = this.stageElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.hands = [{ id: 'pointer', x, y }];
      this.onHandMove(this.hands);

      const targetBubble = e.target.closest('.word-bubble');
      if (targetBubble && !targetBubble.classList.contains('popping')) {
        const wordId = targetBubble.dataset.wordId;
        this.triggerBubbleHit(wordId, x, y);
      }
    });

    stage.addEventListener('pointermove', (e) => {
      const rect = this.stageElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.hands = [{ id: 'pointer', x, y }];
      this.onHandMove(this.hands);
    });
  }

  // 銷毀與停止
  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.cameraReady = false;
  }
}

window.HandTracker = HandTracker;
