// Reading placement quiz — adaptive level-finder.
//
// Flow: student picks a starting grade guess -> at each level, reads a short
// self-contained passage and answers 3 questions (literal, inferential,
// vocabulary) -> 3/3 or 0/3 decides immediately, 2/3 triggers one tie-breaker
// question at the same level -> passing moves up a level, failing steps down
// one level to recheck -> two consecutive fails (in either direction) stops
// the test -> the highest level fully passed becomes the main
// recommendation, the next level up becomes a "stretch" suggestion.
//
// Result is saved to localStorage ("les_placement_v1") and, if the student
// is signed in and Supabase is configured, synced via placement-sync.js.
// This is purely a suggestion — it never filters or gates the book library.
(function () {
  var LEVELS = window.PLACEMENT_LEVELS || [];
  var K = "les_placement_v1";

  function loadResult() {
    try {
      return JSON.parse(localStorage.getItem(K) || "null");
    } catch (e) {
      return null;
    }
  }
  function saveResult(result) {
    try {
      localStorage.setItem(K, JSON.stringify(result));
    } catch (e) {}
    if (window.__syncPlacementResult) window.__syncPlacementResult(result);
  }

  var state = null;

  function openOverlay() {
    document.getElementById("placementOverlay").style.display = "flex";
    document.body.style.overflow = "hidden";
    renderGradePicker();
  }
  function closeOverlay() {
    document.getElementById("placementOverlay").style.display = "none";
    document.body.style.overflow = "";
    renderRecommendedCard();
  }

  function contentEl() {
    return document.getElementById("plcContent");
  }
  function setProgress(text) {
    var el = document.getElementById("plcProgress");
    if (el) el.textContent = text || "";
  }

  function renderGradePicker() {
    setProgress("");
    var html =
      '<div class="rev-card"><h2>What grade are you in, or closest to?</h2>' +
      '<p>Pick one to start — if you\'re not sure, that\'s okay too.<span class="cn">选一个最接近的年级——不确定也没关系。</span></p><div>';
    LEVELS.forEach(function (lvl, i) {
      html += '<button class="rev-opt" data-i="' + i + '">' + lvl.grade + "</button>";
    });
    html += '<button class="rev-opt" data-i="not-sure">Not sure — start in the middle</button></div></div>';
    contentEl().innerHTML = html;
    contentEl()
      .querySelectorAll(".rev-opt")
      .forEach(function (btn) {
        btn.addEventListener("click", function () {
          var startIndex = btn.dataset.i === "not-sure" ? Math.floor(LEVELS.length / 2) : +btn.dataset.i;
          startQuiz(startIndex);
        });
      });
  }

  function startQuiz(startIndex) {
    state = {
      idx: startIndex,
      tested: {},
      passed: [],
      failed: [],
      consecutiveFails: 0,
      qi: 0,
      correctCount: 0,
      onTiebreak: false,
      sel: null,
    };
    runLevel();
  }

  function currentQuestion() {
    var lvl = LEVELS[state.idx];
    if (state.onTiebreak) return lvl.tiebreak;
    return lvl.questions[state.qi];
  }

  function runLevel() {
    state.qi = 0;
    state.correctCount = 0;
    state.onTiebreak = false;
    renderPassageAndQuestion();
  }

  function renderPassageAndQuestion() {
    var lvl = LEVELS[state.idx];
    var q = currentQuestion();
    state.sel = null;
    setProgress(lvl.grade + " · question " + (state.onTiebreak ? "tie-breaker" : state.qi + 1 + " of 3"));
    var opts = q.choices
      .map(function (c, i) {
        return '<button class="rev-opt" data-i="' + i + '">' + String.fromCharCode(65 + i) + ". " + c + "</button>";
      })
      .join("");
    contentEl().innerHTML =
      '<div class="rev-card"><div class="rev-src">' +
      lvl.grade +
      " · " +
      q.kind +
      '</div><p style="font-size:1.05rem;line-height:1.6;margin:0 0 16px">' +
      lvl.passage +
      '</p><h2 style="font-size:1.2rem">' +
      q.q +
      '</h2><div>' +
      opts +
      '</div><div class="rev-fb" id="plcFb">Choose an answer, then check it.</div><button class="rev-check" id="plcCheck">Check Answer</button></div>';
    contentEl()
      .querySelectorAll(".rev-opt")
      .forEach(function (o) {
        o.addEventListener("click", function () {
          state.sel = +o.dataset.i;
          contentEl()
            .querySelectorAll(".rev-opt")
            .forEach(function (x) {
              x.classList.remove("sel");
            });
          o.classList.add("sel");
        });
      });
    document.getElementById("plcCheck").addEventListener("click", checkAnswer);
  }

  function checkAnswer() {
    var q = currentQuestion();
    var fb = document.getElementById("plcFb");
    if (state.sel === null) {
      fb.textContent = "Please choose an answer first.";
      return;
    }
    contentEl()
      .querySelectorAll(".rev-opt")
      .forEach(function (o, i) {
        o.classList.remove("ok", "no");
        if (i === state.sel) o.classList.add(i === q.answer ? "ok" : "no");
      });
    var correct = state.sel === q.answer;
    if (correct) state.correctCount++;
    fb.className = "rev-fb " + (correct ? "good" : "bad");
    fb.textContent = correct ? "Correct!" : "Not quite.";
    var nextBtn = document.createElement("button");
    nextBtn.className = "rev-next";
    nextBtn.textContent = state.onTiebreak || state.qi >= 2 ? "Continue →" : "Next →";
    nextBtn.addEventListener("click", advance);
    contentEl().querySelector(".rev-card").appendChild(nextBtn);
    document.getElementById("plcCheck").remove();
  }

  function advance() {
    if (state.onTiebreak) {
      finishLevel(state.correctCount === 1 ? true : false); // tiebreak alone decides
      return;
    }
    state.qi++;
    if (state.qi < 3) {
      renderPassageAndQuestion();
      return;
    }
    // 3 base questions done
    if (state.correctCount === 3) {
      finishLevel(true);
    } else if (state.correctCount <= 1) {
      finishLevel(false);
    } else {
      // exactly 2 -> tie-breaker decides
      state.onTiebreak = true;
      state.correctCount = 0; // reused as the tiebreak's own correct flag
      renderPassageAndQuestion();
    }
  }

  function finishLevel(passed) {
    state.tested[state.idx] = true;
    if (passed) {
      state.passed.push(state.idx);
      state.consecutiveFails = 0;
      if (state.idx >= LEVELS.length - 1 || state.tested[state.idx + 1]) {
        return showResult();
      }
      state.idx = state.idx + 1;
      runLevel();
    } else {
      state.failed.push(state.idx);
      state.consecutiveFails++;
      if (state.consecutiveFails >= 2 || state.idx <= 0 || state.tested[state.idx - 1]) {
        return showResult();
      }
      state.idx = state.idx - 1;
      runLevel();
    }
  }

  function showResult() {
    var primaryIdx = state.passed.length ? Math.max.apply(null, state.passed) : null;
    var primaryLevel = primaryIdx !== null ? LEVELS[primaryIdx] : LEVELS[0];
    var stretchLevel = primaryIdx !== null && primaryIdx < LEVELS.length - 1 ? LEVELS[primaryIdx + 1] : null;
    var result = {
      takenAt: Date.now(),
      primaryGrade: primaryLevel.grade,
      primaryBand: window.PLACEMENT_BAND_FOR_GRADE(primaryLevel.grade),
      stretchGrade: stretchLevel ? stretchLevel.grade : null,
      noLevelPassed: primaryIdx === null,
    };
    saveResult(result);
    setProgress("Result");
    contentEl().innerHTML =
      '<div class="rev-card"><h2>' +
      (result.noLevelPassed ? "Let's start with the basics" : "Recommended: " + result.primaryGrade) +
      '</h2><p>' +
      (result.noLevelPassed
        ? "We'll suggest some " + primaryLevel.grade + " books to build up from."
        : result.primaryBand + " — books at this level should feel comfortable to read on your own.") +
      "</p>" +
      (result.stretchGrade
        ? '<p style="color:var(--muted)">Feeling confident? ' + result.stretchGrade + " books are a good next challenge.</p>"
        : "") +
      '<p style="color:var(--muted);font-size:.92rem">This is just a suggestion — you can still read any book, at any grade, any time.</p>' +
      '<button class="rev-next" id="plcDone">See recommended books →</button></div>';
    document.getElementById("plcDone").addEventListener("click", closeOverlay);
  }

  function bestBooksFor(grade, limit) {
    var all = [];
    var BOOKS = window.RV_BOOKS || {};
    Object.keys(BOOKS).forEach(function (subject) {
      (BOOKS[subject] || []).forEach(function (b) {
        if (b.grade === grade) all.push(Object.assign({ subject: subject }, b));
      });
    });
    // simple shuffle so the same few books don't always show first
    for (var i = all.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = all[i];
      all[i] = all[j];
      all[j] = tmp;
    }
    return all.slice(0, limit || 6);
  }

  function renderRecommendedCard() {
    var result = loadResult();
    var card = document.getElementById("recommendedCard");
    if (!card) return;
    if (!result) {
      card.style.display = "none";
      return;
    }
    var books = bestBooksFor(result.primaryGrade, 6);
    if (!books.length) {
      card.style.display = "none";
      return;
    }
    card.style.display = "block";
    var cardsHTML = books
      .map(function (b) {
        return (
          '<article class="book"><div class="cover"><img src="' +
          b.cover +
          '" alt="' +
          b.title +
          ' cover" loading="lazy"><div class="cover-title"><small>' +
          b.grade +
          "</small><h3>" +
          b.title +
          '</h3></div></div><div class="body"><p>' +
          (b.subtitle || "") +
          '</p><button class="open" style="border:0;cursor:pointer;width:100%" data-file="' +
          b.file +
          '" data-title="' +
          b.title +
          '" data-category="' +
          b.subject +
          '">Open Book</button></div></article>'
        );
      })
      .join("");
    card.innerHTML =
      '<div class="section-title"><h2>Recommended for you</h2><p>Based on your placement quiz result: ' +
      result.primaryGrade +
      " · " +
      result.primaryBand +
      ' · <a href="#" id="retakePlacement" style="color:var(--green);font-weight:800">retake the quiz</a></p></div><div class="books">' +
      cardsHTML +
      "</div>";
    card.querySelectorAll(".open").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.__openBook) window.__openBook(btn.dataset.file, btn.dataset.title, btn.dataset.category);
      });
    });
    var retakeBtn = document.getElementById("retakePlacement");
    if (retakeBtn)
      retakeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        openOverlay();
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var startBtn = document.getElementById("startPlacement");
    if (startBtn) startBtn.addEventListener("click", openOverlay);
    var backBtn = document.getElementById("placementBack");
    if (backBtn)
      backBtn.addEventListener("click", function () {
        document.getElementById("placementOverlay").style.display = "none";
        document.body.style.overflow = "";
      });
    renderRecommendedCard();
  });

  window.__onPlacementSynced = renderRecommendedCard;
})();
