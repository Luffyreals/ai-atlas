// src/lib/fonts.ts: the pure parts of the font provider (docs/architecture/launch.md, section 3.4).
// fontsourceSubset() picks the subset from a @fontsource file name; prepareFaces() turns file: URLs into
// paths, tags each face with meta.subset (so <Font preload> can choose subsets) and puts latin faces first
// (Astro measures the fallback metrics on the first file). The build itself is checked by the e2e font tests.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { fontsourceSubset, prepareFaces } from '../../../src/lib/fonts';

const SUBSETS = ['latin', 'latin-ext', 'vietnamese'] as const;
const NODE_MODULES = fileURLToPath(new URL('../../../node_modules/', import.meta.url));

type Face = Parameters<typeof prepareFaces>[0][number];

describe('fontsourceSubset', () => {
  it.each([
    ['barlow-latin-400-normal.woff2', 'latin'],
    ['barlow-latin-ext-400-normal.woff2', 'latin-ext'],
    ['barlow-vietnamese-400-normal.woff2', 'vietnamese'],
    ['barlow-latin-400-italic.woff2', 'latin'],
    ['barlow-latin-ext-600-italic.woff2', 'latin-ext'],
    ['barlow-condensed-latin-700-normal.woff2', 'latin'],
    ['barlow-condensed-latin-ext-700-normal.woff2', 'latin-ext'],
    ['barlow-condensed-vietnamese-700-normal.woff2', 'vietnamese'],
    ['barlow-latin-400-normal.woff', 'latin'],
    ['C:\\repo\\node_modules\\@fontsource\\barlow\\files\\barlow-latin-ext-400-normal.woff2', 'latin-ext'],
    ['/repo/node_modules/@fontsource/barlow/files/barlow-vietnamese-600-normal.woff2', 'vietnamese'],
  ])('%s → %s', (file, subset) => {
    expect(fontsourceSubset(file, SUBSETS)).toBe(subset);
  });

  it('latin never swallows latin-ext, whatever the order of the subsets', () => {
    expect(fontsourceSubset('barlow-latin-ext-400-normal.woff2', ['latin', 'latin-ext'])).toBe('latin-ext');
    expect(fontsourceSubset('barlow-latin-ext-400-normal.woff2', ['latin-ext', 'latin'])).toBe('latin-ext');
    expect(fontsourceSubset('barlow-latin-400-normal.woff2', ['latin-ext', 'latin'])).toBe('latin');
  });

  it('undefined for a subset not asked for, or a name that is not a fontsource file', () => {
    expect(fontsourceSubset('barlow-cyrillic-400-normal.woff2', SUBSETS)).toBeUndefined();
    expect(fontsourceSubset('barlow-latin-ext-400-normal.woff2', ['latin'])).toBeUndefined();
    expect(fontsourceSubset('barlow-latin-400-normal.ttf', SUBSETS)).toBeUndefined();
    expect(fontsourceSubset('barlow-latin-400-bold.woff2', SUBSETS)).toBeUndefined();
    expect(fontsourceSubset('barlow-latin.woff2', SUBSETS)).toBeUndefined();
    expect(fontsourceSubset('400.css', SUBSETS)).toBeUndefined();
  });

  it('every .woff2 of the installed @fontsource packages that the config asks for has its subset', () => {
    // astro.config.ts: Barlow 400, 600, 400 italic; Barlow Condensed 700. Three subsets each.
    const wanted: [string, string][] = [
      ['barlow', '400-normal'],
      ['barlow', '600-normal'],
      ['barlow', '400-italic'],
      ['barlow-condensed', '700-normal'],
    ];
    for (const [pkg, face] of wanted) {
      const dir = join(NODE_MODULES, '@fontsource', pkg, 'files');
      const files = readdirSync(dir).filter((file) => file.endsWith(`-${face}.woff2`) && file.startsWith(`${pkg}-`));
      const found = files.map((file) => fontsourceSubset(join(dir, file), SUBSETS)).filter(Boolean);
      expect(found.sort(), `${pkg} ${face}`).toEqual([...SUBSETS].sort());
    }
  });
});

