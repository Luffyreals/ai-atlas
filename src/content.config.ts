import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { ALL_UI_KEYS, type UiKey } from './i18n/ui';

// Every custom UI key is required: a key missing from vi.json or en.json fails the build.
const uiShape = Object.fromEntries(
  ALL_UI_KEYS.map((key) => [key, z.string().min(1)]),
) as Record<UiKey, z.ZodString>;

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  i18n: defineCollection({
    loader: i18nLoader(),
    schema: i18nSchema({ extend: z.object(uiShape) }),
  }),
};
