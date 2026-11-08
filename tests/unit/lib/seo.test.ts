// Decision 30 in docs/decisions.md: a fallback page (a lesson shown in a language it has no file in) is noindex,
// out of the sitemap, and nobody's hreflang alternate. Expectations are read from the roadmap, so these tests
// keep holding when a lesson gets its en file.
import type { StarlightRouteData } from '@astrojs/starlight/route-data';
import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../../src/data/roadmap';
import { hasPage, isTranslated } from '../../../src/lib/roadmap';
import { OG_IMAGE, OG_LOCALE } from '../../../src/data/og';
import {
  contentLang,
  fallbackSearchEntry,
  fallbackSeoHead,
  isInSitemap,
  notFoundHead,
  robotsTxt,
  socialHead,
  type FallbackSeoRoute,
} from '../../../src/lib/seo';

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

// --- M4: share tags, the 404 page, robots.txt (docs/architecture/launch.md, sections 3.3.2–3.3.4 and 8) ---

/** starlightHead() plus the share tags Starlight's getHead() puts in. */
function starlightShareHead(pageId: string, locale: 'vi' | 'en'): Head {
  return [
    ...starlightHead(pageId, locale),
    { tag: 'meta', attrs: { property: 'og:title', content: 'Page' } },
    { tag: 'meta', attrs: { property: 'og:type', content: 'article' } },
    { tag: 'meta', attrs: { property: 'og:url', content: url(pageId ? `/${locale}/${pageId}/` : `/${locale}/`) } },
    { tag: 'meta', attrs: { property: 'og:locale', content: locale } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: 'AI Atlas' } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
  ];
}

const SITE_URL = new URL(SITE);
const metaOf = (head: Head, key: 'property' | 'name', value: string) =>
  head.filter(({ tag, attrs }) => tag === 'meta' && attrs?.[key] === value).map(({ attrs }) => attrs?.content);

describe('contentLang', () => {
  it('is the language of the text: entryMeta.lang', () => {
    expect(contentLang({ entryMeta: { lang: 'vi' } } as never)).toBe('vi');
    expect(contentLang({ entryMeta: { lang: 'en' } } as never)).toBe('en');
  });

  it('a fallback page under /en/ shows the vi file, so it is vi', () => {
    // Starlight gives a fallback page the entryMeta of the default locale's file.
    expect(contentLang({ entryMeta: { lang: 'vi', locale: undefined } } as never)).toBe('vi');
  });

  it('anything that is not en counts as vi (the default locale)', () => {
    expect(contentLang({ entryMeta: { lang: 'vi-VN' } } as never)).toBe('vi');
  });
});

