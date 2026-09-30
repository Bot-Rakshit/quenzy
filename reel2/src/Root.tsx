import { Composition } from 'remotion';
import { Lab } from './Lab';
import { Reel, REEL_FRAMES } from './Reel';

export const RemotionRoot = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: false }} />
    <Composition id="Lab" component={Lab} durationInFrames={60} fps={30} width={1080} height={1920}
      defaultProps={{ flavor: 'blueberry' as const, spin: 0, cam: [0, 0.6, 8] as [number, number, number], fruits: false }} />
  </>
);
