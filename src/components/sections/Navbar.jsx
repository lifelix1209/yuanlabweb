import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { useLang } from '../../i18n/LanguageContext';
import { gsap, ScrollTrigger, MEDIA, EASE, scrollToTarget } from '../../lib/motion';

const NAV_OFFSET = -72;
// 与页面板块顺序一致；首页编号为 00
const SECTIONS = ['home', 'research', 'members', 'publications', 'alumni', 'retreat', 'contact'];

const pad = (n) => String(n).padStart(2, '0');

// 当前所在板块：用 ScrollTrigger 跟踪每个 section 是否越过视口中线
function useActiveSection() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const triggers = SECTIONS.map((id, i) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => self.isActive && setActive(i),
      })
    );
    return () => triggers.forEach((tr) => tr.kill());
  }, []);
  return active;
}

function LangToggle({ className = '' }) {
  const { lang, toggle, t } = useLang();
  return (
    <button type="button" onClick={toggle} aria-label={t.nav.switchLang} className={`font-mono text-xs tracking-wider ${className}`}>
      <span className={lang === 'zh' ? 'text-ink' : 'text-muted'}>中</span>
      <span className="mx-1.5 text-rule">/</span>
      <span className={lang === 'en' ? 'text-ink' : 'text-muted'}>EN</span>
    </button>
  );
}

function MobileMenu({ open, onNavigate, t }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (!open) return;
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        gsap.from('[data-menu-item]', { yPercent: 100, autoAlpha: 0, duration: 0.8, ease: EASE, stagger: 0.05 });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [open] }
  );
  if (!open) return null;
  return (
    <div ref={ref} className="fixed inset-0 top-16 z-40 overflow-y-auto bg-paper px-4 pb-10 pt-8 sm:px-6 md:hidden">
      <ol className="space-y-1">
        {SECTIONS.map((id, i) => (
          <li key={id} className="overflow-hidden border-b border-rule">
            <a data-menu-item href={`#${id}`} onClick={(e) => onNavigate(e, id)} className="flex items-baseline gap-4 py-4">
              <span className="font-mono text-xs text-accent">{pad(i)}</span>
              <span className="font-serif text-3xl text-ink">{t.nav[id]}</span>
            </a>
          </li>
        ))}
      </ol>
      <LangToggle className="mt-8 text-sm" />
    </div>
  );
}

export function Navbar() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef(null);
  const active = useActiveSection();

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        setScrolled(self.scroll() > 24);
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
      },
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const navigate = (e, id) => {
    e.preventDefault();
    setOpen(false);
    scrollToTarget(`#${id}`, { offset: id === 'home' ? 0 : NAV_OFFSET });
  };

  return (
    <>
      <nav className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${scrolled || open ? 'bg-paper/90 backdrop-blur-sm' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <a href="#home" onClick={(e) => navigate(e, 'home')} className="flex items-baseline gap-3" aria-label="Yuan Lab">
            <span data-brand-mark className="font-serif text-2xl font-medium tracking-tight text-ink">Yuan Lab</span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted sm:inline">ZJU · UoE</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <ol className="flex items-center gap-5 lg:gap-7">
              {SECTIONS.slice(1).map((id, i) => {
                const isActive = active === i + 1;
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => navigate(e, id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`relative text-sm transition-colors duration-300 hover:text-ink ${isActive ? 'text-ink' : 'text-muted'}`}
                    >
                      {t.nav[id]}
                      <span className={`absolute -bottom-1 left-0 h-px bg-accent transition-all duration-500 ease-out-expo ${isActive ? 'w-full' : 'w-0'}`} />
                    </a>
                  </li>
                );
              })}
            </ol>
            <span className="hidden font-mono text-xs tabular-nums text-muted lg:inline" aria-hidden="true">
              {pad(active)} / {pad(SECTIONS.length - 1)}
            </span>
            <LangToggle />
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="font-mono text-xs uppercase tracking-[0.18em] text-ink md:hidden"
            aria-expanded={open}
          >
            {open ? t.nav.close : t.nav.menu}
          </button>
        </div>
        <div className={`h-px transition-colors duration-500 ${scrolled ? 'bg-rule' : 'bg-transparent'}`}>
          <div ref={progressRef} className="h-px origin-left scale-x-0 bg-accent" />
        </div>
      </nav>
      <MobileMenu open={open} onNavigate={navigate} t={t} />
    </>
  );
}
