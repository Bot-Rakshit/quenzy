// 34–52s, one per flavour (6s each). Colour world, giant outlined name behind,
// 3-layer depth-of-field fruit burst around the spinning can, tasting note.
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { rng } from '../art/fruits2d';
import { Can } from '../three/Can';
import { Blueberry, Bubbles, Cream, CucumberSlice, Litchi, MintLeaf, Orange, OrangeSlice } from '../three/Fruits';
import { Studio } from '../three/Studio';
import { C, FLAVORS, FlavorKey, FONT } from '../theme';
import { BlurIn, Caps, Grain, p, Reveal, SMOOTH } from '../ui';

type Item = { el: (props: any) => React.ReactNode; scale: number };
const SETS: Record<FlavorKey, Item[]> = {
  blueberry: [
    { el: (pr) => <Blueberry {...pr} />, scale: 0.26 },
    { el: (pr) => <Litchi {...pr} />, scale: 0.34 },
    { el: (pr) => <Blueberry {...pr} />, scale: 0.2 },
    { el: (pr) => <Litchi {...pr} peeled />, scale: 0.3 },
  ],
  orange: [
    { el: (pr) => <OrangeSlice {...pr} />, scale: 0.42 },
    { el: (pr) => <Orange {...pr} />, scale: 0.34 },
    { el: (pr) => <Cream {...pr} />, scale: 0.36 },
    { el: (pr) => <OrangeSlice {...pr} />, scale: 0.32 },
  ],
  cucumber: [
    { el: (pr) => <CucumberSlice {...pr} />, scale: 0.42 },
    { el: (pr) => <MintLeaf {...pr} />, scale: 0.75 },
    { el: (pr) => <CucumberSlice {...pr} />, scale: 0.32 },
    { el: (pr) => <MintLeaf {...pr} />, scale: 0.55 },
  ],
};

const Layer: React.FC<{ flavor: FlavorKey; layer: 'back' | 'mid' | 'front'; burst: number; t: number }> = ({ flavor, layer, burst, t }) => {
  const R = rng({ back: 11, mid: 23, front: 37 }[layer] + flavor.length);
  const set = SETS[flavor];
  const n = { back: 9, mid: 7, front: 3 }[layer];
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const it = set[i % set.length];
    let x: number, y: number, z: number, s: number;
    if (layer === 'back') {
      x = (R() - 0.5) * 5.4; y = (R() - 0.5) * 7.5; z = -2.5 - R() * 1.5; s = 1 + R() * 0.4;
    } else if (layer === 'mid') {
      const a = (i / n) * Math.PI * 2 + R() * 0.5;
      const r = 1.25 + R() * 0.45;
      x = Math.cos(a) * r; y = Math.sin(a) * r * 1.5; z = (R() - 0.3) * 1.2; s = 0.9 + R() * 0.3;
    } else {
      x = i === 0 ? -1.6 : i === 1 ? 1.7 : -1.2; y = i === 0 ? 2.2 : i === 1 ? -1.9 : -2.9; z = 2.6 + R(); s = 1.4 + R() * 0.4;
    }
    const rot: [number, number, number] = [R() * 6 + t * (R() - 0.5) * 1.2, R() * 6 + t * (R() - 0.5), R() * 6];
    const fy = Math.sin(t * (0.8 + R()) + i) * 0.12;
    out.push(
      <group key={i} position={[x * burst, (y + fy) * burst, z * (layer === 'mid' ? burst : 1)]}>
        {it.el({ scale: it.scale * s * (layer === 'mid' ? burst : 1), rotation: rot })}
      </group>,
    );
  }
  return <>{out}</>;
};

export const Flavor: React.FC<{ flavor: FlavorKey; index: number }> = ({ flavor, index }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const F = FLAVORS[flavor];
  const t = f / fps;
  const reveal = p(f, 0, 16, SMOOTH);
  const enter = spring({ frame: f - 4, fps, config: { damping: 15, stiffness: 80 } });
  const settle = spring({ frame: f - 4, fps, config: { damping: 28, stiffness: 30 } });
  const burst = spring({ frame: f - 14, fps, config: { damping: 13, stiffness: 70 } });
  const spin = (1 - settle) * Math.PI * 3 + Math.sin(t * 1.3) * 0.28 - 0.1;
  const cam = { position: [0, 0.25, 8.2] as [number, number, number], fov: 30, lookAt: [0, 0, 0] as [number, number, number] };
  const drift = interpolate(f, [0, 180], [80, -220]);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${reveal * 130}% at 50% 55%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(100% 70% at 50% 50%, ${F.bg} 0%, ${F.bg2} 70%, ${F.deep} 130%)` }} />
      <AbsoluteFill style={{ justifyContent: 'center', overflow: 'hidden' }}>
        {[0, 1].map((row) => (
          <div key={row} style={{
            fontFamily: FONT.display, fontWeight: 800, fontStyle: 'italic', fontSize: 300, lineHeight: 0.95, whiteSpace: 'nowrap',
            color: 'transparent', WebkitTextStroke: '3px rgba(255,255,255,0.28)', letterSpacing: '-0.03em',
            transform: `translateX(${row ? -drift - 300 : drift}px)`,
          }}>
            {(row ? F.b : F.a).toUpperCase()} {(row ? F.b : F.a).toUpperCase()}
          </div>
        ))}
      </AbsoluteFill>
      <Studio camera={cam} style={{ filter: 'blur(7px)' }} envIntensity={0.9}>
        <Layer flavor={flavor} layer="back" burst={1} t={t} />
      </Studio>
      <Studio camera={cam} envRot={0.4 + t * 0.15}>
        <Can flavor={flavor} spin={spin} position={[0, interpolate(enter, [0, 1], [-7, -0.1]), 0]} rotation={[0.05, 0, 0.05 * Math.sin(t)]} scale={0.98} />
        <Layer flavor={flavor} layer="mid" burst={burst} t={t} />
        <Bubbles t={t} count={24} seed={5 + index} spread={[2.4, 7.5, 1.5]} speed={1.1} size={0.05} y0={-4} />
      </Studio>
      <Studio camera={cam} style={{ filter: 'blur(12px)' }}>
        <Layer flavor={flavor} layer="front" burst={1} t={t} />
      </Studio>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 170 }}>
        <BlurIn at={8}>
          <Caps style={{ color: C.white, opacity: 0.85 }}>{`0${index + 1} — 03`}</Caps>
        </BlurIn>
        <Reveal at={10}>
          <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 150, color: C.white, letterSpacing: '-0.045em', marginTop: 10 }}>{F.a}</div>
        </Reveal>
        <Reveal at={16}>
          <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 138, color: F.light, marginTop: -30 }}>× {F.b}</div>
        </Reveal>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 230 }}>
        <BlurIn at={42}>
          <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 84, color: C.white, lineHeight: 1.02, textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.2)' }}>
            {F.note}
            <br />
            {F.note2}
          </div>
        </BlurIn>
      </AbsoluteFill>
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
