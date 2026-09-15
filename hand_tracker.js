/** 食指指尖追蹤：所有泡泡採相同即時碰撞規則；實際延遲依設備與模型而異。 */

class HandTracker {
  constructor(options = {}) {
    this.videoElement = options.videoElement || null;
    this.stageElement = options.stageElement || document.body;
    this.onHandMove = options.onHandMove || (() => {});
    this.onBubbleHit = options.onBubbleHit || (() => {});
    this.statusCallback = options.onStatusChange || (() => {});

    this.isPlaying = options.isPlaying || (() => true);
    this.lastVideoTime = -1;
    this.stream = null;
    this.cameraReady = false;
    this.mediaPipeActive = false;
    this.isMirrored = true;

    // 手部資料
    this.hands = [];

    // 非阻塞推理旗標
    this.isProcessingMp = false;
    this.inferenceToken = 0;
    this.inferenceTimer = null;
    this.nextInferenceAt = 0;

    // 動畫 frame handle
    this.animFrameId = null;
    this.mpHands = null;

  }

  // 啟動攝影機與追蹤
  async initCamera() {
    this.statusCallback('正在啟動攝影機...');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 960 },
          height: { ideal: 540 },
          frameRate: { ideal: 30, max: 30 },
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

      // 啟動視訊新幀監控迴圈
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
    if (this.mpHands) return;
    if (typeof window.Hands !== 'function') {
      this.statusCallback('手勢模型未載入，請使用滑鼠／觸控操作');
      return;
    }

