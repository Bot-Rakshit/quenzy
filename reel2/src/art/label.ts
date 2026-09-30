// Can label artwork, drawn on a canvas and wrapped around the 3D can.
// Layout follows the real Quenzy can system (pink header band, red wordmark,
// yellow "Fizz. Fun. Fibre." callout, hand-drawn fruit, colour per flavour),
// redrawn here as an interpretation.
import { FLAVORS, FlavorKey, C } from '../theme';
import * as F from './fruits2d';

export const LABEL_W = 2048;
export const LABEL_H = 1408;

const cache: Partial<Record<FlavorKey, HTMLCanvasElement>> = {};

function repeat(ctx: CanvasRenderingContext2D, text: string, y: number, font: string, color: string, gap: number, spacing = 0) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  (ctx as any).letterSpacing = `${spacing}px`;
  const w = ctx.measureText(text).width + gap;
  for (let x = -w * 0.25; x < LABEL_W + w; x += w) ctx.fillText(text, x, y);
  ctx.restore();
}

function pill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number) {
  ctx.save();
  ctx.font = `800 ${size}px "Inter Tight"`;
  (ctx as any).letterSpacing = `${size * 0.04}px`;
  const w = ctx.measureText(text).width + size * 1.4;
  const h = size * 1.7;
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.roundRect(x - w / 2 + 5, y - h / 2 + 6, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = C.yellow;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + size * 0.05);
  ctx.restore();
}

