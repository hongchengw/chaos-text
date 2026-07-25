# Task 01 — Scaffold HTML

## Goal
Create the static skeleton for the Chaos Text app: `index.html`, `style.css`, and `script.js`, wired together. No chaos logic yet — just structure.

## Files to create
- `index.html`
- `style.css`
- `script.js`

## Implementation
`index.html`:
- `<!DOCTYPE html>`, `<html>`, `<head>` with `<title>Chaos Text</title>`, `<meta charset="utf-8">`, `<link rel="stylesheet" href="style.css">`.
- `<body>` containing:
  - A short instruction line, e.g. `<p id="instructions">Type. Watch it fall apart.</p>`
  - `<input id="typer" type="text" autofocus autocomplete="off" spellcheck="false">`
  - `<div id="display" aria-hidden="false"></div>`
  - `<script src="script.js"></script>` at the end of body.

`style.css`:
- Base layout only for now: dark background (`background: #111`), light text color, centered flex layout (`display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh;`), reasonable font-size for `#display` (e.g. `2rem`), style `#typer` simply (it can remain a normal visible text input for now).

`script.js`:
- Empty stub file for now — just a comment noting chaos logic lands in later tasks. No exports needed yet.

## Verify
Write `tasks/tests/01-scaffold-html.test.js` using Node's built-in test runner (`node:test`) and `node:assert`. Read `index.html` as text (no need for jsdom yet) and assert via regex/string checks that:
- It contains `id="typer"`
- It contains `id="display"`
- It references `href="style.css"`
- It references `src="script.js"`

Run with: `node --test tasks/tests/01-scaffold-html.test.js` and confirm it passes.

Also create a minimal `package.json` at repo root (`"type": "module"`, no dependencies yet — jsdom gets added in task 03 when actually needed) so `node --test` runs cleanly.

## When done
1. Confirm the test passes.
2. Append an entry to `CHANGELOG.md` (create if missing) following the format in the plan.
3. Commit (`git-commit-formatter` skill if available, else a plain descriptive commit) and push to the `oriin` remote on the current branch.
