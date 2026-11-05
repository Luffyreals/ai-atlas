// 2D convolution for ConvolutionViz (docs/architecture/viz/convolution.md): the image and kernels of the
// lesson dl/cnn, worked examples by hand, the NumPy fixture, and the fill of a signed cell.
import { describe, expect, it } from 'vitest';
import {
  CONV_IMAGE,
  CONV_KERNELS,
  CONV_START,
  FILL_MAX,
  KERNEL_IDS,
  crossCorrelate,
  isBright,
  maxAbs,
  outputSize,
  productsAt,
  signedFill,
  valueAt,
  windowAt,
} from '../../../src/lib/viz/convolution';
import { formatNumber } from '../../../src/lib/viz/format';
import { PYTHON_FEATURE_MAPS, PYTHON_IMAGE } from '../fixtures/convolution-python';

const X = CONV_IMAGE;
const K = (id: keyof typeof CONV_KERNELS) => CONV_KERNELS[id].weights;

describe('the image and kernels of the lesson', () => {
  it('the image is the fixture image (rerun the command in convolution-python.ts if it changed)', () => {
    expect(X).toEqual(PYTHON_IMAGE);
  });

  it('every kernel is 3 x 3, keyed by its id, in the order of KERNEL_IDS', () => {
    expect(Object.keys(CONV_KERNELS)).toEqual([...KERNEL_IDS]);
    for (const id of KERNEL_IDS) {
      expect(CONV_KERNELS[id].id).toBe(id);
      expect(K(id)).toHaveLength(3);
      for (const row of K(id)) expect(row).toHaveLength(3);
    }
  });

  it('the kernels are the ones of the lesson', () => {
    expect(K('sharpen')).toEqual([
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ]);
    expect(K('sobelVertical')).toEqual([
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ]);
    expect(K('sobelHorizontal')).toEqual([
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ]);
    // Blur: 1/9 everywhere, so its weights add up to 1 (a flat area keeps its value).
    expect(K('blur').flat().reduce((a, b) => a + b, 0)).toBeCloseTo(1, 15);
    expect(CONV_KERNELS.blur.weightLabel).toBe('1/9');
  });

  it('starts on a window whose sum is not 0', () => {
    expect(valueAt(X, K(CONV_START.kernel), CONV_START.row, CONV_START.col)).toBe(27);
  });
});

