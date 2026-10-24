// Geometry of static figures (docs/architecture/viz/, sections 8.2 e, 8.4, 11.4, 11.5 U3–U4): hand-worked
// examples, and the math behind RegularizationGeometryFigure (properties, not coordinates: decision 39).
import { describe, expect, it } from 'vitest';
import { REGULARIZATION_GEOMETRY_PLOT as PLOT } from '../../../src/data/figures/regularization-geometry';
import {
  FIG_FONT,
  LINE_HEIGHT,
  NARROW_WIDTH,
  arrowHead,
  checkMathLabel,
  lineOffsets,
  pointBefore,
  round1,
  stackOffsets,
  toLines,
  type Pt,
} from '../../../src/lib/figures/geometry';
import {
  ellipseAttrs,
  levelEllipse,
  plotSize,
  pointsAttr,
  quadraticGradient,
  quadraticValue,
  toView,
  type Ellipse,
  type PlotBox,
  type Quadratic,
} from '../../../src/lib/figures/plot';

describe('round1', () => {
  it('rounds to 1 decimal, half away from zero, never -0', () => {
    expect(round1(9.75)).toBe(9.8);
    expect(round1(-9.75)).toBe(-9.8);
    expect(round1(3.14159)).toBe(3.1);
    expect(round1(12)).toBe(12);
    expect(Object.is(round1(-0.01), 0)).toBe(true);
  });
});

describe('the smallest text at 375px', () => {
  it('is at least 12px: 13 units in a 343px column for a 360-unit viewBox', () => {
    expect((FIG_FONT.small * 343) / NARROW_WIDTH).toBeGreaterThanOrEqual(12);
    expect(FIG_FONT.label).toBeGreaterThan(FIG_FONT.small);
  });
});

describe('lineOffsets', () => {
  it('centres one line on y', () => {
    expect(lineOffsets(1, 15)).toEqual([0]);
  });

  it('centres two lines, one pitch (15 × 1.3 = 19.5) apart', () => {
    expect(LINE_HEIGHT).toBe(1.3);
    expect(lineOffsets(2, 15)).toEqual([-9.8, 9.8]);
  });

  it('centres three lines, the middle one on y', () => {
    expect(lineOffsets(3, 15)).toEqual([-19.5, 0, 19.5]);
    expect(lineOffsets(3, 13)).toEqual([-16.9, 0, 16.9]);
  });

  it('rejects a count that is not a positive integer', () => {
    expect(() => lineOffsets(0, 15)).toThrow();
    expect(() => lineOffsets(1.5, 15)).toThrow();
  });
});

describe('stackOffsets', () => {
  it('matches lineOffsets for one size', () => {
    expect(stackOffsets([15, 15])).toEqual(lineOffsets(2, 15));
  });

  it('stacks a 15-unit line over two 13-unit ones: pitches 19.5, 16.9, 16.9, total 53.3', () => {
    // Top at -26.65; centres at -26.65 + 9.75, -26.65 + 19.5 + 8.45, -26.65 + 36.4 + 8.45.
    expect(stackOffsets([15, 13, 13])).toEqual([-16.9, 1.3, 18.2]);
  });
});

describe('arrowHead', () => {
  it('points right: tip at `to`, base 8 back, 8 wide', () => {
    expect(arrowHead([0, 0], [100, 0])).toBe('100,0 92,4 92,-4');
  });

  it('points down', () => {
    expect(arrowHead([50, 0], [50, 40])).toBe('50,40 46,32 54,32');
  });

  it('points left and up', () => {
    expect(arrowHead([100, 0], [0, 0])).toBe('0,0 8,-4 8,4');
    expect(arrowHead([50, 40], [50, 0])).toBe('50,0 54,8 46,8');
  });

  it('points along a 3-4-5 diagonal, with a custom size', () => {
    // Unit vector (0.6, 0.8); base (30 - 6, 40 - 8) = (24, 32); half width 5 along (-0.8, 0.6).
    expect(arrowHead([0, 0], [30, 40], 10)).toBe('30,40 20,35 28,29');
  });

  it('only depends on the direction, not on the distance', () => {
    expect(arrowHead([90, 0], [100, 0])).toBe(arrowHead([0, 0], [100, 0]));
  });

  it('rejects a zero-length segment', () => {
    expect(() => arrowHead([5, 5], [5, 5])).toThrow();
  });
});

describe('pointBefore', () => {
  it('steps back from `to` along the segment', () => {
    expect(pointBefore([0, 0], [100, 0], 7)).toEqual([93, 0]);
    expect(pointBefore([0, 0], [30, 40], 5)).toEqual([27, 36]);
  });

  it('rejects a zero-length segment', () => {
    expect(() => pointBefore([1, 2], [1, 2], 3)).toThrow();
  });
});

