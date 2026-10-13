import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/motion';
import { heroRegistry } from '../hero/heroRegistry';
import { useLang } from '../../i18n/LanguageContext';
import { fallbackArc, toPathD } from './splashPath';

// 将字标从当前位置移动并缩放到导航栏品牌位置（FLIP）
function flipTo(el, target) {
  if (!el || !target) return { autoAlpha: 0, y: -24 };
  const from = el.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const scale = to.height / from.height;
  return {
    x: to.left + to.width / 2 - (from.left + from.width / 2),
    y: to.top + to.height / 2 - (from.top + from.height / 2),
    scale,
  };
}

// 开屏：沿 Hero 背侧神经管弧线描边 + 字标显现 → 字标飞入导航栏 → 背景淡出露出 Hero
// onRelease：Hero 可以开始播放；onDone：开屏结束、可卸载
export function Splash({ onRelease, onDone }) {
  const { t } = useLang();
  const pathRef = useRef(null);
  const markRef = useRef(null);
  const [pathD, setPathD] = useState('');

  useEffect(() => {
    if (prefersReducedMotion()) {
      onRelease();
      onDone();
      return undefined;
    }
    const raf = requestAnimationFrame(() => {
      const points = heroRegistry.get()?.getArcClientPoints() ?? fallbackArc();
      setPathD(toPathD(points));
    });
    return () => cancelAnimationFrame(raf);
  }, [onRelease, onDone]);

  useEffect(() => {
    if (!pathD) return undefined;
    const path = pathRef.current;
    const length = path.getTotalLength();
    const brand = document.querySelector('[data-brand-mark]');

    const tl = gsap.timeline({ onComplete: onDone });
    tl.set(path, { strokeDasharray: length, strokeDashoffset: length })
      .to(path, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0)
      .from('[data-splash-line]', { yPercent: 110, duration: 0.6, ease: 'expo.out', stagger: 0.06 }, 0.05)
      .to(markRef.current, { ...flipTo(markRef.current, brand), duration: 0.4, ease: 'power3.inOut' }, 0.7)
      .to('[data-splash-sub]', { autoAlpha: 0, duration: 0.2 }, 0.7)
      .call(onRelease, [], 1.0)
      .to('[data-splash-bg]', { autoAlpha: 0, duration: 0.3, ease: 'power1.out' }, 1.0)
      .to([markRef.current, path], { autoAlpha: 0, duration: 0.15 }, 1.15);

    const skip = () => tl.progress(1);
    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      tl.kill();
    };
  }, [pathD, onRelease, onDone]);

  return (
    <div className="fixed inset-0 z-[100] cursor-pointer" role="presentation" aria-hidden="true">
      <div data-splash-bg className="absolute inset-0 bg-paper" />
      <svg className="absolute inset-0 h-full w-full" fill="none">
        <path ref={pathRef} d={pathD} stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div ref={markRef} className="origin-center font-serif text-6xl font-medium tracking-tight text-ink md:text-8xl">
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-splash-line className="block">Yuan Lab</span>
          </span>
        </div>
        <div data-splash-sub className="mt-4 overflow-hidden font-mono text-xs uppercase tracking-[0.25em] text-muted">
          <span data-splash-line className="block">ZJU · UoE — {t.splash.skip}</span>
        </div>
      </div>
    </div>
  );
}
