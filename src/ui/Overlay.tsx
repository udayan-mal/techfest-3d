import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { useUI, setUI, getUI, goToStation } from '../store';
import { segments, stats, cities } from '../data';

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const ready = useUI(u => u.ready);
  useEffect(() => {
    if (!ready || !ref.current) return;
    const root = ref.current;
    const items = root.querySelectorAll<HTMLElement>('[data-r]');
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      animate(items, {
        opacity: [0, 1], translateY: [50, 0], filter: ['blur(10px)', 'blur(0px)'],
        duration: 1200, delay: stagger(90), ease: 'outExpo',
      });
      io.disconnect();
    }, { threshold: 0.12 });
    io.observe(root);
    return () => io.disconnect();
  }, [ready]);
  return ref;
}

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
);

/* ---------------- 00 HERO ---------------- */
function Hero() {
  const ref = useReveal<HTMLElement>();
  const ready = useUI(u => u.ready);
  useEffect(() => {
    if (!ready) return;
    animate('.hero-char', { translateY: ['110%', '0%'], rotateZ: [8, 0], opacity: [0, 1], duration: 1400, delay: stagger(55, { start: 150 }), ease: 'outExpo' });
  }, [ready]);
  const chars = (w: string, cls = '') => w.split('').map((c, i) => (
    <span key={i} className={`hero-char char ${cls}`} style={{ opacity: 0, animationDelay: `${i * -0.8}s` }}>{c}</span>
  ));
  return (
    <section ref={ref} data-station="0" className="station">
      <div className="station-inner">
        <div className="mx-auto max-w-7xl w-full px-6 pt-20">
          <div className="max-w-2xl">
            <div data-r className="inline-flex items-center gap-3 glass rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan pulse-dot" />
              <span className="tag text-cyan">IIT Bombay presents</span>
            </div>
            <h1 className="font-display font-black leading-[0.82] tracking-tight text-[22vw] sm:text-[17vw] lg:text-[11rem]">
              <span className="mask block">{chars('TECH', 'text-holo')}</span>
              <span className="mask block"><span className="text-stroke">{chars('FEST')}</span><span className="hero-char char font-mono font-medium text-[0.16em] tracking-[0.2em] text-pink align-top ml-3" style={{ opacity: 0 }}>2026</span></span>
            </h1>
            <p data-r className="mt-8 max-w-lg text-base sm:text-lg text-white/70 leading-relaxed">
              Asia's largest science and technology festival. Scroll to fly through the core and explore three days of pure innovation at IIT Bombay.
            </p>
            <div data-r className="mt-9 flex flex-wrap gap-3 pointer-events-auto">
              <button onClick={() => goToStation(1)} className="btn btn-main">Start the journey <Arrow /></button>
              <a href="https://techfest.org" target="_blank" rel="noopener" className="btn btn-line">techfest.org</a>
            </div>
            <div data-r className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-dim font-mono">
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet" />Move your cursor to tilt the core</span>
              <button onClick={() => setUI({ pulse: getUI().pulse + 1 })} className="pointer-events-auto flex items-center gap-2 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-pink" />Click the core to send a pulse
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="tag !text-[10px] text-dim">Scroll</span>
          <span className="w-5 h-8 rounded-full border border-white/30 flex justify-center pt-1.5"><span className="w-1 h-2 rounded-full bg-cyan bob" /></span>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 01 LEGACY ---------------- */
function Legacy() {
  const ref = useReveal<HTMLElement>();
  const nums = useRef<(HTMLSpanElement | null)[]>([]);
  const ready = useUI(u => u.ready);
  useEffect(() => {
    if (!ready || !ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      stats.forEach((s, i) => {
        const o = { v: s.n === 1998 ? 1950 : 0 };
        animate(o, {
          v: s.n, duration: 2200, delay: 300 + i * 120, ease: 'outExpo',
          onUpdate: () => { const el = nums.current[i]; if (el) el.textContent = s.n === 1998 ? String(Math.round(o.v)) : Math.round(o.v).toLocaleString('en-IN'); },
        });
      });
      io.disconnect();
    }, { threshold: 0.12 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ready]);
  return (
    <section ref={ref} data-station="1" className="station">
      <div className="station-inner">
        <div className="mx-auto max-w-7xl w-full px-6">
          <div className="max-w-xl">
            <div data-r className="tag text-cyan mb-5">01 / The legacy</div>
            <h2 data-r className="font-display font-bold text-4xl sm:text-6xl leading-[1.02] tracking-tight">
              Built by students.<br /><span className="text-holo">Loved by the world.</span>
            </h2>
            <p data-r className="mt-6 text-white/70 leading-relaxed">
              Techfest is the annual science and technology festival of IIT Bombay. Every December the Powai campus turns into a playground for builders, researchers, artists and dreamers from every corner of the planet.
            </p>
            <div className="mt-9 grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <div data-r key={s.label} className="glass rounded-2xl p-5">
                  <div className="font-display font-bold text-3xl sm:text-4xl tabular-nums">
                    <span ref={el => { nums.current[i] = el; }}>0</span><span className="text-cyan">{s.suffix}</span>
                  </div>
                  <div className="mt-1 text-xs text-dim">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 02 SEGMENTS ---------------- */
function Segments() {
  const ref = useReveal<HTMLElement>();
  const selected = useUI(u => u.selected);
  const active = useUI(u => u.active);
  const shown = selected ?? active;
  const d = segments[shown];
  const go = (dir: number) => setUI({ selected: (shown + dir + segments.length) % segments.length });
  return (
    <section ref={ref} data-station="2" className="station station-tall">
      <div className="station-inner">
        <div className="mx-auto max-w-7xl w-full px-6 flex flex-col justify-end lg:justify-center h-full pb-24 lg:pb-0">
          <div className="max-w-md">
            <div data-r className="tag text-violet mb-4">02 / Segments</div>
            <h2 data-r className="font-display font-bold text-4xl sm:text-5xl leading-[1.02] tracking-tight">
              Six worlds.<br />One festival.
            </h2>
            <p data-r className="mt-3 text-sm text-dim">Keep scrolling to orbit, or click any world to bring it forward.</p>

            <div data-r className="mt-7 glass rounded-3xl p-6 pointer-events-auto relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-30 transition-colors duration-700" style={{ background: d.color }} />
              <div key={shown} className="relative swap-in">
                <div className="flex items-center justify-between">
                  <span className="tag" style={{ color: d.color }}>0{shown + 1} / 0{segments.length}</span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color, boxShadow: `0 0 14px ${d.color}` }} />
                </div>
                <h3 className="mt-3 font-display font-bold text-3xl" style={{ color: d.color }}>{d.name}</h3>
                <div className="mt-1 text-white/90 font-medium">{d.tagline}</div>
                <p className="mt-3 text-sm text-white/65 leading-relaxed">{d.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {d.chips.map(c => <span key={c} className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-white/15 text-white/80">{c}</span>)}
                </div>
              </div>
              <div className="relative mt-6 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {segments.map((s, i) => (
                    <button key={s.name} aria-label={s.name} onClick={() => setUI({ selected: i })}
                      className="h-1.5 rounded-full transition-all duration-500" style={{ width: i === shown ? 28 : 10, background: i === shown ? s.color : 'rgba(255,255,255,0.2)' }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => go(-1)} className="w-9 h-9 rounded-full border border-white/15 hover:bg-white/10 flex items-center justify-center rotate-180"><Arrow /></button>
                  <button onClick={() => go(1)} className="w-9 h-9 rounded-full border border-white/15 hover:bg-white/10 flex items-center justify-center"><Arrow /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 03 ROBOWARS ---------------- */
function Robowars() {
  const ref = useReveal<HTMLElement>();
  const hits = useUI(u => u.attack);
  return (
    <section ref={ref} data-station="3" className="station">
      <div className="station-inner">
        <div className="mx-auto max-w-7xl w-full px-6 flex flex-col justify-end lg:justify-center h-full pb-24 lg:pb-0">
          <div className="max-w-md">
            <div data-r className="tag text-red mb-4">03 / Robowars</div>
            <h2 data-r className="font-display font-bold text-4xl sm:text-6xl leading-[1.02] tracking-tight">
              Steel. Sparks.<br /><span className="text-red">Strategy.</span>
            </h2>
            <p data-r className="mt-6 text-white/70 leading-relaxed">
              The international robot combat championship. Engineers bring machines built for one purpose: be the last bot standing when the dust settles.
            </p>
            <div data-r className="mt-8 flex items-center gap-4 pointer-events-auto">
              <button onClick={() => setUI({ attack: getUI().attack + 1 })}
                className="btn text-white bg-gradient-to-r from-red to-[#ff9248] shadow-[0_10px_40px_-10px_rgba(255,77,109,0.9)] hover:-translate-y-0.5">
                Trigger attack
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>
              </button>
              <div className="glass rounded-2xl px-4 py-2.5">
                <div className="tag !text-[9px] text-dim">Hits landed</div>
                <div className="font-display font-bold text-xl tabular-nums">{String(hits).padStart(2, '0')}</div>
              </div>
            </div>
            <div data-r className="mt-6 flex flex-wrap gap-2">
              {['Live arena', 'Spinner weapons', 'International teams'].map(c => (
                <span key={c} className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-red/40 text-red/90">{c}</span>
              ))}
            </div>
            <p data-r className="mt-5 text-xs font-mono text-dim">Tip: click the bot directly to unleash the spinner.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 04 GLOBAL ---------------- */
function Global() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-station="4" className="station">
      <div className="station-inner">
        <div className="mx-auto max-w-7xl w-full px-6 flex flex-col justify-end lg:justify-center h-full pb-24 lg:pb-0">
          <div className="max-w-md">
            <div data-r className="tag text-cyan mb-4">04 / Global reach</div>
            <h2 data-r className="font-display font-bold text-4xl sm:text-6xl leading-[1.02] tracking-tight">
              One campus.<br /><span className="text-holo">Every continent.</span>
            </h2>
            <p data-r className="mt-6 text-white/70 leading-relaxed">
              Participants, speakers and partners fly in from around the world. Every arc on this globe is a connection that leads back to Mumbai.
            </p>
            <div data-r className="mt-7 grid grid-cols-3 gap-x-4 gap-y-2 text-xs font-mono text-white/70">
              {cities.slice(0, 9).map(c => (
                <span key={c.name} className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-pink" />{c.name}</span>
              ))}
            </div>
            <p data-r className="mt-6 text-xs font-mono text-dim">Drag the globe to spin it.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 05 PORTAL ---------------- */
function Enter() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-station="5" id="register" className="station">
      <div className="station-inner">
        <div className="mx-auto max-w-3xl w-full px-6 text-center flex flex-col justify-end h-full pb-20">
          <div data-r className="tag text-pink mb-4">05 / Enter</div>
          <h2 data-r className="font-display font-black text-5xl sm:text-7xl leading-[0.95] tracking-tight">
            The portal<br /><span className="text-holo">is open.</span>
          </h2>
          <p data-r className="mt-5 text-white/70 max-w-xl mx-auto">
            Compete, learn, build and celebrate at Asia's largest science and technology festival. Your seat at Techfest 2026 is waiting.
          </p>
          <div data-r className="mt-8 flex flex-wrap justify-center gap-3 pointer-events-auto">
            <a href="https://techfest.org" target="_blank" rel="noopener" className="btn btn-main">Register now <Arrow /></a>
            <a href="https://ca.techfest.org" target="_blank" rel="noopener" className="btn btn-line">Become a College Ambassador</a>
          </div>
          <p data-r className="mt-5 text-xs font-mono text-dim">Hover the portal to charge it. Click to step through.</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const socials: [string, string][] = [
    ['Instagram', 'https://www.instagram.com/techfest_iitbombay/'],
    ['X', 'https://x.com/Techfest_IITB'],
    ['LinkedIn', 'https://www.linkedin.com/company/techfest-iit-bombay/'],
    ['YouTube', 'https://www.youtube.com/@TechfestIITBombay'],
  ];
  return (
    <footer className="relative z-10 pointer-events-auto bg-gradient-to-b from-transparent via-[#04030c]/90 to-[#04030c] pt-24">
      <div className="mx-auto max-w-7xl px-6 pb-10">
        <div className="font-display font-black text-[16vw] lg:text-[12rem] leading-none tracking-tight text-stroke opacity-40 select-none">TECHFEST</div>
        <div className="mt-8 grid md:grid-cols-3 gap-8 border-t border-white/10 pt-8">
          <div>
            <div className="font-display font-bold tracking-[0.14em]">TECHFEST, IIT BOMBAY</div>
            <p className="mt-2 text-sm text-dim max-w-xs">Asia's largest science and technology festival. IIT Bombay, Powai, Mumbai 400076.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {socials.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener" className="text-white/70 hover:text-cyan transition-colors">{n}</a>)}
          </div>
          <div className="md:text-right text-sm text-dim">
            <a href="https://techfest.org" target="_blank" rel="noopener" className="hover:text-white">techfest.org</a>
            <div className="mt-2">© 2026 Techfest, IIT Bombay</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Overlay() {
  const section = useUI(u => u.section);
  return (
    <>
      {/* soft shade behind the text column for legibility */}
      <div className="fixed inset-y-0 left-0 w-full lg:w-[55%] z-[1] pointer-events-none bg-gradient-to-r from-[#04030c]/75 via-[#04030c]/30 to-transparent transition-opacity duration-700"
        style={{ opacity: section === 0 || section === 5 ? 0.5 : 1 }} />
      <main className="relative z-10 pointer-events-none">
        <Hero />
        <Legacy />
        <Segments />
        <Robowars />
        <Global />
        <Enter />
      </main>
      <Footer />
    </>
  );
}
