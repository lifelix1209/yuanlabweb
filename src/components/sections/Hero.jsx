import { ArrowRight, Users, ChevronDown, Sparkles } from 'lucide-react';
import { useLabData } from '../../hooks/useLabData';
import { Button } from '../ui';

export function Hero() {
  const { data, loading } = useLabData();
  const labInfo = data?.labInfo || {};

  if (loading) {
    return (
      <section id="home" className="min-h-screen flex flex-col justify-center items-center relative pt-24 overflow-hidden grid-bg">
        <div className="text-center text-slate-400">加载中...</div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="min-h-screen flex flex-col justify-center items-center relative pt-24 overflow-hidden grid-bg"
    >
      {/* 背景装饰 */}
      <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-sci-primary/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-sci-secondary/10 rounded-full blur-[80px] -z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sci-glow rounded-full blur-[120px] -z-10"></div>

      <div className="text-center max-w-4xl px-6 space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sci-card/50 border border-sci-primary/30 text-sci-primary text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
          <Sparkles size={14} /> {labInfo.focusTag}
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
          聚焦 <br />
          <span style={{ color: '#ffffff', textShadow: '0 0 20px rgba(251, 191, 36, 0.5), 0 2px 4px rgba(0,0,0,0.3)' }}>
            颅神经嵴细胞
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          我们致力于结合细胞生物学、空间组学与生物信息学，
          解析颅颌面发育的细胞命运与组织图谱，揭示颅缝稳态失衡与颅缝早闭的致病机制，
          并探索骨与组织再生的新策略。
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button primary icon={ArrowRight} href="#publications">
            查看研究成果
          </Button>
          <Button icon={Users} href="#members">
            认识我们的团队
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 animate-bounce text-sci-primary/60">
        <ChevronDown size={24} />
      </div>
    </section>
  );
}
