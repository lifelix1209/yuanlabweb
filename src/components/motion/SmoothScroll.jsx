import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, setLenis, prefersReducedMotion } from '../../lib/motion';

// 惯性平滑滚动：Lenis 与 ScrollTrigger 共用 GSAP ticker，保证滚动动画逐帧同步
export function SmoothScroll({ children }) {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    const raf = (time) => lenis.raf(time * 1000);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);

    return () => {
      setLenis(null);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return children;
}
