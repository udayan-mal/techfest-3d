import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { live, setUI, getUI, useUI, glow } from '../store';

const RED = glow('#ff4d6d', 2.4);
const ORANGE = glow('#ffb347', 3);
const SPARKS = 180;
const canInteract = () => live.s > 2.7 && live.s < 3.7;

export default function Arena() {
  const { size } = useThree();
  const wide = size.width >= 900;
  const root = useRef<THREE.Group>(null!);
  const bot = useRef<THREE.Group>(null!);
  const spinner = useRef<THREE.Group>(null!);
  const eyeMat = useRef<THREE.MeshBasicMaterial>(null!);
  const opp = useRef<THREE.Group>(null!);
  const shock = useRef<THREE.Mesh>(null!);
  const shockMat = useRef<THREE.MeshBasicMaterial>(null!);
  const sparks = useRef<THREE.Points>(null!);
  const sparkMat = useRef<THREE.PointsMaterial>(null!);
  const attack = useRef(0);
  const hover = useRef(false);
  const knock = useRef(0);

  const sparkPos = useMemo(() => new Float32Array(SPARKS * 3).fill(-999), []);
  const sparkVel = useMemo(() => Array.from({ length: SPARKS }, () => new THREE.Vector3()), []);

  const trigger = () => {
    attack.current = 1;
    knock.current = 1;
    const o = bot.current.position;
    for (let i = 0; i < SPARKS; i++) {
      sparkPos[i * 3] = o.x + (Math.random() - 0.5) * 0.6;
      sparkPos[i * 3 + 1] = o.y + 0.5;
      sparkPos[i * 3 + 2] = o.z + 0.9;
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 6;
      sparkVel[i].set(Math.cos(a) * sp, 2 + Math.random() * 5, Math.sin(a) * sp * 0.6 + 2);
    }
  };

  const attackCount = useUI(u => u.attack);
  useEffect(() => { if (attackCount) trigger(); }, [attackCount]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((st, dt) => {
    const s = live.s;
    root.current.visible = s > 2.3 && s < 4.4;
    if (!root.current.visible) return;
    const t = st.clock.elapsedTime;
    attack.current = Math.max(0, attack.current - dt * 0.7);
    knock.current = Math.max(0, knock.current - dt * 0.9);
    const a = attack.current;

    // player bot: faces the cursor, lunges on attack
    const lunge = a > 0 ? Math.sin((1 - a) * Math.PI) * 1.4 : 0;
    bot.current.position.z = THREE.MathUtils.damp(bot.current.position.z, lunge, 10, dt);
    bot.current.position.y = -1.05 + Math.sin(t * 9) * 0.012 + (a > 0.6 ? (Math.random() - 0.5) * 0.05 : 0);
    bot.current.rotation.y = THREE.MathUtils.damp(bot.current.rotation.y, live.mx * 0.9, 4, dt);
    spinner.current.rotation.y += dt * (12 + a * 70 + (hover.current ? 10 : 0));
    eyeMat.current.color.copy(RED).multiplyScalar(0.6 + Math.abs(Math.sin(t * 4)) * 0.8 + a * 2);

    // rival wedge bot circles the arena and gets knocked when hit
    const ang = t * 0.55;
    const k = knock.current;
    opp.current.position.set(Math.cos(ang) * (3.6 + k * 1.5), -1.15 + Math.sin(k * Math.PI) * 1.2, Math.sin(ang) * (3.6 + k * 1.5));
    opp.current.rotation.set(k * 2, -ang + k * 8, 0);

    // shockwave
    shock.current.visible = a > 0;
    shock.current.scale.setScalar(1 + (1 - a) * 9);
    shockMat.current.opacity = a * 0.9;

    // sparks physics
    for (let i = 0; i < SPARKS; i++) {
      if (sparkPos[i * 3 + 1] < -900) continue;
      const v = sparkVel[i];
      v.y -= 9.8 * dt;
      sparkPos[i * 3] += v.x * dt;
      sparkPos[i * 3 + 1] += v.y * dt;
      sparkPos[i * 3 + 2] += v.z * dt;
      if (sparkPos[i * 3 + 1] < -1.45) { sparkPos[i * 3 + 1] = -1.45; v.y *= -0.35; v.x *= 0.7; v.z *= 0.7; }
    }
    sparks.current.geometry.attributes.position.needsUpdate = true;
    sparkMat.current.opacity = Math.min(1, a * 1.6);
  });

  return (
    <group ref={root} position={wide ? [3, 0, -120] : [0, 0.6, -120]} scale={wide ? 1 : 0.62}>
      {/* arena floor */}
      <mesh position={[0, -1.65, 0]} receiveShadow>
        <cylinderGeometry args={[6.5, 6.8, 0.3, 64]} />
        <meshStandardMaterial color="#0d0b14" metalness={0.85} roughness={0.35} />
      </mesh>
      <gridHelper args={[12, 24, '#ff4d6d', '#3a1424']} position={[0, -1.49, 0]} />
      <mesh position={[0, -1.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[6.5, 0.06, 8, 128]} />
        <meshBasicMaterial color={RED} toneMapped={false} />
      </mesh>
      <mesh position={[0, -1.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 1.75, 64]} />
        <meshBasicMaterial color={ORANGE} toneMapped={false} transparent opacity={0.6} />
      </mesh>
      {/* cage */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[6.6, 6.6, 3, 32, 4, true]} />
        <meshBasicMaterial color="#ff4d6d" wireframe transparent opacity={0.08} />
      </mesh>
      {/* pillars */}
      {[0, 1, 2, 3].map(i => {
        const an = Math.PI / 4 + (i * Math.PI) / 2;
        return (
          <group key={i} position={[Math.cos(an) * 7.2, 0, Math.sin(an) * 7.2]}>
            <mesh><boxGeometry args={[0.35, 3.4, 0.35]} /><meshStandardMaterial color="#16131f" metalness={0.8} roughness={0.3} /></mesh>
            <mesh position={[0, 1.8, 0]}><boxGeometry args={[0.45, 0.12, 0.45]} /><meshBasicMaterial color={RED} toneMapped={false} /></mesh>
          </group>
        );
      })}

      {/* player bot */}
      <group ref={bot} position={[0, -1.05, 0]}>
        <RoundedBox args={[1.6, 0.5, 2]} radius={0.08} smoothness={3}>
          <meshStandardMaterial color="#1c1a28" metalness={0.85} roughness={0.28} />
        </RoundedBox>
        <mesh position={[0, 0.29, -0.1]}>
          <boxGeometry args={[1.3, 0.08, 1.4]} />
          <meshStandardMaterial color="#2a0d16" emissive="#ff4d6d" emissiveIntensity={0.6} metalness={0.6} roughness={0.3} />
        </mesh>
        {[[-0.88, 0.6], [0.88, 0.6], [-0.88, -0.6], [0.88, -0.6]].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.05, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.32, 0.2, 20]} />
            <meshStandardMaterial color="#0a0a0f" roughness={0.8} />
          </mesh>
        ))}
        <group ref={spinner} position={[0, 0.5, 0.35]}>
          <mesh><cylinderGeometry args={[0.16, 0.16, 0.16, 16]} /><meshStandardMaterial color="#888" metalness={1} roughness={0.2} /></mesh>
          <mesh><boxGeometry args={[2.5, 0.08, 0.26]} /><meshStandardMaterial color="#b9bccc" metalness={1} roughness={0.15} /></mesh>
          <mesh position={[1.25, 0, 0]}><boxGeometry args={[0.12, 0.1, 0.3]} /><meshBasicMaterial color={ORANGE} toneMapped={false} /></mesh>
          <mesh position={[-1.25, 0, 0]}><boxGeometry args={[0.12, 0.1, 0.3]} /><meshBasicMaterial color={ORANGE} toneMapped={false} /></mesh>
        </group>
        <mesh position={[0, 0.42, -0.62]}><sphereGeometry args={[0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} /></mesh>
        <mesh position={[0, 0.5, -0.45]}><sphereGeometry args={[0.07, 16, 16]} /><meshBasicMaterial ref={eyeMat} color={RED} toneMapped={false} /></mesh>
        <mesh position={[0.5, 0.65, -0.8]}><cylinderGeometry args={[0.012, 0.012, 0.6, 6]} /><meshStandardMaterial color="#999" /></mesh>
        <mesh position={[0.5, 0.96, -0.8]}><sphereGeometry args={[0.04, 10, 10]} /><meshBasicMaterial color={ORANGE} toneMapped={false} /></mesh>
        {/* hit area */}
        <mesh
          position={[0, 0.3, 0]}
          onPointerOver={() => { if (!canInteract()) return; hover.current = true; setUI({ cursor: 'Attack' }); }}
          onPointerOut={() => { hover.current = false; setUI({ cursor: null }); }}
          onClick={() => { if (canInteract()) setUI({ attack: getUI().attack + 1 }); }}
        >
          <boxGeometry args={[2.8, 1.4, 2.6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* rival wedge bot */}
      <group ref={opp}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.01, 0.75, 1.3, 3]} />
          <meshStandardMaterial color="#141a2a" emissive="#5ef2ff" emissiveIntensity={0.35} metalness={0.8} roughness={0.3} flatShading />
        </mesh>
        <mesh position={[0, 0.25, 0]}><sphereGeometry args={[0.06, 10, 10]} /><meshBasicMaterial color={glow('#5ef2ff', 3)} toneMapped={false} /></mesh>
      </group>

      {/* shockwave */}
      <mesh ref={shock} position={[0, -1.45, 0.8]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.45, 0.55, 64]} />
        <meshBasicMaterial ref={shockMat} color={ORANGE} toneMapped={false} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* sparks */}
      <points ref={sparks}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkPos, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={sparkMat} size={0.09} color={ORANGE} toneMapped={false} transparent opacity={0} depthWrite={false} />
      </points>

      <pointLight position={[0, 4, 2]} color="#ff4d6d" intensity={60} distance={18} />
      <pointLight position={[-4, 2, 4]} color="#ffb347" intensity={25} distance={14} />
    </group>
  );
}
