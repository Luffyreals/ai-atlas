import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import starlightLinksValidator from 'starlight-links-validator';
import { buildSidebar } from './src/lib/sidebar';

export default defineConfig({
  // Placeholder until the Cloudflare project name / custom domain is final.
  site: 'https://ai-atlas.pages.dev',
  trailingSlash: 'always',
  redirects: { '/': '/vi/' },
  markdown: {
    // Astro 7 defaults to Sätteri, which does not run remark/rehype plugins.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
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
        alt: 'AI Atlas',
      },
      components: {
        // The homepage is the only page with `hero`; it renders the designed atlas homepage.
        Hero: './src/components/starlight/Hero.astro',
      },
      sidebar: buildSidebar(),
      customCss: [
        // Self-hosted Barlow; unicode-range keeps downloads to the latin + vietnamese subsets in use.
        '@fontsource/barlow/400.css',
        '@fontsource/barlow/400-italic.css',
        '@fontsource/barlow/600.css',
        '@fontsource/barlow-condensed/700.css',
        'katex/dist/katex.min.css',
        './src/styles/custom.css',
        // Lesson components and the roadmap map: global on purpose (decision 13 in docs/mvp.md), so a
        // lesson has no render-blocking CSS file of its own. Every selector is scoped by its class prefix.
        './src/styles/roadmap-map.css',
        './src/styles/prerequisites.css',
        './src/styles/lesson-progress.css',
        './src/components/quiz/quiz.css',
        './src/components/python-runner/python-runner.css',
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
      // Internal pages (/vi/dev/…, /en/dev/…) stay deployed and noindex, but out of the sitemap.
      filter: (page) => !/^\/(vi|en)\/dev\//.test(new URL(page).pathname),
    }),
    react(),
  ],
});
