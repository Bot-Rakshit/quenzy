import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

const faces: [string, string, string, string][] = [
  ['Inter Tight', 'inter-tight-latin-500-normal.woff2', '500', 'normal'],
  ['Inter Tight', 'inter-tight-latin-600-normal.woff2', '600', 'normal'],
  ['Inter Tight', 'inter-tight-latin-800-normal.woff2', '800', 'normal'],
  ['Inter Tight', 'inter-tight-latin-900-normal.woff2', '900', 'normal'],
  ['Inter Tight', 'inter-tight-latin-800-italic.woff2', '800', 'italic'],
  ['Inter', 'inter-latin-400-normal.woff2', '400', 'normal'],
  ['Inter', 'inter-latin-500-normal.woff2', '500', 'normal'],
  ['Inter', 'inter-latin-600-normal.woff2', '600', 'normal'],
  ['Instrument Serif', 'instrument-serif-latin-400-normal.woff2', '400', 'normal'],
  ['Instrument Serif', 'instrument-serif-latin-400-italic.woff2', '400', 'italic'],
  ['Bagel Fat One', 'bagel-fat-one-latin-400-normal.woff2', '400', 'normal'],
];

export const fontsReady = Promise.all(
  faces.map(([family, file, weight, style]) =>
    loadFont({ family, url: staticFile(`fonts/${file}`), weight, style: style as 'normal' | 'italic' }),
  ),
);
