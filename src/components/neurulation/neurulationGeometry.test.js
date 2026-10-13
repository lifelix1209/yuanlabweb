import { describe, it, expect } from 'vitest';
import {
  PLATE, TUBE, APEX, STAGE_LABELS, stageAt, curvatureAt, plateOutline, borderOutline,
  borderOpacity, ectodermHalf, createCrestCells, crestCellAt, fitDesign, surfaceLine,
} from './neurulationGeometry';

const near = (a, b, eps = 1e-6) => Math.hypot(a[0] - b[0], a[1] - b[1]) < eps;

describe('stageAt', () => {
  it('maps scroll progress onto stages B (0) to E (3)', () => {
    expect(stageAt(0)).toBe(0);
    expect(stageAt(1)).toBe(3);
    expect(stageAt(1 / 3)).toBeCloseTo(1);
  });

  it('is monotonic and holds a plateau around each stage', () => {
    const values = Array.from({ length: 101 }, (_, i) => stageAt(i / 100));
    values.slice(1).forEach((v, i) => expect(v).toBeGreaterThanOrEqual(values[i]));
    expect(stageAt(1 / 3 + 0.04)).toBe(1);
    expect(stageAt(0.03)).toBe(0);
  });
});

describe('neural plate', () => {
  it('bends monotonically from flat to a closed tube', () => {
    expect(curvatureAt(0)).toBe(0);
    expect(curvatureAt(2)).toBeCloseTo((2 * Math.PI) / PLATE.length);
    expect(curvatureAt(3)).toBe(curvatureAt(2));
    expect(curvatureAt(1)).toBeLessThan(curvatureAt(1.5));
  });

  it('is flat at stage B', () => {
    const { inner, closed } = plateOutline(0);
    expect(closed).toBe(false);
    inner.forEach(([, y]) => expect(y).toBeCloseTo(inner[0][1]));
  });

  it('closes into a ring around the tube centre from stage D', () => {
    const { outer, inner, closed } = plateOutline(2.5);
    expect(closed).toBe(true);
    expect(near(outer[0], outer[outer.length - 1], 1e-6)).toBe(true);
    const radius = (p) => Math.hypot(p[0] - TUBE.x, p[1] - TUBE.y);
    outer.forEach((p) => expect(radius(p)).toBeCloseTo(TUBE.outer));
    inner.forEach((p) => expect(radius(p)).toBeCloseTo(TUBE.inner));
  });

  it('keeps the border regions at the two ends of the plate', () => {
    const left = borderOutline(0, -1);
    const right = borderOutline(0, 1);
    const reach = PLATE.length * PLATE.borderFraction;
    left.forEach(([x]) => expect(x).toBeLessThanOrEqual(PLATE.mid[0] - PLATE.length / 2 + reach + 1e-6));
    right.forEach(([x]) => expect(x).toBeGreaterThanOrEqual(PLATE.mid[0] + PLATE.length / 2 - reach - 1e-6));
  });

  it('fades the border once the crest delaminates', () => {
    expect(borderOpacity(0)).toBe(1);
    expect(borderOpacity(1)).toBe(1);
    expect(borderOpacity(2)).toBe(0);
  });
});

describe('ectoderm', () => {
  it('attaches to the plate ends at stage B', () => {
    const { outer } = plateOutline(0);
    const right = ectodermHalf(0, 1);
    expect(right.from[0]).toBeCloseTo(PLATE.mid[0] + PLATE.length / 2);
    expect(right.from[1]).toBeCloseTo(PLATE.mid[1]);
    expect(outer.length).toBeGreaterThan(2);
  });

  it('fuses into one epidermis over the tube from stage D', () => {
    const left = ectodermHalf(2, -1);
    const right = ectodermHalf(3, 1);
    expect(near(left.from, APEX)).toBe(true);
    expect(near(right.from, APEX)).toBe(true);
    expect(left.to[0]).toBeCloseTo(1000 - right.to[0]);
  });
});

describe('crest cells', () => {
  const cells = createCrestCells(5);

  it('splits cells evenly between both sides', () => {
    expect(cells.filter((c) => c.side === -1)).toHaveLength(cells.length / 2);
  });

  it('are hidden at stage B', () => {
    cells.forEach((c) => expect(crestCellAt(c, 0).alpha).toBe(0));
  });

  it('sit dorsally between tube and epidermis at stage D', () => {
    cells.forEach((c) => {
      const { x, y, alpha } = crestCellAt(c, 2.1);
      expect(alpha).toBe(1);
      expect(Math.hypot(x - TUBE.x, y - TUBE.y)).toBeGreaterThan(TUBE.outer);
      expect(y).toBeLessThan(TUBE.y);
      expect(y).toBeGreaterThan(APEX[1]);
    });
  });

  it('have migrated to their own side of the tube at stage E', () => {
    cells.forEach((c) => {
      const { x } = crestCellAt(c, 3);
      expect(Math.sign(x - TUBE.x)).toBe(c.side);
      expect(Math.abs(x - TUBE.x)).toBeGreaterThan(TUBE.outer);
    });
  });

  it('are deterministic for a seed', () => {
    expect(createCrestCells(5)).toEqual(cells);
  });
});

describe('surfaceLine', () => {
  it('runs continuously from the left ectoderm across the plate to the right ectoderm', () => {
    const line = surfaceLine(0, 20);
    expect(line[0][0]).toBeLessThan(100);
    expect(line[line.length - 1][0]).toBeGreaterThan(900);
    line.slice(1).forEach((p, i) => {
      expect(p[0]).toBeGreaterThan(line[i][0]);
      expect(Math.hypot(p[0] - line[i][0], p[1] - line[i][1])).toBeLessThan(40);
    });
  });
});

describe('labels', () => {
  it('stay inside the design space and reference valid stages', () => {
    STAGE_LABELS.forEach(({ x, y, stages }) => {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(1000);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(700);
      stages.forEach((s) => expect([0, 1, 2, 3]).toContain(s));
    });
  });
});

describe('fitDesign', () => {
  it('scales the design space with contain semantics', () => {
    expect(fitDesign(1000, 700)).toEqual({ scale: 1, offsetX: 0, offsetY: 0 });
    expect(fitDesign(500, 700).offsetY).toBe(175);
  });
});
