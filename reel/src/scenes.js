// The reel, scene by scene. Timeline is locked to a 120 BPM grid (1 beat = 0.5s,
// 1 bar = 2s) so every cut and slam lands on the music.
//
//  0.0 –  4.0  HOOK        "YOUR GUT HATES YOUR SODA."
//  4.0 – 14.0  EXHIBIT A   regular soda: sugar cubes pile in, gut gets sick
// 14.0 – 22.0  EXHIBIT B   "healthy" drinks taste like homework -> WHY NOT BOTH?
// 22.0 – 30.0  REVEAL      drop: the Quenzy can lands. "Soda, but with a GUT FEELING."
// 30.0 – 40.0  STATS       <15 kcal / 0g added sugar / 5g fibre / 0 preservatives
// 40.0 – 58.0  FLAVOURS    Blueberry×Litchi, Orange×Cream, Cucumber×Mint
// 58.0 – 64.0  PROOF       started in Bengaluru, first drop sold out in 2 hours
// 64.0 – 72.0  CTA         Fizz. Fun. Fibre. + where to buy + end card
const L = require('./lib');
const A = require('./assets');
const { W, H, C, E, clamp, lerp, prog, rng, noise1, stickerText, letterText, fitSize, pill, circle } = L;

const TAU = Math.PI * 2;
const DURATION = 72;

// ---------------- sound cue sheet (consumed by audio/make_audio.py) -------------
const CUES = [];
const cue = (t, type, extra = {}) => CUES.push({ t, type, ...extra });
// hook
cue(0.0, 'crack'); cue(0.02, 'slam'); cue(0.5, 'slam'); cue(1.0, 'slam'); cue(1.35, 'boing');
cue(2.4, 'pop'); cue(3.7, 'whoosh');
// exhibit A
cue(4.1, 'pop'); cue(4.3, 'whoosh');
for (let k = 0; k < 9; k++) cue(4.8 + k * 0.5 + 0.42, 'plop', { n: k });
cue(9.4, 'pop'); cue(9.8, 'boing');
cue(11.0, 'stamp'); cue(11.6, 'stamp'); cue(12.2, 'stamp'); cue(12.6, 'groan');
cue(13.75, 'whoosh');
// exhibit B
cue(14.1, 'pop'); cue(14.3, 'pop'); cue(14.4, 'whoosh'); cue(15.8, 'gag'); cue(16.2, 'pop');
cue(18.5, 'whoosh'); cue(18.6, 'pop'); cue(18.9, 'pop'); cue(19.2, 'pop'); cue(19.9, 'scribble');
cue(20.5, 'slam'); cue(18.0, 'riser', { dur: 4.0 });
// reveal
cue(22.0, 'crack'); cue(22.0, 'impact'); cue(22.31, 'splash'); cue(23.2, 'pop'); cue(23.3, 'sparkle');
cue(25.3, 'pop'); cue(25.8, 'pop'); cue(26.8, 'boing'); cue(29.75, 'whoosh');
// stats
for (let i = 0; i < 4; i++) { cue(30 + i * 2, 'slam'); cue(30.2 + i * 2, 'pop'); }
cue(32.6, 'swap'); cue(38.0, 'sparkle'); cue(38.3, 'aww'); cue(39.75, 'whoosh');
// flavours
for (let i = 0; i < 3; i++) {
  const T = 40 + i * 6;
  cue(T, 'whoosh'); cue(T + 0.05, 'crack'); cue(T + 0.5, 'splash'); cue(T + 0.55, 'sparkle'); cue(T + 1.2, 'pop');
}
cue(57.75, 'whoosh');
// proof
cue(58.1, 'pop'); cue(58.4, 'slam'); cue(59.3, 'pop'); cue(59.7, 'pop');
for (let k = 0; k < 6; k++) cue(60.7 + k * 0.2, 'tick');
cue(61.9, 'stamp'); cue(62.0, 'ding'); cue(63.2, 'pop'); cue(63.75, 'whoosh');
// CTA
cue(64.0, 'impact'); cue(64.5, 'impact'); cue(65.0, 'impact');
cue(65.5, 'slam'); cue(66.0, 'slam'); cue(66.5, 'slam'); cue(66.8, 'pop'); cue(67.1, 'pop');
cue(68.5, 'whoosh'); cue(68.6, 'pop'); cue(69.1, 'slam'); cue(69.5, 'boing');
cue(70.95, 'whoosh'); cue(71.0, 'crack'); cue(71.05, 'impact');

// ------------- camera shake: decaying kicks at impact moments --------------
const SHAKES = [
  [0.02, 22], [0.5, 30], [1.0, 22], [11.0, 10], [11.6, 10], [12.2, 10], [15.8, 14], [20.5, 36],
  [22.31, 44], [30, 16], [32, 16], [34, 16], [36, 16], [40.5, 20], [46.5, 20], [52.5, 20],
  [61.9, 34], [64.0, 16], [64.5, 16], [65.0, 26], [69.1, 14], [71.05, 30],
];
function shake(t) {
  let dx = 0, dy = 0, r = 0;
  for (const [t0, amp] of SHAKES) {
    const d = t - t0;
    if (d < 0 || d > 0.5) continue;
    const k = amp * Math.exp(-d * 9);
    dx += noise1(t * 40, t0) * k;
    dy += noise1(t * 40 + 50, t0) * k;
    r += noise1(t * 30 + 99, t0) * k * 0.0012;
  }
  return { dx, dy, r };
}

