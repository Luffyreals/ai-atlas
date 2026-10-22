import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
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
    react(),
  ],
});
