import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { live, glow } from '../store';

const COLORS = [glow('#5ef2ff', 2.2), glow('#8b6cff', 2.2), glow('#ff5cc8', 2)];

export default function Tunnel() {
  const group = useRef<THREE.Group>(null!);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const streaks = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const ringData = useMemo(
    () => Array.from({ length: 34 }, (_, i) => ({ z: -6 - i * 1.65, hex: i % 3 === 0, color: COLORS[i % 3] })),
    [],
  );
  const streakData = useMemo(
    () => Array.from({ length: 110 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: 1.4 + Math.random() * 1.6,
      z: -4 - Math.random() * 60,
      sp: 5 + Math.random() * 16,
      len: 0.5 + Math.random() * 2,
    })),
    [],
  );

  useFrame((st, dt) => {
    const s = live.s;
    group.current.visible = s < 2.35;
    if (!group.current.visible) return;
    const t = st.clock.elapsedTime;
    // streaks rush faster while the camera is travelling through the tunnel
    const travel = s > 0.5 && s < 2 ? 2.2 : 1;

    rings.current.forEach((m, i) => {
      if (!m) return;
      m.rotation.z = t * 0.15 * (i % 2 ? 1 : -1) + i * 0.17;
      const w = Math.sin(t * 2.2 - i * 0.35);
      m.scale.setScalar(1 + w * 0.06);
    });

    streakData.forEach((d, i) => {
      d.z += d.sp * dt * travel;
      if (d.z > -4) d.z = -64;
      dummy.position.set(Math.cos(d.a) * d.r, Math.sin(d.a) * d.r, d.z);
      dummy.scale.set(1, 1, d.len * travel);
      dummy.updateMatrix();
      streaks.current.setMatrixAt(i, dummy.matrix);
    });
    streaks.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      {ringData.map((r, i) => (
        <mesh key={i} ref={el => { rings.current[i] = el; }} position={[0, 0, r.z]}>
          {r.hex ? <torusGeometry args={[3.4, 0.05, 6, 6]} /> : <torusGeometry args={[3.2, 0.022, 8, 120]} />}
          <meshBasicMaterial color={r.color} toneMapped={false} transparent opacity={0.85} />
        </mesh>
      ))}
      <instancedMesh ref={streaks} args={[undefined, undefined, streakData.length]}>
        <boxGeometry args={[0.025, 0.025, 1]} />
        <meshBasicMaterial color={glow('#cfe9ff', 2.5)} toneMapped={false} />
      </instancedMesh>
      <pointLight position={[0, 0, -30]} color="#5ef2ff" intensity={40} distance={30} />
    </group>
  );
}
