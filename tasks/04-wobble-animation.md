# Task 04 — Wobble animation

## Prerequisite
Tasks 01-03 complete: `renderDisplay` builds spans with randomized inline styles per keystroke.

## Goal
Make characters keep subtly wobbling on their own even when the user stops typing, using CSS animation with per-character randomized timing so they don't move in sync.

## Files to modify
- `style.css`
- `script.js`

## Implementation
`style.css`: add
```css
@keyframes wobble {
  0%   { transform: translateY(0) rotate(var(--base-rot, 0deg)) scale(var(--base-scale, 1)); }
  50%  { transform: translateY(-4px) rotate(calc(var(--base-rot, 0deg) + 6deg)) scale(calc(var(--base-scale, 1) * 1.05)); }
  100% { transform: translateY(0) rotate(var(--base-rot, 0deg)) scale(var(--base-scale, 1)); }
}
#display span {
  display: inline-block;
  animation-name: wobble;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}
```
Using CSS custom properties (`--base-rot`, `--base-scale`) lets the wobble animate *around* each character's randomized base rotation/scale rather than overriding it.

`script.js`: 
- Add `function randomAnimationDelay()` — random seconds between 0 and 2, returned as a string like `'0.73s'`.
- Add `function randomAnimationDuration()` — random seconds between 1.2 and 3, returned as a string like `'2.1s'`.
- Update `styleToInline(style)` (from Task 03) to also set `--base-rot: ${style.rotation}deg; --base-scale: ${style.scale}; animation-delay: ${randomAnimationDelay()}; animation-duration: ${randomAnimationDuration()};` alongside the existing `font-family`/`color` properties. Drop the direct `transform: rotate(...) scale(...)` from Task 03 since the keyframes now own `transform` via the custom properties.
- Export the two new random functions alongside the existing ones.

## Verify
Extend `tasks/tests/03-render-and-input-wiring.test.js` or add `tasks/tests/04-wobble-animation.test.js` (either is fine — pick whichever keeps things clearest) using `node:test` + `jsdom`:
- Call `renderDisplay('hello', displayEl)` and assert every span's `style.animationName === 'wobble'`.
- Assert every span has non-empty `style.animationDelay` and `style.animationDuration`.
- Across the 5 spans in one render, assert not all `animationDelay` values are identical (proves randomness per character, not a single shared value).
- Assert `randomAnimationDelay()` parses to a number in [0, 2] and `randomAnimationDuration()` parses to a number in [1.2, 3] across 100+ samples.

Run with: `node --test` (running the whole suite) and confirm everything still passes, including earlier tasks' tests (regression check).

## When done
1. Confirm all tests pass (full suite, not just the new one).
2. Append an entry to `CHANGELOG.md`.
3. Commit and push to the `oriin` remote on the current branch.
