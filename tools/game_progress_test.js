/* node tools/game_progress_test.js : the crown rule of game-progress.js (one crown at a time, on different days, perfect runs only) */
var P = require("../site/game-progress.js")._pure, pass = 0, fail = 0;
function eq(a, b, what) { if (JSON.stringify(a) === JSON.stringify(b)) pass++; else { fail++; console.log("FAIL " + what + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); } }
var c = null;
eq(P.step(c, false, 10).c, 0, "a run with a mistake gives no crown");
c = P.step(c, true, 10); eq([c.c, c.won], [1, true], "first perfect run: bronze");
eq(P.step(c, true, 10).won, false, "the same day again: nothing more");
eq(P.isReady(c, 10), false, "silver is not ready the same day");
eq(P.isReady(c, 11), true, "silver is ready the next day");
c = P.step(c, true, 11); eq([c.c, c.t], [2, 11], "next day: silver");
eq(P.isReady(c, 13), false, "gold waits 3 days");
eq(P.step(c, true, 13).won, false, "two days later: not yet");
eq(P.step(c, false, 14).c, 2, "a run with a mistake keeps silver");
c = P.step(c, true, 14); eq(c.c, 3, "three days later: gold");
eq(P.step(c, true, 30).c, 3, "three is the most");
eq(P.nextDay(c), null, "nothing to wait for after gold");
console.log(pass + " passed, " + fail + " failed");
if (fail) process.exit(1);
