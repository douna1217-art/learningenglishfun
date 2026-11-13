/* Next-book choices for the "book finished" screen: one more of the same kind, and one from a subject the child reads less.
   Pure functions (also used by the node test). Grade is the difficulty unit; finished books are never offered again.
   Written for old Android WebViews: no optional chaining, no spread, no let/const.
   中文说明：读完一本书后给两个选择：同类再来一本，或者换个读得少的科目；都在同年级、没读过的书里选。 */
(function (root) {
  "use strict";

  var GRADES = ["Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

  function rank(g) {
    return GRADES.indexOf(g);
  }

  // cur: the book just finished; all: the catalog in shelf order;
  // ctx: {isFin(slug), isOpened(slug), day: a day number used to rotate ties}
  function pick(cur, all, ctx) {
    var fin = ctx.isFin || function () { return false; },
      opened = ctx.isOpened || function () { return false; },
      day = ctx.day || 0,
      cand = all.filter(function (b) {
        return b.slug !== cur.slug && !fin(b.slug);
      });
    function inGrade(g, subject, sameSubject) {
      return cand.filter(function (b) {
        return b.grade === g && (sameSubject ? b.subject === subject : b.subject !== subject);
      });
    }
    // unopened books first, then shelf order; for the same subject start after the book just read
    function ordered(list, afterSlug) {
      var idx = -1,
        i;
      if (afterSlug)
        for (i = 0; i < all.length; i++)
          if (all[i].slug === afterSlug) idx = i;
      var pos = {},
        k;
      for (k = 0; k < all.length; k++) pos[all[k].slug] = k;
      var after = list.filter(function (b) { return pos[b.slug] > idx; }),
        before = list.filter(function (b) { return pos[b.slug] <= idx; }),
        seq = after.concat(before);
      return seq
        .filter(function (b) { return !opened(b.slug); })
        .concat(seq.filter(function (b) { return opened(b.slug); }));
    }

    var g = cur.grade,
      more = null,
      harder = false,
      list = ordered(inGrade(g, cur.subject, true), cur.slug);
    if (list.length) more = list[0];
    else {
      var up = GRADES[rank(g) + 1];
      if (up) {
        list = ordered(inGrade(up, cur.subject, true), null);
        if (list.length) {
          more = list[0];
          harder = true;
        }
      }
    }

    // a different subject: the one the child has finished the fewest books in, ties rotate with the day
    var finCount = {},
      subs = [],
      i;
    all.forEach(function (b) {
      if (subs.indexOf(b.subject) < 0) subs.push(b.subject);
      if (fin(b.slug)) finCount[b.subject] = (finCount[b.subject] || 0) + 1;
    });
    var others = subs.filter(function (s) {
        return s !== cur.subject && inGrade(g, cur.subject, false).some(function (b) { return b.subject === s; });
      }),
      fresh = null;
    others.sort(function (a, b) {
      var d = (finCount[a] || 0) - (finCount[b] || 0);
      return d !== 0 ? d : ((subs.indexOf(a) + day) % subs.length) - ((subs.indexOf(b) + day) % subs.length);
    });
    if (others.length) {
      var l2 = ordered(
        inGrade(g, cur.subject, false).filter(function (b) { return b.subject === others[0]; }),
        null
      );
      if (l2.length) fresh = l2[0];
    }
    return { more: more, harder: harder, fresh: fresh };
  }

  var api = { pick: pick, GRADES: GRADES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.NextBook = api;
})(typeof window !== "undefined" ? window : this);
