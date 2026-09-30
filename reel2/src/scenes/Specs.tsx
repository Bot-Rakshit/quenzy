// 24–34s. Spec sheet: the can turns slowly on paper; four callouts draw in on
// leader lines. Ends on the callback: "All of the fizz. None of the fine print."
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Can } from '../three/Can';
import { Studio } from '../three/Studio';
import { C, FONT } from '../theme';
import { BlurIn, Caps, Grain, p, Reveal, SMOOTH } from '../ui';

type Spec = { at: number; num: number; pre?: string; suf?: string; label: string; side: 'l' | 'r'; y: number; ay: number };
const SPECS: Spec[] = [
  { at: 30, num: 15, pre: '<', label: 'calories', side: 'l', y: 560, ay: 700 },
  { at: 75, num: 5, suf: 'g', label: 'prebiotic fibre', side: 'r', y: 560, ay: 760 },
  { at: 120, num: 0, suf: 'g', label: 'added sugar', side: 'l', y: 1050, ay: 1120 },
  { at: 165, num: 0, label: 'preservatives', side: 'r', y: 1050, ay: 1180 },
];

const Callout: React.FC<{ s: Spec }> = ({ s }) => {
  const f = useCurrentFrame();
  const k = p(f, s.at, s.at + 22);
  const line = p(f, s.at - 4, s.at + 14, SMOOTH);
  const n = Math.round(interpolate(k, [0, 1], [s.num === 0 ? 9 : s.num * 4, s.num]));
  const left = s.side === 'l';
  const x0 = left ? 330 : 750, x1 = left ? 372 : 708;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <line x1={x0} y1={s.y + 60} x2={x0 + (x1 - x0) * line} y2={s.y + 60 + (s.ay - s.y - 60) * line} stroke={C.ink} strokeWidth={3} />
        <circle cx={x1} cy={s.ay} r={9 * line} fill={C.pink} stroke={C.ink} strokeWidth={3} />
      </svg>
      <div style={{
        position: 'absolute', top: s.y - 40, left: left ? 60 : 760, width: 270, textAlign: left ? 'right' : 'left',
        opacity: k, transform: `translateY(${(1 - k) * 30}px)`,
      }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 150, color: C.ink, letterSpacing: '-0.05em', lineHeight: 0.9, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ fontSize: 96, verticalAlign: 'top' }}>{s.pre}</span>{n}<span style={{ fontSize: 96 }}>{s.suf}</span>
        </div>
        <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 48, color: C.hot, marginTop: 4 }}>{s.label}</div>
      </div>
    </>
  );
};

export const Specs: React.FC = () => {
  const f = useCurrentFrame();
  const out = p(f, 206, 222, SMOOTH);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <AbsoluteFill style={{ background: 'radial-gradient(70% 45% at 50% 50%, #FFFFFF 0%, rgba(255,255,255,0) 70%)' }} />
      <div style={{ position: 'absolute', left: 540 - 230, top: 1400, width: 460, height: 90, borderRadius: '50%', background: 'rgba(40,20,60,0.22)', filter: 'blur(28px)' }} />
      <Studio camera={{ position: [0, 0.35, 9.4], fov: 30, lookAt: [0, 0.05, 0] }} envRot={0.6} envIntensity={1.05}>
        <Can flavor="orange" spin={-0.5 + f * 0.012} scale={0.95} position={[0, -0.05 + Math.sin(f / 40) * 0.03, 0]} />
      </Studio>
      <div style={{ opacity: 1 - out }}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 200 }}>
          <BlurIn at={2}>
            <Caps style={{ color: C.hot }}>What's inside</Caps>
          </BlurIn>
          <Reveal at={8}>
            <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 84, color: C.ink, letterSpacing: '-0.04em', marginTop: 14 }}>Everything your gut wants.</div>
          </Reveal>
        </AbsoluteFill>
        {SPECS.map((s) => <Callout key={s.label} s={s} />)}
      </div>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 250 }}>
        <Reveal at={214}>
          <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 104, color: C.ink, letterSpacing: '-0.04em' }}>All of the fizz.</div>
        </Reveal>
        <BlurIn at={236}>
          <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 96, color: C.hot, marginTop: -4 }}>None of the fine print.</div>
        </BlurIn>
      </AbsoluteFill>
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
