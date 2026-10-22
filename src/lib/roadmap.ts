// Query and validation helpers for the roadmap data.
// Loaded by astro.config.ts (via sidebar.ts): relative imports only, never `astro:*`.
import { LESSONS, LOCALES, PARTS } from '../data/roadmap';
import type { Lesson, LessonId, Locale, Part, PartId } from '../data/roadmap';

export const LESSON_ID_PATTERN = /^(python|math|ml|dl|nlp|cv|llm)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

const partById = new Map<string, Part>(PARTS.map((part) => [part.id, part]));
const lessonById = new Map<string, Lesson>(LESSONS.map((lesson) => [lesson.id, lesson]));

// Lookup

export function getPart(id: PartId): Part {
  const part = partById.get(id);
  if (!part) throw new Error(`Unknown roadmap part: "${id}"`);
  return part;
}

export function getLesson(id: string): Lesson | undefined {
  return lessonById.get(id);
}

export function requireLesson(id: string): Lesson {
  const lesson = lessonById.get(id);
  if (!lesson) throw new Error(`Unknown lesson id "${id}". Check src/data/roadmap.ts.`);
  return lesson;
}

export function getPartIdOf(lessonId: LessonId): PartId {
  return lessonId.slice(0, lessonId.indexOf('/')) as PartId;
}

export function getLessonsByPart(partId: PartId): Lesson[] {
  return LESSONS.filter((lesson) => getPartIdOf(lesson.id) === partId);
}

export function getLessonsBySection(partId: PartId, sectionId: string): Lesson[] {
  return getLessonsByPart(partId).filter((lesson) => lesson.section === sectionId);
}

export function getPrerequisites(id: LessonId): Lesson[] {
  return requireLesson(id).prerequisites.map((prereq) => requireLesson(prereq));
}

export function getDependents(id: LessonId): Lesson[] {
  return LESSONS.filter((lesson) => lesson.prerequisites.includes(id));
}

// Status

export function hasPage(lesson: Lesson): boolean {
  return lesson.status.vi === 'published';
}

export function isTranslated(lesson: Lesson, locale: Locale): boolean {
  return lesson.status[locale] === 'published';
}

export function getLessonUrl(id: LessonId, locale: Locale): string {
  return `/${locale}/${id}/`;
}

/** 'vi/ml/linear-regression' -> 'ml/linear-regression'; undefined for non-lesson pages. */
export function getRouteLessonId(routeId: string): LessonId | undefined {
  const slash = routeId.indexOf('/');
  if (slash === -1) return undefined;
  const locale = routeId.slice(0, slash);
  if (!(LOCALES as readonly string[]).includes(locale)) return undefined;
  return lessonById.get(routeId.slice(slash + 1))?.id;
}

// Validation

export type RoadmapIssue =
  | { kind: 'duplicate-id'; id: string }
  | { kind: 'invalid-id'; id: string }
  | { kind: 'unknown-part'; id: string }
  | { kind: 'part-not-contiguous'; partId: PartId }
  | { kind: 'part-order'; partId: PartId }
  | { kind: 'unknown-prerequisite'; id: string; prerequisite: string }
  | { kind: 'self-prerequisite'; id: string }
  | { kind: 'duplicate-prerequisite'; id: string; prerequisite: string }
  | { kind: 'prerequisite-after-lesson'; id: string; prerequisite: string }
  | { kind: 'cycle'; path: LessonId[] }
  | { kind: 'en-without-vi'; id: string }
  | { kind: 'invalid-section'; id: string; section: string | undefined }
  | { kind: 'empty-title'; id: string; locale: Locale };

