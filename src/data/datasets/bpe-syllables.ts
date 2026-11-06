// src/data/datasets/bpe-syllables.ts — the one copy of the toy BPE training set (docs/architecture/viz/bpe-merge.md).
// Seven Vietnamese syllables with made-up frequencies, chosen so that pieces a Vietnamese reader knows show up:
// the onsets "ng", "nh", "tr" and the rhyme "ường". The same in both locales: the en lesson keeps the Vietnamese
// syllables. The Python cell src/code/nlp/tokenization/bpe.*.py writes them as WORDS = {...} in the same order
// (tests/unit/viz/bpe.test.ts compares them).
// Relative imports only: Playwright e2e imports dataset files too.
import type { LessonId, Localized } from '../roadmap';
import type { BpeWord } from '../../lib/viz/bpe';

export interface BpeDataset {
  id: string;
  lessons: readonly LessonId[];
  words: readonly BpeWord[]; // NFC, in the order of the Python dict
  end: string; // the end-of-syllable symbol, END in the Python cell
  merges: number; // K, the number of merges the VIZ and the cell run
  description: Localized; // 1–2 sentences for screen readers: what the VIZ steps through
}

export const BPE_SYLLABLES = {
  id: 'bpe-syllables',
  lessons: ['nlp/tokenization'],
  words: [
    { word: 'người', freq: 8 },
    { word: 'ngành', freq: 3 },
    { word: 'nghề', freq: 4 },
    { word: 'trường', freq: 6 },
    { word: 'đường', freq: 5 },
    { word: 'thương', freq: 3 },
    { word: 'nhà', freq: 7 },
  ],
  end: '_',
  merges: 12,
  description: {
    vi:
      'BPE chạy trên 7 âm tiết có tần số: người 8, ngành 3, nghề 4, trường 6, đường 5, thương 3, nhà 7. ' +
      'Mỗi bước đếm các cặp ký hiệu kề nhau, gộp cặp có số đếm lớn nhất thành một ký hiệu mới, rồi chia lại mọi âm tiết.',
    en:
      'BPE runs on 7 Vietnamese syllables with frequencies: người 8, ngành 3, nghề 4, trường 6, đường 5, thương 3, nhà 7. ' +
      'Each step counts the pairs of adjacent symbols, merges the most frequent pair into one new symbol, and splits every syllable again.',
  },
} as const satisfies BpeDataset;
