import { FileText } from 'lucide-react';
import { useLabData } from '../../hooks/useLabData';
import { Section } from '../ui';

export function Publications() {
  const { data, loading } = useLabData();
  const publicationsData = data?.publicationsData || [];
  const labInfo = data?.labInfo || {};

  if (loading) {
    return (
      <Section id="publications" className="bg-sci-dark">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center text-slate-400 py-12">加载中...</div>
        </div>
      </Section>
    );
  }

  return (
    <Section id="publications" className="bg-sci-dark">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12 flex justify-between items-end gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white">近期出版物</h2>
            <div className="w-12 h-1 bg-sci-gradient mt-4 rounded-full"></div>
            <p className="text-slate-400 mt-4 max-w-2xl leading-relaxed">
              以发育机制为基础，结合组学与模型系统，探索颅颌面相关疾病机制与再生策略。
            </p>
          </div>

          <a
            href={labInfo.scholarUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sci-primary font-medium hover:text-sci-primaryHover text-sm hidden sm:block transition-colors"
          >
            查看 Google Scholar →
          </a>
        </div>

        <div className="space-y-6">
          {publicationsData.map((pub) => (
            <div
              key={pub.id}
              className="group bg-sci-card p-8 rounded-2xl border border-sci-border hover:border-sci-primary/50 hover:shadow-sci transition-all duration-300 relative overflow-hidden"
            >
              {/* 发光效果 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-sci-gradient/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-sci-gradient/10 transition-all"></div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start relative z-10">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-sci-gradient/20 text-sci-primary border border-sci-primary/30">
                      {pub.conference}
                    </span>
                    <span className="text-slate-500 text-sm font-mono">{pub.year}</span>
                  </div>
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xl font-bold text-white group-hover:text-sci-primary transition-colors"
                  >
                    {pub.title}
                  </a>
                  <p className="text-slate-300 font-medium text-sm">{pub.authors}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{pub.abstract}</p>
                </div>

                <a
                  href={pub.link}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 flex items-center gap-1 text-slate-500 hover:text-sci-primary transition-colors text-sm font-bold mt-2 sm:mt-0"
                  aria-label="Open publication"
                >
                  <FileText size={16} /> Link
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
