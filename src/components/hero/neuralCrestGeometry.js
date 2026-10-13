// 神经嵴迁移示意的几何定义（纯函数，便于测试）。
// 设计空间 1000 × 800，胚胎头部侧视、面朝左：
// 背侧神经管弧线位于头顶，三股细胞流分别迁移至额鼻突（FNP）、第一咽弓（PA1）、第二咽弓（PA2）。

export const DESIGN = { width: 1000, height: 800 };

export const ARC_POINTS = [
  [540, 160], [690, 145], [820, 195], [890, 300], [910, 420],
];

// 面朝左的侧脸轮廓（自后颈经头顶、额、鼻、唇、下颌至前颈，开放曲线）
export const HEAD_OUTLINE = [
  [905, 770], [962, 580], [958, 380], [880, 190], [720, 96], [520, 104],
  [370, 160], [292, 236], [262, 296], [196, 372], [228, 410], [214, 452],
  [248, 480], [228, 512], [256, 590], [356, 640], [520, 662], [620, 722], [652, 772],
];

export const EYE = { x: 392, y: 300, r: 30 };

// 每股细胞流：发射区间（弧线参数）、起点后的第一控制点偏移、终点前控制点、目标椭圆
export const STREAMS = [
  { key: 'FNP', range: [0.0, 0.32], c1: [-120, 20], c2: [320, 220], target: { x: 270, y: 350, rx: 58, ry: 52 } },
  { key: 'PA1', range: [0.32, 0.68], c1: [-60, 190], c2: [500, 500], target: { x: 350, y: 548, rx: 92, ry: 52 } },
  { key: 'PA2', range: [0.68, 1.0], c1: [-20, 210], c2: [680, 590], target: { x: 565, y: 622, rx: 72, ry: 42 } },
];

// 可复现的伪随机数（mulberry32），避免渲染时 Math.random 造成跳变
export function createRng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function cubicBezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
}

// 经过所有点的 Catmull-Rom 样条，t ∈ [0, 1]
export function catmullRom(points, t) {
  const n = points.length - 1;
  const x = clamp(t) * n;
  const i = Math.min(Math.floor(x), n - 1);
  const f = x - i;
  const p0 = points[Math.max(i - 1, 0)];
  const p1 = points[i];
  const p2 = points[i + 1];
  const p3 = points[Math.min(i + 2, n)];
  const f2 = f * f;
  const f3 = f2 * f;
  const blend = (k) =>
    0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * f + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * f2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * f3);
  return [blend(0), blend(1)];
}

export function sampleCurve(points, segments) {
  return Array.from({ length: segments + 1 }, (_, i) => catmullRom(points, i / segments));
}

export function streamForArcT(t) {
  return STREAMS.find((s) => t >= s.range[0] && t <= s.range[1]) ?? STREAMS[STREAMS.length - 1];
}

// 在椭圆内均匀取点
export function pointInEllipse(target, rng) {
  const angle = rng() * Math.PI * 2;
  const radius = Math.sqrt(rng());
  return [target.x + Math.cos(angle) * radius * target.rx, target.y + Math.sin(angle) * radius * target.ry];
}

// 生成一条迁移路径（四个贝塞尔控制点）
export function createPath(rng) {
  const t = rng();
  const stream = streamForArcT(t);
  const p0 = catmullRom(ARC_POINTS, t);
  const jitter = () => (rng() - 0.5) * 60;
  const p1 = [p0[0] + stream.c1[0] + jitter(), p0[1] + stream.c1[1] + jitter()];
  const p2 = [stream.c2[0] + jitter(), stream.c2[1] + jitter()];
  const p3 = pointInEllipse(stream.target, rng);
  return { stream: stream.key, arcT: t, points: [p0, p1, p2, p3] };
}

// 将设计空间等比放入画布（contain，居中）
export function fitTransform(width, height) {
  const scale = Math.min(width / DESIGN.width, height / DESIGN.height);
  return {
    scale,
    offsetX: (width - DESIGN.width * scale) / 2,
    offsetY: (height - DESIGN.height * scale) / 2,
  };
}
