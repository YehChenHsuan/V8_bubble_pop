/**
 * game.js - ESL 視訊單字泡泡遊戲 核心遊戲邏輯 (Animal Kingdom A-Z 40種野生動物大百科與專長對決 V8 專用)
 * 適用教材：Page 18 Word List (Words to Remember)
 * 涵蓋：40 個完整單字庫、自訂勾選練習單字清單 (最少 6 個)、狀態機、泡泡排布、碰撞反饋、補換泡泡、愛心扣血、計時器、排行榜
 */

// 課本 Page 18 單字資料庫 (40 個單字完整配置)
const VOCABULARY = [
  {
    "id": "ant",
    "word": "ant",
    "col": "left",
    "type": "animal",
    "zh": "螞蟻",
    "img": "V8_flashcards_images/V8_ant.webp",
    "audio": "V8_flashcards_audios/V8_ant.mp3",
    "audioZh": "V8_flashcards_audios/V8_ant_zh.mp3"
  },
  {
    "id": "cat",
    "word": "cat",
    "col": "left",
    "type": "animal",
    "zh": "貓",
    "img": "V8_flashcards_images/V8_cat.webp",
    "audio": "V8_flashcards_audios/V8_cat.mp3",
    "audioZh": "V8_flashcards_audios/V8_cat_zh.mp3"
  },
  {
    "id": "horse",
    "word": "horse",
    "col": "left",
    "type": "animal",
    "zh": "馬",
    "img": "V8_flashcards_images/V8_horse.webp",
    "audio": "V8_flashcards_audios/V8_horse.mp3",
    "audioZh": "V8_flashcards_audios/V8_horse_zh.mp3"
  },
  {
    "id": "jaguar",
    "word": "jaguar",
    "col": "left",
    "type": "animal",
    "zh": "美洲豹",
    "img": "V8_flashcards_images/V8_jaguar.webp",
    "audio": "V8_flashcards_audios/V8_jaguar.mp3",
    "audioZh": "V8_flashcards_audios/V8_jaguar_zh.mp3"
  },
  {
    "id": "monkey",
    "word": "monkey",
    "col": "left",
    "type": "animal",
    "zh": "猴子",
    "img": "V8_flashcards_images/V8_monkey.webp",
    "audio": "V8_flashcards_audios/V8_monkey.mp3",
    "audioZh": "V8_flashcards_audios/V8_monkey_zh.mp3"
  },
  {
    "id": "owl",
    "word": "owl",
    "col": "left",
    "type": "animal",
    "zh": "貓頭鷹",
    "img": "V8_flashcards_images/V8_owl.webp",
    "audio": "V8_flashcards_audios/V8_owl.mp3",
    "audioZh": "V8_flashcards_audios/V8_owl_zh.mp3"
  },
  {
    "id": "rabbit",
    "word": "rabbit",
    "col": "left",
    "type": "animal",
    "zh": "兔子",
    "img": "V8_flashcards_images/V8_rabbit.webp",
    "audio": "V8_flashcards_audios/V8_rabbit.mp3",
    "audioZh": "V8_flashcards_audios/V8_rabbit_zh.mp3"
  },
  {
    "id": "turtle",
    "word": "turtle",
    "col": "left",
    "type": "animal",
    "zh": "烏龜",
    "img": "V8_flashcards_images/V8_turtle.webp",
    "audio": "V8_flashcards_audios/V8_turtle.mp3",
    "audioZh": "V8_flashcards_audios/V8_turtle_zh.mp3"
  },
  {
    "id": "wolf",
    "word": "wolf",
    "col": "left",
    "type": "animal",
    "zh": "狼",
    "img": "V8_flashcards_images/V8_wolf.webp",
    "audio": "V8_flashcards_audios/V8_wolf.mp3",
    "audioZh": "V8_flashcards_audios/V8_wolf_zh.mp3"
  },
  {
    "id": "zebra",
    "word": "zebra",
    "col": "left",
    "type": "animal",
    "zh": "斑馬",
    "img": "V8_flashcards_images/V8_zebra.webp",
    "audio": "V8_flashcards_audios/V8_zebra.mp3",
    "audioZh": "V8_flashcards_audios/V8_zebra_zh.mp3"
  },
  {
    "id": "can",
    "word": "can",
    "col": "left",
    "type": "ability",
    "zh": "能夠/會",
    "img": "V8_flashcards_images/V8_can.webp",
    "audio": "V8_flashcards_audios/V8_can.mp3",
    "audioZh": "V8_flashcards_audios/V8_can_zh.mp3"
  },
  {
    "id": "hop",
    "word": "hop",
    "col": "left",
    "type": "action",
    "zh": "單腳跳/跳躍",
    "img": "V8_flashcards_images/V8_hop.webp",
    "audio": "V8_flashcards_audios/V8_hop.mp3",
    "audioZh": "V8_flashcards_audios/V8_hop_zh.mp3"
  },
  {
    "id": "fly",
    "word": "fly",
    "col": "left",
    "type": "action",
    "zh": "飛行",
    "img": "V8_flashcards_images/V8_fly.webp",
    "audio": "V8_flashcards_audios/V8_fly.mp3",
    "audioZh": "V8_flashcards_audios/V8_fly_zh.mp3"
  },
  {
    "id": "climb",
    "word": "climb",
    "col": "left",
    "type": "action",
    "zh": "攀爬",
    "img": "V8_flashcards_images/V8_climb.webp",
    "audio": "V8_flashcards_audios/V8_climb.mp3",
    "audioZh": "V8_flashcards_audios/V8_climb_zh.mp3"
  },
  {
    "id": "no",
    "word": "no",
    "col": "left",
    "type": "answer",
    "zh": "不是/不行",
    "img": "V8_flashcards_images/V8_no.webp",
    "audio": "V8_flashcards_audios/V8_no.mp3",
    "audioZh": "V8_flashcards_audios/V8_no_zh.mp3"
  },
  {
    "id": "alligator",
    "word": "alligator",
    "col": "middle",
    "type": "animal",
    "zh": "短吻鱷",
    "img": "V8_flashcards_images/V8_alligator.webp",
    "audio": "V8_flashcards_audios/V8_alligator.mp3",
    "audioZh": "V8_flashcards_audios/V8_alligator_zh.mp3"
  },
  {
    "id": "dog",
    "word": "dog",
    "col": "middle",
    "type": "animal",
    "zh": "狗",
    "img": "V8_flashcards_images/V8_dog.webp",
    "audio": "V8_flashcards_audios/V8_dog.mp3",
    "audioZh": "V8_flashcards_audios/V8_dog_zh.mp3"
  },
  {
    "id": "ibis",
    "word": "ibis",
    "col": "middle",
    "type": "animal",
    "zh": "䴉/朱䴉",
    "img": "V8_flashcards_images/V8_ibis.webp",
    "audio": "V8_flashcards_audios/V8_ibis.mp3",
    "audioZh": "V8_flashcards_audios/V8_ibis_zh.mp3"
  },
  {
    "id": "kangaroo",
    "word": "kangaroo",
    "col": "middle",
    "type": "animal",
    "zh": "袋鼠",
    "img": "V8_flashcards_images/V8_kangaroo.webp",
    "audio": "V8_flashcards_audios/V8_kangaroo.mp3",
    "audioZh": "V8_flashcards_audios/V8_kangaroo_zh.mp3"
  },
  {
    "id": "newt",
    "word": "newt",
    "col": "middle",
    "type": "animal",
    "zh": "蠑螈",
    "img": "V8_flashcards_images/V8_newt.webp",
    "audio": "V8_flashcards_audios/V8_newt.mp3",
    "audioZh": "V8_flashcards_audios/V8_newt_zh.mp3"
  },
  {
    "id": "pig",
    "word": "pig",
    "col": "middle",
    "type": "animal",
    "zh": "豬",
    "img": "V8_flashcards_images/V8_pig.webp",
    "audio": "V8_flashcards_audios/V8_pig.mp3",
    "audioZh": "V8_flashcards_audios/V8_pig_zh.mp3"
  },
  {
    "id": "squirrel",
    "word": "squirrel",
    "col": "middle",
    "type": "animal",
    "zh": "松鼠",
    "img": "V8_flashcards_images/V8_squirrel.webp",
    "audio": "V8_flashcards_audios/V8_squirrel.mp3",
    "audioZh": "V8_flashcards_audios/V8_squirrel_zh.mp3"
  },
  {
    "id": "unicorn",
    "word": "unicorn",
    "col": "middle",
    "type": "animal",
    "zh": "獨角獸",
    "img": "V8_flashcards_images/V8_unicorn.webp",
    "audio": "V8_flashcards_audios/V8_unicorn.mp3",
    "audioZh": "V8_flashcards_audios/V8_unicorn_zh.mp3"
  },
  {
    "id": "fox",
    "word": "fox",
    "col": "middle",
    "type": "animal",
    "zh": "狐狸",
    "img": "V8_flashcards_images/V8_fox.webp",
    "audio": "V8_flashcards_audios/V8_fox.mp3",
    "audioZh": "V8_flashcards_audios/V8_fox_zh.mp3"
  },
  {
    "id": "animal",
    "word": "animal",
    "col": "middle",
    "type": "animal",
    "zh": "動物",
    "img": "V8_flashcards_images/V8_animal.webp",
    "audio": "V8_flashcards_audios/V8_animal.mp3",
    "audioZh": "V8_flashcards_audios/V8_animal_zh.mp3"
  },
  {
    "id": "can't",
    "word": "can't",
    "col": "middle",
    "type": "ability",
    "zh": "不能/不會",
    "img": "V8_flashcards_images/V8_can't.webp",
    "audio": "V8_flashcards_audios/V8_can't.mp3",
    "audioZh": "V8_flashcards_audios/V8_can't_zh.mp3"
  },
  {
    "id": "swim",
    "word": "swim",
    "col": "middle",
    "type": "action",
    "zh": "游泳",
    "img": "V8_flashcards_images/V8_swim.webp",
    "audio": "V8_flashcards_audios/V8_swim.mp3",
    "audioZh": "V8_flashcards_audios/V8_swim_zh.mp3"
  },
  {
    "id": "run",
    "word": "run",
    "col": "middle",
    "type": "action",
    "zh": "奔跑",
    "img": "V8_flashcards_images/V8_run.webp",
    "audio": "V8_flashcards_audios/V8_run.mp3",
    "audioZh": "V8_flashcards_audios/V8_run_zh.mp3"
  },
  {
    "id": "yes",
    "word": "yes",
    "col": "middle",
    "type": "answer",
    "zh": "是/可以",
    "img": "V8_flashcards_images/V8_yes.webp",
    "audio": "V8_flashcards_audios/V8_yes.mp3",
    "audioZh": "V8_flashcards_audios/V8_yes_zh.mp3"
  },
  {
    "id": "bear",
    "word": "bear",
    "col": "right",
    "type": "animal",
    "zh": "熊",
    "img": "V8_flashcards_images/V8_bear.webp",
    "audio": "V8_flashcards_audios/V8_bear.mp3",
    "audioZh": "V8_flashcards_audios/V8_bear_zh.mp3"
  },
  {
    "id": "eagle",
    "word": "eagle",
    "col": "right",
    "type": "animal",
    "zh": "老鷹",
    "img": "V8_flashcards_images/V8_eagle.webp",
    "audio": "V8_flashcards_audios/V8_eagle.mp3",
    "audioZh": "V8_flashcards_audios/V8_eagle_zh.mp3"
  },
  {
    "id": "iguana",
    "word": "iguana",
    "col": "right",
    "type": "animal",
    "zh": "鬣蜥",
    "img": "V8_flashcards_images/V8_iguana.webp",
    "audio": "V8_flashcards_audios/V8_iguana.mp3",
    "audioZh": "V8_flashcards_audios/V8_iguana_zh.mp3"
  },
  {
    "id": "lion",
    "word": "lion",
    "col": "right",
    "type": "animal",
    "zh": "獅子",
    "img": "V8_flashcards_images/V8_lion.webp",
    "audio": "V8_flashcards_audios/V8_lion.mp3",
    "audioZh": "V8_flashcards_audios/V8_lion_zh.mp3"
  },
  {
    "id": "ostrich",
    "word": "ostrich",
    "col": "right",
    "type": "animal",
    "zh": "鴕鳥",
    "img": "V8_flashcards_images/V8_ostrich.webp",
    "audio": "V8_flashcards_audios/V8_ostrich.mp3",
    "audioZh": "V8_flashcards_audios/V8_ostrich_zh.mp3"
  },
  {
    "id": "quail",
    "word": "quail",
    "col": "right",
    "type": "animal",
    "zh": "鵪鶉",
    "img": "V8_flashcards_images/V8_quail.webp",
    "audio": "V8_flashcards_audios/V8_quail.mp3",
    "audioZh": "V8_flashcards_audios/V8_quail_zh.mp3"
  },
  {
    "id": "tiger",
    "word": "tiger",
    "col": "right",
    "type": "animal",
    "zh": "老虎",
    "img": "V8_flashcards_images/V8_tiger.webp",
    "audio": "V8_flashcards_audios/V8_tiger.mp3",
    "audioZh": "V8_flashcards_audios/V8_tiger_zh.mp3"
  },
  {
    "id": "vulture",
    "word": "vulture",
    "col": "right",
    "type": "animal",
    "zh": "禿鷹",
    "img": "V8_flashcards_images/V8_vulture.webp",
    "audio": "V8_flashcards_audios/V8_vulture.mp3",
    "audioZh": "V8_flashcards_audios/V8_vulture_zh.mp3"
  },
  {
    "id": "yak",
    "word": "yak",
    "col": "right",
    "type": "animal",
    "zh": "氂牛",
    "img": "V8_flashcards_images/V8_yak.webp",
    "audio": "V8_flashcards_audios/V8_yak.mp3",
    "audioZh": "V8_flashcards_audios/V8_yak_zh.mp3"
  },
  {
    "id": "favorite",
    "word": "favorite",
    "col": "right",
    "type": "noun",
    "zh": "最喜愛的",
    "img": "V8_flashcards_images/V8_favorite.webp",
    "audio": "V8_flashcards_audios/V8_favorite.mp3",
    "audioZh": "V8_flashcards_audios/V8_favorite_zh.mp3"
  },
  {
    "id": "jump",
    "word": "jump",
    "col": "right",
    "type": "action",
    "zh": "跳躍",
    "img": "V8_flashcards_images/V8_jump.webp",
    "audio": "V8_flashcards_audios/V8_jump.mp3",
    "audioZh": "V8_flashcards_audios/V8_jump_zh.mp3"
  }
];

