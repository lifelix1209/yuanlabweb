import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { useLang } from '../../i18n/LanguageContext';
import { gsap, MEDIA, EASE } from '../../lib/motion';
import { HeroCanvas } from '../hero/HeroCanvas';
import { Button } from '../ui';

export function Hero({ play = true }) {
  const { t } = useLang();
  const ref = useRef(null);

  // 首屏入场：开屏结束（play）后，标题按行遮罩上移，其余元素依次淡入
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        const tl = gsap.timeline({ paused: true });
        tl.from('[data-hero-line]', { yPercent: 110, duration: 1.2, ease: EASE, stagger: 0.08 })
          .from('[data-hero-fade]', { y: 16, autoAlpha: 0, duration: 1, ease: EASE, stagger: 0.08 }, '-=0.9');
        if (play) tl.play();
        return () => tl.kill();
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [play], revertOnUpdate: true }
  );

  return (
    <section id="home" ref={ref} className="relative overflow-hidden pt-20 lg:min-h-[100svh]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-12 lg:items-center lg:px-10">
        <figure className="relative order-first aspect-[5/4] w-full lg:order-last lg:col-span-7 lg:aspect-auto lg:h-[78svh]">
          <HeroCanvas play={play} className="absolute inset-0" />
          <figcaption data-hero-fade className="absolute -bottom-12 left-0 right-0 font-mono text-[11px] leading-relaxed text-muted lg:bottom-0 lg:left-[8%]">
            {t.hero.caption}
          </figcaption>
        </figure>

        <div className="pb-16 pt-12 lg:col-span-5 lg:pb-0 lg:pt-0">
          <p data-hero-fade className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            {t.hero.eyebrow}
          </p>
          <h1 className="mt-6 font-serif text-[2.5rem] font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[3.25rem] xl:text-[3.75rem]">
            {t.hero.titleLines.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <span data-hero-line className="block">{line}</span>
              </span>
            ))}
          </h1>
          <p data-hero-fade className="mt-8 max-w-md text-base leading-relaxed text-muted md:text-lg">
            {t.hero.lead}
          </p>
          <div data-hero-fade className="mt-10 flex flex-wrap gap-8">
            <Button href="#research">{t.hero.ctaResearch}</Button>
            <Button href="#members">{t.hero.ctaPeople}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
