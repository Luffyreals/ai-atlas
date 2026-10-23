// RegularizationViz (docs/architecture/viz.md, sections 10.4.4–10.4.5). One idea: as λ grows the coefficients
// shrink and the degree-15 curve calms down; too small a λ overfits, too large a λ underfits, a middle λ gives the
// lowest test MSE; Lasso also sets many coefficients to exactly 0, Ridge does not.
// A slider picks one of the λ levels, two buttons pick Ridge or Lasso; the main plot redraws the curve, a bar
// chart shows the 15 coefficients, and a status line names the zone.
// Every string arrives through props (RegularizationViz.astro); the Lasso rows come from the generated module,
// in this island's JS chunk (section 10.2.4 D). The Ridge fits use + − × ÷ and Math.sqrt only
// (regularized-fit.ts), so the first render in the browser is the build HTML exactly.
import { useEffect, useId, useMemo, useState } from 'react';
import { SINE_LASSO_PATH } from '../../../data/datasets/sine-lasso-path';
import type { Row } from '../../../data/datasets/types';
import { formatString } from '../../../i18n/format';
import type { UiStrings } from '../../../i18n/ui';
import { formatNumber } from '../../../lib/viz/format';
import { formatMse, sampleCurve, toPolyline, type FitZone } from '../../../lib/viz/poly-fit';
import {
  bestLevel,
  formatLambda,
  levelZone,
  penaltyPath,
  predictPenalized,
  type LambdaLevel,
  type Penalty,
  type RegularizationConfig,
} from '../../../lib/viz/regularized-fit';
import { clamp, pct, toPercentX, toPercentY } from '../../../lib/viz/scale';
import AtPoint from '../kit/AtPoint';
import PlotCurve from '../kit/PlotCurve';
import PlotFrame from '../kit/PlotFrame';
import { DotSwatch, Swatch } from '../kit/Swatch';
import type { AxisText } from '../kit/types';
import { useHydrated } from '../kit/use-hydrated';
import { useSettled } from '../kit/use-settled';
import VizSlider from '../kit/VizSlider';

export interface RegularizationVizIslandProps {
  train: readonly Row[];
  test: readonly Row[];
  config: RegularizationConfig;
  axes: { x: AxisText; y: AxisText }; // 'x', 'y': title = name (no unit)
  itemLabels: { train: string; test: string }; // SINE_TRAIN / SINE_TEST .itemLabel[locale]
  description: string; // sr-only description of the main plot
  labels: { lambdaHtml: string; lambdaText: string }; // KaTeX HTML and accessible name of lambdaLabel
  strings: UiStrings<'vizRegularization'>;
}

const PENALTIES: readonly Penalty[] = ['ridge', 'lasso'];
/** Hollow triangles 12px wide and 10px tall, apex on the edge, pointing out: a coefficient off the chart. */
const TRIANGLE_TOP = '0,1 6,11 -6,11';
const TRIANGLE_BOTTOM = '0,-1 6,-11 -6,-11';
/** The upward triangle centred on the anchor, for the key. */
const TRIANGLE_CENTRED = '0,-5 6,5 -6,5';
/** Height in px of the stub every non-zero coefficient gets, so a tiny one still shows. */
const STUB_PX = 2;

