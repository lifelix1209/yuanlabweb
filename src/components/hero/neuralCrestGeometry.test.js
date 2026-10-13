import { describe, it, expect } from 'vitest';
import {
  ARC_POINTS, STREAMS, createRng, clamp, easeInOutCubic, cubicBezier,
  catmullRom, sampleCurve, streamForArcT, pointInEllipse, createPath, fitTransform,
} from './neuralCrestGeometry';

describe('createRng', () => {
  it('is deterministic for a given seed and stays in [0, 1)', () => {
    const a = createRng(42);
    const b = createRng(42);
    const values = Array.from({ length: 100 }, () => a());
    expect(values).toEqual(Array.from({ length: 100 }, () => b()));
    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  });
});

describe('math helpers', () => {
  it('clamps values', () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('eases from 0 to 1 symmetrically', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });

  it('cubic bezier hits its endpoints', () => {
    const pts = [[0, 0], [10, 0], [10, 10], [20, 10]];
    expect(cubicBezier(...pts, 0)).toEqual([0, 0]);
    expect(cubicBezier(...pts, 1)).toEqual([20, 10]);
  });

  it('catmull-rom passes through the control points', () => {
    expect(catmullRom(ARC_POINTS, 0)).toEqual(ARC_POINTS[0]);
    expect(catmullRom(ARC_POINTS, 1)).toEqual(ARC_POINTS[ARC_POINTS.length - 1]);
    expect(catmullRom(ARC_POINTS, 0.5)[0]).toBeCloseTo(ARC_POINTS[2][0]);
    expect(catmullRom(ARC_POINTS, 2)).toEqual(ARC_POINTS[ARC_POINTS.length - 1]);
  });

  it('samples n + 1 points along a curve', () => {
    expect(sampleCurve(ARC_POINTS, 10)).toHaveLength(11);
  });
});

describe('streams', () => {
  it('maps arc positions to the matching stream', () => {
    expect(streamForArcT(0).key).toBe('FNP');
    expect(streamForArcT(0.5).key).toBe('PA1');
    expect(streamForArcT(0.99).key).toBe('PA2');
  });

  it('cover the whole arc without gaps', () => {
    expect(STREAMS[0].range[0]).toBe(0);
    STREAMS.slice(1).forEach((s, i) => expect(s.range[0]).toBe(STREAMS[i].range[1]));
    expect(STREAMS[STREAMS.length - 1].range[1]).toBe(1);
  });

  it('places targets inside their ellipse', () => {
    const rng = createRng(3);
    const target = { x: 100, y: 100, rx: 20, ry: 10 };
    for (let i = 0; i < 200; i += 1) {
      const [x, y] = pointInEllipse(target, rng);
      expect(((x - 100) / 20) ** 2 + ((y - 100) / 10) ** 2).toBeLessThanOrEqual(1 + 1e-9);
    }
  });

  it('creates paths that start on the arc and end in the stream target', () => {
    const rng = createRng(9);
    for (let i = 0; i < 50; i += 1) {
      const path = createPath(rng);
      expect(path.points).toHaveLength(4);
      expect(path.points[0]).toEqual(catmullRom(ARC_POINTS, path.arcT));
      const { target } = STREAMS.find((s) => s.key === path.stream);
      const [x, y] = path.points[3];
      expect(((x - target.x) / target.rx) ** 2 + ((y - target.y) / target.ry) ** 2).toBeLessThanOrEqual(1 + 1e-9);
    }
  });
});

describe('fitTransform', () => {
  it('fits the design space with contain semantics and centres it', () => {
    expect(fitTransform(1000, 800)).toEqual({ scale: 1, offsetX: 0, offsetY: 0 });
    const wide = fitTransform(2000, 800);
    expect(wide.scale).toBe(1);
    expect(wide.offsetX).toBe(500);
    const tall = fitTransform(500, 800);
    expect(tall.scale).toBe(0.5);
    expect(tall.offsetY).toBe(200);
  });
});
