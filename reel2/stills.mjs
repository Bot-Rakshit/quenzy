// node stills.mjs out.png 10 200 400 ...  -> contact sheet of Reel frames (4 per row)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const [out, ...frames] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const comp = await selectComposition({ serveUrl, id: 'Reel', browserExecutable, chromiumOptions: { gl: 'swangle' }, inputProps: { audio: false } });
fs.mkdirSync('/tmp/claude-0/stills', { recursive: true });
const files = [];
for (const fr of frames) {
  const o = `/tmp/claude-0/stills/f${fr}.png`;
  const t = Date.now();
  await renderStill({ composition: comp, serveUrl, frame: +fr, output: o, browserExecutable, chromiumOptions: { gl: 'swangle' }, inputProps: { audio: false } });
  console.log(fr, Date.now() - t, 'ms');
  files.push(o);
}
execFileSync('python3', ['-c', `
import sys
from PIL import Image, ImageDraw
fs=sys.argv[2:]; W,H=432,768; cols=4; rows=(len(fs)+cols-1)//cols
im=Image.new('RGB',(W*cols,(H+28)*rows),(30,30,30)); d=ImageDraw.Draw(im)
for i,f in enumerate(fs):
    x,y=(i%cols)*W,(i//cols)*(H+28); im.paste(Image.open(f).convert('RGB').resize((W,H)),(x,y)); d.text((x+8,y+H+6),f.split('/')[-1],fill=(255,255,255))
im.save(sys.argv[1])`, out, ...files]);