    try {
      this.mpHands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
      });

      // 使用輕量模型；實際推論時間需於目標裝置量測
      this.mpHands.setOptions({
        maxNumHands: 2,
        modelComplexity: 0,
        minDetectionConfidence: 0.45,
        minTrackingConfidence: 0.45
      });

      const model = this.mpHands;
      this.mpHands.onResults((results) => {
        if (this.mpHands !== model || !this.mediaPipeActive) return;
        this.handleMediaPipeResults(results);
      });

      this.mediaPipeActive = true;
      this.statusCallback('AI 食指追蹤已啟用，請用食指指尖戳破泡泡');
    } catch (e) {
      console.warn('MediaPipe 初始化失敗:', e);
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

    return { containerW, containerH, renderedW, renderedH, offsetX, offsetY, left: stageRect.left, top: stageRect.top };
  }

  // 將正規化相機座標 [0, 1] 轉換為舞台像素座標 (含鏡像與 cover 偏移補償)
  mapNormalizedToStage(normX, normY, info = this.getVideoRenderInfo()) {
    const { renderedW, renderedH, offsetX, offsetY, left, top } = info;
    return {
      x: normX * renderedW + offsetX + left,
      y: normY * renderedH + offsetY + top
    };
  }

  // 游標和碰撞都只使用食指指尖 (landmark 8)，不額外平滑或等待。
  handleMediaPipeResults(results) {
    if (!this.cameraReady || !this.isPlaying() || document.hidden) return;
    const renderInfo = this.getVideoRenderInfo();
    const targets = this.getCollisionTargets();
    this.hands = (results.multiHandLandmarks || []).flatMap((landmarks, id) => {
      const tip = landmarks[8];
      if (!tip || !Number.isFinite(tip.x) || !Number.isFinite(tip.y)) return [];
      const normX = this.isMirrored ? 1 - tip.x : tip.x;
      const { x, y } = this.mapNormalizedToStage(normX, tip.y, renderInfo);
      this.checkBubbleCollisions(x, y, targets);
      return [{ id, x, y, normX, normY: tip.y }];
    });
    this.onHandMove(this.hands);
  }

  // 視訊新幀監控迴圈 (一次僅送出一幀，避免堆積)
  startLoop() {
    if (this.animFrameId !== null) cancelAnimationFrame(this.animFrameId);
    const loop = (timestamp) => {
      if (!document.hidden && this.isPlaying() && this.cameraReady && this.videoElement && this.videoElement.readyState >= 2 && this.lastVideoTime !== this.videoElement.currentTime) {
        // 只送最新視訊幀，不額外節流等待
        if (this.mediaPipeActive && this.mpHands) {
          if (!this.isProcessingMp && timestamp >= this.nextInferenceAt) {
            this.lastVideoTime = this.videoElement.currentTime;
            this.isProcessingMp = true;
            const token = ++this.inferenceToken;
            const started = performance.now();
            // 模型停滯時停止送幀，避免建立更多 GPU 工作或模型。
            this.inferenceTimer = setTimeout(() => {
              if (token !== this.inferenceToken) return;
              this.disableTracking('手勢辨識逾時，請先使用滑鼠／觸控；重新整理可重啟鏡頭');
            }, 8000);
            Promise.resolve().then(() => this.mpHands.send({ image: this.videoElement }))
              .catch(err => {
                if (token !== this.inferenceToken) return;
                console.warn('手勢模型失敗', err);
                this.disableTracking('手勢模型無法使用，請使用滑鼠／觸控操作');
              })
              .finally(() => {
                if (token !== this.inferenceToken) return;
                clearTimeout(this.inferenceTimer);
                this.inferenceTimer = null;
                this.isProcessingMp = false;
                // 上限約 24 次／秒；慢裝置在推論後保留短暫繪圖時間。
                const duration = performance.now() - started;
                this.nextInferenceAt = performance.now() + Math.max(8, 1000 / 24 - duration);
              });
          }
        } else if (!this.mediaPipeActive) {
          // 模型不可用時清空游標，使用滑鼠／觸控備援
          this.hands = [];
          this.onHandMove([]);
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  disableTracking(message) {
    ++this.inferenceToken;
    clearTimeout(this.inferenceTimer);
    this.inferenceTimer = null;
    this.isProcessingMp = false;
    this.mediaPipeActive = false;
    this.hands = [];
    this.onHandMove([]);
    this.statusCallback(message);
  }

  // 泡泡碰撞檢測 (大幅擴大感應半徑，輕觸即破)
  getCollisionTargets() {
    return Array.from(this.stageElement.querySelectorAll('.word-bubble:not(.popping)'), el => {
      const rect = el.getBoundingClientRect();
      return { el, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, radius: rect.width / 2 + 28 };
    });
  }

  checkBubbleCollisions(handX, handY, targets = this.getCollisionTargets()) {
    if (!this.isPlaying()) return;
    for (const target of targets) {
      if (target.el.classList.contains('popping')) continue;
      const dx = handX - target.x;
      const dy = handY - target.y;
      if (dx * dx + dy * dy <= target.radius * target.radius) {
        this.triggerBubbleHit(target.el, target.x, target.y);
      }
    }
  }

  triggerBubbleHit(el, hitX, hitY) {
    if (!this.isPlaying() || el.classList.contains('popping')) return;
    // DOM 本身的 popping 狀態去重，不讓上一顆同名泡泡鎖住新泡泡。
    this.onBubbleHit(el.dataset.wordId, hitX, hitY, el);
  }

  // 滑鼠 / 觸控點擊相容
  bindMouseAndTouch(stage) {
    stage.addEventListener('pointerdown', (e) => {
      if (!this.isPlaying()) return;
      const x = e.clientX;
      const y = e.clientY;

      this.hands = [{ id: 'pointer', x, y }];
      this.onHandMove(this.hands);

      const targetBubble = e.target.closest('.word-bubble');
      if (targetBubble && !targetBubble.classList.contains('popping')) {
        const wordId = targetBubble.dataset.wordId;
        this.triggerBubbleHit(targetBubble, x, y);
      }
    });

    stage.addEventListener('pointermove', (e) => {
      if (!this.isPlaying()) return;
      const x = e.clientX;
      const y = e.clientY;
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
    this.hands = [];
    this.onHandMove([]);
    this.lastVideoTime = -1;
    this.nextInferenceAt = 0;
  }
}

window.HandTracker = HandTracker;
