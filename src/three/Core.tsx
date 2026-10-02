import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { live, setUI, range, glow, useUI } from '../store';

const CYAN = glow('#5ef2ff', 2.4);
const PINK = glow('#ff5cc8', 2.2);
const VIOLET = glow('#8b6cff', 2.2);
const GOLD = glow('#ffc857', 2.2);

export default function Core() {
  const { size } = useThree();
  const wide = size.width >= 900;

  const root = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);
  const ringA = useRef<THREE.Mesh>(null!);
  const ringB = useRef<THREE.Mesh>(null!);
  const ringC = useRef<THREE.Mesh>(null!);
  const sats = useRef<THREE.Group>(null!);
  const shock = useRef<THREE.Mesh>(null!);
  const shockMat = useRef<THREE.MeshBasicMaterial>(null!);
  const wireMat = useRef<THREE.MeshBasicMaterial>(null!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = useRef<any>(null);
  const pulse = useRef(0);
  const hover = useRef(false);

  const pulseCount = useUI(u => u.pulse);
  useEffect(() => { if (pulseCount) pulse.current = 1; }, [pulseCount]);

  useFrame((st, dt) => {
    const t = st.clock.elapsedTime;
    const s = live.s;
    root.current.visible = s < 1.25;
    if (!root.current.visible) return;

    pulse.current = Math.max(0, pulse.current - dt * 0.75);
    const p = pulse.current;
    const pass = range(s, 0.5, 1);

    const target = 1 + pass * 2.4 + (hover.current ? 0.1 : 0) + p * 0.25;
    root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, target, 6, dt));

    spin.current.rotation.y = THREE.MathUtils.damp(spin.current.rotation.y, t * 0.25 + live.mx * 0.9, 3, dt);
    spin.current.rotation.x = THREE.MathUtils.damp(spin.current.rotation.x, -live.my * 0.6, 3, dt);

    const boost = 1 + p * 4;
    ringA.current.rotation.x += dt * 0.5 * boost;
    ringA.current.rotation.y += dt * 0.2 * boost;
    ringB.current.rotation.y += dt * 0.4 * boost;
    ringB.current.rotation.z += dt * 0.25 * boost;
    ringC.current.rotation.z -= dt * 0.6 * boost;
    ringC.current.rotation.x += dt * 0.15 * boost;
    sats.current.rotation.y += dt * 0.6 * boost;
    sats.current.rotation.x = Math.sin(t * 0.3) * 0.4;

    if (blob.current) {
      blob.current.distort = 0.35 + p * 0.5;
      blob.current.emissiveIntensity = 1.4 + p * 3;
    }
    wireMat.current.opacity = 0.85 * (1 - pass);

    if (p > 0) {
      shock.current.visible = true;
      shock.current.scale.setScalar(1 + (1 - p) * 6);
      shockMat.current.opacity = p * 0.9;
    } else shock.current.visible = false;
  });

  const over = () => { if (live.s > 0.55) return; hover.current = true; setUI({ cursor: 'Pulse' }); };
  const out = () => { hover.current = false; setUI({ cursor: null }); };
  const click = () => { if (live.s > 0.55) return; pulse.current = 1; };

  return (
    <group position={wide ? [2.7, 0, 0] : [0, 1.1, 0]} scale={wide ? 1 : 0.72}>
      <group ref={root}>
        <group ref={spin}>
          {/* liquid energy heart */}
          <mesh>
            <icosahedronGeometry args={[1.05, 24]} />
            <MeshDistortMaterial ref={blob} color="#1a0b4a" emissive="#6b3dff" emissiveIntensity={1.4} roughness={0.15} metalness={0.4} distort={0.35} speed={2.2} />
          </mesh>
          {/* geodesic shell */}
          <mesh>
            <icosahedronGeometry args={[1.6, 1]} />
            <meshBasicMaterial ref={wireMat} color={CYAN} wireframe transparent opacity={0.85} toneMapped={false} />
          </mesh>
          {/* orbit rings */}
          <mesh ref={ringA}>
            <torusGeometry args={[2.1, 0.018, 8, 160]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
          <mesh ref={ringB} rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[2.45, 0.014, 8, 160]} />
            <meshBasicMaterial color={PINK} toneMapped={false} />
          </mesh>
          <mesh ref={ringC} rotation={[0, Math.PI / 3, 0]}>
            <torusGeometry args={[2.8, 0.03, 6, 6]} />
            <meshBasicMaterial color={VIOLET} toneMapped={false} />
          </mesh>
          {/* satellites */}
          <group ref={sats}>
            {[0, 1, 2, 3].map(i => {
              const a = (i / 4) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(a) * 3.1, Math.sin(a * 2) * 0.4, Math.sin(a) * 3.1]}>
                  <sphereGeometry args={[0.07, 16, 16]} />
                  <meshBasicMaterial color={[CYAN, PINK, GOLD, VIOLET][i]} toneMapped={false} />
                </mesh>
              );
            })}
          </group>
        </group>

        {/* shockwave */}
        <mesh ref={shock} visible={false}>
          <torusGeometry args={[1.2, 0.04, 8, 120]} />
          <meshBasicMaterial ref={shockMat} color={CYAN} transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>

        {/* invisible hit area */}
        <mesh onPointerOver={over} onPointerOut={out} onClick={click}>
          <sphereGeometry args={[2, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <pointLight color="#8b6cff" intensity={30} distance={12} />
    </group>
  );
}