describe('socialHead', () => {
  it('og:locale becomes vi_VN / en_US, from the language of the text', () => {
    for (const lang of ['vi', 'en'] as const) {
      const head = socialHead(starlightShareHead('ml/linear-regression', lang), { site: SITE_URL, lang, isHome: false });
      expect(metaOf(head, 'property', 'og:locale')).toEqual([OG_LOCALE[lang]]);
    }
    expect(OG_LOCALE).toEqual({ vi: 'vi_VN', en: 'en_US' });
  });

  it('og:locale:alternate only for the other language that the page still names in hreflang', () => {
    const both = socialHead(starlightShareHead('ml/linear-regression', 'vi'), { site: SITE_URL, lang: 'vi', isHome: false });
    expect(metaOf(both, 'property', 'og:locale:alternate')).toEqual(['en_US']);
    const en = socialHead(starlightShareHead('ml/linear-regression', 'en'), { site: SITE_URL, lang: 'en', isHome: false });
    expect(metaOf(en, 'property', 'og:locale:alternate')).toEqual(['vi_VN']);

    // A vi-only lesson, after fallbackSeoHead: no hreflang="en", so no en_US alternate, on either page.
    for (const lesson of VI_ONLY) {
      const vi = fallbackSeoHead(starlightShareHead(lesson.id, 'vi'), { id: `vi/${lesson.id}`, lang: 'vi' });
      const viShared = socialHead(vi, { site: SITE_URL, lang: 'vi', isHome: false });
      expect(metaOf(viShared, 'property', 'og:locale:alternate'), lesson.id).toEqual([]);
      const fallback = fallbackSeoHead(starlightShareHead(lesson.id, 'en'), {
        id: `en/${lesson.id}`,
        lang: 'en',
        isFallback: true,
      });
      const shared = socialHead(fallback, { site: SITE_URL, lang: 'vi', isHome: false });
      expect(metaOf(shared, 'property', 'og:locale'), lesson.id).toEqual(['vi_VN']);
      expect(metaOf(shared, 'property', 'og:locale:alternate'), lesson.id).toEqual([]);
    }
    if (VI_ONLY.length === 0) {
      const fallback = fallbackSeoHead(starlightShareHead('mock-fallback', 'en'), {
        id: 'en/mock-fallback',
        lang: 'en',
        isFallback: true,
      });
      const shared = socialHead(fallback, { site: SITE_URL, lang: 'vi', isHome: false });
      expect(metaOf(shared, 'property', 'og:locale'), 'mock-fallback').toEqual(['vi_VN']);
      expect(metaOf(shared, 'property', 'og:locale:alternate'), 'mock-fallback').toEqual([]);
    }
  });

  it('x-default alone does not count as a language', () => {
    const head: Head = [
      { tag: 'link', attrs: { rel: 'alternate', hreflang: 'x-default', href: url('/vi/') } },
      { tag: 'meta', attrs: { property: 'og:locale', content: 'vi' } },
    ];
    const shared = socialHead(head, { site: SITE_URL, lang: 'vi', isHome: false });
    expect(metaOf(shared, 'property', 'og:locale:alternate')).toEqual([]);
  });

  it('og:image is absolute on `site`, with type, width, height and alt; twitter:image is the same URL', () => {
    for (const lang of ['vi', 'en'] as const) {
      const head = socialHead(starlightShareHead('about', lang), { site: SITE_URL, lang, isHome: false });
      const image = `${SITE}${OG_IMAGE.path[lang]}`;
      expect(metaOf(head, 'property', 'og:image')).toEqual([image]);
      expect(metaOf(head, 'property', 'og:image:type')).toEqual(['image/png']);
      expect(metaOf(head, 'property', 'og:image:width')).toEqual(['1200']);
      expect(metaOf(head, 'property', 'og:image:height')).toEqual(['630']);
      expect(metaOf(head, 'property', 'og:image:alt')).toEqual([OG_IMAGE.alt[lang]]);
      expect(metaOf(head, 'name', 'twitter:image')).toEqual([image]);
      expect(metaOf(head, 'name', 'twitter:image:alt')).toEqual([OG_IMAGE.alt[lang]]);
      // Starlight's card type stays.
      expect(metaOf(head, 'name', 'twitter:card')).toEqual(['summary_large_image']);
    }
  });

  it('og:image follows `site` (SITE_URL), with no double slash', () => {
    const head = socialHead(starlightShareHead('', 'en'), { site: new URL('https://example.org'), lang: 'en', isHome: true });
    expect(metaOf(head, 'property', 'og:image')).toEqual(['https://example.org/og/ai-atlas-en.png']);
    const local = socialHead(starlightShareHead('', 'vi'), { site: new URL('http://localhost:4321/'), lang: 'vi', isHome: true });
    expect(metaOf(local, 'property', 'og:image')).toEqual(['http://localhost:4321/og/ai-atlas-vi.png']);
  });

  it('a page with its own og:image (frontmatter head) keeps it, and gets no second one', () => {
    const own: Head[number] = { tag: 'meta', attrs: { property: 'og:image', content: 'https://example.org/own.png' } };
    const head = socialHead([...starlightShareHead('ml/linear-regression', 'vi'), own], {
      site: SITE_URL,
      lang: 'vi',
      isHome: false,
    });
    expect(metaOf(head, 'property', 'og:image')).toEqual(['https://example.org/own.png']);
    expect(metaOf(head, 'name', 'twitter:image')).toEqual([]);
  });

  it('og:type: website on the homepage only', () => {
    const home = socialHead(starlightShareHead('', 'vi'), { site: SITE_URL, lang: 'vi', isHome: true });
    expect(metaOf(home, 'property', 'og:type')).toEqual(['website']);
    const lesson = socialHead(starlightShareHead('ml/linear-regression', 'vi'), { site: SITE_URL, lang: 'vi', isHome: false });
    expect(metaOf(lesson, 'property', 'og:type')).toEqual(['article']);
  });

  it('keeps every other tag in place, and does not change the head it is given', () => {
    const before = starlightShareHead('ml/linear-regression', 'vi');
    const copy = structuredClone(before);
    const head = socialHead(before, { site: SITE_URL, lang: 'vi', isHome: false });
    expect(before).toEqual(copy);
    const rest = (h: Head) => h.filter(({ attrs }) => !['og:locale', 'og:type'].includes(String(attrs?.property)));
    expect(rest(head).slice(0, rest(before).length)).toEqual(rest(before));
  });
});

