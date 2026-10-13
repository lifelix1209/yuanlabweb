import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

export const EASE = 'expo.out';

export const MEDIA = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
};

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(MEDIA.reduced).matches
    : false;
}

// Lenis 实例由 SmoothScroll 注册；未启用（如 reduced-motion）时回退到原生滚动
let lenisInstance = null;
let detachLenis = null;

// 滚动订阅：组件 effect 先于 SmoothScroll 执行，因此监听者集中登记，Lenis 就绪后再统一转发
const scrollListeners = new Set();
const notifyScroll = (scroll, velocity) => scrollListeners.forEach((cb) => cb({ scroll, velocity }));
const onNativeScroll = () => {
  if (!lenisInstance) notifyScroll(window.scrollY, 0);
};

export function setLenis(instance) {
  detachLenis?.();
  detachLenis = null;
  lenisInstance = instance;
  if (instance) detachLenis = instance.on('scroll', (lenis) => notifyScroll(lenis.scroll, lenis.velocity));
}

// 订阅滚动位置与速度（Lenis 优先，回退原生滚动），返回取消订阅函数
export function onScroll(callback) {
  if (scrollListeners.size === 0) window.addEventListener('scroll', onNativeScroll, { passive: true });
  scrollListeners.add(callback);
  return () => {
    scrollListeners.delete(callback);
    if (scrollListeners.size === 0) window.removeEventListener('scroll', onNativeScroll);
  };
}

export function scrollToTarget(target, { offset = 0 } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset, duration: 1.4 });
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}
