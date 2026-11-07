// The About page, src/content/docs/{vi,en}/about.mdx (docs/architecture/launch.md, section 3.1; decisions 34,
// 64–66). Not a lesson, so lesson-pairs.test.ts does not cover it: here the two files must match in shape
// (headings in order, links, components, imports), and keep the rules of the page: no link into the private
// repo, no lesson count, licence links where the design puts them.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CC_LICENCE_URL } from '../../../src/data/home';
import type { Locale } from '../../../src/data/roadmap';
import { lessonShape, prose, splitMdx } from '../fixtures/lesson-shape';

const read = (locale: Locale) =>
  readFileSync(fileURLToPath(new URL(`../../../src/content/docs/${locale}/about.mdx`, import.meta.url)), 'utf8');

const SOURCE = { vi: read('vi'), en: read('en') };

/** Heading levels in order, e.g. [2, 2, 2, 3, 3, …]. */
function headingLevels(source: string): number[] {
  return prose(splitMdx(source).body)
    .split('\n')
    .flatMap((line) => {
      const hashes = /^ {0,3}(#{1,6})[ \t]/.exec(line)?.[1];
      return hashes ? [hashes.length] : [];
    });
}

/** Every link target in the body: Markdown [text](href) and <a href="…">, in order. */
function links(source: string): string[] {
  const text = prose(splitMdx(source).body);
  const found: { at: number; href: string }[] = [];
  for (const match of text.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) found.push({ at: match.index, href: match[1]! });
  for (const match of text.matchAll(/<a\s[^>]*href="([^"]+)"/g)) found.push({ at: match.index, href: match[1]! });
  return found.sort((a, b) => a.at - b.at).map(({ href }) => href);
}

/** Internal links read the same in both files once /vi/ and /en/ are set aside. */
const neutral = (href: string) => href.replace(/^\/(vi|en)\//, '/<locale>/');

describe('links() and headingLevels() (the readers the tests below rely on)', () => {
  it('read Markdown and HTML links in order, and headings outside code', () => {
    const source = '---\ntitle: x\n---\n\n## A\n\nSee [x](/vi/) and <a href="https://e.org/" rel="license">e</a>, [y](https://f.org "t").\n\n```md\n## not a heading [z](/no/)\n```\n\n### B\n';
    expect(links(source)).toEqual(['/vi/', 'https://e.org/', 'https://f.org']);
    expect(headingLevels(source)).toEqual([2, 3]);
  });
});

describe('About page: vi and en match', () => {
  it('the same headings, at the same levels, in the same order', () => {
    const vi = headingLevels(SOURCE.vi);
    expect(vi.length).toBeGreaterThanOrEqual(6);
    expect(headingLevels(SOURCE.en)).toEqual(vi);
    // The design's parts (section 3.1): six h2; and no h1 in the body (Starlight renders the title as h1).
    expect(vi.filter((level) => level === 2)).toHaveLength(6);
    expect(vi).not.toContain(1);
  });

  it('the same components and imports, each with the locale of its own file', () => {
    const [vi, en] = [lessonShape(SOURCE.vi), lessonShape(SOURCE.en)];
    expect(en.sequence).toEqual(vi.sequence);
    expect(en.imports).toEqual(vi.imports);
    expect(vi.sequence).toContain('PictureCredits');
    for (const locale of ['vi', 'en'] as const) {
      const props = [...SOURCE[locale].matchAll(/<PictureCredits\b([^>]*)\/>/g)].map((match) => match[1]!.trim());
      expect(props, locale).toEqual([`locale="${locale}"`]);
    }
  });

  it('the same links in the same order; internal ones point into their own language', () => {
    const [vi, en] = [links(SOURCE.vi), links(SOURCE.en)];
    expect(vi.length).toBeGreaterThan(5);
    expect(en.map(neutral)).toEqual(vi.map(neutral));
    for (const href of vi) if (href.startsWith('/')) expect(href, `vi: ${href}`).toMatch(/^\/vi\//);
    for (const href of en) if (href.startsWith('/')) expect(href, `en: ${href}`).toMatch(/^\/en\//);
  });

  it('the same keyboard keys (<kbd>) and inline code', () => {
    const kbd = (source: string) => [...source.matchAll(/<kbd>([^<]+)<\/kbd>/g)].map((match) => match[1]);
    const code = (source: string) => [...splitMdx(source).body.matchAll(/`([^`\n]+)`/g)].map((match) => match[1]);
    expect(kbd(SOURCE.en)).toEqual(kbd(SOURCE.vi));
    expect(code(SOURCE.en)).toEqual(code(SOURCE.vi));
  });

  it('frontmatter: title, description, prev: false and next: false in both', () => {
    for (const locale of ['vi', 'en'] as const) {
      const { data } = splitMdx(SOURCE[locale]);
      expect(String(data.title ?? '').trim(), locale).not.toBe('');
      expect(String(data.description ?? '').trim(), locale).not.toBe('');
      expect(data.prev, locale).toBe(false);
      expect(data.next, locale).toBe(false);
    }
    expect(splitMdx(SOURCE.vi).data.title).toBe('Giới thiệu');
    expect(splitMdx(SOURCE.en).data.title).toBe('About');
  });
});

describe('About page: rules of the page', () => {
  for (const locale of ['vi', 'en'] as const) {
    it(`${locale}: the site licence link is the canonical CC URI with rel="license", and MIT links opensource.org`, () => {
      const body = splitMdx(SOURCE[locale]).body;
      const licence = [...body.matchAll(/<a\s[^>]*rel="license"[^>]*>/g)].map((match) => match[0]);
      expect(licence, locale).toHaveLength(1);
      expect(licence[0]).toContain(`href="${CC_LICENCE_URL[locale]}"`);
      expect(links(SOURCE[locale])).toContain('https://opensource.org/license/mit');
      expect(body).not.toMatch(/deed\.vi|legalcode\.vi/);
    });

    it(`${locale}: no link into the private repo or to a file in it, no lesson count`, () => {
      const hrefs = links(SOURCE[locale]);
      expect(hrefs.filter((href) => /github\.com\/Luffyreals/i.test(href))).toEqual([]);
      expect(hrefs.filter((href) => /\.(md|mdx|ts|json)(#.*)?$/.test(href) || href.startsWith('docs/'))).toEqual([]);
      expect(SOURCE[locale]).not.toMatch(/github\.com\/Luffyreals\/ai-atlas/i);
      // "78 bài", "23 lessons", "5 bài ML": the count changes with roadmap.ts (section 3.1, part 1).
      const text = prose(splitMdx(SOURCE[locale]).body);
      expect(text).not.toMatch(locale === 'vi' ? /\b\d+\s+bài\b/i : /\b\d+\s+lessons?\b/i);
    });

    it(`${locale}: every link is absolute https, or a site path ending with "/"`, () => {
      for (const href of links(SOURCE[locale])) {
        if (href.startsWith('/')) expect(href, href).toMatch(/\/(#[\w-]+)?$/);
        else expect(href, href).toMatch(/^https:\/\//);
      }
    });
  }
});
