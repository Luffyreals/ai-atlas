// Search engine rules for pages shown in a language they have no file in (decision 30 in docs/decisions.md):
// Starlight's fallback pages, e.g. /en/ml/linear-regression/ showing the vi lesson while it has no en file.
// Such a page stays reachable but is noindex, out of the sitemap, and no page names it as an hreflang
// alternate. It is also out of the Pagefind search index (decision 33). All of this lifts by itself once the file exists and roadmap.ts says status.en = 'published'.
// Loaded by astro.config.ts: relative imports only, never `astro:*` (the type import below is erased).
import type { StarlightRouteData } from '@astrojs/starlight/route-data';
import { OG_IMAGE, OG_LOCALE } from '../data/og';
import { LOCALES, type Locale } from '../data/roadmap';
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

// Share tags, the 404 page and robots.txt (docs/architecture/launch.md, section 3.3).

/** The language of the text on the page: entryMeta.lang ('vi' on a fallback page under /en/). */
export function contentLang(route: Pick<StarlightRouteData, 'entryMeta'>): Locale {
  return route.entryMeta.lang === 'en' ? 'en' : 'vi';
}

const isMeta = (key: 'name' | 'property', value: string) => (item: Head[number]) =>
  item.tag === 'meta' && item.attrs?.[key] === value;
const isHreflang = ({ tag, attrs }: Head[number]) =>
  tag === 'link' && attrs?.rel === 'alternate' && typeof attrs.hreflang === 'string';

/**
 * Starlight's share tags made right for this site, after fallbackSeoHead:
 * - og:locale as vi_VN/en_US, from the language of the text, and og:locale:alternate for each other language
 *   the page still names as an hreflang alternate (so an untranslated lesson does not advertise en);
 * - og:image (absolute, with type, size and alt) and twitter:image, the card of the text's language, unless
 *   the page sets its own og:image in its frontmatter `head`;
 * - og:type website on the homepage (Starlight says article everywhere).
 */
export function socialHead(head: Head, options: { site: URL; lang: Locale; isHome: boolean }): Head {
  const { site, lang, isHome } = options;
  const result: Head = head.map((item) => {
    if (isMeta('property', 'og:locale')(item)) return { ...item, attrs: { ...item.attrs, content: OG_LOCALE[lang] } };
    if (isHome && isMeta('property', 'og:type')(item)) return { ...item, attrs: { ...item.attrs, content: 'website' } };
    return item;
  });

  const named = new Set(head.filter(isHreflang).map(({ attrs }) => attrs?.hreflang));
  for (const other of LOCALES) {
    if (other !== lang && named.has(other)) {
      result.push({ tag: 'meta', attrs: { property: 'og:locale:alternate', content: OG_LOCALE[other] } });
    }
  }

  if (!head.some(isMeta('property', 'og:image'))) {
    const image = new URL(OG_IMAGE.path[lang], site).href;
    const alt = OG_IMAGE.alt[lang];
    result.push(
      { tag: 'meta', attrs: { property: 'og:image', content: image } },
      { tag: 'meta', attrs: { property: 'og:image:type', content: OG_IMAGE.type } },
      { tag: 'meta', attrs: { property: 'og:image:width', content: String(OG_IMAGE.width) } },
      { tag: 'meta', attrs: { property: 'og:image:height', content: String(OG_IMAGE.height) } },
      { tag: 'meta', attrs: { property: 'og:image:alt', content: alt } },
      { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
      { tag: 'meta', attrs: { name: 'twitter:image:alt', content: alt } },
    );
  }
  return result;
}

/**
 * On the 404 page only (Starlight id '404'): noindex, and no canonical, og:url, og:locale:alternate or hreflang, which all name
 * pages that do not exist (/404/, /vi/404/, /en/404/). Cloudflare Pages serves it with status 404, but
 * /404.html opened directly answers 200.
 */
export function notFoundHead(head: Head, route: Pick<StarlightRouteData, 'id'>): Head {
  if (route.id !== '404') return head;
  const isCanonical = ({ tag, attrs }: Head[number]) => tag === 'link' && attrs?.rel === 'canonical';
  // og:locale:alternate too: like hreflang, it names a translation the 404 page does not have.
  const kept = head.filter(
    (item) =>
      !isCanonical(item) &&
      !isMeta('property', 'og:url')(item) &&
      !isMeta('property', 'og:locale:alternate')(item) &&
      !isHreflang(item),
  );
  if (kept.some(isMeta('name', 'robots'))) return kept;
  return [...kept, { tag: 'meta', attrs: { name: 'robots', content: 'noindex' } }];
}

/**
 * dist/robots.txt (src/pages/robots.txt.ts). Nothing is disallowed: dev/, fallback and 404 pages carry
 * noindex, which a crawler blocked by robots.txt could not read.
 */
export function robotsTxt(site: URL): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`;
}
