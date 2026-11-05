// 2D convolution for ConvolutionViz (docs/architecture/cv-lessons.md, section 1.1). Pure, relative imports only.
// "Convolution" in a CNN is cross-correlation: the kernel is NOT flipped, out[i][j] = Σ_u Σ_v X[i+u][j+v] · K[u][v],
// the same as torch.nn.Conv2d, scipy.signal.correlate2d(mode="valid") and the NumPy loop of the lesson.
// Padding 0, stride 1: an n × n image and a k × k kernel give (n − k) + 1 rows and columns.
import { MINUS } from './format';

export type Grid = readonly (readonly number[])[];

export type KernelId = 'identity' | 'blur' | 'vertical' | 'horizontal';

export interface Kernel {
  id: KernelId; // also the i18n key of its button (vizConvolution.<id>)
  weights: Grid; // 3 × 3, row 0 at the top
  labels: readonly (readonly string[])[]; // how each weight is written: '1/9' rather than 0.111…; U+2212 minus
  diverging: boolean; // the output has both signs: drawn with two colours (positive, negative)
  digits: number; // decimals of the output numbers
}

const NINTH = 1 / 9;

/** The four kernels, in button order. vertical is the lesson's K = [[1, 0, −1]] × 3; horizontal is its transpose. */
export const KERNELS: readonly Kernel[] = [
  {
    id: 'identity',
    weights: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    labels: [
      ['0', '0', '0'],
      ['0', '1', '0'],
      ['0', '0', '0'],
    ],
    diverging: false,
    digits: 1,
  },
  {
    id: 'blur',
    weights: [
      [NINTH, NINTH, NINTH],
      [NINTH, NINTH, NINTH],
      [NINTH, NINTH, NINTH],
    ],
    labels: [
      ['1/9', '1/9', '1/9'],
      ['1/9', '1/9', '1/9'],
      ['1/9', '1/9', '1/9'],
    ],
    diverging: false,
    digits: 2,
  },
  {
    id: 'vertical',
    weights: [
      [1, 0, -1],
      [1, 0, -1],
      [1, 0, -1],
    ],
    labels: [
      ['1', '0', `${MINUS}1`],
      ['1', '0', `${MINUS}1`],
      ['1', '0', `${MINUS}1`],
    ],
    diverging: true,
    digits: 1,
  },
  {
    id: 'horizontal',
    weights: [
      [1, 1, 1],
      [0, 0, 0],
      [-1, -1, -1],
    ],
    labels: [
      ['1', '1', '1'],
      ['0', '0', '0'],
      [`${MINUS}1`, `${MINUS}1`, `${MINUS}1`],
    ],
    diverging: true,
    digits: 1,
  },
];

export function getKernel(id: KernelId): Kernel {
  const kernel = KERNELS.find((k) => k.id === id);
  if (!kernel) throw new RangeError(`getKernel: no kernel "${id}"`);
  return kernel;
}

/** ⌊(n + 2p − k) / s⌋ + 1, the lesson's output size along one side. */
export function outputSize(n: number, k: number, p = 0, s = 1): number {
  if (![n, k, p, s].every(Number.isInteger) || n < 1 || k < 1 || p < 0 || s < 1) {
    throw new RangeError(`outputSize: needs integers n, k, s >= 1 and p >= 0, got n=${n} k=${k} p=${p} s=${s}`);
  }
  if (n + 2 * p < k) throw new RangeError(`outputSize: a ${k} × ${k} kernel does not fit in ${n + 2 * p}`);
  return Math.floor((n + 2 * p - k) / s) + 1;
}

function checkGrid(name: string, grid: Grid): { rows: number; cols: number } {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (rows === 0 || cols === 0) throw new RangeError(`${name}: empty grid`);
  grid.forEach((row, r) => {
    if (row.length !== cols) throw new RangeError(`${name}: row ${r} has ${row.length} values, not ${cols}`);
    row.forEach((v, c) => {
      if (!Number.isFinite(v)) throw new RangeError(`${name}: value at (${r}, ${c}) is ${v}`);
    });
  });
  return { rows, cols };
}

/** One product of the window: the pixel, the weight, and where they sit in the kernel. */
export interface Term {
  u: number; // kernel row
  v: number; // kernel column
  x: number; // X[i + u][j + v]
  k: number; // K[u][v]
}

/** The k × k products at output cell (i, j), row by row. Their sum is out[i][j]. */
export function windowTerms(image: Grid, kernel: Grid, i: number, j: number): Term[] {
  const img = checkGrid('windowTerms (image)', image);
  const ker = checkGrid('windowTerms (kernel)', kernel);
  const outRows = outputSize(img.rows, ker.rows);
  const outCols = outputSize(img.cols, ker.cols);
  if (!Number.isInteger(i) || !Number.isInteger(j) || i < 0 || j < 0 || i >= outRows || j >= outCols) {
    throw new RangeError(`windowTerms: (${i}, ${j}) is outside the ${outRows} × ${outCols} output`);
  }
  const terms: Term[] = [];
  for (let u = 0; u < ker.rows; u++) {
    for (let v = 0; v < ker.cols; v++) {
      terms.push({ u, v, x: image[i + u]?.[j + v] ?? 0, k: kernel[u]?.[v] ?? 0 });
    }
  }
  return terms;
}

/** Σ x · k, added in row order (the order the VIZ writes them). */
export function sumTerms(terms: readonly Term[]): number {
  return terms.reduce((sum, t) => sum + t.x * t.k, 0);
}

/** Valid cross-correlation, stride 1, padding 0 (see the file comment). */
export function crossCorrelate(image: Grid, kernel: Grid): number[][] {
  const img = checkGrid('crossCorrelate (image)', image);
  const ker = checkGrid('crossCorrelate (kernel)', kernel);
  const rows = outputSize(img.rows, ker.rows);
  const cols = outputSize(img.cols, ker.cols);
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => sumTerms(windowTerms(image, kernel, i, j))),
  );
}

/** Slider index → output cell, in reading order: 0 is (0, 0), cols is (1, 0). */
export function cellOf(index: number, cols: number): { i: number; j: number } {
  if (!Number.isInteger(index) || index < 0 || !Number.isInteger(cols) || cols < 1) {
    throw new RangeError(`cellOf: index ${index}, cols ${cols}`);
  }
  return { i: Math.floor(index / cols), j: index % cols };
}

/** Largest |value| of a map; 0 for a map of zeros. */
export function maxAbs(map: Grid): number {
  return map.reduce((m, row) => row.reduce((n, v) => Math.max(n, Math.abs(v)), m), 0);
}

/**
 * How a cell is drawn. A one-sign map uses the image's grey scale (opacity = value, clipped to [0, 1]), so
 * identity and blur stay comparable with the input; a diverging map scales |value| by the map's largest |value|
 * and gives the sign, drawn in two colours. Opacity as a 2-decimal string: the same at build and after hydration.
 */
export function cellShade(value: number, diverging: boolean, scale: number): { opacity: string; sign: '+' | '-' | '' } {
  if (!Number.isFinite(value)) throw new RangeError(`cellShade: ${value}`);
  if (!diverging) return { opacity: Math.min(1, Math.max(0, value)).toFixed(2), sign: '' };
  const a = scale > 0 ? Math.min(1, Math.abs(value) / scale) : 0;
  const opacity = a.toFixed(2);
  return { opacity, sign: opacity === '0.00' ? '' : value > 0 ? '+' : '-' };
}

/** A weight inside a product: negative ones in brackets, "1.0 × (−1)". */
export function weightInProduct(label: string): string {
  return label.startsWith(MINUS) ? `(${label})` : label;
}
