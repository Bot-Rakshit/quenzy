// Procedural, physically-shaded 3D fruit + fizz bubbles.
import React from 'react';
import * as THREE from 'three';
import { rng } from '../art/fruits2d';

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number };

const once = <T,>(fn: () => T) => {
  let v: T | undefined;
  return () => (v === undefined ? (v = fn()) : v);
};
const canvas = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  draw(cv.getContext('2d')!);
  return cv;
};
const tex = (cv: HTMLCanvasElement, srgb = true) => {
  const t = new THREE.CanvasTexture(cv);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const noiseCanvas = (seed: number, n = 6000, r0 = 1, r1 = 3) =>
  canvas(512, 512, (c) => {
    c.fillStyle = '#808080';
    c.fillRect(0, 0, 512, 512);
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      c.fillStyle = R() > 0.5 ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.25)';
      c.beginPath();
      c.arc(R() * 512, R() * 512, r0 + R() * (r1 - r0), 0, Math.PI * 2);
      c.fill();
    }
  });

// ---------------- blueberry ----------------
const berry = once(() => {
  const g = new THREE.SphereGeometry(1, 64, 48);
  g.scale(1, 0.86, 1);
  const crownShape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.14 : 0.34;
    const a = (i / 10) * Math.PI * 2;
    i ? crownShape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : crownShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  crownShape.closePath();
  const crown = new THREE.ExtrudeGeometry(crownShape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
  crown.rotateX(-Math.PI / 2);
  return {
    g,
    crown,
    mat: new THREE.MeshPhysicalMaterial({
      color: '#34307e', roughness: 0.42, sheen: 1, sheenColor: new THREE.Color('#9aa3e6'), sheenRoughness: 0.55,
      clearcoat: 0.3, clearcoatRoughness: 0.5, bumpMap: tex(noiseCanvas(3, 3000, 1, 2), false), bumpScale: 0.6,
    }),
    crownMat: new THREE.MeshStandardMaterial({ color: '#1b1340', roughness: 0.8 }),
  };
});
export const Blueberry: React.FC<P> = ({ position, rotation, scale = 1 }) => {
  const b = berry();
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={b.g} material={b.mat} />
      <mesh geometry={b.crown} material={b.crownMat} position={[0, 0.8, 0]} />
    </group>
  );
};

// ---------------- litchi ----------------
const lit = once(() => {
  const g = new THREE.IcosahedronGeometry(1, 48);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const b = Math.abs(Math.sin(v.x * 17) * Math.sin(v.y * 17) * Math.sin(v.z * 17));
    const r = 1 + 0.045 * Math.pow(b, 0.6) - (v.y > 0.93 ? 0.08 * (v.y - 0.93) * 14 : 0);
    v.multiplyScalar(r);
    v.y *= 1.06;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  const flesh = new THREE.SphereGeometry(0.9, 64, 48);
  flesh.scale(1, 1.08, 1);
  return {
    g,
    flesh,
    skin: new THREE.MeshPhysicalMaterial({ color: '#d42c4e', roughness: 0.62, clearcoat: 0.15, sheen: 0.4, sheenColor: new THREE.Color('#ff9fb0') }),
    fleshMat: new THREE.MeshPhysicalMaterial({
      color: '#f6efe8', roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.6, sheenColor: new THREE.Color('#ffffff'),
      transmission: 0, thickness: 0.5, bumpMap: tex(noiseCanvas(8, 1200, 4, 12), false), bumpScale: 0.4,
    }),
  };
});
export const Litchi: React.FC<P & { peeled?: boolean }> = ({ position, rotation, scale = 1, peeled }) => {
  const l = lit();
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={peeled ? l.flesh : l.g} material={peeled ? l.fleshMat : l.skin} />
    </group>
  );
};

