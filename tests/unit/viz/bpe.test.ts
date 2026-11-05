// BPE for BpeMergeViz (docs/architecture/viz/bpe-merge.md): worked examples by hand, the data against the
// Python cell of nlp/tokenization, every merge and count against the cell's output, and the numbers the
// lesson quotes (theory section and its "Hãy thử" list).
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { BPE_SYLLABLES } from '../../../src/data/datasets/bpe-syllables';
import { applyMerges, countPairs, mergePair, rankPairs, runBpe, splitWord } from '../../../src/lib/viz/bpe';
import { PYTHON_BPE_OUTPUT } from '../fixtures/bpe-python';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const D = BPE_SYLLABLES;
const RUN = runBpe(D.words, D.end, D.merges);
const show = (pieces: readonly string[]) => pieces.join(' ');

/** The cell's output, parsed: start and end vocabulary, then (a, b, count) of each merge, then the splits. */
function parseOutput(text: string) {
  const lines = text.split('\n');
  const start = Number(/^start vocab: (\d+)$/.exec(lines[0] ?? '')?.[1]);
  const merges = lines.flatMap((line) => {
    const match = /^\s*(\d+): (\S+) \+ (\S+) \((\d+)\)$/.exec(line);
    return match ? [{ step: Number(match[1]), a: match[2], b: match[3], count: Number(match[4]) }] : [];
  });
  const end = Number(/^end vocab: (\d+)$/m.exec(text)?.[1]);
  const splits = Object.fromEntries(
    lines.flatMap((line) => {
      const match = /^(\S+) -> \[(.*)\]$/.exec(line);
      return match ? [[match[1] ?? '', [...(match[2] ?? '').matchAll(/'([^']*)'/g)].map((m) => m[1] ?? '')]] : [];
    }),
  ) as Record<string, string[]>;
  return { start, merges, end, splits };
}

describe('bpe.ts (by hand)', () => {
  it('splits a word into characters, then the end symbol, as list(w) + [END]', () => {
    expect(splitWord('nhà', '_')).toEqual(['n', 'h', 'à', '_']);
    // A precomposed letter with two marks (ườ: horn and grave) is one character in NFC.
    expect(splitWord('ường', '_')).toEqual(['ư', 'ờ', 'n', 'g', '_']);
  });

  it('counts each adjacent pair weighted by the frequency of its word, in the order first met', () => {
    const counts = countPairs([['a', 'b', 'a', 'b'], ['b', 'a']], [2, 5]);
    expect(counts).toEqual([
      { a: 'a', b: 'b', count: 4 }, // twice in the first word, f = 2
      { a: 'b', b: 'a', count: 2 + 5 },
    ]);
    // "ab"+"c" and "a"+"bc" are two different pairs.
    expect(countPairs([['ab', 'c'], ['a', 'bc']], [1, 1])).toHaveLength(2);
    expect(() => countPairs([['a', 'b']], [])).toThrow(RangeError);
  });

  it('ranks by count, and keeps the order of first meeting on a tie: max(Counter) in Python', () => {
    const counts = countPairs([['x', 'y', 'z'], ['p', 'q']], [3, 3]);
    expect(rankPairs(counts).map((c) => c.a + c.b)).toEqual(['xy', 'yz', 'pq']);
    const tie = countPairs([['p', 'q'], ['x', 'y', 'x', 'y']], [2, 1]);
    // pq: 2, xy: 2, yx: 1. pq was met first.
    expect(rankPairs(tie).map((c) => `${c.a}${c.b}:${c.count}`)).toEqual(['pq:2', 'xy:2', 'yx:1']);
  });

  it('merges left to right without overlap, like merge() in the cell', () => {
    expect(mergePair(['a', 'a', 'a'], 'a', 'a')).toEqual(['aa', 'a']);
    expect(mergePair(['a', 'a', 'a', 'a'], 'a', 'a')).toEqual(['aa', 'aa']);
    expect(mergePair(['x', 'a'], 'a', 'b')).toEqual(['x', 'a']);
    expect(mergePair([], 'a', 'b')).toEqual([]);
  });

  it('stops early when no pair is left', () => {
    const run = runBpe([{ word: 'ab', freq: 1 }], '_', 10);
    expect(run.steps.map((s) => s.symbol)).toEqual(['ab', 'ab_']);
    expect(run.vocab0).toBe(3);
  });
});

describe('BPE_SYLLABLES (the data)', () => {
  it('is NFC, with positive integer frequencies and distinct syllables', () => {
    for (const { word, freq } of D.words) {
      expect(word, word).toBe(word.normalize('NFC'));
      expect(Number.isInteger(freq) && freq > 0, word).toBe(true);
    }
    expect(new Set(D.words.map((w) => w.word)).size).toBe(D.words.length);
  });

  for (const lang of ['vi', 'en'] as const) {
    const file = `src/code/nlp/tokenization/bpe.${lang}.py`;
    it.runIf(existsSync(`${ROOT}${file}`))(`matches WORDS, END and the number of merges of ${file}`, () => {
      const source = readFileSync(`${ROOT}${file}`, 'utf8');
      const dict = /^WORDS = \{([^}]*)\}/m.exec(source)?.[1] ?? '';
      const words = [...dict.matchAll(/"([^"]+)":\s*(\d+)/g)].map((m) => ({ word: m[1] ?? '', freq: Number(m[2]) }));
      expect(words).toEqual(D.words);
      expect(/^END = "([^"]*)"/m.exec(source)?.[1]).toBe(D.end);
      expect(/for step in range\(1, (\d+)\):/.exec(source)?.[1]).toBe(String(D.merges + 1));
    });
  }
});

