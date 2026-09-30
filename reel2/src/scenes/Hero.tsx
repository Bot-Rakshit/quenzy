// 16–24s. The drop: pink studio, huge wordmark behind, the can rises and spins
// into a hero pose through fizz. "Prebiotic soda. Soda, but with a gut feeling."
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Can } from '../three/Can';
import { Bubbles, Blueberry, Litchi } from '../three/Fruits';
import { Studio } from '../three/Studio';
import { C, FONT } from '../theme';
import { BlurIn, Caps, Flash, Grain, p, Reveal, SMOOTH } from '../ui';

export const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: f - 2, fps, config: { damping: 16, stiffness: 70, mass: 1.1 } });
  const settle = spring({ frame: f - 2, fps, config: { damping: 30, stiffness: 28 } });
  const spin = (1 - settle) * Math.PI * 4 - 0.25 + Math.sin(f / 40) * 0.12;
  const y = interpolate(rise, [0, 1], [-7, -0.15]);
  const mark = spring({ frame: f - 14, fps, config: { damping: 22, stiffness: 80 } });
  const drift = interpolate(f, [0, 240], [0, -40]);
  const orbit = interpolate(f, [0, 240], [-0.25, 0.25], { easing: SMOOTH });
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(110% 70% at 50% 42%, #FF9ACB 0%, #FF5FA8 42%, #D9307F 100%)' }}>
      {/* oversized wordmark behind the product */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 180 }}>
        <div style={{
          fontFamily: FONT.logo, fontSize: 380, color: C.white, letterSpacing: '-0.02em', lineHeight: 1,
          transform: `translateX(${drift}px) scale(${0.85 + 0.15 * mark})`, opacity: mark,
          textShadow: '0 30px 80px rgba(120,0,60,0.25)',
        }}>
          quenzy
        </div>
      </AbsoluteFill>
      <Studio camera={{ position: [Math.sin(orbit) * 7.2, 0.5, Math.cos(orbit) * 7.2], fov: 30, lookAt: [0, -0.1, 0] }} envRot={f * 0.01} envIntensity={1.05}>
        <Can flavor="blueberry" position={[0, y, 0]} spin={spin} rotation={[0, 0, -0.06 * rise]} scale={1.05} />
        <Bubbles t={f / 30} count={46} seed={11} spread={[2.6, 8, 2]} speed={1.3} size={0.07} y0={-4} />
        <group position={[0, y * 0.4, 0]}>
          <Blueberry position={[-1.35, 1.25 + Math.sin(f / 25) * 0.08, -1.2]} scale={0.22 * rise} rotation={[0.4, f / 60, 0.2]} />
          <Litchi position={[1.4, -0.9 + Math.sin(f / 30) * 0.08, -1]} scale={0.26 * rise} rotation={[0.2, f / 70, 0]} />
          <Blueberry position={[1.1, 1.7 + Math.sin(f / 22) * 0.06, 0.8]} scale={0.14 * rise} rotation={[1, f / 50, 0]} />
          <Litchi position={[-1.2, -1.6, 0.9]} scale={0.18 * rise} peeled rotation={[0.3, f / 80, 0.2]} />
        </group>
      </Studio>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 210 }}>
        <BlurIn at={8}>
          <Caps style={{ color: C.white, fontSize: 30 }}>Introducing</Caps>
        </BlurIn>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 190 }}>
        <Reveal at={96}>
          <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 96, color: C.white, letterSpacing: '-0.035em' }}>Prebiotic soda.</div>
        </Reveal>
        <BlurIn at={120}>
          <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 78, color: C.ink, marginTop: 6 }}>Soda, but with a gut feeling.</div>
        </BlurIn>
      </AbsoluteFill>
      <Grain opacity={0.07} />
      <Flash at={0} dur={14} />
    </AbsoluteFill>
  );
};
