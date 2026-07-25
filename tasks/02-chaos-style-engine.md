# Task 02 — Chaos style engine

## Prerequisite
Task 01 is complete: `index.html`, `style.css`, `script.js`, `package.json` exist.

## Goal
Implement pure, testable randomization functions in `script.js` that later tasks will use to style each character.

## Files to modify
- `script.js`

## Implementation
Add to `script.js` (keep these as plain functions with no DOM dependency, so they're easy to unit test):

- `const FONT_POOL = [...]` — offline-safe families: `'serif'`, `'sans-serif'`, `'monospace'`, `'cursive'`, `'fantasy'`, `'Georgia, serif'`, `'"Comic Sans MS", cursive'`, `'Impact, sans-serif'`, `'"Courier New", monospace'`, `'"Times New Roman", serif'`.
- `function randomFontFamily()` — returns a random entry from `FONT_POOL`.
- `function randomColor()` — returns an `hsl(h, s%, l%)` string with `h` random 0-360, `s` random 70-100, `l` random 55-80 (keeps it readable on a dark background).
- `function randomRotation()` — returns a number in degrees, random between -35 and 35.
- `function randomScale()` — returns a number, random between 0.7 and 1.8.
- `function buildCharStyle()` — calls the above and returns an object `{ fontFamily, color, rotation, scale }` (later tasks turn this into inline CSS/transform text — don't build the string here, keep it structured so tests can assert on individual fields).

At the bottom of `script.js`, add a dual-environment export so the functions are usable both in the browser (as globals, since it's loaded via a plain `<script>` tag with no bundler) and importable from Node tests:
```js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { randomFontFamily, randomColor, randomRotation, randomScale, buildCharStyle, FONT_POOL };
}
```

## Verify
Write `tasks/tests/02-chaos-style-engine.test.js` using `node:test`/`node:assert`. Import the functions via `require('../../script.js')`. Run each function 200+ times in a loop and assert:
- `randomFontFamily()` always returns a value present in `FONT_POOL`.
- `randomColor()` matches `/^hsl\(\d+(\.\d+)?, \d+(\.\d+)?%, \d+(\.\d+)?%\)$/` and the h/s/l numbers fall within the documented ranges.
- `randomRotation()` is a number within [-35, 35].
- `randomScale()` is a number within [0.7, 1.8].
- `buildCharStyle()` returns an object with all four fields populated and internally consistent with the above ranges.
- Across many calls, outputs are not all identical (sanity check that `Math.random` is actually being used, not a hardcoded value).

Run with: `node --test tasks/tests/02-chaos-style-engine.test.js` and confirm it passes.

## When done
1. Confirm the test passes.
2. Append an entry to `CHANGELOG.md`.
3. Commit and push to the `oriin` remote on the current branch.
