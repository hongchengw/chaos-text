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

// Animations a chaos character can be assigned. `wobble` is the original (and
// the default for the main #display line); `drift` and `spin` widen the pool
// for the background fill layer. Keep in sync with the @keyframes in style.css.
const ANIMATION_POOL = ['wobble', 'drift', 'spin'];

function randomAnimationName() {
  return ANIMATION_POOL[Math.floor(Math.random() * ANIMATION_POOL.length)];
}

// Where a background fill character sits, as viewport percentages in [0, 100].
function randomFillPosition() {
  return {
    top: Math.random() * 100,
    left: Math.random() * 100,
  };
}

function buildCharStyle() {
  return {
    fontFamily: randomFontFamily(),
    color: randomColor(),
    rotation: randomRotation(),
    scale: randomScale(),
  };
}

// Shared inline-CSS assembly for both render paths.
// `opts.animationName` defaults to 'wobble' (the main #display behaviour);
// `opts.top`/`opts.left` are percentages, emitted only for the fill layer.
function styleToInline(style, opts = {}) {
  const animationName = opts.animationName || 'wobble';
  const position =
    typeof opts.top === 'number' && typeof opts.left === 'number'
      ? ` top: ${opts.top}%; left: ${opts.left}%;`
      : '';
  return `font-family: ${style.fontFamily}; color: ${style.color}; --base-rot: ${style.rotation}deg; --base-scale: ${style.scale}; animation-name: ${animationName}; animation-delay: ${randomAnimationDelay()}; animation-duration: ${randomAnimationDuration()}; display: inline-block; white-space: pre;${position}`;
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

// Density cap for the decorative background layer. Deliberately lower than
// MAX_CHARS: fill spans are absolutely positioned with infinite animations on
// top of whatever #display is already animating, so this is the *additional*
// ongoing compositor cost. 150 keeps the screen visibly full while staying
// smooth on low-end/mobile hardware.
const MAX_FILL_CHARS = 150;

function renderFill(text, fillEl) {
  const doc = fillEl.ownerDocument || document;
  fillEl.textContent = '';

  // Code-point iteration, same surrogate-pair safety as renderDisplay.
  const chars = [...text];
  if (chars.length === 0) return;

  // Cycle through the typed characters until the cap is reached, so even a
  // single-character input still tiles the whole viewport.
  for (let i = 0; i < MAX_FILL_CHARS; i++) {
    const span = doc.createElement('span');
    span.textContent = chars[i % chars.length];
    const { top, left } = randomFillPosition();
    span.style.cssText = styleToInline(buildCharStyle(), {
      animationName: randomAnimationName(),
      top,
      left,
    });
    fillEl.appendChild(span);
  }
}

if (typeof document !== 'undefined' && document.getElementById) {
  document.addEventListener('DOMContentLoaded', () => {
    const typer = document.getElementById('typer');
    const display = document.getElementById('display');
    const fill = document.getElementById('fill');
    if (typer && display && fill) {
      typer.addEventListener('input', () => {
        renderDisplay(typer.value, display);
        renderFill(typer.value, fill);
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
    randomFillPosition,
    randomAnimationName,
    ANIMATION_POOL,
    MAX_FILL_CHARS,
    renderFill,
  };
}
