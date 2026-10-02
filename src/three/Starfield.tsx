import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Starfield({ count = 4500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const [pos, col] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = ['#ffffff', '#5ef2ff', '#8b6cff', '#ff5cc8'].map(c => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      const r = 7 + Math.random() * 45;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r * 0.7;
      pos[i * 3 + 2] = 25 - Math.random() * 270;
      const c = palette[Math.random() < 0.65 ? 0 : 1 + Math.floor(Math.random() * 3)];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((_, dt) => { ref.current.rotation.z += dt * 0.012; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[col, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors sizeAttenuation transparent opacity={0.9} depthWrite={false} />
    </points>
  );
}
