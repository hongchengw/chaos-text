# Task 08 — Background fill chaos

## Prerequisite
Tasks 01-06 complete, plus the security audit and the extreme-chaos randomization pass (see `changelog/CHANGELOG.md`). `renderDisplay` builds one `<span>` per character of the typed text into `#display`, each styled via `buildCharStyle()`/`styleToInline()` and idly wobbling via the `wobble` CSS animation.

## Goal
Beyond the existing centered `#display` line, duplicate the typed characters to tile the **entire screen** as a chaotic animated background layer — same "everything re-randomizes every keystroke" philosophy as `#display`, extended to cover the whole viewport. The background layer must never obstruct typing or reading the main line.

## Workflow requirements (do these, not just the code)
1. Create and work on a new branch: `feature/background-fill-chaos`. Do not commit this work directly to `main`.
2. When implementation is complete and verified, open a pull request from that branch back to `main` for human review. Do **not** merge it yourself — leave it open for the repo owner to review and merge.
3. Append a dated entry to `changelog/CHANGELOG.md` documenting what was built, the design decisions below, and how it was verified — match the style/detail level of the existing entries.
4. Write and run **multiple** tests (see Verify section) — this is a hard requirement, not optional polish.

## Files to modify
- `src/index.html`
- `src/style.css`
- `src/script.js`
- `tasks/tests/08-background-fill-chaos.test.js` (new)
- `changelog/CHANGELOG.md`

## Design decisions (already settled — do not re-litigate)
- **Density cap:** 150 fill characters max at any time (`MAX_FILL_CHARS = 150`), prioritizing performance on low-end/mobile devices over maximal screen coverage. Same rationale as `MAX_CHARS` (300) on the main text: every span is an `inline-block` element with an infinite CSS animation, so the compositor cost is ongoing, not one-time. See the 2026-07-24 security-audit changelog entry for the original benchmark data that motivated `MAX_CHARS`.
- **Layering:** the fill layer always renders **behind** `#typer`/`#display`, via `z-index` and `pointer-events: none`. It must never intercept clicks or visually cover the input/main text, no matter how dense it gets.

## Implementation

