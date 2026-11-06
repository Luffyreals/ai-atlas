// GradientFlowViz (docs/architecture/viz/gradient-flow.md). One idea: in a deep network the gradient that reaches the
// first layers is a product of one factor per layer; sigmoid shrinks it layer after layer (vanishing), ReLU with
// weights of standard deviation 1 blows it up (exploding), ReLU with He initialisation keeps it the same size.
// Two rows of buttons pick the activation and the initialisation, a slider picks the number of hidden layers; a bar
// chart shows mean |∂L/∂z^[l]| of every layer relative to the last one on a log scale, and a status line names the
// regime. Every string arrives through props (GradientFlowViz.astro). The passes use + − × ÷ and Math.sqrt only
// (gradient-flow.ts), so the first render in the browser is the build HTML exactly.
import { useEffect, useId, useMemo, useState } from 'react';
import { formatString } from '../../../i18n/format';
import type { UiStrings } from '../../../i18n/ui';
import { formatNumber } from '../../../lib/viz/format';
import {
  ACTIVATIONS,
  GRADIENT_FLOW,
  INITS,
  createNetwork,
  layerTicks,
  gradientFlow,
  magnitudeParts,
  formatMagnitude,
  powerOfTenTick,
  weightStd,
  type Activation,
  type Init,
  type Regime,
} from '../../../lib/viz/gradient-flow';
import { clamp, pct, toPercentX, toPercentY, type Domain } from '../../../lib/viz/scale';
import AtPoint from '../kit/AtPoint';
import PlotFrame from '../kit/PlotFrame';
import { DotSwatch, Swatch } from '../kit/Swatch';
import { useHydrated } from '../kit/use-hydrated';
import { useSettled } from '../kit/use-settled';
import VizSlider from '../kit/VizSlider';

export interface GradientFlowVizIslandProps {
  captionHtml: string; // renderInlineMarkup output of the caption (KaTeX)
  stdHtml: Record<Init, string>; // KaTeX HTML of 1, √(1/n), √(2/n)
  labels: { depthHtml: string; depthText: string }; // escaped HTML and accessible name of depthLabel
  strings: UiStrings<'vizGradientFlow'>;
}

const REGIMES: readonly Regime[] = ['vanishing', 'stable', 'exploding'];
/** Height in px of the stub every bar gets, so a layer as large as the last one still shows. */
const STUB_PX = 2;

