// The font provider of astro.config.ts `fonts` (docs/architecture/launch.md, section 3.4): Astro's npm provider
// reading the installed @fontsource packages (pinned versions, no network at build time), with three fixes
// Astro 7.4.2 needs for it. Loaded by astro.config.ts: relative imports only, never `astro:*`.
import { fileURLToPath } from 'node:url';
import { fontProviders } from 'astro/config';

type Provider = ReturnType<typeof fontProviders.npm>;
type FontFace = NonNullable<Awaited<ReturnType<Provider['resolveFont']>>>['fonts'][number];

/** The subset of a @fontsource file, from its name: 'barlow-latin-ext-400-normal.woff2' → 'latin-ext'. */
export function fontsourceSubset(file: string, subsets: readonly string[]): string | undefined {
  return subsets.find((subset) => new RegExp(`-${subset}-\\d+-(normal|italic)\\.woff2?$`).test(file));
}

/**
 * The faces of one family as Astro needs them:
 * 1. Each file: URL becomes a path. Astro's font fetcher reads absolute paths and fetch()es the rest, and
 *    fetch() cannot read file: URLs (the build stops with CannotFetchFontFile). With a path, the hashed file
 *    name also comes from the file's bytes, not from where the project sits on disk.
 * 2. Each face gets `meta.subset`, which the npm provider leaves out, so <Font preload> can pick subsets.
 * 3. Latin faces first. Astro measures the fallback metrics (size-adjust…) on the first file of the family,
 *    and the vietnamese or latin-ext file has too few letters for that: its average width comes out 11%
 *    narrower than Barlow's real one.
 */
export function prepareFaces(fonts: FontFace[], subsets: readonly string[]): FontFace[] {
  const prepared = fonts.map((font) => {
    let subset: string | undefined;
    const src = font.src.map((source) => {
      if (!('url' in source) || !source.url.startsWith('file:')) return source;
      const path = fileURLToPath(source.url);
      subset ??= fontsourceSubset(path, subsets);
      return { ...source, url: path };
    });
    return subset === undefined ? { ...font, src } : { ...font, src, meta: { ...font.meta, subset } };
  });
  const rank = (font: FontFace) => (font.meta?.subset === 'latin' ? 0 : 1);
  return prepared.sort((a, b) => rank(a) - rank(b));
}

/** fontProviders.npm({ remote: false }) with prepareFaces() applied. */
export function installedFontsource(subsets: readonly string[]): Provider {
  const provider = fontProviders.npm({ remote: false });
  return {
    ...provider,
    async resolveFont(options) {
      const result = await provider.resolveFont(options);
      return result && { fonts: prepareFaces(result.fonts, subsets) };
    },
  };
}
