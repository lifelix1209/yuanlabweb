// 三个研究方向的线描示意图（墨色细线 + 求是蓝强调），风格对应论文 figure

const stroke = { stroke: 'var(--color-ink)', strokeWidth: 1.25, fill: 'none', vectorEffect: 'non-scaling-stroke' };
const accent = { ...stroke, stroke: 'var(--color-accent)', strokeWidth: 1.75 };

// 1a：谱系二分叉树
export function LineageFigure() {
  const branches = [
    ['M200 340 C200 290 200 260 200 240', stroke],
    ['M200 240 C200 200 130 190 120 150', stroke],
    ['M200 240 C200 200 270 190 280 150', accent],
    ['M120 150 C120 110 80 100 70 60', stroke],
    ['M120 150 C120 110 160 100 170 60', stroke],
    ['M280 150 C280 110 240 100 230 60', accent],
    ['M280 150 C280 110 320 100 330 60', stroke],
  ];
  const nodes = [[200, 240], [120, 150], [280, 150]];
  const leaves = [[70, 60, false], [170, 60, false], [230, 60, true], [330, 60, false]];
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      {branches.map(([d, s]) => <path key={d} d={d} {...s} />)}
      {nodes.map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="5" fill="var(--color-paper)" {...stroke} />)}
      {leaves.map(([x, y, a]) => <circle key={`${x}${y}`} cx={x} cy={y} r="9" fill={a ? 'var(--color-accent)' : 'var(--color-paper)'} {...(a ? accent : stroke)} />)}
      <circle cx="200" cy="350" r="9" fill="var(--color-ink)" />
    </svg>
  );
}

// 1b：两块颅骨板之间的颅缝与间充质干细胞
export function SutureFigure() {
  const cells = [[192, 120], [206, 160], [194, 200], [208, 240], [196, 280], [205, 320]];
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <path d="M40 80 C100 70 150 76 178 90 L182 330 C150 340 100 344 40 336 Z" {...stroke} fill="var(--color-paper-2)" />
      <path d="M360 80 C300 70 250 76 222 90 L218 330 C250 340 300 344 360 336 Z" {...stroke} fill="var(--color-paper-2)" />
      <path d="M178 90 C190 130 210 150 200 200 C190 250 214 280 182 330" {...stroke} strokeDasharray="3 5" />
      {cells.map(([x, y], i) => (
        <circle key={y} cx={x} cy={y} r={i % 2 ? 6 : 7} fill={i % 3 === 0 ? 'var(--color-accent)' : 'var(--color-paper)'} {...(i % 3 === 0 ? accent : stroke)} />
      ))}
    </svg>
  );
}

// 1c：骨缺损处由支架引导再生
export function RegenerationFigure() {
  const grid = Array.from({ length: 5 }, (_, i) => 150 + i * 25);
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <path d="M40 150 L150 150 L150 250 L40 250" {...stroke} fill="var(--color-paper-2)" />
      <path d="M360 150 L250 150 L250 250 L360 250" {...stroke} fill="var(--color-paper-2)" />
      {grid.map((x) => <path key={`v${x}`} d={`M${x} 150 L${x} 250`} {...stroke} strokeOpacity="0.4" />)}
      {[150, 175, 200, 225, 250].map((y) => <path key={`h${y}`} d={`M150 ${y} L250 ${y}`} {...stroke} strokeOpacity="0.4" />)}
      <path d="M150 250 C170 215 180 205 200 200 C220 195 232 185 250 150" {...accent} />
      {[[165, 230], [188, 208], [214, 192], [236, 168]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="5" fill="var(--color-accent)" />)}
    </svg>
  );
}
