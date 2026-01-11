import { Section, SectionHeader, Tag } from '../ui';

const researchTopics = [
  {
    title: "颅神经嵴细胞谱系与命运决定",
    desc: "解析发育时空下的细胞异质性、谱系分化轨迹与关键调控节点。",
    tags: ["single-cell", "lineage", "fate decision"],
  },
  {
    title: "颅缝稳态与颅缝早闭机制",
    desc: "研究颅缝微环境、力学与信号网络如何共同影响颅骨生长与疾病发生。",
    tags: ["cranial suture", "MSC niche", "craniosynostosis"],
  },
  {
    title: "组织损伤修复与骨再生",
    desc: "探索干细胞、材料与组织工程策略，促进骨与软组织修复并提升功能恢复。",
    tags: ["regeneration", "biomaterials", "tissue repair"],
  },
];

export function Research() {
  return (
    <Section id="research" className="bg-sci-dark relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="研究方向"
          description="以颅神经嵴细胞为核心，我们关注发育过程中的细胞迁移、谱系分化与微环境互作，并将机制研究与再生修复方向紧密结合。"
          className="text-white"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {researchTopics.map((item) => (
            <div
              key={item.title}
              className="group bg-sci-card rounded-2xl p-8 border border-sci-border hover:border-sci-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-sci"
            >
              <div className="w-12 h-12 rounded-xl bg-sci-gradient flex items-center justify-center mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 rounded-full bg-sci-card"></div>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-sci-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-400 mt-3 leading-relaxed">{item.desc}</p>
              <div className="pt-5 flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