describe('BpeMergeViz run against the Python cell', () => {
  const python = parseOutput(PYTHON_BPE_OUTPUT);

  it('the fixture parses into 12 merges', () => {
    expect(python.merges).toHaveLength(12);
    expect(python.merges.map((m) => m.step)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('has the same start vocabulary, the same 12 merges with the same counts, and the same end vocabulary', () => {
    expect(RUN.vocab0).toBe(python.start);
    expect(RUN.steps.map((s) => ({ a: s.pair.a, b: s.pair.b, count: s.pair.count }))).toEqual(
      python.merges.map(({ a, b, count }) => ({ a, b, count })),
    );
    expect(RUN.vocab0 + RUN.steps.length).toBe(python.end);
  });

  it('splits the four syllables of the cell the same way, with the merges in the order learned', () => {
    expect(Object.keys(python.splits)).toEqual(['trường', 'thương', 'nhường', 'nghiêng']);
    for (const [word, pieces] of Object.entries(python.splits)) {
      expect(applyMerges(word, D.end, RUN.steps.map((s) => s.pair)), word).toEqual(pieces);
    }
  });

  it('each step: the winner is the first ranked pair, its symbol is new, and every split joins back to its word', () => {
    const vocab = new Set(RUN.initial.flat());
    for (const [k, s] of RUN.steps.entries()) {
      expect(s.counts[0], `step ${k + 1}`).toBe(s.pair);
      for (let i = 1; i < s.counts.length; i++) {
        expect(s.counts[i - 1]!.count).toBeGreaterThanOrEqual(s.counts[i]!.count);
      }
      expect(vocab.has(s.symbol), `step ${k + 1}: ${s.symbol} is new`).toBe(false);
      vocab.add(s.symbol);
      s.splits.forEach((pieces, w) => expect(pieces.join('')).toBe(D.words[w]!.word + D.end));
    }
    expect(vocab.size).toBe(25);
  });
});

describe('Numbers the lesson quotes', () => {
  it('|V_0| = 13 and |V| = 13 + 12 = 25', () => {
    expect(RUN.vocab0).toBe(13);
    expect(RUN.vocab0 + RUN.steps.length).toBe(25);
  });

  it('theory: n g counts 8 + 3 + 4 + 6 + 5 + 3 = 29; then ư ờ 19, ng _ 14, ườ ng_ 11', () => {
    const first = RUN.steps[0]!.counts;
    expect(first[0]).toEqual({ a: 'n', b: 'g', count: 29 });
    expect(first[1]!.count).toBeLessThan(29); // "Không cặp nào nhiều hơn", and none equal either
    expect(RUN.steps.slice(1, 4).map((s) => `${s.pair.a} ${s.pair.b} ${s.pair.count}`)).toEqual([
      'ư ờ 19',
      'ng _ 14',
      'ườ ng_ 11',
    ]);
  });

  it('try 2: after step 4, trường and đường share the piece ường_', () => {
    const [, , , truong, duong] = RUN.steps[3]!.splits;
    expect(show(truong!)).toBe('t r ường_');
    expect(show(duong!)).toBe('đ ường_');
  });

  it('try 3: at step 6 three pairs count 8 and ng + ườ (met first) wins; after step 8 người_ is one token', () => {
    const six = RUN.steps[5]!;
    expect(six.counts.filter((c) => c.count === 8).map((c) => `${c.a} ${c.b}`)).toEqual(['ng ườ', 'ườ i', 'i _']);
    expect(show(RUN.steps[7]!.splits[0]!)).toBe('người_');
  });

  it('try 4 and the VIZ comment: the splits after step 12', () => {
    expect(RUN.steps[11]!.splits.map(show)).toEqual([
      'người_',
      'ng à nh _',
      'ng h ề _',
      'trường_',
      'đ ường_',
      't h ư ơ ng_',
      'nhà_',
    ]);
  });

  it('every step has more than 8 pairs, so the 8 rows shown keep the table the same height', () => {
    expect(Math.min(...RUN.steps.map((s) => s.counts.length))).toBeGreaterThan(8);
  });
});
