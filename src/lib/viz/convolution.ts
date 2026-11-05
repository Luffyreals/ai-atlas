// 2D convolution for ConvolutionViz (docs/architecture/viz/convolution.md). Pure: no DOM, no React.
// Notation of the lesson dl/cnn: image X, kernel K of size k, padding p, stride s. What deep learning calls
// "convolution" is a cross-correlation (the kernel is not flipped, as in PyTorch's conv2d):
//   Y[i, j] = sum over u, v in 0..k-1 of X[i + u, j + v] * K[u, v]
// "valid" (p = 0), stride s = 1, indices from 0 as in NumPy. An 8 x 8 image and a 3 x 3 kernel give 6 x 6.
// The image and the five kernels live here, once: the VIZ, its tests and (later) a test of the lesson's
// Python file all read them from this file. Relative imports only: Playwright e2e may import this file.

export type Matrix = readonly (readonly number[])[];

/** The 8 x 8 grey image of the lesson: background 0, a 4 x 4 square of 9 in rows 2–5, columns 2–5. */
export const CONV_IMAGE: Matrix = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 9, 9, 9, 9, 0, 0],
  [0, 0, 9, 9, 9, 9, 0, 0],
  [0, 0, 9, 9, 9, 9, 0, 0],
  [0, 0, 9, 9, 9, 9, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

/** Largest value a pixel of CONV_IMAGE may take: the grey of a cell is value / CONV_IMAGE_MAX. */
export const CONV_IMAGE_MAX = 9;

export const KERNEL_IDS = ['identity', 'blur', 'sharpen', 'sobelVertical', 'sobelHorizontal'] as const;
export type KernelId = (typeof KERNEL_IDS)[number];

export interface ConvKernel {
  id: KernelId;
  weights: Matrix; // 3 x 3, row by row
  /** How a weight is written, when not by formatNumber (the box blur shows "1/9", not "0.11"). */
  weightLabel?: string;
  digits: number; // decimals of the products, sums and feature map (formatNumber)
}

const BLUR = 1 / 9;

export const CONV_KERNELS: Record<KernelId, ConvKernel> = {
  identity: {
    id: 'identity',
    weights: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    digits: 0,
  },
  blur: {
    id: 'blur',
    weights: [
      [BLUR, BLUR, BLUR],
      [BLUR, BLUR, BLUR],
      [BLUR, BLUR, BLUR],
    ],
    weightLabel: '1/9',
    digits: 2,
  },
  sharpen: {
    id: 'sharpen',
    weights: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
    digits: 0,
  },
  sobelVertical: {
    id: 'sobelVertical',
    weights: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
    digits: 0,
  },
  sobelHorizontal: {
    id: 'sobelHorizontal',
    weights: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ],
    digits: 0,
  },
};

/** The kernel and window the VIZ opens with: Sobel vertical over rows 1–3, columns 1–3 (sum 27). */
export const CONV_START: { kernel: KernelId; row: number; col: number } = { kernel: 'sobelVertical', row: 1, col: 1 };

function checkMatrix(m: Matrix, what: string): { rows: number; cols: number } {
  const rows = m.length;
  const cols = m[0]?.length ?? 0;
  if (rows === 0 || cols === 0) throw new RangeError(`${what}: empty matrix`);
  for (const row of m) {
    if (row.length !== cols) throw new RangeError(`${what}: rows of different lengths`);
    for (const v of row) if (!Number.isFinite(v)) throw new RangeError(`${what}: ${v} is not a finite number`);
  }
  return { rows, cols };
}

/** Output size of a "valid" cross-correlation with stride 1: (n - k + 1) per side. */
export function outputSize(image: Matrix, kernel: Matrix): { rows: number; cols: number } {
  const x = checkMatrix(image, 'image');
  const k = checkMatrix(kernel, 'kernel');
  if (k.rows > x.rows || k.cols > x.cols) throw new RangeError('kernel larger than the image');
  return { rows: x.rows - k.rows + 1, cols: x.cols - k.cols + 1 };
}

/** The window of the image under the kernel at output cell (i, j): X[i..i+k-1, j..j+k-1]. */
export function windowAt(image: Matrix, kernel: Matrix, i: number, j: number): number[][] {
  const out = outputSize(image, kernel);
  if (!Number.isInteger(i) || !Number.isInteger(j) || i < 0 || j < 0 || i >= out.rows || j >= out.cols) {
    throw new RangeError(`windowAt: (${i}, ${j}) is outside the ${out.rows} x ${out.cols} output`);
  }
  return kernel.map((row, u) => row.map((_, v) => image[i + u]![j + v]!));
}

/** The k x k products X[i + u, j + v] * K[u, v] at output cell (i, j). */
export function productsAt(image: Matrix, kernel: Matrix, i: number, j: number): number[][] {
  return windowAt(image, kernel, i, j).map((row, u) => row.map((x, v) => x * kernel[u]![v]!));
}

/** Y[i, j]: the products at (i, j) added row by row, left to right (the order of the lesson's loop). */
export function valueAt(image: Matrix, kernel: Matrix, i: number, j: number): number {
  let sum = 0;
  for (const row of productsAt(image, kernel, i, j)) for (const p of row) sum += p;
  return sum;
}

/** The whole feature map: "valid" cross-correlation, stride 1, kernel not flipped. */
export function crossCorrelate(image: Matrix, kernel: Matrix): number[][] {
  const { rows, cols } = outputSize(image, kernel);
  return Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => valueAt(image, kernel, i, j)));
}

/** Largest |value| of a matrix; the colour scale of the feature map runs from -maxAbs to +maxAbs. */
export function maxAbs(m: Matrix): number {
  let best = 0;
  for (const row of m) for (const v of row) best = Math.max(best, Math.abs(v));
  return best;
}

/** Strongest fill of a signed cell: the cell's text (ink) keeps 4.5:1 on it in both themes (convolution.md). */
export const FILL_MAX = 0.45;

export type FillSign = 'pos' | 'neg';

/**
 * The fill of a signed cell (feature map, kernel weight, product): its sign picks the colour, |value| / scale
 * its opacity, from 0 up to FILL_MAX. null for 0 (no fill). Opacity as a fixed 2-decimal string, so the build
 * HTML and the first render in the browser match.
 */
export function signedFill(value: number, scale: number): { sign: FillSign; opacity: string } | null {
  if (!Number.isFinite(value) || !Number.isFinite(scale)) throw new RangeError('signedFill: not a finite number');
  if (value === 0 || scale <= 0) return null;
  const t = Math.min(Math.abs(value) / scale, 1);
  return { sign: value > 0 ? 'pos' : 'neg', opacity: (t * FILL_MAX).toFixed(2) };
}

/** A pixel of the image is drawn in ink when it is at least half the brightest value (0 and 9 here). */
export function isBright(value: number, max: number = CONV_IMAGE_MAX): boolean {
  return value >= max / 2;
}