describe('notFoundHead', () => {
  it('on the 404 page: noindex, and no canonical, og:url or hreflang', () => {
    const head = notFoundHead(starlightShareHead('404', 'vi'), { id: '404' });
    expect(head.filter(({ attrs }) => attrs?.rel === 'canonical')).toEqual([]);
    expect(metaOf(head, 'property', 'og:url')).toEqual([]);
    expect(hreflangs(head)).toEqual([]);
    expect(robots(head)).toEqual([{ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } }]);
    // The rest stays: title, sitemap link, og:title.
    expect(head.some(({ tag }) => tag === 'title')).toBe(true);
    expect(head.some(({ attrs }) => attrs?.rel === 'sitemap')).toBe(true);
    expect(metaOf(head, 'property', 'og:title')).toEqual(['Page']);
  });

  it('on the 404 page, after socialHead: og:locale:alternate goes (no translation exists), og:locale stays', () => {
    const shared = socialHead(starlightShareHead('404', 'vi'), { site: SITE_URL, lang: 'vi', isHome: false });
    expect(metaOf(shared, 'property', 'og:locale:alternate'), 'precondition: socialHead added one').toEqual(['en_US']);
    const head = notFoundHead(shared, { id: '404' });
    expect(metaOf(head, 'property', 'og:locale:alternate')).toEqual([]);
    expect(metaOf(head, 'property', 'og:locale')).toEqual(['vi_VN']);
    // The share picture stays too.
    expect(metaOf(head, 'property', 'og:image')).toEqual([`${SITE}${OG_IMAGE.path.vi}`]);
  });

  it('any other page id keeps its og:locale:alternate', () => {
    const shared = socialHead(starlightShareHead('ml/linear-regression', 'vi'), { site: SITE_URL, lang: 'vi', isHome: false });
    expect(metaOf(notFoundHead(shared, { id: 'vi/ml/linear-regression' }), 'property', 'og:locale:alternate')).toEqual([
      'en_US',
    ]);
  });

  it('any other page id gets back the same head', () => {
    for (const id of ['vi/404', 'en/404', 'vi', 'vi/ml/linear-regression', 'en/about', '404/x', 'x404']) {
      const before = starlightShareHead('ml/linear-regression', 'vi');
      expect(notFoundHead(before, { id }), id).toBe(before);
    }
  });

  it('adds no second robots tag', () => {
    const own = { tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' } } as const;
    const head = notFoundHead([...starlightShareHead('404', 'vi'), own], { id: '404' });
    expect(robots(head)).toEqual([own]);
  });

  it('does not change the head it is given', () => {
    const before = starlightShareHead('404', 'vi');
    const copy = structuredClone(before);
    notFoundHead(before, { id: '404' });
    expect(before).toEqual(copy);
  });
});

describe('robotsTxt', () => {
  it('allows everything and names the sitemap index on `site`', () => {
    expect(robotsTxt(SITE_URL)).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap-index.xml\n`);
  });

  it('follows `site`, with or without a trailing slash', () => {
    expect(robotsTxt(new URL('https://example.org'))).toContain('Sitemap: https://example.org/sitemap-index.xml\n');
    expect(robotsTxt(new URL('https://example.org/'))).toContain('Sitemap: https://example.org/sitemap-index.xml\n');
  });

  it('disallows nothing: dev/, fallback and 404 pages carry noindex, which a blocked crawler could not read', () => {
    expect(robotsTxt(SITE_URL)).not.toMatch(/^Disallow/m);
  });
});
