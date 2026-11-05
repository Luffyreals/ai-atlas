// Byte-pair encoding on a few words with frequencies, for BpeMergeViz (docs/architecture/viz/bpe-merge.md).
// The same steps as src/code/nlp/tokenization/bpe.vi.py: count adjacent pairs weighted by f(w), merge the most
// frequent one (ties: the pair met first, as Python's max over a Counter), scan left to right without overlap.
// Pure functions, relative imports only (Playwright e2e may import this file).

/** One word of the training set and how often it occurs, f(w). */
export interface BpeWord {
  word: string; // NFC; split with Array.from, which matches Python's list(word)
  freq: number; // a positive integer
}

/** One adjacent pair (a, b) and its count, sum over w of f(w) times the number of times a stands right before b. */
export interface PairCount {
  a: string;
  b: string;
  count: number;
}

/** One merge: the counts it was chosen from, the pair, and the split of every word after it. */
export interface BpeStep {
  counts: PairCount[]; // on the split before this merge; most frequent first, ties in order of first meeting
  pair: PairCount; // counts[0]
  symbol: string; // pair.a + pair.b, the new vocabulary entry
  splits: string[][]; // one per word, in the order of the words, after this merge
}

export interface BpeRun {
  initial: string[][]; // the split at step 0: characters, then the end symbol
  vocab0: number; // |V_0|: distinct symbols at step 0, the end symbol included
  steps: BpeStep[]; // at most `merges` of them; fewer only if no pair is left
}

/** Characters of a word, then the end symbol: list(w) + [END] in Python. */
export function splitWord(word: string, end: string): string[] {
  return [...Array.from(word), end];
}

/**
 * Adjacent pairs of every split, each weighted by the frequency of its word, in the order they are first met
 * (words in order, each from left to right): the insertion order of Python's Counter.
 */
export function countPairs(splits: readonly (readonly string[])[], freqs: readonly number[]): PairCount[] {
  if (splits.length !== freqs.length) throw new RangeError('countPairs: one frequency per word');
  const counts = new Map<string, PairCount>();
  splits.forEach((symbols, w) => {
    const f = freqs[w] ?? 0;
    for (let i = 0; i + 1 < symbols.length; i++) {
      const a = symbols[i] ?? '';
      const b = symbols[i + 1] ?? '';
      // U+0000 never occurs in a word, so "ab"+"c" and "a"+"bc" stay two keys.
      const key = `${a}\u0000${b}`;
      const seen = counts.get(key);
      if (seen) seen.count += f;
      else counts.set(key, { a, b, count: f });
    }
  });
  return [...counts.values()];
}

/** Most frequent first; equal counts keep the order of first meeting (Array.prototype.sort is stable). */
export function rankPairs(counts: readonly PairCount[]): PairCount[] {
  return [...counts].sort((x, y) => y.count - x.count);
}

/** Every adjacent (a, b) becomes one symbol a + b, left to right, without overlap: merge() in the Python cell. */
export function mergePair(symbols: readonly string[], a: string, b: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < symbols.length) {
    if (i + 1 < symbols.length && symbols[i] === a && symbols[i + 1] === b) {
      out.push(a + b);
      i += 2;
    } else {
      out.push(symbols[i] ?? '');
      i += 1;
    }
  }
  return out;
}

/** Learns up to `merges` merges from the words. */
export function runBpe(words: readonly BpeWord[], end: string, merges: number): BpeRun {
  const freqs = words.map((w) => w.freq);
  const initial = words.map((w) => splitWord(w.word, end));
  const vocab0 = new Set(initial.flat()).size;
  const steps: BpeStep[] = [];
  let splits = initial;
  for (let k = 0; k < merges; k++) {
    const counts = rankPairs(countPairs(splits, freqs));
    const pair = counts[0];
    if (!pair) break;
    splits = splits.map((symbols) => mergePair(symbols, pair.a, pair.b));
    steps.push({ counts, pair, symbol: pair.a + pair.b, splits });
  }
  return { initial, vocab0, steps };
}

/** Splits a new word by applying the learned merges in the order they were learned. */
export function applyMerges(word: string, end: string, pairs: readonly PairCount[]): string[] {
  return pairs.reduce((symbols, p) => mergePair(symbols, p.a, p.b), splitWord(word, end));
}
