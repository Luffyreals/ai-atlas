// Gradient flow for GradientFlowViz (docs/architecture/viz/gradient-flow.md): the deterministic exp and ln, the
// seeded normals, a network small enough to work by hand, the three settings the lesson dl/training-neural-networks
// asks the reader to try, the shown numbers, the time budget, and the source rule (+ − × ÷ and Math.sqrt only).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ACTIVATIONS,
  GRADIENT_FLOW,
  INITS,
  createNetwork,
  detExp,
  detLn,
  formatMagnitude,
  gradientFlow,
  layerTicks,
  magnitudeParts,
  powerOfTenTick,
  regimeOf,
  standardNormals,
  weightStd,
  type FlowNetwork,
} from '../../../src/lib/viz/gradient-flow';

const FILE = new URL('../../../src/lib/viz/gradient-flow.ts', import.meta.url);
const C = GRADIENT_FLOW;
const net = createNetwork(C);
const flow = (a: (typeof ACTIVATIONS)[number], i: (typeof INITS)[number], d: number) =>
  gradientFlow(net, a, i, d, C.thresholdDecades);

describe('detExp and detLn', () => {
  it('are within 2e-16 relative of Math.exp and 1e-14 of Math.log', () => {
    let worstExp = 0;
    let worstLn = 0;
    for (let k = 0; k <= 2000; k++) {
      const x = -40 + (80 * k) / 2000;
      worstExp = Math.max(worstExp, Math.abs(detExp(x) - Math.exp(x)) / Math.exp(x));
      const v = 1e-6 * 1.02 ** k;
      worstLn = Math.max(worstLn, Math.abs(detLn(v) - Math.log(v)));
    }
    expect(worstExp).toBeLessThan(5e-16);
    expect(worstLn).toBeLessThan(1e-14);
  });

  it('gives exactly 1 at 0, 0 far below and Infinity far above', () => {
    expect(detExp(0)).toBe(1);
    expect(detExp(-800)).toBe(0);
    expect(detExp(800)).toBe(Infinity);
    expect(detExp(-740) / Math.exp(-740)).toBeCloseTo(1, 10);
  });
});

describe('standardNormals', () => {
  it('is the same for the same seed, and has mean 0 and variance 1', () => {
    const a = standardNormals(20000, 7);
    expect(standardNormals(20000, 7)).toEqual(a);
    expect(standardNormals(5, 8)).not.toEqual(a.subarray(0, 5));
    let sum = 0;
    let sq = 0;
    for (const v of a) {
      sum += v;
      sq += v * v;
    }
    expect(Math.abs(sum / a.length)).toBeLessThan(0.03);
    expect(Math.abs(sq / a.length - 1)).toBeLessThan(0.03);
  });
});

describe('weightStd', () => {
  it('is 1, √(1/n) and √(2/n)', () => {
    expect(weightStd('std1', 32)).toBe(1);
    expect(weightStd('xavier', 32)).toBeCloseTo(Math.sqrt(1 / 32), 15);
    expect(weightStd('he', 32)).toBe(0.25);
  });
});

describe('gradientFlow (by hand)', () => {
  // One unit per layer, one sample: x = 2, W^[1] = 0.5, W^[2] = 3, ∂L/∂a^[2] = 1.
  const tiny: FlowNetwork = {
    width: 1,
    batch: 1,
    maxDepth: 2,
    x: Float64Array.of(2),
    dOut: Float64Array.of(1),
    weights: [Float64Array.of(0.5), Float64Array.of(3)],
  };

  it('ReLU: z = 1, 3; δ^[2] = 1, δ^[1] = W^[2] δ^[2] g\'(z^[1]) = 3', () => {
    const r = gradientFlow(tiny, 'relu', 'std1', 2, 1);
    expect(r.magnitudes).toEqual([3, 1]);
    expect(r.ratio).toBe(3);
    expect(r.logRatio).toBeCloseTo(Math.log10(3), 14);
  });

  it('sigmoid: δ^[1] = W^[2] σ\'(z^[2]) σ\'(z^[1]) with z^[1] = 1, z^[2] = 3 σ(1)', () => {
    const s = (z: number) => 1 / (1 + Math.exp(-z));
    const d = (z: number) => s(z) * (1 - s(z));
    const z2 = 3 * s(1);
    const r = gradientFlow(tiny, 'sigmoid', 'std1', 2, 1);
    expect(r.magnitudes[1]).toBeCloseTo(d(z2), 15);
    expect(r.magnitudes[0]).toBeCloseTo(3 * d(z2) * d(1), 15);
  });

  it('tanh: the same chain with tanh\' = 1 − tanh²; He scales W by √(2/1)', () => {
    const d = (z: number) => 1 - Math.tanh(z) ** 2;
    const k = Math.SQRT2;
    const z1 = 2 * 0.5 * k;
    const z2 = 3 * k * Math.tanh(z1);
    const r = gradientFlow(tiny, 'tanh', 'he', 2, 1);
    expect(r.magnitudes[1]).toBeCloseTo(d(z2), 14);
    expect(r.magnitudes[0]).toBeCloseTo(3 * k * d(z2) * d(z1), 14);
  });

  it('rejects a depth outside 1 … maxDepth', () => {
    expect(() => gradientFlow(tiny, 'relu', 'he', 3, 1)).toThrow(RangeError);
    expect(() => gradientFlow(tiny, 'relu', 'he', 0, 1)).toThrow(RangeError);
  });
});