// ---------------- small animation helpers ----------------
const popS = (t, t0, d = 0.35) => (t < t0 ? 0 : E.outBack(prog(t, t0, t0 + d), 2.2));
const slamS = (t, t0, d = 0.2) => (t < t0 ? 0 : lerp(2.6, 1, E.outCubic(prog(t, t0, t0 + d))));
const fadeOut = (t, t0, d = 0.25) => 1 - prog(t, t0, t0 + d);

function bg(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(-120, -120, W + 240, H + 240);
}
function withXf(ctx, x, y, s, r, fn, alpha = 1) {
  if (s <= 0.001 || alpha <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(r || 0);
  ctx.scale(s, s);
  fn();
  ctx.restore();
}
function slamText(ctx, t, t0, str, x, y, o, rot = 0, alpha = 1) {
  const s = slamS(t, t0);
  const a = clamp((t - t0) / 0.06) * alpha;
  withXf(ctx, x, y, s, rot, () => stickerText(ctx, str, 0, 0, o), a);
}
function popText(ctx, t, t0, str, x, y, o, rot = 0, alpha = 1) {
  withXf(ctx, x, y, popS(t, t0), rot, () => stickerText(ctx, str, 0, 0, o), alpha);
}
// letters bounce in one by one
function bounceText(ctx, t, t0, str, x, y, o, stagger = 0.045, alpha = 1) {
  if (t < t0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  letterText(ctx, str, x, y, o, (i) => {
    const lt = prog(t, t0 + i * stagger, t0 + i * stagger + 0.32);
    const wob = Math.sin(t * 5 + i * 0.8) * 4 * prog(t, t0 + 0.6, t0 + 1);
    return { s: E.outBack(lt, 2.4), dy: (1 - lt) * 70 + wob, r: (1 - lt) * 0.4 * (i % 2 ? 1 : -1) };
  });
  ctx.restore();
}
function scribbleLine(ctx, x0, y0, x1, frac, color, w = 10, seed = 1) {
  if (frac <= 0) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const n = 30;
  for (let i = 0; i <= n * frac; i++) {
    const k = i / n;
    ctx.lineTo(lerp(x0, x1, k), y0 + Math.sin(k * 9 + seed) * 7);
  }
  ctx.stroke();
  ctx.restore();
}
function arrow(ctx, pts, frac, color = C.ink, w = 9) {
  if (frac <= 0) return;
  // quadratic from p0 via p1 to p2
  const [p0, p1, p2] = pts;
  const q = (k) => [
    (1 - k) ** 2 * p0[0] + 2 * (1 - k) * k * p1[0] + k * k * p2[0],
    (1 - k) ** 2 * p0[1] + 2 * (1 - k) * k * p1[1] + k * k * p2[1],
  ];
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const n = 40;
  for (let i = 0; i <= n * frac; i++) {
    const [x, y] = q(i / n);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  if (frac > 0.95) {
    const [ax, ay] = q(1), [bx, by] = q(0.9);
    const a = Math.atan2(ay - by, ax - bx);
    ctx.beginPath();
    ctx.moveTo(ax + Math.cos(a + 2.6) * 34, ay + Math.sin(a + 2.6) * 34);
    ctx.lineTo(ax, ay);
    ctx.lineTo(ax + Math.cos(a - 2.6) * 34, ay + Math.sin(a - 2.6) * 34);
    ctx.stroke();
  }
  ctx.restore();
}
function shockwave(ctx, x, y, t, t0, color = C.white, maxR = 700) {
  const k = prog(t, t0, t0 + 0.5);
  if (k <= 0 || k >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - k;
  ctx.strokeStyle = color;
  ctx.lineWidth = 40 * (1 - k) + 4;
  circle(ctx, x, y, E.outCubic(k) * maxR);
  ctx.stroke();
  ctx.restore();
}
function splash(ctx, x, y, t, t0, colors, seed = 1, n = 26) {
  const d = t - t0;
  if (d < 0 || d > 1.3) return;
  const R = rng(seed);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.05 + R() * 0.9);
    const sp = 900 + R() * 1300;
    const px = x + Math.cos(a) * sp * d;
    const py = y + Math.sin(a) * sp * d + 2600 * d * d;
    const r = (10 + R() * 22) * (1 - d / 1.3);
    ctx.fillStyle = colors[i % colors.length];
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(px, py, r, r * 1.25, a + Math.PI / 2, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}
function confetti(ctx, t, t0, seed, colors, n = 60) {
  const d = t - t0;
  if (d < 0 || d > 3) return;
  const R = rng(seed);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const x0 = R() * W, vy = 300 + R() * 500, vx = (R() - 0.5) * 300, rot = R() * TAU, vr = (R() - 0.5) * 12;
    const x = x0 + vx * d + Math.sin(d * 4 + i) * 30;
    const y = -60 - R() * 400 + vy * d + 200 * d * d;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot + vr * d);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(-12, -6, 24, 12);
    ctx.restore();
  }
  ctx.restore();
}
function marquee(ctx, str, y, t, speed, size, color, font = 'Bagel', stroke = true) {
  ctx.save();
  ctx.font = L.font(font, size);
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(str).width;
  let x = -((t * speed) % w) - (speed < 0 ? w : 0);
  while (x > -w) x -= w;
  for (; x < W + w; x += w) {
    if (stroke) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.strokeText(str, x, y);
    } else {
      ctx.fillStyle = color;
      ctx.fillText(str, x, y);
    }
  }
  ctx.restore();
}
function sparkles(ctx, t, seed, n, color, area = [0, 0, W, H]) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = area[0] + R() * area[2], y = area[1] + R() * area[3], ph = R() * TAU, sp = 2 + R() * 3;
    const k = Math.max(0, Math.sin(t * sp + ph));
    if (k > 0.05) L.sparkle(ctx, x, y, 8 + 22 * k, color);
  }
}

