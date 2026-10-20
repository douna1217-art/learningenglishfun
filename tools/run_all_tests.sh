#!/bin/sh
# Runs every check for the site. The browser check needs Playwright (npm i -D playwright && npx playwright install chromium);
# without it that one is skipped and the rest still run.
cd "$(dirname "$0")/.." || exit 1
fail=0
for t in sightwords_test badges_test state_sync_test; do
  printf "%s: " "$t"
  node "tools/$t.js" 2>&1 | tail -1
  node "tools/$t.js" >/dev/null 2>&1 || fail=1
done
if node -e 'require.resolve(process.env.PLAYWRIGHT || "playwright")' >/dev/null 2>&1; then
  printf "stage_games_check: "
  node tools/stage_games_check.js 2>&1 | tail -1
  node tools/stage_games_check.js >/dev/null 2>&1 || fail=1
else
  echo "stage_games_check: skipped (Playwright is not installed)"
fi
exit $fail
