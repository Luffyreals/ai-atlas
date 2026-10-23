import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CC_LICENCE_URL, HOME, type Slip } from '../../src/data/home';
import { ALL_PICTURES, HERO_PLATES, LESSON_PICTURE, PART_PICTURES, STAMP_PICTURE, TERMS_PICTURE } from '../../src/data/home-pictures';
import { PART_IDS } from '../../src/data/roadmap';
import { proseLessonIds } from '../../src/lib/inline-markup';
import { getLesson, hasPage } from '../../src/lib/roadmap';

type LocalizedValue = string | readonly string[];

function isLocalized(value: unknown): value is { vi: LocalizedValue; en: LocalizedValue } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const keys = Object.keys(value).sort();
  return keys.length === 2 && keys[0] === 'en' && keys[1] === 'vi';
}

/** Every { vi, en } object reachable from `root`, with its path. Skips image metadata (`src`). */
function collectLocalized(root: unknown, path: string, out: [string, { vi: LocalizedValue; en: LocalizedValue }][] = []) {
  if (isLocalized(root)) {
    out.push([path, root]);
    return out;
  }
  if (Array.isArray(root)) {
    root.forEach((item, index) => collectLocalized(item, `${path}[${index}]`, out));
  } else if (typeof root === 'object' && root !== null) {
    for (const [key, value] of Object.entries(root)) {
      if (key === 'src') continue;
      collectLocalized(value, `${path}.${key}`, out);
    }
  }
  return out;
}

function expectFilled(path: string, value: LocalizedValue): void {
  if (typeof value === 'string') {
    expect(value.trim(), path).not.toBe('');
    return;
  }
  expect(Array.isArray(value), path).toBe(true);
  expect(value.length, path).toBeGreaterThan(0);
  value.forEach((line, index) => expect(line.trim(), `${path}[${index}]`).not.toBe(''));
}

const localized = [
  ...collectLocalized(HOME, 'HOME'),
  ...collectLocalized(CC_LICENCE_URL, 'CC_LICENCE_URL'),
  ...collectLocalized(ALL_PICTURES, 'ALL_PICTURES'),
  ...collectLocalized(PART_PICTURES, 'PART_PICTURES'),
];

describe('homepage copy (src/data/home.ts, home-pictures.ts)', () => {
  it('finds the Localized fields it is meant to check', () => {
    // Guards the walker itself: if it found nothing, every other check would pass vacuously.
    expect(localized.length).toBeGreaterThan(60);
    expect(localized.map(([path]) => path)).toContain('HOME.hero.title');
    expect(localized.map(([path]) => path)).toContain('ALL_PICTURES[0].alt');
  });

  it('every Localized field has a non-empty vi and en', () => {
    for (const [path, value] of localized) {
      expectFilled(`${path}.vi`, value.vi);
      expectFilled(`${path}.en`, value.en);
    }
  });

  it('vi and en have the same shape (string vs list, same number of lines)', () => {
    for (const [path, value] of localized) {
      expect(typeof value.en, path).toBe(typeof value.vi);
      if (Array.isArray(value.vi)) expect((value.en as readonly string[]).length, path).toBe(value.vi.length);
    }
  });

  it('letter: vi and en link the same lessons in the same paragraphs, and each one has a page', () => {
    const vi = HOME.letter.paragraphs.vi.map(proseLessonIds);
    expect(HOME.letter.paragraphs.en.map(proseLessonIds)).toEqual(vi);
    const ids = vi.flat();
    expect(ids).toContain('ml/linear-regression');
    for (const id of ids) {
      const lesson = getLesson(id);
      expect(lesson, id).toBeDefined();
      expect(hasPage(lesson!), `${id} has a page`).toBe(true);
    }
  });

  it('gives every roadmap part a "why" line', () => {
    expect(Object.keys(HOME.route.why).sort()).toEqual([...PART_IDS].sort());
  });

  it('keeps the same math in vi and en slips', () => {
    const mathOf = (lines: readonly string[]) => lines.flatMap((line) => line.match(/\$[^$\n]+\$/g) ?? []);
    for (const slip of HOME.lesson.slips as readonly Slip[]) {
      if (!slip.lines) continue;
      expect(mathOf(slip.lines.en), slip.title.vi).toEqual(mathOf(slip.lines.vi));
    }
  });
});

