import { Mail, MapPin, Github, ExternalLink } from 'lucide-react';
import { useLabData } from '../../hooks/useLabData';

export function Contact() {
  const { data: { labInfo } } = useLabData();

  return (
    <section
      id="contact"
      className="py-24 bg-sci-darker text-white relative overflow-hidden"
    >
      {/* 底部装饰纹理 */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:30px_30px]"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sci-primary/50 to-transparent"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <h2 className="text-3xl font-bold mb-6">保持联系</h2>
        <p className="text-slate-400 mb-12 max-w-xl mx-auto">
          如果您对我们的研究方向感兴趣，或希望申请博士/硕士/本科科研实习，欢迎联系 😊
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* 邮箱卡片 */}
          <div className="group bg-sci-card/50 backdrop-blur-sm p-8 rounded-2xl border border-sci-border hover:border-sci-primary/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-sci-gradient rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-sci transition-all duration-300">
              <Mail size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">电子邮箱</h3>
            <a
              href={`mailto:${labInfo.contactEmail}`}
              className="text-slate-300 font-mono select-all cursor-pointer hover:text-sci-primary transition-colors"
            >
              {labInfo.contactEmail}
            </a>
          </div>

          {/* 地址卡片 */}
          <div className="group bg-sci-card/50 backdrop-blur-sm p-8 rounded-2xl border border-sci-border hover:border-sci-primary/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-sci-gradient rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-sci transition-all duration-300">
              <MapPin size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">实验室地址</h3>
            <p className="text-slate-300">{labInfo.address}</p>
          </div>
        </div>

        <div className="flex justify-center gap-8 border-t border-sci-border pt-10">
          <a
            href={labInfo.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:text-sci-primary transition-colors flex items-center gap-2"
          >
            <Github size={20} /> GitHub
          </a>
          <a
            href={labInfo.universityUrl}
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:text-sci-primary transition-colors flex items-center gap-2"
          >
            <ExternalLink size={20} /> University / Institute
          </a>
        </div>

        <div className="mt-10 text-slate-400 text-sm">
          &copy; 2025 {labInfo.brand}. All Rights Reserved.
        </div>
      </div>
    </section>
  );
}
