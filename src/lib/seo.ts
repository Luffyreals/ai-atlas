// Search engine rules for pages shown in a language they have no file in (decision 30 in docs/decisions.md):
// Starlight's fallback pages, e.g. /en/ml/linear-regression/ showing the vi lesson while it has no en file.
// Such a page stays reachable but is noindex, out of the sitemap, and no page names it as an hreflang
// alternate. It is also out of the Pagefind search index (decision 33). All of this lifts by itself once the file exists and roadmap.ts says status.en = 'published'.
// Loaded by astro.config.ts: relative imports only, never `astro:*` (the type import below is erased).
import type { StarlightRouteData } from '@astrojs/starlight/route-data';
import { LOCALES } from '../data/roadmap';
import { getLesson, getRouteLessonId, isTranslated } from './roadmap';

type Head = StarlightRouteData['head'];

/**
 * True when `lang` is a locale the page has no file in yet, from the roadmap (roadmap-files.test.ts keeps
 * `status` equal to the files). Lessons only: any other page (homepage, dev/) has a file in every locale,
 * which roadmap-files.test.ts enforces.
 */
function isUntranslated(routeId: string, lang: string): boolean {
  const lessonId = getRouteLessonId(routeId);
  const lesson = lessonId === undefined ? undefined : getLesson(lessonId);
  return lesson !== undefined && LOCALES.some((locale) => locale === lang && !isTranslated(lesson, locale));
}

/**
 * The `filter` of @astrojs/sitemap (full page URL): leaves out internal pages (/vi/dev/…, /en/dev/…,
 * decision 11) and fallback pages of lessons not yet translated.
 */
export function isInSitemap(page: string): boolean {
  const { pathname } = new URL(page);
  if (/^\/(vi|en)\/dev\//.test(pathname)) return false;
  const routeId = pathname.replace(/^\/|\/$/g, ''); // '/en/ml/linear-regression/' -> 'en/ml/linear-regression'
  return !isUntranslated(routeId, routeId.split('/')[0] ?? '');
}

/** The route data `fallbackSeoHead` reads: Starlight's `id` ('en/ml/linear-regression'), `lang`, `isFallback`. */
export type FallbackSeoRoute = Pick<StarlightRouteData, 'id' | 'lang' | 'isFallback'>;

/**
 * `starlightRoute.head` with decision 30 applied. Drops each <link rel="alternate" hreflang> to a language
 * the page has no file in: the page's own language on a fallback page, en on the vi page of an untranslated
 * lesson. x-default stays (it names the vi page). A fallback page also gets <meta name="robots"
 * content="noindex">, unless its head already has a robots tag.
 */
export function fallbackSeoHead(head: Head, route: FallbackSeoRoute): Head {
  const missing = (lang: string) => (route.isFallback === true && lang === route.lang) || isUntranslated(route.id, lang);
  const kept = head.filter(
    ({ tag, attrs }) => !(tag === 'link' && attrs?.rel === 'alternate' && typeof attrs.hreflang === 'string' && missing(attrs.hreflang)),
  );
  const hasRobots = kept.some(({ tag, attrs }) => tag === 'meta' && attrs?.name === 'robots');
  if (route.isFallback !== true || hasRobots) return kept;
  return [...kept, { tag: 'meta', attrs: { name: 'robots', content: 'noindex' } }];
}

type Entry = StarlightRouteData['entry'];

/**
 * `starlightRoute.entry` with `pagefind: false` on a fallback page (decision 33), so the vi text shown on
 * /en/… stays out of the en search index. Returns a copy: Starlight shares the entry with the vi page.
 */
export function fallbackSearchEntry(entry: Entry, route: Pick<StarlightRouteData, 'isFallback'>): Entry {
  if (route.isFallback !== true || entry.data.pagefind === false) return entry;
  return { ...entry, data: { ...entry.data, pagefind: false } };
}
