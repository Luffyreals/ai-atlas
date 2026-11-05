// ConvolutionViz math (docs/architecture/cv-lessons.md, section 1.1): worked examples by hand, the SciPy
// fixture (cross-correlation, no kernel flip), the fixed image and the slider settings.
import { describe, expect, it } from 'vitest';
import { DIGIT_FOUR_8, DIGIT_FOUR_CONVOLUTION } from '../../../src/data/datasets/pixel-digits';
import { formatNumber } from '../../../src/lib/viz/format';
import {
  KERNELS,
  cellOf,
  cellShade,
  crossCorrelate,
  getKernel,
  maxAbs,
  outputSize,
  sumTerms,
  weightInProduct,
  windowTerms,
} from '../../../src/lib/viz/convolution';
import { PYTHON_IMAGE, PYTHON_MAPS } from '../fixtures/cv-viz-python';

const X = DIGIT_FOUR_8.pixels;

describe('outputSize', () => {
  it('follows ⌊(n + 2p − k)/s⌋ + 1, as in the lesson', () => {
    expect(outputSize(8, 3)).toBe(6);
    expect(outputSize(8, 3, 1, 1)).toBe(8);
    expect(outputSize(8, 3, 0, 2)).toBe(3);
    expect(outputSize(8, 3, 1, 2)).toBe(4);
    expect(outputSize(3, 3)).toBe(1);
  });

  it('rejects a kernel larger than the padded image and bad arguments', () => {
    expect(() => outputSize(2, 3)).toThrow(RangeError);
    expect(() => outputSize(8, 3, -1)).toThrow(RangeError);
    expect(() => outputSize(8, 3, 0, 0)).toThrow(RangeError);
    expect(() => outputSize(8.5, 3)).toThrow(RangeError);
  });
});

describe('crossCorrelate (by hand)', () => {
  it('does not flip the kernel: an off-centre weight picks the pixel at the same offset', () => {
    const image = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    // Weight 1 at the top-left: cross-correlation gives X[0][0] = 1; a true convolution would give X[2][2] = 9.
    expect(crossCorrelate(image, [[1, 0, 0], [0, 0, 0], [0, 0, 0]])).toEqual([[1]]);
    expect(crossCorrelate(image, [[0, 0, 0], [0, 0, 0], [0, 0, 1]])).toEqual([[9]]);
  });

  it('slides with stride 1 and adds the nine products', () => {
    const image = [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, 15],
    ];
    const ones = [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ];
    expect(crossCorrelate(image, ones)).toEqual([
      [45, 54],
      [81, 90],
    ]);
  });

  it('rejects ragged or non-finite grids', () => {
    expect(() => crossCorrelate([[1, 2], [3]], [[1]])).toThrow(RangeError);
    expect(() => crossCorrelate([[1, Number.NaN]], [[1]])).toThrow(RangeError);
    expect(() => crossCorrelate([], [[1]])).toThrow(RangeError);
  });
});

describe('windowTerms', () => {
  it('lists the 9 products row by row, and their sum is the output cell', () => {
    const k = getKernel('vertical').weights;
    const terms = windowTerms(X, k, 2, 1);
    expect(terms).toHaveLength(9);
    expect(terms.map((t) => [t.u, t.v])).toEqual([
      [0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2],
    ]);
    // Window rows 2–4, columns 1–3 of the "4": the left stroke sits in the middle column (weight 0).
    expect(terms.map((t) => t.x)).toEqual([0, 1, 0, 0, 1, 0, 0, 1, 1]);
    expect(sumTerms(terms)).toBe(-1);
  });

  it('rejects a cell outside the 6 × 6 output', () => {
    const k = getKernel('identity').weights;
    expect(() => windowTerms(X, k, 6, 0)).toThrow(RangeError);
    expect(() => windowTerms(X, k, 0, -1)).toThrow(RangeError);
  });
});

