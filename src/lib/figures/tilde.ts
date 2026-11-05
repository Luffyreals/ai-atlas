// A tilde over a bold math symbol of a static figure (docs/architecture/dl-lessons.md, section 4.2): the
// candidates h̃ and c̃ of the GRU and LSTM figures. Barlow has no precomposed h̃ or c̃, and the combining U+0303
// sits in the Vietnamese subset while the letters sit in the Latin one, so the browser cannot attach the mark to
// its letter (two font files, no mark positioning between them). FigMath draws an ASCII "~" (Latin subset)
// instead, as its own tspan: moved back over the symbol with dx, raised above it with dy, then the next tspan
// moves back by the rest. The numbers come from Barlow's metrics (read with fontTools from @fontsource/barlow
// 5.3.0): ascent 1000, descent 200, so the central baseline is 0.4 em above the alphabetic one.
// Pure functions, no DOM; relative imports only (Playwright e2e may import this file).
import { FIG_FONT, round1 } from './geometry';

/** Advance widths in em of Barlow 600 upright (the site's bold symbol): the letters the figures use. */
const BOLD_ADVANCE: Readonly<Record<string, number>> = { c: 0.531, h: 0.544, x: 0.516, y: 0.489, z: 0.455 };
/** Width in em of a letter not in the table: about Barlow 600's lowercase average. */
const DEFAULT_ADVANCE = 0.54;
/** Letters as tall as the ascender (0.7 em); the rest stop at the x-height (about 0.52 em). */
const TALL = /^[A-Zbdfhklt0-9]$/;
const TALL_TOP = 0.7;
const SHORT_TOP = 0.52;
/** "~" of Barlow 400 (the weight of .atlas-fig-math): advance and the bottom of its ink, in em. */
const TILDE_ADVANCE = 0.501;
const TILDE_INK_BOTTOM = 0.231;
/** Central baseline above the alphabetic one, in em: (ascent − descent) / 2. */
const CENTRAL = 0.4;
/** Room between the top of the symbol and the bottom of the tilde, in viewBox units. */
const TILDE_GAP = 1.5;

/** The tilde's own font size: 13 units, the small size, like a sub. */
export const TILDE_SIZE = FIG_FONT.small;

/**
 * Where the "~" tspan goes, for a bold `symbol` at `fontSize`: `before` is its dx (back over the symbol, so the
 * centres meet), `up` its dy (negative: raised until its ink clears the symbol's top by TILDE_GAP), and `after`
 * the dx of the next tspan, which brings the pen back to the end of the symbol. Throws for an italic symbol (the
 * slant is not modelled) or a symbol longer than one letter.
 */
export function tildeShift(symbol: string, bold: boolean, fontSize: number = FIG_FONT.label): { before: number; up: number; after: number } {
  if (!bold) throw new Error(`tildeShift: only a bold symbol (a vector) takes a tilde, got italic "${symbol}".`);
  if ([...symbol].length !== 1) throw new Error(`tildeShift: needs one letter, got "${symbol}".`);
  const symbolWidth = (BOLD_ADVANCE[symbol] ?? DEFAULT_ADVANCE) * fontSize;
  const tildeWidth = TILDE_ADVANCE * TILDE_SIZE;
  // Tops and bottoms measured down from the shared central line (y), as SVG does.
  const symbolTop = CENTRAL * fontSize - (TALL.test(symbol) ? TALL_TOP : SHORT_TOP) * fontSize;
  const tildeBottomFromItsCentre = (CENTRAL - TILDE_INK_BOTTOM) * TILDE_SIZE;
  return {
    before: round1(-(symbolWidth + tildeWidth) / 2),
    up: round1(symbolTop - TILDE_GAP - tildeBottomFromItsCentre),
    after: round1((symbolWidth - tildeWidth) / 2),
  };
}
