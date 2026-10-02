import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { live, setUI, getUI, useUI, holdOf, glow } from '../store';
import { segments } from '../data';

const R = 5;
const STEP = (Math.PI * 2) / segments.length;

function Shape({ shape }: { shape: string }) {
  switch (shape) {
    case 'octa': return <octahedronGeometry args={[0.95, 0]} />;
    case 'planet': return <sphereGeometry args={[0.75, 32, 32]} />;
    case 'knot': return <torusKnotGeometry args={[0.55, 0.18, 140, 18]} />;
    case 'dodeca': return <dodecahedronGeometry args={[0.85, 0]} />;
    case 'box': return <boxGeometry args={[1.15, 1.15, 1.15]} />;
    default: return <icosahedronGeometry args={[0.9, 0]} />;
  }
}

const canInteract = () => live.s > 1.7 && live.s < 2.7;

function SegmentObj({ i, isActive, showLabel }: { i: number; isActive: boolean; showLabel: boolean }) {
  const d = segments[i];
  const g = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshStandardMaterial>(null!);
  const hover = useRef(false);

  useFrame((_, dt) => {
    const on = hover.current || isActive;
    g.current.scale.setScalar(THREE.MathUtils.damp(g.current.scale.x, hover.current ? 1.4 : isActive ? 1.25 : 0.85, 6, dt));
    mesh.current.rotation.x += dt * 0.35;
    mesh.current.rotation.y += dt * (hover.current ? 1.8 : 0.5);
    mat.current.emissiveIntensity = THREE.MathUtils.damp(mat.current.emissiveIntensity, on ? 2.4 : 0.5, 5, dt);
  });

  const a = i * STEP;
  return (
    <group position={[Math.sin(a) * R, 0, Math.cos(a) * R]}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.9}>
        <group ref={g}>
          <mesh
            ref={mesh}
            onPointerOver={e => { if (!canInteract()) return; e.stopPropagation(); hover.current = true; setUI({ cursor: 'Open' }); }}
            onPointerOut={() => { hover.current = false; setUI({ cursor: null }); }}
            onClick={e => { if (!canInteract()) return; e.stopPropagation(); setUI({ selected: i }); }}
          >
            <Shape shape={d.shape} />
            <meshStandardMaterial ref={mat} color="#120a26" emissive={d.color} emissiveIntensity={0.5} metalness={0.7} roughness={0.25} flatShading />
          </mesh>
          <mesh scale={1.18}>
            <Shape shape={d.shape} />
            <meshBasicMaterial color={glow(d.color, 1.6)} wireframe transparent opacity={0.25} toneMapped={false} />
          </mesh>
          {d.shape === 'planet' && (
            <mesh rotation={[1.2, 0, 0.35]}>
              <torusGeometry args={[1.2, 0.04, 8, 120]} />
              <meshBasicMaterial color={glow(d.color, 2)} toneMapped={false} />
            </mesh>
          )}
        </group>
        {showLabel && (
          <Html center position={[0, -1.65, 0]} zIndexRange={[5, 0]}>
            <div className={`label3d ${isActive ? 'on' : ''}`} style={{ color: d.color }}>{d.name}</div>
          </Html>
        )}
      </Float>
    </group>
  );
}

export default function SegmentsRing() {
  const { size } = useThree();
  const wide = size.width >= 900;
  const root = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Group>(null!);
  const beam = useRef<THREE.Mesh>(null!);
  const hexRef = useRef<THREE.Mesh>(null!);
  const angle = useRef(0);
  const lastActive = useRef(0);

  const section = useUI(u => u.section);
  const selected = useUI(u => u.selected);
  const active = useUI(u => u.active);
  const shown = selected ?? active;

  useFrame((st, dt) => {
    const s = live.s;
    root.current.visible = s > 1.2 && s < 3.4;
    if (!root.current.visible) return;
    const h = holdOf(s, 2);
    const scrollActive = Math.round(h * (segments.length - 1));
    if (scrollActive !== lastActive.current) {
      lastActive.current = scrollActive;
      setUI({ active: scrollActive, selected: null });
    }
    const sel = getUI().selected;
    const base = sel != null ? -sel * STEP : -h * (segments.length - 1) * STEP;
    const target = base + Math.PI * 2 * Math.round((angle.current - base) / (Math.PI * 2));
    angle.current = THREE.MathUtils.damp(angle.current, target, 4, dt);
    ring.current.rotation.y = angle.current;

    const t = st.clock.elapsedTime;
    beam.current.scale.x = beam.current.scale.z = 1 + Math.sin(t * 3) * 0.15;
    hexRef.current.rotation.y = t * 0.5;
  });

  const color = segments[shown].color;

  return (
    <group ref={root} position={wide ? [2.6, 0, -80] : [0, 0.8, -80]} scale={wide ? 1 : 0.55}>
      <group ref={ring}>
        {segments.map((_, i) => (
          <SegmentObj key={i} i={i} isActive={i === shown} showLabel={section === 2} />
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R, 0.015, 8, 200]} />
          <meshBasicMaterial color={glow('#8b6cff', 1.8)} toneMapped={false} transparent opacity={0.6} />
        </mesh>
      </group>
      {/* central beacon tinted with the active segment colour */}
      <mesh ref={beam}>
        <cylinderGeometry args={[0.05, 0.05, 9, 12]} />
        <meshBasicMaterial color={glow(color, 3)} toneMapped={false} />
      </mesh>
      <mesh ref={hexRef}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshBasicMaterial color={glow(color, 2)} wireframe toneMapped={false} />
      </mesh>
      <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R - 0.6, R + 0.6, 6, 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color={color} intensity={50} distance={20} />
    </group>
  );
}
