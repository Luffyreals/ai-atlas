import { describe, expect, it } from 'vitest';
import { LESSONS, PART_IDS, PARTS } from '../../src/data/roadmap';
import type { Lesson, LessonId, Part } from '../../src/data/roadmap';
import {
  LESSON_ID_PATTERN,
  findCycle,
  getDependents,
  getFirstOpenLesson,
  getLessonUrl,
  getPartIdOf,
  getPrerequisites,
  getRouteLessonId,
  validateRoadmap,
} from '../../src/lib/roadmap';

function lesson(id: LessonId, prerequisites: LessonId[] = [], extra: Partial<Lesson> = {}): Lesson {
  return {
    id,
    title: { vi: `vi ${id}`, en: `en ${id}` },
    prerequisites,
    status: { vi: 'planned', en: 'planned' },
    ...extra,
  };
}

function kinds(parts: readonly Part[], lessons: readonly Lesson[]): string[] {
  return validateRoadmap(parts, lessons).map((issue) => issue.kind);
}

describe('roadmap data', () => {
  it('is valid', () => {
    expect(validateRoadmap(PARTS, LESSONS)).toEqual([]);
  });

  it('has the 7 parts in order and the planned number of lessons', () => {
    expect(PARTS.map((part) => part.id)).toEqual([...PART_IDS]);

    const counts = Object.fromEntries(
      PART_IDS.map((partId) => [partId, LESSONS.filter((l) => getPartIdOf(l.id) === partId).length]),
    );
    expect(counts).toEqual({ python: 7, math: 3, ml: 14, dl: 8, nlp: 13, cv: 10, llm: 23 });
    expect(LESSONS).toHaveLength(78);
  });

  it('uses well-formed, unique ids', () => {
    for (const { id } of LESSONS) expect(id).toMatch(LESSON_ID_PATTERN);
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
  });

  it('contains the 5 MVP lessons', () => {
    const ids = LESSONS.map((l) => l.id);
    for (const id of [
      'ml/ml-overview',
      'ml/linear-regression',
      'ml/overfitting-underfitting',
      'ml/regularization',
      'ml/gradient-descent',
    ]) {
      expect(ids).toContain(id);
    }
  });

  it('gives every llm lesson a section and no other lesson one', () => {
    for (const l of LESSONS) {
      if (getPartIdOf(l.id) === 'llm') expect(['apps', 'build']).toContain(l.section);
      else expect(l.section).toBeUndefined();
    }
  });
});

describe('validateRoadmap with broken fixtures', () => {
  const parts: Part[] = PARTS.filter((part) => part.id === 'python' || part.id === 'math');

  it('reports an unknown prerequisite', () => {
    expect(kinds(parts, [lesson('python/a', ['python/missing'])])).toEqual(['unknown-prerequisite']);
  });

  it('reports a self prerequisite', () => {
    expect(kinds(parts, [lesson('python/a', ['python/a'])])).toContain('self-prerequisite');
  });

  it('reports a prerequisite placed after the lesson', () => {
    const issues = kinds(parts, [lesson('python/a', ['python/b']), lesson('python/b')]);
    expect(issues).toEqual(['prerequisite-after-lesson']);
  });

  it('reports a duplicate id', () => {
    expect(kinds(parts, [lesson('python/a'), lesson('python/a')])).toContain('duplicate-id');
  });

  it('reports a malformed id', () => {
    expect(kinds(parts, [lesson('python/Bad_Id')])).toEqual(['invalid-id']);
  });

  it('reports en published while vi is planned', () => {
    const issues = kinds(parts, [lesson('python/a', [], { status: { vi: 'planned', en: 'published' } })]);
    expect(issues).toEqual(['en-without-vi']);
  });

  it('reports a part whose lessons are not contiguous', () => {
    const issues = kinds(parts, [lesson('python/a'), lesson('math/b'), lesson('python/c')]);
    expect(issues).toEqual(['part-not-contiguous']);
  });

  it('reports parts out of order', () => {
    expect(kinds(parts, [lesson('math/a'), lesson('python/b')])).toEqual(['part-order']);
  });

  it('reports a cycle', () => {
    const issues = kinds(parts, [lesson('python/a', ['python/b']), lesson('python/b', ['python/a'])]);
    expect(issues).toContain('cycle');
  });
});

describe('findCycle', () => {
  it('returns the cycle path with the first id repeated at the end', () => {
    const cycle = findCycle([
      lesson('ml/a', ['ml/c']),
      lesson('ml/b', ['ml/a']),
      lesson('ml/c', ['ml/b']),
    ]);
    expect(cycle).not.toBeNull();
    expect(cycle).toHaveLength(4);
    expect(new Set(cycle)).toEqual(new Set(['ml/a', 'ml/b', 'ml/c']));
    expect(cycle?.[0]).toBe(cycle?.[3]);
  });

  it('returns null for the real roadmap', () => {
    expect(findCycle(LESSONS)).toBeNull();
  });
});

describe('lookup helpers', () => {
  it('returns direct prerequisites in declared order', () => {
    expect(getPrerequisites('ml/linear-regression').map((l) => l.id)).toEqual([
      'ml/ml-overview',
      'math/linear-algebra',
      'math/calculus',
    ]);
  });

  it('returns dependents', () => {
    const ids = getDependents('ml/linear-regression').map((l) => l.id);
    expect(ids).toContain('ml/overfitting-underfitting');
    expect(ids).toContain('ml/gradient-descent');
    expect(ids).not.toContain('ml/ml-overview');
  });

  it('builds lesson urls with a trailing slash', () => {
    expect(getLessonUrl('ml/linear-regression', 'en')).toBe('/en/ml/linear-regression/');
  });

  it('getFirstOpenLesson: the first lesson written in the locale, else the first with any page, or undefined', () => {
    const vi = { status: { vi: 'published', en: 'planned' } } as const;
    const both = { status: { vi: 'published', en: 'published' } } as const;
    expect(getFirstOpenLesson('vi', [lesson('python/a'), lesson('python/b')])).toBeUndefined();
    expect(getFirstOpenLesson('vi', [lesson('python/a'), lesson('ml/b', [], vi), lesson('ml/c', [], both)])?.id).toBe('ml/b');
    // en skips a vi-only lesson for the first one written in English (decision 43)...
    expect(getFirstOpenLesson('en', [lesson('python/a'), lesson('ml/b', [], vi), lesson('ml/c', [], both)])?.id).toBe('ml/c');
    // ...and falls back to the first page (shown as Starlight's fallback) while none is.
    expect(getFirstOpenLesson('en', [lesson('python/a'), lesson('ml/b', [], vi)])?.id).toBe('ml/b');
    // An en-only status is not a page (the vi page comes first).
    expect(getFirstOpenLesson('en', [lesson('python/a', [], { status: { vi: 'planned', en: 'published' } })])).toBeUndefined();
    expect(getFirstOpenLesson()).toBe(LESSONS.find((item) => item.status.vi === 'published'));
  });

  it('maps route ids to lesson ids', () => {
    expect(getRouteLessonId('vi/ml/linear-regression')).toBe('ml/linear-regression');
    expect(getRouteLessonId('vi/index')).toBeUndefined();
    expect(getRouteLessonId('vi/dev/components')).toBeUndefined();
  });
});
