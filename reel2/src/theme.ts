export const FPS = 30;
export const BEAT = 15; // frames per beat @120 BPM
export const BAR = 60;

export const C = {
  ink: '#140B1F',
  night: '#0D0714',
  pink: '#FF5FA8',
  hot: '#FF2E88',
  blush: '#FFD6E8',
  red: '#E5232B',
  yellow: '#FFD83D',
  cream: '#F7F0E6',
  paper: '#FBF7F1',
  white: '#FFFFFF',
};

export type FlavorKey = 'blueberry' | 'orange' | 'cucumber';
export const FLAVORS: Record<FlavorKey, {
  key: FlavorKey; a: string; b: string; bg: string; bg2: string; deep: string; light: string; note: string; note2: string;
}> = {
  blueberry: { key: 'blueberry', a: 'Blueberry', b: 'Litchi', bg: '#7B4CF0', bg2: '#5A2FD3', deep: '#2A1070', light: '#D9CCFF', note: 'Juicy, floral,', note2: 'a little extra.' },
  orange: { key: 'orange', a: 'Orange', b: 'Cream', bg: '#FF8A1E', bg2: '#F06A00', deep: '#7A2E00', light: '#FFE3B8', note: 'The creamsicle,', note2: 'all grown up.' },
  cucumber: { key: 'cucumber', a: 'Cucumber', b: 'Mint', bg: '#2FCB8E', bg2: '#15A26C', deep: '#07452D', light: '#C4F7DF', note: 'Self-care,', note2: 'in a can.' },
};

export const FONT = {
  display: '"Inter Tight", sans-serif',
  serif: '"Instrument Serif", serif',
  body: '"Inter", sans-serif',
  logo: '"Bagel Fat One", sans-serif',
};
