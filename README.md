# Chaos Text

Chaos Text is a small joke webapp: type into the input box, and every character you type is rendered as its own randomized, wobbling `<span>` — a random font, color, rotation, and scale is picked for *every* character on *every* keystroke, so the text on screen never looks the same twice. On top of that, once rendered, each character keeps gently wobbling on its own via a CSS animation with a per-character randomized delay and duration, so the whole display stays subtly alive even when you stop typing.

Input is capped at 300 characters. Every character becomes an inline-block
`<span>` running an infinite animation, so an uncapped paste would pin the
compositor and freeze the tab.

## Running it

No build step is required — it's plain HTML/CSS/JS.

- Open `src/index.html` directly in a browser, or
- Serve it statically, e.g. `npx http-server` (then visit `/src/index.html`).

## Deploying

Deployable to Vercel as-is: import the repo, no configuration or environment
variables needed. `vercel.json` sets `outputDirectory` to `src` so the app is
served at `/`, and skips the install and build steps — there is nothing to
build and the only dependency (`jsdom`) is test-only.

Hosting changes nothing about how the app runs. It is entirely client-side:
three static files, no backend, no storage, no analytics, and no network
requests after the initial page load. Whatever you type stays in your browser.

## Running tests

```
npm install && npm test
```

`npm test` runs `node --test`, which discovers everything under
`tasks/tests/`.
