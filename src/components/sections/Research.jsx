import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { useLang } from '../../i18n/LanguageContext';
import { gsap, MEDIA } from '../../lib/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { LineageFigure, SutureFigure, RegenerationFigure } from '../research/ResearchFigures';
import { Section, SectionHeader, Keyword } from '../ui';
import { Reveal } from '../motion/Reveal';

const RESEARCH_FIGURES = [LineageFigure, SutureFigure, RegenerationFigure];

function TopicText({ topic }) {
  return (
    <>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Fig. {topic.fig}</p>
      <h3 className="mt-4 font-serif text-3xl font-medium leading-tight text-ink md:text-4xl">{topic.title}</h3>
      <p className="mt-5 max-w-md leading-relaxed text-muted">{topic.desc}</p>
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
        {topic.tags.map((tag) => <Keyword key={tag}>{tag}</Keyword>)}
      </div>
    </>
  );
}

// 桌面端：板块固定，滚动依次切换 Fig. 1a → 1b → 1c
function PinnedTopics({ topics }) {
  const ref = useRef(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const panels = gsap.utils.toArray('[data-panel]');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top+=64',
          end: `+=${(panels.length - 1) * 90}%`,
          pin: true,
          scrub: 0.6,
          snap: { snapTo: 1 / (panels.length - 1), duration: { min: 0.2, max: 0.6 }, ease: 'power2.inOut' },
          onUpdate: (self) => setActive(Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)))),
        },
      });
      panels.slice(1).forEach((panel, i) => {
        tl.to(panels[i], { autoAlpha: 0, y: -40, duration: 1 })
          .fromTo(panel, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1 }, '<0.2');
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="relative h-[calc(100svh-8rem)] min-h-[520px]">
      {topics.map((topic, i) => {
        const Figure = RESEARCH_FIGURES[i];
        return (
          <div key={topic.fig} data-panel className={`absolute inset-0 grid grid-cols-12 items-center gap-10 ${i > 0 ? 'invisible opacity-0' : ''}`}>
            <div className="col-span-5 col-start-1"><TopicText topic={topic} /></div>
            <figure className="col-span-6 col-start-7 aspect-square max-h-[60svh] border border-rule bg-paper p-10">
              <Figure />
            </figure>
          </div>
        );
      })}
      <ol className="absolute bottom-0 left-0 flex gap-3" aria-hidden="true">
        {topics.map((topic, i) => (
          <li key={topic.fig} className="flex items-center gap-2 font-mono text-[11px] text-muted">
            <span className={`h-px transition-all duration-500 ${i === active ? 'w-10 bg-accent' : 'w-5 bg-rule'}`} />
            {topic.fig}
          </li>
        ))}
      </ol>
    </div>
  );
}

function StackedTopics({ topics }) {
  return (
    <div className="space-y-20">
      {topics.map((topic, i) => {
        const Figure = RESEARCH_FIGURES[i];
        return (
          <Reveal key={topic.fig} className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div><TopicText topic={topic} /></div>
            <figure className="aspect-square w-full max-w-sm border border-rule p-8"><Figure /></figure>
          </Reveal>
        );
      })}
    </div>
  );
}

export function Research() {
  const { t } = useLang();
  const pinned = useMediaQuery(MEDIA.desktop);
  return (
    <Section id="research">
      <SectionHeader index="01" label={t.research.label} title={t.research.title} description={t.research.lead} />
      {pinned ? <PinnedTopics topics={t.research.topics} /> : <StackedTopics topics={t.research.topics} />}
    </Section>
  );
}
