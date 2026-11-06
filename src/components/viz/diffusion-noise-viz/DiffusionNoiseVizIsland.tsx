// DiffusionNoiseViz (docs/architecture/cv-lessons.md, section 1.2). One idea: x_t = √ᾱ_t x_0 + √(1 − ᾱ_t) ε; as t
// grows the image part shrinks and the noise part grows, until almost pure noise is left.
// One slider t = 0 … T. Three pictures (x_0, the fixed ε, x_t), the two coefficients as numbers, and a small chart of
// both coefficients over t with a cursor at the current t. Linear DDPM schedule, ε from a seeded Box–Muller, both in
// diffusion.ts with + − × ÷ and Math.sqrt only, so the first render in the browser is the build HTML exactly.
// Strings arrive through props; KaTeX through named slots (see DiffusionNoiseViz.astro).
import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { DiffusionConfig } from '../../../data/datasets/pixel-digits';
import { formatString } from '../../../i18n/format';
import type { UiStrings } from '../../../i18n/ui';
import { alphaBars, coefficients, gaussianNoise, noisyImage, pixelOpacity } from '../../../lib/viz/diffusion';
import { formatNumber } from '../../../lib/viz/format';
import { toPolyline } from '../../../lib/viz/poly-fit';
import { pct, toPercentX, toPercentY, type Domain } from '../../../lib/viz/scale';
import PixelGrid, { type PixelCell } from '../kit/PixelGrid';
import PlotCurve from '../kit/PlotCurve';
import PlotFrame from '../kit/PlotFrame';
import { Swatch } from '../kit/Swatch';
import { useHydrated } from '../kit/use-hydrated';
import { useSettled } from '../kit/use-settled';
import VizSlider from '../kit/VizSlider';

export interface DiffusionNoiseVizIslandProps {
  image: readonly (readonly number[])[]; // DIGIT_THREE_16.pixels, values in [−1, 1]
  description: string; // DIGIT_THREE_16.description[locale]
  config: DiffusionConfig;
  labels: {
    tHtml: string; // KaTeX HTML of strings.tLabel
    tText: string; // its accessible name (inlineMarkupLabel)
  };
  strings: UiStrings<'vizDiffusion'>;
  // Named slots: static KaTeX HTML rendered by the wrapper.
  x0Title?: ReactNode;
  noiseTitle?: ReactNode;
  xtTitle?: ReactNode;
  formula?: ReactNode;
  signalSymbol?: ReactNode;
  noiseSymbol?: ReactNode;
}

const COEF_DOMAIN: Domain = [0, 1];

const shade = (values: readonly number[], cols: number): PixelCell[][] =>
  Array.from({ length: values.length / cols }, (_, r) =>
    values.slice(r * cols, (r + 1) * cols).map((v) => ({ opacity: pixelOpacity(v) })),
  );

