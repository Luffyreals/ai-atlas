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

// --- Contrast (WCAG 2.x), from the colours the browser computed ---
// Shared by viz.spec.ts and lessons.spec.ts. Playwright serialises a function passed to evaluate() on its
// own, so a measuring function cannot call helpers of this file: `installContrast` puts the core on
// `window.atlasContrast` first, and the measuring function (run in the page) reads it from there.

export type Rgba = [number, number, number, number];

export interface Contrast {
  what: string;
  color: string;
  background: string;
  ratio: number;
}

export interface ContrastCore {
  /** Any CSS colour as sRGB bytes and alpha 0–1 (a canvas turns it into pixels). */
  rgba(color: string): Rgba;
  /** `top` composited over `under`. */
  over(top: Rgba, under: Rgba): Rgba;
  /** The opaque background behind an element: the nearest backgrounds up the tree, composited. */
  backgroundOf(element: Element): Rgba;
  luminance(color: Rgba): number;
  /** Contrast of `colour` (composited over `background`) against `background`, rounded to 2 decimals. */
  pair(what: string, colour: string, background: Rgba): Contrast;
}

declare global {
  interface Window {
    atlasContrast?: ContrastCore;
  }
}

/** Runs in the page: defines window.atlasContrast. Self-contained, since Playwright sends only its source. */
function defineContrastCore(): void {
  let ctx: CanvasRenderingContext2D | null = null;
  const context = (): CanvasRenderingContext2D => {
    if (!ctx) {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    }
    return ctx;
  };
  type Rgba = [number, number, number, number];
  const rgba = (color: string): Rgba => {
    const c = context();
    c.clearRect(0, 0, 1, 1);
    c.fillStyle = 'rgba(0, 0, 0, 0)';
    c.fillStyle = color;
    c.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0, a = 0] = c.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const over = (top: Rgba, under: Rgba): Rgba => {
    const a = top[3];
    return [top[0] * a + under[0] * (1 - a), top[1] * a + under[1] * (1 - a), top[2] * a + under[2] * (1 - a), 1];
  };
  const backgroundOf = (element: Element): Rgba => {
    const layers: Rgba[] = [];
    for (let el: Element | null = element; el; el = el.parentElement) {
      const layer = rgba(getComputedStyle(el).backgroundColor);
      if (layer[3] > 0) layers.push(layer);
      if (layer[3] >= 1) break;
    }
    return layers.reduceRight<Rgba>((under, top) => over(top, under), [255, 255, 255, 1]);
  };
  const luminance = ([r, g, b]: Rgba) => {
    const channel = (value: number) => {
      const c = value / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const css = (c: Rgba) => `rgb(${c.slice(0, 3).map(Math.round).join(', ')})`;
  const pair = (what: string, colour: string, background: Rgba) => {
    const fg = over(rgba(colour), background);
    const [l1, l2] = [luminance(fg), luminance(background)].sort((a, b) => b - a) as [number, number];
    return { what, color: css(fg), background: css(background), ratio: Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100 };
  };
  window.atlasContrast = { rgba, over, backgroundOf, luminance, pair };
}

/** Defines window.atlasContrast in the page as loaded now (again after each navigation). */
export async function installContrast(page: Page): Promise<void> {
  await page.evaluate(defineContrastCore);
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
