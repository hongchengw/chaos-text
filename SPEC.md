# Chaos Text — Project Spec

## What it is
A zero-purpose, hilarious typing toy. As the user types into a text input, every character currently on screen gets re-randomized in real time — font family, color, rotation, and scale — so the whole line "goes haywire" on every keystroke, not just the newest character. Characters also keep gently wobbling on their own via CSS animation, even when the user stops typing.

## Architecture
Pure static site, no build step, no runtime dependencies. All source files live in `src/`:

- `src/index.html` — page skeleton. `#typer` is the actual `<input>` the user types into; `#display` is the `<div>` that gets rebuilt on every keystroke to show the chaotic rendering.
- `src/style.css` — dark theme, centered layout, and the `@keyframes wobble` animation that characters use to idly oscillate around their randomized base rotation/scale.
- `src/script.js` — all logic. Written as small pure functions (no DOM access) plus a thin DOM-wiring layer, and exported via a dual CommonJS/browser pattern so the same file works as a plain `<script>` tag in the browser *and* is `require()`-able from Node tests.

## Key functions (`src/script.js`)
- `randomFontFamily()` — picks a random entry from `FONT_POOL` (generic families like `serif`/`monospace` plus a few common installed fonts; no external font loading).
- `randomColor()` — random `hsl(...)` string (hue 0–360, saturation 70–100%, lightness 55–80%) tuned to stay readable on the dark background.
- `randomRotation()` — random degrees in [-35, 35].
- `randomScale()` — random scale factor in [0.7, 1.8].
- `randomAnimationDelay()` / `randomAnimationDuration()` — random timing (0–2s delay, 1.2–3s duration) so each character's wobble animation is out of sync with the others.
- `buildCharStyle()` — bundles the above into one `{ fontFamily, color, rotation, scale }` object per character.
- `styleToInline(style)` — turns a `buildCharStyle()` result into a CSS text string (`element.style.cssText`), setting `--base-rot`/`--base-scale` custom properties that the `wobble` keyframes animate around, plus a fresh random animation delay/duration.
- `MAX_CHARS` — hard cap (300) on how many characters `renderDisplay` will draw, kept in sync with the `maxlength` attribute on `#typer`. See the security-audit entry in `changelog/CHANGELOG.md` for why.
- `renderDisplay(text, displayEl)` — clears `displayEl` and rebuilds it as one `<span>` per character of `text` (truncated to `MAX_CHARS`), calling `buildCharStyle()`/`styleToInline()` fresh for *every* span on *every* call — this is what makes the whole line re-randomize on each keystroke, not just the newest character. Wired to `#typer`'s `input` event.

## Testing
`npm test` (`node --test`) runs the full suite (38 tests) from `tasks/tests/*.test.js`, covering randomization ranges/format, rendering behavior (span count, backspace, spaces), wobble animation properties, structural regression checks on the HTML/CSS/README, and the input-hardening checks added by the security audit (length cap, injection resistance, no external resource loading). `jsdom` is the only devDependency, used to simulate a DOM in Node.

Note: `package.json` has `"type": "module"`, so a plain `require('../../src/script.js')` from a test would see an empty ES-module namespace instead of the CommonJS exports. Every test file works around this by using Node's `node:module` `Module` class to explicitly `_compile` `script.js` as CommonJS before requiring it — see any file under `tasks/tests/` for the pattern.

## How to run
Open `src/index.html` directly in a browser, or serve it statically (`npx http-server`, then visit `/src/index.html`). No build step required.

## Deployment
`vercel.json` makes the repo deployable to Vercel with no configuration: `outputDirectory` is `src` (so the app is served at `/`, not `/src/index.html`), and both `buildCommand` and `installCommand` are empty because there is no build and `jsdom` is a test-only devDependency that must not ship. `.vercelignore` keeps `tasks/`, `changelog/`, and docs out of the upload.

Deliberately **not** installed: `@vercel/analytics` and Speed Insights. Both inject a runtime script and make network calls, which would break the "no third-party loading, everything happens client-side" property that `tasks/tests/07-input-hardening.test.js` asserts.

## Project history
Built via a task-per-file workflow: `tasks/01-scaffold-html.md` through `tasks/06-verification-pass.md` are the original implementation specs, each executed by a subagent, test-verified, and committed/pushed individually. See `changelog/CHANGELOG.md` for the detailed, dated history of what each task changed and how it was verified — this file intentionally doesn't duplicate that log.

## Current status
Feature-complete: all six planned tasks are implemented, the security audit from `HANDOFF-SECURITY.md` is closed out, and the full automated suite passes (38/38).

Two known gaps, both requiring a human:
- **No live browser walkthrough has ever been done** in this project's history — every behavioral claim comes from jsdom. Noted originally in the task-06 changelog entry and still true after the audit. Worth doing once by hand.
- **The Vercel deploy has not been executed.** `vercel.json` is validated as JSON and the routing was verified by serving `src/` as a docroot, but `npx vercel build` requires login and was never run, so the deploy itself is unconfirmed.