export default function GradientFlowVizIsland({ captionHtml, stdHtml, labels, strings }: GradientFlowVizIslandProps) {
  // Unique per island and the same at build time and in the browser (components.md 2.9). Only for id/for/aria-*.
  const uid = useId();
  const hydrated = useHydrated();
  const config = GRADIENT_FLOW;
  const [activation, setActivation] = useState<Activation>(config.initial.activation);
  const [init, setInit] = useState<Init>(config.initial.init);
  const [depth, setDepth] = useState(config.depth.initial);
  const [live, setLive] = useState('');

  // The fixed random draw (x, ∂L/∂a at the output, 20 weight matrices): about 4 ms, once.
  const net = useMemo(() => createNetwork(config), [config]);
  const run = (a: Activation, i: Init, d: number) => gradientFlow(net, a, i, d, config.thresholdDecades);
  // A forward and a backward pass: under 5 ms at 20 layers of 32.
  const result = useMemo(() => run(activation, init, depth), [net, activation, init, depth]);

  const limit = formatNumber(10 ** config.thresholdDecades, 0);
  const regimeNote: Record<Regime, string> = {
    vanishing: formatString(strings.vanishingNote, { limit }),
    stable: formatString(strings.stableNote, { limit }),
    exploding: formatString(strings.explodingNote, { limit }),
  };
  /** The ratio read aloud: "0.42", or "1.8 times 10 to the power −6" (no superscripts). */
  const spoken = (value: number) => {
    const { plain, mantissa, exp } = magnitudeParts(value);
    return plain ?? formatString(strings.sciSpoken, { mantissa, exp: formatNumber(exp, 0) });
  };
  const announce = (a: Activation, i: Init, d: number) => {
    const r = run(a, i, d);
    return formatString(strings.announce, {
      activation: strings[a],
      init: strings[i],
      depth: d,
      ratio: spoken(r.ratio),
      regime: strings[r.regime],
    });
  };

  // The live region speaks once the slider has stayed put SETTLE_MS (one reading per drag); a button speaks at once.
  const settled = useSettled(depth);
  useEffect(() => {
    if (settled === undefined) return;
    setLive(announce(activation, init, settled));
  }, [settled]);

  const chooseActivation = (next: Activation) => {
    if (next === activation) return;
    setActivation(next);
    setLive(announce(next, init, depth));
  };
  const chooseInit = (next: Init) => {
    if (next === init) return;
    setInit(next);
    setLive(announce(activation, next, depth));
  };

  const ids = {
    depth: `${uid}-depth`,
    desc: `${uid}-desc`,
    activation: `${uid}-activation`,
    init: `${uid}-init`,
  };
  const { logDomain, logTicks } = config;
  const xDomain: Domain = [0.5, depth + 0.5];
  const zeroY = pct(toPercentY(0, logDomain));
  const std = weightStd(init, config.width);
  const stdText = formatNumber(std, 3);

  return (
    <figure className="atlas-viz-figure">
      {/* Build-time HTML from renderInlineMarkup (escaped text plus KaTeX), never reader input. */}
      <figcaption className="atlas-viz-caption" dangerouslySetInnerHTML={{ __html: captionHtml }} />

      <div className="atlas-viz-controls" role="group" aria-label={strings.controls}>
        <div>
          <div className="atlas-viz-control-head">
            <span id={ids.activation}>{strings.activation}</span>
          </div>
          <div className="atlas-viz-choice" role="group" aria-labelledby={ids.activation}>
            {ACTIVATIONS.map((a) => (
              <button
                key={a}
                type="button"
                className="atlas-viz-toggle"
                aria-pressed={activation === a}
                disabled={!hydrated}
                onClick={() => chooseActivation(a)}
              >
                {strings[a]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="atlas-viz-control-head">
            <span id={ids.init}>{strings.init}</span>
          </div>
          <div className="atlas-viz-choice" role="group" aria-labelledby={ids.init}>
            {INITS.map((i) => (
              <button
                key={i}
                type="button"
                className="atlas-viz-toggle"
                aria-pressed={init === i}
                disabled={!hydrated}
                onClick={() => chooseInit(i)}
              >
                {strings[i]}
              </button>
            ))}
          </div>
        </div>
        <VizSlider
          id={ids.depth}
          labelHtml={labels.depthHtml}
          ariaLabel={labels.depthText}
          spec={config.depth}
          value={depth}
          display={formatNumber(depth, 0)}
          valueText={formatString(strings.depthValueText, { value: depth })}
          disabled={!hydrated}
          onChange={setDepth}
        />
      </div>

      <PlotFrame
        xDomain={xDomain}
        yDomain={logDomain}
        xTicks={layerTicks(depth)}
        yTicks={logTicks}
        yTickLabels={logTicks.map(powerOfTenTick)}
        xTitle={strings.layerAxis}
        yTitle={strings.gradAxis}
        label={formatString(strings.chartLabel, {
          depth,
          activation: strings[activation],
          init: strings[init],
          ratio: spoken(result.ratio),
        })}
        describedBy={ids.desc}
      >
        {/* Per layer l: a bar from 1 (the last layer) to mean |δ^[l]| / mean |δ^[last]|, a 2px stub under it, and a
            ring on the 1 line for the last layer itself. */}
        {result.logRelative.map((v, l) => {
          const x = pct(toPercentX(l + 1, xDomain));
          if (l === depth - 1) return <circle key={l} className="atlas-viz-zero" cx={x} cy={zeroY} r="4" />;
          const end = pct(toPercentY(clamp(v, logDomain), logDomain));
          return (
            <g key={l}>
              <line className="atlas-viz-bar" x1={x} y1={zeroY} x2={x} y2={end} />
              <AtPoint x={x} y={zeroY}>
                <line className="atlas-viz-bar" x1="0" y1="0" x2="0" y2={v >= 0 ? -STUB_PX : STUB_PX} />
              </AtPoint>
            </g>
          );
        })}
      </PlotFrame>

      <ul className="atlas-viz-key">
        <li>
          <Swatch className="atlas-viz-bar" upright />
          {strings.bar}
        </li>
        <li>
          <DotSwatch className="atlas-viz-zero" r={4} />
          {strings.lastLayer}
        </li>
      </ul>

      <div className="atlas-viz-readouts">
        <div className="atlas-viz-readout">
          <span className="atlas-viz-swatch" aria-hidden="true" />
          <span className="atlas-viz-readout-text">{strings.weightStd}</span>
          <span className="atlas-viz-num">
            {/* KaTeX of a constant formula, built at build time from code (GradientFlowViz.astro). */}
            <span dangerouslySetInnerHTML={{ __html: stdHtml[init] }} />
            {init === 'std1' ? null : ` ${Number(stdText) === std ? '=' : '≈'} ${stdText}`}
          </span>
        </div>
        <div className="atlas-viz-readout">
          <span className="atlas-viz-swatch" aria-hidden="true" />
          <span className="atlas-viz-readout-text">{strings.ratio}</span>
          <span className="atlas-viz-num">{formatMagnitude(result.ratio)}</span>
        </div>
      </div>

      <div className="atlas-viz-status atlas-viz-status-stack">
        {REGIMES.map((r) => (
          <p key={r} data-off={result.regime === r ? undefined : ''}>
            <strong>{strings[r]}</strong>: {regimeNote[r]}
          </p>
        ))}
      </div>

      <p className="sr-only" id={ids.desc}>
        {strings.chartDesc}
      </p>
      {/* Present and empty from the start; only its text changes, so screen readers speak it. */}
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </figure>
  );
}
