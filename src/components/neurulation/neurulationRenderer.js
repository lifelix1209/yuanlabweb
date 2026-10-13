import { clamp } from '../hero/neuralCrestGeometry';
import {
  NOTOCHORD, plateOutline, borderOutline, borderOpacity, ectodermHalf,
  createCrestCells, crestCellAt, fitDesign, surfaceLine,
} from './neurulationGeometry';

const COLORS = {
  ink: '22, 24, 29',
  accent: '0, 63, 136',
  plateFront: '#C9D3E0',
  plateBack: '#76869C',
  plateSide: '#A3B1C4',
  ectoFront: '#FBFAF7',
  ectoSide: '#DDD8CC',
  notochord: '#A8433A',
};

// 2.5D 斜投影：背面相对正面的偏移（设计单位），中间按层扫掠出厚度
const DEPTH = [30, -20];
const LAYERS = 10;
const ECTO_WIDTH = 22;

const tracePolygon = (ctx, points) => {
  points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
};

function platePath(ctx, outline) {
  ctx.beginPath();
  if (outline.closed) {
    tracePolygon(ctx, outline.outer);
    tracePolygon(ctx, [...outline.inner].reverse());
  } else {
    tracePolygon(ctx, [...outline.outer, ...[...outline.inner].reverse()]);
  }
}

// 泪滴形细胞，头部朝 +x
function teardrop(ctx, r) {
  ctx.beginPath();
  ctx.moveTo(-2.4 * r, 0);
  ctx.quadraticCurveTo(-r, -1.1 * r, 0, -r);
  ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
  ctx.quadraticCurveTo(-r, 1.1 * r, -2.4 * r, 0);
  ctx.closePath();
}

