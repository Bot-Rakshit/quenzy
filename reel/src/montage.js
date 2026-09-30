// node src/montage.js out.png a.png b.png ... (4 per row, half-size)
const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas'); const L = require('./lib');
(async () => {
  const [out, ...files] = process.argv.slice(2); const tw = 540, th = 960, cols = 4;
  const [c, ctx] = L.makeCanvas(cols * tw, Math.ceil(files.length / cols) * th);
  for (let i = 0; i < files.length; i++) ctx.drawImage(await loadImage(fs.readFileSync(files[i])), (i % cols) * tw, Math.floor(i / cols) * th, tw, th);
  fs.writeFileSync(out, c.toBuffer('image/png'));
})();
