// PolyFitViz (docs/architecture/viz.md, sections 9.4.5–9.4.6). One idea: as the degree rises, training MSE
// always falls, while test MSE falls and then rises again, so a middle degree predicts new data best.
// A slider sets the degree d of the polynomial fitted to the training points; the main plot redraws the curve,
// the error chart below moves its cursor along the two MSE curves, and a status line names the zone.
// Every string and number arrives through props (PolyFitViz.astro). The fits use + − × ÷ and Math.sqrt only
// (poly-fit.ts), so the first render in the browser is the build HTML exactly: no window, no Intl, no Math.sin.
import { useEffect, useId, useMemo, useState } from 'react';
import type { Row } from '../../../data/datasets/types';
import { formatString } from '../../../i18n/format';
import type { UiStrings } from '../../../i18n/ui';
import { formatNumber } from '../../../lib/viz/format';
import {
  bestDegree,
  evalPolynomial,
  fitAt,
  fitDegrees,
  fitZone,
  formatMse,
  sampleCurve,
  toPolyline,
  type FitZone,
  type PolyFitConfig,
} from '../../../lib/viz/poly-fit';
import { pct, toPercentX, toPercentY } from '../../../lib/viz/scale';
import AtPoint from '../kit/AtPoint';
import PlotCurve from '../kit/PlotCurve';
import PlotFrame from '../kit/PlotFrame';
import { DotSwatch, Swatch } from '../kit/Swatch';
import type { AxisText } from '../kit/types';
import { useHydrated } from '../kit/use-hydrated';
import { useSettled } from '../kit/use-settled';
import VizSlider from '../kit/VizSlider';

export interface PolyFitVizIslandProps {
  train: readonly Row[];
  test: readonly Row[];
  config: PolyFitConfig;
  truthPoints: string; // toPolyline of the true curve, built by the wrapper (Math.sin at build time only)
  axes: { x: AxisText; y: AxisText }; // 'x', 'y': title = name (no unit)
  itemLabels: { train: string; test: string }; // SINE_TRAIN / SINE_TEST .itemLabel[locale]
  description: string; // sr-only description of the main plot
  labels: { degreeHtml: string; degreeText: string }; // KaTeX HTML and accessible name of degreeLabel
  strings: UiStrings<'vizPolyFit'>;
}

/** An upward hollow triangle, apex on the anchor, 12px wide and 10px tall: a test MSE above the chart. */
const TRIANGLE_BELOW = '0,1 6,11 -6,11';
/** The same triangle centred on the anchor, for the key. */
const TRIANGLE_CENTRED = '0,-5 6,5 -6,5';

