// Box-and-arrow layout helpers of static figures (docs/architecture/llm-lessons.md, section 2.9.1): boxes as
// plain objects that spread straight into <FigNode {...box}>, the points arrows start and end at, and a
// [main, small...] label split. Pure functions, no DOM; viewBox units, rounded with round1.
// Relative imports only: Playwright e2e may import this file too, and it does not know the @lib/* alias.
import type { Lines } from '../../data/figures/types';
import { round1, toLines, type Pt } from './geometry';

/** A box in viewBox units; spreads into <FigNode {...box} />. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Side = 'top' | 'bottom' | 'left' | 'right';

/**
 * The point on one side of a box where an arrow starts or ends. `at` runs along that side, 0 to 1: left to
 * right on top and bottom, top to bottom on left and right; 0.5 is the middle.
 */
export function anchor(box: Box, side: Side, at: number = 0.5): Pt {
  if (!(at >= 0 && at <= 1)) throw new Error(`anchor: at must be in [0, 1], got ${at}.`);
  const { x, y, width, height } = box;
  switch (side) {
    case 'top':
      return [round1(x + width * at), y];
    case 'bottom':
      return [round1(x + width * at), round1(y + height)];
    case 'left':
      return [x, round1(y + height * at)];
    case 'right':
      return [round1(x + width), round1(y + height * at)];
  }
}

/** Centre of a box. */
export function centre(box: Box): Pt {
  return [round1(box.x + box.width / 2), round1(box.y + box.height / 2)];
}

/**
 * Starts of `count` equal slots filling [from, to] with `gap` between them, and the slot size: the columns of
 * a row of boxes, or the rows of a column. Example: spread(8, 352, 3, 16) → starts 8, 128, 248, size 104.
 */
export function spread(from: number, to: number, count: number, gap: number): { starts: number[]; size: number } {
  if (!Number.isInteger(count) || count < 1) throw new Error(`spread: count must be a positive integer, got ${count}.`);
  const size = (to - from - gap * (count - 1)) / count;
  if (!(size > 0)) throw new Error(`spread: ${count} slots with gap ${gap} do not fit in [${from}, ${to}].`);
  return { starts: Array.from({ length: count }, (_, i) => round1(from + i * (size + gap))), size: round1(size) };
}

/**
 * Starts and sizes of slots filling [from, to] with `gap` between them, each as wide as its share of
 * `weights`: a row of boxes whose words differ in length (llm-lessons.md 2.9.2). Example:
 * spreadByWeight(0, 108, [1, 2], 0) → starts 0, 36, sizes 36, 72.
 */
export function spreadByWeight(
  from: number,
  to: number,
  weights: readonly number[],
  gap: number,
): { starts: number[]; sizes: number[] } {
  if (weights.length === 0 || weights.some((w) => !(w > 0))) {
    throw new Error(`spreadByWeight: weights must be positive numbers, got [${weights.join(', ')}].`);
  }
  const room = to - from - gap * (weights.length - 1);
  if (!(room > 0)) throw new Error(`spreadByWeight: ${weights.length} slots with gap ${gap} do not fit in [${from}, ${to}].`);
  const total = weights.reduce((sum, w) => sum + w, 0);
  const starts: number[] = [];
  const sizes: number[] = [];
  let at = from;
  for (const w of weights) {
    const size = (room * w) / total;
    starts.push(round1(at));
    sizes.push(round1(size));
    at += size + gap;
  }
  return { starts, sizes };
}

/**
 * A label as FigNode props: the first line is the main (bold) line, the rest are small lines. A one-line
 * label has no small lines. Use it for words files that write a box as [main, small...].
 */
export function mainAndSmall(label: Lines): { lines: string; small: readonly string[] } {
  const [main = '', ...small] = toLines(label);
  return { lines: main, small };
}

/**
 * A closed outline of a regular `count`-gon centred on (cx, cy), first corner straight up, as FigArrow props
 * with no head (cv-lessons.md 4): a circle drawn in a thumbnail (count 16) or a triangle (count 3). A polyline,
 * not a <circle>, so e2e measures it as a .atlas-fig-arrow (llm-lessons.md 2.9.1).
 */
export function ring(cx: number, cy: number, radius: number, count: number): { from: Pt; via: Pt[]; to: Pt } {
  if (!Number.isInteger(count) || count < 3) throw new Error(`ring: count must be an integer ≥ 3, got ${count}.`);
  if (!(radius > 0)) throw new Error(`ring: radius must be positive, got ${radius}.`);
  const points = Array.from({ length: count }, (_, i): Pt => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / count;
    return [round1(cx + radius * Math.cos(angle)), round1(cy + radius * Math.sin(angle))];
  });
  return { from: points[0]!, via: points.slice(1), to: points[0]! };
}

/** A closed outline through `points` (at least 3), as FigArrow props with no head: a frame or a drawn shape. */
export function closed(points: readonly Pt[]): { from: Pt; via: Pt[]; to: Pt } {
  if (points.length < 3) throw new Error(`closed: needs at least 3 points, got ${points.length}.`);
  return { from: points[0]!, via: points.slice(1), to: points[0]! };
}
