// Gradient flow through a deep MLP, for GradientFlowViz (docs/architecture/viz/gradient-flow.md). Pure: no DOM,
// no React. Notation follows dl/training-neural-networks: z^[l] = W^[l] a^[l−1] (b^[l] = 0), a^[l] = g(z^[l]),
// a^[0] = x, and the backward pass δ^[l] = ∂L/∂z^[l] = (W^[l+1]ᵀ δ^[l+1]) ⊙ g'(z^[l]).
// The VIZ shows the mean |δ^[l]| of every layer relative to the last one: ∂L/∂W^[l] = δ^[l] a^[l−1]ᵀ would hide
// ReLU's explosion, since a^[l−1] grows forward as fast as δ^[l] grows backward (section 2 of the spec).
// Only + − × ÷, Math.sqrt, Math.abs, Math.round and Math.imul (exact): the numbers are the same bit for bit at build
// time and in every browser, so the prerendered HTML matches the hydrated one. exp and ln are written out here
// (detExp, detLn); tests/unit/viz/gradient-flow.test.ts scans this file.
// Relative imports only: Playwright e2e may import this file.
import type { SliderSpec } from './linear-fit';
import { createRng } from './sampling';
import { detLog10, type Domain } from './scale';

export type Activation = 'sigmoid' | 'tanh' | 'relu';
export type Init = 'std1' | 'xavier' | 'he';
export type Regime = 'vanishing' | 'stable' | 'exploding';

export const ACTIVATIONS: readonly Activation[] = ['sigmoid', 'tanh', 'relu'];
export const INITS: readonly Init[] = ['std1', 'xavier', 'he'];

export interface GradientFlowConfig {
  width: number; // n: units of every layer, and size of the input x
  batch: number; // samples of the batch
  seed: number; // mulberry32 seed of x, of ∂L/∂a^[last] and of every W^[l]
  depth: SliderSpec; // hidden layers: 2 … 20
  initial: { activation: Activation; init: Init };
  logDomain: Domain; // y axis in log10 of (mean |δ^[l]| / mean |δ^[last]|)
  logTicks: readonly number[]; // whole powers of ten
  // |log10 ratio| above this many decades: vanishing (below −) or exploding (above +); else stable.
  thresholdDecades: number;
}

export const GRADIENT_FLOW: GradientFlowConfig = {
  width: 32,
  batch: 32,
  seed: 20261105,
  depth: { min: 2, max: 20, step: 1, initial: 10 },
  initial: { activation: 'sigmoid', init: 'xavier' },
  logDomain: [-13, 13],
  logTicks: [-12, -8, -4, 0, 4, 8, 12],
  thresholdDecades: 1,
};

/** ln 2 split in a high part with zero low bits and the rest (Cody–Waite), so k · LN2_HI is exact. */
const LN2_HI = 0.6931471803691238;
const LN2_LO = 1.9082149292705877e-10;
/** ln 10 as a double (Math.LN10). */
const LN10 = 2.302585092994046;

/** 2^k for an integer k in [−1022, 1023], by repeated squaring: exact. */
function pow2(k: number): number {
  let base = k < 0 ? 0.5 : 2;
  let e = k < 0 ? -k : k;
  let out = 1;
  while (e > 0) {
    if (e % 2 === 1) out *= base;
    base *= base;
    e = (e - (e % 2)) / 2;
  }
  return out;
}

/**
 * e^x with + − × ÷ only: x = k ln 2 + r, |r| ≤ ln 2 / 2, e^r by 14 terms of its series (error under 1e-16 relative),
 * then × 2^k. 0 below −745, Infinity above 709.78. Math.exp need not be correctly rounded, so it may differ between
 * Node and a browser.
 */
export function detExp(x: number): number {
  if (Number.isNaN(x)) return NaN;
  if (x > 709.78) return Infinity;
  if (x < -745) return 0;
  const k = Math.round(x / LN2_HI);
  const r = x - k * LN2_HI - k * LN2_LO;
  let p = 1;
  for (let i = 14; i >= 1; i--) p = 1 + (p * r) / i;
  // Two factors keep 2^k exact when e^x is subnormal (k down to −1075).
  return k < -1000 ? p * pow2(k + 600) * pow2(-600) : p * pow2(k);
}

/** ln v through detLog10 (+ − × ÷ and Math.sqrt). Throws when v ≤ 0 or v is not finite. */
export function detLn(v: number): number {
  return detLog10(v) * LN10;
}

