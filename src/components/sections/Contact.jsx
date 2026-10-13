import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useLabData } from '../../hooks/useLabData';
import { useLang } from '../../i18n/LanguageContext';
import { SplitHeading } from '../motion/SplitHeading';
import { Reveal } from '../motion/Reveal';

function ExternalLink({ href, children }) {
  if (!href || href === '#') return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 text-paper/80 transition-colors hover:text-paper">
      {children}
      <ArrowUpRight size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

export function Contact() {
  const { data } = useLabData();
  const { t, pick } = useLang();
  const labInfo = data?.labInfo ?? {};
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-accent-deep text-paper">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 md:pt-32 lg:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-paper/60">
          <span className="text-paper">06</span>
          <span className="mx-2">—</span>
          {t.contact.label}
        </p>
        <SplitHeading className="mt-8 font-serif text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
          {t.contact.title}
        </SplitHeading>
        <Reveal as="p" className="mt-6 max-w-xl leading-relaxed text-paper/70">{t.contact.lead}</Reveal>

        {labInfo.contactEmail && (
          <a
            href={`mailto:${labInfo.contactEmail}`}
            className="mt-12 inline-block break-all border-b border-paper/30 pb-2 font-serif text-3xl transition-colors hover:border-paper md:text-5xl"
          >
            {labInfo.contactEmail}
          </a>
        )}

        <dl className="mt-20 grid grid-cols-1 gap-10 border-t border-paper/20 pt-10 text-sm md:grid-cols-12">
          <div className="md:col-span-6">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-paper/50">{t.contact.address}</dt>
            <dd className="mt-3 max-w-sm leading-relaxed text-paper/80">{pick(labInfo, 'address')}</dd>
          </div>
          <div className="md:col-span-6">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-paper/50">{t.contact.links}</dt>
            <dd className="mt-3 flex flex-col gap-2">
              <ExternalLink href={labInfo.universityUrl}>{t.contact.university}</ExternalLink>
              <ExternalLink href={labInfo.scholarUrl}>Google Scholar</ExternalLink>
              <ExternalLink href={labInfo.githubUrl}>GitHub</ExternalLink>
            </dd>
          </div>
        </dl>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-paper/50">
          <span>© {year} {labInfo.brand ?? 'Yuan Lab'}. {t.contact.rights}</span>
          <Link to="/login" viewTransition className="transition-colors hover:text-paper">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
