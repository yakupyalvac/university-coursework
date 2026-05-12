const seedState = {
  categories: [
    { id: "cisco", name: "Cisco Packet Tracer", description: "Ag topolojileri, cihaz komutlari ve IP yapilandirma" },
    { id: "visual-studio", name: "Visual Studio", description: "IDE kullanimi, proje yapisi ve hata ayiklama" },
    { id: "database", name: "Veritabanlari", description: "SQL, tablo, iliski ve temel sorgular" },
    { id: "python", name: "Python", description: "Soz dizimi, veri tipleri ve temel programlama" }
  ],
  questions: [
    {
      id: "q-cisco-1",
      categoryId: "cisco",
      text: "Packet Tracer'da router arayuzune IP vermek icin hangi komut kullanilir?",
      options: ["ip address", "set ip", "assign ip", "router ip"],
      correctOptionIndex: 0,
      explanation: "Cisco IOS arayuz modunda IP tanimlamak icin ip address komutu kullanilir.",
      difficulty: "orta",
      createdAt: "2026-05-12T00:00:00.000Z"
    },
    {
      id: "q-cisco-2",
      categoryId: "cisco",
      text: "Bir switch uzerinde VLAN olusturmak icin hangi komut baslangic olarak kullanilir?",
      options: ["vlan 10", "new vlan 10", "switch vlan 10", "create interface vlan"],
      correctOptionIndex: 0,
      explanation: "Global configuration modunda vlan 10 komutu VLAN yapilandirmasini baslatir.",
      difficulty: "orta",
      createdAt: "2026-05-12T00:00:00.000Z"
    },
    {
      id: "q-vs-1",
      categoryId: "visual-studio",
      text: "Visual Studio'da breakpoint ne amacla kullanilir?",
      options: ["Kod calismasini belirli noktada durdurmak", "Projeyi derlemeden silmek", "Veritabani olusturmak", "Dosya uzantisini degistirmek"],
      correctOptionIndex: 0,
      explanation: "Breakpoint hata ayiklama sirasinda kodun belirlenen satirda durmasini saglar.",
      difficulty: "kolay",
      createdAt: "2026-05-12T00:00:00.000Z"
    },
    {
      id: "q-db-1",
      categoryId: "database",
      text: "SQL'de tablodan veri okumak icin hangi komut kullanilir?",
      options: ["SELECT", "INSERT", "UPDATE", "DELETE"],
      correctOptionIndex: 0,
      explanation: "SELECT komutu verileri sorgulamak icin kullanilir.",
      difficulty: "kolay",
      createdAt: "2026-05-12T00:00:00.000Z"
    },
    {
      id: "q-python-1",
      categoryId: "python",
      text: "Python'da liste veri tipi hangi parantezle tanimlanir?",
      options: ["[]", "{}", "()", "<>"],
      correctOptionIndex: 0,
      explanation: "Python listeleri koseli parantez ile tanimlanir.",
      difficulty: "kolay",
      createdAt: "2026-05-12T00:00:00.000Z"
    }
  ],
  attempts: [],
  results: [],
  selectedCategoryId: "all"
};

function cloneSeedState() {
  return JSON.parse(JSON.stringify(seedState));
}

let state = QuestionStorage.load() || cloneSeedState();
let setupMode = "test";
let activeAttempt = null;
let activeQuestionIndex = 0;
let timerId = null;
let remainingSeconds = 0;
let randomSeenIds = [];

const screens = {
  home: document.getElementById("homeScreen"),
  add: document.getElementById("addScreen"),
  categories: document.getElementById("categoriesScreen"),
  setup: document.getElementById("setupScreen"),
  quiz: document.getElementById("quizScreen"),
  random: document.getElementById("randomScreen"),
  results: document.getElementById("resultScreen")
};

const optionLetters = ["A", "B", "C", "D"];

