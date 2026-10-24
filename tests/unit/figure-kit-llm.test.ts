// Kit additions of the LLM figures, batch B (docs/architecture/llm-lessons.md, section 2.9.2): hand-worked
// examples for spreadByWeight (a row of boxes sized by their words), nodeRows (the rows of FigNode, now with
// an optional math row) and checkMathLabel's `before` and "×" (the "× N" of a stack of layers).
import { describe, expect, it } from 'vitest';
import { FIG_FONT, LINE_HEIGHT, NODE_PADDING, checkMathLabel, nodeRows, stackOffsets } from '../../src/lib/figures/geometry';
import { spreadByWeight } from '../../src/lib/figures/layout';

describe('spreadByWeight', () => {
  it('gives each slot its share of the room left after the gaps', () => {
    expect(spreadByWeight(0, 108, [1, 2], 0)).toEqual({ starts: [0, 36], sizes: [36, 72] });
    // 140 - 2 × 4 = 132 shared 5 : 7 : 5.
    expect(spreadByWeight(12, 152, [5, 7, 5], 4)).toEqual({ starts: [12, 54.8, 113.2], sizes: [38.8, 54.4, 38.8] });
    expect(spreadByWeight(10, 50, [3], 99)).toEqual({ starts: [10], sizes: [40] });
  });

  it('fills the span exactly, gaps included', () => {
    const { starts, sizes } = spreadByWeight(192, 332, [7, 5, 5], 4);
    expect(starts[0]).toBe(192);
    expect((starts.at(-1) ?? 0) + (sizes.at(-1) ?? 0)).toBeCloseTo(332, 1);
  });

  it('rejects empty or non-positive weights and slots that do not fit', () => {
    expect(() => spreadByWeight(0, 100, [], 4)).toThrow(/positive numbers/);
    expect(() => spreadByWeight(0, 100, [1, 0], 4)).toThrow(/positive numbers/);
    expect(() => spreadByWeight(0, 10, [1, 1, 1], 6)).toThrow(/do not fit/);
  });
});

describe('nodeRows', () => {
  it('centres one row in the box and asks for the row plus padding', () => {
    expect(nodeRows(8, 36, [FIG_FONT.label])).toEqual({ centres: [26], minHeight: 35.5 });
  });

  it('stacks a math row, a main line and a small line like stackOffsets, from the middle of the box', () => {
    const sizes = [FIG_FONT.label, FIG_FONT.label, FIG_FONT.small];
    const { centres, minHeight } = nodeRows(216, 112, sizes);
    expect(centres).toEqual(stackOffsets(sizes).map((offset) => Math.round((272 + offset) * 10) / 10));
    // Pitches 19.5, 19.5, 16.9 (total 55.9): centres −18.2, 1.3, 19.5 from the middle, y 272.
    expect(centres).toEqual([253.8, 273.3, 291.5]);
    expect(minHeight).toBeCloseTo((15 + 15 + 13) * LINE_HEIGHT + 2 * NODE_PADDING, 1);
  });

  it('rejects a box with no row', () => {
    expect(() => nodeRows(0, 40, [])).toThrow(/at least one row/);
  });
});

describe('checkMathLabel: before and ×', () => {
  it('accepts a math head before the symbol, and × on either side', () => {
    expect(() => checkMathLabel('N', undefined, undefined, '×')).not.toThrow();
    expect(() => checkMathLabel('N', undefined, '× 2', '(')).not.toThrow();
  });

  it('rejects words or a blank head', () => {
    expect(() => checkMathLabel('N', undefined, undefined, 'x')).toThrow(/before may hold only/);
    expect(() => checkMathLabel('N', undefined, undefined, 'lớp')).toThrow(/before may hold only/);
    expect(() => checkMathLabel('N', undefined, undefined, ' ')).toThrow(/before may hold only/);
  });
});
