import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLabData } from '../../hooks/useLabData';
import { Section, SectionHeader, Input, Select } from '../ui';

export function Alumni() {
  const { data: { alumniData } } = useLabData();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("全部");
  const [sortKey, setSortKey] = useState("endDesc");
  const [openId, setOpenId] = useState(null);

  const roles = ["全部", ...Array.from(new Set(alumniData.map((a) => a.role)))];

  const filtered = useMemo(() => {
    return alumniData
      .filter((a) => (roleFilter === "全部" ? true : a.role === roleFilter))
      .filter((a) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          a.name.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          String(a.startYear).includes(q) ||
          String(a.endYear).includes(q) ||
          a.destination.toLowerCase().includes(q) ||
          (a.note ? a.note.toLowerCase().includes(q) : false)
        );
      })
      .sort((a, b) => {
        if (sortKey === "endAsc") return a.endYear - b.endYear;
        return b.endYear - a.endYear;
      });
  }, [alumniData, roleFilter, query, sortKey]);

  return (
    <Section id="alumni" className="bg-sci-dark relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="Alumni"
          description="感谢曾经加入 Yuan Lab 的伙伴们。这里记录大家在组内的身份、起止年份与后续去向 😊"
          className="text-white"
        />

        {/* 搜索/筛选/排序 */}
        <div className="bg-sci-card rounded-2xl border border-sci-border p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-6">
              <Input
                label="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="按姓名 / 身份 / 年份 / 去向搜索…"
              />
            </div>

            <div className="md:col-span-3">
              <Select
                label="Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={roles.map(r => ({ value: r, label: r }))}
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort</label>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setSortKey("endDesc")}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold border transition ${
                    sortKey === "endDesc"
                      ? "bg-sci-gradient text-white border-transparent"
                      : "bg-sci-card text-slate-300 border-sci-border hover:border-sci-primary/50"
                  }`}
                >
                  结束年 ↓
                </button>
                <button
                  onClick={() => setSortKey("endAsc")}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold border transition ${
                    sortKey === "endAsc"
                      ? "bg-sci-gradient text-white border-transparent"
                      : "bg-sci-card text-slate-300 border-sci-border hover:border-sci-primary/50"
                  }`}
                >
                  结束年 ↑
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-slate-500">
            共 <span className="font-bold text-sci-primary">{filtered.length}</span> 位 Alumni
          </div>
        </div>

        {/* 列表 */}
        <div className="space-y-4">
          {filtered.map((a) => {
            const isOpen = openId === a.id;
            return (
              <div
                key={a.id}
                className="bg-sci-card rounded-2xl border border-sci-border hover:border-sci-primary/50 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : a.id)}
                  className="w-full text-left p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{a.name}</h3>
                      <span className="px-2 py-0.5 bg-sci-gradient/20 text-sci-primary text-xs rounded border border-sci-primary/30 font-bold">
                        {a.role}
                      </span>
                      <span className="px-2 py-0.5 bg-sci-card text-slate-400 text-xs rounded border border-sci-border font-mono">
                        {a.startYear} - {a.endYear}
                      </span>
                    </div>
                    <div className="text-slate-400 text-sm">
                      去向：<span className="font-semibold text-slate-200">{a.destination}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 text-sci-primary font-semibold">
                    <span className="text-sm">{isOpen ? "收起" : "展开"}</span>
                    <span className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 -mt-2">
                    <div className="rounded-xl bg-sci-darker border border-sci-border p-4 text-sm text-slate-400 leading-relaxed">
                      <div className="font-bold text-slate-200 mb-2">组内经历 / 备注</div>
                      {a.note ? a.note : "（暂无备注）"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-14 bg-sci-card rounded-2xl border border-sci-border text-slate-500">
              没有匹配结果 🤔 试试换个关键词或筛选条件
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
