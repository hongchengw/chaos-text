# Task 06 — Final verification pass

## Prerequisite
Tasks 01-05 complete: app is feature-complete and polished.

## Goal
Confirm the whole app works end-to-end, both via the automated test suite and a manual browser smoke check, and close out the CHANGELOG.

## Steps
1. Run the full automated suite: `node --test` from the repo root. All tests from tasks 01-05 must pass.
2. Manual smoke check — open `index.html` in a real browser (double-click the file, or `npx http-server` and visit the served URL) and verify this checklist:
   - [ ] Typing in the input renders each character in `#display`.
   - [ ] Every keystroke re-randomizes font/color/rotation/scale for **all** visible characters, not just the newest one.
   - [ ] Backspace removes the last character cleanly.
   - [ ] Space renders correctly (doesn't collapse or break layout).
   - [ ] Characters keep subtly wobbling/animating on their own when you stop typing.
   - [ ] No errors appear in the browser console.
   - [ ] No network requests fire beyond the initial page load (Network tab, no external font/API calls) — confirms the app is fully offline-capable.
3. Record the manual checklist result (pass/fail per item) in the final `CHANGELOG.md` entry.

## When done
1. Append the final summary entry to `CHANGELOG.md`, referencing this task file, summarizing the whole project as complete, and including the manual checklist results.
2. Commit and push to the `oriin` remote on the current branch.
