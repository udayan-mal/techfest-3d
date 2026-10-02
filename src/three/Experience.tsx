import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { live, clamp, smooth } from '../store';
import { stations } from '../data';
import Starfield from './Starfield';
import Core from './Core';
import Tunnel from './Tunnel';
import SegmentsRing from './SegmentsRing';
import Arena from './Arena';
import Globe from './Globe';
import Portal from './Portal';

function CameraRig() {
  const { camera, scene } = useThree();
  const look = useRef(stations[0].l0.clone());
  const pos = useMemo(() => new THREE.Vector3(), []);
  const lk = useMemo(() => new THREE.Vector3(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const bgs = useMemo(() => stations.map(s => new THREE.Color(s.bg)), []);

  useEffect(() => {
    camera.position.copy(stations[0].p0);
    camera.lookAt(look.current);
  }, [camera]);

  useFrame((_, dt) => {
    const n = stations.length;
    const s = clamp(live.s, 0, n - 0.5);
    const i = Math.min(Math.floor(s), n - 1);
    const f = s - i;
    const a = stations[i];
    let from = i, to = i, ct = 0;

    if (f <= 0.5 || i === n - 1) {
      // pinned: drift slowly inside the station
      const t = smooth(Math.min(f, 0.5) / 0.5);
      pos.lerpVectors(a.p0, a.p1, t);
      lk.lerpVectors(a.l0, a.l1, t);
    } else {
      // flight to the next station
      const b = stations[i + 1];
      const t = smooth((f - 0.5) / 0.5);
      pos.lerpVectors(a.p1, b.p0, t);
      lk.lerpVectors(a.l1, b.l0, t);
      to = i + 1; ct = t;
    }

    pos.x += live.mx * 0.4;
    pos.y -= live.my * 0.3;

    const k = 1 - Math.exp(-dt * 3.5);
    camera.position.lerp(pos, k);
    look.current.lerp(lk, k);
    camera.lookAt(look.current);

    col.lerpColors(bgs[from], bgs[to], ct);
    (scene.background as THREE.Color).copy(col);
    if (scene.fog) scene.fog.color.copy(col);
  });
  return null;
}

export default function Experience() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 50, near: 0.1, far: 140, position: [0, 0, 9] }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#05030f']} />
        <fog attach="fog" args={['#05030f', 7, 42]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 6, 5]} intensity={1.1} />
        <hemisphereLight args={['#5ef2ff', '#ff5cc8', 0.25]} />

        <CameraRig />
        <Starfield />
        <Core />
        <Tunnel />
        <SegmentsRing />
        <Arena />
        <Globe />
        <Portal />

        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.95} luminanceSmoothing={0.2} radius={0.75} />
          <Vignette offset={0.25} darkness={0.75} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
