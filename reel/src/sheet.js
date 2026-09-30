// Renders asset preview sheets to previews/ for visual QA.
const fs = require('fs');
const L = require('./lib');
const A = require('./assets');
const out = (c, n) => fs.writeFileSync(`previews/${n}.png`, c.toBuffer('image/png'));

// Sheet 1: labels (flat)
{
  const [c, ctx] = L.makeCanvas(1400, 3000);
  ['blueberry', 'orange', 'cucumber'].forEach((k, i) => ctx.drawImage(A.makeLabel(k), 0, i * 1000));
  out(c, 'labels');
}
// Sheet 2: cans at different spins + regular
{
  const [c, ctx] = L.makeCanvas(2000, 1000);
  ctx.fillStyle = L.C.cream; ctx.fillRect(0, 0, 2000, 1000);
  A.drawCan(ctx, 250, 500, 800, 'blueberry', 0);
  A.drawCan(ctx, 650, 500, 800, 'orange', 0.6);
  A.drawCan(ctx, 1050, 500, 800, 'cucumber', -0.4, 0.1, { open: true });
  A.drawCan(ctx, 1450, 500, 800, 'regular', 0);
  A.drawCan(ctx, 1800, 500, 500, 'blueberry', 2.8);
  out(c, 'cans');
}
// Sheet 3: fruits + props
{
  const [c, ctx] = L.makeCanvas(2000, 1200);
  ctx.fillStyle = '#FFF3DE'; ctx.fillRect(0, 0, 2000, 1200);
  A.blueberry(ctx, 150, 150, 90); A.litchi(ctx, 400, 150, 100); A.litchi(ctx, 650, 150, 100, 0.3, true);
  A.orangeWhole(ctx, 900, 170, 100); A.orangeSlice(ctx, 1150, 150, 100); A.creamSwirl(ctx, 1400, 170, 110);
  A.cucumberSlice(ctx, 1650, 150, 100); A.mintLeaf(ctx, 1870, 150, 200, 0.4);
  A.sugarCube(ctx, 150, 450, 160, 0.1); A.sludgeGlass(ctx, 450, 550, 300, 1.2);
  A.stamp(ctx, 'SOLD OUT', 850, 450, 90, -0.15); A.stopwatch(ctx, 1250, 450, 110, 0.7);
  A.speech(ctx, 1650, 420, 420, 180, 1560, 560);
  L.stickerText(ctx, 'Fizz. Fun.', 1000, 800, { font: 'Bagel', size: 140, fill: L.C.yellow });
  L.pill(ctx, '5g PREBIOTIC FIBRE', 1000, 1000, {});
  L.stickerText(ctx, 'gut feeling', 1600, 1000, { font: 'Brush', size: 110, fill: L.C.pink });
  L.stickerText(ctx, 'HATES', 300, 1000, { font: 'Dela', size: 120, fill: L.C.red });
  out(c, 'props');
}
// Sheet 4: gut mascot expressions
{
  const [c, ctx] = L.makeCanvas(2000, 1000);
  ctx.fillStyle = '#FFF3DE'; ctx.fillRect(0, 0, 2000, 1000);
  const ex = [
    {}, { eyes: 'happy', mouth: 'open', armL: -0.9, armR: -0.9 }, { eyes: 'spiral', mouth: 'wavy', tint: '#B7D86A', sweat: true },
    { eyes: 'heart', mouth: 'grin', wave: 1 }, { eyes: 'normal', mouth: 'frown', brows: 'angry' }, { eyes: 'wide', mouth: 'o', brows: 'worried' },
    { eyes: 'happy', mouth: 'grin', tears: true }, { eyes: 'x', mouth: 'gag', tint: '#A9C95A' }, { eyes: 'star', mouth: 'open' }, { eyes: 'wink', mouth: 'grin', armR: -1.2 },
  ];
  ex.forEach((e, i) => A.gut(ctx, 200 + (i % 5) * 400, 260 + Math.floor(i / 5) * 480, 300, 0.5, e));
  out(c, 'gut');
}
console.log('ok');
