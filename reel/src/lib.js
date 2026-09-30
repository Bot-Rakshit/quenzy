// Core helpers: canvas, fonts, easing, text, shapes, deterministic randomness.
const path = require('path');
const fs = require('fs');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');

const W = 1080, H = 1920, FPS = 30;

const FONT_DIR = path.join(__dirname, '..', 'fonts');
const FONT_ALIASES = {
  'BagelFatOne.ttf': 'Bagel',
  'DelaGothicOne.ttf': 'Dela',
  'CaveatBrush.ttf': 'Brush',
  'TitanOne.ttf': 'Titan',
  'Bricolage-800.ttf': 'BricoX',
  'Bricolage-600.ttf': 'BricoS',
  'SpaceGrotesk-700.ttf': 'GroteskB',
  'SpaceGrotesk-500.ttf': 'GroteskM',
};
for (const f of fs.readdirSync(FONT_DIR)) {
  if (FONT_ALIASES[f]) GlobalFonts.registerFromPath(path.join(FONT_DIR, f), FONT_ALIASES[f]);
}

// Brand-ish palette (original interpretation of the can system: pink header,
// red wordmark, yellow callout, one colour world per flavour).
const C = {
  ink: '#1B0F2E',
  pink: '#FF5FA8',
  hotpink: '#FF2E88',
  blush: '#FFC2DC',
  red: '#E5232B',
  yellow: '#FFD83D',
  cream: '#FFF3DE',
  white: '#FFFFFF',
  purple: '#6D3FE0',
  lilac: '#C8B4FF',
  deepPurple: '#3A1D8F',
  litchi: '#FF7A9C',
  orange: '#FF8A1E',
  deepOrange: '#E85D00',
  creamy: '#FFE3B8',
  mint: '#35D39A',
  mintLight: '#C4F7DF',
  green: '#1C8A55',
  cucumber: '#7BCB4E',
  gray: '#8C8A93',
  sludge: '#6F8A3A',
};

// ---------- easing ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inCubic: (t) => t * t * t,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
  outElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
  outBounce: (t) => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) { t -= 1.5 / d; return n * t * t + 0.75; }
    if (t < 2.5 / d) { t -= 2.25 / d; return n * t * t + 0.9375; }
    t -= 2.625 / d;
    return n * t * t + 0.984375;
  },
};

// ---------- deterministic random ----------
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}
// smooth 1D noise for wobble/shake
function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const h = (n) => {
    const v = Math.sin((n + seed * 131.7) * 127.1) * 43758.5453;
    return (v - Math.floor(v)) * 2 - 1;
  };
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u);
}

// ---------- canvas ----------
function makeCanvas(w, h) {
  const c = createCanvas(w, h);
  return [c, c.getContext('2d')];
}

// ---------- shapes ----------
function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
}
function star(ctx, x, y, rOut, rIn, n = 5, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? rIn : rOut;
    const a = rot + (i * Math.PI) / n;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
}
// comic starburst
function burst(ctx, x, y, rOut, rIn, n, rot = 0) {
  star(ctx, x, y, rOut, rIn, n, rot);
}
function sparkle(ctx, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.restore();
}
function heart(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s * 1.1, y - s * 0.35, x - s * 0.5, y - s * 1.05, x, y - s * 0.45);
  ctx.bezierCurveTo(x + s * 0.5, y - s * 1.05, x + s * 1.1, y - s * 0.35, x, y + s * 0.35);
  ctx.closePath();
}

// ---------- text ----------
function font(name, size) {
  return `${size}px ${name}`;
}
// Sticker-style text: hard offset shadow, thick outline, fill.
function stickerText(ctx, str, x, y, o = {}) {
  const {
    font: f = 'Bagel', size = 120, fill = C.white, stroke = C.ink, strokeW = size * 0.12,
    shadow = C.ink, shadowX = size * 0.06, shadowY = size * 0.08, align = 'center',
    baseline = 'middle', tracking = 0,
  } = o;
  ctx.save();
  ctx.font = font(f, size);
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  if (tracking) ctx.letterSpacing = `${tracking}px`;
  if (shadow) {
    ctx.fillStyle = shadow;
    ctx.strokeStyle = shadow;
    ctx.lineWidth = strokeW;
    ctx.strokeText(str, x + shadowX, y + shadowY);
    ctx.fillText(str, x + shadowX, y + shadowY);
  }
  if (stroke && strokeW > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeW;
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = fill;
  ctx.fillText(str, x, y);
  ctx.restore();
}
function measure(ctx, str, f, size, tracking = 0) {
  ctx.save();
  ctx.font = font(f, size);
  if (tracking) ctx.letterSpacing = `${tracking}px`;
  const w = ctx.measureText(str).width;
  ctx.restore();
  return w;
}
// Size a string to fit a width.
function fitSize(ctx, str, f, maxW, maxSize) {
  const w = measure(ctx, str, f, 100);
  return Math.min(maxSize, (100 * maxW) / w);
}
// Per-letter animated sticker text. anim(i, n) -> {dx, dy, s, r, a}
function letterText(ctx, str, x, y, o = {}, anim) {
  const size = o.size || 120, f = o.font || 'Bagel';
  const chars = [...str];
  ctx.save();
  ctx.font = font(f, size);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0);
  ctx.restore();
  let cx = o.align === 'left' ? x : x - total / 2;
  chars.forEach((ch, i) => {
    const w = widths[i];
    const a = anim ? anim(i, chars.length) : {};
    const s = a.s ?? 1, alpha = a.a ?? 1;
    if (s > 0.001 && alpha > 0.001 && ch !== ' ') {
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.translate(cx + w / 2 + (a.dx || 0), y + (a.dy || 0));
      ctx.rotate(a.r || 0);
      ctx.scale(s, s);
      stickerText(ctx, ch, 0, 0, { ...o, align: 'center' });
      ctx.restore();
    }
    cx += w;
  });
  return total;
}
// Wrap-free multi-line helper (lines given explicitly)
function lines(ctx, arr, x, y, lh, o) {
  arr.forEach((s, i) => stickerText(ctx, s, x, y + i * lh, o));
}

// Pill label
function pill(ctx, str, x, y, o = {}) {
  const { font: f = 'GroteskB', size = 44, fill = C.yellow, color = C.ink, padX = size * 0.6, padY = size * 0.35, stroke = C.ink, sw = 6, shadow = 8, tracking = 0 } = o;
  const w = measure(ctx, str, f, size, tracking) + padX * 2;
  const h = size + padY * 2;
  ctx.save();
  if (shadow) {
    ctx.fillStyle = C.ink;
    roundRect(ctx, x - w / 2 + shadow, y - h / 2 + shadow, w, h, h / 2);
    ctx.fill();
  }
  ctx.fillStyle = fill;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = sw;
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.font = font(f, size);
  if (tracking) ctx.letterSpacing = `${tracking}px`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y + size * 0.04);
  ctx.restore();
  return w;
}

module.exports = {
  W, H, FPS, C, E, clamp, lerp, prog, rng, noise1, makeCanvas,
  roundRect, circle, star, burst, sparkle, heart,
  font, stickerText, measure, fitSize, letterText, lines, pill,
};
