// The forward (noising) process of DDPM for DiffusionNoiseViz (docs/architecture/cv-lessons.md, section 1.2).
// Pure, relative imports only. Closed form: x_t = √ᾱ_t · x_0 + √(1 − ᾱ_t) · ε, with β_t linear from β_1 to β_T,
// α_t = 1 − β_t, ᾱ_t = Π_{s ≤ t} α_s, and ᾱ_0 = 1 (t = 0 is the clean image).
// Determinism: everything runs on + − × ÷ and Math.sqrt (correctly rounded by IEEE 754), so the build HTML and the
// first render in any browser agree to the last digit. Math.log and Math.cos are not required to be correctly
// rounded and may differ between engines; the noise uses detLn and detCos below instead (like detLog10, scale.ts).
import { createRng } from './sampling';
import { detLog10 } from './scale';

export interface LinearSchedule {
  T: number; // number of steps, 1000 in DDPM (not the temperature T of the LLM part)
  betaStart: number; // β_1
  betaEnd: number; // β_T
}

/** Ho, Jain and Abbeel (2020), section 4. */
export const DDPM_SCHEDULE: LinearSchedule = { T: 1000, betaStart: 1e-4, betaEnd: 0.02 };

function checkSchedule(s: LinearSchedule): void {
  if (!Number.isInteger(s.T) || s.T < 2) throw new RangeError(`schedule: T must be an integer >= 2, got ${s.T}`);
  if (!(s.betaStart > 0 && s.betaStart <= s.betaEnd && s.betaEnd < 1)) {
    throw new RangeError(`schedule: needs 0 < betaStart <= betaEnd < 1, got ${s.betaStart}, ${s.betaEnd}`);
  }
}

/**
 * β_1 … β_T, index t − 1. The same arithmetic as np.linspace(betaStart, betaEnd, T): start + i · step with
 * step = (end − start) / (T − 1), and the last value set to end exactly.
 */
export function linearBetas(s: LinearSchedule): number[] {
  checkSchedule(s);
  const step = (s.betaEnd - s.betaStart) / (s.T - 1);
  const betas = Array.from({ length: s.T }, (_, i) => i * step + s.betaStart);
  betas[s.T - 1] = s.betaEnd;
  return betas;
}

/** ᾱ_0 … ᾱ_T, index t: ᾱ_0 = 1, then a running product of 1 − β_t, as np.cumprod(1 − betas). */
export function alphaBars(s: LinearSchedule): number[] {
  const out = [1];
  let product = 1;
  for (const beta of linearBetas(s)) {
    product *= 1 - beta;
    out.push(product);
  }
  return out;
}

/** √ᾱ_t multiplies the image, √(1 − ᾱ_t) the noise; their squares add up to 1. */
export function coefficients(alphaBar: number): { signal: number; noise: number } {
  if (!(alphaBar >= 0 && alphaBar <= 1)) throw new RangeError(`coefficients: ᾱ = ${alphaBar} is not in [0, 1]`);
  return { signal: Math.sqrt(alphaBar), noise: Math.sqrt(1 - alphaBar) };
}

const LN10 = 2.302585092994046;
const PI = 3.141592653589793;

/** ln v from detLog10 (+ − × ÷ and Math.sqrt only). Error about 1e-15. Throws when v ≤ 0. */
export function detLn(v: number): number {
  return detLog10(v) * LN10;
}

/** cos on [0, π/2]: Taylor series to y^22 (the next term is below 1e-19 there), by Horner. */
function cosTaylor(y: number): number {
  const y2 = y * y;
  let sum = 0;
  for (let n = 11; n >= 1; n--) sum = 1 - (y2 / ((2 * n - 1) * (2 * n))) * sum;
  return sum;
}

/** cos θ with + − × ÷ only: θ is folded into [0, π/2] by symmetry. Error about 1e-15 for |θ| up to a few π. */
export function detCos(theta: number): number {
  if (!Number.isFinite(theta)) throw new RangeError(`detCos: ${theta} is not a finite number`);
  const turns = Math.round(theta / (2 * PI));
  const x = Math.abs(theta - turns * 2 * PI); // in [0, π]
  return x > PI / 2 ? -cosTaylor(PI - x) : cosTaylor(x);
}

/**
 * n numbers from a standard normal distribution, the same for a seed everywhere: Box–Muller on mulberry32
 * (createRng). Each pair of uniforms u1 in (0, 1], u2 in [0, 1) gives r = √(−2 ln u1) and the two normals
 * r cos 2πu2, r sin 2πu2 (sin as cos(2πu2 − π/2)).
 */
export function gaussianNoise(seed: number, n: number): number[] {
  if (!Number.isInteger(n) || n < 0) throw new RangeError(`gaussianNoise: n = ${n}`);
  const rng = createRng(seed);
  const out: number[] = [];
  while (out.length < n) {
    const u1 = 1 - rng();
    const u2 = rng();
    const r = Math.sqrt(-2 * detLn(u1));
    const theta = 2 * PI * u2;
    out.push(r * detCos(theta));
    if (out.length < n) out.push(r * detCos(theta - PI / 2));
  }
  return out;
}

/** x_t = signal · x_0 + noise · ε, pixel by pixel (flat arrays of the same length). */
export function noisyImage(x0: readonly number[], eps: readonly number[], c: { signal: number; noise: number }): number[] {
  if (x0.length !== eps.length) throw new RangeError(`noisyImage: ${x0.length} pixels but ${eps.length} noise values`);
  return x0.map((x, i) => c.signal * x + c.noise * (eps[i] ?? 0));
}

/** Grey level of a value of [−1, 1] as a fill opacity string: −1 → "0.00" (background), 1 → "1.00"; clipped. */
export function pixelOpacity(value: number): string {
  if (Number.isNaN(value)) throw new RangeError('pixelOpacity: NaN');
  const v = Math.min(1, Math.max(-1, value));
  return ((v + 1) / 2).toFixed(2);
}
