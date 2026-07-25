import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Module from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(__dirname, '..', '..', 'src', 'script.js');

// The repo's package.json sets "type": "module", which would make Node's
// require()/import treat script.js as an ES module (and its
// `module.exports` guard would never run, since `module` is not defined in
// ESM). script.js is authored as a plain CommonJS/browser script, so we
// compile it explicitly as CommonJS here regardless of the package's module
// type.
const source = readFileSync(scriptPath, 'utf-8');
const mod = new Module(scriptPath);
mod.filename = scriptPath;
mod.paths = Module._nodeModulePaths(dirname(scriptPath));
mod._compile(source, scriptPath);

const {
  randomFontFamily,
  randomColor,
  randomRotation,
  randomScale,
  buildCharStyle,
  FONT_POOL,
} = mod.exports;

const ITERATIONS = 200;
const COLOR_RE = /^hsl\(\d+(\.\d+)?, \d+(\.\d+)?%, \d+(\.\d+)?%\)$/;

test('randomFontFamily always returns a value present in FONT_POOL', () => {
  for (let i = 0; i < ITERATIONS; i++) {
    const font = randomFontFamily();
    assert.ok(FONT_POOL.includes(font), `unexpected font: ${font}`);
  }
});

test('randomColor matches hsl format and ranges', () => {
  for (let i = 0; i < ITERATIONS; i++) {
    const color = randomColor();
    assert.match(color, COLOR_RE);
    const match = color.match(/^hsl\(([\d.]+), ([\d.]+)%, ([\d.]+)%\)$/);
    const hNum = parseFloat(match[1]);
    const sNum = parseFloat(match[2]);
    const lNum = parseFloat(match[3]);
    assert.ok(hNum >= 0 && hNum <= 360, `h out of range: ${hNum}`);
    assert.ok(sNum >= 85 && sNum <= 100, `s out of range: ${sNum}`);
    assert.ok(lNum >= 50 && lNum <= 80, `l out of range: ${lNum}`);
  }
});

test('randomRotation is a number within [-180, 180]', () => {
  for (let i = 0; i < ITERATIONS; i++) {
    const rotation = randomRotation();
    assert.equal(typeof rotation, 'number');
    assert.ok(rotation >= -180 && rotation <= 180, `rotation out of range: ${rotation}`);
  }
});

test('randomScale is a number within [0.3, 3]', () => {
  for (let i = 0; i < ITERATIONS; i++) {
    const scale = randomScale();
    assert.equal(typeof scale, 'number');
    assert.ok(scale >= 0.3 && scale <= 3, `scale out of range: ${scale}`);
  }
});

test('buildCharStyle returns an object with all four fields populated and consistent', () => {
  for (let i = 0; i < ITERATIONS; i++) {
    const style = buildCharStyle();
    assert.ok(FONT_POOL.includes(style.fontFamily));
    assert.match(style.color, COLOR_RE);
    assert.equal(typeof style.rotation, 'number');
    assert.ok(style.rotation >= -180 && style.rotation <= 180);
    assert.equal(typeof style.scale, 'number');
    assert.ok(style.scale >= 0.3 && style.scale <= 3);
  }
});

test('outputs are not all identical across many calls (Math.random sanity check)', () => {
  const fonts = new Set();
  const colors = new Set();
  const rotations = new Set();
  const scales = new Set();
  for (let i = 0; i < ITERATIONS; i++) {
    fonts.add(randomFontFamily());
    colors.add(randomColor());
    rotations.add(randomRotation());
    scales.add(randomScale());
  }
  assert.ok(fonts.size > 1, 'randomFontFamily produced identical output every time');
  assert.ok(colors.size > 1, 'randomColor produced identical output every time');
  assert.ok(rotations.size > 1, 'randomRotation produced identical output every time');
  assert.ok(scales.size > 1, 'randomScale produced identical output every time');
});
