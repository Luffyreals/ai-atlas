// Helpers shared by the e2e specs (not a spec itself: Playwright only runs *.spec.ts).
// Expected strings come from the i18n files, the language of a lesson's content from roadmap.ts, so the
// specs hold while a lesson is vi-only and once it is translated.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, type Page } from '@playwright/test';
import type { Lesson, Locale } from '../../src/data/roadmap';
import { getContentLang, type RouteLanguage } from '../../src/lib/page-locale';
import { isTranslated } from '../../src/lib/roadmap';

/** The language a fallback page shows: Starlight's defaultLocale (astro.config.ts). */
const DEFAULT_LOCALE: Locale = 'vi';

// --- UI strings ---

export function readStrings(locale: Locale): Record<string, string> {
  return JSON.parse(readFileSync(fileURLToPath(new URL(`../../src/content/i18n/${locale}.json`, import.meta.url)), 'utf8'));
}

export const STRINGS: Record<Locale, Record<string, string>> = { vi: readStrings('vi'), en: readStrings('en') };

/** The string `atlas.<key>` of a locale; throws when it is missing or empty, so a test never expects "". */
export function s(locale: Locale, key: string): string {
  const value = STRINGS[locale][`atlas.${key}`];
  if (!value) throw new Error(`missing atlas.${key} in ${locale}.json`);
  return value;
}

// --- Lesson language, from roadmap.ts ---

/**
 * The route data Starlight gives the page /<locale>/<lesson>/, as far as src/lib/page-locale.ts reads it:
 * a lesson without its own file in `locale` is a fallback page showing the vi file.
 */
export function lessonRoute(lesson: Lesson, locale: Locale): RouteLanguage {
  const translated = isTranslated(lesson, locale);
  return { locale, isFallback: !translated, entryMeta: { lang: translated ? locale : DEFAULT_LOCALE } };
}

/** The `lang` the components put on the parts they take from the lesson file: null when there is none. */
export function contentLangAttr(lesson: Lesson, locale: Locale): string | null {
  return getContentLang(lessonRoute(lesson, locale)) ?? null;
}

/** The language of the text of /<locale>/<lesson>/: its own file, or the vi file on a fallback page. */
export function contentLocale(lesson: Lesson, locale: Locale): Locale {
  return (getContentLang(lessonRoute(lesson, locale)) as Locale | undefined) ?? locale;
}

// --- Page helpers ---

/** The mobile project (375px). */
export function isNarrow(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1280) <= 375;
}

/** Starlight moves the theme and language selects into the mobile menu below 50rem (800px). */
export async function showPreferences(page: Page): Promise<void> {
  if ((page.viewportSize()?.width ?? 800) < 800) await page.locator('button.sl-menu-button').click();
}

/**
 * Scrolls through the whole page, one viewport at a time, so lazy images load and every client:visible
 * island hydrates. `hydrated`: then checks no island is left unhydrated. `networkIdle`: then waits for it.
 */
export async function scrollThrough(
  page: Page,
  { hydrated = false, networkIdle = false }: { hydrated?: boolean; networkIdle?: boolean } = {},
): Promise<void> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = page.viewportSize()?.height ?? 800;
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(100);
  }
  if (hydrated) await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  if (networkIdle) await page.waitForLoadState('networkidle');
}

export interface AxNode {
  role: string;
  name: string;
  ignored: boolean;
}

/** Role and accessible name that Chrome itself computes (CDP Accessibility domain) for each match, in order. */
export async function axNames(page: Page, selector: string): Promise<AxNode[]> {
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send('Accessibility.enable');
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector });
    const result: AxNode[] = [];
    for (const nodeId of nodeIds) {
      const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
      const node = nodes[0];
      result.push({ role: String(node?.role?.value ?? ''), name: String(node?.name?.value ?? ''), ignored: !!node?.ignored });
    }
    return result;
  } finally {
    await cdp.detach();
  }
}