// ================================ SCENES ================================

function hook(ctx, t) {
  bg(ctx, C.yellow);
  A.halftone(ctx, 'rgba(255,95,168,0.35)', 42, 11, t);
  const wob = (k) => Math.sin(t * 3 + k) * 0.02;
  slamText(ctx, t, -0.1, 'YOUR GUT', 540, 430, { font: 'Dela', size: fitSize(ctx, 'YOUR GUT', 'Dela', 900, 170), fill: C.white }, wob(0));
  slamText(ctx, t, 0.5, 'HATES', 540, 650, { font: 'Dela', size: fitSize(ctx, 'HATES', 'Dela', 900, 270), fill: C.red, strokeW: 26, shadowX: 14, shadowY: 18 }, -0.06 + wob(1));
  slamText(ctx, t, 1.0, 'YOUR SODA.', 540, 870, { font: 'Dela', size: fitSize(ctx, 'YOUR SODA.', 'Dela', 940, 170), fill: C.white }, wob(2));
  // mascot rises, grumpy
  const rise = E.outBack(prog(t, 1.3, 1.8), 1.6);
  const my = lerp(2400, 1440, rise);
  A.gut(ctx, 540, my, 560, t, { eyes: 'normal', brows: 'angry', mouth: 'frown', armL: 1.0, armR: 1.0, squash: 0.04 * Math.sin(t * 9), lookX: -0.6 });
  // receipts
  popText(ctx, t, 2.4, '(and it has receipts)', 590, 1090, { font: 'Brush', size: 84, fill: C.pink, strokeW: 12 }, -0.05);
  arrow(ctx, [[860, 1150], [940, 1230], [820, 1290]], prog(t, 2.6, 3.0), C.ink, 10);
}

function exhibitA(ctx, t) {
  const u = t - 4;
  bg(ctx, '#F4ECDD');
  A.halftone(ctx, 'rgba(107,74,58,0.12)', 42, 10, t);
  pill(ctx, 'EXHIBIT A', 540, 230, { size: 44, fill: C.white, shadow: 8 * popS(u, 0.1) });
  withXf(ctx, 540, 230, 1, 0, () => {}, 0);
  popText(ctx, u, 0.25, 'Regular soda.', 540, 370, { font: 'Dela', size: 110, fill: '#8A5A44' });
  // regular can slides in
  const canX = lerp(-500, 330, E.outBack(prog(u, 0.2, 0.75)));
  const canY = 920, canH = 700;
  const lidY = canY + (-372 * canH) / 740;
  const exit = E.inBack(prog(u, 6.7, 7.1));
  const cx = canX - exit * 900;
  A.drawCan(ctx, cx, canY, canH, 'regular', Math.sin(u * 1.3) * 0.25, Math.sin(u * 2.2) * 0.03, { open: true });
  // falling sugar cubes
  let count = 0;
  for (let k = 0; k < 9; k++) {
    const tk = 0.8 + k * 0.5;
    const f = prog(u, tk, tk + 0.42);
    if (u >= tk + 0.42) { count++; continue; }
    if (u < tk) continue;
    const y = lerp(-150, lidY - 10, E.inQuad(f));
    A.sugarCube(ctx, cx + Math.sin(k * 2.1) * 20, y, 120, f * 3 + k);
  }
  // counter
  const counterX = 790;
  const cA = popS(u, 0.6) * (1 - exit);
  withXf(ctx, counterX, 700, cA, 0.04, () => stickerText(ctx, 'SUGAR', 0, 0, { font: 'Dela', size: 70, fill: C.white }));
  const bump = count > 0 ? 1 + 0.35 * Math.exp(-(u - (0.8 + (count - 1) * 0.5 + 0.42)) * 10) : 1;
  withXf(ctx, counterX, 900, cA * bump, 0, () => stickerText(ctx, String(count), 0, 0, { font: 'Bagel', size: 300, fill: count >= 7 ? C.red : C.white }));
  withXf(ctx, counterX, 1060, cA, -0.04, () => stickerText(ctx, 'cubes', 0, 0, { font: 'Brush', size: 80, fill: '#8A5A44', strokeW: 10 }));
  // caption
  const capA = fadeOut(u, 6.6);
  popText(ctx, u, 5.4, '≈ 35g sugar in ONE can', 540, 1290, { font: 'Titan', size: fitSize(ctx, '≈ 35g sugar in ONE can', 'Titan', 940, 84), fill: C.white }, -0.02, capA);
  if (u > 5.6) {
    ctx.save();
    ctx.globalAlpha = capA * 0.75;
    ctx.font = L.font('GroteskM', 30);
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'center';
    ctx.fillText('*typical 330ml cola', 540, 1375);
    ctx.restore();
  }
  // gut mascot suffers
  const gIn = E.outBack(prog(u, 5.8, 6.3));
  const sick = u > 7.0;
  const gx = lerp(1400, sick ? 600 : 800, gIn) + (sick ? Math.sin(u * 20) * 4 : 0);
  const gy = sick ? lerp(1560, 1000, E.inOutCubic(prog(u, 7.0, 7.5))) : 1560;
  const gs = sick ? lerp(380, 560, E.inOutCubic(prog(u, 7.0, 7.5))) : 380;
  A.gut(ctx, gx, gy, gs, t, sick
    ? { eyes: 'spiral', mouth: 'wavy', tint: '#B5CF63', bloat: 0.12 + 0.03 * Math.sin(u * 6), sweat: true, armL: 0.8, armR: 0.8 }
    : { eyes: 'wide', mouth: 'o', brows: 'worried', lookX: -1 });
  // symptoms stamps
  const syms = [['Sugar crash.', 7.0, 300, 1430, -0.08], ['Bloat.', 7.6, 250, 1560, 0.06], ['Regret.', 8.2, 290, 1690, -0.04]];
  for (const [s, t0, x, y, r] of syms) {
    slamText(ctx, u, t0, s, x, y, { font: 'Dela', size: 76, fill: C.red, strokeW: 12 }, r);
  }
}

