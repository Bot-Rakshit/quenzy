// Hand-drawn style fruit illustrations (ported from the v1 reel) for label art
// and 3D slice textures. Plain Canvas2D, runs in the browser.
/* eslint-disable */
const TAU = Math.PI * 2;
const C = { ink: '#140B1F' };
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}
function circle(ctx: any, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, TAU);
}
function star(ctx: any, x: number, y: number, rOut: number, rIn: number, n = 5, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? rIn : rOut;
    const a = rot + (i * Math.PI) / n;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
}
export function outline(ctx: any, w: number, color = C.ink) {
  ctx.lineWidth = w;
  ctx.strokeStyle = color;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

export function blueberry(ctx: any, x: any, y: any, r: any, rot = 0) {
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

export function litchi(ctx: any, x: any, y: any, r: any, rot = 0, cut = false) {
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

export function orangeSlice(ctx: any, x: any, y: any, r: any, rot = 0) {
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

export function orangeWhole(ctx: any, x: any, y: any, r: any, rot = 0) {
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

export function creamSwirl(ctx: any, x: any, y: any, r: any, rot = 0) {
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

export function cucumberSlice(ctx: any, x: any, y: any, r: any, rot = 0) {
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

export function mintLeaf(ctx: any, x: any, y: any, len: any, rot = 0, color = '#2DBE6C') {
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

