// Decision 30 in docs/mvp.md: a fallback page (a lesson shown in a language it has no file in) is noindex,
// out of the sitemap, and nobody's hreflang alternate. Expectations are read from the roadmap, so these tests
// keep holding when a lesson gets its en file.
import type { StarlightRouteData } from '@astrojs/starlight/route-data';
import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../src/data/roadmap';
import { hasPage, isTranslated } from '../../src/lib/roadmap';
import { fallbackSearchEntry, fallbackSeoHead, isInSitemap, type FallbackSeoRoute } from '../../src/lib/seo';

type Head = StarlightRouteData['head'];

const SITE = 'https://ai-atlas.pages.dev';
const url = (path: string) => new URL(path, SITE).href;

/** The tags Starlight's getHead() puts in for `/<locale>/<pageId>/` that matter here. */
function starlightHead(pageId: string, locale: 'vi' | 'en'): Head {
  const path = (lang: string) => url(pageId ? `/${lang}/${pageId}/` : `/${lang}/`);
  return [
    { tag: 'title', content: 'Page | AI Atlas' },
    { tag: 'link', attrs: { rel: 'canonical', href: path(locale) } },
    { tag: 'link', attrs: { rel: 'alternate', hreflang: 'vi', href: path('vi') } },
    { tag: 'link', attrs: { rel: 'alternate', hreflang: 'en', href: path('en') } },
    { tag: 'link', attrs: { rel: 'alternate', hreflang: 'x-default', href: path('vi') } },
    { tag: 'link', attrs: { rel: 'sitemap', href: '/sitemap-index.xml' } },
  ];
}

const hreflangs = (head: Head) =>
  head.filter(({ tag, attrs }) => tag === 'link' && attrs?.rel === 'alternate').map(({ attrs }) => attrs?.hreflang);
const robots = (head: Head) => head.filter(({ tag, attrs }) => tag === 'meta' && attrs?.name === 'robots');

const WITH_PAGE = LESSONS.filter(hasPage);
const VI_ONLY = WITH_PAGE.filter((lesson) => !isTranslated(lesson, 'en'));
const BOTH = WITH_PAGE.filter((lesson) => isTranslated(lesson, 'en'));

describe('isInSitemap', () => {
  it('keeps the homepages and leaves out internal /dev/ pages', () => {
    expect(isInSitemap(url('/vi/'))).toBe(true);
    expect(isInSitemap(url('/en/'))).toBe(true);
    expect(isInSitemap(url('/vi/dev/components/'))).toBe(false);
    expect(isInSitemap(url('/en/dev/components/'))).toBe(false);
  });

  it('keeps the vi page of every lesson, and the en page only once the lesson is translated', () => {
    expect(WITH_PAGE.length, 'some lesson has a page').toBeGreaterThan(0);
    for (const lesson of WITH_PAGE) {
      expect(isInSitemap(url(`/vi/${lesson.id}/`)), `/vi/${lesson.id}/`).toBe(true);
      expect(isInSitemap(url(`/en/${lesson.id}/`)), `/en/${lesson.id}/`).toBe(isTranslated(lesson, 'en'));
    }
  });

  it('leaves out /en/ml/linear-regression/ while the lesson is vi only', () => {
    const lesson = LESSONS.find(({ id }) => id === 'ml/linear-regression');
    expect(lesson).toBeDefined();
    expect(isInSitemap(url('/en/ml/linear-regression/'))).toBe(isTranslated(lesson!, 'en'));
  });

  it('keeps pages that are not lessons, and reads only the path of the URL', () => {
    expect(isInSitemap(url('/vi/about/'))).toBe(true);
    expect(isInSitemap(url('/en/about/'))).toBe(true);
    expect(isInSitemap(url('/vi/devtools/'))).toBe(true);
    for (const lesson of VI_ONLY) expect(isInSitemap(`${url(`/en/${lesson.id}/`)}?x=1#top`)).toBe(false);
  });
});