function exhibitB(ctx, t) {
  const u = t - 14;
  bg(ctx, '#DCE3C4');
  A.halftone(ctx, 'rgba(90,110,40,0.13)', 42, 10, t, -1);
  const phase2 = u >= 4.5;
  if (!phase2) {
    pill(ctx, 'EXHIBIT B', 540, 230, { size: 44, fill: C.white, shadow: 8 * popS(u, 0.1) });
    popText(ctx, u, 0.3, '"Healthy" drinks.', 540, 370, { font: 'Dela', size: fitSize(ctx, '"Healthy" drinks.', 'Dela', 960, 110), fill: '#6F8A3A' });
    const out = 1 - E.inBack(prog(u, 4.2, 4.5));
    const gin = E.outBack(prog(u, 0.4, 0.9));
    A.sludgeGlass(ctx, 560, lerp(2300, 880, gin) + Math.sin(u * 2) * 12, 560 * out, t);
    const min = E.outBack(prog(u, 1.0, 1.4));
    const gag = u > 1.8;
    A.gut(ctx, lerp(-300, 230, min) + (gag ? Math.sin(u * 30) * 5 : 0), 1450, 360 * out, t,
      gag ? { eyes: 'x', mouth: 'gag', tint: '#A9C95A', armL: -0.6, armR: 0.9, sweat: true } : { eyes: 'normal', mouth: 'flat', lookX: 1 });
    popText(ctx, u, 2.2, 'tastes like homework.', 640, 1330, { font: 'Brush', size: fitSize(ctx, 'tastes like homework.', 'Brush', 700, 96), fill: C.white, strokeW: 12 }, -0.05, out);
    scribbleLine(ctx, 340, 1395, 940, prog(u, 2.5, 3.0) * out, C.red, 9, 2);
  } else {
    // TASTY or HEALTHY? -> WHY NOT BOTH?
    const v = u - 4.5;
    const spin = t * 0.4;
    A.rays(ctx, 540, 900, 16, spin, '#DCE3C4', 'rgba(255,255,255,0.35)');
    const q = 1 - E.inBack(prog(u, 6.3, 6.5));
    popText(ctx, u, 4.6, 'TASTY', 540, 520, { font: 'Bagel', size: 220, fill: C.pink }, -0.05, q);
    popText(ctx, u, 4.9, 'or', 540, 700, { font: 'Brush', size: 130, fill: C.white, strokeW: 14 }, 0, q);
    popText(ctx, u, 5.2, 'HEALTHY?', 540, 880, { font: 'Bagel', size: fitSize(ctx, 'HEALTHY?', 'Bagel', 940, 210), fill: C.mint }, 0.04, q);
    // red X over the "or"
    const xf = prog(u, 5.9, 6.2);
    if (xf > 0 && q > 0) {
      ctx.save();
      ctx.strokeStyle = C.red;
      ctx.lineCap = 'round';
      ctx.lineWidth = 22;
      ctx.beginPath();
      ctx.moveTo(430, 610);
      ctx.lineTo(430 + 220 * clamp(xf * 2), 610 + 180 * clamp(xf * 2));
      if (xf > 0.5) {
        ctx.moveTo(650, 610);
        ctx.lineTo(650 - 220 * clamp(xf * 2 - 1), 610 + 180 * clamp(xf * 2 - 1));
      }
      ctx.stroke();
      ctx.restore();
    }
    if (u >= 6.5) {
      A.rays(ctx, 540, 960, 20, t * 1.2, C.pink, C.hotpink);
      const z = 1 + 0.08 * prog(u, 6.5, 8);
      withXf(ctx, 540, 960, z, 0, () => {
        slamText(ctx, u, 6.5, 'WHY', 0, -330, { font: 'Dela', size: fitSize(ctx, 'WHY', 'Dela', 900, 240), fill: C.white, strokeW: 24 }, -0.05);
        slamText(ctx, u, 6.75, 'NOT', 0, -60, { font: 'Dela', size: fitSize(ctx, 'NOT', 'Dela', 900, 240), fill: C.yellow, strokeW: 24 }, 0.03);
        slamText(ctx, u, 7.0, 'BOTH?', 0, 230, { font: 'Dela', size: fitSize(ctx, 'BOTH?', 'Dela', 900, 260), fill: C.white, strokeW: 26 }, -0.03);
      });
      // mascot pops up hopeful
      A.gut(ctx, 540, lerp(2300, 1560, E.outBack(prog(u, 7.1, 7.5))), 340, t, { eyes: 'wide', mouth: 'open', armL: -0.9, armR: -0.9 });
    }
    // white-out into the drop
    const wf = prog(u, 7.6, 8.0);
    if (wf > 0) {
      ctx.save();
      ctx.globalAlpha = E.inQuad(wf);
      bg(ctx, C.white);
      ctx.restore();
    }
  }
}

