// Usage:
//   node src/render.js stills 0.3 1.2 ...     -> previews/still_<t>.png
//   node src/render.js contact                -> previews/contact.png (1 frame / sec)
//   node src/render.js segment <f0> <f1> <out.mp4>   (frames [f0, f1))
//   node src/render.js cues                   -> build/cues.json
const fs = require('fs');
const { spawn } = require('child_process');
const L = require('./lib');
const { renderFrame, CUES, DURATION } = require('./scenes');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

const [mode, ...args] = process.argv.slice(2);
fs.mkdirSync('previews', { recursive: true });
fs.mkdirSync('build', { recursive: true });

if (mode === 'stills') {
  const [c, ctx] = L.makeCanvas(L.W, L.H);
  for (const a of args) {
    const t = parseFloat(a);
    renderFrame(ctx, t);
    fs.writeFileSync(`previews/still_${t.toFixed(2)}.png`, c.toBuffer('image/png'));
  }
} else if (mode === 'contact') {
  const from = parseFloat(args[0] || 0), to = parseFloat(args[1] || DURATION), step = parseFloat(args[2] || 1);
  const [c, ctx] = L.makeCanvas(L.W, L.H);
  const times = [];
  for (let t = from; t < to - 1e-6; t += step) times.push(t);
  const cols = 8, tw = 270, th = 480;
  const rows = Math.ceil(times.length / cols);
  const [sheet, sctx] = L.makeCanvas(cols * tw, rows * (th + 30));
  sctx.fillStyle = '#222';
  sctx.fillRect(0, 0, sheet.width, sheet.height);
  times.forEach((t, i) => {
    renderFrame(ctx, t);
    const x = (i % cols) * tw, y = Math.floor(i / cols) * (th + 30);
    sctx.drawImage(c, x, y, tw, th);
    sctx.fillStyle = '#fff';
    sctx.font = '22px GroteskB';
    sctx.fillText(t.toFixed(1) + 's', x + 8, y + th + 22);
  });
  fs.writeFileSync(args[3] || 'previews/contact.png', sheet.toBuffer('image/png'));
} else if (mode === 'cues') {
  fs.writeFileSync('build/cues.json', JSON.stringify(CUES.sort((a, b) => a.t - b.t), null, 1));
} else if (mode === 'segment') {
  const f0 = parseInt(args[0]), f1 = parseInt(args[1]), out = args[2];
  const [c, ctx] = L.makeCanvas(L.W, L.H);
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${L.W}x${L.H}`, '-r', String(L.FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  (async () => {
    for (let f = f0; f < f1; f++) {
      renderFrame(ctx, f / L.FPS);
      const buf = c.data();
      if (!ff.stdin.write(Buffer.from(buf))) await new Promise((r) => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
  })();
  ff.on('close', (code) => process.exit(code));
}