describe('fallbackSeoHead', () => {
  const route = (id: string, lang: 'vi' | 'en', isFallback?: boolean): FallbackSeoRoute => ({ id, lang, isFallback });

  it('vi page of a lesson with no en file: no hreflang="en", vi and x-default stay, no noindex', () => {
    for (const lesson of VI_ONLY) {
      const head = fallbackSeoHead(starlightHead(lesson.id, 'vi'), route(`vi/${lesson.id}`, 'vi'));
      expect(hreflangs(head), lesson.id).toEqual(['vi', 'x-default']);
      expect(robots(head), lesson.id).toEqual([]);
    }
  });

  it('its en fallback page: noindex, does not name itself in hreflang, x-default still names the vi page', () => {
    for (const lesson of VI_ONLY) {
      const before = starlightHead(lesson.id, 'en');
      const head = fallbackSeoHead(before, route(`en/${lesson.id}`, 'en', true));
      expect(hreflangs(head), lesson.id).toEqual(['vi', 'x-default']);
      expect(robots(head), lesson.id).toEqual([{ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } }]);
      // Everything else is left as it was: title, canonical, sitemap link.
      const others = (h: Head) => h.filter(({ attrs }) => attrs?.rel !== 'alternate' && attrs?.name !== 'robots');
      expect(others(head)).toEqual(others(before));
    }
  });

  it('a lesson in both languages: the head is unchanged on both pages', () => {
    for (const lesson of BOTH) {
      for (const lang of ['vi', 'en'] as const) {
        const before = starlightHead(lesson.id, lang);
        expect(fallbackSeoHead(before, route(`${lang}/${lesson.id}`, lang, false))).toEqual(before);
      }
    }
  });

  it('pages that are not lessons are unchanged unless Starlight says they are a fallback', () => {
    for (const lang of ['vi', 'en'] as const) {
      const before = starlightHead('', lang);
      expect(fallbackSeoHead(before, route(lang, lang))).toEqual(before);
      expect(fallbackSeoHead(starlightHead('dev/components', lang), route(`${lang}/dev/components`, lang, false))).toEqual(
        starlightHead('dev/components', lang),
      );
    }
  });

  it('any page with isFallback: noindex and no hreflang to its own language, from Starlight alone', () => {
    const head = fallbackSeoHead(starlightHead('about', 'en'), route('en/about', 'en', true));
    expect(hreflangs(head)).toEqual(['vi', 'x-default']);
    expect(robots(head)).toHaveLength(1);
  });

  it('adds no second robots tag when the page already has one', () => {
    const own = { tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' } } as const;
    const head = fallbackSeoHead([...starlightHead('about', 'en'), own], route('en/about', 'en', true));
    expect(robots(head)).toEqual([own]);
  });

  it('does not change the head it is given', () => {
    for (const lesson of VI_ONLY) {
      const before = starlightHead(lesson.id, 'en');
      const copy = structuredClone(before);
      fallbackSeoHead(before, route(`en/${lesson.id}`, 'en', true));
      expect(before).toEqual(copy);
    }
  });
});

// Decision 33: Starlight sets data-pagefind-body from entry.data.pagefind, so a fallback page gets false.
describe('fallbackSearchEntry', () => {
  type Entry = StarlightRouteData['entry'];
  const entry = (pagefind?: boolean) =>
    ({ id: 'vi/ml/linear-regression', data: { title: 'Hồi quy tuyến tính', ...(pagefind === undefined ? {} : { pagefind }) } }) as unknown as Entry;

  it('a fallback page is left out of the search index', () => {
    expect(fallbackSearchEntry(entry(), { isFallback: true }).data.pagefind).toBe(false);
    expect(fallbackSearchEntry(entry(true), { isFallback: true }).data.pagefind).toBe(false);
  });

  it('any other page gets back the same entry', () => {
    for (const isFallback of [false, undefined]) {
      const given = entry();
      expect(fallbackSearchEntry(given, { isFallback })).toBe(given);
    }
  });

  it('does not change the entry it is given, which Starlight shares with the vi page', () => {
    const given = entry(true);
    fallbackSearchEntry(given, { isFallback: true });
    expect(given.data.pagefind).toBe(true);
  });
});
