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

/** ln 10 as a double (the value of Math.LN10), so detLog10 needs no Math call but sqrt. */
const LN10 = 2.302585092994046;
/** √10: detLog10 moves r from [√10, 10) down one decade, so r^(1/16) stays near 1. */
const SQRT10 = 3.1622776601683795;

/**
 * log10(v) with + − × ÷ and Math.sqrt only (section 12.2.6): Math.log10 need not be correctly rounded, so it may
 * differ between Node and a browser, and a log axis must place its marks the same at build time and after hydration.
 * v = r · 10^e with r in [1, 10), then r in [√10, 10) goes down one decade; r^(1/16) by four square roots lies in
 * [0.93, 1.075), where ln x = 2 atanh((x − 1)/(x + 1)) needs five terms of its series. Error about 2e-15; exact at
 * every power of ten (r is then 1, or 1 within one rounding). Throws when v ≤ 0 or v is not finite.
 */
export function detLog10(v: number): number {
  if (!Number.isFinite(v) || !(v > 0)) throw new RangeError(`detLog10: needs a finite v > 0, got ${v}`);
  if (v < 1e-290) return detLog10(v * 1e290) - 290; // keeps 10^|e| finite in the loop below for tiny v
  let e = 0;
  let p = 1; // 10^|e|, exact up to 10^22
  if (v >= 1) {
    while (p * 10 <= v) {
      p *= 10;
      e += 1;
    }
  } else {
    while (v * p < 1) {
      p *= 10;
      e -= 1;
    }
  }
  let r = v >= 1 ? v / p : v * p;
  if (r >= SQRT10) {
    r /= 10;
    e += 1;
  }
  for (let i = 0; i < 4; i++) r = Math.sqrt(r);
  const s = (r - 1) / (r + 1);
  const s2 = s * s;
  const lnR = 2 * s * (1 + s2 * (1 / 3 + s2 * (1 / 5 + s2 * (1 / 7 + s2 / 9))));
  return e + (16 * lnR) / LN10;
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
