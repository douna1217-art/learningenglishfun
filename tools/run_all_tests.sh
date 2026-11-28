#!/bin/sh
# Runs every check for the site (the same ones GitHub runs on each push, see .github/workflows/tests.yml).
#   sh tools/run_all_tests.sh
# jsdom + acorn (for the account, old-browser and book-page checks) and Playwright with Chromium (for the browser check) are installed with
#   npm i -D jsdom acorn playwright && npx playwright install chromium
# Without them those checks are skipped and the rest still run.
cd "$(dirname "$0")/.." || exit 1
fail=0
# every check has a time limit (seconds), so a stuck one fails instead of hanging the run
LIMIT=${TEST_LIMIT:-240}
lim() {
  if command -v timeout >/dev/null 2>&1; then timeout "$LIMIT" "$@"
  else perl -e 'alarm shift; exec @ARGV or die "cannot run $ARGV[0]"' "$LIMIT" "$@"; fi
}
said() {   # name, exit code, output
  if [ "$2" -eq 124 ] || [ "$2" -eq 142 ]; then printf "%s: TIMED OUT after %ss\n" "$1" "$LIMIT"
  else printf "%s: %s\n" "$1" "$(printf "%s" "$3" | tail -1)"; fi
  [ "$2" -eq 0 ] || fail=1
}
run() {
  out=$(lim node "tools/$1.js" 2>&1)
  said "$1" $? "$out"
}
for t in next_book_test first_visit_test report_card_test subject_outfits_test weekly_themes_test book_finder_test parent_report_test sightwords_test badges_test state_sync_test error_report_test festival_test daily_goals_test game_progress_test; do run $t; done
out=$(lim python3 tools/site_audit_test.py 2>&1); said site_audit_test $? "$out"
out=$(lim python3 tools/revoice_pages_test.py 2>&1); said revoice_pages_test $? "$out"
out=$(lim python3 tools/fix_pauses_test.py 2>&1); said fix_pauses_test $? "$out"
if node -e 'require.resolve("jsdom");require.resolve("acorn")' >/dev/null 2>&1; then
  for t in account_test legacy_syntax_check book_load_test; do run $t; done
else
  echo "account_test, legacy_syntax_check, book_load_test: skipped (jsdom / acorn are not installed)"
fi
if node -e 'require.resolve(process.env.PLAYWRIGHT || "playwright")' >/dev/null 2>&1; then
  run stage_games_check
else
  echo "stage_games_check: skipped (Playwright is not installed)"
fi
[ $fail -eq 0 ] && echo "all checks passed" || echo "SOME CHECKS FAILED"
exit $fail
