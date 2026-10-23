// Link or plain text for a lesson, shared by Prerequisites and RoadmapMap.
// Pure; relative imports only.
import type { Lesson, LessonId, Locale } from '../data/roadmap';
import { getLessonUrl, hasPage, isTranslated } from './roadmap';

export type LessonLinkState = 'open' | 'untranslated' | 'soon';

export interface LessonLinkView {
  id: LessonId;
  title: string; // title[locale], or shortTitle[locale] when opts.short
  state: LessonLinkState; // soon: no vi page; untranslated: vi page only, viewing en
  href?: string; // only when state !== 'soon', e.g. '/en/ml/linear-regression/'
}

export function lessonLinkView(lesson: Lesson, locale: Locale, opts?: { short?: boolean }): LessonLinkView {
  const title = (opts?.short ? (lesson.shortTitle ?? lesson.title) : lesson.title)[locale];
  if (!hasPage(lesson)) return { id: lesson.id, title, state: 'soon' };
  // An en page without its own translation is Starlight's fallback of the vi page.
  const state: LessonLinkState = isTranslated(lesson, locale) ? 'open' : 'untranslated';
  return { id: lesson.id, title, state, href: getLessonUrl(lesson.id, locale) };
}
