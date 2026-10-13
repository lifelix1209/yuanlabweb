// 神经嵴形成横截面示意（纯函数，便于测试）。设计空间 1000 × 700。
// 阶段 s ∈ [0, 3]：B 神经板(0) → C 神经褶(1) → D 神经管闭合、嵴细胞脱层(2) → E 嵴细胞迁移(3)
import { createRng, clamp, easeInOutCubic } from '../hero/neuralCrestGeometry';

export const DESIGN = { width: 1000, height: 700 };

export const PLATE = { length: 520, thickness: 56, mid: [500, 450], borderFraction: 0.13 };

const K_FOLD = (1.1 * Math.PI) / PLATE.length;
const K_TUBE = (2 * Math.PI) / PLATE.length;
const TUBE_RADIUS = 1 / K_TUBE;

export const TUBE = {
  x: PLATE.mid[0],
  y: PLATE.mid[1] - TUBE_RADIUS,
  outer: TUBE_RADIUS + PLATE.thickness / 2,
  inner: TUBE_RADIUS - PLATE.thickness / 2,
};

// 表皮在背侧中线合拢处
export const APEX = [500, 196];

export const NOTOCHORD = { x: 500, y: 522, rx: 26, ry: 19 };

// 图中标签：设计坐标 + 显示的阶段
export const STAGE_LABELS = [
  { key: 'neuralPlate', x: 480, y: 392, stages: [0] },
  { key: 'plateBorder', x: 740, y: 392, stages: [0] },
  { key: 'nonNeural', x: 880, y: 508, stages: [0] },
  { key: 'notochord', x: 600, y: 572, stages: [0] },
  { key: 'neuralFold', x: 215, y: 345, stages: [1] },
  { key: 'premigratory', x: 700, y: 222, stages: [1] },
  { key: 'epidermis', x: 830, y: 188, stages: [2, 3] },
  { key: 'delaminating', x: 795, y: 268, stages: [2] },
  { key: 'neuralTube', x: 500, y: 615, stages: [2, 3] },
  { key: 'migratory', x: 790, y: 515, stages: [3] },
];

const lerp = (a, b, t) => a + (b - a) * t;
const lerpPoint = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// 每个阶段之间的过渡只占中间 70%，两端留出停顿
export function stageAt(progress) {
  const x = clamp(progress) * 3;
  const i = Math.min(Math.floor(x), 2);
  const g = clamp((x - i - 0.15) / 0.7);
  return i + easeInOutCubic(g);
}

export function curvatureAt(s) {
  if (s <= 1) return K_FOLD * clamp(s);
  return lerp(K_FOLD, K_TUBE, clamp(s - 1));
}

// 等曲率弧：中点固定、切线水平，向上弯曲。u 为距中点的弧长，返回中线点与指向曲率中心的法向
function frame(k, u) {
  const [mx, my] = PLATE.mid;
  if (k < 1e-9) return { point: [mx + u, my], normal: [0, -1] };
  const theta = k * u;
  return {
    point: [mx + Math.sin(theta) / k, my - (1 - Math.cos(theta)) / k],
    normal: [-Math.sin(theta), -Math.cos(theta)],
  };
}

// v ∈ [-1, 1]：-1 为基底面（外侧），1 为顶端面（神经管腔一侧）
export function platePoint(s, u, v) {
  const { point, normal } = frame(curvatureAt(s), u);
  const offset = (v * PLATE.thickness) / 2;
  return [point[0] + normal[0] * offset, point[1] + normal[1] * offset];
}

function edge(s, from, to, v, segments) {
  return Array.from({ length: segments + 1 }, (_, i) => platePoint(s, lerp(from, to, i / segments), v));
}

export function plateOutline(s, segments = 72) {
  const half = PLATE.length / 2;
  return {
    outer: edge(s, -half, half, -1, segments),
    inner: edge(s, -half, half, 1, segments),
    closed: curvatureAt(s) >= K_TUBE - 1e-9,
  };
}

// 神经板边界（嵴细胞前体）多边形，side = -1 左 / 1 右
export function borderOutline(s, side, segments = 10) {
  const half = PLATE.length / 2;
  const start = side * (half - PLATE.length * PLATE.borderFraction);
  const end = side * half;
  return [...edge(s, start, end, 1, segments), ...edge(s, end, start, -1, segments)];
}

