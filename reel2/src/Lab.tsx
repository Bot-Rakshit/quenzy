import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Can } from './three/Can';
import { Studio } from './three/Studio';
import { Blueberry, Bubbles, Cream, CucumberSlice, Litchi, MintLeaf, Orange, OrangeSlice } from './three/Fruits';

export const Lab: React.FC<{ flavor: 'blueberry' | 'orange' | 'cucumber'; spin: number; cam: [number, number, number]; fruits?: boolean }> = ({ flavor, spin, cam, fruits }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 40%, #FF8CC2 0%, #FF5FA8 45%, #E23A8A 100%)' }}>
      <Studio camera={{ position: cam, fov: 28 }}>
        {fruits ? (
          <>
            <Blueberry position={[-1, 2.2, 0]} scale={0.35} rotation={[0.3, 0, 0.2]} />
            <Litchi position={[0, 2.2, 0]} scale={0.42} />
            <Litchi position={[1, 2.2, 0]} scale={0.4} peeled />
            <OrangeSlice position={[-1, 0.9, 0]} scale={0.45} rotation={[1.2, 0, 0.2]} />
            <Orange position={[0, 0.9, 0]} scale={0.42} />
            <Cream position={[1, 0.9, 0]} scale={0.45} />
            <CucumberSlice position={[-1, -0.4, 0]} scale={0.45} rotation={[1.1, 0.3, 0]} />
            <MintLeaf position={[0, -0.4, 0]} scale={0.9} rotation={[0.2, 0.4, 0.3]} />
            <Bubbles t={f / 30} count={30} />
          </>
        ) : (
          <Can flavor={flavor} spin={spin + f * 0.02} open={0} />
        )}
      </Studio>
    </AbsoluteFill>
  );
};
