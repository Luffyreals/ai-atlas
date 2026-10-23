// Data units → percent of the plot box (docs/architecture/viz.md, sections 2.4, 4.2). Pure.
// The SVG of a VIZ has no viewBox: every coordinate is a percentage, so it scales without scaling strokes or text.
import type { Line } from './linear-fit';

export type Domain = readonly [min: number, max: number];

/** A segment in data units. */
export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** 0 at min, 100 at max. */
export function toPercentX(x: number, domain: Domain): number {
  return ((x - domain[0]) / (domain[1] - domain[0])) * 100;
}

/** 100 at min (bottom), 0 at max: SVG y grows down. */
export function toPercentY(y: number, domain: Domain): number {
  return 100 - ((y - domain[0]) / (domain[1] - domain[0])) * 100;
}

/** Two decimals and '%', e.g. "42.86%": the same string at build time and in every browser. */
export function pct(value: number): string {
  const text = value.toFixed(2);
  return `${text === '-0.00' ? '0.00' : text}%`;
}

export function clamp(value: number, domain: Domain): number {
  return Math.min(domain[1], Math.max(domain[0], value));
}

/** The part of y = w x + b inside the box, or null when the line misses it (or only touches a corner). */
export function clipLineToBox(line: Line, x: Domain, y: Domain): Segment | null {
  const { w, b } = line;
  let lo = x[0];
  let hi = x[1];
  if (w === 0) {
    if (b < y[0] || b > y[1]) return null;
  } else {
    // x where the line crosses the bottom and the top of the box.
    const atBottom = (y[0] - b) / w;
    const atTop = (y[1] - b) / w;
    lo = Math.max(lo, Math.min(atBottom, atTop));
    hi = Math.min(hi, Math.max(atBottom, atTop));
  }
  if (!(lo < hi)) return null;
  // clamp() only removes rounding error: both ends are inside the box by construction.
  return { x1: lo, y1: clamp(w * lo + b, y), x2: hi, y2: clamp(w * hi + b, y) };
}