export default function PolyFitVizIsland({
  train,
  test,
  config,
  truthPoints,
  axes,
  itemLabels,
  description,
  labels,
  strings,
}: PolyFitVizIslandProps) {
  // Unique per island and the same at build time and in the browser (components.md 2.9). Only for id/for/aria-*.
  const uid = useId();
  const hydrated = useHydrated();
  const [degree, setDegree] = useState(config.degree.initial);
  const [showTruth, setShowTruth] = useState(false);
  const [live, setLive] = useState('');

  const { xDomain, yDomain, degreeDomain, mseDomain, digits } = config;
  const mseText = (value: number) => formatMse(value, digits);
  const degreeText = (value: number) => formatNumber(value, 0);

  // Fifteen QR fits of at most 16 × 16, once (under 1 ms), and what never changes with the degree.
  const fixed = useMemo(() => {
    const fits = fitDegrees(train, test, config.degree, xDomain);
    const best = bestDegree(fits);
    const series = (pick: 'mseTrain' | 'mseTest') =>
      toPolyline(
        fits.map((fit) => ({ x: fit.degree, y: fit[pick] })),
        degreeDomain,
        mseDomain,
      );
    return { fits, best, trainSeries: series('mseTrain'), testSeries: series('mseTest') };
  }, [train, test, config]);
  const { fits, best } = fixed;
  const fit = fitAt(fits, degree);
  const zone = fitZone(fits, degree);
  const atBest = degree === best;

  // 201 Horner evaluations per degree: the fitted curve over the whole x domain.
  const curve = useMemo(
    () =>
      toPolyline(
        sampleCurve((x) => evalPolynomial(fit.coef, x, xDomain), xDomain, config.samples),
        xDomain,
        yDomain,
      ),
    [fit, config],
  );

  const zoneText: Record<FitZone, string> = {
    underfit: strings.underfit,
    good: strings.goodFit,
    overfit: strings.overfit,
  };
  const trainText = mseText(fit.mseTrain);
  const testText = mseText(fit.mseTest);

  // The live region speaks once the slider has stayed put SETTLE_MS (one reading per drag). Runs only when a
  // new degree settles; the slider has not moved since, so the texts are those of that degree.
  const settled = useSettled(degree);
  useEffect(() => {
    if (settled === undefined) return;
    const said = atBest ? `${zoneText[zone]} ${strings.bestDegree}` : zoneText[zone];
    setLive(formatString(strings.announce, { degree: degreeText(degree), train: trainText, test: testText, zone: said }));
  }, [settled]);

  const ids = { degree: `${uid}-degree`, desc: `${uid}-desc`, errorDesc: `${uid}-error-desc` };
  const first = fits[0];
  const last = fits[fits.length - 1];
  const bestFit = fitAt(fits, best);
  const range = { min: degreeText(first.degree), max: degreeText(last.degree) };
  const top = mseDomain[1];
  const offChart = fits.some((item) => item.mseTest > top);
  const cursorX = pct(toPercentX(degree, degreeDomain));

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
        label={formatString(strings.plotLabel, { train: train.length, test: test.length, degree: degreeText(degree) })}
        describedBy={ids.desc}
      >
        {/* Bottom to top: true curve, fitted curve, test points, training points. The curves are clipped to the
            plot box; the points always lie inside it. */}
        <PlotCurve points={truthPoints} className="atlas-viz-guide" off={!showTruth} />
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
        <li data-off={!showTruth || undefined}>
          <Swatch className="atlas-viz-guide" />
          {strings.truth}
        </li>
      </ul>

      <div className="atlas-viz-controls" role="group" aria-label={strings.controls}>
        <VizSlider
          id={ids.degree}
          labelHtml={labels.degreeHtml}
          ariaLabel={labels.degreeText}
          spec={config.degree}
          value={degree}
          display={degreeText(degree)}
          valueText={formatString(strings.degreeValueText, { value: degreeText(degree) })}
          disabled={!hydrated}
          onChange={setDegree}
        />
        <button
          type="button"
          className="atlas-viz-toggle"
          aria-pressed={showTruth}
          disabled={!hydrated}
          onClick={() => setShowTruth(!showTruth)}
        >
          <span className="atlas-viz-toggle-box" aria-hidden="true">
            <span className="atlas-check" />
          </span>
          <span>{strings.showTruth}</span>
        </button>
      </div>

      {/* The swatches here are also the key of the error chart below. */}
      <div className="atlas-viz-readouts">
        <div className="atlas-viz-readout">
          <Swatch className="atlas-viz-series" dot="point" />
          <span className="atlas-viz-readout-text">{strings.trainMse}</span>
          <span className="atlas-viz-num">{trainText}</span>
        </div>
        <div className="atlas-viz-readout">
          <Swatch className="atlas-viz-series atlas-viz-series-alt" dot="ring" />
          <span className="atlas-viz-readout-text">{strings.testMse}</span>
          <span className="atlas-viz-num">{testText}</span>
        </div>
      </div>

      <PlotFrame
        xDomain={degreeDomain}
        yDomain={mseDomain}
        xTicks={config.degreeTicks}
        yTicks={config.mseTicks}
        xTitle={strings.degreeAxis}
        yTitle={strings.mseAxis}
        label={formatString(strings.errorLabel, { ...range, degree: degreeText(degree) })}
        describedBy={ids.errorDesc}
        shape="short"
      >
        {/* Bottom to top: cursor, training MSE, test MSE, their points. A test MSE above the chart is a hollow
            triangle at the top edge; its exact value is in the readout. */}
        <line className="atlas-viz-cursor" x1={cursorX} y1="0%" x2={cursorX} y2="100%" />
        <PlotCurve points={fixed.trainSeries} className="atlas-viz-series" />
        <PlotCurve points={fixed.testSeries} className="atlas-viz-series atlas-viz-series-alt" />
        {fits.map((item) => (
          <circle
            key={`r${item.degree}`}
            className="atlas-viz-point"
            cx={pct(toPercentX(item.degree, degreeDomain))}
            cy={pct(toPercentY(item.mseTrain, mseDomain))}
            r="4"
          />
        ))}
        {fits.map((item) => {
          const cx = pct(toPercentX(item.degree, degreeDomain));
          return item.mseTest > top ? (
            <AtPoint key={`s${item.degree}`} x={cx} y="0%">
              <polygon className="atlas-viz-ring" points={TRIANGLE_BELOW} />
            </AtPoint>
          ) : (
            <circle
              key={`s${item.degree}`}
              className="atlas-viz-ring"
              cx={cx}
              cy={pct(toPercentY(item.mseTest, mseDomain))}
              r="4"
            />
          );
        })}
      </PlotFrame>

      {offChart && (
        <ul className="atlas-viz-key">
          <li>
            <svg className="atlas-viz-swatch" aria-hidden="true" focusable="false">
              <AtPoint x="50%" y="50%">
                <polygon className="atlas-viz-ring" points={TRIANGLE_CENTRED} />
              </AtPoint>
            </svg>
            {formatString(strings.overNote, { max: formatNumber(top, 1) })}
          </li>
        </ul>
      )}

      <div className="atlas-viz-status">
        <p>{zoneText[zone]}</p>
        {atBest && (
          <p className="atlas-viz-near">
            <span className="atlas-check" aria-hidden="true" />
            {strings.bestDegree}
          </p>
        )}
      </div>

      <p className="sr-only" id={ids.desc}>
        {description}
      </p>
      <p className="sr-only" id={ids.errorDesc}>
        {formatString(strings.errorDesc, {
          ...range,
          trainFirst: mseText(first.mseTrain),
          trainLast: mseText(last.mseTrain),
          best: degreeText(best),
          testBest: mseText(bestFit.mseTest),
          testLast: mseText(last.mseTest),
        })}
      </p>
      {/* Present and empty from the start; only its text changes, so screen readers speak it. */}
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </figure>
  );
}
