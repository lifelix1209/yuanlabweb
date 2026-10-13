import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { gsap, ScrollTrigger, MEDIA, onScroll } from '../../lib/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { createRenderer } from '../neurulation/neurulationRenderer';
import { DESIGN, STAGE_LABELS, stageAt } from '../neurulation/neurulationGeometry';
import { advance, shouldReset } from '../neurulation/irreversibleProgress';

const STAGES = [0, 1, 2, 3];

// 画布容器与设计空间同比例，标签可直接用百分比定位
function FigureLabels({ labels, active }) {
  return STAGE_LABELS.map(({ key, x, y, stages }) => (
    <span
      key={key}
      className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[9px] text-ink transition-opacity duration-500 sm:text-[11px] ${active === undefined || stages.includes(active) ? 'opacity-100' : 'opacity-0'}`}
      style={{ left: `${(x / DESIGN.width) * 100}%`, top: `${(y / DESIGN.height) * 100}%` }}
    >
      {labels[key]}
    </span>
  ));
}

function StageText({ stage }) {
  return (
    <>
      <p className="font-serif text-5xl font-medium text-accent md:text-6xl">{stage.letter}</p>
      <h3 className="mt-3 font-serif text-2xl font-medium leading-tight text-ink md:text-3xl">{stage.title}</h3>
      <p className="mt-4 max-w-sm leading-relaxed text-muted">{stage.desc}</p>
    </>
  );
}

// 滚动驱动：Lenis + ScrollTrigger 固定舞台，进度只增不减，回到页面顶部时重置为 B
function ScrollSequence({ t }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(0);

  // layout effect：需先于 Research 的 pinned 触发器创建，保证 pin 间距按文档顺序计算
  useLayoutEffect(() => {
    const renderer = createRenderer(canvasRef.current);
    const display = { value: 0 };
    let reached = 0;

    const render = () => {
      const s = stageAt(display.value);
      renderer.setStage(s);
      setActive(Math.round(s));
    };

    const trigger = ScrollTrigger.create({
      trigger: stageRef.current,
      start: 'top top',
      end: '+=300%',
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

    let inView = false;
    const sync = () => (inView && !document.hidden ? renderer.start() : renderer.stop());
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(canvasRef.current);
    const ro = new ResizeObserver(() => renderer.resize());
    ro.observe(canvasRef.current);
    document.addEventListener('visibilitychange', sync);

    return () => {
      trigger.kill();
      unsubscribe();
      gsap.killTweensOf(display);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', sync);
      renderer.destroy();
    };
  }, []);

  return (
    <div ref={stageRef} className="relative flex h-[100svh] flex-col justify-center overflow-hidden pt-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-10">
        <div className="lg:col-span-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            <span className="text-accent">00</span><span className="mx-2">—</span>{t.label}
          </p>
          <h2 className="mt-4 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-ink md:text-5xl">{t.title}</h2>
          <div className="mt-6 grid lg:mt-10" aria-live="polite">
            {t.stages.map((stage, i) => (
              <div key={stage.letter} className={`col-start-1 row-start-1 transition-all duration-700 ${i === active ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`} aria-hidden={i !== active}>
                <StageText stage={stage} />
              </div>
            ))}
          </div>
        </div>

        <figure className="lg:col-span-8">
          <div className="relative mx-auto aspect-[10/7] w-full max-w-[calc(50svh*10/7)] lg:max-w-[calc(70svh*10/7)]">
            <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
            <FigureLabels labels={t.labels} active={active} />
          </div>
          <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <span className="max-w-md font-mono text-[11px] leading-relaxed text-muted">{t.caption}</span>
            <ol className="flex gap-3" aria-hidden="true">
              {t.stages.map((stage, i) => (
                <li key={stage.letter} className="flex items-center gap-2 font-mono text-[11px] text-muted">
                  <span className={`h-px transition-all duration-500 ${i <= active ? 'w-8 bg-accent' : 'w-4 bg-rule'}`} />
                  {stage.letter}
                </li>
              ))}
            </ol>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

function StaticPanel({ stage }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const renderer = createRenderer(canvasRef.current, { stage, animate: false });
    const ro = new ResizeObserver(() => renderer.resize());
    ro.observe(canvasRef.current);
    return () => {
      ro.disconnect();
      renderer.destroy();
    };
  }, [stage]);
  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />;
}

// reduced-motion：四个阶段并列的静态图
function StaticSequence({ t }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
        <span className="text-accent">00</span><span className="mx-2">—</span>{t.label}
      </p>
      <h2 className="mt-4 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-ink md:text-5xl">{t.title}</h2>
      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
        {STAGES.map((s) => (
          <figure key={s}>
            <div className="relative aspect-[10/7] w-full">
              <StaticPanel stage={s} />
              <FigureLabels labels={t.labels} active={s} />
            </div>
            <figcaption className="mt-4"><StageText stage={t.stages[s]} /></figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-10 font-mono text-[11px] leading-relaxed text-muted">{t.caption}</p>
    </div>
  );
}

export function NeuralCrestSequence() {
  const { t } = useLang();
  const reduced = useMediaQuery(MEDIA.reduced);
  return (
    <section id="neurulation" className="relative">
      {reduced ? <StaticSequence t={t.neurulation} /> : <ScrollSequence t={t.neurulation} />}
    </section>
  );
}
