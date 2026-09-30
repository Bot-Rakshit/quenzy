import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT } from './theme';

export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const SMOOTH = Easing.bezier(0.65, 0, 0.35, 1);
export const IN = Easing.bezier(0.7, 0, 0.84, 0);

export const p = (f: number, a: number, b: number, ease = EXPO) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

// Text that slides up from behind a mask (classic editorial reveal).
export const Reveal: React.FC<{ at: number; dur?: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; dy?: number }> = ({
  at, dur = 18, out, children, style, dy = 110,
}) => {
  const f = useCurrentFrame();
  const k = p(f, at, at + dur);
  const o = out !== undefined ? p(f, out, out + 12, IN) : 0;
  return (
    <div style={{ overflow: 'hidden', lineHeight: 1.02, paddingBottom: '0.08em', ...style }}>
      <div style={{ transform: `translateY(${(1 - k) * dy + o * -dy}%)`, opacity: k > 0 ? 1 : 0 }}>{children}</div>
    </div>
  );
};

// Soft focus pull-in.
export const BlurIn: React.FC<{ at: number; dur?: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; scaleFrom?: number }> = ({
  at, dur = 20, out, children, style, scaleFrom = 1.06,
}) => {
  const f = useCurrentFrame();
  const k = p(f, at, at + dur);
  const o = out !== undefined ? p(f, out, out + 12, SMOOTH) : 0;
  return (
    <div style={{ opacity: k * (1 - o), filter: `blur(${(1 - k) * 18 + o * 14}px)`, transform: `scale(${scaleFrom + (1 - scaleFrom) * k})`, ...style }}>
      {children}
    </div>
  );
};

export const Caps: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 30, letterSpacing: '0.32em', textTransform: 'uppercase', ...style }}>{children}</div>
);

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const f = useCurrentFrame();
  const x = Math.floor(random(`gx${f}`) * 512), y = Math.floor(random(`gy${f}`) * 512);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('grain.png')})`,
        backgroundPosition: `${x}px ${y}px`,
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.35 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,4,16,${strength}) 100%)`, pointerEvents: 'none' }} />
);

export const Flash: React.FC<{ at: number; dur?: number; color?: string }> = ({ at, dur = 10, color = C.white }) => {
  const f = useCurrentFrame();
  const o = f < at ? 0 : 1 - p(f, at, at + dur, Easing.out(Easing.quad));
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o }} /> : null;
};

export const center: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' };
