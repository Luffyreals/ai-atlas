// DiffusionNoiseViz math (docs/architecture/cv-lessons.md, section 1.2): the linear DDPM schedule against NumPy,
// the deterministic ln and cos behind Box–Muller, the seeded noise, and the fixed 16 × 16 image.
import { describe, expect, it } from 'vitest';
import { DIGIT_THREE_16, DIGIT_THREE_DIFFUSION } from '../../../src/data/datasets/pixel-digits';
import { formatNumber } from '../../../src/lib/viz/format';
import {
  DDPM_SCHEDULE,
  alphaBars,
  coefficients,
  detCos,
  detLn,
  gaussianNoise,
  linearBetas,
  noisyImage,
  pixelOpacity,
} from '../../../src/lib/viz/diffusion';
import { PYTHON_SCHEDULE } from '../fixtures/cv-viz-python';

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

describe('linear schedule (DDPM: β from 1e-4 to 0.02, T = 1000)', () => {
  const betas = linearBetas(DDPM_SCHEDULE);
  const bars = alphaBars(DDPM_SCHEDULE);

  it('has T betas from β_1 to β_T and T + 1 values of ᾱ, ᾱ_0 = 1', () => {
    expect(betas).toHaveLength(1000);
    expect(betas[0]).toBe(1e-4);
    expect(betas[999]).toBe(0.02);
    expect(bars).toHaveLength(1001);
    expect(bars[0]).toBe(1);
    for (let t = 1; t <= 1000; t++) expect(bars[t]).toBeLessThan(bars[t - 1] ?? 0);
  });

  it.each(Object.entries(PYTHON_SCHEDULE))('t = %s matches NumPy linspace and cumprod', (key, [beta, bar, signal, noise]) => {
    const t = Number(key);
    expect(rel(betas[t - 1] ?? 0, beta)).toBeLessThan(1e-12);
    expect(rel(bars[t] ?? 0, bar)).toBeLessThan(1e-12);
    const c = coefficients(bars[t] ?? 0);
    expect(formatNumber(c.signal, DIGIT_THREE_DIFFUSION.digits)).toBe(signal);
    expect(formatNumber(c.noise, DIGIT_THREE_DIFFUSION.digits)).toBe(noise);
  });

  it('the two curves cross (ᾱ_t first below 0.5) at t = 260, the number the chart description gives', () => {
    expect(bars.findIndex((b) => { const c = coefficients(b); return c.noise > c.signal; })).toBe(260);
  });

  it('the squares of the two coefficients add up to 1 at every t', () => {
    for (const bar of bars) {
      const c = coefficients(bar);
      expect(c.signal ** 2 + c.noise ** 2).toBeCloseTo(1, 14);
    }
  });

  it('by hand on a 2-step schedule', () => {
    const s = { T: 2, betaStart: 0.1, betaEnd: 0.5 };
    expect(linearBetas(s)).toEqual([0.1, 0.5]);
    const [a0, a1, a2] = alphaBars(s);
    expect(a0).toBe(1);
    expect(a1).toBeCloseTo(0.9, 15);
    expect(a2).toBeCloseTo(0.45, 15);
  });

  it('rejects a bad schedule or ᾱ', () => {
    expect(() => linearBetas({ T: 1, betaStart: 0.1, betaEnd: 0.2 })).toThrow(RangeError);
    expect(() => linearBetas({ T: 10, betaStart: 0.3, betaEnd: 0.2 })).toThrow(RangeError);
    expect(() => linearBetas({ T: 10, betaStart: 0, betaEnd: 0.2 })).toThrow(RangeError);
    expect(() => coefficients(1.1)).toThrow(RangeError);
    expect(() => coefficients(Number.NaN)).toThrow(RangeError);
  });
});

