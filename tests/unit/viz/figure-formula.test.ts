// FigFormula of the DL figures (docs/architecture/dl-lessons.md, section 4.1), with hand-worked examples:
// formulaSpans places the tspans of "f(x)", "x + f(x)", "a^[1]", "ŷ" and "x_1 = 0", and checkFormula keeps
// words, unknown hats and sub-plus-sup out of the figures.
import { describe, expect, it } from 'vitest';
import { FIG_FONT } from '../../../src/lib/figures/geometry';
import { HATS, checkFormula, formulaSpans } from '../../../src/lib/figures/formula';

describe('formulaSpans', () => {
  it('draws f(x) tight round the brackets, x bold', () => {
    expect(formulaSpans([{ symbol: 'f', after: '(' }, { symbol: 'x', bold: true, after: ')' }])).toEqual([
      { text: 'f', italic: true },
      { text: '(', dx: 1 },
      { text: 'x', bold: true, dx: 1 },
      { text: ')', dx: 1 },
    ]);
  });

  it('draws x + f(x) with 3 units round the plus', () => {
    const spans = formulaSpans([
      { symbol: 'x', bold: true, after: '+' },
      { symbol: 'f', after: '(' },
      { symbol: 'x', bold: true, after: ')' },
    ]);
    expect(spans.map((s) => s.text).join('')).toBe('x+f(x)');
    expect(spans.map((s) => s.dx ?? 0)).toEqual([0, 3, 3, 1, 1, 1]);
    expect(spans.every((s) => s.dy === undefined)).toBe(true);
  });

  it('raises a superscript by 0.35 of the size and lowers what follows back', () => {
    // 0.35 × 15 = 5.25, rounded half away from zero.
    expect(formulaSpans([{ symbol: 'a', bold: true, sup: '[1]', after: '=' }])).toEqual([
      { text: 'a', bold: true },
      { text: '[1]', small: true, dy: -5.3 },
      { text: '=', dx: 3, dy: 5.3 },
    ]);
  });

  it('drops a subscript by 0.3 of the size, like FigMath', () => {
    expect(formulaSpans([{ symbol: 'x', sub: '1', after: '= 0' }], FIG_FONT.label)).toEqual([
      { text: 'x', italic: true },
      { text: '1', small: true, dy: 4.5 },
      { text: '= 0', dx: 3, dy: -4.5 },
    ]);
    expect(formulaSpans([{ symbol: 'w', sub: 'j' }], FIG_FONT.small)[1]).toEqual({ text: 'j', small: true, dy: 3.9 });
  });

  it('draws a hat as the precomposed letter, which Barlow has', () => {
    expect(formulaSpans([{ symbol: 'y', hat: true }])).toEqual([{ text: 'ŷ', italic: true }]);
    expect(HATS.y).toBe('ŷ');
  });
});

describe('checkFormula', () => {
  it('accepts the formulas of the DL figures', () => {
    expect(() => checkFormula([{ symbol: 'a', bold: true, sup: '[1]' }])).not.toThrow();
    expect(() => checkFormula([{ symbol: 'W', bold: true, sup: 'l' }])).not.toThrow();
    expect(() => checkFormula([{ symbol: 'y', hat: true }])).not.toThrow();
  });

  it('rejects an empty formula, words, a bad superscript, sub with sup, and a hat it cannot draw', () => {
    expect(() => checkFormula([])).toThrow(/at least one part/);
    expect(() => checkFormula([{ symbol: 'ReLU' }])).toThrow(/one Latin or Greek letter/);
    expect(() => checkFormula([{ symbol: 'a', sup: 'abc' }])).toThrow(/sup must be/);
    expect(() => checkFormula([{ symbol: 'a', sup: '[1' }])).toThrow(/sup must be/);
    expect(() => checkFormula([{ symbol: 'a', sub: '1', sup: '[1]' }])).toThrow(/both sub and sup/);
    expect(() => checkFormula([{ symbol: 'x', hat: true }])).toThrow(/no hat for "x"/);
  });
});
