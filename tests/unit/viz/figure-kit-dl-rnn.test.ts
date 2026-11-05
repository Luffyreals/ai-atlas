// Kit additions of the DL recurrent figures (docs/architecture/dl-lessons.md, section 4.2): the time-step subs
// (t−1, t+1) of checkMathLabel, the tilde over a bold symbol (tildeShift, worked by hand from Barlow's metrics)
// and the accent tone of FigArrow in figures.css.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkMathLabel } from '../../../src/lib/figures/geometry';
import { TILDE_SIZE, tildeShift } from '../../../src/lib/figures/tilde';
import { stripCssComments } from '../fixtures/css';

describe('checkMathLabel: time-step subs', () => {
  it('accepts a letter, + or − (U+2212) and one digit', () => {
    for (const sub of ['t−1', 't+1', 't−2', 't', '0', 'ij']) expect(() => checkMathLabel('h', sub)).not.toThrow();
  });

  it('still rejects words, a hyphen for the minus, and longer tails', () => {
    for (const sub of ['t-1', 't−10', 'tt−1', '−1', 'abc', 'bước']) {
      expect(() => checkMathLabel('h', sub), sub).toThrow(/sub must be 1–2 digits or Latin letters/);
    }
  });
});

describe('tildeShift', () => {
  it('centres the "~" on a bold h and lifts it over the ascender', () => {
    // h: 0.544 em × 15 = 8.16; "~": 0.501 em × 13 = 6.513.
    // before = −(8.16 + 6.513) / 2 = −7.34; after = (8.16 − 6.513) / 2 = 0.82.
    // h top: 0.4 × 15 − 0.7 × 15 = −4.5 from the centre line; the tilde's ink bottom is (0.4 − 0.231) × 13 = 2.197
    // below its own centre; up = −4.5 − 1.5 − 2.197 = −8.197.
    expect(tildeShift('h', true)).toEqual({ before: -7.3, up: -8.2, after: 0.8 });
  });

  it('lifts it less over a short letter (c stops at the x-height)', () => {
    // c: 0.531 × 15 = 7.965; top 0.4 × 15 − 0.52 × 15 = −1.8; up = −1.8 − 1.5 − 2.197 = −5.497.
    expect(tildeShift('c', true)).toEqual({ before: -7.2, up: -5.5, after: 0.7 });
  });

  it('brings the pen back to the end of the symbol: before + tilde width + after = 0', () => {
    for (const symbol of ['h', 'c', 'x', 'q']) {
      const { before, after } = tildeShift(symbol, true);
      expect(before + 0.501 * TILDE_SIZE + after).toBeCloseTo(0, 0);
    }
  });

  it('refuses an italic symbol or more than one letter', () => {
    expect(() => tildeShift('h', false)).toThrow(/only a bold symbol/);
    expect(() => tildeShift('hc', true)).toThrow(/one letter/);
  });
});

describe('figures.css: FigArrow tone accent', () => {
  const css = stripCssComments(readFileSync('src/components/figures/figures.css', 'utf8'));

  it('draws the focus path in the accent colour, wider than a plain arrow, with a matching head', () => {
    expect(css).toMatch(/\.atlas-fig-arrow\[data-tone='accent'\]\s*\{[^}]*stroke:\s*var\(--atlas-fig-accent\);[^}]*stroke-width:\s*2\.5;/);
    expect(css).toMatch(/\.atlas-fig-arrow-head\[data-tone='accent'\]\s*\{[^}]*fill:\s*var\(--atlas-fig-accent\);/);
  });
});
