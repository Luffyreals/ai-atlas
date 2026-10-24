import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { LESSONS, LOCALES, PART_IDS } from '../../../src/data/roadmap';
import type { Locale } from '../../../src/data/roadmap';

const DOCS_DIR = fileURLToPath(new URL('../../../src/content/docs/', import.meta.url));

/** Pages that live in the docs collection but are not roadmap lessons. */
const NON_LESSON_PAGES = ['index', 'about', 'dev/components'];
const ALLOWED_DIRS = [...PART_IDS, 'dev'];

/** Page ids ("ml/linear-regression") of every .md/.mdx file under docs/<locale>/. */
function listPages(locale: Locale): string[] {
  const root = join(DOCS_DIR, locale);
  if (!existsSync(root)) return [];
  return readdirSync(root, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => relative(root, join(root, file)).split(sep).join('/').replace(/\.mdx?$/, ''));
}

function lessonFile(locale: Locale, id: string): string | undefined {
  return ['.mdx', '.md'].map((ext) => join(DOCS_DIR, locale, id + ext)).find((file) => existsSync(file));
}

/** Reads the `title:` line of the frontmatter, without surrounding quotes. */
function frontmatterTitle(file: string): string | undefined {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, 'utf8'))?.[1] ?? '';
  const raw = /^title:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim();
  return raw?.replace(/^(['"])(.*)\1$/, '$2');
}

describe('roadmap matches the files in src/content/docs', () => {
  it('only has locale folders at the top level', () => {
    expect(readdirSync(DOCS_DIR).sort()).toEqual([...LOCALES].sort());
  });

  // src/lib/seo.ts reads "has no file in this locale" from the roadmap, so it only knows about lessons.
  // A page that is not a lesson must therefore exist in every locale, or its fallback would stay in the sitemap.
  it('every page that is not a lesson has a file in every locale', () => {
    const lessonIds = new Set<string>(LESSONS.map((l) => l.id));
    const pages = new Map(LOCALES.map((locale) => [locale, new Set(listPages(locale))]));
    for (const locale of LOCALES) {
      for (const page of pages.get(locale) ?? []) {
        if (lessonIds.has(page)) continue;
        for (const other of LOCALES) expect(pages.get(other)?.has(page), `${other}/${page}`).toBe(true);
      }
    }
  });

  for (const locale of LOCALES) {
    it(`[${locale}] status is "published" exactly when the lesson file exists`, () => {
      for (const lesson of LESSONS) {
        const published = lesson.status[locale] === 'published';
        expect(lessonFile(locale, lesson.id) !== undefined, `${locale}/${lesson.id}`).toBe(published);
      }
    });

    it(`[${locale}] has no orphan pages`, () => {
      const lessonIds = new Set<string>(LESSONS.map((l) => l.id));
      for (const page of listPages(locale)) {
        expect(lessonIds.has(page) || NON_LESSON_PAGES.includes(page), `${locale}/${page}`).toBe(true);
      }
    });

    it(`[${locale}] only uses part folders and dev/`, () => {
      for (const page of listPages(locale)) {
        if (!page.includes('/')) continue;
        expect(ALLOWED_DIRS, `${locale}/${page}`).toContain(page.split('/')[0]);
      }
    });

    it(`[${locale}] frontmatter titles match roadmap titles`, () => {
      for (const lesson of LESSONS) {
        const file = lessonFile(locale, lesson.id);
        if (file) expect(frontmatterTitle(file), `${locale}/${lesson.id}`).toBe(lesson.title[locale]);
      }
    });
  }
});
