# Chaos Text — Project Spec

## What it is
A zero-purpose, hilarious typing toy. As the user types into a text input, every character currently on screen gets re-randomized in real time — font family, color, rotation, and scale — so the whole line "goes haywire" on every keystroke, not just the newest character. Characters also keep gently wobbling on their own via CSS animation, even when the user stops typing.

## Architecture
Pure static site, no build step, no runtime dependencies:

- `index.html` — page skeleton. `#typer` is the actual `<input>` the user types into; `#display` is the `<div>` that gets rebuilt on every keystroke to show the chaotic rendering.
- `style.css` — dark theme, centered layout, and the `@keyframes wobble` animation that characters use to idly oscillate around their randomized base rotation/scale.
- `script.js` — all logic. Written as small pure functions (no DOM access) plus a thin DOM-wiring layer, and exported via a dual CommonJS/browser pattern so the same file works as a plain `<script>` tag in the browser *and* is `require()`-able from Node tests.

## Key functions (`script.js`)
- `randomFontFamily()` — picks a random entry from `FONT_POOL` (generic families like `serif`/`monospace` plus a few common installed fonts; no external font loading).
- `randomColor()` — random `hsl(...)` string (hue 0–360, saturation 70–100%, lightness 55–80%) tuned to stay readable on the dark background.
- `randomRotation()` — random degrees in [-35, 35].
- `randomScale()` — random scale factor in [0.7, 1.8].
- `randomAnimationDelay()` / `randomAnimationDuration()` — random timing (0–2s delay, 1.2–3s duration) so each character's wobble animation is out of sync with the others.
- `buildCharStyle()` — bundles the above into one `{ fontFamily, color, rotation, scale }` object per character.
- `styleToInline(style)` — turns a `buildCharStyle()` result into a CSS text string (`element.style.cssText`), setting `--base-rot`/`--base-scale` custom properties that the `wobble` keyframes animate around, plus a fresh random animation delay/duration.
- `renderDisplay(text, displayEl)` — clears `displayEl` and rebuilds it as one `<span>` per character of `text`, calling `buildCharStyle()`/`styleToInline()` fresh for *every* span on *every* call — this is what makes the whole line re-randomize on each keystroke, not just the newest character. Wired to `#typer`'s `input` event.

## Testing
`node --test` runs the full suite (25 tests) from `tasks/tests/*.test.js`, covering randomization ranges/format, rendering behavior (span count, backspace, spaces), wobble animation properties, and structural regression checks on the HTML/CSS/README. `jsdom` is the only devDependency, used to simulate a DOM in Node.

Note: `package.json` has `"type": "module"`, so a plain `require('../../script.js')` from a test would see an empty ES-module namespace instead of the CommonJS exports. Every test file works around this by using Node's `node:module` `Module` class to explicitly `_compile` `script.js` as CommonJS before requiring it — see any file under `tasks/tests/` for the pattern.

## How to run
Open `index.html` directly in a browser, or serve it statically (`npx http-server`). No build step required.

## Project history
Built via a task-per-file workflow: `tasks/01-scaffold-html.md` through `tasks/06-verification-pass.md` are the original implementation specs, each executed by a subagent, test-verified, and committed/pushed individually. See `CHANGELOG.md` for the detailed, dated history of what each task changed and how it was verified — this file intentionally doesn't duplicate that log.

## Current status
Feature-complete: all six planned tasks are implemented, and the full automated suite passes (25/25). One known gap noted in `CHANGELOG.md`'s task-06 entry: an actual interactive browser walkthrough (typing in a live tab, watching the wobble, checking DevTools) was never performed by an agent in this project's history — only inferred from automated jsdom-based tests. Worth doing once by hand if you're picking this project back up.
