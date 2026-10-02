import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { live, setUI, range, glow } from '../store';
import { cities, home } from '../data';

const RG = 2.8;
const D = Math.PI / 180;
const CYAN = glow('#5ef2ff', 2.2);
const GOLD = glow('#ffc857', 3);
const PINK = glow('#ff5cc8', 2.5);

function ll(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * D;
  const th = (lon + 180) * D;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}

const canInteract = () => live.s > 3.6 && live.s < 4.6;

export default function Globe() {
  const { size } = useThree();
  const wide = size.width >= 900;
  const root = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);
  const orbit = useRef<THREE.Mesh>(null!);
  const pulses = useRef<(THREE.Mesh | null)[]>([]);
  const homeRing = useRef<THREE.Mesh>(null!);
  const drag = useRef({ on: false, x: 0, y: 0, v: 0 });

  const dots = useMemo(() => {
    const n = 2200;
    const arr = new Float32Array(n * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = golden * i;
      arr[i * 3] = Math.cos(th) * rad * RG;
      arr[i * 3 + 1] = y * RG;
      arr[i * 3 + 2] = Math.sin(th) * rad * RG;
    }
    return arr;
  }, []);

  const homeV = useMemo(() => ll(home.lat, home.lon, RG), []);
  const arcs = useMemo(() => cities.map(c => {
    const b = ll(c.lat, c.lon, RG);
    const mid = homeV.clone().add(b).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(RG + homeV.distanceTo(b) * 0.38);
    const curve = new THREE.QuadraticBezierCurve3(homeV, mid, b);
    return { curve, pts: curve.getPoints(50), end: b };
  }), [homeV]);
  const homeQuat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), homeV.clone().normalize()), [homeV]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.on) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      d.x = e.clientX; d.y = e.clientY;
      spin.current.rotation.y += dx * 0.008;
      spin.current.rotation.x = THREE.MathUtils.clamp(spin.current.rotation.x + dy * 0.005, -0.8, 0.8);
      d.v = dx * 0.0015;
    };
    const up = () => { drag.current.on = false; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, []);

  useFrame((st, dt) => {
    const s = live.s;
    root.current.visible = s > 3.3 && s < 4.95;
    if (!root.current.visible) return;
    const t = st.clock.elapsedTime;
    const fade = 1 - range(s, 4.55, 4.9);
    const enter = range(s, 3.45, 4);
    root.current.scale.setScalar((wide ? 1 : 0.68) * Math.max(0.001, (0.6 + enter * 0.4) * fade));

    const d = drag.current;
    if (!d.on) { spin.current.rotation.y += dt * 0.12 + d.v; d.v *= 0.95; }
    orbit.current.rotation.z += dt * 0.3;

    arcs.forEach((a, i) => {
      const m = pulses.current[i];
      if (m) m.position.copy(a.curve.getPoint((t * 0.32 + i * 0.137) % 1));
    });
    const k = (t * 0.8) % 1;
    homeRing.current.scale.setScalar(1 + k * 2.5);
    (homeRing.current.material as THREE.MeshBasicMaterial).opacity = 1 - k;
  });

  return (
    <group ref={root} position={wide ? [3.4, 0, -165] : [0, 1.3, -165]}>
      <group ref={spin} rotation={[0.3, Math.PI + 0.3, 0]}>
        <mesh
          onPointerOver={() => { if (canInteract()) setUI({ cursor: 'Drag' }); }}
          onPointerOut={() => setUI({ cursor: null })}
          onPointerDown={e => {
            if (!canInteract()) return;
            e.stopPropagation();
            drag.current = { on: true, x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, v: 0 };
          }}
        >
          <sphereGeometry args={[RG * 0.985, 48, 48]} />
          <meshStandardMaterial color="#040b1c" metalness={0.4} roughness={0.7} />
        </mesh>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dots, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.035} color={CYAN} toneMapped={false} sizeAttenuation />
        </points>
        {arcs.map((a, i) => (
          <group key={i}>
            <Line points={a.pts} color={i % 2 ? '#ff5cc8' : '#5ef2ff'} lineWidth={1.4} transparent opacity={0.75} />
            <mesh ref={el => { pulses.current[i] = el; }}>
              <sphereGeometry args={[0.045, 10, 10]} />
              <meshBasicMaterial color={i % 2 ? PINK : CYAN} toneMapped={false} />
            </mesh>
            <mesh position={a.end}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshBasicMaterial color={PINK} toneMapped={false} />
            </mesh>
          </group>
        ))}
        <mesh position={homeV}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color={GOLD} toneMapped={false} />
        </mesh>
        <mesh ref={homeRing} position={homeV.clone().multiplyScalar(1.005)} quaternion={homeQuat}>
          <ringGeometry args={[0.1, 0.14, 32]} />
          <meshBasicMaterial color={GOLD} toneMapped={false} transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
      {/* atmosphere */}
      <mesh>
        <sphereGeometry args={[RG * 1.12, 48, 48]} />
        <meshBasicMaterial color="#5ef2ff" transparent opacity={0.06} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={orbit} rotation={[1.2, 0.2, 0]}>
        <torusGeometry args={[RG * 1.35, 0.012, 6, 160]} />
        <meshBasicMaterial color={glow('#8b6cff', 2)} toneMapped={false} />
      </mesh>
      <pointLight position={[-4, 3, 5]} color="#5ef2ff" intensity={40} distance={20} />
    </group>
  );
}
