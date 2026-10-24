// Lesson pages, shared by lessons.spec.ts (tests that depend on the viewport, both projects) and
// lessons-meta.spec.ts (tests that do not, desktop only). Not a spec: Playwright only runs *.spec.ts.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS, type Locale } from '../../src/data/roadmap';
import { hasPage } from '../../src/lib/roadmap';

export const DOCS_DIR = fileURLToPath(new URL('../../src/content/docs/', import.meta.url));

/** Lessons with a vi page, in roadmap order. */
export const WITH_PAGE = LESSONS.filter(hasPage);

export const pathOf = (locale: Locale, id: string) => `/${locale}/${id}/`;

/** The source of a page: src/content/docs/<locale>/<id>.mdx (or .md). */
export function readSource(locale: Locale, id: string): string {
  const file = ['.mdx', '.md'].map((ext) => join(DOCS_DIR, locale, id + ext)).find((path) => existsSync(path));
  if (!file) throw new Error(`no file for ${locale}/${id}`);
  return readFileSync(file, 'utf8');
}
