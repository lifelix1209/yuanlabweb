import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { useLang } from '../../i18n/LanguageContext';
import { gsap, MEDIA, EASE } from '../../lib/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useNeurulationScroll } from '../neurulation/useNeurulationScroll';
import { FigureLabels, StageCaption, StageTicks, StaticNeurulation } from '../neurulation/NeurulationFigure';
import { Button } from '../ui';

const LAST_STAGE = 3;

export function Hero({ play = true }) {
  const { t } = useLang();
  const ref = useRef(null);
  const figureRef = useRef(null);
  const canvasRef = useRef(null);
  const reduced = useMediaQuery(MEDIA.reduced);
  const desktop = useMediaQuery('(min-width: 1024px)');

  // 桌面端固定整个 Hero；移动端 Hero 高于视口，只固定图（导航栏下方）
  const scrolled = useNeurulationScroll({
    enabled: !reduced,
    canvasRef,
    pinRef: desktop ? ref : figureRef,
    start: desktop ? 'top top' : 'top top+=72',
    end: desktop ? '+=300%' : '+=150%',
  });
  const active = reduced ? LAST_STAGE : scrolled;
  const { stages, labels } = t.neurulation;

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
    <section id="home" ref={ref} className="relative overflow-hidden bg-paper pt-20 lg:h-[100svh]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:h-[calc(100svh-5rem)] lg:grid-cols-12 lg:items-center lg:px-10">
        <figure ref={figureRef} className="relative order-first w-full bg-paper lg:order-last lg:col-span-7">
          <div className="relative mx-auto aspect-[10/7] w-full lg:max-w-[calc(64svh*10/7)]">
            {reduced ? <StaticNeurulation stage={LAST_STAGE} /> : <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />}
            <FigureLabels labels={labels} active={active} />
          </div>
          <figcaption data-hero-fade className="mt-4 space-y-3">
            <StageCaption stages={stages} active={active} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[11px] leading-relaxed text-muted">{t.hero.caption}</span>
              <StageTicks stages={stages} active={active} />
            </div>
          </figcaption>
        </figure>

        <div className="pb-16 pt-4 lg:col-span-5 lg:pb-0 lg:pt-0">
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
