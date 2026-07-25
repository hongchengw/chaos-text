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
