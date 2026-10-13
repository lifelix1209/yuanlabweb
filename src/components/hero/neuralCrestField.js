import {
  ARC_POINTS, HEAD_OUTLINE, EYE, createRng, clamp, easeInOutCubic,
  cubicBezier, sampleCurve, createPath, fitTransform,
} from './neuralCrestGeometry';

const DEFAULTS = {
  count: 600,
  seed: 7,
  inkColor: '22, 24, 29',
  accentColor: '0, 63, 136',
  accentRatio: 0.16,
  reducedMotion: false,
  pointerRadius: 90,
};

const ARC_SAMPLES = sampleCurve(ARC_POINTS, 64);
const OUTLINE_SAMPLES = sampleCurve(HEAD_OUTLINE, 160);

// 粒子状态在热循环中原地更新：每帧上千次分配会造成 GC 卡顿，这里有意使用可变状态
function spawn(rng, opts, { initial }) {
  const path = createPath(rng);
  return {
    ...path,
    s: 0,
    speed: 1 / (3.2 + rng() * 3.4),
    delay: initial ? rng() * 4.5 : rng() * 0.6,
    hold: 1.6 + rng() * 2.6,
    fade: 1,
    size: 0.9 + rng() * 1.5,
    accent: rng() < opts.accentRatio,
    seed: rng(),
    dx: 0,
    dy: 0,
  };
}

function positionOf(p, time) {
  const [p0, p1, p2, p3] = p.points;
  const e = easeInOutCubic(clamp(p.s));
  const [x, y] = cubicBezier(p0, p1, p2, p3, e);
  const [nx0, ny0] = cubicBezier(p0, p1, p2, p3, Math.min(e + 0.01, 1));
  const tx = nx0 - x;
  const ty = ny0 - y;
  const len = Math.hypot(tx, ty) || 1;
  // 沿路径法向的有机扰动，迁移中段最大、两端趋零
  const wobble = 14 * Math.sin(Math.PI * e) * Math.sin(time * 0.8 + p.seed * 6.283 + e * 6);
  const settleJitter = p.s >= 1 ? 1.4 * Math.sin(time * 1.3 + p.seed * 40) : 0;
  return [x + (-ty / len) * wobble + settleJitter + p.dx, y + (tx / len) * wobble + p.dy];
}

function strokeCurve(ctx, samples) {
  ctx.beginPath();
  samples.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.stroke();
}

export function createField(canvas, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const ctx = canvas.getContext('2d');
  const rng = createRng(opts.seed);
  const pointer = { x: -9999, y: -9999 };
  const state = {
    particles: Array.from({ length: opts.count }, () => spawn(rng, opts, { initial: true })),
    running: false,
    emitting: false,
    progress: 0,
    time: 0,
    last: 0,
    raf: 0,
    width: 0,
    height: 0,
    transform: fitTransform(1, 1),
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = rect.width;
    state.height = rect.height;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    state.transform = fitTransform(rect.width, rect.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!state.running) draw();
  };

  const toDesign = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const { scale, offsetX, offsetY } = state.transform;
    return [(clientX - rect.left - offsetX) / scale, (clientY - rect.top - offsetY) / scale];
  };

  const onPointerMove = (e) => {
    const [x, y] = toDesign(e.clientX, e.clientY);
    pointer.x = x;
    pointer.y = y;
  };

  const update = (dt) => {
    const r = opts.pointerRadius;
    state.particles.forEach((p, i) => {
      if (!state.emitting && p.s === 0) return;
      if (p.delay > 0) {
        p.delay -= dt;
        return;
      }
      if (p.s < 1) {
        p.s = Math.min(1, p.s + p.speed * dt);
      } else if (p.hold > 0) {
        p.hold -= dt;
      } else {
        p.fade -= dt * 1.2;
        if (p.fade <= 0) state.particles[i] = spawn(rng, opts, { initial: false });
      }
      // 指针排斥：位移随距离衰减，并逐帧弹性回位
      const [x, y] = positionOf(p, state.time);
      const dist = Math.hypot(x - pointer.x, y - pointer.y);
      if (dist < r && dist > 0.001) {
        const force = (1 - dist / r) ** 2 * 6;
        p.dx += ((x - pointer.x) / dist) * force;
        p.dy += ((y - pointer.y) / dist) * force;
      }
      p.dx *= 0.92;
      p.dy *= 0.92;
    });
  };

  function draw() {
    const { scale, offsetX, offsetY } = state.transform;
    const fadeOut = 1 - clamp(state.progress);
    const sink = state.progress * 80;
    ctx.clearRect(0, 0, state.width, state.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.lineWidth = 1 / scale;

    ctx.strokeStyle = `rgba(${opts.inkColor}, ${0.12 * fadeOut})`;
    strokeCurve(ctx, OUTLINE_SAMPLES);
    ctx.beginPath();
    ctx.arc(EYE.x, EYE.y, EYE.r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.5 / scale;
    ctx.strokeStyle = `rgba(${opts.inkColor}, ${0.85 * fadeOut})`;
    strokeCurve(ctx, ARC_SAMPLES);

    state.particles.forEach((p) => {
      if (p.delay > 0 || (p.s === 0 && !state.emitting)) return;
      const [x, y] = positionOf(p, state.time);
      const birth = clamp(p.s * 8);
      const alpha = (p.accent ? 0.9 : 0.5) * birth * clamp(p.fade) * fadeOut;
      if (alpha <= 0.01) return;
      ctx.fillStyle = `rgba(${p.accent ? opts.accentColor : opts.inkColor}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y + sink * p.s, (p.accent ? p.size * 1.25 : p.size) / Math.sqrt(scale), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  const frame = (now) => {
    const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 0.016;
    state.last = now;
    state.time += dt;
    update(dt);
    draw();
    state.raf = requestAnimationFrame(frame);
  };

  // reduced-motion：直接给出一帧迁移中途的静态快照
  const renderStatic = () => {
    state.particles.forEach((p) => {
      p.delay = 0;
      p.s = 0.25 + rng() * 0.75;
    });
    state.emitting = true;
    draw();
  };

  const api = {
    start() {
      if (opts.reducedMotion) {
        renderStatic();
        return;
      }
      if (state.running) return;
      state.running = true;
      state.last = 0;
      state.raf = requestAnimationFrame(frame);
    },
    stop() {
      state.running = false;
      cancelAnimationFrame(state.raf);
    },
    setEmitting(value) {
      state.emitting = value;
      if (opts.reducedMotion && value) renderStatic();
    },
    setProgress(value) {
      state.progress = clamp(value);
      if (!state.running) draw();
    },
    // 背侧神经管弧线在视口中的坐标，供开屏动画精确对齐
    getArcClientPoints() {
      const rect = canvas.getBoundingClientRect();
      const { scale, offsetX, offsetY } = state.transform;
      return ARC_SAMPLES.map(([x, y]) => [rect.left + offsetX + x * scale, rect.top + offsetY + y * scale]);
    },
    resize,
    destroy() {
      api.stop();
      window.removeEventListener('pointermove', onPointerMove);
    },
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  resize();
  return api;
}
