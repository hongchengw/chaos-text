import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, '..', '..', 'index.html'), 'utf-8');

test('index.html contains #typer input', () => {
  assert.match(html, /id="typer"/);
});

test('index.html contains #display element', () => {
  assert.match(html, /id="display"/);
});

test('index.html links style.css', () => {
  assert.match(html, /href="style\.css"/);
});

test('index.html references script.js', () => {
  assert.match(html, /src="script\.js"/);
});
