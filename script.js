// Chaos Text — chaos style engine.
// Pure, DOM-free randomization helpers used by later tasks to style each
// character. Keeping these free of DOM access makes them easy to unit test
// with node:test.

const FONT_POOL = [
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'Georgia, serif',
  '"Comic Sans MS", cursive',
  'Impact, sans-serif',
  '"Courier New", monospace',
  '"Times New Roman", serif',
];

function randomFontFamily() {
  return FONT_POOL[Math.floor(Math.random() * FONT_POOL.length)];
}

function randomColor() {
  const h = Math.random() * 360;
  const s = 70 + Math.random() * 30;
  const l = 55 + Math.random() * 25;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function randomRotation() {
  return -35 + Math.random() * 70;
}

function randomScale() {
  return 0.7 + Math.random() * 1.1;
}

function buildCharStyle() {
  return {
    fontFamily: randomFontFamily(),
    color: randomColor(),
    rotation: randomRotation(),
    scale: randomScale(),
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { randomFontFamily, randomColor, randomRotation, randomScale, buildCharStyle, FONT_POOL };
}
