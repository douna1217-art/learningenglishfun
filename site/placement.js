// Reading placement quiz — adaptive level-finder.
//
// Two ways in:
//  - Lexile: a family that already knows the child's Lexile measure (from school,
//    SRI, MAP...) types it on the first screen; the grade comes straight from
//    LEXILE_TO_GRADE below, which is more accurate than any short quiz.
//  - Quiz: student picks a starting grade guess -> at each level, reads a
// passage (about 50 words for K up to about 280 for Grade 6, checked and built by
// tools/placement_build.py) and answers 8 four-choice questions -> 7-8/8 passes
// and 0-4/8 fails immediately, 5-6/8 triggers one tie-breaker question ->
// passing moves up a level, failing steps down one level to recheck -> two
// consecutive fails (in either direction) stops the test -> the highest
// level fully passed becomes the main recommendation, the next level up
// becomes a "stretch" suggestion. Passing the stretch cap (start + 2) also ends
// the test, since the result cannot go any higher (at most 3 levels).
//
// The final recommendation is capped at the student's own starting-grade
// guess + 1 (stretch capped at +2), no matter how many levels were
// technically passed — a short multiple-choice test can be beaten by luck
// across several levels in a row, and a wildly higher result (e.g. a
// Grade 1 starter landing on "Grade 4") does more harm than good. Math/
// Science/CS book recommendations use the student's stated grade directly,
// not the reading-test result — those subjects depend on classroom
// curriculum the student may not have been taught yet, unlike Fiction/SEL/
// Social Studies which mainly depend on reading ability.
//
// Result is saved to localStorage ("les_placement_v1") and, if the student
// is signed in and Supabase is configured, synced via placement-sync.js.
// This is purely a suggestion — it never filters or gates the book library.
(function () {
  var LEVELS = window.PLACEMENT_LEVELS || [];
  var K = "les_placement_v1";

  // Lexile measure -> reading grade. Based on the published typical Lexile ranges
  // per US grade (Grade 1 about 190-530L, 2: 420-650L, 3: 520-820L, 4: 740-940L,
  // 5: 830-1010L, 6: 925-1070L). The ranges overlap, so the cut points sit
  // between their middles: 660L -> Grade 3 (stretch Grade 4).
  var LEXILE_TO_GRADE = [
    [200, 0], // below 200L or BR (Beginning Reader) -> Kindergarten
    [450, 1],
    [600, 2],
    [750, 3],
    [880, 4],
    [960, 5],
    [Infinity, 6],
  ];
  function parseLexile(text) {
    var t = String(text || "").trim().toUpperCase().replace(/\s+/g, "");
    if (!t) return null;
    if (/^BR(\d+)?L?$/.test(t)) return { value: 0, label: t.replace(/L?$/, "L").replace(/^BRL$/, "BR") };
    var m = t.match(/^(\d{2,4})L?$/);
    if (!m) return false;
    var v = +m[1];
    if (v < 0 || v > 2000) return false;
    return { value: v, label: v + "L" };
  }
  function gradeIndexForLexile(v) {
    for (var i = 0; i < LEXILE_TO_GRADE.length; i++) if (v < LEXILE_TO_GRADE[i][0]) return LEXILE_TO_GRADE[i][1];
    return 6;
  }

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
      '<div style="background:#eef6f0;border-radius:14px;padding:12px 14px;margin:6px 0 14px">' +
      '<label for="plcLexile" style="font-weight:800">Already know your Lexile measure? Type it here, then tap your grade.' +
      '<span class="cn">已经知道孩子的蓝思值（Lexile）？在这里填上，再点下面的年级，就不用做测试了。</span></label>' +
      '<input id="plcLexile" inputmode="text" autocomplete="off" placeholder="e.g. 660L" style="margin-top:8px;width:140px;font-size:1.1rem;padding:8px 10px;border-radius:10px;border:2px solid #cfe3d6">' +
      '<div id="plcLexileErr" style="color:#b3261e;font-weight:700;margin-top:6px"></div></div>' +
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
          var lex = parseLexile((document.getElementById("plcLexile") || {}).value);
          if (lex === false) {
            document.getElementById("plcLexileErr").innerHTML =
              'Please type a Lexile measure like 660L or BR, or leave it empty to take the quiz.<span class="cn">请填写像 660L 或 BR 这样的蓝思值；不知道就留空，直接做测试。</span>';
            return;
          }
          if (lex) {
            var li = gradeIndexForLexile(lex.value);
            var reported = btn.dataset.i === "not-sure" ? li : +btn.dataset.i;
            return showLexileResult(lex, li, reported);
          }
          var startIndex = btn.dataset.i === "not-sure" ? Math.floor(LEVELS.length / 2) : +btn.dataset.i;
          startQuiz(startIndex);
        });
      });
  }

  function startQuiz(startIndex) {
    state = {
      startIndex: startIndex,
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
    setProgress(lvl.grade + " · question " + (state.onTiebreak ? "tie-breaker" : state.qi + 1 + " of " + lvl.questions.length));
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
      '</div>' +
      lvl.passage
        .split("\n")
        .map(function (para) {
          return '<p style="font-size:1.05rem;line-height:1.6;margin:0 0 12px">' + para + "</p>";
        })
        .join("") +
      '<h2 style="font-size:1.2rem;margin-top:16px">' +
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
    var lvlForBtn = LEVELS[state.idx];
    var nextBtn = document.createElement("button");
    nextBtn.className = "rev-next";
    nextBtn.textContent = state.onTiebreak || state.qi >= lvlForBtn.questions.length - 1 ? "Continue →" : "Next →";
    nextBtn.addEventListener("click", advance);
    contentEl().querySelector(".rev-card").appendChild(nextBtn);
    document.getElementById("plcCheck").remove();
  }

  function advance() {
    if (state.onTiebreak) {
      finishLevel(state.correctCount === 1 ? true : false); // tiebreak alone decides
      return;
    }
    var lvl = LEVELS[state.idx];
    state.qi++;
    if (state.qi < lvl.questions.length) {
      renderPassageAndQuestion();
      return;
    }
    // all base questions done (8 total: 7-8 pass, 0-4 fail, 5-6 -> tie-breaker)
    var n = lvl.questions.length;
    if (state.correctCount >= n - 1) {
      finishLevel(true);
    } else if (state.correctCount <= n - 4) {
      finishLevel(false);
    } else {
      // 3 or 4 correct -> tie-breaker decides
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
      // stop at the stretch cap (start + 2): the result can never go higher,
      // so further levels would only make a strong reader answer more questions
      if (state.idx >= LEVELS.length - 1 || state.tested[state.idx + 1] || state.idx >= state.startIndex + 2) {
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

  // Chinese labels for grades/bands, used only in the result/recommendation
  // text (never in the quiz passages/questions themselves — translating
  // those would defeat the point of testing English reading).
  var GRADE_CN = {
    "Kindergarten": "幼儿园",
    "Grade 1": "一年级",
    "Grade 2": "二年级",
    "Grade 3": "三年级",
    "Grade 4": "四年级",
    "Grade 5": "五年级",
    "Grade 6": "六年级",
  };
  var BAND_CN = {
    "Early Reader": "启蒙读者",
    "Beginning Reader": "入门读者",
    "Growing Reader": "进阶读者",
    "Fluent Reader": "流利读者",
  };
  function gradeCN(grade) {
    return GRADE_CN[grade] || grade;
  }
  function bandCN(band) {
    return BAND_CN[band] || band;
  }

  function showResult() {
    var rawPrimaryIdx = state.passed.length ? Math.max.apply(null, state.passed) : null;
    // Cap the recommendation at startIndex+1 (stretch at startIndex+2) no
    // matter how many levels were technically passed — see the file-top
    // note on why this cap exists.
    var capIdx = state.startIndex + 1;
    var primaryIdx = rawPrimaryIdx === null ? null : Math.min(rawPrimaryIdx, capIdx);
    var primaryLevel = primaryIdx !== null ? LEVELS[primaryIdx] : LEVELS[0];
    var stretchCapIdx = state.startIndex + 2;
    var stretchIdx = primaryIdx !== null && primaryIdx < LEVELS.length - 1 ? Math.min(primaryIdx + 1, stretchCapIdx) : null;
    var stretchLevel = stretchIdx !== null && stretchIdx > primaryIdx ? LEVELS[stretchIdx] : null;
    var reportedLevel = LEVELS[state.startIndex];
    var result = {
      takenAt: Date.now(),
      reportedGrade: reportedLevel.grade,
      primaryGrade: primaryLevel.grade,
      primaryBand: window.PLACEMENT_BAND_FOR_GRADE(primaryLevel.grade),
      stretchGrade: stretchLevel ? stretchLevel.grade : null,
      noLevelPassed: primaryIdx === null,
      wasCapped: rawPrimaryIdx !== null && rawPrimaryIdx > capIdx,
    };
    result.source = "quiz";
    saveResult(result);
    renderResultCard(result);
  }

  // A family that knows the child's Lexile measure skips the quiz: the grade
  // comes from LEXILE_TO_GRADE, with no cap (it is a real measurement).
  function showLexileResult(lex, gradeIdx, reportedIdx) {
    var stretchIdx = gradeIdx < LEVELS.length - 1 ? gradeIdx + 1 : null;
    var result = {
      takenAt: Date.now(),
      source: "lexile",
      lexile: lex.label,
      reportedGrade: LEVELS[reportedIdx].grade,
      primaryGrade: LEVELS[gradeIdx].grade,
      primaryBand: window.PLACEMENT_BAND_FOR_GRADE(LEVELS[gradeIdx].grade),
      stretchGrade: stretchIdx !== null ? LEVELS[stretchIdx].grade : null,
      noLevelPassed: false,
      wasCapped: false,
    };
    saveResult(result);
    renderResultCard(result);
  }

  // The result is written as a range ("about Grade 3, try Grade 4 for a
  // challenge"), with a reminder to move down or up a grade by feel: a short
  // test or a single number is a starting point, not a verdict.
  function renderResultCard(result) {
    setProgress("Result");
    var g = result.primaryGrade;
    var fromLexile = result.source === "lexile";
    var head = result.noLevelPassed
      ? "Let's start with the basics" + '<span class="cn">先从基础开始</span>'
      : "Reading level: about " + g + '<span class="cn">阅读水平：约' + gradeCN(g) + "</span>";
    var basis = fromLexile
      ? "Based on your Lexile measure (" + result.lexile + ")." +
        '<span class="cn">根据你填写的蓝思值（' + result.lexile + "）。</span>"
      : "Based on the quiz. A short quiz gives an estimate, so if you know your Lexile measure, you can retake it and type the measure in for a more accurate result." +
        '<span class="cn">根据测试结果。简短的测试只能给出一个大概范围；如果知道蓝思值，可以重新进入，填上蓝思值，结果会更准。</span>';
    contentEl().innerHTML =
      '<div class="rev-card"><h2>' + head + "</h2>" +
      "<p>" +
      (result.noLevelPassed
        ? "We'll suggest some " + g + " books to build up from." +
          '<span class="cn">我们会先推荐一些' + gradeCN(g) + "的书，帮助打好基础。</span>"
        : "Start with " + g + " books" +
          (result.stretchGrade ? ". For a challenge, try " + result.stretchGrade + " books." : ".") +
          '<span class="cn">先读' + gradeCN(g) + "的书" +
          (result.stretchGrade ? "；想挑战一下，可以试试" + gradeCN(result.stretchGrade) + "的书。" : "。") +
          "</span>") +
      "</p>" +
      '<p style="color:var(--muted)">If a book feels hard, go down one grade. If it feels easy, go up one.' +
      '<span class="cn">读起来吃力就退一个年级，读得很轻松就升一个年级。</span></p>' +
      '<p style="color:var(--muted);font-size:.92rem">' + basis + "</p>" +
      '<p style="color:var(--muted);font-size:.92rem">Math and Science book picks will match your grade (' +
      result.reportedGrade +
      ") instead, since those depend on what's already been taught in class." +
      '<span class="cn">数学和科学类的书会按照你的实际年级（' + gradeCN(result.reportedGrade) + "）来推荐，因为这两科需要课堂上教过的知识基础。</span>" +
      '</p><p style="color:var(--muted);font-size:.92rem">This is just a suggestion — you can still read any book, at any grade, any time.' +
      '<span class="cn">这只是一个建议——你随时都可以阅读任何年级的书。</span></p>' +
      '<button class="rev-next" id="plcDone">See recommended books →</button></div>';
    document.getElementById("plcDone").addEventListener("click", closeOverlay);
  }

  // Fiction/SEL/Social Studies mainly depend on reading ability, so they use
  // the (capped) reading-placement result. Math/Science/CS depend on
  // classroom curriculum the student may not have reached yet, so they're
  // matched to the student's own stated grade instead — see the file-top
  // note.
  var READING_GATED_SUBJECTS = ["fiction", "sel", "social-studies"];
  var CONTENT_GATED_SUBJECTS = ["math-stories", "science", "cs"];

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function bestBooksForSubjects(subjects, grade, limit) {
    var all = [];
    var BOOKS = window.RV_BOOKS || {};
    subjects.forEach(function (subject) {
      (BOOKS[subject] || []).forEach(function (b) {
        if (b.grade === grade) all.push(Object.assign({ subject: subject }, b));
      });
    });
    return shuffle(all).slice(0, limit || 6);
  }

  function bestBooksFor(grade, limit) {
    // kept for backward compatibility (not subject-aware); prefer
    // bestBooksForSubjects for anything shown to a student.
    var all = [];
    var BOOKS = window.RV_BOOKS || {};
    Object.keys(BOOKS).forEach(function (subject) {
      (BOOKS[subject] || []).forEach(function (b) {
        if (b.grade === grade) all.push(Object.assign({ subject: subject }, b));
      });
    });
    return shuffle(all).slice(0, limit || 6);
  }

  function renderRecommendedCard() {
    var result = loadResult();
    var card = document.getElementById("recommendedCard");
    if (!card) return;
    if (!result) {
      card.style.display = "none";
      return;
    }
    var reportedGrade = result.reportedGrade || result.primaryGrade;
    var readingBooks = bestBooksForSubjects(READING_GATED_SUBJECTS, result.primaryGrade, 3);
    var contentBooks = bestBooksForSubjects(CONTENT_GATED_SUBJECTS, reportedGrade, 3);
    var books = readingBooks.concat(contentBooks);
    if (!books.length) {
      card.style.display = "none";
      return;
    }
    card.style.display = "block";
    var gradeNote =
      reportedGrade === result.primaryGrade
        ? result.primaryGrade +
          " · " +
          result.primaryBand +
          '<span class="cn">' +
          gradeCN(result.primaryGrade) +
          " · " +
          bandCN(result.primaryBand) +
          "</span>"
        : "reading level " +
          result.primaryGrade +
          " (" +
          result.primaryBand +
          ") for stories · " +
          reportedGrade +
          " for Math/Science, matched to your grade" +
          '<span class="cn">阅读水平 ' +
          gradeCN(result.primaryGrade) +
          "（" +
          bandCN(result.primaryBand) +
          "）适用于故事类书籍 · 数学/科学按你的实际年级（" +
          gradeCN(reportedGrade) +
          "）推荐</span>";
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
      '<div class="section-title"><h2>Recommended for you</h2><p>' +
      (result.source === "lexile" ? "Based on your Lexile measure (" + result.lexile + "): " : "Based on your placement quiz result: ") +
      gradeNote +
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
