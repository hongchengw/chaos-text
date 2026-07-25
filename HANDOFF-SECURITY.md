# Handoff: Security Audit / Red Team

## What this is
Chaos Text — a static, client-side joke typing toy. No server, no build step, no auth, no persistence, no network calls at runtime. Full context: `SPEC.md` (architecture/functions), `changelog/CHANGELOG.md` (build history).

## Surface
- `src/index.html`, `src/style.css`, `src/script.js` — that's the entire shipped app.
- Only runtime dependency is the browser itself. `jsdom` exists as a devDependency for tests (`tasks/tests/`) — not shipped, not attack surface for the live app, but still worth a `npm audit` pass since it's in the supply chain.
- No cookies, storage, sessions, or backend to target.

## Where user input actually flows
The only input path: `#typer`'s value → `renderDisplay(text, displayEl)` in `src/script.js`, called on every `input` event. It rebuilds `#display` as one `<span>` per character. Currently uses `span.textContent` (not `innerHTML`) to place the character, and `span.style.cssText = styleToInline(buildCharStyle())` to style it — `styleToInline` interpolates `buildCharStyle()`'s output (randomly generated, not user-controlled) into that CSS string, so on the surface user text never reaches `cssText`. Worth verifying that holds under adversarial input (unusual Unicode, RTL/zero-width/control characters, extremely long strings) rather than taking it on faith. Also check for:
- Perf/DoS via unbounded input length (no current cap — pasting a huge string rebuilds one `<span>` per character with no limit).
- Any path where character content could end up in an attribute or style value instead of `textContent`.
- CSS/animation property abuse (e.g. does anything ever pass user text into `FONT_POOL`, `styleToInline`, or animation properties — currently no, but confirm).

## Not in scope
No server code, no auth/session, no stored data, no third-party script/font loading (everything is offline-safe by design — confirm that's still true).

## Workflow to follow
Existing convention in this repo: fix → extend/add tests under `tasks/tests/` → run `node --test` (25 tests currently, must stay green) → log the change in `changelog/CHANGELOG.md` → commit and push to `oriin/main`.
