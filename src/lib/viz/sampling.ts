// Next-token sampling for SamplingViz (docs/architecture/llm-lessons.md, section 4.6.2). Pure: no DOM, no React.
// Notation follows the lessons llm/text-api and llm/build-first-llm: logits z_i, temperature T, top-k k,
// top-p threshold p. Order (the lessons' illustration): softmax at T -> top-k -> top-p -> renormalise.
// Top-p looks at the distribution left after top-k, renormalised, as Hugging Face transformers does (its top-p
// warper takes a softmax of the logits top-k has already masked). tests/unit/viz/sampling.test.ts compares every
// step with NumPy (tests/unit/fixtures/sampling-python.ts).
// Relative imports only: Playwright e2e may import this file.
import type { SliderSpec } from './linear-fit';

export interface SamplingSettings {
  temperature: number; // T >= 0; 0 is greedy decoding
  topK: number; // 1..n; n (every token) means off
  topP: number; // (0, 1]; 1 means off
}

export interface SamplingResult {
  probs: number[]; // after temperature, top-k, top-p and renormalising; 0 for removed tokens
  kept: boolean[]; // false for a token top-k or top-p removed, or one with probability 0 (every other at T = 0)
  base: number[]; // softmax at the current temperature, before cutting (shown as the faint bar)
}

/** Sliders, seed and decimals of SamplingViz (NEXT_TOKEN_SAMPLING in src/data/datasets/next-token.ts). */
export interface SamplingConfig {
  temperature: SliderSpec; // 0–2, step 0.1, initial 1
  topK: SliderSpec; // 1–n, step 1, initial n (off)
  topP: SliderSpec; // 0.05–1, step 0.05, initial 1 (off)
  seed: number; // createRng(seed) at load and on "Reset": the same clicks give the same tokens
  many: number; // samples drawn by the second button (100)
  digits: { temperature: number; topP: number; prob: number };
}

/** Softmax of z / T. T = 0: one-hot on the largest logit (ties: lowest index). */
export function softmaxT(logits: readonly number[], temperature: number): number[] {
  if (logits.length === 0) throw new RangeError('softmaxT: no logits');
  if (!(temperature >= 0) || !Number.isFinite(temperature)) {
    throw new RangeError(`softmaxT: temperature ${temperature} is not a finite number >= 0`);
  }
  if (temperature === 0) {
    let best = 0;
    logits.forEach((z, i) => {
      if (z > (logits[best] ?? z)) best = i;
    });
    return logits.map((_, i) => (i === best ? 1 : 0));
  }
  const scaled = logits.map((z) => z / temperature);
  const max = Math.max(...scaled);
  // Subtract the largest value first, so exp never overflows (the lesson's softmax_t does the same).
  const exps = scaled.map((a) => Math.exp(a - max));
  const sum = exps.reduce((total, e) => total + e, 0);
  return exps.map((e) => e / sum);
}

/** Indices by probability, largest first; equal probabilities keep the lower index first. */
function byProbability(probs: readonly number[]): number[] {
  return probs.map((_, i) => i).sort((a, b) => (probs[b] ?? 0) - (probs[a] ?? 0) || a - b);
}

/** probs with every token outside `kept` set to 0, divided by what is left so the sum is 1 again. */
function renormalise(probs: readonly number[], kept: readonly boolean[]): number[] {
  const sum = probs.reduce((total, p, i) => (kept[i] ? total + p : total), 0);
  return probs.map((p, i) => (kept[i] ? p / sum : 0));
}

/** Temperature, then top-k, then top-p (on what top-k left, renormalised), then renormalise. */
export function samplingDistribution(logits: readonly number[], s: SamplingSettings): SamplingResult {
  const n = logits.length;
  const base = softmaxT(logits, s.temperature);
  let kept = base.map((p) => p > 0);
  let probs = base;

  if (s.topK < n) {
    const k = Math.max(1, Math.floor(s.topK));
    const inTopK = new Set(byProbability(probs).slice(0, k));
    kept = kept.map((on, i) => on && inTopK.has(i));
    probs = renormalise(base, kept);
  }

  if (s.topP < 1) {
    // The smallest set, by decreasing probability, whose sum reaches p: the token that crosses p stays.
    const order = byProbability(probs);
    const nucleus = new Set<number>();
    let sum = 0;
    for (const i of order) {
      nucleus.add(i);
      sum += probs[i] ?? 0;
      if (sum >= s.topP) break;
    }
    kept = kept.map((on, i) => on && nucleus.has(i));
    probs = renormalise(probs, kept);
  }

  return { probs, kept, base };
}

/** mulberry32: deterministic, the same sequence at build time and in every browser. Values in [0, 1). */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Inverse CDF on probs with u in [0, 1): the first index whose running sum passes u. Never a 0-probability token. */
export function sampleIndex(probs: readonly number[], u: number): number {
  let sum = 0;
  let last = -1;
  for (const [i, p] of probs.entries()) {
    if (p <= 0) continue;
    last = i;
    sum += p;
    if (u < sum) return i;
  }
  // The running sum may end a hair under 1 (rounding): u above it goes to the last token that can be drawn.
  if (last < 0) throw new RangeError('sampleIndex: no token has a probability above 0');
  return last;
}
