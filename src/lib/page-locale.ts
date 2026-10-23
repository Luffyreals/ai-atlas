// The language of the current Starlight page, for component wrappers (Astro.locals.starlightRoute).
import { LOCALES, type Locale } from '../data/roadmap';

/** The fields of Starlight's route data these helpers read. */
export interface RouteLanguage {
  locale: string | undefined;
  isFallback?: boolean | undefined;
  entryMeta: { lang: string };
}

/** UI language from the URL: 'en' on /en/… (a fallback page included), 'vi' otherwise. */
export function getPageLocale(route: Pick<RouteLanguage, 'locale'>): Locale {
  return LOCALES.find((locale) => locale === route.locale) ?? 'vi';
}

/**
 * `lang` for the parts a component takes from the lesson file (quiz text, code caption). On a fallback page
 * (the vi lesson on /en/…) that is the file's language; elsewhere undefined, so they inherit the page's.
 */
export function getContentLang(route: RouteLanguage): string | undefined {
  return route.isFallback ? route.entryMeta.lang : undefined;
}
