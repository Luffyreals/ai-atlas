// Rules of every static figure (docs/architecture/viz/, section 8.2 h, points 1–5, and 6 of section 11.5 U2): one shared figures.css
// in customCss just before viz.css, within its gzip budget; 0 JS and no colour code in the components; each
// <Name>Figure.astro has its words file and registry entry; the words are complete in vi and en.
// Generic on purpose (decision 39 in docs/decisions.md): a new figure is checked without a test of its own, and
// every check holds, without skipping, while the registry is empty.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { FIGURES } from '../../../src/data/figures/index';
import type { FigureText } from '../../../src/data/figures/types';
import { LOCALES } from '../../../src/data/roadmap';
import { toLines } from '../../../src/lib/figures/geometry';
import { stripCssComments } from '../fixtures/css';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const FIG_DIR = join(ROOT, 'src/components/figures');
const DATA_DIR = join(ROOT, 'src/data/figures');
const CSS_BUDGET_GZIP = 1024;
const FIGURES_CSS = './src/components/figures/figures.css';
const VIZ_CSS = './src/components/viz/viz.css';
const COLOUR_CODE = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(/i;

/** Paths relative to src/components/figures/, with "/" separators. */
const files = readdirSync(FIG_DIR, { recursive: true, encoding: 'utf8' }).map((file) => file.split('\\').join('/'));
const read = (file: string) => readFileSync(join(FIG_DIR, file), 'utf8');
const sources = files.filter((file) => /\.(astro|ts|tsx|js|jsx|mjs)$/.test(file));
const figures = Object.entries(FIGURES) as [string, FigureText<string>][];

/** "MlWorkflow" -> "ml-workflow". */
const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

describe('figure files (point 1)', () => {
  it('figures.css is the only CSS file under src/components/figures/', () => {
    expect(files.filter((file) => /\.(css|scss|sass|less)$/.test(file))).toEqual(['figures.css']);
  });

  it('has no React or other JSX component', () => {
    expect(files.filter((file) => /\.(tsx|jsx)$/.test(file))).toEqual([]);
  });

  it('has the kit', () => {
    for (const part of ['FigureFrame', 'FigNode', 'FigArrow', 'FigText', 'FigMath']) expect(files).toContain(`kit/${part}.astro`);
  });

  it.each(sources)('%s ships no JS and no CSS of its own', (file) => {
    const source = read(file);
    expect(source).not.toMatch(/<style[\s>]/i);
    expect(source).not.toMatch(/<script[\s>]/i);
    expect(source).not.toMatch(/import\s+(?:[^'"\n]+\s+from\s+)?['"][^'"\n]+\.(?:css|scss|sass|less)(?:\?[^'"\n]*)?['"]/);
    expect(source).not.toMatch(/from\s+['"](?:react|react-dom)(?:\/[^'"]*)?['"]/);
    expect(source).not.toMatch(/\bclient:/);
  });

  it.each(sources)('%s has no colour code and no Starlight colour variable', (file) => {
    const source = read(file);
    expect(source).not.toMatch(COLOUR_CODE);
    expect(source).not.toContain('--sl-color-');
  });
});

describe('figures.css (points 2 and 3)', () => {
  it('astro.config.ts loads figures.css just before viz.css, and viz.css stays last', () => {
    const config = readFileSync(join(ROOT, 'astro.config.ts'), 'utf8');
    const list = /customCss:\s*\[([\s\S]*?)\]/.exec(config)?.[1] ?? '';
    const entries = [...list.matchAll(/^\s*['"]([^'"]+)['"]/gm)].map((match) => match[1]);
    expect(entries.slice(-2)).toEqual([FIGURES_CSS, VIZ_CSS]);
  });

  it(`figures.css is at most ${CSS_BUDGET_GZIP} bytes gzipped, without its comments`, () => {
    const css = read('figures.css');
    const stripped = stripCssComments(css);
    // Guards the measure: the comments really went, and the rules did not.
    expect(stripped.length).toBeLessThan(css.length);
    expect(stripped).not.toContain('/*');
    expect(stripped.match(/\{/g)?.length).toBe(css.replace(/\/\*[\s\S]*?\*\//g, '').match(/\{/g)?.length);
    expect(gzipSync(stripped).length).toBeLessThanOrEqual(CSS_BUDGET_GZIP);
  });

  it('figures.css has no colour code: colours come from theme tokens or system colours only', () => {
    expect(stripCssComments(read('figures.css'))).not.toMatch(COLOUR_CODE);
  });

  // SVG fills black by default: a mistyped class turns a region or a dot into a black blot, lost in dark mode.
  it('every atlas-fig-* class used in a figure component is styled in figures.css (point 6)', () => {
    const css = stripCssComments(read('figures.css'));
    const styled = new Set([...css.matchAll(/\.(atlas-fig-[a-z0-9-]+)/g)].map((match) => match[1]));
    const used = files
      .filter((file) => file.endsWith('.astro'))
      .flatMap((file) =>
        [...read(file).matchAll(/(?<![-\w])(atlas-fig-[a-z0-9-]+)/g)].map((match) => ({ file, name: match[1] ?? '' })),
      );
    expect(used.length).toBeGreaterThan(0);
    expect(used.filter(({ name }) => !styled.has(name)).map(({ file, name }) => `${name} in ${file}`)).toEqual([]);
  });

  it('figures.css scopes every rule by the atlas-fig prefix', () => {
    const css = stripCssComments(read('figures.css'));
    const selectors = [...css.matchAll(/(?:^|[;{}])\s*([^@{};\s][^{};]*)\{/g)].map((match) => (match[1] ?? '').trim());
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      for (const part of selector.split(',')) expect(part.trim(), selector).toMatch(/^\.atlas-fig(?:ure\b|-)/);
    }
  });
});

describe('figure registry (point 4)', () => {
  const components = files.filter((file) => /^[A-Z][A-Za-z0-9]*Figure\.astro$/.test(file));
  const dataFiles = readdirSync(DATA_DIR)
    .filter((file) => file.endsWith('.ts') && !['index.ts', 'types.ts'].includes(file))
    .map((file) => file.replace(/\.ts$/, ''));
  const ids = Object.keys(FIGURES);

  it('every <Name>Figure.astro has src/data/figures/<name>.ts and an entry in FIGURES', () => {
    const missing = components.flatMap((file) => {
      const id = kebab(file.replace(/Figure\.astro$/, ''));
      return [
        ...(dataFiles.includes(id) ? [] : [`src/data/figures/${id}.ts for ${file}`]),
        ...(ids.includes(id) ? [] : [`FIGURES["${id}"] for ${file}`]),
      ];
    });
    expect(missing).toEqual([]);
  });

  it('every FIGURES entry and words file has its <Name>Figure.astro', () => {
    const drawn = new Set(components.map((file) => kebab(file.replace(/Figure\.astro$/, ''))));
    expect(ids.filter((id) => !drawn.has(id))).toEqual([]);
    expect(dataFiles.filter((id) => !drawn.has(id))).toEqual([]);
  });

  it('every FIGURES id is kebab-case', () => {
    expect(ids.filter((id) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))).toEqual([]);
  });

  it('no figure component sits outside the root of src/components/figures/ or kit/', () => {
    const astro = files.filter((file) => file.endsWith('.astro'));
    expect(astro.filter((file) => !components.includes(file) && !file.startsWith('kit/'))).toEqual([]);
  });
});

describe('figure words (point 5)', () => {
  /** Every problem of one figure's words, as readable lines; [] when all is well. */
  function problems(id: string, text: FigureText<string>): string[] {
    const found: string[] = [];
    for (const locale of LOCALES) {
      const strings = text[locale];
      for (const field of ['caption', 'label', 'description'] as const) {
        if (!strings[field].trim()) found.push(`${id}.${locale}.${field} is empty`);
      }
      for (const [key, value] of Object.entries(strings.labels)) {
        const lines = toLines(value);
        if (lines.length === 0) found.push(`${id}.${locale}.labels.${key} has no line`);
        if (lines.length > 3) found.push(`${id}.${locale}.labels.${key} has ${lines.length} lines (at most 3)`);
        for (const line of lines) {
          if (!line.trim()) found.push(`${id}.${locale}.labels.${key} has an empty line`);
          if (line.includes('$') || line.includes('{{')) found.push(`${id}.${locale}.labels.${key} has $ or {{: "${line}"`);
        }
      }
    }
    const keys = (locale: (typeof LOCALES)[number]) => Object.keys(text[locale].labels).sort();
    if (keys('vi').join() !== keys('en').join()) found.push(`${id}: vi and en label keys differ`);
    if (text.vi.description.trim() === text.en.description.trim()) found.push(`${id}: en description is the vi one`);
    return found;
  }

  it('every figure has caption, label, description and labels, complete and translated in vi and en', () => {
    expect(figures.flatMap(([id, text]) => problems(id, text))).toEqual([]);
  });

  // The check above is quiet while the registry is empty; this proves it catches each fault.
  it('catches empty fields, long or math labels, mismatched keys and an untranslated description', () => {
    const good = { caption: 'C', label: 'L', description: 'D vi', labels: { a: ['One', 'Two'], b: 'Three' } };
    const ok: FigureText<string> = { vi: good, en: { ...good, description: 'D en' } };
    expect(problems('x', ok)).toEqual([]);

    const bad: FigureText<string> = {
      vi: { caption: ' ', label: 'L', description: 'Same', labels: { a: ['1', '2', '3', '4'], b: '$x$', c: ['ok', ''] } },
      en: { caption: 'C', label: '', description: 'Same', labels: { a: 'A', b: '{{n}}' } },
    };
    expect(problems('x', bad)).toEqual([
      'x.vi.caption is empty',
      'x.vi.labels.a has 4 lines (at most 3)',
      'x.vi.labels.b has $ or {{: "$x$"',
      'x.vi.labels.c has an empty line',
      'x.en.label is empty',
      'x.en.labels.b has $ or {{: "{{n}}"',
      'x: vi and en label keys differ',
      'x: en description is the vi one',
    ]);
  });
});