export const borderOpacity = (s) => 1 - clamp((s - 1.4) / 0.6);

const mirror = ([x, y], side) => [side === 1 ? x : DESIGN.width - x, y];

// 右半侧外胚层关键帧（左侧镜像）：B 平铺、C 随神经褶抬起、D/E 合拢成表皮
const ECTO_KEYS = [
  { ctrl: [860, 455], to: [965, 470] },
  { ctrl: [800, 282], to: [965, 300] },
  { ctrl: [760, APEX[1]], to: [965, 330] },
];

export function ectodermHalf(s, side) {
  const tip = platePoint(s, (side * PLATE.length) / 2, 0);
  const i = s < 1 ? 0 : 1;
  const t = s < 1 ? clamp(s) : easeInOutCubic(clamp(s - 1));
  const from = s <= 1 ? tip : lerpPoint(tip, APEX, t);
  return {
    from,
    ctrl: mirror(lerpPoint(ECTO_KEYS[i].ctrl, ECTO_KEYS[i + 1].ctrl, t), side),
    to: mirror(lerpPoint(ECTO_KEYS[i].to, ECTO_KEYS[i + 1].to, t), side),
  };
}

function sampleQuad({ from, ctrl, to }, segments) {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const t = i / segments;
    const u = 1 - t;
    return [
      u * u * from[0] + 2 * u * t * ctrl[0] + t * t * to[0],
      u * u * from[1] + 2 * u * t * ctrl[1] + t * t * to[1],
    ];
  });
}

// 胚胎表面（左外胚层 → 神经板中线 → 右外胚层），供开屏描边与 Hero 对齐
export function surfaceLine(s = 0, segments = 24) {
  const half = PLATE.length / 2;
  return [
    ...sampleQuad(ectodermHalf(s, -1), segments).reverse(),
    ...edge(s, -half, half, 0, segments * 2).slice(1, -1),
    ...sampleQuad(ectodermHalf(s, 1), segments),
  ];
}

// 嵴细胞：板边界 → 背侧成团（脱层）→ 沿神经管两侧迁移
export function createCrestCells(seed = 11, perSide = 8) {
  const rng = createRng(seed);
  return [-1, 1].flatMap((side) =>
    Array.from({ length: perSide }, (_, j) => {
      const angle = -Math.PI / 2 + side * (0.08 + j * 0.085);
      const radius = TUBE.outer + 14 + (j % 2) * 12;
      return {
        side,
        u: side * (PLATE.length / 2 - rng() * PLATE.length * PLATE.borderFraction),
        v: (rng() - 0.5) * 1.2,
        cluster: [TUBE.x + Math.cos(angle) * radius, TUBE.y + Math.sin(angle) * radius],
        target: [TUBE.x + side * (170 + (j % 2) * 38 + rng() * 14), 290 + j * 25 + rng() * 8],
        delay: rng() * 0.3,
        size: 6.5 + rng() * 2,
        seed: rng(),
      };
    })
  );
}

export function crestCellAt(cell, s) {
  const delam = easeInOutCubic(clamp((s - 1.4 - cell.delay * 0.5) / 0.45));
  const migrate = easeInOutCubic(clamp((s - 2.15 - cell.delay) / 0.55));
  const origin = platePoint(s, cell.u, cell.v);
  let [x, y] = lerpPoint(origin, cell.cluster, delam);
  if (migrate > 0) {
    // 二次贝塞尔绕开神经管：控制点取目标的 x、团块的 y
    const ctrl = [cell.target[0], cell.cluster[1]];
    const u = 1 - migrate;
    x = u * u * cell.cluster[0] + 2 * u * migrate * ctrl[0] + migrate * migrate * cell.target[0];
    y = u * u * cell.cluster[1] + 2 * u * migrate * ctrl[1] + migrate * migrate * cell.target[1];
  }
  return {
    x,
    y,
    angle: Math.atan2(y - TUBE.y, x - TUBE.x),
    alpha: clamp((s - 1.3) / 0.2),
    migrate,
  };
}

// 设计空间等比放入画布（contain，居中）
export function fitDesign(width, height) {
  const scale = Math.min(width / DESIGN.width, height / DESIGN.height);
  return {
    scale,
    offsetX: (width - DESIGN.width * scale) / 2,
    offsetY: (height - DESIGN.height * scale) / 2,
  };
}
