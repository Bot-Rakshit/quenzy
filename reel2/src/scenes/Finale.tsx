// 58–64s. Three-can lineup with reflections. Fizz. Fun. Fibre. -> end card.
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Can } from '../three/Can';
import { Bubbles } from '../three/Fruits';
import { Studio } from '../three/Studio';
import { C, FlavorKey, FONT } from '../theme';
import { BlurIn, Caps, Grain, p, SMOOTH } from '../ui';

const LINEUP: [FlavorKey, number, number, number][] = [
  ['orange', -1.32, 0, 0.35],
  ['cucumber', 1.32, 15, -0.35],
  ['blueberry', 0, 30, 0],
];

export const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dolly = interpolate(f, [0, 180], [10.8, 9.2], { easing: SMOOTH });
  const words = ['Fizz.', 'Fun.', 'Fibre.'];
  const card = p(f, 108, 128, SMOOTH);
  const fade = p(f, 168, 180, SMOOTH);
  const floor = -1.42;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FF8FC4 0%, #FF5FA8 55%, #E0428F 100%)' }}>
      <Studio camera={{ position: [0, 0.9, dolly], fov: 30, lookAt: [0, -0.35, 0] }} envRot={0.3 + f * 0.004}>
        {LINEUP.map(([k, x, at, sp]) => {
          const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 110 } });
          const y = interpolate(s, [0, 1], [7, 0]);
          const scale = k === 'blueberry' ? 1 : 0.86;
          const cy = floor + 1.34 * scale + y;
          const z = k === 'blueberry' ? 0.6 : 0;
          return (
            <group key={k}>
              <Can flavor={k} position={[x, cy, z]} spin={sp + Math.sin(f / 50 + x) * 0.15} scale={scale} />
              {/* mirrored reflection */}
              <group position={[0, 2 * floor, 0]} scale={[1, -1, 1]}>
                <Can flavor={k} position={[x, cy, z]} spin={sp + Math.sin(f / 50 + x) * 0.15} scale={scale} />
              </group>
            </group>
          );
        })}
        <Bubbles t={f / 30} count={30} seed={21} spread={[3, 8, 2]} speed={1.2} size={0.05} y0={-2} />
      </Studio>
      {/* floor: reflection fade */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1318, bottom: 0, background: 'linear-gradient(180deg, rgba(224,66,143,0.55) 0%, rgba(214,55,133,0.92) 35%, #D6378A 100%)' }} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 190, opacity: 1 - card }}>
        <div style={{ display: 'flex', gap: 28 }}>
          {words.map((w, i) => {
            const k = spring({ frame: f - 45 - i * 15, fps, config: { damping: 14, stiffness: 140 } });
            return (
              <div key={w} style={{
                fontFamily: FONT.display, fontWeight: 900, fontSize: 124, color: i === 1 ? C.ink : C.white, letterSpacing: '-0.045em',
                transform: `translateY(${(1 - k) * 80}px) scale(${0.8 + 0.2 * k})`, opacity: Math.min(1, k * 1.5),
              }}>{w}</div>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 150, opacity: card }}>
        <div style={{ transform: `translateY(${(1 - card) * 30}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: FONT.logo, fontSize: 200, color: C.red, lineHeight: 1, WebkitTextStroke: `10px ${C.white}`, paintOrder: 'stroke fill', transform: 'rotate(-4deg)', textShadow: '0 16px 40px rgba(120,0,60,0.3)' }}>quenzy</div>
          <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 72, color: C.ink, marginTop: 18 }}>Soda, but with a gut feeling.</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 170 }}>
        <BlurIn at={124}>
          <div style={{ background: C.ink, color: C.white, fontFamily: FONT.display, fontWeight: 800, fontSize: 56, padding: '22px 52px', borderRadius: 999, letterSpacing: '-0.01em' }}>
            thequenzy.com
          </div>
        </BlurIn>
        <BlurIn at={134}>
          <Caps style={{ color: C.white, marginTop: 26, fontSize: 28 }}>@drinkquenzy</Caps>
        </BlurIn>
      </AbsoluteFill>
      <Grain opacity={0.07} />
      <AbsoluteFill style={{ background: C.night, opacity: fade }} />
    </AbsoluteFill>
  );
};