describe('toLines', () => {
  it('makes one line of a string and keeps an array', () => {
    expect(toLines('Dữ liệu')).toEqual(['Dữ liệu']);
    expect(toLines(['Dữ liệu', '10 căn hộ'])).toEqual(['Dữ liệu', '10 căn hộ']);
  });
});

// --- Schematic plots (section 11.4.1, U3) ---

const BOX: PlotBox = { x: 10, y: 20, unit: 10, xDomain: [-1, 2], yDomain: [0, 3] };

describe('toView and plotSize', () => {
  it('maps the four corners of the domain, y up to y down', () => {
    expect(toView(BOX, [-1, 3])).toEqual([10, 20]);
    expect(toView(BOX, [2, 3])).toEqual([40, 20]);
    expect(toView(BOX, [-1, 0])).toEqual([10, 50]);
    expect(toView(BOX, [2, 0])).toEqual([40, 50]);
    expect(toView(BOX, [0.55, 1.23])).toEqual([25.5, 37.7]);
  });

  it('throws on a point outside the domain', () => {
    expect(() => toView(BOX, [2.1, 0])).toThrow(/outside the plot domain/);
    expect(() => toView(BOX, [0, -0.1])).toThrow(/outside the plot domain/);
  });

  it('gives the size of the plot area: one unit for both axes', () => {
    expect(plotSize(BOX)).toEqual({ width: 30, height: 30 });
    const panel: PlotBox = { x: 4, y: 28, unit: PLOT.unit, xDomain: PLOT.xDomain, yDomain: PLOT.yDomain };
    expect(plotSize(panel)).toEqual({ width: 167.2, height: 156.2 });
  });
});

describe('pointsAttr', () => {
  it('joins the view points', () => {
    expect(pointsAttr(BOX, [[-1, 3], [2, 0], [0, 1]])).toBe('10,20 40,50 20,40');
  });
});

describe('ellipseAttrs', () => {
  it('scales the semi-axes and flips the angle: −70° in data is rotate(70 …) in the viewBox', () => {
    const e: Ellipse = { centre: [0.5, 1.5], semiMajor: 1, semiMinor: 0.5, majorAngle: -70 };
    expect(ellipseAttrs(BOX, e)).toEqual({ cx: 25, cy: 35, rx: 10, ry: 5, transform: 'rotate(70 25 35)' });
    expect(ellipseAttrs(BOX, { ...e, majorAngle: 30 }).transform).toBe('rotate(-30 25 35)');
  });
});

describe('quadratic level curves', () => {
  const q: Quadratic = { centre: [1, 2], majorAngle: 90, axisRatio: 0.5 };

  it('f grows as d² along the major axis and as (d / axisRatio)² across it', () => {
    expect(quadraticValue(q, [1, 2])).toBe(0);
    expect(quadraticValue(q, [1, 5])).toBeCloseTo(9, 12); // along u = (0, 1)
    expect(quadraticValue(q, [2, 2])).toBeCloseTo(4, 12); // across: (1 / 0.5)²
  });

  it('∇f = 2A(w − c)', () => {
    const [gx, gy] = quadraticGradient(q, [2, 3]);
    expect(gx).toBeCloseTo(8, 12); // across: 2 · 1 / 0.25
    expect(gy).toBeCloseTo(2, 12); // along: 2 · 1
  });

  it('levelEllipse passes through the given point; scale 0.5 halves both semi-axes', () => {
    const tilted: Quadratic = { centre: [1.3, 0.8], majorAngle: -70, axisRatio: 0.4 };
    const through: Pt = [0.2, 1.1];
    const e = levelEllipse(tilted, through);
    const phi = (e.majorAngle * Math.PI) / 180;
    const d = [through[0] - e.centre[0], through[1] - e.centre[1]];
    const a = d[0] * Math.cos(phi) + d[1] * Math.sin(phi);
    const b = -d[0] * Math.sin(phi) + d[1] * Math.cos(phi);
    expect((a / e.semiMajor) ** 2 + (b / e.semiMinor) ** 2).toBeCloseTo(1, 12);
    const half = levelEllipse(tilted, through, 0.5);
    expect(half.semiMajor).toBeCloseTo(e.semiMajor / 2, 12);
    expect(half.semiMinor).toBeCloseTo(e.semiMinor / 2, 12);
    expect(e.semiMinor / e.semiMajor).toBeCloseTo(0.4, 12);
  });

  it('throws on the centre itself, a bad scale or a bad axis ratio', () => {
    expect(() => levelEllipse(q, [1, 2])).toThrow(/is the centre/);
    expect(() => levelEllipse(q, [1, 3], 0)).toThrow(/scale must be positive/);
    expect(() => quadraticValue({ ...q, axisRatio: 0 }, [0, 0])).toThrow(/axisRatio/);
  });
});

