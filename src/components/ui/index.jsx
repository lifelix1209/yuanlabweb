import { ArrowRight } from 'lucide-react';
import { SplitHeading } from '../motion/SplitHeading';
import { Reveal } from '../motion/Reveal';
import { scrollToTarget } from '../../lib/motion';

// 文字链接按钮：下划线 + 箭头，hover 时下划线收起、箭头右移
export function Button({ children, href, onClick, className = '', ...props }) {
  const isAnchor = typeof href === 'string' && href.startsWith('#');
  const handleClick = (e) => {
    if (isAnchor) {
      e.preventDefault();
      scrollToTarget(href, { offset: -72 });
    }
    onClick?.(e);
  };
  const classes = `group inline-flex items-center gap-2 font-medium text-ink border-b border-ink/80 pb-1 transition-colors duration-300 hover:text-accent hover:border-accent ${className}`;
  const content = (
    <>
      {children}
      <ArrowRight size={16} strokeWidth={1.5} className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
    </>
  );
  return href ? (
    <a href={href} onClick={handleClick} className={classes} {...props}>{content}</a>
  ) : (
    <button type="button" onClick={handleClick} className={classes} {...props}>{content}</button>
  );
}

// Card 组件（后台保留）
export function Card({ children, className = '', ...props }) {
  return (
    <div className={`border border-rule p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

// 页面板块容器：统一的上下留白与顶部细线
export function Section({ id, children, className = '', ruled = true, ...props }) {
  return (
    <section id={id} className={`relative py-24 md:py-32 ${className}`} {...props}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {ruled && <div className="mb-14 h-px bg-rule md:mb-20" aria-hidden="true" />}
        {children}
      </div>
    </section>
  );
}

// 板块标题：左侧编号标签，右侧衬线标题与导语（12 列栅格）
export function SectionHeader({ index, label, title, description, className = '' }) {
  return (
    <header className={`mb-14 grid grid-cols-1 gap-6 md:mb-20 md:grid-cols-12 ${className}`}>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted md:col-span-3 md:pt-3">
        {index && <span className="text-accent">{index}</span>}
        {index && label && <span className="mx-2">—</span>}
        {label}
      </p>
      <div className="md:col-span-9">
        <SplitHeading className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-ink md:text-6xl">
          {title}
        </SplitHeading>
        {description && (
          <Reveal as="p" className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            {description}
          </Reveal>
        )}
      </div>
    </header>
  );
}

// 关键词标签：等宽小号字
export function Keyword({ children, className = '' }) {
  return (
    <span className={`font-mono text-[11px] uppercase tracking-wider text-muted ${className}`}>
      {children}
    </span>
  );
}

// 标签组件（后台使用，保持暗色样式）
export function Tag({ children, className = '' }) {
  return (
    <span className={`px-2 py-0.5 bg-sci-gradient/10 text-sci-primary text-xs rounded border border-sci-primary/20 ${className}`}>
      {children}
    </span>
  );
}

// 输入框组件
export function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>}
      <input
        className="mt-2 w-full rounded-xl border border-sci-border bg-sci-card px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-sci-primary focus:ring-2 focus:ring-sci-primary/20 placeholder:text-slate-400"
        {...props}
      />
    </div>
  );
}

// Select 组件
export function Select({ label, options = [], ...props }) {
  return (
    <div>
      {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>}
      <select
        className="mt-2 w-full rounded-xl border border-sci-border bg-sci-card px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-sci-primary focus:ring-2 focus:ring-sci-primary/20"
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// Textarea 组件
export function Textarea({ label, ...props }) {
  return (
    <div>
      {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>}
      <textarea
        className="mt-2 w-full rounded-xl border border-sci-border bg-sci-card px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-sci-primary focus:ring-2 focus:ring-sci-primary/20 resize-none placeholder:text-slate-400"
        {...props}
      />
    </div>
  );
}
