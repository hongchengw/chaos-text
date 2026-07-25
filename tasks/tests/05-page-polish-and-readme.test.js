import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');

const readme = readFileSync(join(root, 'README.md'), 'utf-8');
const html = readFileSync(join(root, 'src', 'index.html'), 'utf-8');
const css = readFileSync(join(root, 'src', 'style.css'), 'utf-8');

test('README.md is substantial (more than just a heading)', () => {
  assert.ok(readme.length > 200, `expected README.md length > 200, got ${readme.length}`);
});

test('README.md mentions index.html', () => {
  assert.match(readme, /index\.html/);
});

test('index.html still contains #typer input', () => {
  assert.match(html, /id="typer"/);
});

test('index.html still contains #display element', () => {
  assert.match(html, /id="display"/);
});

test('style.css still contains @keyframes wobble', () => {
  assert.match(css, /@keyframes wobble/);
});