export default function RegularizationVizIsland({
  train,
  test,
  config,
  axes,
  itemLabels,
  description,
  labels,
  strings,
}: RegularizationVizIslandProps) {
  // Unique per island and the same at build time and in the browser (components.md 2.9). Only for id/for/aria-*.
  const uid = useId();
  const hydrated = useHydrated();
  const [index, setIndex] = useState(config.slider.initial);
  const [penalty, setPenalty] = useState<Penalty>(config.initialPenalty);
  const [live, setLive] = useState('');

  const { xDomain, yDomain, featureDomain, coefDomain, digits, levels } = config;
  const mseText = (value: number) => formatMse(value, digits);

  // Sixteen QR solves of 31 × 15 (Ridge) and 34 MSE sums, once: under 1 ms.
  const fixed = useMemo(() => {
    const paths = penaltyPath(train, test, config, SINE_LASSO_PATH);
    return { s: paths.standardizer, paths, best: { ridge: bestLevel(paths.ridge), lasso: bestLevel(paths.lasso) } };
  }, [train, test, config]);
  const { s, paths, best } = fixed;
  const fit = paths[penalty][index];
  const zone = levelZone(paths[penalty], index);
  const atBest = index === best[penalty];

  // 201 × 15 multiply-adds per level and penalty: the fitted curve over the whole x domain.
  const curve = useMemo(
    () =>
      toPolyline(
        sampleCurve((x) => predictPenalized(fit, x, s), xDomain, config.samples),
        xDomain,
        yDomain,
      ),
    [fit, s, config],
  );

  /** λ read aloud: "0 (no penalty)", "10 to the power −14", or the shown decimal. */
  const spoken = (level: LambdaLevel) =>
    level.exp === null
      ? strings.zeroLambda
      : level.exp <= -4
        ? formatString(strings.pow10Spoken, { exp: formatNumber(level.exp, 0) })
        : formatLambda(level);
  const zoneText: Record<FitZone, string> = {
    underfit: strings.underfit,
    good: strings.goodFit,
    overfit: strings.overfit,
  };
  const total = fit.w.length;
  const [, coefMax] = coefDomain;
  const overCount = fit.w.filter((w) => Math.abs(w) > coefMax).length;
  const zerosText = `${formatNumber(fit.zeros, 0)}/${formatNumber(total, 0)}`;
  const level = levels[index];
  const lambdaSpoken = spoken(level);

  const announce = (p: Penalty, i: number) => {
    const f = paths[p][i];
    const z = zoneText[levelZone(paths[p], i)];
    return formatString(strings.announce, {
      model: strings[p],
      lambda: spoken(levels[i]),
      train: mseText(f.mseTrain),
      test: mseText(f.mseTest),
      zeros: formatNumber(f.zeros, 0),
      total: formatNumber(f.w.length, 0),
      zone: i === best[p] ? `${z} ${strings.bestLambda}` : z,
    });
  };

  // The live region speaks once the slider has stayed put SETTLE_MS (one reading per drag). Runs only when a
  // new level settles; a penalty button speaks at once (below).
  const settled = useSettled(index);
  useEffect(() => {
    if (settled === undefined) return;
    setLive(announce(penalty, settled));
  }, [settled]);

  const choose = (next: Penalty) => {
    if (next === penalty) return;
    setPenalty(next);
    setLive(announce(next, index));
  };

  const ids = { lambda: `${uid}-lambda`, desc: `${uid}-desc`, barsDesc: `${uid}-bars-desc` };
  const zeroY = pct(toPercentY(0, coefDomain));

  return (
    <figure className="atlas-viz-figure">
      <figcaption className="atlas-viz-caption">{strings.caption}</figcaption>

      <PlotFrame
        xDomain={xDomain}
        yDomain={yDomain}
        xTicks={config.xTicks}
        yTicks={config.yTicks}
        xTitle={axes.x.title}
        yTitle={axes.y.title}
        label={formatString(strings.plotLabel, {
          train: train.length,
          test: test.length,
          model: strings[penalty],
          lambda: lambdaSpoken,
        })}
        describedBy={ids.desc}
      >
        {/* Bottom to top: fitted curve (clipped to the plot box), test points, training points. */}
        <PlotCurve points={curve} className="atlas-viz-primary" />
        {test.map(([x, y], i) => (
          <circle
            key={`t${i}`}
            className="atlas-viz-ring"
            cx={pct(toPercentX(x, xDomain))}
            cy={pct(toPercentY(y, yDomain))}
            r="6"
          />
        ))}
        {train.map(([x, y], i) => (
          <circle
            key={`p${i}`}
            className="atlas-viz-point"
            cx={pct(toPercentX(x, xDomain))}
            cy={pct(toPercentY(y, yDomain))}
            r="6"
          />
        ))}
      </PlotFrame>

      <ul className="atlas-viz-key">
        <li>
          <DotSwatch className="atlas-viz-point" />
          {itemLabels.train}
        </li>
        <li>
          <DotSwatch className="atlas-viz-ring" />
          {itemLabels.test}
        </li>
        <li>
          <Swatch className="atlas-viz-primary" />
          {strings.curve}
        </li>
      </ul>

      <div className="atlas-viz-controls" role="group" aria-label={strings.controls}>
        <VizSlider
          id={ids.lambda}
          labelHtml={labels.lambdaHtml}
          ariaLabel={labels.lambdaText}
          spec={config.slider}
          value={index}
          display={formatLambda(level)}
          valueText={formatString(strings.lambdaValueText, { value: lambdaSpoken })}
          disabled={!hydrated}
          onChange={setIndex}
        />
        <div className="atlas-viz-choice" role="group" aria-label={strings.penalty}>
          {PENALTIES.map((p) => (
            <button
              key={p}
              type="button"
              className="atlas-viz-toggle"
              aria-pressed={penalty === p}
              disabled={!hydrated}
              onClick={() => choose(p)}
            >
              {strings[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="atlas-viz-readouts">
        <div className="atlas-viz-readout">
          {/* No line on the plot stands for an MSE: an empty cell keeps the three rows aligned. */}
          <span className="atlas-viz-swatch" aria-hidden="true" />
          <span className="atlas-viz-readout-text">{strings.trainMse}</span>
          <span className="atlas-viz-num">{mseText(fit.mseTrain)}</span>
        </div>
        <div className="atlas-viz-readout">
          <span className="atlas-viz-swatch" aria-hidden="true" />
          <span className="atlas-viz-readout-text">{strings.testMse}</span>
          <span className="atlas-viz-num">{mseText(fit.mseTest)}</span>
        </div>
        <div className="atlas-viz-readout">
          <DotSwatch className="atlas-viz-zero" r={4} />
          <span className="atlas-viz-readout-text">{strings.zeros}</span>
          <span className="atlas-viz-num">{zerosText}</span>
        </div>
      </div>

      <PlotFrame
        xDomain={featureDomain}
        yDomain={coefDomain}
        xTicks={config.featureTicks}
        yTicks={config.coefTicks}
        xTitle={strings.featureAxis}
        yTitle={strings.coefAxis}
        label={formatString(strings.barsLabel, {
          model: strings[penalty],
          lambda: lambdaSpoken,
          zeros: formatNumber(fit.zeros, 0),
          over: formatNumber(overCount, 0),
        })}
        describedBy={ids.barsDesc}
        shape="short"
      >
        {/* Per k: a bar from 0 to w_k cut at the edges, a 2px stub (px, not data units) under it, a hollow
            triangle at the edge when |w_k| is above the chart, or a ring on the zero line when w_k is exactly 0. */}
        {fit.w.map((w, i) => {
          const x = pct(toPercentX(i + 1, featureDomain));
          if (w === 0) return <circle key={`k${i}`} className="atlas-viz-zero" cx={x} cy={zeroY} r="4" />;
          const end = pct(toPercentY(clamp(w, coefDomain), coefDomain));
          return (
            <g key={`k${i}`}>
              <line className="atlas-viz-bar" x1={x} y1={zeroY} x2={x} y2={end} />
              <AtPoint x={x} y={zeroY}>
                <line className="atlas-viz-bar" x1="0" y1="0" x2="0" y2={w > 0 ? -STUB_PX : STUB_PX} />
              </AtPoint>
              {Math.abs(w) > coefMax && (
                <AtPoint x={x} y={w > 0 ? '0%' : '100%'}>
                  <polygon className="atlas-viz-ring" points={w > 0 ? TRIANGLE_TOP : TRIANGLE_BOTTOM} />
                </AtPoint>
              )}
            </g>
          );
        })}
      </PlotFrame>

      <ul className="atlas-viz-key">
        <li>
          <svg className="atlas-viz-swatch" aria-hidden="true" focusable="false">
            <AtPoint x="50%" y="50%">
              <polygon className="atlas-viz-ring" points={TRIANGLE_CENTRED} />
            </AtPoint>
          </svg>
          {formatString(strings.overNote, { max: formatNumber(coefMax, 0) })}
        </li>
      </ul>

      <div className="atlas-viz-status">
        <p>{zoneText[zone]}</p>
        {atBest && (
          <p className="atlas-viz-near">
            <span className="atlas-check" aria-hidden="true" />
            {strings.bestLambda}
          </p>
        )}
      </div>

      <p className="sr-only" id={ids.desc}>
        {description}
      </p>
      <p className="sr-only" id={ids.barsDesc}>
        {strings.barsDesc}
      </p>
      {/* Present and empty from the start; only its text changes, so screen readers speak it. */}
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </figure>
  );
}
