import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Module from 'node:module';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', '..', 'src');
const scriptPath = join(srcDir, 'script.js');

// Same CommonJS-compile workaround the other suites use: package.json sets
// "type": "module", so a plain require() would see an empty ESM namespace
// instead of script.js's `module.exports`. See 03-render-and-input-wiring.
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

const source = readFileSync(scriptPath, 'utf-8');
const mod = new Module(scriptPath);
mod.filename = scriptPath;
mod.paths = Module._nodeModulePaths(dirname(scriptPath));
mod._compile(source, scriptPath);

const {
  renderFill,
  randomFillPosition,
  randomAnimationName,
  MAX_FILL_CHARS,
  ANIMATION_POOL,
} = mod.exports;

function makeFill() {
  const d = new JSDOM('<div id="fill"></div>');
  return d.window.document.getElementById('fill');
}

const ANIMATIONS = ['wobble', 'drift', 'spin'];

test('MAX_FILL_CHARS is exported as a positive number below MAX_CHARS', () => {
  assert.equal(typeof MAX_FILL_CHARS, 'number');
  assert.ok(MAX_FILL_CHARS > 0, 'expected a positive cap');
  assert.equal(MAX_FILL_CHARS, 150);
  assert.ok(
    MAX_FILL_CHARS < mod.exports.MAX_CHARS,
    'fill layer should be capped below the main display cap'
  );
});

// 1. Cap enforcement — short input cycles up to the cap.
test('single-character input cycles to exactly MAX_FILL_CHARS spans', () => {
  const fillEl = makeFill();
  renderFill('a', fillEl);
  assert.equal(fillEl.children.length, MAX_FILL_CHARS);
  for (const span of fillEl.children) {
    assert.equal(span.textContent, 'a');
  }
});

// 2. Cap enforcement — oversized input never exceeds the cap.
test('oversized input still produces exactly MAX_FILL_CHARS spans', () => {
  const fillEl = makeFill();
  renderFill('a'.repeat(500), fillEl);
  assert.equal(fillEl.children.length, MAX_FILL_CHARS);
});

test('multi-character input cycles through the code points in order', () => {
  const fillEl = makeFill();
  renderFill('abc', fillEl);
  assert.equal(fillEl.children.length, MAX_FILL_CHARS);
  const chars = ['a', 'b', 'c'];
  Array.from(fillEl.children).forEach((span, i) => {
    assert.equal(span.textContent, chars[i % chars.length]);
  });
});

test('cycling iterates by code point and never splits surrogate pairs', () => {
  const fillEl = makeFill();
  renderFill('\u{1F600}\u{1F4A5}', fillEl);
  assert.equal(fillEl.children.length, MAX_FILL_CHARS);
  const expected = ['\u{1F600}', '\u{1F4A5}'];
  Array.from(fillEl.children).forEach((span, i) => {
    assert.equal(span.textContent, expected[i % expected.length]);
  });
  const withoutPairs = fillEl.textContent.replace(
    /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
    ''
  );
  assert.doesNotMatch(withoutPairs, /[\uD800-\uDFFF]/, 'expected no lone surrogates');
});

// 3. Position range.
test('every fill span sits at a top/left percentage within [0, 100]', () => {
  const fillEl = makeFill();
  renderFill('chaos', fillEl);
  for (const span of fillEl.children) {
    for (const prop of ['top', 'left']) {
      const raw = span.style[prop];
      assert.match(raw, /^\d+(\.\d+)?%$/, `expected a percentage for ${prop}, got "${raw}"`);
      const value = parseFloat(raw);
      assert.ok(value >= 0 && value <= 100, `expected ${prop}=${value} to be in [0, 100]`);
    }
  }
});

test('randomFillPosition() stays within [0, 100] across many samples', () => {
  for (let i = 0; i < 300; i++) {
    const { top, left } = randomFillPosition();
    assert.equal(typeof top, 'number');
    assert.equal(typeof left, 'number');
    assert.ok(top >= 0 && top <= 100, `top ${top} out of range`);
    assert.ok(left >= 0 && left <= 100, `left ${left} out of range`);
  }
});

test('fill positions are randomized, not all identical', () => {
  const fillEl = makeFill();
  renderFill('xyz', fillEl);
  const tops = Array.from(fillEl.children).map((s) => s.style.top);
  const allIdentical = tops.every((t) => t === tops[0]);
  assert.ok(!allIdentical, 'expected fill spans to be spread across the viewport');
});

// 4. Animation variety.
test('randomAnimationName() only ever returns wobble, drift or spin', () => {
  assert.deepEqual([...ANIMATION_POOL].sort(), [...ANIMATIONS].sort());
  for (let i = 0; i < 300; i++) {
    assert.ok(ANIMATIONS.includes(randomAnimationName()));
  }
});

