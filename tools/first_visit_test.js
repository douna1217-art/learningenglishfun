// node tools/first_visit_test.js
var FV = require("../site/first-visit.js"), n = 0, bad = 0;
function ok(c, m) { n++; if (!c) { bad++; console.log("FAIL: " + m); } }
function rd(o) { return function (k, d) { return o[k] === undefined ? d : o[k]; }; }
ok(FV.isNew(rd({})), "empty is new");
ok(!FV.isNew(rd({ lef_pet_v1: { type: "cat" } })), "pet");
ok(FV.isNew(rd({ lef_pet_v1: { type: null } })), "pet without type is new");
ok(!FV.isNew(rd({ lef_opens_v1: [{ slug: "a" }] })), "opened a book");
ok(!FV.isNew(rd({ lef_hist_v1: [{ slug: "a" }] })), "history");
ok(!FV.isNew(rd({ lef_books_v1: { a: { fin: 1 } } })), "finished");
ok(!FV.isNew(rd({ lef_books_v1: { a: { listen: 1 } } })), "listened");
ok(FV.isNew(rd({ lef_books_v1: { a: { fin: 0, listen: 0, vocab: 0, quiz: 0 } } })), "zeros are still new");
ok(!FV.isNew(rd({ lef_words_v1: { words: { cat: {} } } })), "sight words");
ok(FV.isNew(rd({ lef_words_v1: { words: {} } })), "empty sight words is new");
ok(FV.render() === false, "no document: no render");
console.log(n + " checks, " + bad + " failed"); process.exit(bad ? 1 : 0);
