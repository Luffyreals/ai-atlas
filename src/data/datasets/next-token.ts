// src/data/datasets/next-token.ts — the one copy of the next-token logits (docs/architecture/llm-lessons.md,
// section 4.6.1). Ten candidate tokens after "Hôm nay trời rất" / "The weather today is very", most likely
// first. The logits are made up (no model computed them) and shared by both locales, so the numbers on the
// page match the Python cell of llm/text-api, which copies them under "# logits: next-token".
// Relative imports only: Playwright e2e imports this file too.
import type { SamplingConfig } from '../../lib/viz/sampling';
import type { TokenDistribution } from './types';

export const NEXT_TOKEN = {
  id: 'next-token',
  lessons: ['llm/text-api', 'llm/build-first-llm', 'nlp/text-generation-summarization'],
  context: { vi: 'Hôm nay trời rất', en: 'The weather today is very' },
  tokens: {
    vi: ['đẹp', 'nóng', 'lạnh', 'mát', 'nắng', 'oi', 'trong', 'xanh', 'ẩm', 'tối'],
    en: ['nice', 'hot', 'cold', 'cool', 'sunny', 'humid', 'clear', 'windy', 'wet', 'dark'],
  },
  logits: [3.0, 2.6, 2.0, 1.5, 1.1, 0.6, 0.1, -0.4, -1.0, -1.6],
  description: {
    vi:
      'Mười token có thể đứng sau "Hôm nay trời rất", xếp từ khả năng cao nhất xuống thấp nhất. ' +
      'Logit là số tự đặt để minh họa, không do mô hình thật tính ra.',
    en:
      'Ten tokens that may follow "The weather today is very", from the most likely to the least likely. ' +
      'The logits are made up for the illustration, not computed by a real model.',
  },
} as const satisfies TokenDistribution;

/** Sliders, seed and decimals of SamplingViz (llm-lessons.md, section 4.6.3). */
export const NEXT_TOKEN_SAMPLING = {
  temperature: { min: 0, max: 2, step: 0.1, initial: 1 },
  topK: { min: 1, max: NEXT_TOKEN.logits.length, step: 1, initial: NEXT_TOKEN.logits.length },
  topP: { min: 0.05, max: 1, step: 0.05, initial: 1 },
  seed: 2026,
  many: 100,
  digits: { temperature: 1, topP: 2, prob: 2 },
} as const satisfies SamplingConfig;

/** Registry of the "# logits: <id>" markers in src/code/ (tests/unit/content/datasets.test.ts). */
export const TOKEN_DISTRIBUTIONS = { [NEXT_TOKEN.id]: NEXT_TOKEN } as const satisfies Record<string, TokenDistribution>;
