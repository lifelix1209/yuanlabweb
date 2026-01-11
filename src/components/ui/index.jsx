// 基础 Button 组件
export function Button({ children, primary, icon: Icon, onClick, href, className = '', ...props }) {
  const baseClasses = "group inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 cursor-pointer select-none";
  const primaryClasses = "bg-sci-gradient text-white hover:shadow-sci hover:-translate-y-1";
  const secondaryClasses = "bg-sci-card text-slate-300 border border-sci-border hover:border-sci-primary hover:text-sci-primary hover:shadow-sci hover:-translate-y-0.5";

  const classes = `${baseClasses} ${primary ? primaryClasses : secondaryClasses} ${className}`;

  const content = (
    <>
      {children}
      {Icon && (
        <Icon size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes} {...props}>
      {content}
    </button>
  );
}

// Card 组件
export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`
        bg-sci-card rounded-2xl border border-sci-border p-6
        ${hover ? 'hover:shadow-sci hover:border-sci-primary/50 transition-all duration-300 hover:-translate-y-2' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Section 容器组件
export function Section({ id, children, className = '', ...props }) {
  return (
    <section id={id} className={`py-24 ${className}`} {...props}>
      {children}
    </section>
  );
}

// Section Header 组件
export function SectionHeader({ title, description, className = '' }) {
  return (
    <div className={`text-center mb-16 ${className}`}>
      <h2 className="text-3xl font-bold text-white">{title}</h2>
      <div className="w-12 h-1 bg-sci-gradient mx-auto mt-4 rounded-full"></div>
      {description && (
        <p className="text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

// 标签组件
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