describe('cross-correlation, valid, stride 1 (by hand)', () => {
  it('an 8 x 8 image and a 3 x 3 kernel give 6 x 6; a 2 x 2 one gives 7 x 7', () => {
    expect(outputSize(X, K('identity'))).toEqual({ rows: 6, cols: 6 });
    expect(outputSize(X, [[1, 1], [1, 1]])).toEqual({ rows: 7, cols: 7 });
  });

  it('does not flip the kernel: an asymmetric kernel picks the pixel at its own 1', () => {
    const image = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    // A 1 at the top left of the kernel reads X[i, j]; a flipped kernel (true convolution) would read X[i + 1, j + 1].
    expect(crossCorrelate(image, [[1, 0], [0, 0]])).toEqual([
      [1, 2],
      [4, 5],
    ]);
    expect(crossCorrelate(image, [[1, 2], [3, 4]])).toEqual([
      [1 * 1 + 2 * 2 + 4 * 3 + 5 * 4, 2 * 1 + 3 * 2 + 5 * 3 + 6 * 4],
      [4 * 1 + 5 * 2 + 7 * 3 + 8 * 4, 5 * 1 + 6 * 2 + 8 * 3 + 9 * 4],
    ]);
  });

  it('the window at (i, j) is X[i..i+2, j..j+2], and the products are cell by cell', () => {
    expect(windowAt(X, K('sobelVertical'), 1, 1)).toEqual([
      [0, 0, 0],
      [0, 9, 9],
      [0, 9, 9],
    ]);
    expect(productsAt(X, K('sobelVertical'), 1, 1)).toEqual([
      [-0, 0, 0],
      [-0, 0, 18],
      [-0, 0, 9],
    ]);
    expect(productsAt(X, K('sobelVertical'), 1, 1).flat().reduce((a, b) => a + b, 0)).toBe(27);
  });

  it('identity gives back the middle 6 x 6 of the image', () => {
    expect(crossCorrelate(X, K('identity'))).toEqual(X.slice(1, 7).map((row) => row.slice(1, 7)));
  });

  it('Sobel vertical: + on the left edge of the square, − on the right, 0 inside and in each row the mirror', () => {
    const Y = crossCorrelate(X, K('sobelVertical'));
    expect(Y[2]?.[0]).toBe(36);
    expect(Y[2]?.[5]).toBe(-36);
    expect(Y[1]?.[1]).toBe(27);
    expect(Y[0]?.[0]).toBe(9);
    for (const row of Y) {
      expect(row[2]).toBe(0);
      expect(row[3]).toBe(0);
      // Antisymmetric left to right: Y[i, j] = −Y[i, 5 − j].
      row.forEach((v, j) => expect(v + (row[5 - j] ?? NaN)).toBe(0));
    }
  });

  it('Sobel horizontal is Sobel vertical turned: + on the top edge, − on the bottom edge', () => {
    const V = crossCorrelate(X, K('sobelVertical'));
    const H = crossCorrelate(X, K('sobelHorizontal'));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) expect(H[i]?.[j]).toBe(V[j]?.[i]);
    expect(H[0]?.[2]).toBe(36);
    expect(H[5]?.[2]).toBe(-36);
  });

  it('sharpen: 27 at a corner of the square, 18 on an edge, 9 inside, −9 just outside', () => {
    const Y = crossCorrelate(X, K('sharpen'));
    expect(Y[1]?.[1]).toBe(27);
    expect(Y[1]?.[2]).toBe(18);
    expect(Y[2]?.[2]).toBe(9);
    expect(Y[0]?.[1]).toBe(-9);
    expect(Y[0]?.[0]).toBe(0);
  });

  it('blur: each cell is the number of 9s under the window (9 × count / 9), shown with 2 decimals', () => {
    const Y = crossCorrelate(X, K('blur'));
    expect(Y[0]?.[0]).toBeCloseTo(1, 12);
    expect(Y[2]?.[2]).toBeCloseTo(9, 12);
    expect(formatNumber(Y[1]?.[2] ?? NaN, CONV_KERNELS.blur.digits)).toBe('6.00');
  });

  it('refuses a window outside the output and a ragged matrix', () => {
    expect(() => windowAt(X, K('blur'), 6, 0)).toThrow(RangeError);
    expect(() => windowAt(X, K('blur'), 0, -1)).toThrow(RangeError);
    expect(() => windowAt(X, K('blur'), 0.5, 0)).toThrow(RangeError);
    expect(() => crossCorrelate([[1, 2], [3]], [[1]])).toThrow(RangeError);
    expect(() => crossCorrelate([[1]], [[1, 1], [1, 1]])).toThrow(RangeError);
  });
});

describe('the five feature maps match NumPy', () => {
  it.each(KERNEL_IDS)('%s', (id) => {
    const Y = crossCorrelate(X, K(id));
    const expected = PYTHON_FEATURE_MAPS[id];
    expect(Y).toHaveLength(6);
    Y.forEach((row, i) => row.forEach((v, j) => expect(v).toBeCloseTo(expected[i]?.[j] ?? NaN, 10)));
    // What the VIZ shows: the same text as NumPy's numbers at the kernel's decimals.
    const shown = (m: readonly (readonly number[])[]) => m.map((r) => r.map((v) => formatNumber(v, CONV_KERNELS[id].digits)));
    expect(shown(Y)).toEqual(shown(expected));
  });

  it('largest |value| per kernel (the colour scale)', () => {
    const scale = Object.fromEntries(KERNEL_IDS.map((id) => [id, Math.round(maxAbs(crossCorrelate(X, K(id))))]));
    expect(scale).toEqual({ identity: 9, blur: 9, sharpen: 27, sobelVertical: 36, sobelHorizontal: 36 });
  });
});

describe('signedFill and isBright', () => {
  it('maps |value| / scale to an opacity up to FILL_MAX, by sign; nothing for 0', () => {
    expect(signedFill(36, 36)).toEqual({ sign: 'pos', opacity: FILL_MAX.toFixed(2) });
    expect(signedFill(-18, 36)).toEqual({ sign: 'neg', opacity: (FILL_MAX / 2).toFixed(2) });
    expect(signedFill(0, 36)).toBeNull();
    expect(signedFill(-0, 36)).toBeNull();
    expect(signedFill(5, 0)).toBeNull();
    // Above the scale (a product larger than the map's largest value) stays at FILL_MAX.
    expect(signedFill(100, 36)?.opacity).toBe(FILL_MAX.toFixed(2));
    expect(() => signedFill(NaN, 1)).toThrow(RangeError);
  });

  it('keeps the strongest fill at most 0.45, the limit for 4.5:1 text measured in convolution.md', () => {
    expect(FILL_MAX).toBeLessThanOrEqual(0.45);
  });

  it('draws 9 in ink and 0 on the background', () => {
    expect(isBright(9)).toBe(true);
    expect(isBright(0)).toBe(false);
  });
});
