// 0–6s. Macro on the lid in the dark, a light sweep, the tab cracks, fizz rises.
// "Every soda makes a promise." → "Sweet. Fizzy. Fun."
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Can } from '../three/Can';
import { Bubbles } from '../three/Fruits';
import { Studio } from '../three/Studio';
import { C, FONT } from '../theme';
import { BlurIn, p, SMOOTH } from '../ui';

export const ColdOpen: React.FC = () => {
  const f = useCurrentFrame();
  const open = p(f, 38, 46);
  const pull = p(f, 50, 180, SMOOTH);
  const cam: [number, number, number] = [
    interpolate(pull, [0, 1], [0.35, 0]),
    interpolate(pull, [0, 1], [1.95, 0.55]),
    interpolate(pull, [0, 1], [1.35, 6.6]),
  ];
  const look: [number, number, number] = [0, interpolate(pull, [0, 1], [1.2, 0.35]), 0];
  const words = ['Sweet.', 'Fizzy.', 'Fun.'];
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{ background: 'radial-gradient(60% 40% at 50% 38%, rgba(255,95,168,0.28), rgba(13,7,20,0) 70%)', opacity: 0.5 + 0.5 * p(f, 30, 90) }} />
      <Studio camera={{ position: cam, fov: 32, lookAt: look }} envIntensity={0.55} envRot={-1.6 + f * 0.022} exposure={1.1}>
        <Can flavor="blueberry" spin={0.35 - f * 0.002} open={open} />
        {f > 42 && (
          <group position={[0.05, 1.3, 0.18]}>
            <Bubbles t={(f - 42) / 30} count={26} seed={4} spread={[0.14, 1.4, 0.08]} speed={0.8} size={0.018} y0={0} />
          </group>
        )}
      </Studio>
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 380 }}>
        <BlurIn at={12} out={96}>
          <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 92, color: C.cream, textAlign: 'center', lineHeight: 1.05 }}>
            Every soda makes
            <br />a promise.
          </div>
        </BlurIn>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 360, gap: 0 }}>
        {f >= 105 && (
          <div style={{ display: 'flex', gap: 34, opacity: 1 - p(f, 166, 178) }}>
            {words.map((w, i) => {
              const k = p(f, 105 + i * 15, 117 + i * 15);
              return (
                <div key={w} style={{
                  fontFamily: FONT.display, fontWeight: 800, fontSize: 112, color: C.white, letterSpacing: '-0.03em',
                  opacity: k, transform: `translateY(${(1 - k) * 40}px)`, filter: `blur(${(1 - k) * 10}px)`,
                }}>
                  {w}
                </div>
              );
            })}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
