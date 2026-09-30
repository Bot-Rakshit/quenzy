import { useMemo } from 'react';
import * as THREE from 'three';
import { FlavorKey } from '../theme';
import { makeDropletNormals, makeLabel } from '../art/label';

// Real sleek-can proportions (≈53mm × 134mm), 1 unit ≈ 5cm. Origin at the can's centre.
const Y0 = 1.34;
const R = 0.53;
const BODY_BOT = 0.125;
const BODY_TOP = 2.445;

const bottomProfile = [
  [0.0, 0.1], [0.2, 0.086], [0.36, 0.06], [0.42, 0.008], [0.46, 0.0], [0.5, 0.024], [0.524, 0.08], [0.53, BODY_BOT],
];
const topProfile = [
  [0.53, BODY_TOP], [0.526, 2.49], [0.492, 2.56], [0.456, 2.612], [0.452, 2.645], [0.462, 2.664], [0.468, 2.676],
  [0.46, 2.687], [0.442, 2.681], [0.433, 2.658], [0.426, 2.628], [0.4, 2.62], [0.2, 2.624], [0.0, 2.627],
];
const lathe = (pts: number[][]) =>
  new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y - Y0)), 128);

const texCache: Record<string, THREE.CanvasTexture> = {};
function labelTexture(key: FlavorKey) {
  if (!texCache[key]) {
    const t = new THREE.CanvasTexture(makeLabel(key));
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.offset.x = 0.5; // put the label's centre on the can's front (+z)
    t.anisotropy = 8;
    texCache[key] = t;
  }
  return texCache[key];
}
let dropTex: THREE.CanvasTexture | null = null;
function dropletTexture() {
  if (!dropTex) {
    dropTex = new THREE.CanvasTexture(makeDropletNormals());
    dropTex.wrapS = dropTex.wrapT = THREE.RepeatWrapping;
    dropTex.repeat.set(2, 2);
    dropTex.offset.x = 0.5;
  }
  return dropTex;
}

const geo = {
  body: new THREE.CylinderGeometry(R, R, BODY_TOP - BODY_BOT, 160, 1, true).translate(0, (BODY_TOP + BODY_BOT) / 2 - Y0, 0),
  bottom: lathe(bottomProfile),
  top: lathe(topProfile),
  tab: (() => {
    const s = new THREE.Shape();
    const w = 0.11, l1 = 0.08, l2 = 0.3;
    s.moveTo(-w, -l1);
    s.quadraticCurveTo(-w, -l1 - 0.06, 0, -l1 - 0.06);
    s.quadraticCurveTo(w, -l1 - 0.06, w, -l1);
    s.lineTo(w * 0.95, l2 - 0.06);
    s.quadraticCurveTo(w * 0.9, l2, 0, l2);
    s.quadraticCurveTo(-w * 0.9, l2, -w * 0.95, l2 - 0.06);
    s.closePath();
    const hole = new THREE.Path();
    hole.absellipse(0, 0.17, 0.06, 0.07, 0, Math.PI * 2, false, 0);
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.006, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    return g;
  })(),
  rivet: new THREE.CylinderGeometry(0.035, 0.04, 0.02, 24),
  mouth: (() => {
    const s = new THREE.Shape();
    s.absellipse(0, 0, 0.13, 0.1, 0, Math.PI * 2, false, 0);
    const g = new THREE.ShapeGeometry(s, 32);
    g.rotateX(-Math.PI / 2);
    return g;
  })(),
};

const metal = new THREE.MeshPhysicalMaterial({ color: '#f2f2f6', metalness: 0.92, roughness: 0.3, side: THREE.DoubleSide, envMapIntensity: 1.9 });
const tabMetal = new THREE.MeshPhysicalMaterial({ color: '#e6e6ec', metalness: 0.9, roughness: 0.3, envMapIntensity: 1.8 });
const dark = new THREE.MeshBasicMaterial({ color: '#0a0610' });

export const Can: React.FC<{
  flavor: FlavorKey;
  spin?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  open?: number; // 0 closed .. 1 tab lifted
  cold?: boolean;
}> = ({ flavor, spin = 0, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, open = 0, cold = true }) => {
  const labelMat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      map: labelTexture(flavor),
      metalness: 0.12,
      roughness: 0.38,
      clearcoat: 0.8,
      clearcoatRoughness: 0.08,
      envMapIntensity: 0.9,
    });
    if (cold) {
      m.normalMap = dropletTexture();
      m.normalScale = new THREE.Vector2(0.55, 0.55);
      m.clearcoatNormalMap = dropletTexture();
      m.clearcoatNormalScale = new THREE.Vector2(0.9, 0.9);
    }
    return m;
  }, [flavor, cold]);
  const lidY = 2.628 - Y0;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group rotation={[0, spin, 0]}>
        <mesh geometry={geo.body} material={labelMat} />
        <mesh geometry={geo.bottom} material={metal} />
        <mesh geometry={geo.top} material={metal} />
        {open > 0 && <mesh geometry={geo.mouth} material={dark} position={[0, lidY + 0.004, 0.2]} />}
        <mesh geometry={geo.rivet} material={tabMetal} position={[0, lidY + 0.008, 0]} />
        <group position={[0, lidY + 0.016, 0.0]} rotation={[open * 1.1, 0, 0]}>
          <mesh geometry={geo.tab} material={tabMetal} />
        </group>
      </group>
    </group>
  );
};