// 6 個泡泡環繞位置（上方、下方、左上、左下、右上、右下）
const BUBBLE_SLOT_CLASSES = [
  'slot-top',
  'slot-bottom',
  'slot-top-left',
  'slot-bottom-left',
  'slot-top-right',
  'slot-bottom-right'
];

class ESLBubbleGame {
  constructor() {
    this.bookId = 'V8';
    this.storageKeyScores = 'v8_bubble_pop_scores_';
    this.storageKeySelectedWords = 'v8_bubble_pop_selected_words';

    // 遊戲狀態機
    this.state = {
      mode: 'menu',           // menu, playing, paused, gameover
      gameMode: 'timed',      // endless, timed
      customTimeLimit: 60,    // 秒
      remainingTime: 60,      // 秒
      elapsedTime: 0,         // 秒
      lives: 5,               // 初始 5 顆心
      maxLives: 5,
      score: 0,
      combo: 0,
      maxCombo: 0,
      correctCount: 0,
      wrongCount: 0,
      replaceOnWrong: true,   // 答錯時是否補換新泡泡
      targetItem: null,       // 當前出題的單字物件
      currentBubbleWords: [], // 當前場上的 6 個單字 ID
      questionHistory: [],    // 出題防連跳
      isTransitioning: false,
      selectedWordIds: []     // 玩家自訂勾選之單字清單 (最少 6 個)
    };

    // 當前在遊戲中生效的單字清單 (長度 >= 6)
    this.activeVocabulary = [];
    this.tempSelectedWordIds = new Set(); // 彈跳視窗編輯緩存

    // 粒子系統 Canvas
    this.fxCanvas = document.getElementById('fx-canvas');
    this.fxCtx = this.fxCanvas.getContext('2d');
    this.particles = [];
    this.handTrails = [];

    // 定時器
    this.gameTimer = null;
    this.lastTimestamp = performance.now();

    // DOM 快取
    this.dom = {
      stage: document.getElementById('game-stage'),
      bubblesContainer: document.getElementById('bubbles-container'),
      centerCard: document.getElementById('center-card'),
      cardImage: document.getElementById('card-image'),
      cardWordZh: document.getElementById('card-word-zh'),
      cardRepeatBtn: document.getElementById('card-repeat-btn'),
      cardRepeatZhBtn: document.getElementById('card-repeat-zh-btn'),
      heartsContainer: document.getElementById('hearts-container'),
      timerDisplay: document.getElementById('timer-display'),
      scoreDisplay: document.getElementById('score-display'),
      comboDisplay: document.getElementById('combo-display'),
      statusNotice: document.getElementById('status-notice'),
      
      // 彈跳視窗
      startModal: document.getElementById('start-modal'),
      leaderboardModal: document.getElementById('leaderboard-modal'),
      gameoverModal: document.getElementById('gameover-modal'),
      pauseModal: document.getElementById('pause-modal'),
      wordSelectModal: document.getElementById('word-select-modal'),

      // 按鈕與輸入
      startBtn: document.getElementById('start-btn'),
      showLeaderboardBtn: document.getElementById('show-leaderboard-btn'),
      closeLeaderboardBtn: document.getElementById('close-leaderboard-btn'),
      pauseBtn: document.getElementById('pause-btn'),
      topHomeBtn: document.getElementById('top-home-btn'),
      resumeBtn: document.getElementById('resume-btn'),
      restartBtn: document.getElementById('restart-btn'),
      homeBtn: document.getElementById('home-btn'),
      submitScoreBtn: document.getElementById('submit-score-btn'),
      playerNameInput: document.getElementById('player-name-input'),

      // 單字勾選元素
      openWordSelectBtn: document.getElementById('open-word-select-btn'),
      closeWordSelectBtn: document.getElementById('close-word-select-btn'),
      saveWordSelectBtn: document.getElementById('save-word-select-btn'),
      selectAllWordsBtn: document.getElementById('select-all-words-btn'),
      deselectAllWordsBtn: document.getElementById('deselect-all-words-btn'),
      selectRandom6Btn: document.getElementById('select-random-6-btn'),
      selectRandom12Btn: document.getElementById('select-random-12-btn'),
      wordCheckboxGrid: document.getElementById('word-checkbox-grid'),
      modalSelectedCount: document.getElementById('modal-selected-count'),
      modalTotalCount: document.getElementById('modal-total-count'),
      wordMinWarn: document.getElementById('word-min-warn'),
      startModalWordBadge: document.getElementById('start-modal-word-badge'),

      // 設定項目
      gameModeSelect: document.getElementById('game-mode-select'),
      wrongBubbleBehavior: document.getElementById('wrong-bubble-behavior'),
      timeSelectGroup: document.getElementById('time-select-group'),
      customTimeInput: document.getElementById('custom-time-input'),
      cameraToggle: document.getElementById('camera-toggle'),
      mirrorToggle: document.getElementById('mirror-toggle'),
      audioToggle: document.getElementById('audio-toggle'),
      bgmToggle: document.getElementById('bgm-toggle')
    };

    // 建立 HandTracker 實例
    const TrackerClass = (typeof HandTracker !== 'undefined' ? HandTracker : (window.HandTracker || null));
    if (TrackerClass) {
      this.handTracker = new TrackerClass({
        videoElement: document.getElementById('webcam-video'),
        stageElement: this.dom.stage,
        onHandMove: (hands) => this.onHandMove(hands),
        onBubbleHit: (wordId, x, y) => this.onBubbleHit(wordId, x, y),
        onStatusChange: (text) => this.showNotice(text)
      });
      if (typeof this.handTracker.bindMouseAndTouch === "function") {
        this.handTracker.bindMouseAndTouch(this.dom.stage);
      }
    } else {
      this.handTracker = {
        cameraReady: false,
        isMirrored: true,
        bindMouseAndTouch: (stage) => {
          stage.addEventListener('pointerdown', (e) => {
            const target = e.target.closest('.word-bubble');
            if (target && !target.classList.contains('popping')) {
              this.onBubbleHit(target.dataset.wordId, e.clientX, e.clientY);
            }
          });
        },
        initCamera: async () => false,
        stop: () => {}
      };
    }

    // 初始化聲音系統
    window.soundSystem = new SoundSystem();

    // 視窗自適應
    window.addEventListener('resize', () => this.resizeCanvas());
    this.resizeCanvas();

    // 初始化單字勾選狀態
    this.initWordSelection();

    // 綁定所有事件
    this.bindEvents();

    // 啟動粒子循環
    requestAnimationFrame((ts) => this.renderFxLoop(ts));

    // 暴露供測試介面
    window.eslGame = this;
    window.render_game_to_text = () => JSON.stringify({
      mode: this.state.mode,
      gameMode: this.state.gameMode,
      score: this.state.score,
      lives: this.state.lives,
      target: this.state.targetItem ? this.state.targetItem.id : null,
      bubbles: this.state.currentBubbleWords,
      correctCount: this.state.correctCount,
      wrongCount: this.state.wrongCount,
      selectedWordsCount: this.activeVocabulary.length,
      activeWordIds: this.activeVocabulary.map(v => v.id)
    });
    window.simulateBubbleHit = (wordId) => {
      this.onBubbleHit(wordId, window.innerWidth / 2, window.innerHeight / 2);
    };
  }

