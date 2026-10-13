// Hero 尚未就绪时的后备弧线（视口居中）
export function fallbackArc() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Array.from({ length: 33 }, (_, i) => {
    const a = Math.PI * (1.1 + (i / 32) * 0.8);
    return [w / 2 + Math.cos(a) * w * 0.22, h * 0.62 + Math.sin(a) * h * 0.22];
  });
}

export function toPathD(points) {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}
