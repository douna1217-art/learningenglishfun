#!/bin/sh
# Runs every check for the site (the same ones GitHub runs on each push, see .github/workflows/tests.yml).
#   sh tools/run_all_tests.sh
# jsdom + acorn (for the account, old-browser and book-page checks) and Playwright with Chromium (for the browser check) are installed with
#   npm i -D jsdom acorn playwright && npx playwright install chromium
# Without them those checks are skipped and the rest still run.
cd "$(dirname "$0")/.." || exit 1
fail=0
run() {
  out=$(node "tools/$1.js" 2>&1)
  code=$?
  printf "%s: %s\n" "$1" "$(printf "%s" "$out" | tail -1)"
  [ $code -eq 0 ] || fail=1
}
for t in sightwords_test badges_test state_sync_test error_report_test festival_test; do run $t; done
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