  // ==================== 單字自訂勾選管理 ====================

  // 初始化單字選取配置
  initWordSelection() {
    let savedIds = null;
    try {
      const raw = localStorage.getItem(this.storageKeySelectedWords);
      if (raw) savedIds = JSON.parse(raw);
    } catch (e) {
      console.warn('讀取單字勾選紀錄失敗:', e);
    }

    // 若有合法的存檔且選取數量 >= 6，則套用存檔
    if (Array.isArray(savedIds) && savedIds.length >= 6) {
      const validIds = savedIds.filter(id => VOCABULARY.some(v => v.id === id));
      if (validIds.length >= 6) {
        this.state.selectedWordIds = validIds;
      } else {
        this.state.selectedWordIds = VOCABULARY.map(v => v.id);
      }
    } else {
      // 預設全選
      this.state.selectedWordIds = VOCABULARY.map(v => v.id);
    }

    this.applyActiveVocabulary();
  }

  // 套用生效單字並更新主介面徽章
  applyActiveVocabulary() {
    this.activeVocabulary = VOCABULARY.filter(v => this.state.selectedWordIds.includes(v.id));
    if (this.activeVocabulary.length < 6) {
      this.activeVocabulary = [...VOCABULARY];
      this.state.selectedWordIds = VOCABULARY.map(v => v.id);
    }

    if (this.dom.startModalWordBadge) {
      if (this.activeVocabulary.length === VOCABULARY.length) {
        this.dom.startModalWordBadge.textContent = `已勾選全部 ${this.activeVocabulary.length} 個單字`;
      } else {
        this.dom.startModalWordBadge.textContent = `已自訂 ${this.activeVocabulary.length} / ${VOCABULARY.length} 個單字`;
      }
    }
  }

