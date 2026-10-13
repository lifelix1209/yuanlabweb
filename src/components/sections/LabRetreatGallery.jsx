import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { useLabData } from '../../hooks/useLabData';
import { useLang } from '../../i18n/LanguageContext';
import { gsap, MEDIA } from '../../lib/motion';
import { Section, SectionHeader } from '../ui';

// 不对称杂志式拼贴：大小交错的格位循环使用
const LAYOUT = [
  { cell: 'md:col-span-7 md:row-span-2', frame: 'aspect-[4/3] md:aspect-auto md:flex-1' },
  { cell: 'md:col-span-5', frame: 'aspect-[4/3]' },
  { cell: 'md:col-span-5', frame: 'aspect-[4/3]' },
  { cell: 'md:col-span-4', frame: 'aspect-[3/4]' },
  { cell: 'md:col-span-8 md:self-end', frame: 'aspect-[16/10]' },
  { cell: 'md:col-span-6 md:col-start-4', frame: 'aspect-[16/9]' },
];

export function LabRetreatGallery() {
  const { data } = useLabData();
  const { t, pick } = useLang();
  const photos = data?.retreatData ?? [];
  const ref = useRef(null);

  // 图片在格位内做轻微视差（±40px）
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        gsap.utils.toArray('[data-parallax]').forEach((img) => {
          gsap.fromTo(img, { yPercent: -6 }, {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [photos.length], revertOnUpdate: true }
  );

  return (
    <Section id="retreat">
      <SectionHeader index="05" label={t.retreat.label} title={t.retreat.title} description={t.retreat.lead} />
      {photos.length === 0 ? (
        <p className="text-muted">{t.retreat.empty}</p>
      ) : (
        <div ref={ref} className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-12">
          {photos.map((photo, i) => (
            <figure key={photo.id} className={`flex flex-col ${LAYOUT[i % LAYOUT.length].cell}`}>
              <div className={`relative overflow-hidden bg-paper-2 ${LAYOUT[i % LAYOUT.length].frame}`}>
                <img
                  data-parallax
                  src={photo.src}
                  alt={photo.alt ?? photo.title ?? ''}
                  loading="lazy"
                  className="absolute inset-x-0 top-[-7.5%] h-[115%] w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 flex gap-3 font-mono text-[11px] leading-relaxed text-muted">
                <span className="text-accent">Fig. 5{String.fromCharCode(97 + i)}</span>
                <span>{photo.title}{pick(photo, 'desc') ? ` — ${pick(photo, 'desc')}` : ''}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </Section>
  );
}
