import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLabData } from '../../hooks/useLabData';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: { labInfo } } = useLabData();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "首页", href: "#home" },
    { name: "研究方向", href: "#research" },
    { name: "成员", href: "#members" },
    { name: "历史成员", href: "#alumni" },
    { name: "出版物", href: "#publications" },
    { name: "实验室团建", href: "#retreat" },
    { name: "联系我们", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-sci-dark/90 backdrop-blur-md border-b border-sci-border py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a
          href="#home"
          className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2 group"
          aria-label={`${labInfo.brand} Home`}
        >
          <div className="w-10 h-10 bg-sci-gradient rounded-lg flex items-center justify-center text-white group-hover:shadow-sci transition-all duration-300">
            Y
          </div>
          <div className="flex flex-col leading-none">
            <span className="bg-clip-text text-transparent bg-sci-gradient">{labInfo.brand}</span>
            <span className="text-xs font-semibold text-slate-400 tracking-normal">
              {labInfo.brandCn}
            </span>
          </div>
        </a>

        {/* 桌面端菜单 */}
        <div className="hidden md:flex space-x-1">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-sci-primary transition-colors px-4 py-2 rounded-lg hover:bg-sci-card/50 relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-sci-primary transition-all group-hover:w-8"></span>
            </a>
          ))}
        </div>

        {/* 移动端菜单按钮 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-slate-300 hover:text-sci-primary transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      {isOpen && (
        <div className="md:hidden bg-sci-dark border-b border-sci-border absolute w-full">
          <div className="flex flex-col p-4 space-y-2">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-slate-300 font-medium py-3 px-4 hover:bg-sci-card rounded-lg hover:text-sci-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