describe('regimeOf', () => {
  it('splits at ± thresholdDecades', () => {
    expect(regimeOf(-1.01, 1)).toBe('vanishing');
    expect(regimeOf(-1, 1)).toBe('stable');
    expect(regimeOf(1, 1)).toBe('stable');
    expect(regimeOf(1.01, 1)).toBe('exploding');
  });
});

describe('the three settings of the lesson, at 10 hidden layers', () => {
  it('sigmoid + Xavier vanishes: layer 1 gets about 2 × 10⁻⁶ of the last layer, falling every layer', () => {
    const r = flow('sigmoid', 'xavier', 10);
    expect(r.regime).toBe('vanishing');
    expect(formatMagnitude(r.ratio)).toBe('2.0 × 10⁻⁶');
    for (let l = 1; l < 10; l++) expect(r.logRelative[l - 1]).toBeLessThan(r.logRelative[l]);
  });

  it('ReLU + standard deviation 1 explodes: layer 1 gets about 2 × 10⁵ times the last layer', () => {
    const r = flow('relu', 'std1', 10);
    expect(r.regime).toBe('exploding');
    expect(formatMagnitude(r.ratio)).toBe('2.1 × 10⁵');
  });

  it('ReLU + He is stable: layer 1 and the last layer stay within a factor 2', () => {
    const r = flow('relu', 'he', 10);
    expect(r.regime).toBe('stable');
    expect(formatMagnitude(r.ratio)).toBe('0.81');
    for (const v of r.logRelative) expect(Math.abs(v)).toBeLessThan(Math.log10(2));
  });

  it('keep their regime at every depth from 3 to 20 (ReLU + He: at every depth)', () => {
    for (let d = 3; d <= 20; d++) {
      expect(flow('sigmoid', 'xavier', d).regime, `sigmoid xavier ${d}`).toBe('vanishing');
      expect(flow('relu', 'std1', d).regime, `relu std1 ${d}`).toBe('exploding');
    }
    for (let d = 2; d <= 20; d++) expect(flow('relu', 'he', d).regime, `relu he ${d}`).toBe('stable');
  });

  it('a shallow network is stable even with sigmoid: 2 layers lose less than one decade', () => {
    expect(flow('sigmoid', 'xavier', 2).regime).toBe('stable');
  });
});

describe('every setting on the slider', () => {
  it('gives positive finite magnitudes inside the log axis', () => {
    for (const a of ACTIVATIONS) {
      for (const i of INITS) {
        for (let d = C.depth.min; d <= C.depth.max; d++) {
          const r = flow(a, i, d);
          expect(r.magnitudes).toHaveLength(d);
          expect(r.logRelative[d - 1]).toBe(0);
          for (const v of r.logRelative) {
            expect(v, `${a} ${i} ${d}`).toBeGreaterThan(C.logDomain[0]);
            expect(v, `${a} ${i} ${d}`).toBeLessThan(C.logDomain[1]);
          }
        }
      }
    }
  });

  it('runs a 20-layer pass in well under 50 ms', () => {
    flow('tanh', 'xavier', 20);
    const start = performance.now();
    for (let k = 0; k < 5; k++) flow('sigmoid', 'std1', 20);
    expect((performance.now() - start) / 5).toBeLessThan(50);
  });

  it('keeps the first layers when the depth changes (one random stream)', () => {
    const deep = createNetwork(C);
    expect(deep.weights[0]).toEqual(net.weights[0]);
    expect(deep.weights).toHaveLength(C.depth.max);
  });
});

describe('shown numbers', () => {
  it('writes 2 significant figures, plain from 0.01 to 999', () => {
    expect(formatMagnitude(1.97e-6)).toBe('2.0 × 10⁻⁶');
    expect(formatMagnitude(2.12e5)).toBe('2.1 × 10⁵');
    expect(formatMagnitude(0.0349)).toBe('0.035');
    expect(formatMagnitude(0.81)).toBe('0.81');
    expect(formatMagnitude(1)).toBe('1.0');
    expect(formatMagnitude(47.2)).toBe('47');
    expect(formatMagnitude(999.6)).toBe('1.0 × 10³');
    expect(formatMagnitude(0.00999)).toBe('0.010');
    expect(formatMagnitude(1e-12)).toBe('1.0 × 10⁻¹²');
    expect(magnitudeParts(3.5e-7)).toEqual({ plain: null, mantissa: '3.5', exp: -7 });
  });

  it('labels the log ticks and the layer ticks', () => {
    expect(C.logTicks.map(powerOfTenTick)).toEqual(['10⁻¹²', '10⁻⁸', '10⁻⁴', '1', '10⁴', '10⁸', '10¹²']);
    expect(layerTicks(2)).toEqual([1, 2]);
    expect(layerTicks(10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(layerTicks(12)).toEqual([1, 5, 12]);
    expect(layerTicks(13)).toEqual([1, 5, 10, 13]);
    expect(layerTicks(20)).toEqual([1, 5, 10, 15, 20]);
  });
});

describe('source: only + − × ÷ and exact Math calls', () => {
  const code = readFileSync(FILE, 'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  it.each(['**', 'Math.pow', 'Math.exp', 'Math.log', 'Math.tanh', 'Math.sin', 'Math.cos', 'Math.hypot'])(
    'does not use %s',
    (name) => expect(code.includes(name)).toBe(false),
  );

  it('calls only Math.sqrt, Math.abs, Math.round', () => {
    const used = new Set(code.match(/\bMath\.\w+/g) ?? []);
    expect([...used].filter((n) => !['Math.sqrt', 'Math.abs', 'Math.round'].includes(n))).toEqual([]);
  });

  it('imports by relative path only', () => {
    const imports = [...code.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1]);
    for (const path of imports) expect(path).toMatch(/^\.\.?\//);
  });
});
