// A short formula of a static figure, drawn as one <text> of tspans (FigFormula, docs/architecture/dl-lessons.md,
// section 4.1): a row of FigMath-like parts, so "f(x)" and "x + f(x)" (bold x) or "a^[1]" and "ŷ" can stand
// beside a box. Each part keeps FigMath's rules (checkMathLabel), plus two additions for the DL figures:
// `sup`, a superscript (the layer index [1] of the site's a^{[l]}), and `hat`, a hat on the symbol, drawn as the
// precomposed letter (ŷ, U+0177): Barlow's subsets have it, but not the combining U+0302.
// Also supports upright string pieces (e.g. "32", "×", ",") for CV figures (cv-lessons.md 4).
// Pure functions, no DOM; relative imports only (Playwright e2e may import this file).
import { FIG_FONT, checkMathLabel, round1, type MathLabel } from './geometry';

/** One part of a formula: a FigMath label, with an optional superscript or hat, or an upright string piece. */
export type FormulaPart =
  | string
  | (MathLabel & {
      /** Superscript, 13 units, raised with dy: 1–2 digits or Latin letters, bare or in square brackets ("[1]"). */
      sup?: string;
      /** A hat on the symbol: only letters with a precomposed form in Barlow (HATS). */
      hat?: boolean;
    });

export type Formula = readonly FormulaPart[];

/** One tspan of a formula, in order. dx and dy are relative to the end of the previous tspan. */
export interface FormulaSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  /** 13 units (sub, sup) instead of the formula's size. */
  small?: boolean;
  dx?: number;
  dy?: number;
}

/** Letters with a hat, precomposed (latin-ext and Latin Extended Additional, both loaded with Barlow). */
export const HATS: Readonly<Record<string, string>> = {
  a: 'â',
  c: 'ĉ',
  e: 'ê',
  g: 'ĝ',
  h: 'ĥ',
  i: 'î',
  j: 'ĵ',
  o: 'ô',
  s: 'ŝ',
  u: 'û',
  w: 'ŵ',
  y: 'ŷ',
  z: 'ẑ',
};

const MATH_SUP = /^(?:[A-Za-z0-9]{1,2}|\[[A-Za-z0-9]{1,2}\])$/;
/** Upright characters of a formula: digits, spaces, and math symbols. */
const FORMULA_UPRIGHT = /^[0-9 =+−\-.,<>≤≥()×·/]+$/u;
/** Operators drawn with a gap of GAP on each side, as KaTeX spaces a binary or relation sign. */
const FORMULA_SPACED = /^[=+−<>≤≥×·]$/u;
/** Gap before an operator after the symbol, and after it before the next part ("x + f"). */
const GAP = 3;
/** Gap next to a bracket ("f(x)"): the italic f leans into it already. */
const TIGHT = 1;

const isBracket = (text: string) => /^[()[\]]/.test(text);
const opens = (text: string) => /[([]$/.test(text);

/**
 * Throws unless every part is math, not words: checkMathLabel's rules for symbol, sub, after and before; `sup`
 * 1–2 digits or Latin letters, bare or in square brackets; not both sub and sup; `hat` only on a letter of HATS.
 */
export function checkFormula(parts: readonly FormulaPart[]): void {
  if (parts.length === 0) throw new Error('checkFormula: needs at least one part.');
  for (const part of parts) {
    if (typeof part === 'string') {
      const text = part.trim();
      if (!text || !FORMULA_UPRIGHT.test(text)) {
        throw new Error(`checkFormula: an upright run may hold only digits, spaces and = + − - . , < > ≤ ≥ ( ) × · /, got "${part}".`);
      }
      continue;
    }
    checkMathLabel(part.symbol, part.sub, part.after, part.before);
    if (part.sup !== undefined && !MATH_SUP.test(part.sup)) {
      throw new Error(`checkFormula: sup must be 1–2 digits or Latin letters, bare or in [ ], got "${part.sup}".`);
    }
    if (part.sup !== undefined && part.sub !== undefined) {
      throw new Error(`checkFormula: "${part.symbol}" has both sub and sup; draw one of them.`);
    }
    if (part.hat && HATS[part.symbol] === undefined) {
      throw new Error(`checkFormula: no hat for "${part.symbol}"; letters with one: ${Object.keys(HATS).join(' ')}.`);
    }
  }
}

/**
 * The tspans of a formula at `fontSize` (FigFormula): for each part, `before`, the symbol (italic, or upright
 * bold), its sub or sup (13 units, moved by ±0.3 or 0.35 of the size with dy and moved back on the next tspan),
 * then `after`. Gaps: 3 units round operators, 1 before a bracket and after an opening one, none at the very start.
 */
export function formulaSpans(parts: readonly FormulaPart[], fontSize: number = FIG_FONT.label): FormulaSpan[] {
  checkFormula(parts);
  const spans: FormulaSpan[] = [];
  let raised = 0; // dy still to undo, from the last sub or sup
  let previous = ''; // text of the last span, for the gap before the next one
  const push = (text: string, style: Omit<FormulaSpan, 'text' | 'dx' | 'dy'>, dx: number, dy = 0) => {
    const span: FormulaSpan = { text, ...style };
    if (spans.length > 0 && dx !== 0) span.dx = dx;
    const move = round1(dy - raised);
    if (move !== 0) span.dy = move;
    raised = dy;
    spans.push(span);
    previous = text;
  };
  const gapBefore = (text: string) => (isBracket(text) || opens(previous) ? TIGHT : GAP);

  for (const part of parts) {
    if (typeof part === 'string') {
      const text = part.trim();
      const spaced = FORMULA_SPACED.test(text);
      push(text, { bold: false, italic: false }, spans.length === 0 ? 0 : spaced ? GAP : gapBefore(text));
      continue;
    }
    if (part.before !== undefined) push(part.before, {}, gapBefore(part.before));
    const symbol = part.hat ? (HATS[part.symbol] ?? part.symbol) : part.symbol;
    push(symbol, part.bold ? { bold: true } : { italic: true }, spans.length === 0 ? 0 : gapBefore(symbol));
    if (part.sub !== undefined) push(part.sub, { small: true }, 0, round1(0.3 * fontSize));
    if (part.sup !== undefined) push(part.sup, { small: true }, 0, round1(-0.35 * fontSize));
    if (part.after !== undefined) push(part.after, {}, gapBefore(part.after));
  }
  return spans;
}
