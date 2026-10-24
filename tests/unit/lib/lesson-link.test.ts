import { describe, expect, it } from 'vitest';
import type { Lesson, LocaleStatus } from '../../../src/data/roadmap';
import { lessonLinkView } from '../../../src/lib/lesson-link';

function lesson(vi: LocaleStatus, en: LocaleStatus, shortTitle?: Lesson['shortTitle']): Lesson {
  return {
    id: 'ml/linear-regression',
    title: { vi: 'Hồi quy tuyến tính', en: 'Linear regression' },
    ...(shortTitle && { shortTitle }),
    prerequisites: [],
    status: { vi, en },
  };
}

describe('lessonLinkView', () => {
  it('planned in both locales: soon, no href', () => {
    const planned = lesson('planned', 'planned');
    expect(lessonLinkView(planned, 'vi')).toEqual({ id: 'ml/linear-regression', title: 'Hồi quy tuyến tính', state: 'soon' });
    expect(lessonLinkView(planned, 'en')).toEqual({ id: 'ml/linear-regression', title: 'Linear regression', state: 'soon' });
  });

  it('vi published only: open in vi, untranslated (Starlight fallback) in en', () => {
    const viOnly = lesson('published', 'planned');
    expect(lessonLinkView(viOnly, 'vi')).toMatchObject({ state: 'open', href: '/vi/ml/linear-regression/' });
    expect(lessonLinkView(viOnly, 'en')).toMatchObject({ state: 'untranslated', href: '/en/ml/linear-regression/' });
  });

  it('published in both locales: open in each', () => {
    const both = lesson('published', 'published');
    expect(lessonLinkView(both, 'vi')).toMatchObject({ state: 'open', href: '/vi/ml/linear-regression/' });
    expect(lessonLinkView(both, 'en')).toMatchObject({ state: 'open', href: '/en/ml/linear-regression/' });
  });

  it('opts.short uses shortTitle when there is one', () => {
    const short = lesson('published', 'published', { vi: 'Hồi quy', en: 'Regression' });
    expect(lessonLinkView(short, 'vi', { short: true }).title).toBe('Hồi quy');
    expect(lessonLinkView(short, 'en', { short: true }).title).toBe('Regression');
    expect(lessonLinkView(short, 'en').title).toBe('Linear regression');
  });

  it('opts.short falls back to title without shortTitle', () => {
    expect(lessonLinkView(lesson('planned', 'planned'), 'vi', { short: true }).title).toBe('Hồi quy tuyến tính');
  });
});
