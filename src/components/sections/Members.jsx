import { useLabData } from '../../hooks/useLabData';
import { useLang } from '../../i18n/LanguageContext';
import { Section, SectionHeader, Keyword } from '../ui';
import { Reveal } from '../motion/Reveal';

const PI_PATTERN = /教授|研究员|professor|principal investigator|\bpi\b/i;

// 卡通占位头像（dicebear）不符合学术风格，视为无照片
const hasPhoto = (url) => typeof url === 'string' && url.trim() !== '' && !url.includes('dicebear');

function initialsOf(name = '') {
  const clean = name.replace(/\b(phd|ph\.d)\.?/gi, '').trim();
  if (/[一-龥]/.test(clean)) return clean.slice(0, 1);
  return clean.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function Portrait({ member, name, large = false }) {
  const size = large ? 'aspect-[4/5]' : 'aspect-square';
  if (hasPhoto(member.avatar)) {
    return (
      <div className={`${size} overflow-hidden bg-paper-2`}>
        <img
          src={member.avatar}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover grayscale transition-[filter,transform] duration-700 ease-out-expo group-hover:scale-[1.03] group-hover:grayscale-0"
        />
      </div>
    );
  }
  return (
    <div className={`${size} flex items-center justify-center bg-paper-2 transition-colors duration-500 group-hover:bg-accent`}>
      <span className={`font-serif text-ink transition-colors duration-500 group-hover:text-paper ${large ? 'text-8xl' : 'text-5xl'}`}>
        {initialsOf(name)}
      </span>
    </div>
  );
}

function MemberCard({ member }) {
  const { pick } = useLang();
  const name = pick(member, 'name');
  return (
    <article data-reveal className="group">
      <Portrait member={member} name={name} />
      <h3 className="mt-5 font-serif text-xl text-ink">{name}</h3>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-accent">{pick(member, 'role')}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{pick(member, 'bio')}</p>
    </article>
  );
}

function PrincipalInvestigator({ member }) {
  const { pick, t } = useLang();
  const name = pick(member, 'name');
  const tags = pick(member, 'tags') ?? [];
  return (
    <Reveal className="group mb-20 grid grid-cols-1 gap-8 border-b border-rule pb-20 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-4"><Portrait member={member} name={name} large /></div>
      <div className="md:col-span-7 md:col-start-6 md:self-end">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{t.members.pi}</p>
        <h3 className="mt-4 font-serif text-4xl font-medium text-ink md:text-5xl">{name}</h3>
        <p className="mt-2 text-accent">{pick(member, 'role')}</p>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{pick(member, 'bio')}</p>
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
          {tags.map((tag) => <Keyword key={tag}>{tag}</Keyword>)}
        </div>
      </div>
    </Reveal>
  );
}

export function Members() {
  const { data } = useLabData();
  const { t } = useLang();
  const members = data?.membersData ?? [];
  const pi = members.find((m) => PI_PATTERN.test(`${m.role ?? ''} ${m.roleEn ?? ''}`));
  const others = members.filter((m) => m !== pi);

  return (
    <Section id="members">
      <SectionHeader index="02" label={t.members.label} title={t.members.title} description={t.members.lead} />
      {pi && <PrincipalInvestigator member={pi} />}
      <Reveal stagger={0.08} className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
        {others.map((member) => <MemberCard key={member.id} member={member} />)}
      </Reveal>
    </Section>
  );
}