function reveal(ctx, t) {
  const u = t - 22;
  A.rays(ctx, 540, 960, 18, t * 0.25, C.pink, '#FF78B8');
  marquee(ctx, 'quenzy  quenzy  ', 170, t, 180, 170, 'rgba(255,255,255,0.55)');
  marquee(ctx, 'quenzy  quenzy  ', 1790, t, -180, 170, 'rgba(255,255,255,0.55)');
  A.bubbles(ctx, t, 21, 30, 'rgba(255,255,255,0.85)');
  // can drop
  const drop = prog(u, 0, 0.85);
  const cy = lerp(-700, 1000, E.outBounce(drop));
  const spin = (1 - E.outCubic(prog(u, 0, 2.4))) * TAU * 2 + Math.sin(u * 1.1) * 0.35 * prog(u, 2.4, 3);
  const beat = u > 1 ? 1 + 0.025 * Math.exp(-((t % 0.5) * 9)) : 1;
  shockwave(ctx, 540, 1360, t, 22.31, C.white, 800);
  const canS = 820 * beat;
  // mascot hugging the can (behind layer first for depth)
  A.drawCan(ctx, 540, cy, canS, 'blueberry', spin, Math.sin(u * 1.4) * 0.04 * prog(u, 1, 2), { open: u > 0.05 });
  splash(ctx, 540, 1360, t, 22.31, ['#FFFFFF', C.lilac, C.yellow], 3);
  confetti(ctx, t, 22.31, 9, [C.yellow, C.white, C.purple, C.red], 70);
  // headline
  pill(ctx, 'SAY HI TO', 540, 250 + (1 - popS(u, 0.9)) * -300, { size: 46, fill: C.yellow, shadow: 8 });
  bounceText(ctx, u, 1.2, 'quenzy', 540, 390, { font: 'Bagel', size: 190, fill: C.red, stroke: C.white, strokeW: 30, shadowX: 12, shadowY: 16 }, 0.06);
  // tagline
  popText(ctx, u, 3.3, 'Soda, but with a', 540, 1510, { font: 'Titan', size: 88, fill: C.white, strokeW: 12 }, -0.02);
  bounceText(ctx, u, 3.8, 'GUT FEELING.', 540, 1660, { font: 'Bagel', size: fitSize(ctx, 'GUT FEELING.', 'Bagel', 980, 170), fill: C.yellow, strokeW: 20 }, 0.05);
  sparkles(ctx, t, 44, 10, C.white, [60, 480, 960, 900]);
  // mascot peeks & swoons
  const m = E.outBack(prog(u, 4.8, 5.3));
  A.gut(ctx, lerp(1300, 880, m), 1180, 250, t, { eyes: 'heart', mouth: 'grin', wave: 1, armL: 0.4, armR: -1.2 });
}

