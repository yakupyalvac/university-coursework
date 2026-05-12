const Game = (() => {
  const DIFFICULTIES = {
    easy: {
      label: "Kolay",
      totalTime: 70,
      customerPatience: 14,
      spawnEvery: 3.1,
      lives: 5,
      targetScore: 300,
      twoItemChance: 0.15
    },
    normal: {
      label: "Normal",
      totalTime: 65,
      customerPatience: 12,
      spawnEvery: 2.6,
      lives: 4,
      targetScore: 420,
      twoItemChance: 0.25
    },
    hard: {
      label: "Zor",
      totalTime: 55,
      customerPatience: 10.8,
      spawnEvery: 2.15,
      lives: 3,
      targetScore: 520,
      twoItemChance: 0.38
    }
  };

  const CONFIG = {
    maxCustomers: 6,
    levelEverySeconds: 14,
    maxLevel: 6,
    correctBase: 10,
    correctSpeedBonus: 20,
    partialCorrectBase: 5,
    comboBonusStep: 3,
    comboBonusCap: 30,
    wrongPenalty: 4,
    wrongTimePenalty: 2,
    expiredPenalty: 7,
    rushBonus: 14,
    coldPenalty: 5,
    freshBonus: 6,
    maxFloatingTexts: 8
  };

  const CUSTOMER_TYPES = [
    { id: "regular", label: "Normal", icon: "🙂", patience: 1, tip: 1, className: "type-regular" },
    { id: "generous", label: "Bonkör", icon: "⭐", patience: 1.08, tip: 1.8, className: "type-generous" },
    { id: "impatient", label: "Sabırsız", icon: "⚡", patience: 0.78, tip: 1.15, className: "type-impatient" },
    { id: "critic", label: "Eleştirmen", icon: "📝", patience: 0.95, tip: 1.35, className: "type-critic" }
  ];

  const CUSTOMER_PROFILES = [
    { id: "youngWoman", label: "Genç Kadın", shortLabel: "Genç", gender: "Kadın", className: "gender-female age-young outfit-coral", patience: 0.95 },
    { id: "youngMan", label: "Genç Erkek", shortLabel: "Genç", gender: "Erkek", className: "gender-male age-young outfit-teal", patience: 0.95 },
    { id: "adultWoman", label: "Kadın", shortLabel: "Kadın", gender: "Kadın", className: "gender-female age-adult outfit-green", patience: 1 },
    { id: "adultMan", label: "Erkek", shortLabel: "Erkek", gender: "Erkek", className: "gender-male age-adult outfit-red", patience: 1 },
    { id: "elderWoman", label: "Yaşlı Kadın", shortLabel: "Yaşlı", gender: "Kadın", className: "gender-female age-elder outfit-purple", patience: 1.12 },
    { id: "elderMan", label: "Yaşlı Erkek", shortLabel: "Yaşlı", gender: "Erkek", className: "gender-male age-elder outfit-brown", patience: 1.12 }
  ];

  const SHOP_UPGRADES = {
    patience: {
      label: "Rahat Sandalyeler",
      description: "Müşteri sabrı artar.",
      max: 3,
      costs: [50, 95, 150]
    },
    tipJar: {
      label: "Bahşiş Kavanozu",
      description: "Bahşiş miktarı artar.",
      max: 3,
      costs: [45, 90, 145]
    },
    extraLife: {
      label: "Yedek Garson",
      description: "Oyuna ekstra canla başlarsın.",
      max: 2,
      costs: [85, 150]
    },
    warmLamp: {
      label: "Isıtma Lambası",
      description: "Soğuma cezası azalır.",
      max: 3,
      costs: [55, 105, 165]
    }
  };

  const DAILY_MISSIONS = [
    { id: "serve", label: "Bugün 12 müşteriye servis yap", reward: 90, target: 12 },
    { id: "tips", label: "Bugün 45 bahşiş topla", reward: 80, target: 45 },
    { id: "rush", label: "Bugün 4 acele siparişi tamamla", reward: 85, target: 4 },
    { id: "combo", label: "Bugün x7 combo yap", reward: 75, target: 7 },
    { id: "fresh", label: "Bugün 8 sıcak servis yap", reward: 80, target: 8 }
  ];

  const FOODS = [
    { id: "burger", name: "Burger", icon: "🍔", unlockLevel: 1 },
    { id: "pizza", name: "Pizza", icon: "🍕", unlockLevel: 1 },
    { id: "soda", name: "Soda", icon: "🥤", unlockLevel: 1 },
    { id: "salad", name: "Salata", icon: "🥗", unlockLevel: 2 },
    { id: "toast", name: "Tost", icon: "🥪", unlockLevel: 3 },
    { id: "fries", name: "Patates", icon: "🍟", unlockLevel: 4 },
    { id: "coffee", name: "Kahve", icon: "☕", unlockLevel: 5 },
    { id: "dessert", name: "Tatlı", icon: "🍰", unlockLevel: 6 }
  ];

  const state = {
    mode: "start",
    difficulty: "normal",
    settings: DIFFICULTIES.normal,
    score: 0,
    best: 0,
    timeLeft: DIFFICULTIES.normal.totalTime,
    lives: DIFFICULTIES.normal.lives,
    combo: 0,
    bestCombo: 0,
    level: 1,
    spawnClock: 0,
    customers: [],
    nextCustomerId: 1,
    lastFrame: 0,
    served: 0,
    missed: 0,
    wrong: 0,
    tips: 0,
    rushServed: 0,
    freshServed: 0,
    qualityTotal: 0,
    earnedCoins: 0,
    missionAnnounced: false,
    coins: 0,
    upgrades: createDefaultUpgrades(),
    daily: null,
    soundEnabled: true,
    audioContext: null
  };

  const el = {};

  function init() {
    cacheElements();
    state.best = readBestScore();
    state.coins = readCoins();
    state.upgrades = readUpgrades();
    state.daily = readDailyMission();
    state.soundEnabled = readSoundPreference();
    el.soundToggle.checked = state.soundEnabled;
    syncSoundUi();
    renderFoodButtons();
    renderShop();
    bindEvents();
    render();
  }

  function cacheElements() {
    el.timeText = document.getElementById("timeText");
    el.scoreText = document.getElementById("scoreText");
    el.bestText = document.getElementById("bestText");
    el.levelText = document.getElementById("levelText");
    el.comboText = document.getElementById("comboText");
    el.livesText = document.getElementById("livesText");
    el.coinsText = document.getElementById("coinsText");
    el.missionText = document.getElementById("missionText");
    el.difficultyText = document.getElementById("difficultyText");
    el.missionFill = document.getElementById("missionFill");
    el.dailyText = document.getElementById("dailyText");
    el.dailyRewardText = document.getElementById("dailyRewardText");
    el.floatLayer = document.getElementById("floatLayer");
    el.queue = document.getElementById("queue");
    el.foods = document.getElementById("foods");
    el.foodHint = document.getElementById("foodHint");
    el.feedback = document.getElementById("feedback");
    el.liveStatus = document.getElementById("liveStatus");
    el.startOverlay = document.getElementById("startOverlay");
    el.marketOverlay = document.getElementById("marketOverlay");
    el.pauseOverlay = document.getElementById("pauseOverlay");
    el.gameOverOverlay = document.getElementById("gameOverOverlay");
    el.countdown = document.getElementById("countdown");
    el.finalText = document.getElementById("finalText");
    el.gradeText = document.getElementById("gradeText");
    el.servedText = document.getElementById("servedText");
    el.missedText = document.getElementById("missedText");
    el.bestComboText = document.getElementById("bestComboText");
    el.missionResultText = document.getElementById("missionResultText");
    el.tipsText = document.getElementById("tipsText");
    el.rushText = document.getElementById("rushText");
    el.qualityText = document.getElementById("qualityText");
    el.earnedCoinsText = document.getElementById("earnedCoinsText");
    el.dailyResultText = document.getElementById("dailyResultText");
    el.startButton = document.getElementById("startButton");
    el.restartButton = document.getElementById("restartButton");
    el.menuButton = document.getElementById("menuButton");
    el.marketButton = document.getElementById("marketButton");
    el.closeMarketButton = document.getElementById("closeMarketButton");
    el.openMarketFromResultButton = document.getElementById("openMarketFromResultButton");
    el.pauseButton = document.getElementById("pauseButton");
    el.resumeButton = document.getElementById("resumeButton");
    el.soundButton = document.getElementById("soundButton");
    el.soundToggle = document.getElementById("soundToggle");
    el.tutorialButton = document.getElementById("tutorialButton");
    el.tutorialPanel = document.getElementById("tutorialPanel");
    el.resetDataButton = document.getElementById("resetDataButton");
    el.shopCoinsText = document.getElementById("shopCoinsText");
    el.shopItems = document.getElementById("shopItems");
  }

  function bindEvents() {
    el.startButton.addEventListener("click", startGame);
    el.restartButton.addEventListener("click", startGame);
    el.menuButton.addEventListener("click", showStartMenu);
    el.marketButton.addEventListener("click", openMarket);
    el.closeMarketButton.addEventListener("click", closeMarket);
    el.openMarketFromResultButton.addEventListener("click", openMarket);
    el.resumeButton.addEventListener("click", resumeGame);
    el.pauseButton.addEventListener("click", togglePause);
    el.soundButton.addEventListener("click", toggleSound);
    el.soundToggle.addEventListener("change", () => {
      state.soundEnabled = el.soundToggle.checked;
      saveSoundPreference(state.soundEnabled);
      syncSoundUi();
    });
    el.tutorialButton.addEventListener("click", toggleTutorial);
    el.resetDataButton.addEventListener("click", resetSavedData);
    el.shopItems.addEventListener("click", (event) => {
      const button = event.target.closest("[data-upgrade]");
      if (button) buyUpgrade(button.dataset.upgrade);
    });

    document.addEventListener("keydown", (event) => {
      if (!el.marketOverlay.hidden) {
        if (event.key === "Escape") closeMarket();
        return;
      }

      if (event.key === "Enter" && state.mode === "start") startGame();
      if (event.key === "Enter" && state.mode === "gameover") startGame();
      if (event.key === "Enter" && state.mode === "paused") resumeGame();
      if (event.key.toLowerCase() === "p") togglePause();

      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && FOODS[index]) {
        if (isFoodUnlocked(FOODS[index])) {
          chooseFood(FOODS[index].id);
        } else if (state.mode === "playing") {
          setFeedback(`${FOODS[index].name} seviye ${FOODS[index].unlockLevel} ile açılır.`);
        }
      }
    });
  }

  function renderFoodButtons() {
    el.foods.innerHTML = FOODS.map((food, index) => `
      <button
        class="food-button ${isFoodUnlocked(food) ? "" : "locked"}"
        type="button"
        data-food="${food.id}"
        ${isFoodUnlocked(food) ? "" : "disabled"}
        aria-label="${index + 1}. ${food.name}${isFoodUnlocked(food) ? "" : `, seviye ${food.unlockLevel} ile açılır`}"
      >
        <span class="food-icon" aria-hidden="true">${food.icon}</span>
        <span>${food.name}</span>
        <span class="key-hint">${isFoodUnlocked(food) ? index + 1 : `Sv. ${food.unlockLevel}`}</span>
      </button>
    `).join("");

    el.foods.querySelectorAll(".food-button").forEach((button) => {
      button.addEventListener("click", () => chooseFood(button.dataset.food));
    });
  }

  function renderShop() {
    el.shopCoinsText.textContent = `Para: ${state.coins}`;
    el.shopItems.innerHTML = Object.entries(SHOP_UPGRADES).map(([id, upgrade]) => {
      const level = state.upgrades[id] || 0;
      const isMaxed = level >= upgrade.max;
      const cost = upgrade.costs[level] || 0;
      const canBuy = !isMaxed && state.coins >= cost;

      return `
        <article class="shop-item">
          <div>
            <strong>${upgrade.label}</strong>
            <span>${upgrade.description}</span>
            <small>Seviye ${level}/${upgrade.max}</small>
          </div>
          <button class="shop-buy" type="button" data-upgrade="${id}" ${canBuy ? "" : "disabled"}>
            ${isMaxed ? "Tam" : `${cost} para`}
          </button>
        </article>
      `;
    }).join("");
  }

  function buyUpgrade(id) {
    const upgrade = SHOP_UPGRADES[id];
    if (!upgrade) return;

    const level = state.upgrades[id] || 0;
    if (level >= upgrade.max) return;

    const cost = upgrade.costs[level];
    if (state.coins < cost) {
      setFeedback("Bu yükseltme için yeterli para yok.");
      return;
    }

    state.coins -= cost;
    state.upgrades[id] = level + 1;
    saveCoins(state.coins);
    saveUpgrades(state.upgrades);
    renderShop();
    render();
  }

  async function startGame() {
    readStartOptions();
    setupNewRun();
    await playCountdown();

    if (state.mode !== "countdown") return;

    state.mode = "playing";
    state.lastFrame = performance.now();
    el.pauseButton.disabled = false;
    spawnCustomer();
    requestAnimationFrame(gameLoop);
    render();
  }

  function readStartOptions() {
    const selected = document.querySelector("input[name='difficulty']:checked");
    state.difficulty = selected ? selected.value : "normal";
    state.settings = DIFFICULTIES[state.difficulty];
    state.soundEnabled = el.soundToggle.checked;
    syncSoundUi();
  }

  function setupNewRun() {
    state.mode = "countdown";
    document.body.classList.remove("game-paused");
    state.score = 0;
    state.timeLeft = state.settings.totalTime;
    state.lives = state.settings.lives + state.upgrades.extraLife;
    state.combo = 0;
    state.bestCombo = 0;
    state.level = 1;
    state.spawnClock = getSpawnInterval();
    state.customers = [];
    state.nextCustomerId = 1;
    state.served = 0;
    state.missed = 0;
    state.wrong = 0;
    state.tips = 0;
    state.rushServed = 0;
    state.freshServed = 0;
    state.qualityTotal = 0;
    state.earnedCoins = 0;
    state.missionAnnounced = false;

    el.startOverlay.hidden = true;
    el.marketOverlay.hidden = true;
    el.gameOverOverlay.hidden = true;
    el.pauseOverlay.hidden = true;
    el.pauseButton.disabled = true;
    renderFoodButtons();
    setFeedback("Hazırlan.");
    render();
  }

  async function playCountdown() {
    el.countdown.hidden = false;

    for (const label of ["3", "2", "1", "Servis!"]) {
      if (state.mode !== "countdown") break;
      el.countdown.textContent = label;
      playSound(label === "Servis!" ? "start" : "tick");
      await wait(650);
    }

    el.countdown.hidden = true;
  }

  function gameLoop(now) {
    if (state.mode !== "playing") return;

    const delta = Math.min((now - state.lastFrame) / 1000, 0.1);
    state.lastFrame = now;

    updateGame(delta);
    render();

    if (state.timeLeft <= 0 || state.lives <= 0) {
      endGame();
      return;
    }

    requestAnimationFrame(gameLoop);
  }

  function updateGame(delta) {
    state.timeLeft = Math.max(0, state.timeLeft - delta);
    updateLevel();
    updateMission();

    state.spawnClock += delta;
    if (state.spawnClock >= getSpawnInterval()) {
      state.spawnClock = 0;
      spawnCustomer();
    }

    state.customers.forEach((customer) => {
      if (!customer.resolving) customer.patience -= delta;
    });

    state.customers
      .filter((customer) => customer.patience <= 0 && !customer.resolving)
      .forEach(expireCustomer);
  }

  function updateLevel() {
    const elapsed = state.settings.totalTime - state.timeLeft;
    const nextLevel = Math.min(CONFIG.maxLevel, Math.floor(elapsed / CONFIG.levelEverySeconds) + 1);

    if (nextLevel !== state.level) {
      state.level = nextLevel;
      renderFoodButtons();
      setFeedback(`Seviye ${state.level}: mutfak hızlandı.`);
      announceUnlockedFood();
      playSound("level");
    }
  }

  function updateMission() {
    if (!state.missionAnnounced && state.score >= state.settings.targetScore) {
      state.missionAnnounced = true;
      setFeedback("Görev tamamlandı! Şimdi rekoru büyüt.");
      playSound("mission");
    }
  }

  function spawnCustomer() {
    if (state.customers.length >= CONFIG.maxCustomers) return;

    const items = createOrder();
    const type = createCustomerType();
    const profile = createCustomerProfile();
    const rush = isRushOrder();
    const patience = getCustomerPatience(items.length, type, profile, rush);

    state.customers.push({
      id: state.nextCustomerId++,
      items,
      type,
      profile,
      rush,
      patience,
      maxPatience: patience,
      servedCount: 0,
      resolving: false,
      status: ""
    });

    if (rush) {
      setFeedback("Acele sipariş geldi! Hızlı servis ekstra puan verir.");
      playSound("level");
    } else {
      setFeedback(items.length > 1 ? "İki ürünlü sipariş geldi." : `${profile.label} ${type.label} müşteri geldi.`);
    }
  }

  function createOrder() {
    const chance = Math.min(0.62, state.settings.twoItemChance + (state.level - 1) * 0.04);
    const count = Math.random() < chance ? 2 : 1;
    const availableFoods = getAvailableFoods();
    const items = [];

    for (let i = 0; i < count; i += 1) {
      items.push(availableFoods[Math.floor(Math.random() * availableFoods.length)]);
    }

    return items;
  }

  function getAvailableFoods() {
    return FOODS.filter(isFoodUnlocked);
  }

  function isFoodUnlocked(food) {
    return Boolean(food) && food.unlockLevel <= state.level;
  }

  function announceUnlockedFood() {
    const unlockedNow = FOODS.filter((food) => food.unlockLevel === state.level);
    if (unlockedNow.length === 0) return;

    const names = unlockedNow.map((food) => food.name).join(", ");
    setFeedback(`Yeni yemek açıldı: ${names}`);
    setLiveStatus(`Yeni yemek seçeneği açıldı: ${names}.`);
  }

  function createCustomerType() {
    const roll = Math.random();
    if (roll < 0.16) return CUSTOMER_TYPES[1];
    if (roll < 0.36) return CUSTOMER_TYPES[2];
    if (roll < 0.48) return CUSTOMER_TYPES[3];
    return CUSTOMER_TYPES[0];
  }

  function createCustomerProfile() {
    return CUSTOMER_PROFILES[Math.floor(Math.random() * CUSTOMER_PROFILES.length)];
  }

  function isRushOrder() {
    return Math.random() < Math.min(0.32, 0.1 + state.level * 0.035);
  }

  function getCustomerPatience(itemCount, type, profile, rush) {
    const levelPressure = (state.level - 1) * 0.65;
    const multiItemBuffer = itemCount > 1 ? 3 : 0;
    const upgradeBuffer = state.upgrades.patience * 1.15;
    const rushMultiplier = rush ? 0.72 : 1;
    const base = state.settings.customerPatience - levelPressure + multiItemBuffer + upgradeBuffer;
    return Math.max(5.4, base * type.patience * profile.patience * rushMultiplier);
  }

  function getSpawnInterval() {
    return Math.max(1.05, state.settings.spawnEvery - (state.level - 1) * 0.26);
  }

  function chooseFood(foodId) {
    if (state.mode !== "playing") return;

    const customer = getOldestWaitingCustomer();
    const food = FOODS.find((item) => item.id === foodId);

    if (!food) {
      return;
    }

    if (!isFoodUnlocked(food)) {
      setFeedback(`${food.name} henüz açık değil.`);
      return;
    }

    if (!customer) {
      setFeedback("Servis bekleyen müşteri yok.");
      return;
    }

    const expected = customer.items[customer.servedCount];
    const isCorrect = expected && expected.id === foodId;
    flashFoodButton(foodId, isCorrect);

    if (isCorrect) {
      serveCorrectItem(customer);
    } else {
      serveWrong(customer, food);
    }
  }

  function serveCorrectItem(customer) {
    customer.servedCount += 1;

    if (customer.servedCount < customer.items.length) {
      const points = CONFIG.partialCorrectBase + Math.ceil(getPatienceRatio(customer) * 5);
      addScore(points);
      showFloatingText(`+${points}`, "good");
      setFeedback(`Ürün hazır! Sıradaki ürünü seç. +${points}`);
      setLiveStatus("Siparişin bir ürünü doğru hazırlandı.");
      playSound("correct");
      return;
    }

    completeCustomer(customer);
  }

  function completeCustomer(customer) {
    const ratio = getPatienceRatio(customer);
    const speedPoints = Math.ceil(ratio * CONFIG.correctSpeedBonus);
    const comboBonus = getComboBonus();
    const multiItemBonus = customer.items.length > 1 ? 8 : 0;
    const rushBonus = customer.rush ? CONFIG.rushBonus : 0;
    const quality = getQualityResult(ratio);
    const tip = getTip(customer, ratio);
    const points = CONFIG.correctBase + speedPoints + comboBonus + multiItemBonus + rushBonus + quality.points + tip;

    customer.resolving = true;
    customer.status = "correct";
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.served += 1;
    state.tips += tip;
    state.qualityTotal += quality.points;
    if (quality.id === "fresh") state.freshServed += 1;
    if (customer.rush) state.rushServed += 1;

    addScore(points);
    showFloatingText(`+${points}`, "good");
    if (tip > 0) showFloatingText(`Bahşiş +${tip}`, "tip");
    if (quality.points < 0) showFloatingText(`${quality.label} ${quality.points}`, "bad");
    setFeedback(`Sipariş tamam! +${points} | ${quality.label}${tip ? ` | Bahşiş +${tip}` : ""}`);
    setLiveStatus(`Sipariş doğru servis edildi. ${points} puan.`);
    playSound("complete");

    setTimeout(() => removeCustomer(customer.id), 220);
  }

  function serveWrong(customer, chosenFood) {
    customer.status = "wrong";
    state.combo = 0;
    state.wrong += 1;
    const criticPenalty = customer.type.id === "critic" ? 3 : 0;
    const penalty = CONFIG.wrongPenalty + criticPenalty;
    state.timeLeft = Math.max(0, state.timeLeft - CONFIG.wrongTimePenalty);
    addScore(-penalty);
    showFloatingText(`-${penalty}`, "bad");

    setFeedback(`Yanlış seçim: ${chosenFood.name}. -${penalty}, -${CONFIG.wrongTimePenalty} sn`);
    setLiveStatus("Yanlış yemek seçildi.");
    playSound("wrong");

    setTimeout(() => {
      if (customer.status === "wrong") customer.status = "";
      render();
    }, 260);
  }

  function expireCustomer(customer) {
    customer.resolving = true;
    customer.status = "expired";
    state.combo = 0;
    state.missed += 1;
    state.lives = Math.max(0, state.lives - 1);
    const rushPenalty = customer.rush ? 4 : 0;
    const penalty = CONFIG.expiredPenalty + rushPenalty;
    addScore(-penalty);
    showFloatingText(`Kaçtı -${penalty}`, "bad");

    setFeedback(`Müşteri ayrıldı. -${penalty} puan, -1 can`);
    setLiveStatus("Bir müşteri beklemekten ayrıldı.");
    playSound("miss");
    setTimeout(() => removeCustomer(customer.id), 180);
  }

  function getPatienceRatio(customer) {
    return Math.max(0, customer.patience / customer.maxPatience);
  }

  function getQualityResult(ratio) {
    if (ratio >= 0.58) {
      return { id: "fresh", label: "Sıcak servis", points: CONFIG.freshBonus };
    }

    if (ratio >= 0.24) {
      return { id: "warm", label: "Ilık servis", points: 0 };
    }

    const penalty = Math.max(2, CONFIG.coldPenalty - state.upgrades.warmLamp * 2);
    return { id: "cold", label: "Soğudu", points: -penalty };
  }

  function getTip(customer, ratio) {
    if (ratio < 0.42) return 0;

    const baseTip = 4 + state.upgrades.tipJar * 4;
    const rushMultiplier = customer.rush ? 1.25 : 1;
    return Math.ceil(baseTip * customer.type.tip * rushMultiplier);
  }

  function getComboBonus() {
    return Math.min(CONFIG.comboBonusCap, state.combo * CONFIG.comboBonusStep);
  }

  function getOldestWaitingCustomer() {
    return state.customers.find((customer) => !customer.resolving);
  }

  function removeCustomer(id) {
    state.customers = state.customers.filter((customer) => customer.id !== id);
    render();
  }

  function addScore(points) {
    state.score = Math.max(0, state.score + points);
  }

  function togglePause() {
    if (state.mode === "playing") {
      pauseGame();
      return;
    }

    if (state.mode === "paused") {
      resumeGame();
    }
  }

  function pauseGame() {
    state.mode = "paused";
    document.body.classList.add("game-paused");
    el.pauseButton.textContent = "Devam";
    el.pauseButton.focus();
    setFeedback("Oyun duraklatıldı.");
    render();
  }

  function resumeGame() {
    if (state.mode !== "paused") return;

    state.mode = "playing";
    document.body.classList.remove("game-paused");
    el.pauseButton.textContent = "Duraklat";
    state.lastFrame = performance.now();
    setFeedback("Servise devam.");
    requestAnimationFrame(gameLoop);
    render();
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    el.soundToggle.checked = state.soundEnabled;
    saveSoundPreference(state.soundEnabled);
    syncSoundUi();
    playSound("tick");
  }

  function syncSoundUi() {
    el.soundButton.textContent = state.soundEnabled ? "Ses: Açık" : "Ses: Kapalı";
    el.soundButton.setAttribute("aria-pressed", String(state.soundEnabled));
  }

  function toggleTutorial() {
    const willOpen = el.tutorialPanel.hidden;
    el.tutorialPanel.hidden = !willOpen;
    el.tutorialButton.setAttribute("aria-expanded", String(willOpen));
  }

  function resetSavedData() {
    const confirmed = window.confirm("En iyi skor, para, market yükseltmeleri ve günlük görev kaydı sıfırlansın mı?");
    if (!confirmed) return;

    localStorage.removeItem("restaurantRushBest");
    localStorage.removeItem("restaurantRushCoins");
    localStorage.removeItem("restaurantRushUpgrades");
    localStorage.removeItem("restaurantRushDaily");
    state.best = 0;
    state.coins = 0;
    state.upgrades = createDefaultUpgrades();
    state.daily = readDailyMission();
    renderShop();
    renderFoodButtons();
    render();
    setFeedback("Kayıtlar sıfırlandı.");
  }

  function openMarket() {
    if (state.mode === "playing" || state.mode === "countdown") {
      setFeedback("Market için önce oyunu duraklat.");
      return;
    }

    if (state.mode === "gameover") {
      el.gameOverOverlay.hidden = true;
    }

    el.marketOverlay.hidden = false;
    renderShop();
    el.closeMarketButton.focus();
  }

  function closeMarket() {
    el.marketOverlay.hidden = true;

    if (state.mode === "gameover") {
      el.gameOverOverlay.hidden = false;
      el.openMarketFromResultButton.focus();
      return;
    }

    if (state.mode === "start") {
      el.startOverlay.hidden = false;
    }
  }

  function showStartMenu() {
    state.mode = "start";
    document.body.classList.remove("game-paused");
    state.customers = [];
    el.gameOverOverlay.hidden = true;
    el.marketOverlay.hidden = true;
    el.pauseOverlay.hidden = true;
    el.startOverlay.hidden = false;
    el.pauseButton.disabled = true;
    renderShop();
    renderFoodButtons();
    render();
  }

  function endGame() {
    state.mode = "gameover";
    document.body.classList.remove("game-paused");
    state.timeLeft = 0;
    el.pauseButton.disabled = true;
    el.pauseButton.textContent = "Duraklat";
    el.pauseOverlay.hidden = true;
    el.marketOverlay.hidden = true;

    if (state.score > state.best) {
      state.best = state.score;
      saveBestScore(state.best);
    }

    const missionDone = state.score >= state.settings.targetScore;
    const dailyProgress = getDailyProgress();
    const dailyDone = dailyProgress.current >= dailyProgress.target;
    const dailyReward = dailyDone && !state.daily.claimed ? state.daily.reward : 0;
    const baseCoins = Math.floor(state.score / 25) + state.served * 2 + Math.floor(state.tips / 10);
    state.earnedCoins = baseCoins + dailyReward;
    state.coins += state.earnedCoins;
    state.daily.progress[state.daily.id] = Math.min(dailyProgress.current, dailyProgress.target);
    if (dailyReward > 0) state.daily.claimed = true;
    saveCoins(state.coins);
    saveDailyMission(state.daily);
    renderShop();

    const reason = state.lives <= 0 ? "Canların bitti." : "Süre bitti.";

    el.gradeText.textContent = `Derece: ${getResultGrade(missionDone)}`;
    el.finalText.textContent = `${reason} Skorun: ${state.score} | En iyi: ${state.best}`;
    el.servedText.textContent = state.served;
    el.missedText.textContent = state.missed;
    el.bestComboText.textContent = `x${state.bestCombo}`;
    el.missionResultText.textContent = missionDone ? "Tamam" : "Eksik";
    el.tipsText.textContent = state.tips;
    el.rushText.textContent = state.rushServed;
    el.qualityText.textContent = state.qualityTotal >= 0 ? `+${state.qualityTotal}` : state.qualityTotal;
    el.earnedCoinsText.textContent = `+${state.earnedCoins}`;
    el.dailyResultText.textContent = dailyDone
      ? `Günlük görev tamamlandı: ${state.daily.label}${dailyReward ? ` (+${dailyReward} para)` : " (ödül alınmış)"}`
      : `Günlük görev: ${dailyProgress.current}/${dailyProgress.target}`;
    el.gameOverOverlay.hidden = false;
    el.restartButton.focus();
    setFeedback("Oyun bitti.");
    playSound(missionDone ? "mission" : "miss");
    render();
  }

  function getResultGrade(missionDone) {
    const scoreRatio = state.score / state.settings.targetScore;

    if (scoreRatio >= 1.35 && state.missed === 0) return "Usta Şef";
    if (scoreRatio >= 1.1) return "Hızlı Servis";
    if (missionDone) return "Görev Tamam";
    if (state.served >= 8) return "Gelişiyor";
    return "Tekrar Dene";
  }

  function render() {
    el.timeText.textContent = Math.ceil(state.timeLeft);
    el.scoreText.textContent = state.score;
    el.bestText.textContent = state.best;
    el.levelText.textContent = state.level;
    el.comboText.textContent = `x${state.combo}`;
    el.livesText.textContent = "❤".repeat(state.lives) || "0";
    el.coinsText.textContent = state.coins;
    el.missionText.textContent = `Hedef: ${state.settings.targetScore} puan`;
    el.difficultyText.textContent = state.settings.label;
    el.foodHint.textContent = getFoodHintText();
    el.missionFill.style.width = `${Math.min(100, (state.score / state.settings.targetScore) * 100)}%`;
    syncMarketButton();
    renderDaily();
    renderQueue();
  }

  function syncMarketButton() {
    const lockedForPlay = state.mode === "playing" || state.mode === "countdown";
    el.marketButton.disabled = lockedForPlay;
    el.marketButton.textContent = state.mode === "paused" ? "Market" : lockedForPlay ? "Market kilitli" : "Market";
  }

  function renderDaily() {
    const progress = getDailyProgress(state.mode !== "gameover");
    el.dailyText.textContent = `${state.daily.label}: ${Math.min(progress.current, progress.target)}/${progress.target}`;
    el.dailyRewardText.textContent = state.daily.claimed ? "Ödül alındı" : `Ödül: ${state.daily.reward} para`;
  }

  function getDailyProgress(includeRun = true) {
    const mission = state.daily;
    const progressByType = {
      serve: state.served,
      tips: state.tips,
      rush: state.rushServed,
      combo: state.bestCombo,
      fresh: state.freshServed
    };
    const savedProgress = mission.progress && Number(mission.progress[mission.id])
      ? Number(mission.progress[mission.id])
      : 0;
    const runProgress = includeRun ? progressByType[mission.id] || 0 : 0;

    return {
      current: mission.id === "combo" ? Math.max(savedProgress, runProgress) : savedProgress + runProgress,
      target: mission.target
    };
  }

  function getFoodHintText() {
    const nextFood = FOODS.find((food) => food.unlockLevel > state.level);
    if (!nextFood) return "Tüm yemekler açık";
    return `Sıradaki: ${nextFood.name} seviye ${nextFood.unlockLevel}`;
  }

  function renderQueue() {
    if (state.customers.length === 0) {
      el.queue.innerHTML = `<div class="empty-message">Müşteri bekleniyor...</div>`;
      return;
    }

    el.queue.innerHTML = state.customers.map((customer) => {
      const ratio = getPatienceRatio(customer);
      const fillColor = ratio > 0.55 ? "var(--good)" : ratio > 0.25 ? "var(--warn)" : "var(--bad)";
      const orderHtml = customer.items.map((item, index) => `
        <div class="order-chip ${getOrderChipClass(customer, index)}">
          <div class="order-icon" aria-hidden="true">${item.icon}</div>
          <div class="order-name">${item.name}</div>
        </div>
      `).join("");

      return `
        <article class="customer ${customer.status} ${customer.type.className} ${customer.rush ? "rush" : ""}" aria-label="${customer.items.map((item) => item.name).join(" ve ")} isteyen ${customer.profile.label} ${customer.type.label} müşteri">
          <div class="guest-card">
            <div class="guest-top">
              <span class="customer-badge">${customer.rush ? "Acele" : `${customer.type.icon} ${customer.type.label}`}</span>
              <span class="profile-badge">${customer.profile.shortLabel}</span>
            </div>
            <div class="guest-main">
              ${renderCustomerPortrait(customer.profile)}
              <div class="order-list">${orderHtml}</div>
            </div>
            <div class="patience" aria-label="Sabır süresi">
              <div class="patience-fill" style="width:${ratio * 100}%; background:${fillColor};"></div>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderCustomerPortrait(profile) {
    const style = getPortraitStyle(profile);
    const isFemale = profile.gender === "Kadın";
    const isElder = profile.id.includes("elder");
    const hair = isFemale
      ? `<path d="M31 32c4-16 44-18 50 0 7 10 7 28 2 44H68V45H44v31H29c-5-16-5-34 2-44Z" fill="${style.hair}"/>`
      : `<path d="M33 35c7-19 43-18 49 0v15c-11-2-20-7-25-15-5 8-14 13-24 15V35Z" fill="${style.hair}"/>`;
    const lowerBody = isFemale
      ? `<path d="M45 101h22l7 34H38l7-34Z" fill="${style.bottom}"/>
         <path d="M47 134l-7 28M65 134l7 28" stroke="${style.leg}" stroke-width="8" stroke-linecap="round"/>
         <path d="M36 164h14M66 164h14" stroke="#29231f" stroke-width="5" stroke-linecap="round"/>`
      : `<path d="M42 101h13l-3 58M70 101H57l3 58" stroke="${style.bottom}" stroke-width="13" stroke-linecap="round"/>
         <path d="M38 164h16M58 164h17" stroke="#29231f" stroke-width="5" stroke-linecap="round"/>`;
    const elderDetails = isElder
      ? `<path d="M38 57h14M60 57h14" stroke="#6d5d51" stroke-width="2" stroke-linecap="round"/>
         <circle cx="45" cy="61" r="7" fill="none" stroke="#76675e" stroke-width="2"/>
         <circle cx="67" cy="61" r="7" fill="none" stroke="#76675e" stroke-width="2"/>
         <path d="M52 61h8" stroke="#76675e" stroke-width="2"/>
         <path d="M47 77c5 3 13 3 18 0" stroke="#7d4a3a" stroke-width="2.5" stroke-linecap="round"/>`
      : `<path d="M46 77c7 5 15 5 22 0" stroke="#7d3c2f" stroke-width="3" stroke-linecap="round"/>`;

    return `
      <svg class="portrait flat-person ${profile.className}" viewBox="0 0 112 170" role="img" aria-label="${profile.label}">
        <ellipse cx="56" cy="166" rx="31" ry="5" fill="rgba(0,0,0,.18)"/>
        ${lowerBody}
        <path d="M34 96c4-15 40-16 45 0l5 29H28l6-29Z" fill="${style.shirt}" stroke="#3d2a20" stroke-width="2.5"/>
        <path d="M37 101c-10 10-13 20-12 33M77 101c10 10 13 20 12 33" stroke="${style.skin}" stroke-width="8" stroke-linecap="round"/>
        <path d="M42 100c5 7 24 7 29 0" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="4" stroke-linecap="round"/>
        <rect x="47" y="84" width="18" height="17" rx="6" fill="${style.skin}" stroke="#5a3423" stroke-width="2"/>
        ${hair}
        <ellipse cx="56" cy="61" rx="27" ry="32" fill="${style.skin}" stroke="#4a2d1f" stroke-width="2.5"/>
        <ellipse cx="45" cy="62" rx="2.7" ry="3.4" fill="#201611"/>
        <ellipse cx="67" cy="62" rx="2.7" ry="3.4" fill="#201611"/>
        <path d="M56 66c-3 5-4 9 2 11" fill="none" stroke="#9b5a3c" stroke-width="2" stroke-linecap="round" opacity=".65"/>
        <ellipse cx="40" cy="72" rx="6" ry="3.5" fill="#d98471" opacity=".25"/>
        <ellipse cx="72" cy="72" rx="6" ry="3.5" fill="#d98471" opacity=".25"/>
        <path d="M36 47c8-11 32-14 44 1" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="4" stroke-linecap="round"/>
        ${elderDetails}
      </svg>
    `;
  }

  function getPortraitStyle(profile) {
    const styles = {
      youngWoman: { skin: "#e7a77a", hair: "#7a4216", shirt: "#d7c7a8", bottom: "#2f2b24", leg: "#d69b70" },
      youngMan: { skin: "#dfa06f", hair: "#2a211a", shirt: "#6b5d45", bottom: "#3d3329", leg: "#d99b6a" },
      adultWoman: { skin: "#d99765", hair: "#1e1a19", shirt: "#cba984", bottom: "#245d76", leg: "#cf9364" },
      adultMan: { skin: "#d89462", hair: "#6b431f", shirt: "#5b533d", bottom: "#2f3028", leg: "#c98859" },
      elderWoman: { skin: "#d2ad8d", hair: "#d8d1c5", shirt: "#2f806d", bottom: "#2e5150", leg: "#c99f7f" },
      elderMan: { skin: "#c99e7c", hair: "#d8d1c5", shirt: "#7a5a35", bottom: "#4c3a26", leg: "#bf9271" }
    };

    return styles[profile.id] || styles.adultMan;
  }

  function getOrderChipClass(customer, index) {
    if (index < customer.servedCount) return "done";
    if (index === customer.servedCount && !customer.resolving) return "active";
    return "";
  }

  function flashFoodButton(foodId, isCorrect) {
    const button = el.foods.querySelector(`[data-food="${foodId}"]`);
    if (!button) return;

    const className = isCorrect ? "good-flash" : "bad-flash";
    button.classList.remove(className);
    void button.offsetWidth;
    button.classList.add(className);

    setTimeout(() => button.classList.remove(className), 320);
  }

  function setFeedback(message) {
    el.feedback.textContent = message;
  }

  function setLiveStatus(message) {
    el.liveStatus.textContent = message;
  }

  function showFloatingText(message, type) {
    if (!el.floatLayer) return;

    while (el.floatLayer.children.length >= CONFIG.maxFloatingTexts) {
      el.floatLayer.firstElementChild.remove();
    }

    const text = document.createElement("span");
    text.className = `floating-text ${type}`;
    text.textContent = message;
    text.style.left = `${20 + Math.random() * 60}%`;
    text.style.top = `${22 + Math.random() * 46}%`;
    el.floatLayer.appendChild(text);

    setTimeout(() => {
      text.remove();
    }, 950);
  }

  function playSound(type) {
    if (!state.soundEnabled) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!state.audioContext) {
      state.audioContext = new AudioContext();
    }

    if (state.audioContext.state === "suspended") {
      state.audioContext.resume();
    }

    const patterns = {
      tick: [420, 0.04, "sine"],
      start: [620, 0.12, "triangle"],
      correct: [520, 0.08, "sine"],
      complete: [760, 0.13, "triangle"],
      wrong: [160, 0.16, "sawtooth"],
      miss: [115, 0.2, "square"],
      level: [880, 0.14, "triangle"],
      mission: [980, 0.18, "sine"]
    };

    const [frequency, duration, wave] = patterns[type] || patterns.tick;
    const now = state.audioContext.currentTime;
    const oscillator = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();

    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(state.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  function wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  function readBestScore() {
    const saved = Number(localStorage.getItem("restaurantRushBest"));
    return clampNumber(saved, 0, 999999, 0);
  }

  function saveBestScore(score) {
    localStorage.setItem("restaurantRushBest", String(clampNumber(score, 0, 999999, 0)));
  }

  function readCoins() {
    const saved = Number(localStorage.getItem("restaurantRushCoins"));
    return clampNumber(saved, 0, 999999, 0);
  }

  function saveCoins(coins) {
    localStorage.setItem("restaurantRushCoins", String(clampNumber(coins, 0, 999999, 0)));
  }

  function readUpgrades() {
    const saved = localStorage.getItem("restaurantRushUpgrades");
    if (!saved) return createDefaultUpgrades();

    try {
      return sanitizeUpgrades(JSON.parse(saved));
    } catch {
      return createDefaultUpgrades();
    }
  }

  function saveUpgrades(upgrades) {
    localStorage.setItem("restaurantRushUpgrades", JSON.stringify(sanitizeUpgrades(upgrades)));
  }

  function createDefaultUpgrades() {
    return Object.keys(SHOP_UPGRADES).reduce((result, id) => {
      result[id] = 0;
      return result;
    }, {});
  }

  function sanitizeUpgrades(upgrades) {
    const clean = createDefaultUpgrades();

    Object.entries(SHOP_UPGRADES).forEach(([id, upgrade]) => {
      clean[id] = clampNumber(Number(upgrades && upgrades[id]), 0, upgrade.max, 0);
    });

    return clean;
  }

  function readSoundPreference() {
    const saved = localStorage.getItem("restaurantRushSound");
    return saved === null ? true : saved === "true";
  }

  function saveSoundPreference(enabled) {
    localStorage.setItem("restaurantRushSound", String(Boolean(enabled)));
  }

  function clampNumber(value, min, max, fallback) {
    if (!Number.isFinite(value)) return fallback;
    return Math.min(max, Math.max(min, Math.floor(value)));
  }

  function readDailyMission() {
    const today = getTodayKey();
    const saved = localStorage.getItem("restaurantRushDaily");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return sanitizeDailyMission(parsed, today);
      } catch {
        localStorage.removeItem("restaurantRushDaily");
      }
    }

    const mission = DAILY_MISSIONS[getDailyIndex(today)];
    const daily = { ...mission, date: today, claimed: false, progress: sanitizeDailyProgress() };
    saveDailyMission(daily);
    return daily;
  }

  function saveDailyMission(daily) {
    localStorage.setItem("restaurantRushDaily", JSON.stringify(daily));
  }

  function sanitizeDailyMission(daily, today) {
    const fallback = DAILY_MISSIONS[getDailyIndex(today)];
    const knownMission = DAILY_MISSIONS.find((mission) => mission.id === daily.id) || fallback;

    return {
      ...knownMission,
      date: today,
      claimed: Boolean(daily.claimed),
      progress: sanitizeDailyProgress(daily.progress)
    };
  }

  function sanitizeDailyProgress(progress) {
    return DAILY_MISSIONS.reduce((result, mission) => {
      result[mission.id] = clampNumber(Number(progress && progress[mission.id]), 0, mission.target, 0);
      return result;
    }, {});
  }

  function getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getDailyIndex(today) {
    return today.split("").reduce((total, char) => total + char.charCodeAt(0), 0) % DAILY_MISSIONS.length;
  }

  return { init };
})();

window.addEventListener("DOMContentLoaded", Game.init);
