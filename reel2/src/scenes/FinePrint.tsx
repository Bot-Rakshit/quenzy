// 6–12s. A nutrition-label parody for "regular soda". Rows print in on the beat;
// the 35g gets circled in red marker.
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../theme';
import { BlurIn, Caps, p, Reveal, SMOOTH } from '../ui';

const ROWS: [string, string, boolean?][] = [
  ['Serving size', '1 can (330 ml)'],
  ['Sugar', '35 g*', true],
  ['Fibre', '0 g'],
  ['Sugar crash', 'included'],
  ['Bloat', 'likely'],
  ['Guilt', '100% DV'],
];

export const FinePrint: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = spring({ frame: f - 8, fps, config: { damping: 18, stiffness: 90 } });
  const circle = p(f, 118, 140, SMOOTH);
  const exit = p(f, 166, 180, SMOOTH);
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <AbsoluteFill style={{ background: 'radial-gradient(90% 60% at 50% 40%, #FFFFFF 0%, rgba(255,255,255,0) 70%)' }} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 250 }}>
        <Reveal at={0} out={164}>
          <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 96, color: C.ink, letterSpacing: '-0.01em' }}>Then comes</div>
        </Reveal>
        <Reveal at={6} out={164}>
          <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 118, color: C.ink, letterSpacing: '-0.04em', marginTop: -6 }}>the fine print.</div>
        </Reveal>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 260 }}>
        <div
          style={{
            width: 800,
            background: '#FFFFFF',
            border: `6px solid ${C.ink}`,
            padding: '34px 40px 30px',
            fontFamily: FONT.body,
            color: C.ink,
            transform: `translateY(${(1 - card) * 900 + exit * -60}px) rotate(${(1 - card) * 6 - 1.2}deg)`,
            opacity: 1 - exit,
            boxShadow: '0 50px 90px rgba(40,20,60,0.22)',
            position: 'relative',
          }}
        >
          <Caps style={{ fontSize: 24, color: '#6d6474', letterSpacing: '0.28em' }}>Regular soda</Caps>
          <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 84, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 8 }}>Nutrition Facts</div>
          <div style={{ height: 16, background: C.ink, margin: '18px 0 6px' }} />
          {ROWS.map(([k, v, big], i) => {
            const at = 24 + i * 15;
            const r = p(f, at, at + 10);
            return (
              <div key={k} style={{ opacity: r, transform: `translateX(${(1 - r) * -30}px)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0', fontSize: big ? 50 : 38, fontWeight: big ? 800 : 500 }}>
                  <span>{k}</span>
                  <span style={{ fontWeight: 800, position: 'relative' }}>
                    {v}
                    {big && (
                      <svg width="250" height="120" viewBox="0 0 250 120" style={{ position: 'absolute', left: -60, top: -30, overflow: 'visible' }}>
                        <path
                          d="M20,64 C18,20 110,6 190,16 C246,24 246,92 170,104 C100,114 26,104 22,62 C20,40 60,22 96,18"
                          fill="none" stroke={C.red} strokeWidth={9} strokeLinecap="round"
                          strokeDasharray={640} strokeDashoffset={640 * (1 - circle)}
                        />
                      </svg>
                    )}
                  </span>
                </div>
                <div style={{ height: i === 0 ? 8 : 2, background: C.ink }} />
              </div>
            );
          })}
          <div style={{ fontSize: 22, color: '#6d6474', marginTop: 16, opacity: p(f, 110, 120) }}>*Typical 330 ml cola. Figures approximate.</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150 }}>
        <BlurIn at={130} out={166}>
          <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 64, color: C.red }}>
            Your gut read it too.
          </div>
        </BlurIn>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