describe('homepage pictures', () => {
  it('ALL_PICTURES lists every picture used on the page', () => {
    const used = [...HERO_PLATES, ...Object.values(PART_PICTURES), LESSON_PICTURE, TERMS_PICTURE, STAMP_PICTURE];
    for (const picture of used) expect(ALL_PICTURES, picture.credit.title).toContain(picture);
  });

  it('every picture credit has an https source and all its fields', () => {
    for (const { credit } of ALL_PICTURES) {
      expect(credit.source, credit.title).toMatch(/^https:\/\/\S+$/);
      expect(() => new URL(credit.source), credit.source).not.toThrow();
      expect(credit.title.trim(), `${credit.source} title`).not.toBe('');
      for (const field of ['creator', 'year', 'licence', 'via'] as const) {
        for (const locale of ['vi', 'en'] as const) {
          expect(credit[field][locale].trim(), `${credit.source} ${field}.${locale}`).not.toBe('');
        }
      }
      expect(credit.via.en, credit.source).toContain('Wikimedia Commons');
    }
  });

  it('credit sources are unique per picture', () => {
    const sources = ALL_PICTURES.map((picture) => picture.credit.source);
    expect(new Set(sources).size).toBe(sources.length);
  });
});

// docs/glossary.md: | Tiếng Việt | Tiếng Anh | Cách dùng |
const GLOSSARY = readFileSync(fileURLToPath(new URL('../../docs/glossary.md', import.meta.url)), 'utf8');

/** Lower case, NFC, without a trailing "(...)" such as "(LLM)" or "(term)". */
function normalizeTerm(term: string): string {
  return term
    .normalize('NFC')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim()
    .toLowerCase();
}

function glossaryPairs(markdown: string): { vi: string; en: string }[] {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith('|'))
    .map((line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()))
    .filter(([vi]) => vi !== undefined && vi !== 'Tiếng Việt' && !/^-+$/.test(vi))
    .map(([vi = '', en = '']) => ({ vi, en }));
}

describe('homepage terms match docs/glossary.md', () => {
  const pairs = glossaryPairs(GLOSSARY);
  const glossaryKeys = new Set(pairs.map((pair) => `${normalizeTerm(pair.vi)} = ${normalizeTerm(pair.en)}`));

  it('parses the glossary tables', () => {
    expect(pairs.length).toBeGreaterThan(40);
    expect(pairs).toContainEqual({ vi: 'Hồi quy tuyến tính', en: 'Linear regression' });
  });

  it('every HOME.terms row is a glossary entry (same vi and en)', () => {
    for (const row of HOME.terms.rows) {
      const key = `${normalizeTerm(row.vi)} = ${normalizeTerm(row.en)}`;
      expect(glossaryKeys.has(key), key).toBe(true);
    }
  });

  it('has no duplicate rows', () => {
    const keys = HOME.terms.rows.map((row) => normalizeTerm(row.vi));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

/** Removes Python # comments (outside string literals), trailing spaces and blank lines. */
function stripPythonComments(code: string): string {
  return code
    .split(/\r?\n/)
    .map((line) => {
      let quote: string | undefined;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (quote) {
          if (char === '\\') i++;
          else if (char === quote) quote = undefined;
        } else if (char === '"' || char === "'") {
          quote = char;
        } else if (char === '#') {
          return line.slice(0, i);
        }
      }
      return line;
    })
    .map((line) => line.trimEnd())
    .filter((line) => line !== '')
    .join('\n');
}

describe('homepage code slip', () => {
  it('the comment stripper keeps # inside strings', () => {
    expect(stripPythonComments('print("#1")  # note\n# only a comment\n\nx = 1')).toBe('print("#1")\nx = 1');
  });

  it('vi and en code are identical after removing # comments', () => {
    expect(stripPythonComments(HOME.lesson.code.en)).toBe(stripPythonComments(HOME.lesson.code.vi));
    expect(stripPythonComments(HOME.lesson.code.vi)).toContain('np.polyfit');
  });

  it('is short and seeded, as the content rules require', () => {
    for (const code of [HOME.lesson.code.vi, HOME.lesson.code.en]) {
      expect(code.split('\n').length).toBeLessThanOrEqual(40);
      expect(code).toMatch(/default_rng\(\d+\)|seed\(\d+\)/);
    }
  });

  it('the Output slip shows exactly what the code prints', () => {
    // Expected values come from running the code (numpy 2.5.3, seed 42): w = 3.018, b = 1.653, L = 1.290.
    const printed = [...HOME.lesson.code.vi.matchAll(/print\(f"(\w+) = \{\w+:\.3f\}"\)/g)].map((match) => match[1]);
    expect(printed).toEqual(['w', 'b', 'L']);
    const output = HOME.lesson.slips.find((slip) => slip.title.en === 'Output');
    expect(output && 'output' in output ? output.output : undefined).toEqual(['w = 3.018', 'b = 1.653', 'L = 1.290']);
  });
});
