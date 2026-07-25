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
  const s = 85 + Math.random() * 15;
  const l = 50 + Math.random() * 30;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function randomRotation() {
  return -180 + Math.random() * 360;
}

function randomScale() {
  return 0.3 + Math.random() * 2.7;
}

function randomAnimationDelay() {
  return `${(Math.random() * 2).toFixed(2)}s`;
}

function randomAnimationDuration() {
  return `${(0.4 + Math.random() * 1).toFixed(2)}s`;
}

function buildCharStyle() {
  return {
    fontFamily: randomFontFamily(),
    color: randomColor(),
    rotation: randomRotation(),
    scale: randomScale(),
  };
}

function styleToInline(style) {
  return `font-family: ${style.fontFamily}; color: ${style.color}; --base-rot: ${style.rotation}deg; --base-scale: ${style.scale}; animation-name: wobble; animation-delay: ${randomAnimationDelay()}; animation-duration: ${randomAnimationDuration()}; display: inline-block; white-space: pre;`;
}

// Upper bound on how many characters we'll render. Every character becomes an
// inline-block <span> with its own infinite wobble animation, so the cost is
// not just the one-time render — the compositor keeps animating N elements
// forever. Without a cap, pasting a large string freezes the tab.
// Keep in sync with the `maxlength` attribute on #typer in index.html.
const MAX_CHARS = 300;

function renderDisplay(text, displayEl) {
  const doc = displayEl.ownerDocument || document;
  displayEl.textContent = '';
  // Spread iterates by code point (same as the previous for...of), so the
  // slice can't cut a surrogate pair in half.
  for (const char of [...text].slice(0, MAX_CHARS)) {
    const span = doc.createElement('span');
    span.textContent = char;
    span.style.cssText = styleToInline(buildCharStyle());
    displayEl.appendChild(span);
  }
}

if (typeof document !== 'undefined' && document.getElementById) {
  document.addEventListener('DOMContentLoaded', () => {
    const typer = document.getElementById('typer');
    const display = document.getElementById('display');
    if (typer && display) {
      typer.addEventListener('input', () => {
        renderDisplay(typer.value, display);
      });
    }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    randomFontFamily,
    randomColor,
    randomRotation,
    randomScale,
    randomAnimationDelay,
    randomAnimationDuration,
    buildCharStyle,
    FONT_POOL,
    MAX_CHARS,
    styleToInline,
    renderDisplay,
  };
}
