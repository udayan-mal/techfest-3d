import { useEffect } from 'react';
import Lenis from 'lenis';
import Experience from './three/Experience';
import Overlay from './ui/Overlay';
import { Preloader, Nav, Rail, StationHud, Cursor } from './ui/Chrome';
import { live, setUI, refs } from './store';

/** Converts page scroll into a station float that drives the 3D camera. */
function computeStation() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-station]'));
  const y = window.scrollY;
  const vh = window.innerHeight;
  let s = 0;
  els.forEach((el, i) => {
    const top = el.getBoundingClientRect().top + y;
    const hold = Math.max(1, el.offsetHeight - vh);
    if (y >= top) {
      s = y <= top + hold
        ? i + 0.5 * ((y - top) / hold)
        : i + 0.5 + 0.5 * Math.min(1, (y - top - hold) / vh);
    }
  });
  live.s = s;
  setUI({ section: Math.min(els.length - 1, Math.floor(s + 0.25)) });
}

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    refs.lenis = lenis;
    lenis.on('scroll', computeStation);
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      live.mx = (e.clientX / window.innerWidth) * 2 - 1;
      live.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', computeStation);
    window.addEventListener('scroll', computeStation, { passive: true });
    computeStation();

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      refs.lenis = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', computeStation);
      window.removeEventListener('scroll', computeStation);
    };
  }, []);

  return (
    <>
      <Experience />
      <Overlay />
      <Nav />
      <Rail />
      <StationHud />
      <Cursor />
      <div className="grain" />
      <Preloader />
    </>
  );
}