export default function DiffusionNoiseVizIsland({
  image,
  description,
  config,
  labels,
  strings,
  x0Title,
  noiseTitle,
  xtTitle,
  formula,
  signalSymbol,
  noiseSymbol,
}: DiffusionNoiseVizIslandProps) {
  const uid = useId();
  const hydrated = useHydrated();
  const [t, setT] = useState<number>(config.t.initial);
  const [live, setLive] = useState('');

  const rows = image.length;
  const cols = image[0]?.length ?? 0;
  const T = config.schedule.T;
  const tDomain: Domain = [0, T];

  // Everything that does not depend on t, once.
  const fixed = useMemo(() => {
    const bars = alphaBars(config.schedule);
    const coefs = bars.map(coefficients);
    const x0 = image.flat();
    const eps = gaussianNoise(config.seed, x0.length);
    const steps = Array.from({ length: T / config.chartStep + 1 }, (_, k) => k * config.chartStep);
    const curve = (pick: (c: { signal: number; noise: number }) => number) =>
      toPolyline(
        steps.map((s) => ({ x: s, y: pick(coefs[s] ?? { signal: 0, noise: 0 }) })),
        tDomain,
        COEF_DOMAIN,
      );
    // First t where the noise coefficient passes the image coefficient (ᾱ_t < 0.5).
    const cross = coefs.findIndex((c) => c.noise > c.signal);
    return {
      coefs,
      x0,
      eps,
      x0Cells: shade(x0, cols),
      epsCells: shade(eps, cols),
      signalCurve: curve((c) => c.signal),
      noiseCurve: curve((c) => c.noise),
      cross,
    };
  }, [image, config, cols, T]);

  const c = fixed.coefs[t] ?? { signal: 1, noise: 0 };
  const xt = noisyImage(fixed.x0, fixed.eps, c);
  const signalText = formatNumber(c.signal, config.digits);
  const noiseText = formatNumber(c.noise, config.digits);
  const tText = formatNumber(t, 0);

  const settled = useSettled(t);
  useEffect(() => {
    if (settled === undefined) return;
    setLive(formatString(strings.announce, { t: tText, signal: signalText, noise: noiseText }));
  }, [settled]);

  const cursorX = pct(toPercentX(t, tDomain));
  const ids = { t: `${uid}-t`, desc: `${uid}-desc`, chartDesc: `${uid}-chart-desc` };
  const panels = { '--atlas-viz-cols': 3 } as CSSProperties;
  const limit = formatNumber(config.mostlyNoise, 1);
  const note = t === 0 ? 'start' : c.signal < config.mostlyNoise ? 'end' : 'mid';

  return (
    <figure className="atlas-viz-figure">
      <figcaption className="atlas-viz-caption">{strings.caption}</figcaption>

      <div className="atlas-viz-panels" style={panels}>
        <div>
          <div className="atlas-viz-axis-title">{x0Title}</div>
          <PixelGrid rows={rows} cols={cols} cells={fixed.x0Cells} label={strings.x0Label} describedBy={ids.desc} />
        </div>
        <div>
          <div className="atlas-viz-axis-title">{noiseTitle}</div>
          <PixelGrid rows={rows} cols={cols} cells={fixed.epsCells} label={strings.noiseLabel} />
        </div>
        <div>
          <div className="atlas-viz-axis-title">{xtTitle}</div>
          <PixelGrid
            rows={rows}
            cols={cols}
            cells={shade(xt, cols)}
            label={formatString(strings.xtLabel, { t: tText, signal: signalText, noise: noiseText })}
          />
        </div>
      </div>
      <p className="atlas-viz-key">{strings.shadeKey}</p>

      <div className="atlas-viz-controls" role="group" aria-label={strings.controls}>
        <VizSlider
          id={ids.t}
          labelHtml={labels.tHtml}
          ariaLabel={labels.tText}
          spec={config.t}
          value={t}
          display={tText}
          valueText={formatString(strings.tValueText, { t: tText, T })}
          disabled={!hydrated}
          onChange={setT}
        />
      </div>

      <div>{formula}</div>

      {/* The two coefficients, and the key of the chart below: each swatch is the line it names. */}
      <div className="atlas-viz-readouts">
        <div className="atlas-viz-readout">
          <Swatch className="atlas-viz-series" dot="point" />
          <span className="atlas-viz-readout-text">
            <span>{signalSymbol}</span>
            <span>{strings.signalName}</span>
          </span>
          <span className="atlas-viz-num">{signalText}</span>
        </div>
        <div className="atlas-viz-readout">
          <Swatch className="atlas-viz-series atlas-viz-series-alt" dot="ring" />
          <span className="atlas-viz-readout-text">
            <span>{noiseSymbol}</span>
            <span>{strings.noiseName}</span>
          </span>
          <span className="atlas-viz-num">{noiseText}</span>
        </div>
      </div>

      <PlotFrame
        xDomain={tDomain}
        yDomain={COEF_DOMAIN}
        xTicks={config.tTicks}
        yTicks={config.coefTicks}
        xTitle={strings.tAxis}
        yTitle={strings.coefAxis}
        label={formatString(strings.chartLabel, { T, t: tText })}
        describedBy={ids.chartDesc}
        shape="short"
      >
        <line className="atlas-viz-cursor" x1={cursorX} y1="0%" x2={cursorX} y2="100%" />
        <PlotCurve points={fixed.signalCurve} className="atlas-viz-series" />
        <PlotCurve points={fixed.noiseCurve} className="atlas-viz-series atlas-viz-series-alt" />
        <circle className="atlas-viz-point" cx={cursorX} cy={pct(toPercentY(c.signal, COEF_DOMAIN))} r="5" />
        <circle className="atlas-viz-ring" cx={cursorX} cy={pct(toPercentY(c.noise, COEF_DOMAIN))} r="5" />
      </PlotFrame>

      {/* Every note in the DOM, stacked in one cell: the line is as tall as the longest from the start. */}
      <div className="atlas-viz-status atlas-viz-status-stack">
        <p data-off={note === 'start' ? undefined : ''}>{strings.startNote}</p>
        <p data-off={note === 'mid' ? undefined : ''}>{strings.midNote}</p>
        <p data-off={note === 'end' ? undefined : ''}>{formatString(strings.endNote, { limit })}</p>
      </div>

      <p className="sr-only" id={ids.desc}>
        {description}
      </p>
      <p className="sr-only" id={ids.chartDesc}>
        {formatString(strings.chartDesc, { cross: fixed.cross })}
      </p>
      {/* Present and empty from the start; only its text changes, so screen readers speak it. */}
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </figure>
  );
}
