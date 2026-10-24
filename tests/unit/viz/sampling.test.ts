// Next-token sampling for SamplingViz (docs/architecture/llm-lessons.md, sections 4.6.1–4.6.3):
// worked examples by hand, the NumPy fixture, the seeded generator, and the numbers the two lessons quote in
// their "Hãy thử" lists (llm/text-api, llm/build-first-llm).
import { describe, expect, it } from 'vitest';
import { NEXT_TOKEN, NEXT_TOKEN_SAMPLING } from '../../../src/data/datasets/next-token';
import { formatNumber } from '../../../src/lib/viz/format';
import { snapToStep } from '../../../src/lib/viz/linear-fit';
import {
  createRng,
  sampleIndex,
  samplingDistribution,
  softmaxT,
  type SamplingSettings,
} from '../../../src/lib/viz/sampling';
import { PYTHON_SAMPLING } from '../fixtures/sampling-python';

const Z = NEXT_TOKEN.logits;
const N = Z.length;
const OFF = { topK: N, topP: 1 };
const dist = (s: Partial<SamplingSettings>) => samplingDistribution(Z, { temperature: 1, ...OFF, ...s });
const shown = (values: readonly number[]) => values.map((p) => formatNumber(p, NEXT_TOKEN_SAMPLING.digits.prob));
const keptCount = (kept: readonly boolean[]) => kept.filter(Boolean).length;
const sum = (values: readonly number[]) => values.reduce((total, v) => total + v, 0);