// ---------------- slices (orange, cucumber) ----------------
const sliceFace = (kind: 'orange' | 'cucumber') =>
  canvas(1024, 1024, (c) => {
    const cx = 512, R = 500;
    const Rn = rng(kind === 'orange' ? 5 : 9);
    c.fillStyle = kind === 'orange' ? '#EE7210' : '#1D5A2A';
    c.fillRect(0, 0, 1024, 1024);
    if (kind === 'orange') {
      c.fillStyle = '#F07A12';
      c.beginPath(); c.arc(cx, cx, R, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFE8C6';
      c.beginPath(); c.arc(cx, cx, R * 0.9, 0, Math.PI * 2); c.fill();
      const n = 11;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2 + 0.035, a1 = ((i + 1) / n) * Math.PI * 2 - 0.035;
        const g = c.createRadialGradient(cx, cx, R * 0.05, cx, cx, R * 0.85);
        g.addColorStop(0, '#FFB557');
        g.addColorStop(1, '#FF8A1E');
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(cx + Math.cos((a0 + a1) / 2) * R * 0.07, cx + Math.sin((a0 + a1) / 2) * R * 0.07);
        c.arc(cx, cx, R * 0.84, a0, a1);
        c.closePath();
        c.fill();
        // juice vesicles
        for (let k = 0; k < 70; k++) {
          const a = a0 + Rn() * (a1 - a0), d = R * (0.15 + Rn() * 0.66);
          c.fillStyle = Rn() > 0.5 ? 'rgba(255,240,200,0.35)' : 'rgba(210,90,0,0.25)';
          c.beginPath();
          c.ellipse(cx + Math.cos(a) * d, cx + Math.sin(a) * d, 5 + Rn() * 6, 14 + Rn() * 12, a, 0, Math.PI * 2);
          c.fill();
        }
      }
      c.fillStyle = '#FFF1DA';
      c.beginPath(); c.arc(cx, cx, R * 0.07, 0, Math.PI * 2); c.fill();
    } else {
      c.fillStyle = '#1F5E2B';
      c.beginPath(); c.arc(cx, cx, R, 0, Math.PI * 2); c.fill();
      const g = c.createRadialGradient(cx, cx, R * 0.1, cx, cx, R * 0.94);
      g.addColorStop(0, '#E9F9C9');
      g.addColorStop(0.55, '#CDEFA4');
      g.addColorStop(1, '#8FD16A');
      c.fillStyle = g;
      c.beginPath(); c.arc(cx, cx, R * 0.94, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(240,255,225,0.9)';
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + 0.5;
        c.beginPath();
        c.ellipse(cx + Math.cos(a) * R * 0.3, cx + Math.sin(a) * R * 0.3, R * 0.2, R * 0.3, a, 0, Math.PI * 2);
        c.fill();
        for (let j = 0; j < 6; j++) {
          const aa = a + (j - 2.5) * 0.18;
          c.fillStyle = 'rgba(255,255,240,1)';
          c.beginPath();
          c.ellipse(cx + Math.cos(aa) * R * 0.34, cx + Math.sin(aa) * R * 0.34, 12, 26, aa, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = 'rgba(240,255,225,0.9)';
        }
      }
    }
  });
const slices = once(() => {
  const g = new THREE.CylinderGeometry(1, 1, 0.16, 96, 1, false);
  const mk = (kind: 'orange' | 'cucumber', side: string) => {
    const face = new THREE.MeshPhysicalMaterial({ map: tex(sliceFace(kind)), roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.12, bumpMap: tex(noiseCanvas(kind.length, 5000, 1, 4), false), bumpScale: 0.3 });
    const s = new THREE.MeshPhysicalMaterial({ color: side, roughness: 0.4, clearcoat: 0.5 });
    return [s, face, face];
  };
  return { g, orange: mk('orange', '#EE7210'), cucumber: mk('cucumber', '#1D5A2A') };
});
export const OrangeSlice: React.FC<P> = ({ position, rotation, scale = 1 }) => {
  const s = slices();
  return <mesh geometry={s.g} material={s.orange} position={position} rotation={rotation} scale={scale} />;
};
export const CucumberSlice: React.FC<P> = ({ position, rotation, scale = 1 }) => {
  const s = slices();
  return <mesh geometry={s.g} material={s.cucumber} position={position} rotation={rotation} scale={scale} />;
};

// ---------------- whole orange ----------------
const orange = once(() => ({
  g: new THREE.SphereGeometry(1, 64, 48),
  mat: new THREE.MeshPhysicalMaterial({ color: '#F57A0C', roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.3, bumpMap: tex(noiseCanvas(12, 16000, 1, 2.5), false), bumpScale: 1.4 }),
  leaf: new THREE.MeshPhysicalMaterial({ color: '#2E9A4E', roughness: 0.45, clearcoat: 0.6, side: THREE.DoubleSide }),
  leafG: (() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.35, 0.25, 0, 0.8);
    s.quadraticCurveTo(-0.35, 0.25, 0, 0);
    return new THREE.ShapeGeometry(s, 16);
  })(),
}));
export const Orange: React.FC<P> = ({ position, rotation, scale = 1 }) => {
  const o = orange();
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={o.g} material={o.mat} />
      <mesh geometry={o.leafG} material={o.leaf} position={[0, 0.95, 0]} rotation={[0.6, 0, -0.5]} />
    </group>
  );
};