const STATS = [
  { big: '<15', label: 'CALORIES', sub: 'per can. yes, really.', bg: '#7B4CF0', bg2: '#6A3BE0' },
  { big: '0g', label: 'ADDED SUGAR', sub: 'all the sweet, none of the guilt.', bg: C.hotpink, bg2: C.pink, from: '35g' },
  { big: '5g', label: 'PREBIOTIC FIBRE', sub: 'snacks for your good gut bugs.', bg: '#FF8A1E', bg2: '#FF9F45' },
  { big: '0', label: 'PRESERVATIVES', sub: 'nothing weird. promise.', bg: '#20B97F', bg2: '#35D39A' },
];
function stats(ctx, t) {
  const u = t - 30;
  const idx = Math.min(4, Math.floor(u / 2));
  const lu = u - idx * 2;
  if (idx < 4) {
    const S = STATS[idx];
    A.rays(ctx, 540, 820, 14, t * 0.2 * (idx % 2 ? -1 : 1), S.bg, S.bg2);
    A.halftone(ctx, 'rgba(255,255,255,0.12)', 44, 9, t);
    // progress dots
    for (let i = 0; i < 4; i++) {
      circle(ctx, 540 + (i - 1.5) * 60, 300, 16);
      ctx.fillStyle = i <= idx ? C.white : 'rgba(255,255,255,0.3)';
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = C.ink;
      ctx.stroke();
    }
    // big number (0g swaps in from a crossed-out 35g)
    if (S.from && lu < 0.6) {
      slamText(ctx, lu, 0, S.from, 540, 760, { font: 'Bagel', size: 400, fill: '#9C7A6A', strokeW: 30 });
      const k = prog(lu, 0.25, 0.45);
      if (k > 0) {
        ctx.save();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 34;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(220, 840);
        ctx.lineTo(220 + 640 * k, 840 - 180 * k);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      const t0 = S.from ? 0.6 : 0;
      const flip = S.from ? E.outBack(prog(lu, 0.6, 0.85), 2.5) : 1;
      ctx.save();
      ctx.translate(540, 760);
      ctx.scale(1, flip || 0.001);
      slamText(ctx, lu, t0 && 0, S.big, 0, 0, { font: 'Bagel', size: 420, fill: C.white, strokeW: 32, shadowX: 18, shadowY: 24 });
      ctx.restore();
    }
    popText(ctx, lu, 0.2, S.label, 540, 1060, { font: 'Dela', size: fitSize(ctx, S.label, 'Dela', 960, 120), fill: C.yellow, strokeW: 14 });
    popText(ctx, lu, 0.45, S.sub, 540, 1200, { font: 'Brush', size: fitSize(ctx, S.sub, 'Brush', 900, 84), fill: C.white, strokeW: 12 }, -0.03);
    const dance = Math.abs(Math.sin(u * Math.PI * 2));
    const ex = [{ eyes: 'happy', mouth: 'open' }, { eyes: 'star', mouth: 'grin' }, { eyes: 'heart', mouth: 'open' }, { eyes: 'wink', mouth: 'grin' }][idx];
    A.gut(ctx, 540 + Math.sin(u * Math.PI) * 60, 1560 - dance * 40, 300, t, { ...ex, squash: 0.06 * (1 - dance), armL: -0.8 + dance, armR: -0.8 + dance });
  } else {
    // your gut rn:
    A.rays(ctx, 540, 1000, 20, t * 0.3, C.yellow, '#FFE57A');
    const R = rng(4);
    for (let i = 0; i < 16; i++) {
      const hx = R() * W, sp = 200 + R() * 300, ph = R();
      const hy = H + 100 - ((lu * sp + ph * 900) % (H + 200));
      L.heart(ctx, hx, hy, 30 + R() * 40);
      ctx.fillStyle = i % 2 ? C.pink : C.red;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = C.ink;
      ctx.stroke();
    }
    popText(ctx, lu, 0.05, 'your gut rn:', 540, 400, { font: 'Brush', size: 140, fill: C.pink, strokeW: 16 }, -0.05);
    const m = E.outElastic(prog(lu, 0.2, 1.0));
    A.gut(ctx, 540, 1080, 680 * m, t, { eyes: 'happy', mouth: 'open', tears: true, armL: -1.1, armR: -1.1, wave: 1, squash: 0.05 * Math.sin(t * 12) });
    popText(ctx, lu, 0.6, '(happy tears)', 540, 1600, { font: 'Brush', size: 80, fill: C.white, strokeW: 12 }, 0.03);
  }
}

const FLAVOR_ORDER = [
  { key: 'blueberry', line: 'juicy. floral. main-character energy.' },
  { key: 'orange', line: 'your childhood creamsicle, but grown up.' },
  { key: 'cucumber', line: 'self-care in a can.' },
];
const FRUIT_SETS = {
  blueberry: [A.blueberry, A.litchi, A.blueberry, (c, x, y, r, rot) => A.litchi(c, x, y, r, rot, true)],
  orange: [A.orangeSlice, A.creamSwirl, A.orangeWhole, A.orangeSlice],
  cucumber: [A.cucumberSlice, (c, x, y, r, rot) => A.mintLeaf(c, x, y, r * 2, rot), A.cucumberSlice, (c, x, y, r, rot) => A.mintLeaf(c, x, y, r * 2, rot, '#43D98A')],
};
function flavors(ctx, t) {
  const i = Math.min(2, Math.floor((t - 40) / 6));
  const u = t - 40 - i * 6;
  const { key, line } = FLAVOR_ORDER[i];
  const F = A.FLAVORS[key];
  A.rays(ctx, 540, 1050, 16, t * 0.22 * (i % 2 ? -1 : 1), F.bg, F.bg2);
  A.halftone(ctx, 'rgba(255,255,255,0.12)', 44, 9, t);
  ctx.save();
  ctx.translate(540, 1050);
  ctx.rotate(-0.22);
  ctx.translate(-540, -1050);
  marquee(ctx, `${F.a} ${F.b} `, 760, t, 260, 230, 'rgba(255,255,255,0.22)', 'Dela');
  marquee(ctx, `${F.b} ${F.a} `, 1360, t, -260, 230, 'rgba(255,255,255,0.22)', 'Dela');
  ctx.restore();
  A.bubbles(ctx, t, 30 + i, 22, 'rgba(255,255,255,0.7)');
  pill(ctx, `0${i + 1} / 03`, 540, 215, { size: 36, fill: C.white, shadow: 6 * popS(u, 0.1) });

  // orbiting fruit burst
  const canX = 540, canY = 1100;
  const burstK = E.outBack(prog(u, 0.45, 1.0), 1.4);
  const fs = FRUIT_SETS[key];
  const items = [];
  const R = rng(100 + i);
  for (let k = 0; k < 11; k++) {
    const a0 = (k / 11) * TAU + R() * 0.3;
    const dist = (330 + R() * 170) * burstK;
    const a = a0 + u * 0.28 * (k % 2 ? 1 : -1) * 0.6;
    const x = canX + Math.cos(a) * dist * 1.05;
    const y = canY + Math.sin(a) * dist * 1.25 + Math.sin(u * 2 + k) * 14;
    const r = (55 + R() * 45) * (0.6 + 0.4 * burstK);
    items.push({ x, y, r, fn: fs[k % fs.length], rot: R() * TAU + u * (R() - 0.5), front: Math.sin(a) > 0 });
  }
  if (burstK > 0) items.filter((it) => !it.front).forEach((it) => it.fn(ctx, it.x, it.y, it.r, it.rot));
  // can
  const enter = E.outBack(prog(u, 0, 0.6), 1.3);
  const spin = (1 - E.outCubic(prog(u, 0, 1.5))) * TAU * 1.5 + Math.sin(u * 1.2) * 0.4;
  const beat = 1 + 0.02 * Math.exp(-((t % 0.5) * 9));
  A.drawCan(ctx, canX, lerp(2600, canY, enter), 840 * beat, key, spin, Math.sin(u * 1.6) * 0.05, { open: false });
  splash(ctx, canX, canY + 200, t, 40 + i * 6 + 0.5, [C.white, F.light, C.yellow], 7 + i, 20);
  if (burstK > 0) items.filter((it) => it.front).forEach((it) => it.fn(ctx, it.x, it.y, it.r, it.rot));
  // titles
  bounceText(ctx, u, 0.15, F.a, 540, 350, { font: 'Bagel', size: fitSize(ctx, F.a, 'Bagel', 940, 190), fill: C.white, strokeW: 22 });
  bounceText(ctx, u, 0.4, `× ${F.b}`, 540, 520, { font: 'Bagel', size: 150, fill: C.yellow, strokeW: 20 });
  // one-liner
  const ls = popS(u, 1.2);
  withXf(ctx, 540, 1640, ls, -0.025, () => {
    const size = fitSize(ctx, line, 'Brush', 900, 92);
    const w = L.measure(ctx, line, 'Brush', size) + 80;
    ctx.fillStyle = C.ink;
    L.roundRect(ctx, -w / 2 + 10, -size * 0.75 + 12, w, size * 1.5, 30);
    ctx.fill();
    ctx.fillStyle = C.white;
    L.roundRect(ctx, -w / 2, -size * 0.75, w, size * 1.5, 30);
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = C.ink;
    ctx.stroke();
    stickerText(ctx, line, 0, 4, { font: 'Brush', size, fill: F.bg2, stroke: null, shadow: null });
  });
}

function proof(ctx, t) {
  const u = t - 58;
  bg(ctx, C.ink);
  A.halftone(ctx, 'rgba(255,95,168,0.16)', 44, 10, t);
  sparkles(ctx, t, 77, 16, 'rgba(255,216,61,0.9)');
  const out = 1 - E.inBack(prog(u, 2.3, 2.6));
  popText(ctx, u, 0.1, 'Started in', 540, 520, { font: 'Titan', size: 90, fill: C.white, strokeW: 0, shadow: null }, 0, out);
  slamText(ctx, u, 0.4, 'BENGALURU', 540, 680, { font: 'Bagel', size: fitSize(ctx, 'BENGALURU', 'Bagel', 940, 200), fill: C.yellow, stroke: C.pink, strokeW: 18, shadow: C.pink }, -0.03, out);
  popText(ctx, u, 1.3, 'with one very strong', 540, 870, { font: 'Titan', size: 76, fill: C.white, strokeW: 0, shadow: null }, 0, out);
  popText(ctx, u, 1.7, 'gut feeling.', 540, 1030, { font: 'Brush', size: 170, fill: C.pink, stroke: C.white, strokeW: 10, shadow: null }, -0.05, out);
  if (u > 2.5) {
    popText(ctx, u, 2.6, 'FIRST DROP?', 540, 520, { font: 'Dela', size: fitSize(ctx, 'FIRST DROP?', 'Dela', 940, 120), fill: C.white, strokeW: 0, shadow: C.pink });
    const sw = popS(u, 2.6);
    withXf(ctx, 540, 960, sw, 0, () => A.stopwatch(ctx, 0, 0, 230, E.inOutQuad(prog(u, 2.7, 3.9))));
    // stamp
    if (u >= 3.9) {
      const k = prog(u, 3.9, 4.05);
      withXf(ctx, 540, 960, lerp(2.4, 1, E.outCubic(k)), 0, () => A.stamp(ctx, 'SOLD OUT', 0, 0, 150, -0.18, C.red), clamp(k * 3));
      confetti(ctx, t, 61.9, 15, [C.yellow, C.pink, C.white, C.mint], 80);
    }
    popText(ctx, u, 4.2, 'in 2 hours.', 540, 1330, { font: 'Brush', size: 150, fill: C.yellow, strokeW: 0, shadow: C.pink }, -0.04);
    popText(ctx, u, 5.2, "(don't sleep on this one)", 540, 1500, { font: 'GroteskB', size: 50, fill: C.white, stroke: null, shadow: null });
  }
}

function cta(ctx, t) {
  const u = t - 64;
  A.rays(ctx, 540, 1100, 22, t * 0.3, C.pink, '#FF78B8');
  A.bubbles(ctx, t, 64, 28, 'rgba(255,255,255,0.85)');
  const beat = 1 + 0.02 * Math.exp(-((t % 0.5) * 9));
  const drop = (t0) => E.outBounce(prog(u, t0 - 0.35, t0 + 0.25));
  // side cans then hero
  A.drawCan(ctx, 245, lerp(-600, 1120, drop(0.0)), 640 * beat, 'orange', Math.sin(u * 1.1) * 0.5 - 0.3, -0.12);
  A.drawCan(ctx, 835, lerp(-600, 1120, drop(0.5)), 640 * beat, 'cucumber', Math.sin(u * 1.3 + 1) * 0.5 + 0.3, 0.12);
  // mascot peeks over hero can
  const m = E.outBack(prog(u, 5.5, 5.9));
  A.gut(ctx, 540, lerp(1100, 610, m), 230, t, { eyes: 'wink', mouth: 'grin', wave: 1, armL: 0.2, armR: -1.3 });
  A.drawCan(ctx, 540, lerp(-600, 1070, drop(1.0)), 800 * beat, 'blueberry', Math.sin(u * 0.9) * 0.4, 0);
  shockwave(ctx, 540, 1400, t, 65.0, C.white, 700);
  // FIZZ. FUN. FIBRE.
  const topOut = 1 - E.inBack(prog(u, 4.4, 4.6));
  const words = [['FIZZ.', C.white], ['FUN.', C.yellow], ['FIBRE.', C.white]];
  const size = fitSize(ctx, 'FIZZ. FUN. FIBRE.', 'Bagel', 980, 140);
  let x = 540 - L.measure(ctx, 'FIZZ. FUN. FIBRE.', 'Bagel', size) / 2;
  words.forEach(([w, col], k) => {
    const ww = L.measure(ctx, w + ' ', 'Bagel', size);
    const cw = L.measure(ctx, w, 'Bagel', size);
    slamText(ctx, u, 1.5 + k * 0.5, w, x + cw / 2, 330, { font: 'Bagel', size, fill: col, strokeW: 18 }, (k - 1) * 0.04, topOut);
    x += ww;
  });
  // swap to: Your gut called. Answer it.
  if (u > 4.5) {
    bounceText(ctx, u, 4.6, 'Your gut called.', 540, 250, { font: 'Bagel', size: fitSize(ctx, 'Your gut called.', 'Bagel', 960, 130), fill: C.white, strokeW: 16 }, 0.03);
    slamText(ctx, u, 5.1, 'Answer it.', 540, 410, { font: 'Dela', size: 110, fill: C.yellow, strokeW: 14 }, -0.04);
  }
  // where to buy
  const bs = popS(u, 2.8);
  withXf(ctx, 540, 1580, bs, -0.02, () => pill(ctx, 'thequenzy.com', 0, 0, { font: 'Titan', size: 76, fill: C.yellow, sw: 8, shadow: 10 }));
  popText(ctx, u, 3.1, '@drinkquenzy', 540, 1715, { font: 'Titan', size: 64, fill: C.white, strokeW: 10 });
  // end card
  if (u >= 7.0) {
    const k = E.outCubic(prog(u, 7.0, 7.25));
    ctx.save();
    ctx.beginPath();
    circle(ctx, 540, 960, k * 1300);
    ctx.clip();
    bg(ctx, C.red);
    A.halftone(ctx, 'rgba(255,255,255,0.1)', 44, 10, t);
    bounceText(ctx, u, 7.05, 'quenzy', 540, 880, { font: 'Bagel', size: 280, fill: C.white, stroke: C.ink, strokeW: 30, shadowX: 14, shadowY: 20 }, 0.04);
    popText(ctx, u, 7.3, 'soda, but with a gut feeling.', 540, 1080, { font: 'Brush', size: fitSize(ctx, 'soda, but with a gut feeling.', 'Brush', 900, 90), fill: C.yellow, strokeW: 12 });
    ctx.restore();
  }
}

// --------------------------- transitions ---------------------------
// Diagonal colour slash that fully covers the frame exactly at the cut time.
const CUTS = [
  [4.0, C.pink], [14.0, C.ink], [30.0, C.yellow], [40.0, C.white], [46.0, C.yellow], [52.0, C.white], [58.0, C.pink], [64.0, C.yellow],
];
function slash(ctx, t) {
  for (const [T, col] of CUTS) {
    const d = t - T;
    if (d < -0.22 || d > 0.22) continue;
    // p: 0 -> band enters, 1 -> covers, 2 -> leaves
    const p = d < 0 ? E.inCubic(1 + d / 0.22) : 1 + E.outCubic(d / 0.22);
    const span = 3200;
    const off = lerp(-span, span, p / 2);
    ctx.save();
    ctx.translate(540, 960);
    ctx.rotate(-0.35);
    ctx.fillStyle = col;
    ctx.fillRect(off - 1500, -2000, 3000, 4000);
    ctx.fillStyle = C.ink;
    ctx.fillRect(off - 1500 - 40, -2000, 40, 4000);
    ctx.fillRect(off + 1500, -2000, 40, 4000);
    ctx.restore();
  }
}

// ---------------------------- frame ----------------------------
let grain = null;
function makeGrain() {
  const [c, g] = L.makeCanvas(1200, 2100);
  const img = g.createImageData(1200, 2100);
  const R = rng(1234);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = R() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

function renderFrame(ctx, t) {
  ctx.save();
  const sh = shake(t);
  ctx.translate(540 + sh.dx, 960 + sh.dy);
  ctx.rotate(sh.r);
  ctx.translate(-540, -960);
  if (t < 4) hook(ctx, t);
  else if (t < 14) exhibitA(ctx, t);
  else if (t < 22) exhibitB(ctx, t);
  else if (t < 30) reveal(ctx, t);
  else if (t < 40) stats(ctx, t);
  else if (t < 58) flavors(ctx, t);
  else if (t < 64) proof(ctx, t);
  else cta(ctx, t);
  ctx.restore();
  slash(ctx, t);
  // drop flash
  const fl = Math.max(1 - prog(t, 22.0, 22.25), 0) * (t >= 22 ? 1 : 0);
  if (fl > 0) {
    ctx.save();
    ctx.globalAlpha = fl;
    bg(ctx, C.white);
    ctx.restore();
  }
  // film grain
  if (!grain) grain = makeGrain();
  const R = rng(Math.floor(t * 30) + 1);
  ctx.save();
  ctx.globalAlpha = 0.045;
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grain, -R() * 100, -R() * 150);
  ctx.restore();
  // soft vignette
  const v = ctx.createRadialGradient(540, 960, 700, 540, 960, 1300);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(20,0,30,0.22)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

module.exports = { renderFrame, CUES, DURATION };
