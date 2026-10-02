import { useEffect, useRef, useState } from 'react';
import { createTimeline } from 'animejs';
import { useUI, setUI, goToStation } from '../store';
import { sectionNames } from '../data';

export function Preloader() {
  const ready = useUI(u => u.ready);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const o = { v: 0 };
    const num = document.getElementById('pl-num')!;
    const tl = createTimeline({ defaults: { ease: 'outExpo' } });
    tl.add(o, { v: 100, duration: 1900, ease: 'inOutQuart', onUpdate: () => { num.textContent = String(Math.round(o.v)).padStart(3, '0'); } })
      .add('#pl-bar', { scaleX: [0, 1], duration: 1900, ease: 'inOutQuart' }, 0)
      .add('#pl-ring', { rotate: [0, 360], duration: 1900, ease: 'inOutQuart' }, 0)
      .add('#pl-inner', { opacity: [1, 0], scale: [1, 1.15], duration: 500, onComplete: () => setUI({ ready: true }) })
      .add('#preloader', { opacity: [1, 0], duration: 700, ease: 'outQuad', onComplete: () => setGone(true) }, '-=150');
  }, []);
  if (gone) return null;
  return (
    <div id="preloader" className="fixed inset-0 z-[100] bg-[#04030c] flex items-center justify-center" style={{ pointerEvents: ready ? 'none' : 'auto' }}>
      <div id="pl-inner" className="flex flex-col items-center">
        <div className="relative w-28 h-28 mb-8">
          <svg id="pl-ring" viewBox="0 0 100 100" className="absolute inset-0">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#5ef2ff" strokeWidth="1" strokeDasharray="6 10" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="#8b6cff" strokeWidth="1.5" strokeDasharray="40 30" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-cyan shadow-[0_0_30px_8px_rgba(94,242,255,0.7)]" />
          </div>
        </div>
        <div className="font-display font-black text-3xl tracking-[0.2em]">TECHFEST</div>
        <div className="tag text-dim mt-2">Charging the core</div>
        <div className="mt-6 w-56 h-px bg-white/10 overflow-hidden">
          <div id="pl-bar" className="h-full origin-left bg-gradient-to-r from-cyan via-violet to-pink" />
        </div>
        <div id="pl-num" className="mt-3 font-mono text-xs text-dim">000</div>
      </div>
    </div>
  );
}

export function Nav() {
  const section = useUI(u => u.section);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const links: [string, number][] = [['Legacy', 1], ['Segments', 2], ['Robowars', 3], ['Global', 4]];
  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
      <div className={`mx-auto flex items-center justify-between transition-all duration-500 pointer-events-auto ${scrolled ? 'max-w-4xl mt-3 glass rounded-full px-4 py-2' : 'max-w-7xl px-6 py-5'}`}>
        <button onClick={() => goToStation(0)} className="flex items-center gap-3">
          <span className="relative w-8 h-8 rounded-full border border-cyan/50 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan shadow-[0_0_12px_3px_rgba(94,242,255,0.8)]" />
          </span>
          <span className="text-left leading-none">
            <span className="block font-display font-bold tracking-[0.14em] text-sm">TECHFEST</span>
            <span className="block font-mono text-[9px] tracking-[0.25em] text-dim mt-1">IIT BOMBAY</span>
          </span>
        </button>
        <nav className="hidden md:flex items-center gap-1">
          {links.map(([l, i]) => (
            <button key={l} onClick={() => goToStation(i)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${section === i ? 'text-white bg-white/10' : 'text-dim hover:text-white'}`}>
              {l}
            </button>
          ))}
        </nav>
        <button onClick={() => goToStation(5)} className="btn btn-main !py-2.5 !px-5 !text-xs uppercase tracking-widest">Register</button>
      </div>
    </header>
  );
}

export function Rail() {
  const section = useUI(u => u.section);
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4">
      {sectionNames.map((n, i) => (
        <button key={n} onClick={() => goToStation(i)} className="group flex items-center justify-end gap-3">
          <span className={`tag !text-[10px] transition-all duration-300 ${section === i ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-70 text-dim'}`}>{n}</span>
          <span className={`block rounded-full transition-all duration-500 ${section === i ? 'w-3 h-3 bg-cyan shadow-[0_0_14px_rgba(94,242,255,0.9)]' : 'w-1.5 h-1.5 bg-white/40 group-hover:bg-white'}`} />
        </button>
      ))}
    </div>
  );
}

export function StationHud() {
  const section = useUI(u => u.section);
  return (
    <div className="fixed left-6 bottom-6 z-40 hidden md:flex items-center gap-4 pointer-events-none">
      <div className="font-display text-3xl font-bold text-white/90 tabular-nums">0{section + 1}</div>
      <div className="h-8 w-px bg-white/20" />
      <div>
        <div className="tag !text-[10px] text-dim">Station</div>
        <div className="tag !text-[11px] text-cyan mt-1">{sectionNames[section]}</div>
      </div>
      <div className="ml-4 flex gap-1">
        {sectionNames.map((_, i) => (
          <span key={i} className={`h-0.5 rounded-full transition-all duration-500 ${i <= section ? 'w-6 bg-cyan' : 'w-3 bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
}

export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useUI(u => u.cursor);
  useEffect(() => {
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0;
    const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; };
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);
  useEffect(() => { document.body.style.cursor = label ? 'pointer' : ''; }, [label]);
  return (
    <>
      <div ref={ring} className="cursor-ring fixed top-0 left-0 z-[90] pointer-events-none">
        <div className={`rounded-full border flex items-center justify-center transition-all duration-300 ${label ? 'w-20 h-20 border-cyan bg-cyan/10 backdrop-blur-sm' : 'w-9 h-9 border-white/40'}`}>
          <span className={`tag !text-[9px] !tracking-[0.2em] text-cyan transition-opacity ${label ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
        </div>
      </div>
      <div ref={dot} className="cursor-ring fixed top-0 left-0 z-[90] w-1.5 h-1.5 rounded-full bg-white pointer-events-none" />
    </>
  );
}
