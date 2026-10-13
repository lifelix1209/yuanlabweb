import { useEffect, useRef } from 'react';
import { createField } from './neuralCrestField';
import { heroRegistry } from './heroRegistry';
import { ScrollTrigger, prefersReducedMotion } from '../../lib/motion';

const particleCount = () => (window.matchMedia('(max-width: 767px)').matches ? 300 : 700);

// 在 React 中挂载粒子引擎：视口外或标签页隐藏时暂停，滚出 Hero 时粒子沉降淡出
export function HeroCanvas({ play, className = '' }) {
  const canvasRef = useRef(null);
  const fieldRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const field = createField(canvas, { count: particleCount(), reducedMotion: prefersReducedMotion() });
    fieldRef.current = field;
    heroRegistry.set(field);

    let inView = true;
    const sync = () => (inView && !document.hidden ? field.start() : field.stop());

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);

    const ro = new ResizeObserver(() => field.resize());
    ro.observe(canvas);

    document.addEventListener('visibilitychange', sync);

    const trigger = ScrollTrigger.create({
      trigger: canvas.closest('section') ?? canvas,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => field.setProgress(self.progress),
    });

    sync();

    return () => {
      trigger.kill();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', sync);
      heroRegistry.clear(field);
      field.destroy();
      fieldRef.current = null;
    };
  }, []);

  useEffect(() => {
    fieldRef.current?.setEmitting(Boolean(play));
  }, [play]);

  return <canvas ref={canvasRef} className={`pointer-events-none block h-full w-full ${className}`} aria-hidden="true" />;
}