export function wordmark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot = -0.06, fill = C.red, key = C.white) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = `${size}px "Bagel Fat One"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  // soft drop
  ctx.fillStyle = 'rgba(20,11,31,0.9)';
  ctx.strokeStyle = 'rgba(20,11,31,0.9)';
  ctx.lineWidth = size * 0.17;
  ctx.strokeText('quenzy', size * 0.03, size * 0.06);
  ctx.fillText('quenzy', size * 0.03, size * 0.06);
  ctx.strokeStyle = key;
  ctx.lineWidth = size * 0.14;
  ctx.strokeText('quenzy', 0, 0);
  ctx.fillStyle = fill;
  ctx.fillText('quenzy', 0, 0);
  ctx.restore();
}

export function makeLabel(key: FlavorKey): HTMLCanvasElement {
  if (cache[key]) return cache[key]!;
  const f = FLAVORS[key];
  const cv = document.createElement('canvas');
  cv.width = LABEL_W;
  cv.height = LABEL_H;
  const ctx = cv.getContext('2d')!;
  const cx = LABEL_W / 2;

  // base colour with a gentle vertical falloff
  const g = ctx.createLinearGradient(0, 0, 0, LABEL_H);
  g.addColorStop(0, f.bg);
  g.addColorStop(1, f.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LABEL_W, LABEL_H);

  // fine dot texture
  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  for (let y = 240; y < 1290; y += 34) {
    for (let x = (Math.round(y / 34) % 2) * 17; x < LABEL_W; x += 34) {
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // back of can: scattered fruit + brand copy (visible when it spins)
  const R = F.rng(key.length * 31 + 7);
  const doodle = (x: number, y: number, s: number, r: number) => {
    if (key === 'blueberry') (r > 0.5 ? F.blueberry(ctx, x, y, s, r * 6) : F.litchi(ctx, x, y, s, r * 6));
    else if (key === 'orange') (r > 0.5 ? F.orangeSlice(ctx, x, y, s, r * 6) : F.creamSwirl(ctx, x, y, s, r - 0.5));
    else (r > 0.5 ? F.cucumberSlice(ctx, x, y, s, r) : F.mintLeaf(ctx, x, y, s * 1.9, r * 6));
  };
  for (let i = 0; i < 16; i++) {
    const side = i % 2;
    const x = side ? 80 + R() * 420 : LABEL_W - 80 - R() * 420;
    const y = 300 + R() * 900;
    doodle(x, y, 44 + R() * 30, R());
  }
  ctx.save();
  ctx.translate(90, 760);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '800 64px "Inter Tight"';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'center';
  ctx.fillText('BOLD FLAVOURS · GUT FIBRE · NO ADDED SUGAR · JUST VIBES', 0, 0);
  ctx.restore();

  // pink header band
  ctx.fillStyle = C.pink;
  ctx.fillRect(0, 0, LABEL_W, 220);
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 216, LABEL_W, 8);
  repeat(ctx, 'SODA WITH PREBIOTIC FIBRE   •   ', 112, '700 50px "Inter"', C.white, 0, 3);

  // wordmark
  wordmark(ctx, cx, 420, 205);

  // fruit cluster
  const fy = 740, s = 190;
  if (key === 'blueberry') {
    F.litchi(ctx, cx + s * 0.55, fy + s * 0.05, s * 0.62, 0.2, true);
    F.blueberry(ctx, cx - s * 0.5, fy - s * 0.2, s * 0.44, -0.2);
    F.blueberry(ctx, cx - s * 0.1, fy + s * 0.42, s * 0.36, 0.5);
    F.blueberry(ctx, cx - s * 0.72, fy + s * 0.38, s * 0.3, 0.9);
  } else if (key === 'orange') {
    F.creamSwirl(ctx, cx + s * 0.5, fy + s * 0.05, s * 0.55, 0.12);
    F.orangeWhole(ctx, cx - s * 0.45, fy + s * 0.02, s * 0.5, -0.15);
    F.orangeSlice(ctx, cx + s * 0.02, fy + s * 0.45, s * 0.34, 0.3);
  } else {
    F.mintLeaf(ctx, cx + s * 0.62, fy - s * 0.25, s * 0.75, 0.6);
    F.mintLeaf(ctx, cx + s * 0.3, fy - s * 0.45, s * 0.6, -0.2, '#38D07C');
    F.cucumberSlice(ctx, cx - s * 0.35, fy + s * 0.05, s * 0.55, 0);
    F.cucumberSlice(ctx, cx + s * 0.35, fy + s * 0.38, s * 0.38, 0.4);
  }

  pill(ctx, 'FIZZ. FUN. FIBRE.', cx, 1000, 44);

  // flavour name
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.font = '900 84px "Inter Tight"';
  (ctx as any).letterSpacing = '2px';
  for (const [txt, y, col] of [[f.a.toUpperCase(), 1115, C.white], [`× ${f.b.toUpperCase()}`, 1205, f.light]] as const) {
    ctx.lineWidth = 14;
    ctx.strokeStyle = C.ink;
    ctx.strokeText(txt, cx + 4, y + 5);
    ctx.fillStyle = C.ink;
    ctx.fillText(txt, cx + 4, y + 5);
    ctx.strokeText(txt, cx, y);
    ctx.fillStyle = col;
    ctx.fillText(txt, cx, y);
  }
  ctx.restore();

  // bottom band
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 1296, LABEL_W, 112);
  repeat(ctx, '<15 KCAL   •   5g PREBIOTIC FIBRE   •   NO ADDED SUGAR   •   250 ML   •   ', 1352, '600 40px "Inter"', C.cream, 0, 2);

  cache[key] = cv;
  return cv;
}

// Condensation normal map: droplets as little domes, converted to a tangent-space
// normal map. Tiles horizontally.
let dropCache: HTMLCanvasElement | null = null;
export function makeDropletNormals(): HTMLCanvasElement {
  if (dropCache) return dropCache;
  const w = 1024, h = 704;
  const hc = document.createElement('canvas');
  hc.width = w;
  hc.height = h;
  const hx = hc.getContext('2d')!;
  hx.fillStyle = '#000';
  hx.fillRect(0, 0, w, h);
  const R = F.rng(99);
  for (let i = 0; i < 900; i++) {
    const x = R() * w, y = R() * h;
    const r = R() < 0.9 ? 2 + R() * 5 : 7 + R() * 9;
    for (const ox of [-w, 0, w]) {
      const gr = hx.createRadialGradient(x + ox, y, 0, x + ox, y, r);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.7, 'rgba(255,255,255,0.55)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      hx.fillStyle = gr;
      hx.beginPath();
      hx.ellipse(x + ox, y, r * 0.85, r, 0, 0, Math.PI * 2);
      hx.fill();
    }
  }
  const src = hx.getImageData(0, 0, w, h).data;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ox = out.getContext('2d')!;
  const img = ox.createImageData(w, h);
  const H = (x: number, y: number) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  const k = 3.0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * k;
      const dy = (H(x, y + 1) - H(x, y - 1)) * k;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ox.putImageData(img, 0, 0);
  dropCache = out;
  return out;
}