  // 開啟單字勾選視窗
  openWordSelectModal() {
    this.tempSelectedWordIds = new Set(this.state.selectedWordIds);
    this.renderWordCheckboxGrid();
    this.updateWordSelectModalCounts();

    if (this.dom.wordSelectModal) {
      this.dom.wordSelectModal.hidden = false;
    }
  }

  // 渲染單字勾選網格
  renderWordCheckboxGrid() {
    if (!this.dom.wordCheckboxGrid) return;
    this.dom.wordCheckboxGrid.innerHTML = '';

    VOCABULARY.forEach(item => {
      const isChecked = this.tempSelectedWordIds.has(item.id);
      const card = document.createElement('div');
      card.className = `word-check-card ${isChecked ? 'checked' : ''}`;
      card.dataset.wordId = item.id;

      card.innerHTML = `
        <input type="checkbox" class="word-card-chk" ${isChecked ? 'checked' : ''} tabindex="-1">
        <img src="${item.img}" alt="${item.word}" class="word-card-thumb" onerror="this.style.display='none'">
        <div class="word-card-info">
          <span class="word-card-en">${item.word}</span>
          <span class="word-card-zh">${item.zh}</span>
        </div>
        <button type="button" class="word-card-audio-btn" title="試聽發音">🔊</button>
      `;

      // 點擊卡片切換勾選
      card.addEventListener('click', (e) => {
        if (e.target.closest('.word-card-audio-btn')) {
          e.stopPropagation();
          window.soundSystem.playWordAudio(item.id);
          return;
        }

        const chk = card.querySelector('.word-card-chk');
        if (e.target !== chk) {
          chk.checked = !chk.checked;
        }

        if (chk.checked) {
          this.tempSelectedWordIds.add(item.id);
          card.classList.add('checked');
        } else {
          this.tempSelectedWordIds.delete(item.id);
          card.classList.remove('checked');
        }

        this.updateWordSelectModalCounts();
      });

      this.dom.wordCheckboxGrid.appendChild(card);
    });
  }

  // 更新單字勾選視窗計數與警示狀態
  updateWordSelectModalCounts() {
    const count = this.tempSelectedWordIds.size;
    const total = VOCABULARY.length;

    if (this.dom.modalSelectedCount) this.dom.modalSelectedCount.textContent = count;
    if (this.dom.modalTotalCount) this.dom.modalTotalCount.textContent = total;

    if (count < 6) {
      if (this.dom.wordMinWarn) this.dom.wordMinWarn.style.display = 'inline-block';
      if (this.dom.saveWordSelectBtn) {
        this.dom.saveWordSelectBtn.style.opacity = '0.5';
        this.dom.saveWordSelectBtn.style.cursor = 'not-allowed';
      }
    } else {
      if (this.dom.wordMinWarn) this.dom.wordMinWarn.style.display = 'none';
      if (this.dom.saveWordSelectBtn) {
        this.dom.saveWordSelectBtn.style.opacity = '1';
        this.dom.saveWordSelectBtn.style.cursor = 'pointer';
      }
    }
  }

