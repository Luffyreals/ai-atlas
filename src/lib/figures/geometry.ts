// Geometry of static figures (docs/architecture/viz/figures.md, section 8). Pure functions and constants, no DOM.
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

/** One Latin or Greek letter (ς, U+03C2, is a final form, not a symbol). */
const MATH_SYMBOL = /^[A-Za-z\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C1\u03C3-\u03C9]$/u;
/** 1–2 digits or Latin letters. */
const MATH_SUB = /^[A-Za-z0-9]{1,2}$/;
/** Digits, spaces and a few math signs (\u00d7 for "\u00d7 N", llm-lessons.md 2.9.2): no words can hide here (viz/static-plots.md 11.3). */
const MATH_AFTER = /^[0-9 =+\u2212\-.,<>\u2264\u2265()\u00d7]+$/u;

/**
 * A short math label: the props of FigMath, and the `math` row of FigNode (viz/static-plots.md 11.3, llm-lessons.md 2.9.2).
 * `bold`: upright bold, the site's \mathbf for vectors and matrices (x, W); otherwise the symbol is italic.
 * `before` and `after`: math characters only, upright, before and after the symbol.
 */
export interface MathLabel {
  symbol: string;
  sub?: string;
  after?: string;
  before?: string;
  bold?: boolean;
}

/**
 * Throws unless a FigMath label is math, not words: `symbol` one Latin or Greek letter, `sub` 1–2 digits or
 * Latin letters, `after` and `before` only digits, spaces and = + − - . , < > ≤ ≥ ( ) ×. Words belong in
 * src/data/figures/.
 */
export function checkMathLabel(symbol: string, sub?: string, after?: string, before?: string): void {
  if (!MATH_SYMBOL.test(symbol)) {
    throw new Error(`checkMathLabel: symbol must be one Latin or Greek letter, got "${symbol}".`);
  }
  if (sub !== undefined && !MATH_SUB.test(sub)) {
    throw new Error(`checkMathLabel: sub must be 1–2 digits or Latin letters, got "${sub}".`);
  }
  if (after !== undefined && (!after.trim() || !MATH_AFTER.test(after))) {
    throw new Error(`checkMathLabel: after may hold only digits, spaces and = + − - . , < > ≤ ≥ ( ) ×, got "${after}".`);
  }
  if (before !== undefined && (!before.trim() || !MATH_AFTER.test(before))) {
    throw new Error(`checkMathLabel: before may hold only digits, spaces and = + − - . , < > ≤ ≥ ( ) ×, got "${before}".`);
  }
}

/**
 * Text rows of a box, stacked and centred in it: the centre y of each row, in order, and the least box height
 * that holds them with NODE_PADDING above and below. `sizes` are the rows' font sizes (FigNode: a math row,
 * then main lines, then small lines).
 */
export function nodeRows(y: number, height: number, sizes: readonly number[]): { centres: number[]; minHeight: number } {
  if (sizes.length === 0) throw new Error('nodeRows: needs at least one row.');
  const textHeight = sizes.reduce((sum, size) => sum + size * LINE_HEIGHT, 0);
  const middle = y + height / 2;
  return {
    centres: stackOffsets(sizes).map((offset) => round1(middle + offset)),
    minHeight: round1(textHeight + 2 * NODE_PADDING),
  };
}

/**
 * What a FigNode holds, checked before it is drawn (llm-lessons.md 2.9.3): null when fine, else the fault. A
 * box needs a main line or a math row; small lines need a main line; at most MAX_NODE_LINES rows; no empty
 * line. A `bare` box (a layer bar, a cell) holds no words at all: no lines, small lines or math row.
 */
export function nodeContentError(
  main: readonly string[],
  small: readonly string[],
  hasMath: boolean,
  bare: boolean,
): string | null {
  if (bare) {
    return main.length > 0 || small.length > 0 || hasMath ? 'a bare box takes no lines, small lines or math row.' : null;
  }
  if (main.length === 0 && !hasMath) return 'needs a main line or a math row.';
  if (main.length === 0 && small.length > 0) return 'small lines need a main line above them.';
  const rows = main.length + small.length + (hasMath ? 1 : 0);
  if (rows > MAX_NODE_LINES) return `at most ${MAX_NODE_LINES} lines, got ${rows}.`;
  if ([...main, ...small].some((line) => !line.trim())) return 'has an empty line.';
  return null;
}

/**
 * A connector through `points` (from, bends, to): the polyline's points and its head, as SVG attributes
 * (FigArrow, llm-lessons.md 2.9.3). The head sits on the last segment, at `to`, and the line stops 1 unit
 * inside it, so no stroke pokes past the tip. Throws when the last segment is shorter than the head. With
 * head = false the line runs to `to` and there is no head.
 */
