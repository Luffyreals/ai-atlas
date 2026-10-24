// File and CSS rules of every VIZ (docs/architecture/viz/, sections 2.2, 2.3, 2.9, 6 task V2):
// one shared viz.css in customCss, within its gzip budget; no CSS, <style> or colour code in VIZ components;
// every island has a same-named .astro wrapper that hydrates it with client:visible.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { stripCssComments } from '../fixtures/css';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const VIZ_DIR = join(ROOT, 'src/components/viz');
const CSS_BUDGET_GZIP = 2560;

/** Paths relative to src/components/viz/, with "/" separators. */
const files = readdirSync(VIZ_DIR, { recursive: true, encoding: 'utf8' }).map((file) => file.split('\\').join('/'));
const read = (file: string) => readFileSync(join(VIZ_DIR, file), 'utf8');
const components = files.filter((file) => /\.(astro|tsx|ts)$/.test(file));

describe('VIZ CSS', () => {
  it('viz.css is the only CSS file under src/components/viz/', () => {
    expect(files.filter((file) => /\.(css|scss|sass|less)$/.test(file))).toEqual(['viz.css']);
  });

  it.each(components)('%s has no <style> and imports no CSS', (file) => {
    const source = read(file);
    expect(source).not.toMatch(/<style[\s>]/);
    expect(source).not.toMatch(/import\s+(?:[^'"\n]+\s+from\s+)?['"][^'"\n]+\.(?:css|scss|sass|less)(?:\?[^'"\n]*)?['"]/);
  });

  it('astro.config.ts loads viz.css last in customCss', () => {
    const config = readFileSync(join(ROOT, 'astro.config.ts'), 'utf8');
    const list = /customCss:\s*\[([\s\S]*?)\]/.exec(config)?.[1] ?? '';
    const entries = [...list.matchAll(/^\s*['"]([^'"]+)['"]/gm)].map((match) => match[1]);
    expect(entries).toContain('./src/components/viz/viz.css');
    expect(entries.at(-1)).toBe('./src/components/viz/viz.css');
  });

  it(`viz.css is at most ${CSS_BUDGET_GZIP} bytes gzipped, without its comments`, () => {
    const css = read('viz.css');
    const stripped = stripCssComments(css);
    // Guards the measure: the comments really went, and the rules did not.
    expect(stripped.length).toBeLessThan(css.length);
    expect(stripped).not.toContain('/*');
    expect(stripped.match(/\{/g)?.length).toBe(css.replace(/\/\*[\s\S]*?\*\//g, '').match(/\{/g)?.length);
    expect(gzipSync(stripped).length).toBeLessThanOrEqual(CSS_BUDGET_GZIP);
  });

  it('viz.css has no colour code: colours come from theme tokens only', () => {
    const css = stripCssComments(read('viz.css'));
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(/i);
  });
});

describe('stripCssComments (the measure behind the viz.css budget)', () => {
  it('removes block comments, one-line and multi-line, and keeps everything else', () => {
    expect(stripCssComments('/* a */.x { color: red; } /* b\n * c\n */.y{}')).toBe('.x { color: red; } .y{}');
    expect(stripCssComments('.x { gap: 1px; }')).toBe('.x { gap: 1px; }');
    expect(stripCssComments('.x{}/**/.y{}/***/')).toBe('.x{}.y{}');
  });

  it('keeps "/*" inside quoted strings, with escaped quotes', () => {
    const css = String.raw`.a::before { content: "/* not a comment */"; } .b { content: '\'/*' } /* gone */`;
    expect(stripCssComments(css)).toBe(String.raw`.a::before { content: "/* not a comment */"; } .b { content: '\'/*' } `);
    expect(stripCssComments(`[data-x='a*/b'] {} /* c */`)).toBe(`[data-x='a*/b'] {} `);
  });

  it('keeps "/*" inside url(), quoted or not', () => {
    expect(stripCssComments('.a { background: url(/img/*.svg); } /* c */')).toBe('.a { background: url(/img/*.svg); } ');
    expect(stripCssComments('.a { background: URL( "/*x*/.svg" ); }')).toBe('.a { background: URL( "/*x*/.svg" ); }');
    // Only the url() function: a property that ends in "url" is not one.
    expect(stripCssComments('.a { --my-url(/* c */) }')).toBe('.a { --my-url() }');
  });

  it('drops a comment left open to the end, as the CSS tokenizer does', () => {
    expect(stripCssComments('.a {} /* open')).toBe('.a {} ');
  });

  it('keeps the selectors in viz.css that hold quoted strings', () => {
    const stripped = stripCssComments(read('viz.css'));
    expect(stripped).toContain(`grid-template-areas: 't t' 'y p' '. x' '. u';`);
    expect(stripped).toContain(`.atlas-viz-toggle[aria-pressed='true']`);
  });
});

describe('VIZ components', () => {
  it.each(components)('%s has no colour code and no Starlight colour variable', (file) => {
    const source = read(file);
    expect(source).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(source).not.toMatch(/\b(?:rgba?|hsla?)\(/i);
    expect(source).not.toContain('--sl-color-');
  });

  const islands = files.filter((file) => file.endsWith('Island.tsx'));

  it('has at least one island', () => {
    expect(islands.length).toBeGreaterThan(0);
  });

  it.each(islands)('%s sits in a kebab-case folder and has a same-named wrapper with client:visible', (island) => {
    const parts = island.split('/');
    const name = (parts.at(-1) ?? '').replace(/Island\.tsx$/, '');
    expect(parts, 'src/components/viz/<kebab-name>/<Name>Island.tsx').toHaveLength(2);
    const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    expect(parts[0]).toBe(kebab);

    const wrapper = `${name}.astro`;
    expect(files, `src/components/viz/${wrapper}`).toContain(wrapper);
    const source = read(wrapper);
    expect(source).toMatch(new RegExp(`<${name}Island\\b[^>]*\\bclient:visible\\b`));
    expect(source).not.toMatch(/client:(?:load|idle|only|media)\b/);
  });
});
