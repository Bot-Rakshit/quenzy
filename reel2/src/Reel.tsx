// Master timeline: 64s @ 30fps, 120 BPM (1 bar = 60 frames). Cuts land on bars.
import { AbsoluteFill, Html5Audio, Sequence, staticFile } from 'remotion';
import { ColdOpen } from './scenes/ColdOpen';
import { FinePrint } from './scenes/FinePrint';
import { Pivot } from './scenes/Pivot';
import { Hero } from './scenes/Hero';
import { Specs } from './scenes/Specs';
import { Flavor } from './scenes/Flavor';
import { Proof } from './scenes/Proof';
import { Finale } from './scenes/Finale';
import { C } from './theme';

export const REEL_FRAMES = 1920;
const WIPE = 16; // flavour scenes open with a circular reveal over the previous shot

export const Reel: React.FC<{ audio?: boolean }> = ({ audio = true }) => (
  <AbsoluteFill style={{ background: C.night }}>
    <Sequence from={0} durationInFrames={180}><ColdOpen /></Sequence>
    <Sequence from={180} durationInFrames={180}><FinePrint /></Sequence>
    <Sequence from={360} durationInFrames={120}><Pivot /></Sequence>
    <Sequence from={480} durationInFrames={240}><Hero /></Sequence>
    <Sequence from={720} durationInFrames={300}><Specs /></Sequence>
    <Sequence from={1020 - WIPE} durationInFrames={180 + WIPE}><Flavor flavor="blueberry" index={0} /></Sequence>
    <Sequence from={1200 - WIPE} durationInFrames={180 + WIPE}><Flavor flavor="orange" index={1} /></Sequence>
    <Sequence from={1380 - WIPE} durationInFrames={180 + WIPE}><Flavor flavor="cucumber" index={2} /></Sequence>
    <Sequence from={1560} durationInFrames={180}><Proof /></Sequence>
    <Sequence from={1740} durationInFrames={180}><Finale /></Sequence>
    {audio && <Html5Audio src={staticFile('soundtrack.wav')} />}
  </AbsoluteFill>
);
