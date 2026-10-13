import { useLayoutEffect, useState } from 'react';
import { gsap, ScrollTrigger, onScroll } from '../../lib/motion';
import { heroRegistry } from '../hero/heroRegistry';
import { createRenderer } from './neurulationRenderer';
import { stageAt } from './neurulationGeometry';
import { advance, shouldReset } from './irreversibleProgress';

// 滚动驱动神经嵴形成序列：固定 pinRef 元素，进度只增不减（往回滚不倒放），回到页面顶部时重置为 B。
// layout effect：需先于 Research 的 pinned 触发器创建，保证 pin 间距按文档顺序计算。
export function useNeurulationScroll({ enabled, canvasRef, pinRef, start = 'top top', end = '+=300%' }) {
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    if (!enabled) return undefined;
    const canvas = canvasRef.current;
    const renderer = createRenderer(canvas);
    heroRegistry.set(renderer);
    const display = { value: 0 };
    let reached = 0;

    const render = () => {
      const s = stageAt(display.value);
      renderer.setStage(s);
      setActive(Math.round(s));
    };

    const trigger = ScrollTrigger.create({
      trigger: pinRef.current,
      start,
      end,
      pin: true,
      onUpdate: (self) => {
        const next = advance(reached, self.progress);
        if (next === reached) return;
        reached = next;
        gsap.to(display, { value: reached, duration: 0.9, ease: 'power2.out', overwrite: true, onUpdate: render });
      },
    });

    const unsubscribe = onScroll(({ scroll, velocity }) => {
      renderer.setVelocity(velocity);
      if (!shouldReset(scroll) || reached === 0) return;
      reached = 0;
      gsap.killTweensOf(display);
      display.value = 0;
      render();
    });

    // 视口外或标签页隐藏时暂停逐帧绘制
    let inView = true;
    const sync = () => (inView && !document.hidden ? renderer.start() : renderer.stop());
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => renderer.resize());
    ro.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    sync();

    return () => {
      trigger.kill();
      unsubscribe();
      gsap.killTweensOf(display);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', sync);
      heroRegistry.clear(renderer);
      renderer.destroy();
      setActive(0);
    };
  }, [enabled, canvasRef, pinRef, start, end]);

  return active;
}
