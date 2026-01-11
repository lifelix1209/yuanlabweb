import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useLabData } from '../../hooks/useLabData';
import { Section, SectionHeader } from '../ui';

export function LabRetreatGallery() {
  const { data, loading } = useLabData();
  const retreatData = data?.retreatData || [];
  const [active, setActive] = useState(0);

  // 所有 hooks 必须在条件判断之前调用
  const total = retreatData.length;
  const current = retreatData[active] || {};

  const goPrev = () => setActive((i) => (i - 1 + total) % total);
  const goNext = () => setActive((i) => (i + 1) % total);

  useEffect(() => {
    if (total === 0) return;
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [total]);

  if (loading) {
    return (
      <Section id="retreat" className="bg-sci-dark relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-slate-400 py-12">加载中...</div>
        </div>
      </Section>
    );
  }

  // 如果没有数据，显示空状态
  if (total === 0) {
    return (
      <Section id="retreat" className="bg-sci-dark relative">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            title="Lab Retreat"
            description="记录我们的年度 Retreat：学术交流、团队建设与灵感碰撞 😊"
            className="text-white"
          />
          <div className="text-center text-slate-400 py-12">暂无照片</div>
        </div>
      </Section>
    );
  }

  return (
    <Section id="retreat" className="bg-sci-dark relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="Lab Retreat"
          description="记录我们的年度 Retreat：学术交流、团队建设与灵感碰撞 😊"
          className="text-white"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* 主图 */}
          <div className="lg:col-span-8">
            <div className="group relative overflow-hidden rounded-3xl border border-sci-border shadow-sci bg-sci-card">
              <img
                src={current.src}
                alt={current.alt}
                className="w-full h-[420px] md:h-[520px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />

              {/* 渐变遮罩 + 文案 */}
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-sci-dark via-sci-dark/50 to-transparent">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sci-gradient/20 text-sci-primary text-xs font-bold tracking-wider uppercase border border-sci-primary/30">
                      <Sparkles size={14} /> Retreat Moments
                    </div>
                    <h3 className="mt-3 text-2xl md:text-3xl font-extrabold text-white">
                      {current.title}
                    </h3>
                    <p className="mt-2 text-slate-400 text-sm md:text-base">
                      {current.desc}
                    </p>
                  </div>

                  {/* 左右切换按钮 */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={goPrev}
                      aria-label="Previous photo"
                      className="w-11 h-11 rounded-full bg-sci-card/80 border border-sci-border text-white hover:bg-sci-primary hover:border-sci-primary transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <span className="inline-block -translate-x-0.5">←</span>
                    </button>
                    <button
                      onClick={goNext}
                      aria-label="Next photo"
                      className="w-11 h-11 rounded-full bg-sci-card/80 border border-sci-border text-white hover:bg-sci-primary hover:border-sci-primary transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <span className="inline-block translate-x-0.5">→</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 进度点 */}
              <div className="absolute top-4 left-4 flex gap-2">
                {retreatData.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActive(idx)}
                    aria-label={`Go to photo ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 border ${
                      idx === active
                        ? "w-8 bg-sci-primary border-sci-primary"
                        : "w-2.5 bg-sci-card/50 border-sci-border hover:bg-sci-primary/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：缩略图 + 描述卡片 */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-sci-card rounded-2xl border border-sci-border p-6">
              <h4 className="text-lg font-bold text-white">Highlights</h4>
              <p className="mt-3 text-slate-400 leading-relaxed">
                Retreat 是我们每年固定的交流时间：分享研究进展、讨论新思路，也让团队在轻松的氛围中建立更强的合作默契。
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Talks", "Poster", "Brainstorming", "Team Building"].map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-sci-gradient/10 text-sci-primary text-xs rounded border border-sci-primary/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {retreatData.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActive(idx)}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    idx === active
                      ? "border-sci-primary ring-2 ring-sci-primary/30"
                      : "border-sci-border hover:border-sci-primary/50 hover:-translate-y-0.5"
                  }`}
                  aria-label={`Select ${img.title}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-24 md:h-28 object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sci-dark/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <div className="text-[11px] font-bold text-white drop-shadow">
                      {img.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500">
              Tip: 使用键盘方向键 ← → 也可以切换照片
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
