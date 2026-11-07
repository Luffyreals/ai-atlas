// The share picture (Open Graph) of every page, one per language (docs/architecture/launch.md, section 3.3.2).
// One source for src/lib/seo.ts (the <meta> tags) and scripts/make-og-images.mjs (the PNG files).
// No runtime imports: the script loads this file through Node's type stripping, and seo.ts is loaded by
// astro.config.ts. Type imports are erased.
import type { Localized } from './roadmap';

export const OG_IMAGE = {
  width: 1200,
  height: 630,
  type: 'image/png',
  /** Rename the file (…-v2.png) when the picture changes: social sites cache by URL. */
  path: { vi: '/og/ai-atlas-vi.png', en: '/og/ai-atlas-en.png' } satisfies Localized,
  alt: {
    vi: 'AI Atlas: Học AI theo một tấm bản đồ. Lộ trình song ngữ Việt – Anh, miễn phí.',
    en: 'AI Atlas: Learn AI from a single map. A free Vietnamese–English route.',
  } satisfies Localized,
} as const;

/** Words on the card. tagline must equal HOME.hero.title (og.test.ts). */
export const OG_CARD = {
  tagline: { vi: 'Học AI theo một tấm bản đồ', en: 'Learn AI from a single map' } satisfies Localized,
  subline: { vi: 'Song ngữ Việt – Anh · Miễn phí', en: 'Vietnamese and English · Free' } satisfies Localized,
} as const;

/** og:locale of each content language. */
export const OG_LOCALE = { vi: 'vi_VN', en: 'en_US' } as const satisfies Localized;
