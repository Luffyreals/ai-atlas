// Kit additions of the LLM figures, batch C (docs/architecture/llm-lessons.md, section 2.9.3), with hand-worked
// examples: nodeContentError (what a FigNode holds, now with `bare` boxes), arrowParts (FigArrow's points and
// head, moved out of the component unchanged), textLinePositions (FigText, now with a row of labels), the
// figures.css rules that replaced the per-text anchor and baseline attributes, and the "api" description of
// ContainerImageFigure, which lives outside FIGURES and so outside figure-conventions.test.ts.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CONTAINER_IMAGE, CONTAINER_IMAGE_API } from '../../../src/data/figures/container-image';
import { LOCALES } from '../../../src/data/roadmap';
import {
  ARROW_HEAD,
  FIG_FONT,
  MAX_ROW_LABELS,
  arrowHead,
  arrowParts,
  lineOffsets,
  nodeContentError,
  textLinePositions,
} from '../../../src/lib/figures/geometry';
import { stripCssComments } from '../fixtures/css';

describe('nodeContentError', () => {
  it('accepts words, a math row, or a bare box with nothing in it', () => {
    expect(nodeContentError(['Router'], [], false, false)).toBeNull();
    expect(nodeContentError(['Expert'], ['dùng chung'], false, false)).toBeNull();
    expect(nodeContentError([], [], true, false)).toBeNull();
    expect(nodeContentError(['Đầu ra'], [], true, false)).toBeNull();
    expect(nodeContentError([], [], false, true)).toBeNull();
  });

  it('keeps the rules of a box with words', () => {
    expect(nodeContentError([], [], false, false)).toMatch(/main line or a math row/);
    expect(nodeContentError([], ['small'], true, false)).toMatch(/small lines need a main line/);
    expect(nodeContentError(['a', 'b'], ['c'], true, false)).toMatch(/at most 3 lines, got 4/);
    expect(nodeContentError(['a', ' '], [], false, false)).toMatch(/empty line/);
  });

  it('rejects words of any kind in a bare box', () => {
    expect(nodeContentError(['Lớp 1'], [], false, true)).toMatch(/bare box takes no/);
    expect(nodeContentError([], ['x'], false, true)).toMatch(/bare box takes no/);
    expect(nodeContentError([], [], true, true)).toMatch(/bare box takes no/);
  });
});

describe('arrowParts', () => {
  it('stops the line 1 unit inside the head and draws the head at `to`', () => {
    // Down 40 units: the head is 8 long, so the line ends 7 before the tip.
    expect(arrowParts([[10, 0], [10, 40]], true)).toEqual({ line: '10,0 10,33', head: arrowHead([10, 0], [10, 40]) });
    expect(arrowHead([10, 0], [10, 40])).toBe('10,40 6,32 14,32');
  });

  it('keeps the bends and points the head along the last segment', () => {
    const { line, head } = arrowParts([[0, 0], [0, 20], [30, 20]], true);
    expect(line).toBe('0,0 0,20 23,20');
    expect(head).toBe(arrowHead([0, 20], [30, 20]));
  });

  it('runs a link with no head all the way to `to`', () => {
    expect(arrowParts([[110, 42], [352, 42], [352, 82], [110, 82], [110, 42]], false)).toEqual({
      line: '110,42 352,42 352,82 110,82 110,42',
      head: null,
    });
  });

  it('rejects a last segment shorter than its head, and fewer than two points', () => {
    expect(() => arrowParts([[0, 0], [0, ARROW_HEAD - 1]], true)).toThrow(/shorter than its head/);
    expect(() => arrowParts([[0, 0], [0, ARROW_HEAD]], true)).not.toThrow();
    expect(() => arrowParts([[0, 0], [0, 2]], false)).not.toThrow();
    expect(() => arrowParts([[0, 0]], true)).toThrow(/two points/);
  });
});

describe('textLinePositions', () => {
  it('stacks lines on y at x, as lineOffsets', () => {
    const offsets = lineOffsets(2, FIG_FONT.small);
    expect(textLinePositions(152, 68, 2, FIG_FONT.small)).toEqual(offsets.map((dy) => [152, Math.round((68 + dy) * 10) / 10]));
    expect(textLinePositions(152, 68, 1, FIG_FONT.small)).toEqual([[152, 68]]);
  });

  it('puts a row of labels side by side on y, one x each', () => {
    expect(textLinePositions(0, 32, 4, FIG_FONT.small, [180, 228, 276, 324])).toEqual([
      [180, 32],
      [228, 32],
      [276, 32],
      [324, 32],
    ]);
  });

  it('rejects counts the mode does not allow', () => {
    expect(() => textLinePositions(0, 0, 4, FIG_FONT.small)).toThrow(/1–3 lines/);
    expect(() => textLinePositions(0, 0, 0, FIG_FONT.small)).toThrow(/1–3 lines/);
    expect(() => textLinePositions(0, 0, 2, FIG_FONT.small, [1, 2, 3])).toThrow(/need 2 xs/);
    const many = Array.from({ length: MAX_ROW_LABELS + 1 }, (_, i) => i * 10);
    expect(() => textLinePositions(0, 0, many.length, FIG_FONT.small, many)).toThrow(/a row takes/);
  });
});

describe('figures.css: the anchor and baseline of kit text', () => {
  const css = stripCssComments(
    readFileSync(new URL('../../../src/components/figures/figures.css', import.meta.url), 'utf8'),
  ).replace(/\s+/g, ' ');

  it('centres every kit text on its y', () => {
    expect(css).toMatch(/\.atlas-fig-svg text \{ dominant-baseline: central; \}/);
  });

  it('centres on x only the texts with no text-anchor attribute, so start and end still win', () => {
    expect(css).toMatch(/\.atlas-fig-svg text:not\(\[text-anchor\]\) \{ text-anchor: middle; \}/);
  });
});

describe('ContainerImageFigure: the "api" stack', () => {
  it('has a description in every locale, translated, and not the "chat" one', () => {
    for (const locale of LOCALES) {
      const api = CONTAINER_IMAGE_API[locale].description.trim();
      expect(api.length).toBeGreaterThan(0);
      expect(api).not.toBe(CONTAINER_IMAGE[locale].description.trim());
    }
    expect(CONTAINER_IMAGE_API.vi.description).not.toBe(CONTAINER_IMAGE_API.en.description);
  });

  it('names in its description the layers it draws', () => {
    for (const locale of LOCALES) {
      const { description } = CONTAINER_IMAGE_API[locale];
      const { apiBase, apiCode } = CONTAINER_IMAGE[locale].labels;
      expect(description).toContain(apiBase[0]);
      for (const file of apiCode[1]!.split(', ')) expect(description).toContain(file);
    }
  });
});
