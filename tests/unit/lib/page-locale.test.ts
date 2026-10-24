import { describe, expect, it } from 'vitest';
import { getContentLang, getPageLocale, type RouteLanguage } from '../../../src/lib/page-locale';

/** Route data the way Starlight gives it: `locale` from the URL, `entryMeta.lang` from the file. */
function route(locale: string | undefined, fileLang: string, isFallback?: boolean): RouteLanguage {
  return { locale, entryMeta: { lang: fileLang }, ...(isFallback !== undefined && { isFallback }) };
}

describe('getPageLocale', () => {
  it('is the locale of the URL', () => {
    expect(getPageLocale(route('vi', 'vi'))).toBe('vi');
    expect(getPageLocale(route('en', 'en'))).toBe('en');
  });

  it('is the URL locale on a fallback page too, not the language of the file shown', () => {
    expect(getPageLocale(route('en', 'vi', true))).toBe('en');
  });

  it('falls back to vi when the route has no locale (the 404 page) or an unknown one', () => {
    expect(getPageLocale(route(undefined, 'vi'))).toBe('vi');
    expect(getPageLocale(route('fr', 'fr'))).toBe('vi');
  });
});

describe('getContentLang', () => {
  it('is the language of the file on a fallback page (the vi lesson on /en/…)', () => {
    expect(getContentLang(route('en', 'vi', true))).toBe('vi');
  });

  it('is undefined on a page with its own file, so content inherits the page language', () => {
    expect(getContentLang(route('vi', 'vi'))).toBeUndefined();
    expect(getContentLang(route('en', 'en', false))).toBeUndefined();
  });
});
