import { useSyncExternalStore } from 'react';
import * as THREE from 'three';

/** Values read every frame by the 3D scene (mutated directly, no re-render). */
export const live = {
  s: 0,      // station float: integer part = station index, fraction = progress inside it
  mx: 0,     // mouse x in [-1, 1]
  my: 0,     // mouse y in [-1, 1]
};

export type UIState = {
  ready: boolean;
  section: number;
  active: number;            // segment currently facing the camera (scroll driven)
  selected: number | null;   // segment picked by click
  cursor: string | null;     // label shown on the cursor ring
  attack: number;            // increments to trigger a robot attack
  pulse: number;             // increments to trigger a core pulse
};

let ui: UIState = { ready: false, section: 0, active: 0, selected: null, cursor: null, attack: 0, pulse: 0 };
const listeners = new Set<() => void>();

export const getUI = () => ui;

export function setUI(patch: Partial<UIState>) {
  const keys = Object.keys(patch) as (keyof UIState)[];
  if (keys.every(k => ui[k] === patch[k])) return;
  ui = { ...ui, ...patch };
  listeners.forEach(l => l());
}

export function useUI<T>(selector: (u: UIState) => T): T {
  return useSyncExternalStore(
    cb => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => selector(ui),
  );
}

type Scroller = { scrollTo: (target: number | string | HTMLElement, opts?: { offset?: number; duration?: number }) => void };
export const refs: { lenis: Scroller | null } = { lenis: null };

export function goToStation(i: number) {
  const el = document.querySelector<HTMLElement>(`[data-station="${i}"]`);
  if (!el) return;
  if (refs.lenis) refs.lenis.scrollTo(el, { duration: 2 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const glow = (hex: string, k = 2) => new THREE.Color(hex).multiplyScalar(k);

/** progress (0..1) of the "hold" part of a station, where the camera stays at that station */
export const holdOf = (s: number, i: number) => (s < i ? 0 : s >= i + 0.5 ? 1 : (s - i) / 0.5);