test('fill spans use the three-animation pool and do not all share one', () => {
  const fillEl = makeFill();
  renderFill('hello', fillEl);
  const names = Array.from(fillEl.children).map((s) => s.style.animationName);
  assert.equal(names.length, MAX_FILL_CHARS);
  for (const name of names) {
    assert.ok(ANIMATIONS.includes(name), `unexpected animation-name "${name}"`);
  }
  const allIdentical = names.every((n) => n === names[0]);
  assert.ok(!allIdentical, 'expected animation names to vary across fill spans');
});

test('every fill span has non-empty animation delay and duration', () => {
  const fillEl = makeFill();
  renderFill('hi', fillEl);
  for (const span of fillEl.children) {
    assert.ok(span.style.animationDelay && span.style.animationDelay.length > 0);
    assert.ok(span.style.animationDuration && span.style.animationDuration.length > 0);
  }
});

// 5. Re-render randomizes.
test('re-rendering the same text produces a different chaos layout', () => {
  const fillEl = makeFill();

  renderFill('abc', fillEl);
  const first = Array.from(fillEl.children).map((s) => s.style.cssText);

  renderFill('abc', fillEl);
  const second = Array.from(fillEl.children).map((s) => s.style.cssText);

  assert.equal(first.length, second.length);
  const anyDifferent = first.some((css, i) => css !== second[i]);
  assert.ok(anyDifferent, 'expected re-render to re-randomize span styles');
});

test('re-rendering replaces the previous spans rather than appending', () => {
  const fillEl = makeFill();
  renderFill('a', fillEl);
  renderFill('b', fillEl);
  assert.equal(fillEl.children.length, MAX_FILL_CHARS);
  for (const span of fillEl.children) {
    assert.equal(span.textContent, 'b');
  }
});

// 6. Empty input.
test('empty input produces zero fill spans', () => {
  const fillEl = makeFill();
  renderFill('', fillEl);
  assert.equal(fillEl.children.length, 0);
  assert.equal(fillEl.innerHTML, '');
});

test('clearing the input clears a previously populated fill layer', () => {
  const fillEl = makeFill();
  renderFill('abc', fillEl);
  assert.equal(fillEl.children.length, MAX_FILL_CHARS);
  renderFill('', fillEl);
  assert.equal(fillEl.children.length, 0);
});

// 7. No injection — same adversarial payloads as the input-hardening suite.
const ADVERSARIAL = {
  'script tag': '<script>alert(1)</scr' + 'ipt>',
  'style breakout': 'a; background:url(javascript:alert(1)); x:"',
  'attribute breakout': '";}</style><img src=x onerror=alert(1)>',
  'css expression': 'url("x") expression(alert(1))',
};

for (const [name, payload] of Object.entries(ADVERSARIAL)) {
  test(`adversarial input is not injected through renderFill: ${name}`, () => {
    const fillEl = makeFill();
    renderFill(payload, fillEl);

    const html = fillEl.innerHTML;
    assert.doesNotMatch(html, /<script/i);
    assert.doesNotMatch(html, /<img/i);
    assert.doesNotMatch(html, /<style/i);
    assert.doesNotMatch(html, /onerror/i);
    assert.doesNotMatch(html, /javascript:/i);
    assert.doesNotMatch(html, /expression\(/i);

    // Payload characters survive verbatim as text, cycled up to the cap.
    const chars = [...payload];
    assert.equal(fillEl.children.length, MAX_FILL_CHARS);
    Array.from(fillEl.children).forEach((span, i) => {
      assert.equal(span.textContent, chars[i % chars.length]);
    });
  });
}

// 8. Structural / CSS checks.
test('style.css defines #fill as a non-interactive fixed background layer', () => {
  const css = readFileSync(join(srcDir, 'style.css'), 'utf-8');
  const block = css.match(/#fill\s*\{[^}]*\}/);
  assert.ok(block, 'expected a #fill rule in style.css');
  assert.match(block[0], /pointer-events:\s*none/, '#fill must not intercept clicks');
  assert.match(block[0], /position:\s*fixed/);
  assert.match(block[0], /z-index:\s*0/);
});

test('style.css layers #typer and #display above the fill layer', () => {
  const css = readFileSync(join(srcDir, 'style.css'), 'utf-8');
  const block = css.match(/#typer,\s*#display,\s*#instructions\s*\{[^}]*\}/);
  assert.ok(block, 'expected a stacking rule for #typer/#display/#instructions');
  assert.match(block[0], /z-index:\s*1/);
  assert.match(block[0], /position:\s*relative/);
});

test('style.css defines the drift and spin keyframes used by the fill layer', () => {
  const css = readFileSync(join(srcDir, 'style.css'), 'utf-8');
  for (const name of ANIMATIONS) {
    assert.match(css, new RegExp(`@keyframes\\s+${name}\\b`), `missing @keyframes ${name}`);
  }
});

test('index.html contains an aria-hidden #fill container', () => {
  const html = readFileSync(join(srcDir, 'index.html'), 'utf-8');
  const tag = html.match(/<div[^>]*id="fill"[^>]*>/);
  assert.ok(tag, 'expected a #fill element in index.html');
  assert.match(tag[0], /aria-hidden="true"/, '#fill should be hidden from screen readers');
});
