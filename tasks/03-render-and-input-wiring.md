# Task 03 — Render + input wiring

## Prerequisite
Tasks 01-02 complete: scaffold exists, `buildCharStyle()` and friends exist in `script.js`.

## Goal
Rebuild the `#display` element as one `<span>` per character on every keystroke, with a freshly randomized style applied to **every** span each time (not just the newest character) — this is the "whole line goes haywire" behavior the app is named for.

## Files to modify
- `script.js`

## Implementation
Add to `script.js`:
- `function styleToInline(style)` — takes the `{ fontFamily, color, rotation, scale }` object from `buildCharStyle()` and returns a CSS text string, e.g. `` `font-family: ${style.fontFamily}; color: ${style.color}; transform: rotate(${style.rotation}deg) scale(${style.scale});` ``. Handle the empty-string edge case for a space character (still needs a span so layout/backspace works, but render `&nbsp;`-equivalent via `white-space: pre` on the span or `display:inline-block`).
- `function renderDisplay(text, displayEl)` — clears `displayEl`, then for each character in `text` creates a `<span>` (in Node/jsdom or the browser — use `document.createElement('span')`), sets `span.textContent = char`, sets `span.style.cssText = styleToInline(buildCharStyle())`, and appends it to `displayEl`. Returns nothing (mutates the DOM) but should be pure enough to test given a DOM element.
- Wire it up: on `DOMContentLoaded` (guard for browser-only — `if (typeof document !== 'undefined' && document.getElementById)`), grab `#typer` and `#display`, add an `input` event listener on `#typer` that calls `renderDisplay(typer.value, display)`.
- Extend the module export from Task 02 to also export `renderDisplay` and `styleToInline`.

Note: `document` won't exist when this file is `require()`d directly under plain Node — guard any top-level DOM access so `require()` in a test doesn't throw. jsdom (used in the test) provides a `document` global when the test sets it up (see Verify).

## Verify
Add `jsdom` as a devDependency in `package.json` (`npm install --save-dev jsdom` or hand-edit + `npm install`). Write `tasks/tests/03-render-and-input-wiring.test.js` using `node:test` + `jsdom`:
- Create a `new JSDOM('<div id="display"></div>')`, get its `document`, grab the div.
- Call `renderDisplay('abc', displayEl)` and assert `displayEl.children.length === 3` and each child's `textContent` matches the corresponding character.
- Call `renderDisplay('abc', displayEl)` a second time and assert that at least one span's `style.cssText` differs from the first render (proves re-randomization happens on every call, not just for new characters).
- Call `renderDisplay('ab', displayEl)` (simulating backspace) and assert `displayEl.children.length === 2`.
- Call `renderDisplay('a b', displayEl)` and assert a span exists for the space character (length stays correct, doesn't collapse).

Run with: `node --test tasks/tests/03-render-and-input-wiring.test.js` and confirm it passes.

## When done
1. Confirm the test passes.
2. Append an entry to `CHANGELOG.md`.
3. Commit and push to the `oriin` remote on the current branch.