### `src/index.html`
Add a new `#fill` container. Since it's a purely decorative duplicate of text already exposed via `#typer`'s value (and already re-announced through `#display`'s presence), mark it `aria-hidden="true"` so screen readers don't read 150 duplicate characters:
```html
<div id="fill" aria-hidden="true"></div>
```
Place it as a sibling of `#display`, before or after — DOM order doesn't matter since positioning is fully controlled by CSS (`fixed`).

### `src/style.css`
```css
#fill {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

#typer,
#display,
#instructions {
  position: relative;
  z-index: 1;
}

@keyframes drift {
  0%   { transform: translate(0, 0) rotate(var(--base-rot, 0deg)) scale(var(--base-scale, 1)); }
  50%  { transform: translate(10px, -10px) rotate(calc(var(--base-rot, 0deg) + 15deg)) scale(calc(var(--base-scale, 1) * 1.1)); }
  100% { transform: translate(0, 0) rotate(var(--base-rot, 0deg)) scale(var(--base-scale, 1)); }
}

@keyframes spin {
  0%   { transform: rotate(var(--base-rot, 0deg)) scale(var(--base-scale, 1)); }
  100% { transform: rotate(calc(var(--base-rot, 0deg) + 360deg)) scale(var(--base-scale, 1)); }
}

#fill span {
  position: absolute;
  display: inline-block;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}
```
`drift` and `spin` join the existing `wobble` keyframes (already in `style.css`) as the pool of animations fill characters can be assigned.

### `src/script.js`
Add alongside the existing pure helpers:

- `function randomFillPosition()` — returns `{ top, left }`, each a number in `[0, 100]` (percent), representing where a fill character sits on screen. Pure, no DOM.
- `function randomAnimationName()` — returns one of `'wobble'`, `'drift'`, `'spin'`, chosen randomly. Pure.
- `const MAX_FILL_CHARS = 150;` — exported alongside `MAX_CHARS`.
- `function renderFill(text, fillEl)` — DOM-touching, mirrors `renderDisplay`'s structure:
  - Clear `fillEl.textContent = ''`.
  - If `text` is empty, return immediately (zero fill spans — no clutter on an empty field).
  - Use `[...text]` (code-point iteration, same surrogate-pair safety as `renderDisplay`) as the source alphabet.
  - Build exactly `Math.min(MAX_FILL_CHARS, ...)`-bounded spans by **cycling** through the code points (`chars[i % chars.length]`) until `MAX_FILL_CHARS` spans exist — this is what makes short input ("a") still fill the screen, not just long input.
  - For each span: `span.textContent = char`; style via `buildCharStyle()` (reuse as-is) plus `randomFillPosition()` (set as `top: X%; left: Y%;`) plus `randomAnimationName()` (set as `animation-name`) plus fresh `randomAnimationDelay()`/`randomAnimationDuration()` (reuse as-is). Assemble into `span.style.cssText`, following the same pattern `styleToInline` uses — either extend `styleToInline` to accept an optional animation-name/position override, or build the fill-specific cssText inline in `renderFill`. Prefer extending `styleToInline(style, opts)` with an optional `opts.animationName` (default `'wobble'`) and optional `opts.top`/`opts.left`, so both render paths share one code path instead of duplicating the CSS-string assembly.
  - Append each span to `fillEl`.
- Wire `renderFill` into the existing `input` listener next to `renderDisplay`:
  ```js
  typer.addEventListener('input', () => {
    renderDisplay(typer.value, display);
    renderFill(typer.value, fill);
  });
  ```
  (fetch `const fill = document.getElementById('fill');` alongside the existing `typer`/`display` lookups; guard identically — no-op if any element is missing.)
- Extend `module.exports` with `randomFillPosition`, `randomAnimationName`, `MAX_FILL_CHARS`, `renderFill`.

## Verify
Write `tasks/tests/08-background-fill-chaos.test.js` (node:test + jsdom), using the same CommonJS-compile workaround pattern as every existing file under `tasks/tests/` (see any existing test file for the exact boilerplate — `package.json` has `"type": "module"`, so script.js must be `_compile`d explicitly before its `module.exports` is usable). At minimum:

1. **Cap enforcement:** `renderFill('a', fillEl)` produces exactly `MAX_FILL_CHARS` spans (short input cycles to fill the cap).
2. **Cap enforcement, longer input:** `renderFill('a'.repeat(500), fillEl)` also produces exactly `MAX_FILL_CHARS` spans, never more.
3. **Position range:** every fill span's inline `top`/`left` parses as a percentage number within `[0, 100]`.
4. **Animation variety:** across one render's spans, assert every `animationName` is one of `wobble`/`drift`/`spin`, and not all spans share the same one (randomness sanity check, same style as the existing wobble-delay test in `tasks/tests/04-wobble-animation.test.js`).
5. **Re-render randomizes:** calling `renderFill('abc', fillEl)` twice produces at least one differing span style/position between the two renders.
6. **Empty input:** `renderFill('', fillEl)` produces zero spans.
7. **No injection:** reuse a subset of the adversarial payloads from `tasks/tests/07-input-hardening.test.js` (e.g. the script-tag and style-breakout ones) through `renderFill`, and assert `fillEl.innerHTML` never contains `<script`, `onerror`, `javascript:`, or `expression(`.
8. **Structural/CSS check:** read `src/style.css` and assert it contains `pointer-events: none` scoped near `#fill` (simple regex/string check, same light-touch style as the structural checks in `tasks/tests/05-page-polish-and-readme.test.js`).

Run `node --test` (full suite) and confirm **all** tests pass — the pre-existing 38 plus the new ones from this task, zero regressions.

## When done
1. Confirm the full test suite passes (report the exact N/N count).
2. Manually sanity-check in a browser if possible: type a short string, confirm the background fills with duplicated animated characters behind the main line, confirm the input stays clickable/typeable, confirm clearing the input clears the fill layer too.
3. Append a dated entry to `changelog/CHANGELOG.md` (per workflow requirement #3 above).
4. Commit on the `feature/background-fill-chaos` branch and push it.
5. Open a pull request to `main` and stop — leave it for review, do not merge.
