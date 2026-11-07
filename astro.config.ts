import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import starlightLinksValidator from 'starlight-links-validator';
import enStrings from './src/content/i18n/en.json';
import viStrings from './src/content/i18n/vi.json';
import { installedFontsource } from './src/lib/fonts';
import rehypeKatexA11y from './src/lib/rehype-katex-a11y';
import { isInSitemap } from './src/lib/seo';
import { buildSidebar } from './src/lib/sidebar';
import { resolveSite } from './src/lib/site';

// Barlow through the Fonts API (docs/architecture/launch.md, section 3.4): read from the installed @fontsource
// packages (pinned versions, no network at build time), with fallback faces sized to Barlow's metrics.
const SUBSETS: [string, ...string[]] = ['latin', 'latin-ext', 'vietnamese'];
const fontsource = installedFontsource(SUBSETS);
const barlow = {
  provider: fontsource,
  name: 'Barlow',
  cssVariable: '--font-barlow',
  subsets: SUBSETS,
  fallbacks: ['system-ui'],
  display: 'swap' as const,
};

export default defineConfig({
  // SITE_URL at build time (Cloudflare Pages, CI), else https://ai-atlas.pages.dev. See src/lib/site.ts.
  site: resolveSite(process.env.SITE_URL),
  trailingSlash: 'always',
  redirects: { '/': '/vi/' },
  markdown: {
    // Astro 7 defaults to Sätteri, which does not run remark/rehype plugins.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeKatex,
        // Names every display formula, "Công thức: <TeX>" / "Formula: <TeX>" (decision 25 in docs/decisions.md).
        [
          rehypeKatexA11y,
          { labels: { vi: viStrings['atlas.common.formulaLabel'], en: enStrings['atlas.common.formulaLabel'] } },
        ],
      ],
    }),
  },
  // Same cssVariable, name and provider: Astro merges the first two into one family (400, 600, 400 italic).
  fonts: [
    { ...barlow, weights: [400, 600], styles: ['normal'] },
    { ...barlow, weights: [400], styles: ['italic'] },
    {
      provider: fontsource,
      name: 'Barlow Condensed',
      cssVariable: '--font-barlow-condensed',
      weights: [700],
      styles: ['normal'],
      subsets: SUBSETS,
      fallbacks: ['system-ui'],
      display: 'swap',
    },
  ],
  integrations: [
    starlight({
      title: { vi: 'AI Atlas', en: 'AI Atlas' },
      description: 'Bản đồ kiến thức AI song ngữ Việt – Anh.',
      defaultLocale: 'vi',
      locales: {
        vi: { label: 'Tiếng Việt', lang: 'vi' },
        en: { label: 'English', lang: 'en' },
      },
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        // Decorative: the link home is named by the "AI Atlas" text right next to it (axe image-redundant-alt).
        alt: '',
      },
      components: {
        // The homepage is the only page with `hero`; it renders the designed atlas homepage.
        Hero: './src/components/starlight/Hero.astro',
        // Starlight's head plus the Fonts API faces and preloads, and the scroll-region script.
        Head: './src/components/starlight/Head.astro',
        Footer: './src/components/starlight/Footer.astro',
      },
      sidebar: buildSidebar(),
      // Fallback pages: noindex, and no hreflang to a missing translation (decision 30 in docs/decisions.md).
      routeMiddleware: './src/routeData.ts',
      customCss: [
        // No @fontsource imports: Barlow loads through the Fonts API (`fonts` above, <Font> in Head.astro).
        'katex/dist/katex.min.css',
        './src/styles/custom.css',
        // Lesson components and the roadmap map: global on purpose (decision 13 in docs/decisions.md), so a
        // lesson has no render-blocking CSS file of its own. Every selector is scoped by its class prefix.
        './src/styles/roadmap-map.css',
        './src/styles/prerequisites.css',
        './src/styles/lesson-progress.css',
        './src/components/quiz/quiz.css',
        './src/components/python-runner/python-runner.css',
        './src/styles/local-code.css',
        // content-visibility: auto for the blocks of a long lesson (docs/architecture/launch.md 3.5.2, E5).
        './src/styles/content-visibility.css',
        // The one CSS file of every static figure (docs/architecture/viz/figures.md, section 8.2 f). Just before viz.css.
        './src/components/figures/figures.css',
        // The one CSS file of every VIZ (docs/architecture/viz/README.md, section 2.3). Keep it last.
        './src/components/viz/viz.css',
      ],
      disable404Route: true,
      lastUpdated: false,
      plugins: [
        starlightLinksValidator({
          errorOnFallbackPages: false,
          errorOnInconsistentLocale: true,
        }),
      ],
    }),
    // Declared explicitly so Starlight skips its own copy. Same i18n option as Starlight's
    // (node_modules/@astrojs/starlight/dist/integrations/sitemap.js), plus a filter.
    sitemap({
      i18n: { defaultLocale: 'vi', locales: { vi: 'vi', en: 'en' } },
      // Internal pages (/vi/dev/…, /en/dev/…) and fallback pages (a lesson not yet translated, decision 30
      // in docs/decisions.md) stay deployed and noindex, but out of the sitemap.
      filter: isInSitemap,
    }),
    react(),
  ],
});
