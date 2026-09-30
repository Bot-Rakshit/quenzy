// 12–16s. Black. "What if soda had a gut feeling?" then a white-out into the drop.
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT } from '../theme';
import { BlurIn, IN, p, Reveal } from '../ui';

export const Pivot: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = 1 + 0.12 * p(f, 30, 120, IN);
  const white = p(f, 100, 120, IN);
  const letters = [...'gut feeling?'];
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{ background: 'radial-gradient(50% 30% at 50% 52%, rgba(255,95,168,0.35), rgba(0,0,0,0) 70%)', opacity: p(f, 30, 80) }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${zoom})` }}>
        <Reveal at={2}>
          <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 82, color: C.cream, letterSpacing: '-0.02em' }}>What if soda had a</div>
        </Reveal>
        <div style={{ display: 'flex', marginTop: 10 }}>
          {letters.map((ch, i) => {
            const k = p(f, 30 + i * 2, 50 + i * 2);
            return (
              <span key={i} style={{
                fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 210, color: C.pink, whiteSpace: 'pre', display: 'inline-block',
                opacity: k, transform: `translateY(${(1 - k) * 60}px)`, filter: `blur(${(1 - k) * 12}px)`, lineHeight: 1,
              }}>{ch}</span>
            );
          })}
        </div>
        <BlurIn at={62} style={{ marginTop: 40 }}>
          <div style={{ width: 120, height: 3, background: C.pink, opacity: 0.8 }} />
        </BlurIn>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.white, opacity: white }} />
    </AbsoluteFill>
  );
};
