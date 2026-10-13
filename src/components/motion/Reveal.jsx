import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, MEDIA, EASE } from '../../lib/motion';

// 进入视口时淡入上移；stagger 时作用于带 data-reveal 的子元素
export function Reveal({ as = 'div', stagger = 0, y = 24, className = '', children, ...props }) {
  const Tag = as;
  const ref = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        const items = stagger ? ref.current.querySelectorAll('[data-reveal]') : [ref.current];
        if (!items.length) return;
        gsap.from(items, {
          y,
          autoAlpha: 0,
          duration: 1,
          ease: EASE,
          stagger,
          scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}
