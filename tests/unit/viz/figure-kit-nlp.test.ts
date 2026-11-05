// Kit additions of the NLP figures (docs/architecture/nlp-lessons.md, "Lô FIG NLP"): gridLines (every line of an
// n × n grid as one polyline) and upperCrosses (an × in every cell above the diagonal, one polyline per row), used by
// AttentionMaskFigure; and the accent tone of FigArrow in figures.css. Hand-worked small cases, then checks on
// the segments of the 5 × 5 case the figure draws.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Pt } from '../../../src/lib/figures/geometry';
import { gridLines, upperCrosses } from '../../../src/lib/figures/layout';
import { stripCssComments } from '../fixtures/css';

/** Segments of a polyline in cell units, each as a sorted "x1,y1-x2,y2" key; zero-length ones dropped. */
function segments(points: readonly Pt[], x: number, y: number, cell: number): string[] {
  const unit = points.map(([px, py]) => `${(px - x) / cell},${(py - y) / cell}`);
  const out: string[] = [];
  for (let i = 1; i < unit.length; i++) {
    const a = unit[i - 1]!;
    const b = unit[i]!;
    if (a !== b) out.push([a, b].sort().join('-'));
  }
  return out;
}

/** Splits a segment along a grid line into unit pieces, so edges drawn in one stroke compare with single edges. */
function unitPieces(key: string): string[] {
  const [a, b] = key.split('-').map((p) => p.split(',').map(Number)) as [number[], number[]];
  const [x1, y1] = a as [number, number];
  const [x2, y2] = b as [number, number];
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  const dx = (x2 - x1) / steps;
  const dy = (y2 - y1) / steps;
  return Array.from({ length: steps }, (_, i) =>
    [`${x1 + i * dx},${y1 + i * dy}`, `${x1 + (i + 1) * dx},${y1 + (i + 1) * dy}`].sort().join('-'),
  );
}

describe('gridLines', () => {
  it('draws a 2 × 2 grid: border, the middle column, the middle row', () => {
    expect(gridLines(0, 0, 10, 2)).toEqual([
      [0, 0],
      [0, 20],
      [20, 20],
      [20, 0],
      [0, 0],
      [10, 0],
      [10, 20],
      [20, 20],
      [20, 10],
      [0, 10],
    ]);
  });

  it('a 1 × 1 grid is its border', () => {
    expect(gridLines(5, 5, 10, 1)).toEqual([
      [5, 5],
      [5, 15],
      [15, 15],
      [15, 5],
      [5, 5],
      [15, 5],
    ]);
  });

  it.each([2, 3, 4, 5, 6])('covers every edge of a %i × %i grid and nothing else', (n) => {
    const drawn = new Set(segments(gridLines(58, 52, 34, n), 58, 52, 34).flatMap(unitPieces));
    const expected = new Set<string>();
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j < n; j++) {
        expected.add([`${i},${j}`, `${i},${j + 1}`].sort().join('-'));
        expected.add([`${j},${i}`, `${j + 1},${i}`].sort().join('-'));
      }
    }
    expect([...drawn].sort()).toEqual([...expected].sort());
  });

  it('rejects a grid with no cells', () => {
    expect(() => gridLines(0, 0, 10, 0)).toThrow(/positive integer/);
  });
});

describe('upperCrosses', () => {
  it('draws the one masked cell of a 2 × 2 grid: a diagonal, the right edge, the other diagonal', () => {
    expect(upperCrosses(0, 0, 10, 2)).toEqual([
      [
        [10, 0],
        [20, 10],
        [20, 0],
        [10, 10],
      ],
    ]);
  });

  it('draws row 0 of a 3 × 3 grid as zigzags out and back, turning on the right edge', () => {
    expect(upperCrosses(0, 0, 1, 3)[0]).toEqual([
      [1, 0],
      [2, 1],
      [3, 0],
      [3, 1],
      [2, 0],
      [1, 1],
    ]);
    expect(upperCrosses(0, 0, 1, 3)).toHaveLength(2);
  });

  it('is empty for one cell, which is on the diagonal', () => {
    expect(upperCrosses(0, 0, 10, 1)).toEqual([]);
  });

  it.each([2, 3, 4, 5, 6])('crosses out exactly the cells above the diagonal of a %i × %i grid', (n) => {
    const drawn = upperCrosses(58, 288, 34, n).flatMap((row) => segments(row, 58, 288, 34));
    const diagonals = drawn.filter((key) => {
      const [a, b] = key.split('-').map((p) => p.split(',').map(Number)) as [number[], number[]];
      return a[0] !== b[0] && a[1] !== b[1];
    });
    const expected = new Set<string>();
    for (let r = 0; r < n; r++) {
      for (let c = r + 1; c < n; c++) {
        expected.add([`${c},${r}`, `${c + 1},${r + 1}`].sort().join('-'));
        expected.add([`${c + 1},${r}`, `${c},${r + 1}`].sort().join('-'));
      }
    }
    // Every diagonal is a whole cell's diagonal of a masked cell, and every one of them is drawn.
    expect(new Set(diagonals)).toEqual(expected);
  });

  it('runs along no edge of a masked cell except the grid border (so the compared cell keeps its own border)', () => {
    const n = 5;
    const edges = upperCrosses(0, 0, 1, n)
      .flatMap((row) => segments(row, 0, 0, 1))
      .filter((key) => {
        const [a, b] = key.split('-').map((p) => p.split(',').map(Number)) as [number[], number[]];
        return a[0] === b[0] || a[1] === b[1];
      })
      .flatMap(unitPieces);
    const onBorder = (key: string) =>
      key.split('-').every((p) => p.split(',').map(Number)[0] === n) ||
      key.split('-').every((p) => p.split(',').map(Number)[1] === 0);
    // An inner edge piece belongs to a masked cell when one of the two cells it separates is above the diagonal.
    const masked = (r: number, c: number) => r >= 0 && c < n && c > r;
    const touchesMasked = (key: string) => {
      const [[x1, y1], [x2, y2]] = key.split('-').map((p) => p.split(',').map(Number)) as [[number, number], [number, number]];
      if (x1 === x2) return masked(Math.min(y1, y2), x1 - 1) || masked(Math.min(y1, y2), x1);
      return masked(y1 - 1, Math.min(x1, x2)) || masked(y1, Math.min(x1, x2));
    };
    expect(edges.filter((key) => !onBorder(key) && touchesMasked(key))).toEqual([]);
  });
});

describe('FigArrow tone="accent" in figures.css', () => {
  const css = stripCssComments(readFileSync(new URL('../../../src/components/figures/figures.css', import.meta.url), 'utf8'));

  it('draws the line and the head in the accent colour', () => {
    expect(css).toMatch(/\.atlas-fig-arrow\[data-tone='accent'\]\s*\{[^}]*stroke:\s*var\(--atlas-fig-accent\)/);
    expect(css).toMatch(/\.atlas-fig-arrow-head\[data-tone='accent'\]\s*\{[^}]*fill:\s*var\(--atlas-fig-accent\)/);
  });
});