// 从背面到正面逐层绘制：首末层带描边，中间层只填充，形成厚片
function extrude(ctx, scale, { trace, side, back, front, stroke = 'fill' }) {
  for (let i = 0; i <= LAYERS; i += 1) {
    const t = i / LAYERS;
    ctx.save();
    ctx.translate(DEPTH[0] * (1 - t), DEPTH[1] * (1 - t));
    trace();
    const color = i === 0 ? back : i === LAYERS ? front : side;
    if (stroke === 'fill') {
      ctx.fillStyle = color;
      ctx.fill('evenodd');
      if (i === 0 || i === LAYERS) {
        ctx.strokeStyle = `rgba(${COLORS.ink}, 0.55)`;
        ctx.lineWidth = 1 / scale;
        ctx.stroke();
      }
    } else {
      if (i === 0 || i === LAYERS) {
        ctx.strokeStyle = `rgba(${COLORS.ink}, 0.5)`;
        ctx.lineWidth = ECTO_WIDTH + 2 / scale;
        ctx.stroke();
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = ECTO_WIDTH;
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawEctoderm(ctx, scale, s) {
  const halves = [ectodermHalf(s, -1), ectodermHalf(s, 1)];
  ctx.lineCap = 'butt';
  // 两半在背侧中线对接，作为一个整体扫掠以免接缝处描边互相覆盖
  extrude(ctx, scale, {
    trace: () => {
      ctx.beginPath();
      halves.forEach(({ from, ctrl, to }) => {
        ctx.moveTo(from[0], from[1]);
        ctx.quadraticCurveTo(ctrl[0], ctrl[1], to[0], to[1]);
      });
    },
    side: COLORS.ectoSide,
    back: COLORS.ectoSide,
    front: COLORS.ectoFront,
    stroke: 'line',
  });
  return halves;
}

function drawNotochord(ctx, scale) {
  const { x, y, rx, ry } = NOTOCHORD;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI * 0.62);
  ctx.scale(rx / 10, ry / 10);
  teardrop(ctx, 10);
  ctx.restore();
  ctx.fillStyle = COLORS.notochord;
  ctx.fill();
  ctx.strokeStyle = `rgba(${COLORS.ink}, 0.4)`;
  ctx.lineWidth = 1 / scale;
  ctx.stroke();
}

function drawPlate(ctx, scale, s) {
  const outline = plateOutline(s);
  extrude(ctx, scale, {
    trace: () => platePath(ctx, outline),
    side: COLORS.plateSide,
    back: COLORS.plateBack,
    front: COLORS.plateFront,
  });
  const opacity = borderOpacity(s);
  if (opacity <= 0.01) return;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    tracePolygon(ctx, borderOutline(s, side));
    ctx.fillStyle = `rgba(${COLORS.accent}, ${0.6 * opacity})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${COLORS.ink}, ${0.5 * opacity})`;
    ctx.lineWidth = 1 / scale;
    ctx.stroke();
  });
}

function drawCells(ctx, scale, cells, s, { time, drag }) {
  cells.forEach((cell) => {
    const { x, y, angle, alpha, migrate } = crestCellAt(cell, s);
    if (alpha <= 0.01) return;
    // 迁移后的细胞轻微游走；Lenis 速度带来的拖曳随迁移程度增强
    const wobble = 2.2 * migrate * Math.sin(time * 1.1 + cell.seed * 6.283);
    const lag = drag * (6 + 10 * migrate);
    ctx.save();
    ctx.translate(x + wobble * Math.cos(angle + Math.PI / 2), y + wobble * Math.sin(angle + Math.PI / 2) + lag);
    ctx.rotate(angle);
    teardrop(ctx, cell.size);
    ctx.fillStyle = `rgba(${COLORS.accent}, ${0.38 * alpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${COLORS.accent}, ${0.9 * alpha})`;
    ctx.lineWidth = 1.2 / scale;
    ctx.stroke();
    ctx.restore();
  });
}

// 渲染器：animate=false 时只在 setStage / resize 时绘制（用于 reduced-motion 静态图）
export function createRenderer(canvas, { stage = 0, animate = true, seed = 11 } = {}) {
  const ctx = canvas.getContext('2d');
  const cells = createCrestCells(seed);
  // 热循环中的可变状态（与 Hero 粒子场一致，避免每帧分配）
  const state = {
    stage, time: 0, last: 0, raf: 0, running: false,
    drag: 0, dragTarget: 0, width: 0, height: 0, transform: fitDesign(1, 1),
  };

  function draw() {
    const { scale, offsetX, offsetY } = state.transform;
    ctx.clearRect(0, 0, state.width, state.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.lineJoin = 'round';
    drawEctoderm(ctx, scale, state.stage);
    drawNotochord(ctx, scale);
    drawPlate(ctx, scale, state.stage);
    drawCells(ctx, scale, cells, state.stage, state);
    ctx.restore();
  }

  const frame = (now) => {
    const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 0.016;
    state.last = now;
    state.time += dt;
    state.dragTarget *= 0.9;
    state.drag += (state.dragTarget - state.drag) * 0.12;
    draw();
    state.raf = requestAnimationFrame(frame);
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = rect.width;
    state.height = rect.height;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    state.transform = fitDesign(rect.width, rect.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!state.running) draw();
  };

  const api = {
    setStage(value) {
      state.stage = clamp(value, 0, 3);
      if (!state.running) draw();
    },
    setVelocity(velocity) {
      state.dragTarget = clamp(velocity / 30, -1, 1);
    },
    start() {
      if (!animate || state.running) return;
      state.running = true;
      state.last = 0;
      state.raf = requestAnimationFrame(frame);
    },
    stop() {
      state.running = false;
      cancelAnimationFrame(state.raf);
    },
    // 胚胎表面在视口中的坐标，供开屏动画描边后无缝落在神经板上
    getArcClientPoints() {
      const rect = canvas.getBoundingClientRect();
      const { scale, offsetX, offsetY } = state.transform;
      return surfaceLine(state.stage).map(([x, y]) => [rect.left + offsetX + x * scale, rect.top + offsetY + y * scale]);
    },
    resize,
    destroy() {
      api.stop();
    },
  };

  resize();
  return api;
}
