// Geometry of static figures (docs/architecture/viz.md, section 8). Pure functions and constants, no DOM.
// Coordinates are viewBox units. Hand-written coordinates are integers; computed ones are rounded to 1 decimal.
// Relative imports only: Playwright e2e may import this file too, and it does not know the @lib/* alias.
import type { Lines } from '../../data/figures/types';

/** Width of the required narrow layout's viewBox (shown at 343–400px, scale 0.95–1.11). */
export const NARROW_WIDTH = 360;
/** Width of the optional wide layout's viewBox (shown at 640px, scale 1). */
export const WIDE_WIDTH = 640;
/** Tallest narrow layout: 1.5 × its width, so the figure and its caption fit one phone screen. */
export const NARROW_MAX_HEIGHT = 540;
/** Font sizes in viewBox units: 13 × 343/360 ≈ 12.4px, the smallest text at 375px. */
export const FIG_FONT = { label: 15, small: 13 } as const;
/** Line pitch as a multiple of the font size: Vietnamese can stack two diacritics. */
export const LINE_HEIGHT = 1.3;
/** Room between a box's edge and its text, on every side (fallback fonts are wider than Barlow). */
export const NODE_PADDING = 8;
/** Most lines in one box, main and small together. */
export const MAX_NODE_LINES = 3;
/** Default length (and base width) of an arrow head. */
export const ARROW_HEAD = 8;

export type Pt = readonly [x: number, y: number];

/** Rounds to 1 decimal, half away from zero, without -0. */
export function round1(value: number): number {
  const rounded = (Math.sign(value) * Math.round(Math.abs(value) * 10)) / 10;
  return rounded === 0 ? 0 : rounded;
}

/** A label as one string per line. */
export function toLines(lines: Lines): readonly string[] {
  return typeof lines === 'string' ? [lines] : lines;
}

/** Offset of each line's centre from y, so that lines of the given font sizes, stacked, are centred on y. */
export function stackOffsets(sizes: readonly number[]): number[] {
  const pitches = sizes.map((size) => size * LINE_HEIGHT);
  let top = -pitches.reduce((sum, pitch) => sum + pitch, 0) / 2;
  return pitches.map((pitch) => {
    const centre = top + pitch / 2;
    top += pitch;
    return round1(centre);
  });
}

/** dy of each line from y (the line's centre, with dominant-baseline: central), so `count` lines are centred on y. */
export function lineOffsets(count: number, fontSize: number): number[] {
  if (!Number.isInteger(count) || count < 1) throw new Error(`lineOffsets: count must be a positive integer, got ${count}.`);
  return stackOffsets(Array.from({ length: count }, () => fontSize));
}

/** The point `distance` before `to`, on the segment from → to. */
export function pointBefore(from: Pt, to: Pt, distance: number): Pt {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  if (length === 0) throw new Error(`pointBefore: from and to are the same point (${from.join(',')}).`);
  return [round1(to[0] - (dx / length) * distance), round1(to[1] - (dy / length) * distance)];
}

/** "x1,y1 x2,y2 x3,y3": a head pointing along from → to, tip at `to`, as long and as wide as `size`. */
export function arrowHead(from: Pt, to: Pt, size: number = ARROW_HEAD): string {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  if (length === 0) throw new Error(`arrowHead: from and to are the same point (${from.join(',')}).`);
  const [ux, uy] = [dx / length, dy / length];
  const [bx, by] = [to[0] - ux * size, to[1] - uy * size];
  const half = size / 2;
  const points: Pt[] = [to, [bx - uy * half, by + ux * half], [bx + uy * half, by - ux * half]];
  return points.map(([x, y]) => `${round1(x)},${round1(y)}`).join(' ');
}
