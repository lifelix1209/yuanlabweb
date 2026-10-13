import { useEffect, useRef } from 'react';
import { createRenderer } from './neurulationRenderer';
import { DESIGN, STAGE_LABELS } from './neurulationGeometry';

// 画布容器与设计空间同比例（aspect-[10/7]），标签可直接用百分比定位
export function FigureLabels({ labels, active }) {
  return STAGE_LABELS.map(({ key, x, y, stages }) => (
    <span
      key={key}
      className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[9px] text-ink transition-opacity duration-500 sm:text-[11px] ${stages.includes(active) ? 'opacity-100' : 'opacity-0'}`}
      style={{ left: `${(x / DESIGN.width) * 100}%`, top: `${(y / DESIGN.height) * 100}%` }}
    >
      {labels[key]}
    </span>
  ));
}

// 各阶段说明叠放在同一网格单元内交叉淡入，避免切换时高度跳动
export function StageCaption({ stages, active }) {
  return (
    <div className="grid" aria-live="polite">
      {stages.map((stage, i) => (
        <p
          key={stage.letter}
          aria-hidden={i !== active}
          className={`col-start-1 row-start-1 max-w-lg text-sm leading-relaxed text-muted transition-all duration-700 ${i === active ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}
        >
          <span className="mr-2 font-serif text-lg font-medium text-accent">{stage.letter}</span>
          <span className="font-medium text-ink">{stage.title}</span>
          <span className="mx-2 text-rule">/</span>
          {stage.desc}
        </p>
      ))}
    </div>
  );
}

export function StageTicks({ stages, active }) {
  return (
    <ol className="flex gap-3" aria-hidden="true">
      {stages.map((stage, i) => (
        <li key={stage.letter} className="flex items-center gap-2 font-mono text-[11px] text-muted">
          <span className={`h-px transition-all duration-500 ${i <= active ? 'w-8 bg-accent' : 'w-4 bg-rule'}`} />
          {stage.letter}
        </li>
      ))}
    </ol>
  );
}

// 静态单帧（reduced-motion）
export function StaticNeurulation({ stage }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const renderer = createRenderer(canvasRef.current, { stage, animate: false });
    const ro = new ResizeObserver(() => renderer.resize());
    ro.observe(canvasRef.current);
    return () => {
      ro.disconnect();
      renderer.destroy();
    };
  }, [stage]);
  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />;
}
