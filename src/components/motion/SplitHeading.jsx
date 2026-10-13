import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText, MEDIA, EASE } from '../../lib/motion';

// 标题按行遮罩上移揭示。immediate=true 时不等待滚动（用于首屏）
export function SplitHeading({ as = 'h2', immediate = false, delay = 0, className = '', children, ...props }) {
  const Tag = as;
  const ref = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        const split = SplitText.create(ref.current, { type: 'lines', mask: 'lines', linesClass: 'line' });
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: EASE,
          stagger: 0.08,
          delay,
          scrollTrigger: immediate ? undefined : { trigger: ref.current, start: 'top 88%', once: true },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [children], revertOnUpdate: true }
  );

  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}
