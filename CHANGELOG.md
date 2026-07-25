# Changelog

## 2026-07-24 — tasks/01-scaffold-html.md
- Scaffolded static app skeleton: `index.html` (#typer input, #display div), `style.css` (dark centered layout), `script.js` (stub), and root `package.json`.
- Verified: `node --test tasks/tests/01-scaffold-html.test.js` — passed

## 2026-07-24 — tasks/02-chaos-style-engine.md
- Implemented the chaos style engine in `script.js`: `FONT_POOL`, `randomFontFamily()`, `randomColor()`, `randomRotation()`, `randomScale()`, and `buildCharStyle()` — pure, DOM-free functions with a dual-environment (CommonJS/browser) export block.
- Added `tasks/tests/02-chaos-style-engine.test.js` covering value ranges/format and a non-determinism sanity check across 200+ iterations per function.
- Verified: `node --test` (full suite) — 10/10 passed, including the pre-existing 01-scaffold-html regression test.

## 2026-07-24 — tasks/03-render-and-input-wiring.md
- Added `styleToInline(style)` and `renderDisplay(text, displayEl)` to `script.js`: every keystroke rebuilds `#display` as one `<span>` per character, re-randomizing the style of *every* character (not just the newest one), including a space-safe span (`display: inline-block; white-space: pre;`) so spaces don't collapse.
- Wired up a guarded `DOMContentLoaded` listener in `script.js` that binds `#typer`'s `input` event to `renderDisplay`, so the wiring is a no-op (and safe to `require()`) outside a browser/DOM environment.
- Extended the `module.exports` block to also export `renderDisplay` and `styleToInline`.
- Added `jsdom` as a devDependency and wrote `tasks/tests/03-render-and-input-wiring.test.js`, covering span-count-matches-text-length, style re-randomization across repeated renders, backspace shrinking the span count, and the space-character edge case.
- Verified: `node --test` (full suite) — 15/15 passed, including the pre-existing 01 and 02 regression tests.

## 2026-07-24 — tasks/04-wobble-animation.md
- Added `@keyframes wobble` and `#display span` base animation rules to `style.css`, animating `transform` around each character's randomized base rotation/scale via the `--base-rot`/`--base-scale` CSS custom properties, so characters keep gently wobbling on their own between keystrokes.
- Added `randomAnimationDelay()` (0-2s) and `randomAnimationDuration()` (1.2-3s) to `script.js` and exported them; updated `styleToInline(style)` to set `--base-rot`, `--base-scale`, `animation-name: wobble`, `animation-delay`, and `animation-duration` instead of the old direct `transform: rotate(...) scale(...)`.
- Updated `tasks/tests/03-render-and-input-wiring.test.js`'s `styleToInline` assertions to check for the new `--base-rot`/`--base-scale` custom properties instead of the removed literal `rotate(...) scale(...)` transform, since Task 04 intentionally moved that responsibility to the CSS keyframes.
- Added `tasks/tests/04-wobble-animation.test.js`, covering: every rendered span has `animationName === 'wobble'`; every span has non-empty `animationDelay`/`animationDuration`; delays differ across characters in one render (not a shared value); and `randomAnimationDelay()`/`randomAnimationDuration()` stay within their documented ranges across 150+ samples each.
- Verified: `node --test` (full suite) — 20/20 passed, including the pre-existing 01-03 regression tests.

## 2026-07-24 — tasks/05-page-polish-and-readme.md
- Polished `style.css` (no logic changes): centered/constrained `#display` with `max-width`/padding and `word-break: break-word`/`overflow-wrap: break-word` so long input wraps instead of overflowing; restyled `#typer` as an underlined, transparent-background input matching the dark theme with a visible `:focus` outline; restyled `#instructions` as small, muted, centered text.
- Tightened `index.html`'s instruction copy ("Start typing below — every keystroke falls apart.") without touching the `#typer`/`#display` structure.
- Replaced the `README.md` placeholder with a description of the app, run instructions (open `index.html` directly, or `npx http-server`), and a test-running note (`npm install && node --test`).
- Added `tasks/tests/05-page-polish-and-readme.test.js`, covering: `README.md` length (>200 chars) and mention of `index.html`; `index.html` still has `id="typer"`/`id="display"`; `style.css` still has `@keyframes wobble`.
- Verified: `node --test` (full suite) — 25/25 passed, including all prior regression tests.
