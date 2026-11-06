// Two digits drawn by hand as numbers for the CV VIZ (docs/architecture/cv-lessons.md, sections 1.1, 1.2).
// Made up for the lessons, not taken from MNIST, load_digits or any other dataset. Relative imports only:
// Playwright e2e may import this file.
import type { SliderSpec } from '../../lib/viz/linear-fit';
import type { KernelId } from '../../lib/viz/convolution';
import { DDPM_SCHEDULE, type LinearSchedule } from '../../lib/viz/diffusion';
import type { PixelImage } from './types';

/**
 * ConvolutionViz (cv/cnn-image-classification): a "4" on 8 × 8, values 0 (background) to 1 (ink), 0.5 at the stroke
 * ends. One-pixel strokes, upright and level, so the vertical and the horizontal edge kernels each find their own.
 */
export const DIGIT_FOUR_8 = {
  id: 'digit-four-8',
  lessons: ['cv/cnn-image-classification'],
  width: 8,
  height: 8,
  range: [0, 1],
  pixels: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0.5, 0, 0, 0.5, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0.5, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0.5, 0, 0],
  ],
  description: {
    vi: 'Ảnh 8 × 8 vẽ chữ số 4 bằng số: nền 0, nét 1, đầu nét 0.5. Hai nét đứng ở cột 2 và cột 5, một nét ngang ở hàng 4.',
    en: 'An 8 × 8 image of the digit 4 drawn as numbers: background 0, strokes 1, stroke ends 0.5. Two upright strokes in columns 2 and 5, one level stroke in row 4.',
  },
} as const satisfies PixelImage;

// '#' ink (1), '+' a soft edge (0), '.' background (−1): the [−1, 1] range a DDPM works in.
const DIGIT_THREE_ART = [
  '................',
  '................',
  '....+######+....',
  '...##########...',
  '...++.....+###..',
  '...........###..',
  '..........+##+..',
  '......#######...',
  '......#######...',
  '..........+##+..',
  '...........###..',
  '...++.....+###..',
  '...##########...',
  '....+######+....',
  '................',
  '................',
] as const;

const ART_VALUE: Readonly<Record<string, number>> = { '#': 1, '+': 0, '.': -1 };

/** DiffusionNoiseViz (cv/diffusion-models): a bold "3" on 16 × 16, values in [−1, 1]. */
export const DIGIT_THREE_16: PixelImage = {
  id: 'digit-three-16',
  lessons: ['cv/diffusion-models'],
  width: 16,
  height: 16,
  range: [-1, 1],
  pixels: DIGIT_THREE_ART.map((row) => [...row].map((char) => ART_VALUE[char] ?? Number.NaN)),
  description: {
    vi: 'Ảnh gốc 16 × 16 vẽ chữ số 3 đậm, giá trị từ −1 (nền) tới 1 (nét).',
    en: 'The clean 16 × 16 image: a bold digit 3, values from −1 (background) to 1 (stroke).',
  },
};

/** ConvolutionViz settings: the kernel shown first, and the window slider (output cells in reading order). */
export const DIGIT_FOUR_CONVOLUTION: { kernel: KernelId; position: SliderSpec } = {
  kernel: 'sobelVertical', // the lesson's NumPy cell uses this kernel
  position: { min: 0, max: 35, step: 1, initial: 0 }, // 6 × 6 cells; 0 is the top-left window
};

export interface DiffusionConfig {
  schedule: LinearSchedule;
  seed: number; // gaussianNoise(seed, width · height): one fixed ε for every t
  t: SliderSpec;
  digits: number; // decimals of √ᾱ_t and √(1 − ᾱ_t)
  chartStep: number; // one curve point every chartStep steps
  tTicks: readonly number[];
  coefTicks: readonly number[];
  mostlyNoise: number; // √ᾱ_t below this: the "almost pure noise" note
}

/** DiffusionNoiseViz settings. */
export const DIGIT_THREE_DIFFUSION: DiffusionConfig = {
  schedule: DDPM_SCHEDULE,
  seed: 2026, // the same ε at every t, so the reader sees the image sink into it
  // Starts part way, so without JavaScript the picture already shows image and noise mixed.
  t: { min: 0, max: 1000, step: 1, initial: 250 },
  digits: 3,
  chartStep: 10,
  tTicks: [0, 250, 500, 750, 1000],
  coefTicks: [0, 0.5, 1],
  mostlyNoise: 0.1,
};
