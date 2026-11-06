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
 * One polyline through every line of an n × n grid of square cells (top-left x, y; side `cell`): the outer
 * border, then the inner columns as a serpentine, then the inner rows (docs/architecture/nlp-lessons.md, "Lô FIG
 * NLP"). Some border pieces are drawn twice, which does not show. One <polyline> instead of 2n + 2 lines keeps
 * a grid within the HTML budget, and FigArrow (head={false}) draws it, so the e2e contrast check measures it.
 */
export function gridLines(x: number, y: number, cell: number, n: number): Pt[] {
  if (!Number.isInteger(n) || n < 1) throw new Error(`gridLines: n must be a positive integer, got ${n}.`);
  const at = (i: number, j: number): Pt => [round1(x + i * cell), round1(y + j * cell)];
  const points: Pt[] = [at(0, 0), at(0, n), at(n, n), at(n, 0), at(0, 0)];
  // Inner columns, down then up; `atTop` is where the pen is.
  let atTop = true;
  for (let i = 1; i < n; i++) {
    points.push(at(i, atTop ? 0 : n), at(i, atTop ? n : 0));
    atTop = !atTop;
  }
  // To the right edge, then the inner rows from that corner: right to left, then left to right.
  points.push(at(n, atTop ? 0 : n));
  let atRight = true;
  for (let k = 1; k < n; k++) {
    const j = atTop ? k : n - k;
    points.push(at(atRight ? n : 0, j), at(atRight ? 0 : n, j));
    atRight = !atRight;
  }
  return points;
}

/**
 * Polylines drawing both diagonals (an ×) of every cell above the main diagonal of an n × n grid: the masked
 * cells of a causal attention mask (nlp-lessons.md, "Lô FIG NLP"). One polyline per row: a zigzag goes right
 * through the row's cells (one diagonal each), up or down the grid's right edge, and another zigzag comes back
 * (the other diagonal). So a polyline runs only along diagonals and the grid border, never along the edge of a
 * masked cell (the compared cell keeps its own border); one polyline for all rows cannot, since the pen would
 * have to cross from row to row along such an edge. n - 1 polylines; none when n = 1.
 */
export function upperCrosses(x: number, y: number, cell: number, n: number): Pt[][] {
  if (!Number.isInteger(n) || n < 1) throw new Error(`upperCrosses: n must be a positive integer, got ${n}.`);
  const at = (i: number, j: number): Pt => [round1(x + i * cell), round1(y + j * cell)];
  const rows: Pt[][] = [];
  for (let r = 0; r < n - 1; r++) {
    // From the top-left corner of cell (r, r + 1); `low` says the pen is on the row's bottom line.
    let low = false;
    const points: Pt[] = [at(r + 1, r)];
    for (let c = r + 1; c < n; c++) {
      low = !low;
      points.push(at(c + 1, low ? r + 1 : r));
    }
    low = !low;
    points.push(at(n, low ? r + 1 : r));
    for (let c = n - 1; c > r; c--) {
      low = !low;
      points.push(at(c, low ? r + 1 : r));
    }
    rows.push(points);
  }
  return rows;
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