describe('the four kernels on DIGIT_FOUR_8 against SciPy correlate2d', () => {
  it('uses the image the fixture was computed from', () => {
    expect(X).toEqual(PYTHON_IMAGE);
  });

  it.each(KERNELS.map((k) => [k.id, k] as const))('%s matches to 1e-12', (id, kernel) => {
    const map = crossCorrelate(X, kernel.weights);
    const expected = PYTHON_MAPS[id];
    expect(map).toHaveLength(6);
    map.forEach((row, i) => {
      expect(row).toHaveLength(6);
      row.forEach((v, j) => expect(Math.abs(v - (expected[i]?.[j] ?? Number.NaN))).toBeLessThan(1e-12));
    });
  });

  it('identity gives the middle of the image back', () => {
    const map = crossCorrelate(X, getKernel('identity').weights);
    expect(map).toEqual(X.slice(1, 7).map((row) => row.slice(1, 7)));
  });

  it('the edge kernels give both signs, up to ±3; identity and blur stay in [0, 1]', () => {
    for (const kernel of KERNELS) {
      const values = crossCorrelate(X, kernel.weights).flat();
      if (kernel.diverging) {
        expect(Math.min(...values)).toBeLessThan(0);
        expect(Math.max(...values)).toBeGreaterThan(0);
        expect(maxAbs(crossCorrelate(X, kernel.weights))).toBe(3);
      } else {
        expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...values)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('every weight label reads as its weight, and blur weights add up to 1', () => {
    for (const kernel of KERNELS) {
      kernel.weights.forEach((row, u) =>
        row.forEach((w, v) => {
          const label = (kernel.labels[u]?.[v] ?? '').replace('−', '-');
          const value = label === '1/9' ? 1 / 9 : Number(label);
          expect(value).toBe(w);
        }),
      );
    }
    expect(sumTerms(windowTerms([[1, 1, 1], [1, 1, 1], [1, 1, 1]], getKernel('blur').weights, 0, 0))).toBeCloseTo(1, 15);
  });

  it('vertical is the lesson kernel [[1, 0, −1]] × 3 and horizontal its transpose', () => {
    const v = getKernel('vertical').weights;
    const h = getKernel('horizontal').weights;
    expect(v).toEqual([[1, 0, -1], [1, 0, -1], [1, 0, -1]]);
    expect(h).toEqual(v.map((_, r) => v.map((row) => row[r])));
  });
});

describe('display helpers', () => {
  it('cellOf walks the 6 × 6 output in reading order', () => {
    expect(cellOf(0, 6)).toEqual({ i: 0, j: 0 });
    expect(cellOf(5, 6)).toEqual({ i: 0, j: 5 });
    expect(cellOf(6, 6)).toEqual({ i: 1, j: 0 });
    expect(cellOf(35, 6)).toEqual({ i: 5, j: 5 });
  });

  it('cellShade: grey scale for one sign, scaled |value| and a sign for diverging maps', () => {
    expect(cellShade(0.5, false, 3)).toEqual({ opacity: '0.50', sign: '' });
    expect(cellShade(1.2, false, 3)).toEqual({ opacity: '1.00', sign: '' });
    expect(cellShade(-1.5, true, 3)).toEqual({ opacity: '0.50', sign: '-' });
    expect(cellShade(3, true, 3)).toEqual({ opacity: '1.00', sign: '+' });
    expect(cellShade(0, true, 3)).toEqual({ opacity: '0.00', sign: '' });
    expect(cellShade(1, true, 0)).toEqual({ opacity: '0.00', sign: '' });
  });

  it('weightInProduct brackets negative weights only', () => {
    expect(weightInProduct('−1')).toBe('(−1)');
    expect(weightInProduct('1/9')).toBe('1/9');
  });

  it('the shown sum has the kernel digits: −1.5 at the first window of the vertical kernel', () => {
    const kernel = getKernel(DIGIT_FOUR_CONVOLUTION.kernel);
    const { i, j } = cellOf(DIGIT_FOUR_CONVOLUTION.position.initial, 6);
    expect(formatNumber(sumTerms(windowTerms(X, kernel.weights, i, j)), kernel.digits)).toBe('−1.5');
  });

  it('the slider covers exactly the 36 output cells', () => {
    const p = DIGIT_FOUR_CONVOLUTION.position;
    expect([p.min, p.max, p.step]).toEqual([0, 35, 1]);
    expect(p.initial).toBeGreaterThanOrEqual(p.min);
    expect(p.initial).toBeLessThanOrEqual(p.max);
  });
});

describe('DIGIT_FOUR_8', () => {
  it('is 8 × 8 with values in its range, one decimal at most', () => {
    expect(X).toHaveLength(DIGIT_FOUR_8.height);
    for (const row of X) {
      expect(row).toHaveLength(DIGIT_FOUR_8.width);
      for (const v of row) {
        expect(v).toBeGreaterThanOrEqual(DIGIT_FOUR_8.range[0]);
        expect(v).toBeLessThanOrEqual(DIGIT_FOUR_8.range[1]);
        expect(Number(v.toFixed(1))).toBe(v);
      }
    }
  });
});
