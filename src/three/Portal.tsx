import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { live, setUI, glow } from '../store';

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const frag = /* glsl */ `
uniform float uTime;
uniform float uBoost;
varying vec2 vUv;
void main() {
  vec2 p = vUv - 0.5;
  float r = length(p) * 2.0;
  float a = atan(p.y, p.x);
  float sw = sin(a * 5.0 + r * 14.0 - uTime * (2.4 + uBoost * 5.0)) * 0.5 + 0.5;
  float sw2 = sin(a * 3.0 - r * 24.0 + uTime * 1.6) * 0.5 + 0.5;
  vec3 c1 = vec3(0.37, 0.95, 1.0);
  vec3 c2 = vec3(0.55, 0.42, 1.0);
  vec3 c3 = vec3(1.0, 0.36, 0.78);
  vec3 col = mix(mix(c2, c1, sw), c3, sw2 * 0.55);
  col += smoothstep(0.4, 0.0, r) * 1.6;
  float alpha = smoothstep(1.0, 0.55, r) * (0.5 + 0.5 * sw);
  gl_FragColor = vec4(col * (1.15 + uBoost * 0.8), alpha);
}
`;

const N = 800;

export default function Portal() {
  const { size } = useThree();
  const wide = size.width >= 900;
  const root = useRef<THREE.Group>(null!);
  const hexA = useRef<THREE.Mesh>(null!);
  const hexB = useRef<THREE.Mesh>(null!);
  const pts = useRef<THREE.Points>(null!);
  const boost = useRef(0);
  const hover = useRef(false);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uBoost: { value: 0 } },
    vertexShader: vert, fragmentShader: frag,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
  }), []);

  const pData = useMemo(() => Array.from({ length: N }, () => ({
    a: Math.random() * Math.PI * 2, r: 3.8 + Math.random() * 4, sp: 0.08 + Math.random() * 0.15, off: Math.random(),
  })), []);
  const pos = useMemo(() => new Float32Array(N * 3), []);

  useFrame((st, dt) => {
    const s = live.s;
    root.current.visible = s > 4.4;
    if (!root.current.visible) return;
    const t = st.clock.elapsedTime;
    boost.current = THREE.MathUtils.damp(boost.current, hover.current ? 1 : 0, 4, dt);
    const b = boost.current;
    mat.uniforms.uTime.value = t;
    mat.uniforms.uBoost.value = b;
    hexA.current.rotation.z = t * 0.25;
    hexB.current.rotation.z = -t * 0.18;
    root.current.rotation.z = Math.sin(t * 0.3) * 0.05;

    for (let i = 0; i < N; i++) {
      const d = pData[i];
      const L = (t * d.sp * (1 + b * 2) + d.off) % 1;
      const r = d.r * (1 - L) + 0.15;
      const ang = d.a + L * 7;
      pos[i * 3] = Math.cos(ang) * r;
      pos[i * 3 + 1] = Math.sin(ang) * r;
      pos[i * 3 + 2] = -L * 2.5 + 0.5;
    }
    pts.current.geometry.attributes.position.needsUpdate = true;
  });

  const canInteract = () => live.s > 4.6;

  return (
    <group ref={root} position={wide ? [0, 0.9, -214] : [0, 1.2, -214]} scale={wide ? 1 : 0.62}>
      <mesh
        material={mat}
        onPointerOver={() => { if (!canInteract()) return; hover.current = true; setUI({ cursor: 'Enter' }); }}
        onPointerOut={() => { hover.current = false; setUI({ cursor: null }); }}
        onClick={() => { if (canInteract()) window.open('https://techfest.org', '_blank', 'noopener'); }}
      >
        <circleGeometry args={[3.5, 96]} />
      </mesh>
      <mesh>
        <torusGeometry args={[3.6, 0.13, 16, 160]} />
        <meshStandardMaterial color="#1b1036" emissive="#8b6cff" emissiveIntensity={2.4} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={hexA}>
        <torusGeometry args={[4.3, 0.04, 6, 6]} />
        <meshBasicMaterial color={glow('#5ef2ff', 2.4)} toneMapped={false} />
      </mesh>
      <mesh ref={hexB}>
        <torusGeometry args={[4.8, 0.02, 6, 6]} />
        <meshBasicMaterial color={glow('#ff5cc8', 2.4)} toneMapped={false} />
      </mesh>
      <points ref={pts}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color={glow('#cfe9ff', 2.5)} toneMapped={false} transparent opacity={0.9} depthWrite={false} />
      </points>
      <pointLight position={[0, 0, 3]} color="#8b6cff" intensity={60} distance={18} />
    </group>
  );
}