export function arrowParts(points: readonly Pt[], head: boolean): { line: string; head: string | null } {
  if (points.length < 2) throw new Error('arrowParts: needs at least two points.');
  const to = points[points.length - 1]!;
  const last = points[points.length - 2]!;
  if (head && Math.hypot(to[0] - last[0], to[1] - last[1]) < ARROW_HEAD) {
    throw new Error(`arrowParts: the last segment ${last.join(',')} → ${to.join(',')} is shorter than its head (${ARROW_HEAD}).`);
  }
  const lineEnd = head ? pointBefore(last, to, ARROW_HEAD - 1) : to;
  return {
    line: [...points.slice(0, -1), lineEnd].map(([x, y]) => `${round1(x)},${round1(y)}`).join(' '),
    head: head ? arrowHead(last, to) : null,
  };
}

/** Most labels in one FigText row (llm-lessons.md 2.9.3): the names over a row of columns. */
export const MAX_ROW_LABELS = 8;

/**
 * Where FigText draws each of `count` lines: stacked and centred on y at x (at most MAX_NODE_LINES lines), or,
 * given `xs`, side by side on y, line i at xs[i] (at most MAX_ROW_LABELS): one <text> for the names over a
 * row of columns instead of one each (llm-lessons.md 2.9.3). Throws on a count the mode does not allow.
 */
export function textLinePositions(x: number, y: number, count: number, fontSize: number, xs?: readonly number[]): Pt[] {
  if (xs !== undefined) {
    if (xs.length !== count) throw new Error(`textLinePositions: ${count} lines need ${count} xs, got ${xs.length}.`);
    if (count < 1 || count > MAX_ROW_LABELS) throw new Error(`textLinePositions: a row takes 1–${MAX_ROW_LABELS} lines, got ${count}.`);
    return xs.map((at) => [round1(at), round1(y)]);
  }
  if (count < 1 || count > MAX_NODE_LINES) throw new Error(`textLinePositions: needs 1–${MAX_NODE_LINES} lines, got ${count}.`);
  return lineOffsets(count, fontSize).map((offset) => [round1(x), round1(y + offset)]);
}

/**
 * One piece of a FigFormula (docs/architecture/cv-lessons.md, section 4): a symbol, as in MathLabel (one Latin
 * or Greek letter, italic or bold, with an optional subscript), or a run of upright math characters ("64",
 * "(", "×"). Words belong in src/data/figures/.
 */
export type FormulaPart = string | { readonly symbol: string; readonly bold?: boolean; readonly sub?: string };
export type Formula = readonly FormulaPart[];

/** Upright characters of a formula: those of MATH_AFTER, plus "·" (U+00B7, a product) and "/". */
const FORMULA_UPRIGHT = /^[0-9 =+\u2212\-.,<>\u2264\u2265()\u00d7\u00b7/]+$/u;
/** Operators drawn with a gap of FORMULA_GAP on each side, as KaTeX spaces a binary or relation sign. */
const FORMULA_SPACED = /^[=+\u2212<>\u2264\u2265\u00d7\u00b7]$/u;
/** Gap around a spaced operator and after a comma, in viewBox units (FigMath's dx before `after`). */
export const FORMULA_GAP = 3;

/** One <tspan> of a FigFormula. dy moves a subscript down and the next span back up. */
export interface FormulaSpan {
  text: string;
  italic: boolean;
  bold: boolean;
  small: boolean;
  dx?: number;
  dy?: number;
}

/**
 * The tspans of a formula at `fontSize`: symbols italic (or bold upright), subscripts 13 units moved down
 * by 0.3 of the font size (as FigMath), upright runs as written. Spaced operators (= + − < > ≤ ≥ × ·) stand
 * alone and get FORMULA_GAP each side; a run ending in "," gets it after. Throws on words or empty pieces.
 */
export function formulaSpans(parts: Formula, fontSize: number): FormulaSpan[] {
  if (parts.length === 0) throw new Error('formulaSpans: needs at least one part.');
  const shift = round1(0.3 * fontSize);
  const spans: FormulaSpan[] = [];
  let dx: number | undefined;
  let dy: number | undefined;
  const push = (span: Omit<FormulaSpan, 'dx' | 'dy'>, gapBefore = false) => {
    const gap = gapBefore ? FORMULA_GAP : dx;
    spans.push({ ...span, ...(gap !== undefined && { dx: gap }), ...(dy !== undefined && { dy }) });
    dx = undefined;
    dy = undefined;
  };
  for (const part of parts) {
    if (typeof part === 'string') {
      const text = part.trim();
      if (!text || !FORMULA_UPRIGHT.test(text)) {
        throw new Error(`formulaSpans: an upright run may hold only digits, spaces and = + − - . , < > ≤ ≥ ( ) × · /, got "${part}".`);
      }
      const spaced = FORMULA_SPACED.test(text);
      push({ text, italic: false, bold: false, small: false }, spaced);
      if (spaced || text.endsWith(',')) dx = FORMULA_GAP;
      continue;
    }
    checkMathLabel(part.symbol, part.sub);
    const bold = part.bold === true;
    push({ text: part.symbol, italic: !bold, bold, small: false });
    if (part.sub !== undefined) {
      dy = shift;
      push({ text: part.sub, italic: false, bold: false, small: true });
      dy = -shift;
    }
  }
  return spans;
}
