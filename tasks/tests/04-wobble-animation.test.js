import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Module from 'node:module';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(__dirname, '..', '..', 'src', 'script.js');

// See tasks/tests/03-render-and-input-wiring.test.js for why script.js is
// compiled explicitly as CommonJS here rather than require()'d/import'd
// directly (package.json sets "type": "module").
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

const source = readFileSync(scriptPath, 'utf-8');
const mod = new Module(scriptPath);
mod.filename = scriptPath;
mod.paths = Module._nodeModulePaths(dirname(scriptPath));
mod._compile(source, scriptPath);

const { renderDisplay, randomAnimationDelay, randomAnimationDuration } = mod.exports;

function makeDisplay() {
  const d = new JSDOM('<div id="display"></div>');
  return d.window.document.getElementById('display');
}

test('every rendered span animates via the wobble keyframes', () => {
  const displayEl = makeDisplay();
  renderDisplay('hello', displayEl);
  for (const span of displayEl.children) {
    assert.equal(span.style.animationName, 'wobble');
  }
});

test('every rendered span has non-empty animation-delay and animation-duration', () => {
  const displayEl = makeDisplay();
  renderDisplay('hello', displayEl);
  for (const span of displayEl.children) {
    assert.ok(span.style.animationDelay && span.style.animationDelay.length > 0);
    assert.ok(span.style.animationDuration && span.style.animationDuration.length > 0);
  }
});

test('animation delays are randomized per character, not shared across a render', () => {
  const displayEl = makeDisplay();
  renderDisplay('hello', displayEl);
  const delays = Array.from(displayEl.children).map((s) => s.style.animationDelay);
  assert.equal(delays.length, 5);
  const allIdentical = delays.every((d) => d === delays[0]);
  assert.ok(!allIdentical, 'expected animation-delay values to differ across characters');
});

test('randomAnimationDelay() falls within [0, 2] seconds across many samples', () => {
  for (let i = 0; i < 150; i++) {
    const val = randomAnimationDelay();
    assert.match(val, /^-?\d+(\.\d+)?s$/);
    const seconds = parseFloat(val);
    assert.ok(seconds >= 0 && seconds <= 2, `expected ${seconds} to be in [0, 2]`);
  }
});

test('randomAnimationDuration() falls within [0.4, 1.4] seconds across many samples', () => {
  for (let i = 0; i < 150; i++) {
    const val = randomAnimationDuration();
    assert.match(val, /^-?\d+(\.\d+)?s$/);
    const seconds = parseFloat(val);
    assert.ok(seconds >= 0.4 && seconds <= 1.4, `expected ${seconds} to be in [0.4, 1.4]`);
  }
});