/** Pure check of roadmap data. Returns an empty array when the data is valid. */
export function validateRoadmap(parts: readonly Part[], lessons: readonly Lesson[]): RoadmapIssue[] {
  const issues: RoadmapIssue[] = [];
  const partsById = new Map<string, Part>(parts.map((part) => [part.id, part]));
  const partRank = new Map<string, number>(parts.map((part, index) => [part.id, index]));

  // First index of each id, so "prerequisite after lesson" compares against the earliest occurrence.
  const indexById = new Map<string, number>();
  lessons.forEach((lesson, index) => {
    if (indexById.has(lesson.id)) issues.push({ kind: 'duplicate-id', id: lesson.id });
    else indexById.set(lesson.id, index);
  });

  // Part grouping: lessons of one part are contiguous, and parts follow the order of `parts`.
  const seenParts = new Set<string>();
  const reportedParts = new Set<string>();
  let previousPart: string | undefined;
  let previousRank = -1;

  lessons.forEach((lesson, index) => {
    if (!LESSON_ID_PATTERN.test(lesson.id)) issues.push({ kind: 'invalid-id', id: lesson.id });

    const partId = lesson.id.split('/')[0] ?? '';
    const part = partsById.get(partId);
    if (!part) {
      issues.push({ kind: 'unknown-part', id: lesson.id });
    } else {
      if (partId !== previousPart) {
        if (seenParts.has(partId) && !reportedParts.has(partId)) {
          issues.push({ kind: 'part-not-contiguous', partId: part.id });
          reportedParts.add(partId);
        } else if (!seenParts.has(partId)) {
          const rank = partRank.get(partId) ?? -1;
          if (rank < previousRank) issues.push({ kind: 'part-order', partId: part.id });
          previousRank = Math.max(previousRank, rank);
        }
        seenParts.add(partId);
        previousPart = partId;
      }

      const sectionIds = part.sections?.map((section) => section.id);
      const sectionOk = sectionIds
        ? lesson.section !== undefined && sectionIds.includes(lesson.section)
        : lesson.section === undefined;
      if (!sectionOk) issues.push({ kind: 'invalid-section', id: lesson.id, section: lesson.section });
    }

    for (const locale of LOCALES) {
      if (lesson.title[locale].trim() === '') issues.push({ kind: 'empty-title', id: lesson.id, locale });
    }

    if (lesson.status.en === 'published' && lesson.status.vi !== 'published') {
      issues.push({ kind: 'en-without-vi', id: lesson.id });
    }

    const seenPrereqs = new Set<string>();
    for (const prerequisite of lesson.prerequisites) {
      if (seenPrereqs.has(prerequisite)) {
        issues.push({ kind: 'duplicate-prerequisite', id: lesson.id, prerequisite });
        continue;
      }
      seenPrereqs.add(prerequisite);

      if (prerequisite === lesson.id) {
        issues.push({ kind: 'self-prerequisite', id: lesson.id });
        continue;
      }
      const prereqIndex = indexById.get(prerequisite);
      if (prereqIndex === undefined) {
        issues.push({ kind: 'unknown-prerequisite', id: lesson.id, prerequisite });
      } else if (prereqIndex > index) {
        issues.push({ kind: 'prerequisite-after-lesson', id: lesson.id, prerequisite });
      }
    }
  });

  const cycle = findCycle(lessons);
  if (cycle) issues.push({ kind: 'cycle', path: cycle });

  return issues;
}

/** Returns one cycle as a path (first id repeated at the end), or null if the graph is acyclic. */
export function findCycle(lessons: readonly Lesson[]): LessonId[] | null {
  const edges = new Map<LessonId, LessonId[]>(lessons.map((lesson) => [lesson.id, lesson.prerequisites]));
  // Three-color DFS: absent = white, 'gray' = on the current path, 'black' = fully explored.
  const color = new Map<LessonId, 'gray' | 'black'>();
  const path: LessonId[] = [];

  function visit(id: LessonId): LessonId[] | null {
    color.set(id, 'gray');
    path.push(id);
    for (const next of edges.get(id) ?? []) {
      if (!edges.has(next)) continue; // unknown ids are reported separately
      const state = color.get(next);
      if (state === 'gray') return [...path.slice(path.indexOf(next)), next];
      if (state === undefined) {
        const found = visit(next);
        if (found) return found;
      }
    }
    path.pop();
    color.set(id, 'black');
    return null;
  }

  for (const lesson of lessons) {
    if (!color.has(lesson.id)) {
      const found = visit(lesson.id);
      if (found) return found;
    }
  }
  return null;
}
