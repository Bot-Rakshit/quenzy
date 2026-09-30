// Shared 3D setup: HDRI environment (real Poly Haven studio captures), tone
// mapping and a transparent canvas so CSS backgrounds show through.
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { continueRender, delayRender, staticFile, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { fontsReady } from '../fonts';

const hdrCache: Record<string, Promise<THREE.DataTexture>> = {};
function loadHdr(file: string) {
  if (!hdrCache[file]) {
    hdrCache[file] = new Promise((res) =>
      new HDRLoader().load(staticFile(`hdri/${file}`), (t) => {
        t.mapping = THREE.EquirectangularReflectionMapping;
        res(t);
      }),
    );
  }
  return hdrCache[file];
}

export function useAssets(hdr: string) {
  const [tex, setTex] = useState<THREE.DataTexture | null>(null);
  const [h] = useState(() => delayRender(`assets ${hdr}`));
  useEffect(() => {
    Promise.all([loadHdr(hdr), fontsReady]).then(([t]) => {
      setTex(t);
      continueRender(h);
    });
  }, [hdr]);
  return tex;
}

const Env: React.FC<{ tex: THREE.Texture; intensity: number; rot: number }> = ({ tex, intensity, rot }) => {
  const { scene, invalidate } = useThree();
  useLayoutEffect(() => {
    scene.environment = tex;
    scene.environmentIntensity = intensity;
    scene.environmentRotation.set(0, rot, 0);
    invalidate();
  }, [tex, intensity, rot]);
  return null;
};

export const Studio: React.FC<{
  hdr?: string;
  envIntensity?: number;
  envRot?: number;
  camera?: { position: [number, number, number]; fov?: number; lookAt?: [number, number, number] };
  exposure?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ hdr = 'studio_small_03_1k.hdr', envIntensity = 1, envRot = 0, camera = { position: [0, 0, 7], fov: 30 }, exposure = 1.3, style, children }) => {
  const { width, height } = useVideoConfig();
  const tex = useAssets(hdr);
  if (!tex) return null;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, ...style }}
      camera={{ position: camera.position, fov: camera.fov ?? 30 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: exposure, preserveDrawingBuffer: true }}
    >
      <Env tex={tex} intensity={envIntensity} rot={envRot} />
      <CamLook target={camera.lookAt ?? [0, 0, 0]} pos={camera.position} fov={camera.fov ?? 30} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <directionalLight position={[-4, 2, -3]} intensity={1.6} color="#ffe6f2" />
      {children}
    </ThreeCanvas>
  );
};

const CamLook: React.FC<{ target: [number, number, number]; pos: [number, number, number]; fov: number }> = ({ target, pos, fov }) => {
  const { camera, invalidate } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...pos);
    (camera as THREE.PerspectiveCamera).fov = fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(...target);
    invalidate();
  }, [target[0], target[1], target[2], pos[0], pos[1], pos[2], fov]);
  return null;
};
