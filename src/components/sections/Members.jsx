import { useLabData } from '../../hooks/useLabData';
import { Section, SectionHeader, Tag } from '../ui';

export function Members() {
  const { data: { membersData } } = useLabData();

  return (
    <Section id="members" className="bg-sci-dark relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="实验室成员"
          description="我们来自发育生物学、干细胞、转化医学与生物信息等方向，欢迎对相关研究感兴趣的同学加入 🙌"
          className="text-white"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {membersData.map((member) => (
            <div
              key={member.id}
              className="group relative bg-sci-card rounded-2xl p-6 border border-sci-border hover:border-sci-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-sci"
            >
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-sci-gradient rounded-full scale-0 group-hover:scale-110 opacity-20 transition-transform duration-300 ease-out"></div>
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover relative z-10 ring-2 ring-sci-border group-hover:ring-sci-primary/50 transition-all"
                />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">{member.name}</h3>
                <p className="text-sci-primary text-sm font-medium">{member.role}</p>
                <p className="text-slate-400 text-sm leading-relaxed min-h-[72px]">
                  {member.bio}
                </p>
                <div className="pt-3 flex flex-wrap justify-center gap-2">
                  {member.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
