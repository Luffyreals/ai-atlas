// Geometry of static figures (docs/architecture/viz.md, sections 8.2 e, 8.4): hand-worked examples.
import { describe, expect, it } from 'vitest';
import {
  FIG_FONT,
  LINE_HEIGHT,
  NARROW_WIDTH,
  arrowHead,
  lineOffsets,
  pointBefore,
  round1,
  stackOffsets,
  toLines,
} from '../../src/lib/figures/geometry';

describe('round1', () => {
  it('rounds to 1 decimal, half away from zero, never -0', () => {
    expect(round1(9.75)).toBe(9.8);
    expect(round1(-9.75)).toBe(-9.8);
    expect(round1(3.14159)).toBe(3.1);
    expect(round1(12)).toBe(12);
    expect(Object.is(round1(-0.01), 0)).toBe(true);
  });
});

describe('the smallest text at 375px', () => {
  it('is at least 12px: 13 units in a 343px column for a 360-unit viewBox', () => {
    expect((FIG_FONT.small * 343) / NARROW_WIDTH).toBeGreaterThanOrEqual(12);
    expect(FIG_FONT.label).toBeGreaterThan(FIG_FONT.small);
  });
});

describe('lineOffsets', () => {
  it('centres one line on y', () => {
    expect(lineOffsets(1, 15)).toEqual([0]);
  });

  it('centres two lines, one pitch (15 × 1.3 = 19.5) apart', () => {
    expect(LINE_HEIGHT).toBe(1.3);
    expect(lineOffsets(2, 15)).toEqual([-9.8, 9.8]);
  });

  it('centres three lines, the middle one on y', () => {
    expect(lineOffsets(3, 15)).toEqual([-19.5, 0, 19.5]);
    expect(lineOffsets(3, 13)).toEqual([-16.9, 0, 16.9]);
  });

  it('rejects a count that is not a positive integer', () => {
    expect(() => lineOffsets(0, 15)).toThrow();
    expect(() => lineOffsets(1.5, 15)).toThrow();
  });
});

describe('stackOffsets', () => {
  it('matches lineOffsets for one size', () => {
    expect(stackOffsets([15, 15])).toEqual(lineOffsets(2, 15));
  });

  it('stacks a 15-unit line over two 13-unit ones: pitches 19.5, 16.9, 16.9, total 53.3', () => {
    // Top at -26.65; centres at -26.65 + 9.75, -26.65 + 19.5 + 8.45, -26.65 + 36.4 + 8.45.
    expect(stackOffsets([15, 13, 13])).toEqual([-16.9, 1.3, 18.2]);
  });
});

describe('arrowHead', () => {
  it('points right: tip at `to`, base 8 back, 8 wide', () => {
    expect(arrowHead([0, 0], [100, 0])).toBe('100,0 92,4 92,-4');
  });

  it('points down', () => {
    expect(arrowHead([50, 0], [50, 40])).toBe('50,40 46,32 54,32');
  });

  it('points left and up', () => {
    expect(arrowHead([100, 0], [0, 0])).toBe('0,0 8,-4 8,4');
    expect(arrowHead([50, 40], [50, 0])).toBe('50,0 54,8 46,8');
  });

  it('points along a 3-4-5 diagonal, with a custom size', () => {
    // Unit vector (0.6, 0.8); base (30 - 6, 40 - 8) = (24, 32); half width 5 along (-0.8, 0.6).
    expect(arrowHead([0, 0], [30, 40], 10)).toBe('30,40 20,35 28,29');
  });

  it('only depends on the direction, not on the distance', () => {
    expect(arrowHead([90, 0], [100, 0])).toBe(arrowHead([0, 0], [100, 0]));
  });

  it('rejects a zero-length segment', () => {
    expect(() => arrowHead([5, 5], [5, 5])).toThrow();
  });
});

describe('pointBefore', () => {
  it('steps back from `to` along the segment', () => {
    expect(pointBefore([0, 0], [100, 0], 7)).toEqual([93, 0]);
    expect(pointBefore([0, 0], [30, 40], 5)).toEqual([27, 36]);
  });

  it('rejects a zero-length segment', () => {
    expect(() => pointBefore([1, 2], [1, 2], 3)).toThrow();
  });
});

describe('toLines', () => {
  it('makes one line of a string and keeps an array', () => {
    expect(toLines('Dữ liệu')).toEqual(['Dữ liệu']);
    expect(toLines(['Dữ liệu', '10 căn hộ'])).toEqual(['Dữ liệu', '10 căn hộ']);
  });
});