/** `count` standard normal numbers from mulberry32, by the polar form of Box–Muller (Marsaglia). */
export function standardNormals(count: number, seed: number): Float64Array {
  const rng = createRng(seed);
  const out = new Float64Array(count);
  let i = 0;
  while (i < count) {
    const u = 2 * rng() - 1;
    const v = 2 * rng() - 1;
    const s = u * u + v * v;
    if (s >= 1 || s === 0) continue;
    const f = Math.sqrt((-2 * detLn(s)) / s);
    out[i++] = u * f;
    if (i < count) out[i++] = v * f;
  }
  return out;
}

/** Standard deviation of every weight: 1, Xavier/Glorot √(1/n), He √(2/n), n = fan-in. */
export function weightStd(init: Init, fanIn: number): number {
  if (init === 'std1') return 1;
  return Math.sqrt((init === 'he' ? 2 : 1) / fanIn);
}

/** g(z) and g'(z) of one unit, written into out[0], out[1] (no allocation in the hot loop). */
function activate(activation: Activation, z: number, out: Float64Array): void {
  if (activation === 'relu') {
    out[0] = z > 0 ? z : 0;
    out[1] = z > 0 ? 1 : 0;
  } else if (activation === 'sigmoid') {
    // Never exp of a large positive number: e = e^(−|z|) ≤ 1.
    const e = detExp(-Math.abs(z));
    const s = z >= 0 ? 1 / (1 + e) : e / (1 + e);
    out[0] = s;
    out[1] = s * (1 - s);
  } else {
    const e = detExp(-2 * Math.abs(z));
    const t = (1 - e) / (1 + e);
    const th = z >= 0 ? t : -t;
    out[0] = th;
    out[1] = 1 - th * th;
  }
}

/** The fixed random parts: input batch, output gradient, and standard normal weights for the deepest network. */
export interface FlowNetwork {
  width: number;
  batch: number;
  maxDepth: number;
  x: Float64Array; // batch × width, row b = sample b
  dOut: Float64Array; // ∂L/∂a^[last], batch × width
  weights: readonly Float64Array[]; // maxDepth matrices, width × width, row-major: W[i · width + j], N(0, 1)
}

/**
 * Draws x, then ∂L/∂a^[last], then W^[1] … W^[maxDepth], all N(0, 1) from one stream: the first layers keep their
 * weights when the depth changes, and every activation and initialisation scales the same draw.
 */
export function createNetwork(config: Pick<GradientFlowConfig, 'width' | 'batch' | 'seed' | 'depth'>): FlowNetwork {
  const { width, batch, seed } = config;
  const maxDepth = config.depth.max;
  const cell = batch * width;
  const all = standardNormals(2 * cell + maxDepth * width * width, seed);
  const weights: Float64Array[] = [];
  for (let l = 0; l < maxDepth; l++) {
    const start = 2 * cell + l * width * width;
    weights.push(all.subarray(start, start + width * width));
  }
  return { width, batch, maxDepth, x: all.subarray(0, cell), dOut: all.subarray(cell, 2 * cell), weights };
}

export interface FlowResult {
  magnitudes: number[]; // mean |δ^[l]| over the batch and the units, l = 1 … depth
  logRelative: number[]; // log10(magnitudes[l] / magnitudes[last]); the last one is 0
  ratio: number; // magnitudes[first] / magnitudes[last]
  logRatio: number; // logRelative[0]
  regime: Regime;
}

export function regimeOf(logRatio: number, thresholdDecades: number): Regime {
  if (logRatio < -thresholdDecades) return 'vanishing';
  if (logRatio > thresholdDecades) return 'exploding';
  return 'stable';
}

/**
 * Forward pass of `depth` hidden layers with weights std · N(0, 1) and b = 0, then the backward pass from the fixed
 * ∂L/∂a^[depth]. About 4 · depth · batch · width² multiply-adds: 2.6 million at 20 layers of 32, a few ms.
 */