  // 儲存並套用單字選取
  saveWordSelection() {
    if (this.tempSelectedWordIds.size < 6) {
      alert('⚠️ 最少需勾選 6 個單字才能開始遊戲！');
      return false;
    }

    this.state.selectedWordIds = Array.from(this.tempSelectedWordIds);
    try {
      localStorage.setItem(this.storageKeySelectedWords, JSON.stringify(this.state.selectedWordIds));
    } catch (e) {
      console.warn('無法儲存勾選單字至 localStorage:', e);
    }

    this.applyActiveVocabulary();
    if (this.dom.wordSelectModal) {
      this.dom.wordSelectModal.hidden = true;
    }
    this.showNotice(`✅ 已更新練習範圍：共 ${this.activeVocabulary.length} 個單字`);
    return true;
  }

  // 綁定事件監聽
  bindEvents() {
    // 1. 開始遊戲按鈕
    this.dom.startBtn.addEventListener('click', () => {
      window.soundSystem.initAudioContext();
      if (this.dom.bgmToggle.checked) {
        window.soundSystem.startBgm();
      }
      this.startGame();
    });

    // 2. 自訂勾選單字相關事件
    if (this.dom.openWordSelectBtn) {
      this.dom.openWordSelectBtn.addEventListener('click', () => this.openWordSelectModal());
    }
    if (this.dom.closeWordSelectBtn) {
      this.dom.closeWordSelectBtn.addEventListener('click', () => {
        if (this.dom.wordSelectModal) this.dom.wordSelectModal.hidden = true;
      });
    }
    if (this.dom.saveWordSelectBtn) {
      this.dom.saveWordSelectBtn.addEventListener('click', () => this.saveWordSelection());
    }
    if (this.dom.selectAllWordsBtn) {
      this.dom.selectAllWordsBtn.addEventListener('click', () => {
        VOCABULARY.forEach(v => this.tempSelectedWordIds.add(v.id));
        this.dom.wordCheckboxGrid.querySelectorAll('.word-check-card').forEach(c => {
          c.classList.add('checked');
          c.querySelector('.word-card-chk').checked = true;
        });
        this.updateWordSelectModalCounts();
      });
    }
    if (this.dom.deselectAllWordsBtn) {
      this.dom.deselectAllWordsBtn.addEventListener('click', () => {
        this.tempSelectedWordIds.clear();
        this.dom.wordCheckboxGrid.querySelectorAll('.word-check-card').forEach(c => {
          c.classList.remove('checked');
          c.querySelector('.word-card-chk').checked = false;
        });
        this.updateWordSelectModalCounts();
      });
    }
    if (this.dom.selectRandom6Btn) {
      this.dom.selectRandom6Btn.addEventListener('click', () => {
        this.tempSelectedWordIds.clear();
        const shuffled = [...VOCABULARY].sort(() => 0.5 - Math.random());
        shuffled.slice(0, 6).forEach(v => this.tempSelectedWordIds.add(v.id));
        this.dom.wordCheckboxGrid.querySelectorAll('.word-check-card').forEach(c => {
          const id = c.dataset.wordId;
          const isCh = this.tempSelectedWordIds.has(id);
          c.classList.toggle('checked', isCh);
          c.querySelector('.word-card-chk').checked = isCh;
        });
        this.updateWordSelectModalCounts();
      });
    }
    if (this.dom.selectRandom12Btn) {
      this.dom.selectRandom12Btn.addEventListener('click', () => {
        this.tempSelectedWordIds.clear();
        const shuffled = [...VOCABULARY].sort(() => 0.5 - Math.random());
        const count = Math.min(12, shuffled.length);
        shuffled.slice(0, count).forEach(v => this.tempSelectedWordIds.add(v.id));
        this.dom.wordCheckboxGrid.querySelectorAll('.word-check-card').forEach(c => {
          const id = c.dataset.wordId;
          const isCh = this.tempSelectedWordIds.has(id);
          c.classList.toggle('checked', isCh);
          c.querySelector('.word-card-chk').checked = isCh;
        });
        this.updateWordSelectModalCounts();
      });
    }

    // 3. 設定項目開關切換
    this.dom.audioToggle.addEventListener('change', () => {
      window.soundSystem.toggleMute();
    });

    this.dom.bgmToggle.addEventListener('change', (e) => {
      if (e.target.checked) window.soundSystem.startBgm();
      else window.soundSystem.stopBgm();
    });

    // 4. 中央題目卡發音重聽按鈕
    this.dom.cardRepeatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.state.targetItem) {
        window.soundSystem.playWordAudio(this.state.targetItem.id);
        this.animateCardPulse();
      }
    });

    this.dom.cardRepeatZhBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.state.targetItem) {
        if (typeof window.soundSystem.playZhAudio === 'function') {
          window.soundSystem.playZhAudio(this.state.targetItem.id);
        }
        this.animateCardPulse();
      }
    });

    // 5. 排行榜視窗控制
    this.dom.showLeaderboardBtn.addEventListener('click', () => this.showLeaderboard('timed'));
    this.dom.closeLeaderboardBtn.addEventListener('click', () => {
      this.dom.leaderboardModal.hidden = true;
    });

    // 排行榜分頁切換
    const lbTabs = this.dom.leaderboardModal.querySelectorAll('.lb-tab');
    lbTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        lbTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.renderLeaderboardList(e.target.dataset.tab);
      });
    });

    // 6. 時間膠囊選擇
    const timeChips = this.dom.timeSelectGroup.querySelectorAll('.time-chip');
    timeChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        timeChips.forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        const seconds = parseInt(e.target.dataset.time, 10);
        this.dom.customTimeInput.value = seconds;
        this.state.customTimeLimit = seconds;
      });
    });

    this.dom.customTimeInput.addEventListener('input', (e) => {
      const val = Math.max(10, Math.min(600, parseInt(e.target.value, 10) || 60));
      this.state.customTimeLimit = val;
      timeChips.forEach(c => {
        if (parseInt(c.dataset.time, 10) === val) c.classList.add('active');
        else c.classList.remove('active');
      });
    });

    // 7. 暫停與繼續遊戲
    this.dom.pauseBtn.addEventListener('click', () => this.pauseGame());
    this.dom.resumeBtn.addEventListener('click', () => this.resumeGame());
    this.dom.homeBtn.addEventListener('click', () => this.returnToHome());
    this.dom.topHomeBtn.addEventListener('click', () => this.returnToHome());

    // 8. 重新開始遊戲按鈕
    this.dom.restartBtn.addEventListener('click', () => {
      this.dom.gameoverModal.hidden = true;
      this.startGame();
    });

    // 9. 登錄排行榜分數
    this.dom.submitScoreBtn.addEventListener('click', () => this.submitScore());

    // 10. 點擊/觸控泡泡作答備援
    this.dom.stage.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('.word-bubble');
      if (target && !target.classList.contains('popping')) {
        this.onBubbleHit(target.dataset.wordId, e.clientX, e.clientY);
      }
    });
  }

  // 開始新遊戲
  async startGame() {
    if (this.activeVocabulary.length < 6) {
      alert('⚠️ 最少需勾選 6 個單字才能開始遊戲！請點選「勾選練習單字」進行設定。');
      this.openWordSelectModal();
      return;
    }

    this.state.mode = 'playing';
    this.state.gameMode = this.dom.gameModeSelect.value;
    this.state.replaceOnWrong = (this.dom.wrongBubbleBehavior.value === 'replace');
    this.state.score = 0;
    this.state.combo = 0;
    this.state.maxCombo = 0;
    this.state.correctCount = 0;
    this.state.wrongCount = 0;
    this.state.lives = 5;
    this.state.maxLives = 5;
    this.state.questionHistory = [];
    this.state.isTransitioning = false;

    if (this.state.gameMode === 'timed') {
      const timeVal = parseInt(this.dom.customTimeInput.value, 10) || 60;
      this.state.customTimeLimit = timeVal;
      this.state.remainingTime = timeVal;
      this.dom.timerDisplay.textContent = `⏱️ ${this.formatTime(this.state.remainingTime)}`;
    } else {
      this.state.elapsedTime = 0;
      this.dom.timerDisplay.textContent = `❤️ 生存賽`;
    }

    this.updateHUD();
    this.renderHearts();

    // 隱藏所有視窗
    this.dom.startModal.hidden = true;
    this.dom.gameoverModal.hidden = true;
    this.dom.pauseModal.hidden = true;
    this.dom.leaderboardModal.hidden = true;
    if (this.dom.wordSelectModal) this.dom.wordSelectModal.hidden = true;

    // 初始化攝影機
    if (this.dom.cameraToggle.checked) {
      await this.handTracker.initCamera();
      this.handTracker.isMirrored = this.dom.mirrorToggle.checked;
    }

    // 啟動第一道題目
    this.nextRound();

    // 啟動主定時器
    this.lastTimestamp = performance.now();
    if (this.gameTimer) clearInterval(this.gameTimer);
    this.gameTimer = setInterval(() => this.onGameTick(), 1000);

    this.showNotice('揮動雙手戳破正確的單字泡泡！');
  }

  // 遊戲計時遞減/遞增輪詢
  onGameTick() {
    if (this.state.mode !== 'playing') return;

    if (this.state.gameMode === 'timed') {
      this.state.remainingTime--;
      this.dom.timerDisplay.textContent = `⏱️ ${this.formatTime(this.state.remainingTime)}`;

      if (this.state.remainingTime <= 10 && this.state.remainingTime > 0) {
        this.dom.timerDisplay.classList.add('urgent');
      }

      if (this.state.remainingTime <= 0) {
        this.endGame('時限已到！恭喜完成限時挑戰！');
      }
    } else {
      this.state.elapsedTime++;
      this.dom.timerDisplay.textContent = `⏱️ ${this.formatTime(this.state.elapsedTime)}`;
    }
  }

  // 格式化秒數為 mm:ss
  formatTime(totalSec) {
    const m = Math.floor(Math.max(0, totalSec) / 60);
    const s = Math.max(0, totalSec) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // 進入下一回合題目
  nextRound() {
    if (this.state.mode !== 'playing') return;

    const target = this.pickTargetItem();
    this.state.targetItem = target;

    // 更新中央題目卡
    this.dom.cardImage.src = target.img;
    this.dom.cardImage.alt = target.word;
    this.dom.cardWordZh.textContent = target.zh;

    this.animateCardPop();
    window.soundSystem.playWordAudio(target.id);

    // 環繞生成 6 顆泡泡
    const roundWords = this.generateRoundBubbleWords(target);
    this.state.currentBubbleWords = roundWords;
    this.renderBubbles(roundWords);
  }

  // 從生效單字庫挑選出題單字
  pickTargetItem() {
    const candidates = this.activeVocabulary.filter(item => !this.state.questionHistory.includes(item.id));
    let picked;

    if (candidates.length > 0) {
      picked = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      picked = this.activeVocabulary[Math.floor(Math.random() * this.activeVocabulary.length)];
      this.state.questionHistory = [];
    }

    this.state.questionHistory.push(picked.id);
    if (this.state.questionHistory.length > Math.min(6, this.activeVocabulary.length - 1)) {
      this.state.questionHistory.shift();
    }
    return picked;
  }

  // 生成環繞的 6 顆泡泡單字清單 (1 正確 + 5 干擾)
  generateRoundBubbleWords(target) {
    const otherCandidates = this.activeVocabulary.filter(item => item.id !== target.id);
    const shuffledOthers = [...otherCandidates].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 5).map(item => item.id);

    // 補足至 5 顆 (若所選單字剛好 6 個)
    while (distractors.length < 5) {
      distractors.push(this.activeVocabulary[Math.floor(Math.random() * this.activeVocabulary.length)].id);
    }

    const sixWords = [target.id, ...distractors];
    return sixWords.sort(() => 0.5 - Math.random());
  }

  // 動態排布渲染 6 顆單字泡泡
  renderBubbles(wordIds) {
    this.dom.bubblesContainer.innerHTML = '';

    wordIds.forEach((wordId, index) => {
      const slotClass = BUBBLE_SLOT_CLASSES[index] || 'slot-top';
      const itemData = VOCABULARY.find(v => v.id === wordId) || { word: wordId };

      const bubble = document.createElement('div');
      bubble.className = `word-bubble ${slotClass}`;
      bubble.dataset.wordId = wordId;
      bubble.dataset.slotIndex = index;

      const isLongWord = itemData.word.length > 8 && !itemData.word.includes(' ');
      const wordClass = isLongWord ? 'bubble-word compact-word' : 'bubble-word';

      bubble.innerHTML = `
        <span class="bubble-reflection"></span>
        <span class="${wordClass}">${itemData.word}</span>
      `;

      this.dom.bubblesContainer.appendChild(bubble);
    });
  }

  // 泡泡被戳破判定 (手勢或觸控)
  onBubbleHit(wordId, hitX, hitY) {
    if (this.state.mode !== 'playing' || this.state.isTransitioning) return;

    const targetEl = this.dom.bubblesContainer.querySelector(`.word-bubble[data-word-id="${wordId}"]`);
    if (!targetEl || targetEl.classList.contains('popping')) return;

    // 立即加上爆破狀態與動畫
    targetEl.classList.add('popping');
    targetEl.style.pointerEvents = 'none';

    // 播放爆破音效與單字發音
    window.soundSystem.playBubblePop();
    window.soundSystem.playWordAudio(wordId);

    const rect = targetEl.getBoundingClientRect();
    const centerX = (hitX !== undefined && hitX > 0) ? hitX : (rect.left + rect.width / 2);
    const centerY = (hitY !== undefined && hitY > 0) ? hitY : (rect.top + rect.height / 2);

    const isCorrect = (wordId === this.state.targetItem.id);

    if (isCorrect) {
      // 答對邏輯
      this.state.isTransitioning = true;
      this.state.combo++;
      if (this.state.combo > this.state.maxCombo) {
        this.state.maxCombo = this.state.combo;
      }
      this.state.correctCount++;

      const earnedScore = 100 + Math.min(150, (this.state.combo - 1) * 25);
      this.state.score += earnedScore;

      // 爽快爆破金色粒子與浮動加分
      this.spawnPopParticles(centerX, centerY, true);
      this.showFloatingText(centerX, centerY, `+${earnedScore}`, '#10b981');
      setTimeout(() => window.soundSystem.playCorrect(), 80);

      this.updateHUD();
      this.showNotice(`太棒了！答對了：${this.state.targetItem.word} 🎉`);

      // 泡泡爆破動畫結束後立即移除元素，畫面乾淨爽快！
      setTimeout(() => {
        if (targetEl && targetEl.parentNode) targetEl.remove();
      }, 200);

      setTimeout(() => {
        this.state.isTransitioning = false;
        this.nextRound();
      }, 650);

    } else {
      // 答錯邏輯
      this.state.combo = 0;
      this.state.wrongCount++;
      this.state.lives--;

      // 錯誤紅色爆破粒子
      this.spawnPopParticles(centerX, centerY, false);
      this.showFloatingText(centerX, centerY, '錯囉!', '#ef4444');
      setTimeout(() => window.soundSystem.playWrong(), 60);

      this.updateHUD();
      this.renderHearts();
      this.shakeStage();

      const wrongItem = VOCABULARY.find(v => v.id === wordId);
      this.showNotice(`哎呀！那是 ${wrongItem ? wrongItem.word : wordId}，再找找看！`);

      const slotIdx = parseInt(targetEl.dataset.slotIndex, 10);

      // 錯誤泡泡也是立即破裂爆開並移除！
      setTimeout(() => {
        if (targetEl && targetEl.parentNode) targetEl.remove();
      }, 200);

      if (this.state.lives <= 0) {
        this.endGame('愛心已扣完！挑戰結束。');
        return;
      }

      // 若設定為補換泡泡，400ms 後新泡泡平滑補進
      if (this.state.replaceOnWrong && !isNaN(slotIdx)) {
        setTimeout(() => this.replaceBubble(slotIdx), 380);
      }
    }
  }

  // 答錯後隨機補一顆新備選泡泡
  replaceBubble(slotIndex) {
    if (this.state.mode !== 'playing') return;

    let availablePool = this.activeVocabulary.filter(item => 
      !this.state.currentBubbleWords.includes(item.id) &&
      item.id !== this.state.targetItem.id
    );

    if (availablePool.length === 0) {
      availablePool = this.activeVocabulary.filter(item => item.id !== this.state.targetItem.id);
    }

    if (availablePool.length === 0) return;

    const newWord = availablePool[Math.floor(Math.random() * availablePool.length)];
    this.state.currentBubbleWords[slotIndex] = newWord.id;

    const slotClass = BUBBLE_SLOT_CLASSES[slotIndex];
    const oldBubble = this.dom.bubblesContainer.querySelector(`.word-bubble.${slotClass}`);
    if (oldBubble) oldBubble.remove();

    const bubble = document.createElement('div');
    bubble.className = `word-bubble ${slotClass}`;
    bubble.dataset.wordId = newWord.id;
    bubble.dataset.slotIndex = slotIndex;
    const isLongWord = newWord.word.length > 8 && !newWord.word.includes(' ');
    const wordClass = isLongWord ? 'bubble-word compact-word' : 'bubble-word';

    bubble.innerHTML = `
      <span class="bubble-reflection"></span>
      <span class="${wordClass}">${newWord.word}</span>
    `;

    this.dom.bubblesContainer.appendChild(bubble);
  }

  // 暫停遊戲
  pauseGame() {
    if (this.state.mode !== 'playing') return;
    this.state.mode = 'paused';
    this.dom.pauseModal.hidden = false;
  }

  // 繼續遊戲
  resumeGame() {
    if (this.state.mode !== 'paused') return;
    this.state.mode = 'playing';
    this.dom.pauseModal.hidden = true;
  }

  // 回到首頁主選單
  returnToHome() {
    this.state.mode = 'menu';
    if (this.gameTimer) clearInterval(this.gameTimer);
    if (this.handTracker) this.handTracker.stop();

    this.dom.pauseModal.hidden = true;
    this.dom.gameoverModal.hidden = true;
    this.dom.startModal.hidden = false;
    this.dom.bubblesContainer.innerHTML = '';
  }

  // 結束遊戲與結算
  endGame(reason) {
    this.state.mode = 'gameover';
    if (this.gameTimer) clearInterval(this.gameTimer);
    if (this.handTracker) this.handTracker.stop();

    window.soundSystem.playGameOver();

    document.getElementById('gameover-reason').textContent = reason;
    document.getElementById('final-score-val').textContent = this.state.score;
    document.getElementById('final-correct-val').textContent = this.state.correctCount;
    document.getElementById('final-wrong-val').textContent = this.state.wrongCount;
    document.getElementById('final-combo-val').textContent = `x${this.state.maxCombo}`;

    this.dom.gameoverModal.hidden = false;
  }

  // 登錄排行榜分數
  submitScore() {
    const nameInput = this.dom.playerNameInput;
    const name = (nameInput.value.trim() || '無名英雄').substring(0, 10);
    const modeKey = (this.state.gameMode === 'timed' ? 'timed' : 'endless');

    const newRecord = {
      name: name,
      score: this.state.score,
      correct: this.state.correctCount,
      combo: this.state.maxCombo,
      date: new Date().toLocaleDateString('zh-TW')
    };

    const storageKey = `${this.storageKeyScores}${modeKey}`;
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (e) {
      list = [];
    }

    list.push(newRecord);
    list.sort((a, b) => b.score - a.score);
    list = list.slice(0, 15);

    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (e) {
      console.warn('無法儲存分數至 localStorage');
    }

    this.dom.gameoverModal.hidden = true;
    this.showLeaderboard(modeKey);
  }

  // 顯示排行榜視窗
  showLeaderboard(tabKey = 'timed') {
    this.dom.leaderboardModal.hidden = false;
    const lbTabs = this.dom.leaderboardModal.querySelectorAll('.lb-tab');
    lbTabs.forEach(t => {
      if (t.dataset.tab === tabKey) t.classList.add('active');
      else t.classList.remove('active');
    });
    this.renderLeaderboardList(tabKey);
  }

  // 渲染排行榜名單
  renderLeaderboardList(tabKey) {
    const listEl = document.getElementById('leaderboard-list');
    const storageKey = `${this.storageKeyScores}${tabKey}`;
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (e) {
      list = [];
    }

    if (list.length === 0) {
      listEl.innerHTML = '<li class="lb-empty">尚無挑戰紀錄，快成為第一位榮譽榜首！</li>';
      return;
    }

    listEl.innerHTML = list.map((item, idx) => {
      let rankBadge = `#${idx + 1}`;
      if (idx === 0) rankBadge = '🥇 冠軍';
      else if (idx === 1) rankBadge = '🥈 亞軍';
      else if (idx === 2) rankBadge = '🥉 季軍';

      return `
        <li class="lb-item">
          <span class="lb-rank">${rankBadge}</span>
          <span class="lb-name">${item.name}</span>
          <span class="lb-details">🎯 ${item.correct} 題 | ✦ x${item.combo}</span>
          <span class="lb-score">${item.score} 分</span>
        </li>
      `;
    }).join('');
  }

  // 更新 HUD 狀態欄
  updateHUD() {
    this.dom.scoreDisplay.innerHTML = `<span class="star-icon">⭐</span> 分數: <b>${this.state.score}</b>`;
    if (this.state.combo > 1) {
      this.dom.comboDisplay.style.display = 'block';
      this.dom.comboDisplay.textContent = `✦ 連擊 x${this.state.combo}`;
    } else {
      this.dom.comboDisplay.style.display = 'none';
    }
  }

  // 渲染 5 顆愛心血條
  renderHearts() {
    this.dom.heartsContainer.innerHTML = '';
    for (let i = 0; i < this.state.maxLives; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart-icon';
      heart.textContent = (i < this.state.lives) ? '❤️' : '🖤';
      if (i >= this.state.lives) heart.classList.add('lost');
      this.dom.heartsContainer.appendChild(heart);
    }
  }

  // 震動舞台反饋
  shakeStage() {
    this.dom.stage.classList.remove('stage-shake');
    void this.dom.stage.offsetWidth;
    this.dom.stage.classList.add('stage-shake');
  }

  // 浮動文字特效 (加分/扣血)
  showFloatingText(x, y, text, color) {
    const floatEl = document.createElement('div');
    floatEl.className = 'floating-feedback';
    floatEl.textContent = text;
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    floatEl.style.color = color;

    document.body.appendChild(floatEl);
    setTimeout(() => floatEl.remove(), 800);
  }

  // 動態出題卡片彈跳動畫
  animateCardPop() {
    this.dom.centerCard.classList.remove('card-pop-anim');
    void this.dom.centerCard.offsetWidth;
    this.dom.centerCard.classList.add('card-pop-anim');
  }

  animateCardPulse() {
    this.dom.centerCard.classList.remove('card-pulse-anim');
    void this.dom.centerCard.offsetWidth;
    this.dom.centerCard.classList.add('card-pulse-anim');
  }

  // 提示訊息列
  showNotice(msg) {
    this.dom.statusNotice.textContent = msg;
  }

  // 調整畫布尺寸
  resizeCanvas() {
    this.fxCanvas.width = window.innerWidth;
    this.fxCanvas.height = window.innerHeight;
  }

  // 手勢光軌反饋
  onHandMove(hands) {
    hands.forEach(h => {
      this.handTrails.push({
        x: h.x,
        y: h.y,
        alpha: 1.0,
        radius: 14,
        color: `hsl(${(Date.now() / 15) % 360}, 90%, 65%)`
      });
    });
  }

  // 產生爆破粒子
  spawnPopParticles(x, y, isCorrect) {
    const count = isCorrect ? 36 : 18;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        radius: 3 + Math.random() * 6,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        type: 'water',
        color: isCorrect 
          ? `rgba(${180 + Math.floor(Math.random() * 70)}, ${220 + Math.floor(Math.random() * 35)}, 255,`
          : `rgba(248, 113, 113,`
      });
    }

    if (isCorrect) {
      for (let j = 0; j < 16; j++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 6;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 8 + Math.random() * 8,
          rot: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.2,
          alpha: 1.0,
          decay: 0.02,
          type: 'star',
          color: Math.random() > 0.3 ? '#fcd34d' : '#ffffff'
        });
      }
    }
  }

  // 粒子系統動畫循環
  renderFxLoop(ts) {
    const ctx = this.fxCtx;
    ctx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);

    // 1. 繪製手勢光軌
    for (let i = this.handTrails.length - 1; i >= 0; i--) {
      const t = this.handTrails[i];
      t.alpha -= 0.05;
      t.radius *= 0.95;

      if (t.alpha <= 0 || t.radius < 1) {
        this.handTrails.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. 繪製物理粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // 重力加速度
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'water') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.shadowColor = 'rgba(147, 197, 253, 0.6)';
        ctx.shadowBlur = 8;
        ctx.fill();
      } else if (p.type === 'star') {
        p.rot += p.vRot;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        this.drawStarPath(ctx, 0, 0, 5, p.size, p.size * 0.45);
        ctx.fill();
      }

      ctx.restore();
    }

    requestAnimationFrame((ts) => this.renderFxLoop(ts));
  }

  // 繪製五角星路徑
  drawStarPath(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }
}

// 當 DOM 載入後啟動遊戲主程式
window.addEventListener('DOMContentLoaded', () => {
  new ESLBubbleGame();
});