// ---------------- mint leaf ----------------
const mint = once(() => {
  const cv = canvas(512, 768, (c) => {
    c.clearRect(0, 0, 512, 768);
    c.beginPath();
    c.moveTo(256, 740);
    c.bezierCurveTo(470, 560, 500, 200, 256, 20);
    c.bezierCurveTo(12, 200, 42, 560, 256, 740);
    c.closePath();
    const g = c.createLinearGradient(0, 0, 512, 768);
    g.addColorStop(0, '#4CC877');
    g.addColorStop(1, '#1B8048');
    c.fillStyle = g;
    c.fill();
    c.strokeStyle = 'rgba(20,90,50,0.45)';
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(256, 740);
    c.lineTo(256, 60);
    for (let i = 0; i < 6; i++) {
      const y = 640 - i * 100;
      c.moveTo(256, y);
      c.quadraticCurveTo(330, y - 50, 420 - i * 20, y - 110);
      c.moveTo(256, y);
      c.quadraticCurveTo(182, y - 50, 92 + i * 20, y - 110);
    }
    c.stroke();
  });
  const g = new THREE.PlaneGeometry(0.66, 1, 16, 24);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, -x * x * 0.9 + Math.sin((y + 0.5) * 2.2) * 0.12);
  }
  g.computeVertexNormals();
  return { g, mat: new THREE.MeshPhysicalMaterial({ map: tex(cv), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.2 }) };
});
export const MintLeaf: React.FC<P> = ({ position, rotation, scale = 1 }) => {
  const m = mint();
  return <mesh geometry={m.g} material={m.mat} position={position} rotation={rotation} scale={scale} />;
};

// ---------------- soft-serve cream swirl ----------------
const cream = once(() => {
  const pts: THREE.Vector3[] = [];
  const turns = 3.2, n = 220;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const a = k * turns * Math.PI * 2;
    const r = 0.75 * (1 - k) + 0.02;
    pts.push(new THREE.Vector3(Math.cos(a) * r, k * 1.2, Math.sin(a) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const g = new THREE.TubeGeometry(curve, 400, 0.3, 24, false);
  // taper the tube towards the tip
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const k = Math.min(1, Math.max(0, v.y / 1.2));
    const c = curve.getPointAt(Math.min(0.999, k));
    v.sub(c).multiplyScalar(1 - 0.75 * k * k).add(c);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  g.translate(0, -0.5, 0);
  return { g, mat: new THREE.MeshPhysicalMaterial({ color: '#FFF1DC', roughness: 0.38, sheen: 1, sheenColor: new THREE.Color('#ffffff'), clearcoat: 0.3 }) };
});
export const Cream: React.FC<P> = ({ position, rotation, scale = 1 }) => {
  const c = cream();
  return <mesh geometry={c.g} material={c.mat} position={position} rotation={rotation} scale={scale} />;
};

// ---------------- fizz bubbles ----------------
const bub = once(() => ({
  g: new THREE.SphereGeometry(1, 32, 24),
  mat: new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, envMapIntensity: 3, iridescence: 0.6 }),
}));
export const Bubbles: React.FC<{ t: number; count?: number; seed?: number; spread?: [number, number, number]; speed?: number; size?: number; y0?: number }> = ({
  t, count = 40, seed = 1, spread = [3.2, 7, 2.5], speed = 1.2, size = 0.06, y0 = -3.5,
}) => {
  const b = bub();
  const R = rng(seed);
  const items = [];
  for (let i = 0; i < count; i++) {
    const x = (R() - 0.5) * spread[0] * 2, z = (R() - 0.5) * spread[2] * 2, ph = R(), s = size * (0.4 + R() * 1.4), sp = speed * (0.6 + R() * 0.8);
    const y = y0 + ((t * sp + ph * spread[1]) % spread[1]);
    items.push(<mesh key={i} geometry={b.g} material={b.mat} position={[x + Math.sin(t * 2 + i) * 0.05, y, z]} scale={s} />);
  }
  return <>{items}</>;
};
