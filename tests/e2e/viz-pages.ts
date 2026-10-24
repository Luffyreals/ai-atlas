// VIZ pages, shared by viz.spec.ts (both projects) and viz-meta.spec.ts (desktop only).
// Not a spec: Playwright only runs *.spec.ts.
import { expect, type Locator, type Page } from '@playwright/test';
import { LESSONS, LOCALES } from '../../src/data/roadmap';
import { isTranslated } from '../../src/lib/roadmap';
import { lessonShape } from '../unit/fixtures/lesson-shape';
import { readSource } from './lesson-pages';

export const SCHEMES = ['light', 'dark'] as const;
export const CONTROLS = 'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';

/** VIZ tags written in a lesson file: components imported from @components/viz/. */
export function vizCount(source: string): number {
  const shape = lessonShape(source);
  const names = shape.imports.flatMap((statement) => {
    const match = /^import (\w+) from '@components\/viz\/[\w/-]+\.astro'$/.exec(statement);
    return match?.[1] ? [match[1]] : [];
  });
  return names.reduce((sum, name) => sum + (shape.components[name] ?? 0), 0);
}

export const PAGES = LESSONS.filter((lesson) => lesson.status.vi === 'published').flatMap((lesson) =>
  LOCALES.map((locale) => {
    const source = readSource(isTranslated(lesson, locale) ? locale : 'vi', lesson.id);
    return { path: `/${locale}/${lesson.id}/`, locale, count: vizCount(source) };
  }),
).filter((page) => page.count > 0);

/** Every VIZ of the page, scrolled to, hydrated, and its controls enabled (they are disabled until then). */
export async function hydrateAll(page: Page): Promise<Locator[]> {
  const blocks = await page.locator('.atlas-viz').all();
  for (const viz of blocks) await hydrate(viz);
  return blocks;
}

export async function hydrate(viz: Locator): Promise<void> {
  await viz.scrollIntoViewIfNeeded();
  await expect(viz.locator('astro-island')).toHaveCount(1);
  await expect(viz.locator('astro-island:not([ssr])')).toHaveCount(1);
  // Astro drops `ssr` when it calls hydrateRoot; React commits a little later. Enabled controls mean it did.
  await expect(viz.locator(':is(input, button, select, textarea):disabled')).toHaveCount(0);
}
