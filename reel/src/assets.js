// Hand-built vector assets: fruits, can labels, 3D-ish rotating cans, the gut
// mascot and props. Everything is drawn procedurally so it scales cleanly.
const L = require('./lib');
const { C, makeCanvas, circle, roundRect, star, sparkle, heart, stickerText, pill, rng } = L;

const TAU = Math.PI * 2;

// ======================= FRUITS =======================
function outline(ctx, w, color = C.ink) {
  ctx.lineWidth = w;
  ctx.strokeStyle = color;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

function blueberry(ctx, x, y, r, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#6F63F2');
  g.addColorStop(1, '#2B1F86');
  circle(ctx, 0, 0, r);
  ctx.fillStyle = g;
  ctx.fill();
  outline(ctx, r * 0.1);
  // dusty bloom
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#C9C3FF';
  circle(ctx, r * 0.3, r * 0.35, r * 0.28);
  ctx.fill();
  ctx.globalAlpha = 1;
  // crown
  star(ctx, 0, -r * 0.52, r * 0.3, r * 0.12, 5);
  ctx.fillStyle = '#1A1150';
  ctx.fill();
  // shine
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.45, -r * 0.1, r * 0.12, r * 0.22, 0.4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function litchi(ctx, x, y, r, rot = 0, cut = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  // bumpy skin
  ctx.beginPath();
  const n = 120;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const rr = r * (1 + 0.055 * Math.abs(Math.sin(a * 8)));
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.05);
  g.addColorStop(0, '#FF8FA8');
  g.addColorStop(1, '#D8264E');
  ctx.fillStyle = g;
  ctx.fill();
  outline(ctx, r * 0.09);
  // skin texture ticks
  const R = rng(7);
  ctx.fillStyle = 'rgba(120,10,40,0.45)';
  for (let i = 0; i < 26; i++) {
    const a = R() * TAU, d = R() * r * 0.8;
    const px = Math.cos(a) * d, py = Math.sin(a) * d;
    ctx.beginPath();
    ctx.moveTo(px, py - r * 0.06);
    ctx.lineTo(px + r * 0.05, py + r * 0.04);
    ctx.lineTo(px - r * 0.05, py + r * 0.04);
    ctx.fill();
  }
  if (cut) {
    // peeled window showing pearly flesh + seed
    ctx.beginPath();
    ctx.ellipse(r * 0.12, r * 0.05, r * 0.66, r * 0.7, 0.2, 0, TAU);
    ctx.fillStyle = '#FFF7F2';
    ctx.fill();
    outline(ctx, r * 0.07);
    ctx.beginPath();
    ctx.ellipse(r * 0.18, r * 0.12, r * 0.24, r * 0.34, 0.2, 0, TAU);
    ctx.fillStyle = '#7A3B1E';
    ctx.fill();
    outline(ctx, r * 0.05);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, -r * 0.2, r * 0.1, r * 0.2, 0.5, 0, TAU);
    ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.42, -r * 0.3, r * 0.1, r * 0.2, 0.6, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function orangeSlice(ctx, x, y, r, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  circle(ctx, 0, 0, r);
  ctx.fillStyle = '#FF8A1E';
  ctx.fill();
  outline(ctx, r * 0.09);
  circle(ctx, 0, 0, r * 0.84);
  ctx.fillStyle = '#FFF0D2';
  ctx.fill();
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU + 0.07, a1 = ((i + 1) / n) * TAU - 0.07;
    ctx.beginPath();
    ctx.moveTo(Math.cos((a0 + a1) / 2) * r * 0.12, Math.sin((a0 + a1) / 2) * r * 0.12);
    ctx.arc(0, 0, r * 0.75, a0, a1);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? '#FFA53A' : '#FF9A26';
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + 0.35;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.05, r * 0.14, a + Math.PI / 2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function orangeWhole(ctx, x, y, r, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  // leaf
  ctx.beginPath();
  ctx.moveTo(r * 0.05, -r * 0.9);
  ctx.quadraticCurveTo(r * 0.55, -r * 1.55, r * 1.0, -r * 1.2);
  ctx.quadraticCurveTo(r * 0.55, -r * 0.75, r * 0.05, -r * 0.9);
  ctx.fillStyle = '#2FB36B';
  ctx.fill();
  outline(ctx, r * 0.08);
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#FFB24A');
  g.addColorStop(1, '#F06A00');
  circle(ctx, 0, 0, r);
  ctx.fillStyle = g;
  ctx.fill();
  outline(ctx, r * 0.09);
  const R = rng(3);
  ctx.fillStyle = 'rgba(180,70,0,0.35)';
  for (let i = 0; i < 30; i++) {
    const a = R() * TAU, d = R() * r * 0.85;
    circle(ctx, Math.cos(a) * d, Math.sin(a) * d, r * 0.03);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.45, -r * 0.3, r * 0.1, r * 0.22, 0.6, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function creamSwirl(ctx, x, y, r, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const tiers = [
    [0, r * 0.45, r * 1.0, r * 0.42],
    [0, r * 0.02, r * 0.78, r * 0.36],
    [0, -r * 0.36, r * 0.52, r * 0.3],
  ];
  // tip
  ctx.beginPath();
  ctx.moveTo(-r * 0.25, -r * 0.55);
  ctx.quadraticCurveTo(-r * 0.05, -r * 1.05, r * 0.3, -r * 0.95);
  ctx.quadraticCurveTo(r * 0.1, -r * 0.8, r * 0.25, -r * 0.55);
  ctx.closePath();
  ctx.fillStyle = '#FFF6E6';
  ctx.fill();
  outline(ctx, r * 0.08);
  for (let i = tiers.length - 1; i >= 0; i--) {
    const [cx, cy, rx, ry] = tiers[i];
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
    ctx.fillStyle = i === 0 ? '#FFE7C2' : '#FFF1DA';
    ctx.fill();
    outline(ctx, r * 0.08);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.45, cy - ry * 0.3, rx * 0.18, ry * 0.25, -0.3, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function cucumberSlice(ctx, x, y, r, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  circle(ctx, 0, 0, r);
  ctx.fillStyle = '#1E7A3E';
  ctx.fill();
  outline(ctx, r * 0.09);
  circle(ctx, 0, 0, r * 0.86);
  ctx.fillStyle = '#9BE07A';
  ctx.fill();
  circle(ctx, 0, 0, r * 0.55);
  ctx.fillStyle = '#D9F7C4';
  ctx.fill();
  ctx.fillStyle = '#F3FFE9';
  for (let k = 0; k < 3; k++) {
    for (let j = 0; j < 3; j++) {
      const a = (k / 3) * TAU + (j - 1) * 0.35;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * r * 0.33, Math.sin(a) * r * 0.33, r * 0.05, r * 0.1, a, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(30,122,62,0.5)';
      ctx.lineWidth = r * 0.02;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function mintLeaf(ctx, x, y, len, rot = 0, color = '#2DBE6C') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const w = len * 0.42;
  ctx.beginPath();
  ctx.moveTo(0, len * 0.5);
  ctx.bezierCurveTo(w, len * 0.3, w * 1.1, -len * 0.25, 0, -len * 0.5);
  ctx.bezierCurveTo(-w * 1.1, -len * 0.25, -w, len * 0.3, 0, len * 0.5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  outline(ctx, len * 0.06);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = len * 0.035;
  ctx.beginPath();
  ctx.moveTo(0, len * 0.5);
  ctx.lineTo(0, -len * 0.38);
  for (let i = 0; i < 4; i++) {
    const yy = len * (0.25 - i * 0.18);
    ctx.moveTo(0, yy);
    ctx.lineTo(w * 0.55, yy - len * 0.12);
    ctx.moveTo(0, yy);
    ctx.lineTo(-w * 0.55, yy - len * 0.12);
  }
  ctx.stroke();
  // stem
  ctx.beginPath();
  ctx.moveTo(0, len * 0.5);
  ctx.lineTo(0, len * 0.65);
  outline(ctx, len * 0.06);
  ctx.restore();
}

// ======================= FLAVOURS =======================
const FLAVORS = {
  blueberry: {
    key: 'blueberry', a: 'BLUEBERRY', b: 'LITCHI', bg: '#7B4CF0', bg2: '#5B2FD0', light: '#D9CCFF', accent: C.litchi,
    fruits: (ctx, x, y, s) => {
      litchi(ctx, x + s * 0.55, y + s * 0.05, s * 0.62, 0.2, true);
      blueberry(ctx, x - s * 0.5, y - s * 0.2, s * 0.44, -0.2);
      blueberry(ctx, x - s * 0.1, y + s * 0.42, s * 0.36, 0.5);
      blueberry(ctx, x - s * 0.72, y + s * 0.38, s * 0.3, 0.9);
    },
    doodle: (ctx, x, y, s, r) => (r > 0.5 ? blueberry(ctx, x, y, s * 0.5, r * 6) : litchi(ctx, x, y, s * 0.5, r * 6)),
  },
  orange: {
    key: 'orange', a: 'ORANGE', b: 'CREAM', bg: '#FF8A1E', bg2: '#F06A00', light: '#FFE3B8', accent: C.cream,
    fruits: (ctx, x, y, s) => {
      creamSwirl(ctx, x + s * 0.5, y + s * 0.05, s * 0.55, 0.12);
      orangeWhole(ctx, x - s * 0.45, y + s * 0.02, s * 0.5, -0.15);
      orangeSlice(ctx, x + s * 0.02, y + s * 0.45, s * 0.34, 0.3);
    },
    doodle: (ctx, x, y, s, r) => (r > 0.5 ? orangeSlice(ctx, x, y, s * 0.5, r * 6) : creamSwirl(ctx, x, y, s * 0.5, r - 0.5)),
  },
  cucumber: {
    key: 'cucumber', a: 'CUCUMBER', b: 'MINT', bg: '#2FCB8E', bg2: '#16A56E', light: '#C4F7DF', accent: '#E9FFF3',
    fruits: (ctx, x, y, s) => {
      mintLeaf(ctx, x + s * 0.62, y - s * 0.25, s * 0.75, 0.6);
      mintLeaf(ctx, x + s * 0.3, y - s * 0.45, s * 0.6, -0.2, '#38D07C');
      cucumberSlice(ctx, x - s * 0.35, y + s * 0.05, s * 0.55, 0);
      cucumberSlice(ctx, x + s * 0.35, y + s * 0.38, s * 0.38, 0.4);
    },
    doodle: (ctx, x, y, s, r) => (r > 0.5 ? cucumberSlice(ctx, x, y, s * 0.5, r) : mintLeaf(ctx, x, y, s * 0.9, r * 6)),
  },
};

// ======================= CAN LABELS =======================
const LABEL_W = 1400, LABEL_H = 1000;
const labelCache = {};

function repeatText(ctx, str, y, f, size, color, gap = 60) {
  ctx.save();
  ctx.font = L.font(f, size);
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const w = ctx.measureText(str).width + gap;
  for (let x = -w * 0.3; x < LABEL_W; x += w) ctx.fillText(str, x, y);
  ctx.restore();
}

function makeLabel(key) {
  if (labelCache[key]) return labelCache[key];
  const [cv, ctx] = makeCanvas(LABEL_W, LABEL_H);
  if (key === 'regular') {
    // A deliberately dull, unbranded "regular soda" can.
    const g = ctx.createLinearGradient(0, 0, 0, LABEL_H);
    g.addColorStop(0, '#6B4A3A');
    g.addColorStop(1, '#3E2A22');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, LABEL_W, LABEL_H);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let x = 0; x < LABEL_W; x += 70) ctx.fillRect(x, 0, 30, LABEL_H);
    stickerText(ctx, 'REGULAR', 700, 330, { font: 'Dela', size: 80, fill: '#E9DCCF', stroke: null, shadow: 'rgba(0,0,0,0.35)', shadowX: 6, shadowY: 6 });
    stickerText(ctx, 'SODA', 700, 460, { font: 'Dela', size: 120, fill: '#E9DCCF', stroke: null, shadow: 'rgba(0,0,0,0.35)', shadowX: 6, shadowY: 6 });
    ctx.fillStyle = '#E9DCCF';
    roundRect(ctx, 560, 600, 280, 100, 20);
    ctx.fill();
    stickerText(ctx, '35g SUGAR', 700, 652, { font: 'GroteskB', size: 44, fill: '#3E2A22', stroke: null, shadow: null });
    repeatText(ctx, 'CLASSIC · SUGARY · SAME OLD ·', 900, 'GroteskB', 34, 'rgba(233,220,207,0.6)');
    labelCache[key] = cv;
    return cv;
  }
  const F = FLAVORS[key];
  // background with subtle vertical gradient
  const g = ctx.createLinearGradient(0, 0, 0, LABEL_H);
  g.addColorStop(0, F.bg);
  g.addColorStop(1, F.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LABEL_W, LABEL_H);
  // playful dot pattern
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let y = 180; y < 930; y += 46) {
    for (let x = (y / 46) % 2 ? 0 : 23; x < LABEL_W; x += 46) {
      circle(ctx, x, y, 5);
      ctx.fill();
    }
  }
  // back-side doodles (visible when the can spins)
  const R = rng(key.length * 97);
  for (let i = 0; i < 14; i++) {
    const x = (i % 2 ? 60 + R() * 280 : 1060 + R() * 300);
    const y = 220 + R() * 640;
    F.doodle(ctx, x, y, 70 + R() * 40, R());
  }
  // pink header band
  ctx.fillStyle = C.pink;
  ctx.fillRect(0, 0, LABEL_W, 150);
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 146, LABEL_W, 8);
  repeatText(ctx, 'SODA WITH PREBIOTIC FIBRE  •', 80, 'GroteskB', 40, C.white, 40);
  // wordmark
  ctx.save();
  ctx.translate(700, 300);
  ctx.rotate(-0.05);
  stickerText(ctx, 'quenzy', 0, 0, { font: 'Bagel', size: 150, fill: C.red, stroke: C.white, strokeW: 26, shadow: C.ink, shadowX: 8, shadowY: 11 });
  ctx.restore();
  // fruit cluster
  F.fruits(ctx, 700, 540, 150);
  // callout + flavour name
  pill(ctx, 'FIZZ. FUN. FIBRE.', 700, 720, { size: 34, fill: C.yellow, sw: 5, shadow: 5 });
  stickerText(ctx, F.a, 700, 800, { font: 'Titan', size: 54, fill: C.white, strokeW: 10, shadowX: 4, shadowY: 5 });
  stickerText(ctx, `× ${F.b}`, 700, 865, { font: 'Titan', size: 54, fill: F.light, strokeW: 10, shadowX: 4, shadowY: 5 });
  // bottom band
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 930, LABEL_W, 70);
  repeatText(ctx, '<15 KCAL  •  5g PREBIOTIC FIBRE  •  NO ADDED SUGAR  •  250ml  •', 965, 'GroteskB', 30, C.cream, 30);
  // condensation droplets
  const D = rng(key.length * 13 + 5);
  for (let i = 0; i < 70; i++) {
    const x = D() * LABEL_W, y = 170 + D() * 740, r = 3 + D() * 7;
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(x + 1.5, y + 2, r * 0.8, r, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.8, r, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    circle(ctx, x - r * 0.25, y - r * 0.35, r * 0.25);
    ctx.fill();
  }
  labelCache[key] = cv;
  return cv;
}

// ======================= CAN =======================
// Draws a can centred at (x, y). `h` = total height in px. `spin` rotates the
// label around the cylinder (radians). `tilt` rotates the whole can.
const CAN = { R: 150, top: -320, bot: 320, neck: -372, e: 0.17 };
function drawCan(ctx, x, y, h, key, spin = 0, tilt = 0, o = {}) {
  const tex = makeLabel(key);
  const s = h / 740;
  const { R, top, bot, neck, e } = CAN;
  const eh = R * e;
  const rN = R * 0.84, ehN = rN * e;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(s, s);

  // soft contact shadow
  if (o.shadow !== false) {
    ctx.save();
    ctx.fillStyle = 'rgba(27,15,46,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, bot + 44, R * 1.05, eh * 1.2, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // bottom dome (silver)
  ctx.beginPath();
  ctx.moveTo(-R, bot);
  ctx.lineTo(-R * 0.9, bot + 26);
  ctx.ellipse(0, bot + 26, R * 0.9, eh * 0.9, 0, Math.PI, 0, true);
  ctx.lineTo(R, bot);
  ctx.closePath();
  const sg = ctx.createLinearGradient(-R, 0, R, 0);
  sg.addColorStop(0, '#8E8A99');
  sg.addColorStop(0.3, '#F4F2F8');
  sg.addColorStop(0.6, '#B9B5C4');
  sg.addColorStop(1, '#6C6878');
  ctx.fillStyle = sg;
  ctx.fill();

  // label columns
  const step = 1;
  for (let px = -R; px < R; px += step) {
    const xm = px + step / 2;
    const k = Math.sqrt(Math.max(0, 1 - (xm / R) ** 2));
    const th = Math.asin(xm / R);
    let u = 0.5 + (th + spin) / TAU;
    u -= Math.floor(u);
    const sx = Math.min(LABEL_W - 2, u * LABEL_W);
    const y0 = top + eh * k, y1 = bot + eh * k;
    // width of texture slice ~ derivative of theta
    const sw = Math.max(1, (LABEL_W / TAU) * (step / R) / Math.max(0.15, k));
    ctx.drawImage(tex, sx, 0, Math.min(sw, LABEL_W - sx), LABEL_H, px, y0, step + 0.8, y1 - y0);
  }
  // body path for shading
  const bodyPath = () => {
    ctx.beginPath();
    ctx.moveTo(-R, top);
    ctx.ellipse(0, top, R, eh, 0, Math.PI, 0, true);
    ctx.lineTo(R, bot);
    ctx.ellipse(0, bot, R, eh, 0, 0, Math.PI, false);
    ctx.closePath();
  };
  ctx.save();
  bodyPath();
  ctx.clip();
  const sh = ctx.createLinearGradient(-R, 0, R, 0);
  sh.addColorStop(0, 'rgba(10,0,30,0.55)');
  sh.addColorStop(0.12, 'rgba(10,0,30,0.15)');
  sh.addColorStop(0.22, 'rgba(255,255,255,0.0)');
  sh.addColorStop(0.3, 'rgba(255,255,255,0.45)');
  sh.addColorStop(0.36, 'rgba(255,255,255,0.0)');
  sh.addColorStop(0.7, 'rgba(10,0,30,0.0)');
  sh.addColorStop(0.8, 'rgba(255,255,255,0.18)');
  sh.addColorStop(0.86, 'rgba(10,0,30,0.1)');
  sh.addColorStop(1, 'rgba(10,0,30,0.6)');
  ctx.fillStyle = sh;
  ctx.fillRect(-R, top - eh, R * 2, bot - top + eh * 3);
  ctx.restore();

  // neck
  ctx.beginPath();
  ctx.moveTo(-R, top);
  ctx.bezierCurveTo(-R, top - 20, -rN, neck + 22, -rN, neck);
  ctx.lineTo(rN, neck);
  ctx.bezierCurveTo(rN, neck + 22, R, top - 20, R, top);
  ctx.ellipse(0, top, R, eh, 0, 0, Math.PI, false);
  ctx.closePath();
  ctx.fillStyle = sg;
  ctx.fill();
  // lid
  ctx.beginPath();
  ctx.ellipse(0, neck, rN, ehN, 0, 0, TAU);
  const lg = ctx.createLinearGradient(-rN, 0, rN, 0);
  lg.addColorStop(0, '#A7A3B2');
  lg.addColorStop(0.4, '#FFFFFF');
  lg.addColorStop(1, '#8D899A');
  ctx.fillStyle = lg;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, neck + 2, rN * 0.82, ehN * 0.72, 0, 0, TAU);
  ctx.strokeStyle = 'rgba(60,55,75,0.55)';
  ctx.lineWidth = 4;
  ctx.stroke();
  // pull tab
  if (o.open) {
    ctx.fillStyle = '#231a33';
    ctx.beginPath();
    ctx.ellipse(-rN * 0.25, neck + 2, rN * 0.22, ehN * 0.35, 0, 0, TAU);
    ctx.fill();
  }
  ctx.save();
  ctx.translate(rN * 0.05, neck);
  ctx.rotate(o.open ? -0.5 : 0);
  roundRect(ctx, -rN * 0.1, -ehN * 0.42, rN * 0.5, ehN * 0.75, 12);
  ctx.fillStyle = '#D9D6E2';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(40,30,60,0.8)';
  ctx.stroke();
  ctx.restore();

  // silhouette outline (sticker look)
  ctx.beginPath();
  ctx.moveTo(-rN, neck);
  ctx.bezierCurveTo(-rN, neck + 22, -R, top - 20, -R, top);
  ctx.lineTo(-R, bot);
  ctx.lineTo(-R * 0.9, bot + 26);
  ctx.ellipse(0, bot + 26, R * 0.9, eh * 0.9, 0, Math.PI, 0, true);
  ctx.lineTo(R, bot);
  ctx.lineTo(R, top);
  ctx.bezierCurveTo(R, top - 20, rN, neck + 22, rN, neck);
  ctx.lineWidth = 8;
  ctx.strokeStyle = C.ink;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, top, R, eh, 0, 0, Math.PI, false);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(27,15,46,0.5)';
  ctx.stroke();
  ctx.restore();
}

// ======================= GUT MASCOT ("Gutsy") =======================
// A cheeky little stomach. expr: {eyes, mouth, brows, blush, tears, sweat, tint}
function gut(ctx, x, y, size, t, expr = {}) {
  const s = size / 260;
  const {
    eyes = 'normal', mouth = 'smile', brows = null, tears = false, sweat = false,
    tint = null, squash = 0, armL = 0.3, armR = -0.3, wave = 0, lookX = 0, lookY = 0,
    bloat = 0, legs = true, blink = true,
  } = expr;
  const body = tint || '#FF7EB6';
  const bodyDark = tint ? shade(tint, -0.25) : '#E2508F';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * (1 + squash + bloat), s * (1 - squash * 0.8 + bloat * 0.4));
  const lw = 9;
  const pinkStroke = (pathFn, w) => {
    pathFn();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = w + lw * 2;
    ctx.stroke();
    pathFn();
    ctx.strokeStyle = body;
    ctx.lineWidth = w;
    ctx.stroke();
  };
  // legs
  if (legs) {
    for (const side of [-1, 1]) {
      const kick = Math.sin(t * 10 + side) * 6 * (wave ? 1 : 0);
      ctx.beginPath();
      ctx.moveTo(side * 35, 95);
      ctx.lineTo(side * 42 + kick, 150);
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(side * 50 + kick, 154, 22, 11, 0, 0, TAU);
      ctx.fillStyle = C.ink;
      ctx.fill();
    }
  }
  // esophagus (top) + intestine (bottom) tubes
  pinkStroke(() => {
    ctx.beginPath();
    ctx.moveTo(30, -90);
    ctx.bezierCurveTo(30, -130, 55, -140, 60, -175);
  }, 30);
  pinkStroke(() => {
    ctx.beginPath();
    ctx.moveTo(-70, 70);
    ctx.bezierCurveTo(-110, 100, -140, 70, -150, 110);
  }, 28);
  // arms
  const arm = (side, ang) => {
    const sx = side * 118, sy = 5;
    const len = 70;
    const a = (side > 0 ? 0 : Math.PI) + ang * side * -1 + (wave ? Math.sin(t * 14) * 0.5 * (side > 0 ? 1 : 0.4) * wave : 0);
    const ex = sx + Math.cos(a) * len, ey = sy + Math.sin(a) * len;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + ex) / 2 + side * 5, (sy + ey) / 2 + 12, ex, ey);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();
    circle(ctx, ex, ey, 16);
    ctx.fillStyle = C.white;
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.stroke();
  };
  arm(-1, armL);
  arm(1, armR);
  // body (bean-shaped stomach)
  const bodyPath = () => {
    ctx.beginPath();
    ctx.moveTo(10, -100);
    ctx.bezierCurveTo(90, -115, 135, -45, 125, 20);
    ctx.bezierCurveTo(115, 95, 30, 120, -35, 105);
    ctx.bezierCurveTo(-110, 90, -135, 20, -118, -35);
    ctx.bezierCurveTo(-100, -80, -45, -60, -20, -88);
    ctx.bezierCurveTo(-10, -98, 0, -100, 10, -100);
    ctx.closePath();
  };
  bodyPath();
  const g = ctx.createRadialGradient(-30, -40, 10, 0, 0, 150);
  g.addColorStop(0, shade(body, 0.2));
  g.addColorStop(1, bodyDark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
  // belly fold lines
  ctx.strokeStyle = 'rgba(160,30,90,0.45)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-80, 60);
  ctx.quadraticCurveTo(-60, 78, -30, 80);
  ctx.stroke();
  // shine
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(-70, -40, 16, 28, 0.6, 0, TAU);
  ctx.fill();

  // face
  const ex1 = -22 + lookX * 6, ex2 = 48 + lookX * 6, ey = -12 + lookY * 5;
  const blinking = blink && (t % 3.1) > 3.0;
  const eye = (cx, cy, i) => {
    ctx.save();
    ctx.fillStyle = C.ink;
    ctx.strokeStyle = C.ink;
    ctx.lineCap = 'round';
    ctx.lineWidth = 8;
    if (eyes === 'happy' || (blinking && eyes === 'normal')) {
      ctx.beginPath();
      if (blinking && eyes === 'normal') {
        ctx.moveTo(cx - 14, cy);
        ctx.lineTo(cx + 14, cy);
      } else ctx.arc(cx, cy + 6, 14, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (eyes === 'spiral') {
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let k = 0; k < 40; k++) {
        const a = k * 0.45 + t * 8 * (i ? 1 : -1), r = k * 0.5;
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx.stroke();
    } else if (eyes === 'heart') {
      const p = 1 + 0.15 * Math.sin(t * 12);
      heart(ctx, cx, cy + 4, 22 * p);
      ctx.fillStyle = C.red;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (eyes === 'x') {
      ctx.beginPath();
      ctx.moveTo(cx - 11, cy - 11); ctx.lineTo(cx + 11, cy + 11);
      ctx.moveTo(cx + 11, cy - 11); ctx.lineTo(cx - 11, cy + 11);
      ctx.stroke();
    } else if (eyes === 'wink' && i === 1) {
      ctx.beginPath();
      ctx.arc(cx, cy + 6, 14, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (eyes === 'star') {
      star(ctx, cx, cy, 20 * (1 + 0.1 * Math.sin(t * 15)), 9, 5);
      ctx.fillStyle = C.yellow;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      const big = eyes === 'wide' ? 1.35 : 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 13 * big, 17 * big, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = C.white;
      circle(ctx, cx - 4 * big + lookX * 2, cy - 6 * big, 5 * big);
      ctx.fill();
      circle(ctx, cx + 4 * big, cy + 5 * big, 2.2 * big);
      ctx.fill();
    }
    ctx.restore();
  };
  eye(ex1, ey, 0);
  eye(ex2, ey, 1);
  if (brows) {
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const d = brows === 'angry' ? 1 : -1;
    ctx.moveTo(ex1 - 16, ey - 30 - 6 * d);
    ctx.lineTo(ex1 + 14, ey - 30 + 6 * d);
    ctx.moveTo(ex2 + 16, ey - 30 - 6 * d);
    ctx.lineTo(ex2 - 14, ey - 30 + 6 * d);
    ctx.stroke();
  }
  // blush
  ctx.fillStyle = 'rgba(255,40,110,0.45)';
  ctx.beginPath();
  ctx.ellipse(ex1 - 18, ey + 30, 16, 9, 0, 0, TAU);
  ctx.ellipse(ex2 + 18, ey + 30, 16, 9, 0, 0, TAU);
  ctx.fill();
  // mouth
  const mx = 13 + lookX * 5, my = 34 + lookY * 3;
  ctx.strokeStyle = C.ink;
  ctx.fillStyle = '#5A0E2E';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (mouth === 'smile') {
    ctx.arc(mx, my - 8, 16, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else if (mouth === 'open' || mouth === 'grin') {
    const open = mouth === 'open' ? 1 : 0.6;
    ctx.moveTo(mx - 22, my - 4);
    ctx.quadraticCurveTo(mx, my + 34 * open, mx + 22, my - 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#FF6F91';
    circle(ctx, mx, my + 22 * open, 12);
    ctx.fill();
    ctx.restore();
  } else if (mouth === 'frown') {
    ctx.arc(mx, my + 14, 16, 1.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
  } else if (mouth === 'wavy') {
    for (let k = 0; k <= 20; k++) {
      const px = mx - 24 + k * 2.4;
      ctx.lineTo(px, my + Math.sin(k * 0.9 + t * 10) * 5);
    }
    ctx.stroke();
  } else if (mouth === 'o') {
    ctx.ellipse(mx, my + 4, 11, 15, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  } else if (mouth === 'flat') {
    ctx.moveTo(mx - 15, my);
    ctx.lineTo(mx + 15, my);
    ctx.stroke();
  } else if (mouth === 'gag') {
    ctx.ellipse(mx, my + 4, 18, 13, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#9ACD32';
    ctx.beginPath();
    ctx.ellipse(mx, my + 10, 12, 6, 0, 0, TAU);
    ctx.fill();
  }
  if (tears) {
    ctx.fillStyle = '#7FD3FF';
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 4;
    for (const [tx, ph] of [[ex1 - 4, 0], [ex2 + 4, 0.5]]) {
      const k = ((t * 1.5 + ph) % 1);
      const ty = ey + 20 + k * 60;
      ctx.globalAlpha = 1 - k;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 12);
      ctx.quadraticCurveTo(tx + 10, ty + 4, tx, ty + 8);
      ctx.quadraticCurveTo(tx - 10, ty + 4, tx, ty - 12);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  if (sweat) {
    ctx.fillStyle = '#9FE3FF';
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 4;
    const bob = Math.sin(t * 6) * 4;
    ctx.beginPath();
    ctx.moveTo(100, -70 + bob);
    ctx.quadraticCurveTo(116, -44 + bob, 100, -36 + bob);
    ctx.quadraticCurveTo(84, -44 + bob, 100, -70 + bob);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (c) => Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
  r = f(r); g = f(g); b = f(b);
  return `rgb(${r},${g},${b})`;
}

// ======================= PROPS =======================
function sugarCube(ctx, x, y, s, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const a = s * 0.5, b = s * 0.29;
  const top = [[0, -a], [a * 0.87, -a + b], [0, -a + 2 * b], [-a * 0.87, -a + b]];
  const faces = [
    [top, '#FFFFFF'],
    [[[-a * 0.87, -a + b], [0, -a + 2 * b], [0, a], [-a * 0.87, a - b]], '#EAE4F2'],
    [[[a * 0.87, -a + b], [0, -a + 2 * b], [0, a], [a * 0.87, a - b]], '#D2C9E0'],
  ];
  for (const [pts, col] of faces) {
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.lineWidth = s * 0.06;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = C.ink;
    ctx.stroke();
  }
  const R = rng(11);
  ctx.fillStyle = 'rgba(150,140,170,0.6)';
  for (let i = 0; i < 10; i++) {
    circle(ctx, (R() - 0.5) * a * 1.2, (R() - 0.2) * a, s * 0.02);
    ctx.fill();
  }
  ctx.restore();
}

function sludgeGlass(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 400, s / 400);
  // stink lines
  ctx.strokeStyle = '#6E8B3D';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const ox = -60 + i * 60, ph = t * 3 + i;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    for (let k = 0; k <= 20; k++) {
      const yy = -230 - k * 8 - ((t * 40) % 20);
      ctx.lineTo(ox + Math.sin(k * 0.5 + ph) * 14, yy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // glass
  ctx.beginPath();
  ctx.moveTo(-130, -200);
  ctx.lineTo(130, -200);
  ctx.lineTo(100, 200);
  ctx.lineTo(-100, 200);
  ctx.closePath();
  ctx.fillStyle = 'rgba(230,245,255,0.35)';
  ctx.fill();
  // sludge
  ctx.save();
  ctx.clip();
  const g = ctx.createLinearGradient(0, -120, 0, 200);
  g.addColorStop(0, '#8FA646');
  g.addColorStop(1, '#4E6424');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-140, -110);
  for (let k = 0; k <= 28; k++) ctx.lineTo(-140 + k * 10, -110 + Math.sin(k * 0.8 + t * 4) * 7);
  ctx.lineTo(140, 210);
  ctx.lineTo(-140, 210);
  ctx.fill();
  const R = rng(5);
  for (let i = 0; i < 18; i++) {
    const bx = -90 + R() * 180, by = 180 - ((R() * 300 + t * 60) % 290);
    ctx.fillStyle = 'rgba(40,60,10,0.6)';
    circle(ctx, bx, by, 4 + R() * 8);
    ctx.fill();
  }
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(-130, -200);
  ctx.lineTo(-100, 200);
  ctx.lineTo(100, 200);
  ctx.lineTo(130, -200);
  ctx.lineWidth = 10;
  ctx.strokeStyle = C.ink;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, -200, 130, 18, 0, 0, TAU);
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(-95, -160);
  ctx.lineTo(-75, 140);
  ctx.stroke();
  // fly
  const fx = Math.cos(t * 5) * 150, fy = -300 + Math.sin(t * 7) * 60;
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  const flap = Math.sin(t * 60) * 0.5;
  for (const sd of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(fx + sd * 12, fy - 10, 12, 7, sd * (0.6 + flap), 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = C.ink;
  circle(ctx, fx, fy, 10);
  ctx.fill();
  ctx.restore();
}

function stamp(ctx, str, x, y, size, rot, color = C.red) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = L.font('Dela', size);
  const w = ctx.measureText(str).width + size * 0.8;
  const h = size * 1.5;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.12;
  roundRect(ctx, -w / 2, -h / 2, w, h, size * 0.2);
  ctx.stroke();
  roundRect(ctx, -w / 2 + size * 0.14, -h / 2 + size * 0.14, w - size * 0.28, h - size * 0.28, size * 0.14);
  ctx.lineWidth = size * 0.04;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, 0, size * 0.05);
  ctx.restore();
}

function speech(ctx, x, y, w, h, tailX, tailY, fill = C.white) {
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 40);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 30, y + h / 2 - 4);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(x + 20, y + h / 2 - 4);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
  ctx.fillRect(x - 26, y + h / 2 - 12, 42, 12);
  ctx.restore();
}

// Background helpers
function rays(ctx, cx, cy, n, rot, c1, c2, R = 2400) {
  ctx.save();
  ctx.fillStyle = c1;
  ctx.fillRect(-10, -10, L.W + 20, L.H + 20);
  ctx.fillStyle = c2;
  for (let i = 0; i < n; i++) {
    const a0 = rot + (i / n) * TAU, a1 = a0 + TAU / n / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R);
    ctx.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
function halftone(ctx, color, spacing = 36, maxR = 9, t = 0, dir = 1) {
  ctx.save();
  ctx.fillStyle = color;
  const off = (t * 40 * dir) % spacing;
  for (let y = -spacing; y < L.H + spacing; y += spacing) {
    const row = Math.round(y / spacing);
    for (let x = -spacing; x < L.W + spacing; x += spacing) {
      const r = maxR * (0.35 + 0.65 * (y / L.H));
      circle(ctx, x + (row % 2 ? spacing / 2 : 0) + off, y + off * 0.5, r);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Bubble particles rising
function bubbles(ctx, t, seed, n, color, o = {}) {
  const R = rng(seed);
  const { speed = 250, minR = 6, maxR = 22, x0 = 0, x1 = L.W, alpha = 1 } = o;
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    const bx = x0 + R() * (x1 - x0), ph = R(), r = minR + R() * (maxR - minR), sp = speed * (0.6 + R() * 0.8);
    const y = L.H + 60 - (((t * sp) + ph * (L.H + 200)) % (L.H + 200));
    const x = bx + Math.sin(t * 3 + i) * 14;
    circle(ctx, x, y, r);
    ctx.lineWidth = Math.max(2, r * 0.18);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = color;
    circle(ctx, x - r * 0.35, y - r * 0.35, r * 0.22);
    ctx.fill();
  }
  ctx.restore();
}

function stopwatch(ctx, x, y, r, frac) {
  ctx.save();
  ctx.translate(x, y);
  roundRect(ctx, -r * 0.18, -r * 1.3, r * 0.36, r * 0.25, 8);
  ctx.fillStyle = C.ink;
  ctx.fill();
  circle(ctx, 0, 0, r);
  ctx.fillStyle = C.white;
  ctx.fill();
  ctx.lineWidth = r * 0.1;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, r * 0.82, -Math.PI / 2, -Math.PI / 2 + frac * TAU);
  ctx.closePath();
  ctx.fillStyle = C.pink;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  const a = -Math.PI / 2 + frac * TAU;
  ctx.lineTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8);
  ctx.lineWidth = r * 0.07;
  ctx.lineCap = 'round';
  ctx.stroke();
  circle(ctx, 0, 0, r * 0.08);
  ctx.fillStyle = C.ink;
  ctx.fill();
  ctx.restore();
}

module.exports = {
  blueberry, litchi, orangeSlice, orangeWhole, creamSwirl, cucumberSlice, mintLeaf,
  FLAVORS, makeLabel, drawCan, gut, sugarCube, sludgeGlass, stamp, speech, rays, halftone,
  bubbles, stopwatch, shade,
};