describe('prepareFaces', () => {
  const dir = join(NODE_MODULES, '@fontsource', 'barlow', 'files');
  const fileUrl = (subset: string, face = '400-normal') => pathToFileURL(join(dir, `barlow-${subset}-${face}.woff2`)).href;
  const face = (subset: string, extra: Partial<Face> = {}): Face =>
    ({
      weight: '400',
      style: 'normal',
      src: [{ url: fileUrl(subset), format: 'woff2' }],
      unicodeRange: [`U+${subset}`],
      ...extra,
    }) as Face;
  const srcUrls = (font: Face) => font.src.map((source) => ('url' in source ? source.url : `local(${source.name})`));

  it('file: URLs become absolute paths of the same files', () => {
    const [prepared] = prepareFaces([face('latin')], SUBSETS);
    expect(srcUrls(prepared!)).toEqual([join(dir, 'barlow-latin-400-normal.woff2')]);
    expect(srcUrls(prepared!)[0]).not.toMatch(/^file:/);
  });

  it('each face gets meta.subset, and keeps the meta it had', () => {
    const fonts = prepareFaces(
      [face('vietnamese', { meta: { priority: 1 } as Face['meta'] }), face('latin-ext'), face('latin')],
      SUBSETS,
    );
    expect(fonts.map((font) => font.meta?.subset)).toEqual(['latin', 'vietnamese', 'latin-ext']);
    expect(fonts.find((font) => font.meta?.subset === 'vietnamese')?.meta).toMatchObject({ priority: 1 });
  });

  it('latin faces come first; the others keep their order (stable sort)', () => {
    const input = [
      face('vietnamese'),
      face('latin-ext', { weight: '600', src: [{ url: fileUrl('latin-ext', '600-normal'), format: 'woff2' }] } as Partial<Face>),
      face('latin'),
      face('latin-ext'),
      face('latin', { weight: '600', src: [{ url: fileUrl('latin', '600-normal'), format: 'woff2' }] } as Partial<Face>),
    ];
    const order = prepareFaces(input, SUBSETS).map((font) => `${font.meta?.subset}-${font.weight}`);
    expect(order).toEqual(['latin-400', 'latin-600', 'vietnamese-400', 'latin-ext-600', 'latin-ext-400']);
  });

  it('leaves alone sources that are not file: URLs (local(), https), and adds no subset it cannot read', () => {
    const remote = { weight: '400', style: 'normal', src: [{ url: 'https://cdn.example/x.woff2', format: 'woff2' }] } as Face;
    const local = { weight: '400', style: 'normal', src: [{ name: 'Barlow' }] } as unknown as Face;
    const [a, b] = prepareFaces([remote, local], SUBSETS);
    expect(a).toEqual(remote);
    expect(a?.meta?.subset).toBeUndefined();
    expect(b).toEqual(local);
  });

  it('does not change the faces it is given', () => {
    const input = [face('vietnamese'), face('latin')];
    const before = JSON.stringify(input);
    prepareFaces(input, SUBSETS);
    expect(JSON.stringify(input)).toBe(before);
  });

  it('a face with several sources takes its subset from the first file it can read', () => {
    const font = {
      weight: '400',
      style: 'normal',
      src: [
        { name: 'Barlow' },
        { url: fileUrl('latin-ext'), format: 'woff2' },
        { url: pathToFileURL(join(dir, 'barlow-latin-ext-400-normal.woff')).href, format: 'woff' },
      ],
    } as unknown as Face;
    const [prepared] = prepareFaces([font], SUBSETS);
    expect(prepared?.meta?.subset).toBe('latin-ext');
    expect(srcUrls(prepared!).filter((url) => url.startsWith('file:'))).toEqual([]);
  });
});
