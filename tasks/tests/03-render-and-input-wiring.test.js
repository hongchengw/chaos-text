import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Module from 'node:module';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(__dirname, '..', '..', 'src', 'script.js');

// The repo's package.json sets "type": "module", which would make Node's
// require()/import treat script.js as an ES module (and its
// `module.exports` guard would never run, since `module` is not defined in
// ESM). script.js is authored as a plain CommonJS/browser script, so we
// compile it explicitly as CommonJS here regardless of the package's module
// type.
//
// script.js also references the `document` global (for renderDisplay and
// the DOMContentLoaded wiring), so we set up a jsdom `document` global
// before compiling the script.
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

const source = readFileSync(scriptPath, 'utf-8');
const mod = new Module(scriptPath);
mod.filename = scriptPath;
mod.paths = Module._nodeModulePaths(dirname(scriptPath));
mod._compile(source, scriptPath);

const { renderDisplay, styleToInline } = mod.exports;

function makeDisplay() {
  const d = new JSDOM('<div id="display"></div>');
  return d.window.document.getElementById('display');
}

test('styleToInline produces a CSS text string with the expected fields', () => {
  const css = styleToInline({
    fontFamily: 'serif',
    color: 'hsl(10, 80%, 60%)',
    rotation: 12.5,
    scale: 1.2,
  });
  assert.match(css, /font-family:\s*serif/);
  assert.match(css, /color:\s*hsl\(10, 80%, 60%\)/);
  // Task 04 replaced the direct `transform: rotate(...) scale(...)` with CSS
  // custom properties consumed by the `wobble` keyframe animation.
  assert.match(css, /--base-rot:\s*12\.5deg/);
  assert.match(css, /--base-scale:\s*1\.2/);
});

test('renderDisplay creates one span per character with matching textContent', () => {
  const displayEl = makeDisplay();
  renderDisplay('abc', displayEl);
  assert.equal(displayEl.children.length, 3);
  const chars = ['a', 'b', 'c'];
  for (let i = 0; i < chars.length; i++) {
    assert.equal(displayEl.children[i].tagName, 'SPAN');
    assert.equal(displayEl.children[i].textContent, chars[i]);
  }
});

test('re-rendering the same text randomizes styles (at least one span differs)', () => {
  const displayEl = makeDisplay();
  renderDisplay('abc', displayEl);
  const firstStyles = Array.from(displayEl.children).map((s) => s.style.cssText);

  renderDisplay('abc', displayEl);
  const secondStyles = Array.from(displayEl.children).map((s) => s.style.cssText);

  assert.equal(secondStyles.length, firstStyles.length);
  const anyDifferent = firstStyles.some((css, i) => css !== secondStyles[i]);
  assert.ok(anyDifferent, 'expected at least one span style to differ between renders');
});

test('backspace (shorter text) shrinks the span count', () => {
  const displayEl = makeDisplay();
  renderDisplay('abc', displayEl);
  assert.equal(displayEl.children.length, 3);

  renderDisplay('ab', displayEl);
  assert.equal(displayEl.children.length, 2);
  assert.equal(displayEl.children[0].textContent, 'a');
  assert.equal(displayEl.children[1].textContent, 'b');
});

test('space character produces its own span without collapsing', () => {
  const displayEl = makeDisplay();
  renderDisplay('a b', displayEl);
  assert.equal(displayEl.children.length, 3);
  assert.equal(displayEl.children[0].textContent, 'a');
  assert.equal(displayEl.children[1].textContent, ' ');
  assert.equal(displayEl.children[2].textContent, 'b');
  // Ensure the space span is styled so it doesn't collapse in layout.
  assert.match(displayEl.children[1].style.cssText, /white-space:\s*pre|display:\s*inline-block/);
});
