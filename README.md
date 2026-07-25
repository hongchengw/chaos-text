# Chaos Text

Chaos Text is a small joke webapp: type into the input box, and every character you type is rendered as its own randomized, wobbling `<span>` — a random font, color, rotation, and scale is picked for *every* character on *every* keystroke, so the text on screen never looks the same twice. On top of that, once rendered, each character keeps gently wobbling on its own via a CSS animation with a per-character randomized delay and duration, so the whole display stays subtly alive even when you stop typing.

## Running it

No build step is required — it's plain HTML/CSS/JS.

- Open `src/index.html` directly in a browser, or
- Serve it statically, e.g. `npx http-server` (then visit `/src/index.html`).

## Running tests

```
npm install && node --test
```
