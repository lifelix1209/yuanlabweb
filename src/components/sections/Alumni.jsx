import { useMemo } from 'react';
import { useLabData } from '../../hooks/useLabData';
import { useLang } from '../../i18n/LanguageContext';
import { Section, SectionHeader } from '../ui';
import { Reveal } from '../motion/Reveal';

export function Alumni() {
  const { data } = useLabData();
  const { t, pick } = useLang();
  const alumni = useMemo(
    () => [...(data?.alumniData ?? [])].sort((a, b) => Number(b.endYear) - Number(a.endYear)),
    [data?.alumniData]
  );
  const cols = t.alumni.cols;

  return (
    <Section id="alumni">
      <SectionHeader index="04" label={t.alumni.label} title={t.alumni.title} description={t.alumni.lead} />
      {alumni.length === 0 ? (
        <p className="text-muted">{t.alumni.empty}</p>
      ) : (
        <Reveal as="table" className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink font-mono text-[11px] uppercase tracking-wider text-muted">
              <th scope="col" className="py-3 pr-4 font-normal">{cols.name}</th>
              <th scope="col" className="hidden py-3 pr-4 font-normal sm:table-cell">{cols.role}</th>
              <th scope="col" className="py-3 pr-4 font-normal">{cols.years}</th>
              <th scope="col" className="py-3 font-normal">{cols.destination}</th>
            </tr>
          </thead>
          <tbody>
            {alumni.map((a) => {
              const note = pick(a, 'note');
              return (
                <tr key={a.id} className="border-b border-rule align-top transition-colors duration-300 hover:bg-paper-2">
                  <td className="py-4 pr-4">
                    <span className="font-serif text-lg text-ink">{pick(a, 'name')}</span>
                    <span className="block text-xs text-muted sm:hidden">{pick(a, 'role')}</span>
                  </td>
                  <td className="hidden py-4 pr-4 text-sm text-muted sm:table-cell">{pick(a, 'role')}</td>
                  <td className="py-4 pr-4 font-mono text-xs tabular-nums text-muted">{a.startYear}–{a.endYear}</td>
                  <td className="py-4 text-sm text-ink">
                    {pick(a, 'destination')}
                    {note && !/暂无/.test(note) && <span className="mt-1 block text-xs text-muted">{note}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Reveal>
      )}
    </Section>
  );
}