describe('checkMathLabel', () => {
  it('accepts a symbol, a subscript and a math tail', () => {
    expect(() => checkMathLabel('w', '1', '= 0')).not.toThrow();
    expect(() => checkMathLabel('θ')).not.toThrow();
    expect(() => checkMathLabel('x', 'ij', '≤ 1')).not.toThrow();
    expect(() => checkMathLabel('w', '2', '= −0.5')).not.toThrow();
  });

  it('rejects words', () => {
    expect(() => checkMathLabel('ab')).toThrow(/one Latin or Greek letter/);
    expect(() => checkMathLabel('1')).toThrow(/one Latin or Greek letter/);
    expect(() => checkMathLabel('w', '123')).toThrow(/1–2 digits or Latin letters/);
    expect(() => checkMathLabel('w', '1', 'and 0')).toThrow(/may hold only/);
    expect(() => checkMathLabel('w', '1', ' ')).toThrow(/may hold only/);
  });
});

// --- RegularizationGeometryFigure: the math of the picture (section 11.5 U4) ---

describe('RegularizationGeometryFigure: the touch points are the true ones', () => {
  const { loss, budget } = PLOT;
  const ridge = PLOT.ridgeTouch as Pt;
  const lasso = PLOT.lassoTouch as Pt;

  it('Ridge: the touch point is on the circle, with both weights clearly non-zero', () => {
    expect(Math.abs(Math.hypot(ridge[0], ridge[1]) - budget)).toBeLessThan(1e-3);
    expect(ridge[0]).toBeGreaterThanOrEqual(0.2);
    expect(ridge[1]).toBeGreaterThanOrEqual(0.2);
  });

  it('Ridge: −∇f there points along the touch point (the ellipse is tangent to the circle)', () => {
    const [gx, gy] = quadraticGradient(loss, ridge);
    const n: Pt = [-gx, -gy];
    const sine = Math.abs(n[0] * ridge[1] - n[1] * ridge[0]) / (Math.hypot(...n) * Math.hypot(...ridge));
    expect(sine).toBeLessThan(1e-3);
    expect(n[0] * ridge[0] + n[1] * ridge[1]).toBeGreaterThan(0);
  });

  it('Lasso: the touch point is the vertex (1, 0), and KKT holds there with room: |d2| / d1 ≤ 0.9', () => {
    expect(lasso).toEqual([budget, 0]);
    // d = A (c − e1) = −∇f(e1) / 2.
    const [gx, gy] = quadraticGradient(loss, lasso);
    const d = [-gx / 2, -gy / 2];
    expect(d[0]).toBeGreaterThan(0);
    expect(Math.abs(d[1]) / d[0]).toBeLessThanOrEqual(0.9);
  });

  it('the unpenalized solution lies outside both regions, in the first quadrant, nearer the w1 axis', () => {
    const [c1, c2] = loss.centre;
    expect(Math.hypot(c1, c2)).toBeGreaterThan(budget);
    expect(Math.abs(c1) + Math.abs(c2)).toBeGreaterThan(budget);
    expect(c1).toBeGreaterThan(c2);
    expect(c2).toBeGreaterThan(0);
  });

  it('every ellipse of both panels fits in the plot domain', () => {
    for (const touch of [ridge, lasso]) {
      for (const scale of PLOT.levelScales) {
        const e = levelEllipse(loss, touch, scale);
        const phi = (e.majorAngle * Math.PI) / 180;
        const halfWidth = Math.hypot(e.semiMajor * Math.cos(phi), e.semiMinor * Math.sin(phi));
        const halfHeight = Math.hypot(e.semiMajor * Math.sin(phi), e.semiMinor * Math.cos(phi));
        const [cx, cy] = e.centre;
        expect(cx - halfWidth).toBeGreaterThanOrEqual(PLOT.xDomain[0]);
        expect(cx + halfWidth).toBeLessThanOrEqual(PLOT.xDomain[1]);
        expect(cy - halfHeight).toBeGreaterThanOrEqual(PLOT.yDomain[0]);
        expect(cy + halfHeight).toBeLessThanOrEqual(PLOT.yDomain[1]);
      }
    }
  });

  it('the outermost ellipse of each panel passes through its touch point (levelScales ends at 1)', () => {
    expect(PLOT.levelScales.at(-1)).toBe(1);
    expect(levelEllipse(loss, ridge).semiMajor).toBeCloseTo(1.2665, 3);
    expect(levelEllipse(loss, lasso).semiMajor).toBeCloseTo(1.533, 3);
  });
});
