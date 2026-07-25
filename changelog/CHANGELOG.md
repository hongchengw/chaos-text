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

## 2026-07-24 — tasks/06-verification-pass.md
- Ran the full automated suite from repo root: `node --test` — **25/25 passed**, 0 failures, 0 regressions across tasks 01-05.
- Served the app statically (`npx http-server -p 8934 -c-1`) and confirmed `index.html`, `script.js` (95 lines), and `style.css` (contains `@keyframes wobble`) are all served correctly with no build step.
- Manual browser smoke checklist (in-session browser automation was unavailable — Chrome extension not connected this session):
  - [x] Automated equivalents confirmed via test suite: per-character span rendering, full re-randomization of every visible character on each keystroke, backspace shrinking span count, space character handled without collapsing, wobble animation applied with per-character randomized delay/duration, no shared/identical randomization across characters.
  - [ ] Visual/interactive confirmation (actually typing in a live browser tab, watching the wobble, checking DevTools console/network tabs) — **not performed by the agent this session**; recommend the user open `index.html` directly (or via `npx http-server`) and eyeball it once. No external resources are referenced anywhere in `index.html`/`style.css`/`script.js` (no `<link>`/`<script src>`/`fetch`/`@import` pointing off-page), so no network requests are expected beyond the initial load.
- **Project status: feature-complete.** All six planned tasks (scaffold, chaos style engine, render/input wiring, wobble animation, polish/README, verification) are implemented, tested, and pushed to `oriin/main`.

## 2026-07-24 — security audit (`HANDOFF-SECURITY.md`) + Vercel deploy

### Audit results

Two of the three concerns raised in the handoff did **not** reproduce; they were already safe. One was a real defect.

**No injection — verified by fuzzing, not assumed.** `renderDisplay` was driven through jsdom with ten adversarial inputs: `<script>` tags, a CSS-breakout string (`a; background:url(javascript:alert(1)); x:"`), an attribute-breakout string (`";}</style><img src=x onerror=alert(1)>`), `expression()`, zero-width and RTL-override characters, NULL and control bytes, stacked combining marks, a ZWJ emoji sequence, and a lone surrogate. Zero leaks in all ten cases — nothing reached an attribute or a style value. `span.textContent` plus a `cssText` assembled only from `buildCharStyle()` output holds up. This is now locked in by regression tests rather than left to inspection.

**Offline-safe — confirmed.** No external `<link>`, `<script src>`, `@import`, `fetch`, `XMLHttpRequest`, `sendBeacon`, or `WebSocket` anywhere in `src/`. `npm audit`: 0 vulnerabilities (`jsdom ^29.1.1`, devDependency only, never shipped).

**Unbounded input — the one real finding.** `#typer` had no `maxlength` and `renderDisplay` had no cap. Measured in jsdom before the fix:

| chars | render time |
|-------|-------------|
| 1,000 | 479 ms |
| 10,000 | 8,870 ms |
| 50,000 | did not finish in 100 s+ |

A real browser parses faster than jsdom but is *worse* in the steady state: every character is an `inline-block` span with an infinite `wobble` animation, so N characters means N elements the compositor animates forever, not a one-time cost. Pasting a large string froze the tab, and every subsequent keystroke rebuilt the whole thing.

### Changes

- **`src/script.js`** — added `MAX_CHARS = 300` and truncated in `renderDisplay` via `[...text].slice(0, MAX_CHARS)`. The spread iterates by code point (matching the previous `for...of`), so truncation cannot split a surrogate pair. Exported `MAX_CHARS` so tests assert against the constant rather than a literal.
- **`src/index.html`** — added `maxlength="300"` to `#typer` as the primary control; the `renderDisplay` cap is the backstop, since `maxlength` does not constrain a programmatic `.value` assignment or a direct `renderDisplay` call. Also added `aria-labelledby="instructions"` to resolve an unlabelled-input accessibility warning on the same line.
- **`vercel.json`** (new) — `outputDirectory: "src"` serves the app at `/` instead of `/src/index.html`, with relative asset paths unchanged. `buildCommand` and `installCommand` are empty: there is no build, and `jsdom` is test-only and must not ship.
- **`.vercelignore`** (new) — excludes `node_modules`, `tasks/`, `changelog/`, and `*.md`.
- **`package.json`** — fixed the `test` script, which was `node --test tasks/tests/` and errored with `MODULE_NOT_FOUND` on Node 24. Now `node --test`, which discovers the suite correctly.
- **`HANDOFF-SECURITY.md`** — deleted. It briefed this audit; leaving it in place would send a future session to redo work that is already done and recorded here. This entry is the durable record.
- **`tasks/tests/07-input-hardening.test.js`** (new, 13 tests) — cap enforcement, sub-cap input unaffected, surrogate pairs not split, the seven adversarial payloads asserted non-injecting with each character preserved verbatim, `maxlength`/`MAX_CHARS` drift check, and a scan asserting no external resource references or network APIs in `src/`.

### Deliberately not done

- **No CSP and no security headers.** CSP mitigates injected content, and there is no injection vector: no backend, no URL parameters, no storage, no third-party scripts. The only content reaching the page is what the user types on their own machine, and hosting on Vercel delivers files without adding state to protect. The one non-trivial argument — insurance against a future `textContent` → `innerHTML` regression — is better served by the injection tests above, which fail loudly in `node --test` instead of silently in a browser console. `X-Frame-Options`/`nosniff` were rejected on the same grounds: no auth, no session, nothing to clickjack.
- **No `@vercel/analytics` or Speed Insights.** Both inject a runtime script and make network calls, which would break the no-third-party-loading property the audit just confirmed and test 07 now enforces.

### Verification

- `npm test` — **38/38 passed** (25 pre-existing regression tests, 13 new), 0 failures.
- Post-fix benchmark: 10,000 chars → 379 ms, 200,000 → 279 ms, 1,000,000 → 179 ms, all producing exactly 300 spans. The 50,000-char case that previously never finished now returns immediately.
- `vercel.json` validated as parseable JSON; routing verified by serving `src/` as a docroot — `/`, `/style.css`, and `/script.js` all returned 200 with the served HTML carrying `maxlength="300"`.
- **Not verified:** `npx vercel build` requires `vercel login` and could not run unattended, so the deploy itself is unconfirmed. The live-browser walkthrough still has not been performed by any agent in this project's history — the pre-existing gap from task 06 remains open.
