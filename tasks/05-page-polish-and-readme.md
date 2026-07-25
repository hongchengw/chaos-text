# Task 05 — Page polish + README

## Prerequisite
Tasks 01-04 complete: the app is functionally done (typing renders chaotic, wobbling characters).

## Goal
Visual polish and documentation — no behavioral changes to the chaos logic.

## Files to modify
- `style.css`
- `index.html` (copy tweaks only, e.g. instruction wording)
- `README.md`

## Implementation
`style.css` polish (adjust to taste, keep it simple):
- Center `#display` with a max-width and generous padding so long lines wrap instead of overflowing.
- Style `#typer` to feel like a deliberate input, not an afterthought — e.g. a simple underline/border, transparent-ish background, matching dark theme, decent font-size, focus outline visible for accessibility.
- Style `#instructions` as small, muted, unobtrusive text above the input.
- Ensure `#display` has `word-break: break-word` or similar so long unbroken input doesn't blow out the layout.

`index.html`: tighten the instruction copy if needed (e.g. "Type. Watch it fall apart." → keep or adjust for clarity), no structural changes.

`README.md`: replace the placeholder `# Chaos Text` with:
- A one-paragraph description of what the app does (every keystroke randomizes font/color/rotation/scale of every character; characters keep wobbling on their own).
- Run instructions: "Open `index.html` directly in a browser, or serve statically (e.g. `npx http-server`)."
- A one-line note on running tests: `npm install && node --test`.

## Verify
Write `tasks/tests/05-page-polish-and-readme.test.js` using `node:test`/`node:assert` (plain string/regex checks, no jsdom needed):
- `README.md` contains more than just the `# Chaos Text` heading (length check, e.g. `> 200` chars) and contains the substring `index.html`.
- `index.html` still contains `id="typer"` and `id="display"` (regression check that polish didn't break structure).
- `style.css` still contains `@keyframes wobble` (regression check).

Run with: `node --test` (full suite) and confirm everything passes.

## When done
1. Confirm all tests pass (full suite).
2. Append an entry to `CHANGELOG.md`.
3. Commit and push to the `oriin` remote on the current branch.