function saveState() {
  QuestionStorage.save(state);
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  if (name === "home") renderHome();
  if (name === "categories") renderCategories();
  if (name === "add") renderAddForm();
  if (name === "random") renderRandomScreen();
  if (name === "results") renderResult();
}

function route(name) {
  if (activeAttempt && screens.quiz.classList.contains("is-active") && name === "home") {
    if (!confirm("Aktif testten cikilsin mi? Kaydedilmemis cevaplar silinir.")) return;
    stopTimer();
    activeAttempt = null;
  }
  if (name === "quiz") {
    openSetup("test");
    return;
  }
  if (name === "timed") {
    openSetup("timed");
    return;
  }
  showScreen(name);
}

function categoryName(id) {
  if (id === "all") return "Tum dersler";
  return state.categories.find((category) => category.id === id)?.name || "Bilinmeyen ders";
}

function questionsForCategory(categoryId) {
  return categoryId === "all"
    ? [...state.questions]
    : state.questions.filter((question) => question.categoryId === categoryId);
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function renderHome() {
  const totalQuestions = state.questions.length;
  const selectedName = categoryName(state.selectedCategoryId);
  document.getElementById("summaryText").textContent = `${state.categories.length} ders, ${totalQuestions} soru. Secili ders: ${selectedName}.`;
  document.getElementById("homeEmptyState").hidden = totalQuestions > 0;
}

function categoryOptions(selectedId = state.selectedCategoryId, includeAll = true) {
  const allOption = includeAll ? `<option value="all">Tum dersler</option>` : "";
  return allOption + state.categories
    .map((category) => `<option value="${category.id}" ${category.id === selectedId ? "selected" : ""}>${category.name}</option>`)
    .join("");
}

function renderAddForm() {
  document.getElementById("questionCategory").innerHTML = categoryOptions(state.selectedCategoryId, false);
  const optionInputs = document.getElementById("optionInputs");
  optionInputs.innerHTML = optionLetters.map((letter, index) => `
    <label>${letter} sikki
      <input id="option${index}" type="text" required placeholder="${letter} cevabini yazin">
    </label>
  `).join("");
  document.getElementById("questionFormError").textContent = "";
}

function renderCategories() {
  const list = document.getElementById("categoryList");
  list.innerHTML = state.categories.map((category) => {
    const count = questionsForCategory(category.id).length;
    return `
      <button class="category-button ${state.selectedCategoryId === category.id ? "is-selected" : ""}" data-category="${category.id}" type="button">
        <span><strong>${category.name}</strong><br>${category.description}</span>
        <span>${count} soru</span>
      </button>
    `;
  }).join("");
  document.getElementById("categoryEmptyState").hidden = state.categories.length > 0;
}

function openSetup(mode) {
  setupMode = mode;
  document.getElementById("setupTitle").textContent = mode === "timed" ? "Sureli sinav" : "Test coz";
  document.getElementById("setupCategory").innerHTML = categoryOptions(state.selectedCategoryId, true);
  document.getElementById("timeLimitWrap").hidden = mode !== "timed";
  document.getElementById("setupError").textContent = "";
  showScreen("setup");
}

function startQuiz() {
  const categoryId = document.getElementById("setupCategory").value;
  const count = Number(document.getElementById("setupCount").value);
  const pool = questionsForCategory(categoryId);
  const error = document.getElementById("setupError");

  if (!pool.length) {
    error.textContent = "Bu secim icin soru bulunamadi.";
    return;
  }
  if (!Number.isInteger(count) || count < 1) {
    error.textContent = "Soru sayisi en az 1 olmalidir.";
    return;
  }

  const selectedQuestions = shuffle(pool).slice(0, Math.min(count, pool.length));
  activeAttempt = {
    id: `attempt-${Date.now()}`,
    questionIds: selectedQuestions.map((question) => question.id),
    answers: {},
    startedAt: new Date().toISOString(),
    endedAt: null,
    durationSec: setupMode === "timed" ? Number(document.getElementById("timeLimit").value) * 60 : null,
    mode: setupMode,
    paused: false
  };

  if (setupMode === "timed" && (!activeAttempt.durationSec || activeAttempt.durationSec < 60)) {
    error.textContent = "Sure en az 1 dakika olmalidir.";
    activeAttempt = null;
    return;
  }

  activeQuestionIndex = 0;
  remainingSeconds = activeAttempt.durationSec || 0;
  startTimerIfNeeded();
  renderQuiz();
  showScreen("quiz");
}

function activeQuestions() {
  if (!activeAttempt) return [];
  return activeAttempt.questionIds
    .map((id) => state.questions.find((question) => question.id === id))
    .filter(Boolean);
}

function calculateResult(attempt) {
  const questions = attempt.questionIds
    .map((id) => state.questions.find((question) => question.id === id))
    .filter(Boolean);
  let correct = 0;
  let wrong = 0;
  let empty = 0;

  questions.forEach((question) => {
    const selectedIndex = attempt.answers[question.id];
    if (selectedIndex === undefined) {
      empty += 1;
    } else if (selectedIndex === question.correctOptionIndex) {
      correct += 1;
    } else {
      wrong += 1;
    }
  });

  return {
    attemptId: attempt.id,
    mode: attempt.mode,
    total: questions.length,
    correct,
    wrong,
    empty,
    score: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    createdAt: new Date().toISOString()
  };
}

function renderQuiz() {
  const questions = activeQuestions();
  const question = questions[activeQuestionIndex];
  const result = calculateResult(activeAttempt);
  document.getElementById("quizTitle").textContent = activeAttempt.mode === "timed" ? "Sureli sinav" : "Test coz";
  document.getElementById("quizMeta").textContent = `${activeQuestionIndex + 1}/${questions.length} - ${categoryName(document.getElementById("setupCategory").value)}`;
  document.getElementById("correctCount").textContent = result.correct;
  document.getElementById("wrongCount").textContent = result.wrong;
  document.getElementById("emptyCount").textContent = result.empty;
  document.getElementById("timerBox").hidden = activeAttempt.mode !== "timed";
  document.getElementById("pauseQuizBtn").hidden = activeAttempt.mode !== "timed";
  document.getElementById("pauseQuizBtn").textContent = activeAttempt.paused ? "Devam et" : "Duraklat";
  updateTimerText();

  document.getElementById("activeQuestionText").textContent = activeAttempt.paused ? "Sinav duraklatildi. Devam etmek icin Devam et dugmesine basin." : question.text;
  const selectedIndex = activeAttempt.answers[question.id];
  document.getElementById("answerList").innerHTML = question.options.map((option, index) => `
    <button class="answer-button ${selectedIndex === index ? "is-selected" : ""}" data-answer="${index}" type="button" ${activeAttempt.paused ? "disabled" : ""}>
      ${optionLetters[index]}. ${option}
    </button>
  `).join("");

  document.getElementById("prevQuestionBtn").disabled = activeAttempt.paused || activeQuestionIndex === 0;
  document.getElementById("nextQuestionBtn").disabled = activeAttempt.paused || activeQuestionIndex === questions.length - 1;
  document.getElementById("clearAnswerBtn").disabled = activeAttempt.paused;
}

function startTimerIfNeeded() {
  stopTimer();
  if (setupMode !== "timed") return;
  timerId = setInterval(() => {
    if (activeAttempt?.paused) return;
    remainingSeconds -= 1;
    updateTimerText();
    if (remainingSeconds <= 0) {
      finishQuiz(false);
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function updateTimerText() {
  const minutes = Math.floor(Math.max(remainingSeconds, 0) / 60).toString().padStart(2, "0");
  const seconds = Math.max(remainingSeconds, 0) % 60;
  document.getElementById("timerBox").textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function finishQuiz(requireConfirm = true) {
  if (!activeAttempt) return;
  if (requireConfirm && !confirm("Testi bitirmek istiyor musunuz?")) return;
  stopTimer();
  activeAttempt.endedAt = new Date().toISOString();
  const result = calculateResult(activeAttempt);
  state.attempts.push(activeAttempt);
  state.results.push(result);
  saveState();
  activeAttempt = null;
  showScreen("results");
}

function renderRandomScreen() {
  document.getElementById("randomCategory").innerHTML = categoryOptions(state.selectedCategoryId, true);
  document.getElementById("randomQuestionPanel").hidden = true;
  document.getElementById("randomEmptyState").hidden = state.questions.length > 0;
  document.getElementById("randomFeedback").textContent = "";
  randomSeenIds = [];
}

function showRandomQuestion() {
  const categoryId = document.getElementById("randomCategory").value;
  let pool = questionsForCategory(categoryId).filter((question) => !randomSeenIds.includes(question.id));
  if (!pool.length) {
    randomSeenIds = [];
    pool = questionsForCategory(categoryId);
  }
  const emptyState = document.getElementById("randomEmptyState");
  if (!pool.length) {
    emptyState.hidden = false;
    document.getElementById("randomQuestionPanel").hidden = true;
    return;
  }

  emptyState.hidden = true;
  const question = pool[Math.floor(Math.random() * pool.length)];
  randomSeenIds.push(question.id);
  document.getElementById("randomQuestionPanel").hidden = false;
  document.getElementById("randomQuestionText").textContent = question.text;
  document.getElementById("randomAnswerList").innerHTML = question.options.map((option, index) => `
    <button class="answer-button" data-random-answer="${index}" data-question-id="${question.id}" type="button">
      ${optionLetters[index]}. ${option}
    </button>
  `).join("");
  document.getElementById("randomFeedback").className = "feedback";
  document.getElementById("randomFeedback").textContent = "";
}

function renderResult() {
  const latest = state.results[state.results.length - 1];
  const emptyState = document.getElementById("resultEmptyState");
  const resultGrid = document.getElementById("resultGrid");
  const reviewList = document.getElementById("reviewList");

  if (!latest) {
    emptyState.hidden = false;
    resultGrid.innerHTML = "";
    reviewList.innerHTML = "";
    return;
  }

  emptyState.hidden = true;
  resultGrid.innerHTML = `
    <div class="result-card"><strong>${latest.score}</strong><br>Puan</div>
    <div class="result-card"><strong>${latest.correct}</strong><br>Dogru</div>
    <div class="result-card"><strong>${latest.wrong}</strong><br>Yanlis</div>
    <div class="result-card"><strong>${latest.empty}</strong><br>Bos</div>
    <div class="result-card"><strong>${latest.total}</strong><br>Toplam</div>
    <div class="result-card"><strong>${latest.mode === "timed" ? "Sureli" : "Test"}</strong><br>Mod</div>
  `;

  const attempt = state.attempts.find((item) => item.id === latest.attemptId);
  if (!attempt) {
    reviewList.innerHTML = "";
    return;
  }

  reviewList.innerHTML = attempt.questionIds.map((id, index) => {
    const question = state.questions.find((item) => item.id === id);
    if (!question) return "";
    const selectedIndex = attempt.answers[id];
    const selectedText = selectedIndex === undefined ? "Bos" : question.options[selectedIndex];
    const correctText = question.options[question.correctOptionIndex];
    const isCorrect = selectedIndex === question.correctOptionIndex;
    return `
      <div class="review-item">
        <p><strong>${index + 1}. ${question.text}</strong></p>
        <p>Verdigin cevap: ${selectedText}</p>
        <p>Dogru cevap: ${correctText}</p>
        <p class="feedback ${isCorrect ? "ok" : "wrong"}">${isCorrect ? "Dogru" : "Yanlis/Bos"}</p>
      </div>
    `;
  }).join("");
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    route(routeButton.dataset.route);
    return;
  }

  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.selectedCategoryId = categoryButton.dataset.category;
    saveState();
    renderCategories();
    return;
  }

  const answerButton = event.target.closest("[data-answer]");
  if (answerButton && activeAttempt) {
    const question = activeQuestions()[activeQuestionIndex];
    activeAttempt.answers[question.id] = Number(answerButton.dataset.answer);
    renderQuiz();
    return;
  }

  const randomAnswer = event.target.closest("[data-random-answer]");
  if (randomAnswer) {
    const question = state.questions.find((item) => item.id === randomAnswer.dataset.questionId);
    const selectedIndex = Number(randomAnswer.dataset.randomAnswer);
    const buttons = document.querySelectorAll("[data-random-answer]");
    buttons.forEach((button) => {
      const index = Number(button.dataset.randomAnswer);
      button.disabled = true;
      if (index === question.correctOptionIndex) button.classList.add("is-correct");
      if (index === selectedIndex && selectedIndex !== question.correctOptionIndex) button.classList.add("is-wrong");
    });
    const feedback = document.getElementById("randomFeedback");
    const correct = selectedIndex === question.correctOptionIndex;
    feedback.className = `feedback ${correct ? "ok" : "wrong"}`;
    feedback.textContent = correct ? "Dogru cevap." : `Yanlis. Dogru cevap: ${question.options[question.correctOptionIndex]}`;
  }
});

document.getElementById("questionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const categoryId = document.getElementById("questionCategory").value;
  const text = document.getElementById("questionText").value.trim();
  const options = optionLetters.map((_, index) => document.getElementById(`option${index}`).value.trim());
  const correctOptionIndex = Number(document.getElementById("correctOption").value);
  const error = document.getElementById("questionFormError");

  if (!categoryId || !text || options.some((option) => !option)) {
    error.textContent = "Ders, soru metni ve tum siklar zorunludur.";
    return;
  }

  state.questions.push({
    id: `q-${Date.now()}`,
    categoryId,
    text,
    options,
    correctOptionIndex,
    explanation: document.getElementById("explanation").value.trim(),
    difficulty: document.getElementById("difficulty").value,
    createdAt: new Date().toISOString()
  });

  saveState();
  event.target.reset();
  renderAddForm();
  error.textContent = "Soru kaydedildi.";
});

document.getElementById("startQuizBtn").addEventListener("click", startQuiz);
document.getElementById("prevQuestionBtn").addEventListener("click", () => {
  activeQuestionIndex = Math.max(0, activeQuestionIndex - 1);
  renderQuiz();
});
document.getElementById("nextQuestionBtn").addEventListener("click", () => {
  activeQuestionIndex = Math.min(activeQuestions().length - 1, activeQuestionIndex + 1);
  renderQuiz();
});
document.getElementById("clearAnswerBtn").addEventListener("click", () => {
  const question = activeQuestions()[activeQuestionIndex];
  delete activeAttempt.answers[question.id];
  renderQuiz();
});
document.getElementById("pauseQuizBtn").addEventListener("click", () => {
  if (!activeAttempt || activeAttempt.mode !== "timed") return;
  activeAttempt.paused = !activeAttempt.paused;
  renderQuiz();
});
document.getElementById("finishQuizBtn").addEventListener("click", () => finishQuiz(true));
document.getElementById("randomQuestionBtn").addEventListener("click", showRandomQuestion);
document.getElementById("resetSeedBtn").addEventListener("click", () => {
  if (!confirm("Yerel veriler silinip ornek veri yuklensin mi?")) return;
  QuestionStorage.clear();
  state = cloneSeedState();
  saveState();
  stopTimer();
  activeAttempt = null;
  showScreen("home");
});

window.addEventListener("beforeunload", stopTimer);

saveState();
renderHome();