describe('softmaxT (by hand)', () => {
  it('turns logits 0 and ln 2 into 1/3 and 2/3 at T = 1, and into 1/5 and 4/5 at T = 0.5', () => {
    const [a, b] = softmaxT([0, Math.LN2], 1);
    expect(a).toBeCloseTo(1 / 3, 15);
    expect(b).toBeCloseTo(2 / 3, 15);
    // Halving T doubles the gap: exp(2 ln 2) = 4.
    const [c, d] = softmaxT([0, Math.LN2], 0.5);
    expect(c).toBeCloseTo(1 / 5, 15);
    expect(d).toBeCloseTo(4 / 5, 15);
  });

  it('does not overflow on large logits, and keeps the order at every T > 0', () => {
    const p = softmaxT([1000, 999, 998], 0.1);
    expect(p.every(Number.isFinite)).toBe(true);
    expect(sum(p)).toBeCloseTo(1, 12);
    for (const t of [0.1, 0.5, 1, 2]) {
      const q = softmaxT(Z, t);
      for (let i = 1; i < N; i++) expect(q[i - 1]).toBeGreaterThan(q[i] ?? 0);
    }
  });

  it('is one-hot on the largest logit at T = 0, the lowest index on a tie', () => {
    expect(softmaxT([1, 3, 2], 0)).toEqual([0, 1, 0]);
    expect(softmaxT([2, 5, 5, 1], 0)).toEqual([0, 1, 0, 0]);
  });

  it('rejects a negative or non-finite temperature, and no logits', () => {
    expect(() => softmaxT(Z, -0.1)).toThrow(RangeError);
    expect(() => softmaxT(Z, Number.NaN)).toThrow(RangeError);
    expect(() => softmaxT(Z, Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => softmaxT([], 1)).toThrow(RangeError);
  });
});

describe('samplingDistribution (by hand)', () => {
  // Three tokens with probabilities 0.5, 0.3, 0.2 at T = 1.
  const z3 = [Math.log(0.5), Math.log(0.3), Math.log(0.2)];
  const close = (actual: readonly number[], expected: readonly number[]) =>
    actual.forEach((v, i) => expect(v, `[${i}]`).toBeCloseTo(expected[i] ?? Number.NaN, 12));

  it('changes nothing with top-k and top-p off', () => {
    const r = samplingDistribution(z3, { temperature: 1, topK: 3, topP: 1 });
    close(r.probs, [0.5, 0.3, 0.2]);
    expect(r.kept).toEqual([true, true, true]);
    expect(r.probs).toEqual(r.base);
  });

  it('top-k 2 keeps 0.5 and 0.3, renormalised to 0.625 and 0.375', () => {
    const r = samplingDistribution(z3, { temperature: 1, topK: 2, topP: 1 });
    close(r.probs, [0.625, 0.375, 0]);
    expect(r.kept).toEqual([true, true, false]);
    close(r.base, [0.5, 0.3, 0.2]); // the faint bar: before the cut
  });

  it('top-p keeps the token that crosses p: p = 0.6 keeps two (0.5 < 0.6 <= 0.8), p = 0.5 keeps one', () => {
    expect(samplingDistribution(z3, { temperature: 1, topK: 3, topP: 0.6 }).kept).toEqual([true, true, false]);
    const one = samplingDistribution(z3, { temperature: 1, topK: 3, topP: 0.5 });
    expect(one.kept).toEqual([true, false, false]);
    expect(one.probs).toEqual([1, 0, 0]);
    // Always at least one token, however small p is.
    expect(keptCount(samplingDistribution(z3, { temperature: 1, topK: 3, topP: 0.01 }).kept)).toBe(1);
  });

  it('top-p looks at what top-k left, renormalised: k = 2 then p = 0.6 keeps one (0.625 >= 0.6)', () => {
    expect(samplingDistribution(z3, { temperature: 1, topK: 2, topP: 0.6 }).kept).toEqual([true, false, false]);
  });

  it('at T = 0 every token but the largest is removed, whatever k and p are', () => {
    for (const [topK, topP] of [[N, 1], [3, 1], [N, 0.5]] as const) {
      const r = samplingDistribution(Z, { temperature: 0, topK, topP });
      expect(r.probs).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      expect(r.kept).toEqual([true, false, false, false, false, false, false, false, false, false]);
    }
  });
});

describe('samplingDistribution against NumPy (fixtures/sampling-python.ts)', () => {
  it('uses the same logits as NEXT_TOKEN', () => {
    expect([...PYTHON_SAMPLING.logits], 'NEXT_TOKEN.logits changed: run the command in the fixture again').toEqual([
      ...Z,
    ]);
  });

  it('covers the cases of section 4.6.2', () => {
    const settings = PYTHON_SAMPLING.cases.map((c) => [c.settings.temperature, c.settings.topK, c.settings.topP]);
    for (const wanted of [[1, 10, 1], [0.5, 10, 0.9], [1.5, 3, 1], [1, 10, 0.5], [0, 10, 1]]) {
      expect(settings).toContainEqual(wanted);
    }
  });

  it.each(PYTHON_SAMPLING.cases.map((c) => [JSON.stringify(c.settings), c] as const))('%s', (_name, c) => {
    const r = samplingDistribution(Z, c.settings);
    expect(r.kept).toEqual([...c.kept]);
    r.base.forEach((v, i) => expect(Math.abs(v - (c.base[i] ?? Number.NaN)), `base[${i}]`).toBeLessThanOrEqual(1e-9));
    r.probs.forEach((v, i) => expect(Math.abs(v - (c.probs[i] ?? Number.NaN)), `probs[${i}]`).toBeLessThanOrEqual(1e-9));
  });

  it('control: top-p before top-k gives other results on the fixture, so a swapped order fails above', () => {
    // The wrong order, written here only to show the fixture tells the two apart.
    const swapped = (s: SamplingSettings) => {
      const cutP = samplingDistribution(Z, { ...s, topK: N });
      const order = cutP.probs.map((_, i) => i).sort((a, b) => (cutP.probs[b] ?? 0) - (cutP.probs[a] ?? 0));
      const inK = new Set(order.slice(0, s.topK));
      return cutP.kept.map((on, i) => on && inK.has(i));
    };
    const differ = PYTHON_SAMPLING.cases.filter((c) => keptCount(swapped(c.settings)) !== keptCount(c.kept));
    expect(differ.map((c) => c.settings)).toEqual([
      { temperature: 1, topK: 3, topP: 0.7 },
      { temperature: 2, topK: 5, topP: 0.8 },
    ]);
  });
});

describe('every position of the three sliders', () => {
  const grid = (spec: { min: number; max: number; step: number; initial: number }) => {
    const values: number[] = [];
    for (let i = 0; spec.min + i * spec.step <= spec.max + 1e-9; i++) values.push(snapToStep(spec.min + i * spec.step, spec));
    return values;
  };
  const ts = grid(NEXT_TOKEN_SAMPLING.temperature);
  const ks = grid(NEXT_TOKEN_SAMPLING.topK);
  const ps = grid(NEXT_TOKEN_SAMPLING.topP);

  it('has 21 temperatures, 10 values of k and 20 of p, each ending on its maximum', () => {
    expect([ts.length, ks.length, ps.length]).toEqual([21, 10, 20]);
    expect([ts.at(-1), ks.at(-1), ps.at(-1)]).toEqual([2, 10, 1]);
  });

  it('gives a distribution: sums to 1, at least one token kept, 0 exactly for the removed ones', () => {
    for (const temperature of ts) {
      for (const topK of ks) {
        for (const topP of ps) {
          const r = samplingDistribution(Z, { temperature, topK, topP });
          const where = `T ${temperature}, k ${topK}, p ${topP}`;
          expect(Math.abs(sum(r.probs) - 1), where).toBeLessThan(1e-12);
          expect(keptCount(r.kept), where).toBeGreaterThanOrEqual(1);
          expect(keptCount(r.kept), where).toBeLessThanOrEqual(topK);
          r.probs.forEach((p, i) => expect(r.kept[i] ? p > 0 : p === 0, `${where} [${i}]`).toBe(true));
        }
      }
    }
  });
});

describe('createRng and sampleIndex', () => {
  it('createRng(1) gives the same sequence twice, in [0, 1); another seed gives another', () => {
    const a = createRng(1);
    const b = createRng(1);
    const first = Array.from({ length: 1000 }, () => a());
    expect(Array.from({ length: 1000 }, () => b())).toEqual(first);
    expect(first.every((u) => u >= 0 && u < 1)).toBe(true);
    const c = createRng(2);
    expect(Array.from({ length: 5 }, () => c())).not.toEqual(first.slice(0, 5));
  });

  it('inverts the CDF: [0.5, 0.3, 0.2] gives 0 below 0.5, 1 below 0.8, then 2', () => {
    const p = [0.5, 0.3, 0.2];
    expect([0, 0.4999, 0.5, 0.7999, 0.8, 0.9999].map((u) => sampleIndex(p, u))).toEqual([0, 0, 1, 1, 2, 2]);
  });

  it('never returns a removed token, even when rounding leaves the sum a hair under 1', () => {
    expect(sampleIndex([0, 0.6, 0, 0.4, 0], 0.7)).toBe(3);
    expect(sampleIndex([0.3, 0.3, 0.3999999999, 0], 0.99999999999)).toBe(2);
    expect(() => sampleIndex([0, 0], 0.5)).toThrow(RangeError);
  });

  it('10 000 draws land on each token within 0.02 of its probability (T = 1, then top-p 0.9)', () => {
    for (const r of [dist({}), dist({ topP: 0.9 })]) {
      const rng = createRng(NEXT_TOKEN_SAMPLING.seed);
      const counts: number[] = Array.from({ length: N }, () => 0);
      for (let i = 0; i < 10_000; i++) {
        const k = sampleIndex(r.probs, rng());
        counts[k] = (counts[k] ?? 0) + 1;
      }
      counts.forEach((c, i) => expect(Math.abs(c / 10_000 - (r.probs[i] ?? 0)), `token ${i}`).toBeLessThanOrEqual(0.02));
      r.kept.forEach((on, i) => {
        if (!on) expect(counts[i], `removed token ${i}`).toBe(0);
      });
    }
  });
});

describe('the numbers the lessons quote ("Hãy thử")', () => {
  it('text-api 1: at first (T = 1, both cuts off) đẹp 0.38, nóng 0.26, lạnh 0.14, all 10 tokens can be drawn', () => {
    const r = dist({});
    expect(shown(r.probs).slice(0, 3)).toEqual(['0.38', '0.26', '0.14']);
    expect(keptCount(r.kept)).toBe(10);
    expect(NEXT_TOKEN.tokens.vi.slice(0, 3)).toEqual(['đẹp', 'nóng', 'lạnh']);
  });

  it('text-api 1: a few presses of "100 samples" from the seed also draw ẩm or tối, the bottom of the table', () => {
    const r = dist({});
    const rng = createRng(NEXT_TOKEN_SAMPLING.seed);
    const draws = Array.from({ length: 3 * NEXT_TOKEN_SAMPLING.many }, () => sampleIndex(r.probs, rng()));
    expect(NEXT_TOKEN.tokens.vi.slice(8)).toEqual(['ẩm', 'tối']);
    expect(draws.some((i) => i >= 8)).toBe(true);
  });

  it('text-api 2: top-k 3 removes seven tokens; the three left are 0.49, 0.33, 0.18', () => {
    const r = dist({ topK: 3 });
    expect(r.kept.filter((on) => !on)).toHaveLength(7);
    expect(shown(r.probs).slice(0, 3)).toEqual(['0.49', '0.33', '0.18']);
  });

  it('text-api 3: top-p 0.9 keeps 5 tokens with đẹp at 0.41; 3 at T = 0.5; 7 at T = 1.5', () => {
    const r = dist({ topP: 0.9 });
    expect(keptCount(r.kept)).toBe(5);
    expect(shown(r.probs)[0]).toBe('0.41');
    expect(keptCount(dist({ topP: 0.9, temperature: 0.5 }).kept)).toBe(3);
    expect(keptCount(dist({ topP: 0.9, temperature: 1.5 }).kept)).toBe(7);
  });

  it('text-api 4: at T = 0 đẹp has probability 1 and 100 draws are all đẹp', () => {
    const r = dist({ temperature: 0 });
    expect(shown(r.probs)[0]).toBe('1.00');
    expect(keptCount(r.kept)).toBe(1);
    const rng = createRng(NEXT_TOKEN_SAMPLING.seed);
    expect(Array.from({ length: NEXT_TOKEN_SAMPLING.many }, () => sampleIndex(r.probs, rng())).every((i) => i === 0)).toBe(
      true,
    );
  });

  it('build-first-llm: the top token is 0.599, 0.382, 0.286 at T = 0.5, 1, 1.5 (shown 0.60, 0.38, 0.29)', () => {
    const tops = [0.5, 1, 1.5].map((temperature) => dist({ temperature }).probs[0] ?? 0);
    expect(tops.map((p) => formatNumber(p, 3))).toEqual(['0.599', '0.382', '0.286']);
    expect(shown(tops)).toEqual(['0.60', '0.38', '0.29']);
  });

  it('the Theory table of text-api: the top three at T = 0.5, 1, 1.5', () => {
    const top3 = (temperature: number) => dist({ temperature }).probs.slice(0, 3).map((p) => formatNumber(p, 3));
    expect(top3(0.5)).toEqual(['0.599', '0.269', '0.081']);
    expect(top3(1)).toEqual(['0.382', '0.256', '0.140']);
    expect(top3(1.5)).toEqual(['0.286', '0.219', '0.147']);
  });
});

describe('NEXT_TOKEN', () => {
  it('has as many tokens as logits in each locale, no duplicates, logits most likely first', () => {
    for (const locale of ['vi', 'en'] as const) {
      expect(NEXT_TOKEN.tokens[locale]).toHaveLength(N);
      expect(new Set(NEXT_TOKEN.tokens[locale]).size).toBe(N);
      expect(NEXT_TOKEN.context[locale].trim()).not.toBe('');
      expect(NEXT_TOKEN.description[locale].trim()).not.toBe('');
    }
    for (let i = 1; i < N; i++) expect(Z[i - 1]).toBeGreaterThan(Z[i] ?? 0);
  });

  it('starts the sliders with both cuts off at T = 1', () => {
    const { temperature, topK, topP } = NEXT_TOKEN_SAMPLING;
    expect([temperature.initial, topK.initial, topP.initial]).toEqual([1, N, 1]);
    expect(topK.max).toBe(N);
  });
});
