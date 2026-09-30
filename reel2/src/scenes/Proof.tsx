// 52–58s. Made in Bengaluru. A countdown from 2:00:00 races to zero -> SOLD OUT.
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../theme';
import { BlurIn, Caps, Grain, p, Reveal, SMOOTH } from '../ui';

const pad = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

export const Proof: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = p(f, 44, 104, SMOOTH);
  const secs = interpolate(k, [0, 1], [7200, 0]);
  const time = `${pad(secs / 3600)}:${pad((secs % 3600) / 60)}:${pad(secs % 60)}`;
  const sold = spring({ frame: f - 106, fps, config: { damping: 11, stiffness: 160 } });
  const done = f >= 106;
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{ background: 'radial-gradient(60% 40% at 50% 52%, rgba(255,95,168,0.32), rgba(0,0,0,0) 70%)', opacity: 0.4 + 0.6 * p(f, 100, 120) }} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 330 }}>
        <BlurIn at={0}>
          <Caps style={{ color: C.pink, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: C.pink, display: 'inline-block' }} />
            Made in Bengaluru
          </Caps>
        </BlurIn>
        <Reveal at={14}>
          <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 104, color: C.cream, marginTop: 30 }}>The first batch?</div>
        </Reveal>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{
          fontFamily: FONT.display, fontWeight: 800, fontSize: 176, color: done ? 'rgba(247,240,230,0.25)' : C.cream,
          letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', opacity: p(f, 36, 46),
          transform: `scale(${done ? 0.92 : 1})`, transition: 'none',
        }}>
          {time}
        </div>
        {done && (
          <div style={{
            position: 'absolute', fontFamily: FONT.display, fontWeight: 900, fontStyle: 'italic', fontSize: 220, color: C.pink,
            letterSpacing: '-0.05em', transform: `scale(${2 - sold}) rotate(-4deg)`, opacity: Math.min(1, sold * 2),
            textShadow: '0 20px 60px rgba(255,46,136,0.45)',
          }}>
            SOLD OUT.
          </div>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 420 }}>
        <BlurIn at={122}>
          <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 84, color: C.cream }}>in two hours.</div>
        </BlurIn>
      </AbsoluteFill>
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