export function gradientFlow(
  net: FlowNetwork,
  activation: Activation,
  init: Init,
  depth: number,
  thresholdDecades: number,
): FlowResult {
  const { width: n, batch } = net;
  if (!Number.isInteger(depth) || depth < 1 || depth > net.maxDepth) {
    throw new RangeError(`gradientFlow: depth ${depth} is not in 1 … ${net.maxDepth}`);
  }
  const std = weightStd(init, n);
  const cell = batch * n;
  const unit = new Float64Array(2);
  // g'(z^[l]) of every layer, kept for the backward pass.
  const slopes: Float64Array[] = [];
  let a = net.x;
  for (let l = 0; l < depth; l++) {
    const w = net.weights[l];
    const next = new Float64Array(cell);
    const slope = new Float64Array(cell);
    for (let b = 0; b < batch; b++) {
      const row = b * n;
      for (let i = 0; i < n; i++) {
        let z = 0;
        const wi = i * n;
        for (let j = 0; j < n; j++) z += w[wi + j] * a[row + j];
        activate(activation, std * z, unit);
        next[row + i] = unit[0];
        slope[row + i] = unit[1];
      }
    }
    slopes.push(slope);
    a = next;
  }

  const magnitudes = new Array<number>(depth);
  let da: Float64Array = net.dOut; // ∂L/∂a^[l]
  for (let l = depth - 1; l >= 0; l--) {
    const slope = slopes[l];
    const delta = new Float64Array(cell);
    let sum = 0;
    for (let k = 0; k < cell; k++) {
      const d = da[k] * slope[k];
      delta[k] = d;
      sum += Math.abs(d);
    }
    magnitudes[l] = sum / cell;
    if (l === 0) break;
    // ∂L/∂a^[l−1] = W^[l]ᵀ δ^[l], with W^[l] = std · N(0, 1).
    const w = net.weights[l];
    const prev = new Float64Array(cell);
    for (let b = 0; b < batch; b++) {
      const row = b * n;
      for (let i = 0; i < n; i++) {
        const d = delta[row + i];
        if (d === 0) continue;
        const wi = i * n;
        for (let j = 0; j < n; j++) prev[row + j] += w[wi + j] * d;
      }
      for (let j = 0; j < n; j++) prev[row + j] *= std;
    }
    da = prev;
  }

  for (const m of magnitudes) {
    if (!(m > 0) || !Number.isFinite(m)) throw new RangeError(`gradientFlow: a layer has mean |δ| = ${m}`);
  }
  const lastLog = detLog10(magnitudes[depth - 1]);
  const logRelative = magnitudes.map((m, l) => (l === depth - 1 ? 0 : detLog10(m) - lastLog));
  const logRatio = logRelative[0];
  return {
    magnitudes,
    logRelative,
    ratio: magnitudes[0] / magnitudes[depth - 1],
    logRatio,
    regime: regimeOf(logRatio, thresholdDecades),
  };
}

/** x ticks of the layer axis: every layer up to 10; past that 1, 5, 10, 15 and the last one, dropping a step closer
 *  than 3 layers to the last (two labels of 2 characters on 13px per layer at 375px would overlap). */
export function layerTicks(depth: number): number[] {
  if (depth <= 10) return Array.from({ length: depth }, (_, i) => i + 1);
  return [...[1, 5, 10, 15].filter((t) => depth - t >= 3), depth];
}

/** Superscript digits and minus for "10⁻⁶". */
const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUPER_MINUS = '⁻';


export function superscript(exp: number): string {
  const digits = String(Math.abs(exp))
    .split('')
    .map((d) => SUPERSCRIPT[Number(d)])
    .join('');
  return exp < 0 ? SUPER_MINUS + digits : digits;
}

/** A positive number with 2 significant figures: plain from 0.01 to 999, else mantissa and power of ten. */
export interface Magnitude {
  plain: string | null; // "0.035", "3.1", "850"; null when written as m × 10^e
  mantissa: string; // "1.8"
  exp: number; // −6
}

export function magnitudeParts(value: number): Magnitude {
  if (!(value > 0) || !Number.isFinite(value)) throw new RangeError(`magnitudeParts: needs a finite v > 0, got ${value}`);
  let exp = Math.round(detLog10(value) - 0.5);
  // detLog10 is within 2e-15: fix the decade at an exact power of ten.
  if (value / pow10(exp) >= 10) exp += 1;
  if (value / pow10(exp) < 1) exp -= 1;
  let m = Math.round((value / pow10(exp)) * 10) / 10;
  if (m >= 10) {
    m = 1;
    exp += 1;
  }
  const mantissa = m.toFixed(1);
  if (exp >= -2 && exp <= 2) {
    const digits = exp >= 1 ? 0 : 1 - exp;
    return { plain: (m * pow10(exp)).toFixed(digits), mantissa, exp };
  }
  return { plain: null, mantissa, exp };
}

/** 10^e for an integer e, exact up to |e| = 22. */
function pow10(e: number): number {
  let p = 1;
  for (let i = 0; i < Math.abs(e); i++) p *= 10;
  return e < 0 ? 1 / p : p;
}

/** "1.8 × 10⁻⁶" or "0.035": the shown form of magnitudeParts. */
export function formatMagnitude(value: number): string {
  const { plain, mantissa, exp } = magnitudeParts(value);
  return plain ?? `${mantissa} × 10${superscript(exp)}`;
}

/** A whole power of ten for a tick on the log axis: "1", "10⁴", "10⁻⁸". */
export function powerOfTenTick(exp: number): string {
  return exp === 0 ? '1' : `10${superscript(exp)}`;
}


