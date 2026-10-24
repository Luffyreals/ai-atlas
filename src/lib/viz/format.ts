// Number formatting for every VIZ (docs/architecture/viz/README.md, section 2.6). Pure, relative imports only.
// Same output in vi and en, at build time and in every browser: toFixed, never Intl.
import type { Line } from './linear-fit';

/** U+2212, the minus sign KaTeX shows in the lesson's formulas. */
export const MINUS = '−';

/** toFixed with a decimal point, U+2212 for negatives, never "−0.00". No thousands separator. */
export function formatNumber(value: number, digits: number): string {
  if (!Number.isFinite(value)) throw new RangeError(`formatNumber: ${value} is not a finite number`);
  const text = Math.abs(value).toFixed(digits);
  return value < 0 && Number(text) !== 0 ? MINUS + text : text;
}

/** Decimals of a slider step or a tick: 0.005 → 3, 0.1 → 1, 1 → 0. */
export function decimalsOf(step: number): number {
  if (!Number.isFinite(step)) throw new RangeError(`decimalsOf: ${step} is not a finite number`);
  for (let digits = 0; digits < 20; digits++) {
    if (Number(step.toFixed(digits)) === step) return digits;
  }
  return 20;
}

/** Pieces of "ŷ = 0.150x + 1.20": the island wraps them around the KaTeX symbols. */
export function lineParts(
  line: Line,
  digits: { w: number; b: number },
): { w: string; sign: '+' | '−'; b: string } {
  const b = formatNumber(Math.abs(line.b), digits.b);
  return { w: formatNumber(line.w, digits.w), sign: line.b < 0 && Number(b) !== 0 ? MINUS : '+', b };
}
