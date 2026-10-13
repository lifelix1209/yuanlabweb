import { useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from 'lucide-react';
import { useLabData } from '../../hooks/useLabData';
import { useLang } from '../../i18n/LanguageContext';
import { gsap, MEDIA, EASE } from '../../lib/motion';
import { Section, SectionHeader } from '../ui';

const PI_AUTHOR = /(Yuan Yuan#?|Y\.? Yuan)/;

// 作者列表中高亮课题组负责人
function Authors({ text = '' }) {
  return text.split(PI_AUTHOR).map((part, i) =>
    PI_AUTHOR.test(part) ? <strong key={i} className="font-medium text-ink">{part}</strong> : part
  );
}

function groupByYear(pubs) {
  const groups = pubs.reduce((acc, pub) => {
    const year = String(pub.year ?? '—');
    return { ...acc, [year]: [...(acc[year] ?? []), pub] };
  }, {});
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function Entry({ pub, t }) {
  const [open, setOpen] = useState(false);
  return (
    <li data-entry className="border-b border-rule py-8 first:pt-0">
      <p className="font-serif text-base italic text-accent">{pub.conference}</p>
      <h4 className="mt-2 font-serif text-xl leading-snug text-ink md:text-2xl">
        <a href={pub.link} target="_blank" rel="noreferrer" className="group inline decoration-rule underline-offset-4 hover:underline">
          {pub.title}
          <ArrowUpRight size={18} strokeWidth={1.5} className="ml-1 inline-block align-baseline text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </h4>
      <p className="mt-3 text-sm leading-relaxed text-muted"><Authors text={pub.authors} /></p>
      {pub.abstract && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-4 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:text-accent"
          >
            {open ? `− ${t.publications.hideAbstract}` : `+ ${t.publications.abstract}`}
          </button>
          {open && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{pub.abstract}</p>}
        </>
      )}
    </li>
  );
}

// 每个年份组：分隔线自左向右画出，条目依次出现
function YearGroup({ year, pubs, t }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true } });
        tl.from('[data-rule]', { scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: EASE })
          .from('[data-year]', { autoAlpha: 0, y: 20, duration: 1, ease: EASE }, 0.1)
          .from('[data-entry]', { autoAlpha: 0, y: 24, duration: 1, ease: EASE, stagger: 0.1 }, 0.2);
      });
      return () => mm.revert();
    },
    { scope: ref }
  );
  return (
    <div ref={ref} className="grid grid-cols-1 gap-6 pb-12 md:grid-cols-12">
      <div data-rule className="h-px bg-ink md:col-span-12" />
      <p data-year className="font-serif text-5xl font-medium tabular-nums text-ink md:col-span-3 md:pt-6">{year}</p>
      <ol className="md:col-span-9 md:pt-8">
        {pubs.map((pub) => <Entry key={pub.id} pub={pub} t={t} />)}
      </ol>
    </div>
  );
}

export function Publications() {
  const { data } = useLabData();
  const { t } = useLang();
  const groups = useMemo(() => groupByYear(data?.publicationsData ?? []), [data?.publicationsData]);
  const scholarUrl = data?.labInfo?.scholarUrl;

  return (
    <Section id="publications">
      <SectionHeader index="03" label={t.publications.label} title={t.publications.title} description={t.publications.lead} />
      {groups.map(([year, pubs]) => <YearGroup key={year} year={year} pubs={pubs} t={t} />)}
      {scholarUrl && (
        <a href={scholarUrl} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent">
          {t.publications.scholar}
          <ArrowUpRight size={16} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      )}
    </Section>
  );
}
