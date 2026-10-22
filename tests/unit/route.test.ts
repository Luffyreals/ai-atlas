import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../src/data/roadmap';
import { requireLesson } from '../../src/lib/roadmap';
import { countParts, routeTo } from '../../src/lib/route';

/** Builds a prerequisitesOf() lookup from a plain adjacency list; unknown ids have none. */
function graph(edges: Record<string, string[]>): (id: string) => readonly string[] {
  return (id) => edges[id] ?? [];
}

const roadmapPrerequisites = (id: string) => requireLesson(id).prerequisites;

describe('routeTo on small graphs', () => {
  it('collects a diamond once per node', () => {
    // a needs b and c, both need d.
    const prerequisitesOf = graph({ a: ['b', 'c'], b: ['d'], c: ['d'] });
    const route = routeTo('a', prerequisitesOf);
    expect([...route].sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(route.size).toBe(4);
  });

  it('only walks backwards: dependents of the target are not on the route', () => {
    const prerequisitesOf = graph({ a: ['b'], b: ['c'], x: ['a'] });
    expect([...routeTo('b', prerequisitesOf)].sort()).toEqual(['b', 'c']);
  });

  it('terminates on cycles and self-loops', () => {
    const cyclic = graph({ a: ['b'], b: ['c'], c: ['a'] });
    expect([...routeTo('a', cyclic)].sort()).toEqual(['a', 'b', 'c']);
    expect([...routeTo('s', graph({ s: ['s'] }))]).toEqual(['s']);
  });

  it('returns just the id for an unknown id', () => {
    expect([...routeTo('nowhere', graph({ a: ['b'] }))]).toEqual(['nowhere']);
  });

  it('includes a prerequisite the lookup does not know (leaf)', () => {
    expect([...routeTo('a', graph({ a: ['ghost'] }))].sort()).toEqual(['a', 'ghost']);
  });
});

describe('countParts', () => {
  it('counts distinct "<part>/" prefixes', () => {
    expect(countParts(['ml/a', 'ml/b', 'math/c', 'python/d'])).toBe(3);
    expect(countParts(new Set(['llm/x']))).toBe(1);
  });

  it('is 0 for an empty route', () => {
    expect(countParts([])).toBe(0);
  });

  it('does not confuse parts that share a prefix', () => {
    // "ml" and "mlx" are different parts even though one starts with the other.
    expect(countParts(['ml/a', 'mlx/b'])).toBe(2);
  });
});

describe('routeTo on the real roadmap', () => {
  const lessonIds = new Set<string>(LESSONS.map((lesson) => lesson.id));

  it('ml/linear-regression: exactly 8 lessons across 3 parts (homepage default)', () => {
    const route = routeTo('ml/linear-regression', roadmapPrerequisites);
    expect([...route].sort()).toEqual(
      [
        'ml/linear-regression',
        'ml/ml-overview',
        'math/linear-algebra',
        'math/calculus',
        'python/numpy-pandas',
        'python/functions-strings-files',
        'python/data-structures',
        'python/basic-syntax',
      ].sort(),
    );
    expect(route.size).toBe(8);
    expect(countParts(route)).toBe(3);
  });

  it('every route only contains roadmap ids and is closed under prerequisites', () => {
    for (const lesson of LESSONS) {
      const route = routeTo(lesson.id, roadmapPrerequisites);
      expect(route.has(lesson.id), lesson.id).toBe(true);
      for (const id of route) {
        expect(lessonIds.has(id), `${lesson.id} -> ${id}`).toBe(true);
        for (const prerequisite of requireLesson(id).prerequisites) {
          expect(route.has(prerequisite), `${lesson.id}: ${id} needs ${prerequisite}`).toBe(true);
        }
      }
    }
  });

  it('a route never contains lessons listed after its destination', () => {
    // roadmap.ts orders prerequisites before the lessons that need them.
    const order = new Map<string, number>(LESSONS.map((lesson, index) => [lesson.id, index]));
    for (const lesson of LESSONS) {
      for (const id of routeTo(lesson.id, roadmapPrerequisites)) {
        expect(order.get(id)!, `${lesson.id} -> ${id}`).toBeLessThanOrEqual(order.get(lesson.id)!);
      }
    }
  });
});