describe('detLn and detCos (no Math.log, no Math.cos)', () => {
  it('detLn agrees with Math.log to 1e-14 over (0, 1] and beyond', () => {
    for (const v of [1, 0.5, 1e-9, 2.328e-10, 0.999999, 3, 1234.5]) {
      expect(Math.abs(detLn(v) - Math.log(v))).toBeLessThan(1e-14 * Math.max(1, Math.abs(Math.log(v))));
    }
    expect(detLn(1)).toBe(0);
    expect(() => detLn(0)).toThrow(RangeError);
  });

  it('detCos agrees with Math.cos to 1e-14 on [−π, 3π)', () => {
    for (let i = 0; i <= 4000; i++) {
      const theta = -Math.PI + (i / 1000) * Math.PI;
      expect(Math.abs(detCos(theta) - Math.cos(theta))).toBeLessThan(1e-14);
    }
    expect(detCos(0)).toBe(1);
    expect(() => detCos(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe('gaussianNoise (Box–Muller on mulberry32)', () => {
  const n = DIGIT_THREE_16.width * DIGIT_THREE_16.height;
  const eps = gaussianNoise(DIGIT_THREE_DIFFUSION.seed, n);

  it('gives the same numbers for the same seed, other numbers for another seed', () => {
    expect(gaussianNoise(DIGIT_THREE_DIFFUSION.seed, n)).toEqual(eps);
    expect(gaussianNoise(DIGIT_THREE_DIFFUSION.seed + 1, n)).not.toEqual(eps);
    expect(gaussianNoise(7, 3)).toEqual(gaussianNoise(7, 4).slice(0, 3));
  });

  it('the 256 values of the VIZ look standard normal: mean near 0, standard deviation near 1', () => {
    expect(eps).toHaveLength(256);
    const mean = eps.reduce((s, v) => s + v, 0) / n;
    const sd = Math.sqrt(eps.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
    expect(Math.abs(mean)).toBeLessThan(0.15);
    expect(sd).toBeGreaterThan(0.85);
    expect(sd).toBeLessThan(1.15);
  });

  it('100 000 values: mean, variance and the share within ±1 match N(0, 1)', () => {
    const big = gaussianNoise(1, 100_000);
    const mean = big.reduce((s, v) => s + v, 0) / big.length;
    const variance = big.reduce((s, v) => s + (v - mean) ** 2, 0) / big.length;
    const within = big.filter((v) => Math.abs(v) < 1).length / big.length;
    expect(Math.abs(mean)).toBeLessThan(0.01);
    expect(Math.abs(variance - 1)).toBeLessThan(0.02);
    expect(Math.abs(within - 0.6827)).toBeLessThan(0.01);
  });

  it('matches the same Box–Muller written with Math.log and Math.cos to 1e-12', () => {
    const plain: number[] = [];
    let state = DIGIT_THREE_DIFFUSION.seed >>> 0;
    const rng = () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    while (plain.length < n) {
      const r = Math.sqrt(-2 * Math.log(1 - rng()));
      const theta = 2 * Math.PI * rng();
      plain.push(r * Math.cos(theta), r * Math.sin(theta));
    }
    eps.forEach((v, i) => expect(Math.abs(v - (plain[i] ?? Number.NaN))).toBeLessThan(1e-12));
  });
});

describe('noisyImage and pixelOpacity', () => {
  it('x_t = √ᾱ x_0 + √(1 − ᾱ) ε, pixel by pixel', () => {
    expect(noisyImage([1, -1], [0.5, 2], { signal: 0.6, noise: 0.8 })).toEqual([0.6 + 0.4, -0.6 + 1.6]);
    expect(() => noisyImage([1], [1, 2], { signal: 1, noise: 0 })).toThrow(RangeError);
  });

  it('t = 0 gives the clean image back exactly', () => {
    const x0 = DIGIT_THREE_16.pixels.flat();
    const eps = gaussianNoise(DIGIT_THREE_DIFFUSION.seed, x0.length);
    expect(noisyImage(x0, eps, coefficients(1))).toEqual(x0);
  });

  it('maps [−1, 1] to opacity 0–1, clipped outside', () => {
    expect(pixelOpacity(-1)).toBe('0.00');
    expect(pixelOpacity(0)).toBe('0.50');
    expect(pixelOpacity(1)).toBe('1.00');
    expect(pixelOpacity(-2.5)).toBe('0.00');
    expect(pixelOpacity(3)).toBe('1.00');
  });
});

describe('DIGIT_THREE_16 and DIGIT_THREE_DIFFUSION', () => {
  it('is 16 × 16 with every pixel −1, 0 or 1', () => {
    expect(DIGIT_THREE_16.pixels).toHaveLength(16);
    for (const row of DIGIT_THREE_16.pixels) {
      expect(row).toHaveLength(16);
      for (const v of row) expect([-1, 0, 1]).toContain(v);
    }
  });

  it('the slider runs over t = 0 … T, and the ticks span it', () => {
    const c = DIGIT_THREE_DIFFUSION;
    expect([c.t.min, c.t.max, c.t.step]).toEqual([0, c.schedule.T, 1]);
    expect(c.tTicks.at(0)).toBe(0);
    expect(c.tTicks.at(-1)).toBe(c.schedule.T);
    expect(c.schedule.T % c.chartStep).toBe(0);
    expect(c.schedule).toEqual({ T: 1000, betaStart: 1e-4, betaEnd: 0.02 });
  });

  it('the "almost pure noise" note shows for the last part of the slider only', () => {
    const bars = alphaBars(DIGIT_THREE_DIFFUSION.schedule);
    const first = bars.findIndex((b) => coefficients(b).signal < DIGIT_THREE_DIFFUSION.mostlyNoise);
    expect(first).toBeGreaterThan(500);
    expect(first).toBeLessThan(1000);
  });
});
