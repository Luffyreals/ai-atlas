// ThresholdViz (docs/architecture/viz/threshold.md). One idea: moving the decision threshold trades precision for
// recall, and accuracy can rise while the model misses more ill patients.
// A slider sets t; the 20 patients sit on a probability axis (filled dots: ill, hollow rings: not ill), a line
// marks t, and everything on or to the right of it is predicted ill. Below: the confusion matrix (rows: true
// label, columns: prediction, positive first as in the lesson) and accuracy, precision, recall, F1 with their
// fractions. Every string arrives through props (ThresholdViz.astro); the math is threshold.ts (counts only), so
// the first render in the browser is the build HTML exactly.
import { useEffect, useId, useMemo, useState } from 'react';
import { formatString } from '../../../i18n/format';
import type { UiStrings } from '../../../i18n/ui';
import { formatNumber } from '../../../lib/viz/format';
import { pct, toPercentX, toPercentY, type Domain } from '../../../lib/viz/scale';
import {
  CELL_SYMBOLS,
  confusionCounts,
  formatMetric,
  laneRows,
  metricFractions,
  metricsOf,
  type ClassificationMetrics,
  type ThresholdConfig,
} from '../../../lib/viz/threshold';
import PlotFrame from '../kit/PlotFrame';
import { DotSwatch, Swatch } from '../kit/Swatch';
import { useHydrated } from '../kit/use-hydrated';
import { useSettled } from '../kit/use-settled';
import VizSlider from '../kit/VizSlider';

export interface ThresholdVizIslandProps {
  y: readonly (0 | 1)[]; // PATIENTS.y
  p: readonly number[]; // PATIENTS.p
  config: ThresholdConfig;
  text: { positive: string; negative: string; axis: string; description: string }; // PATIENTS.*[locale]
  labels: { tHtml: string; tText: string }; // KaTeX HTML and accessible name of thresholdLabel
  strings: UiStrings<'vizThreshold'>;
}

const X_DOMAIN: Domain = [0, 1];
const METRICS: readonly (keyof ClassificationMetrics)[] = ['accuracy', 'precision', 'recall', 'f1'];
/** Radius in px of a patient's dot: two dots of one row are at least minGap (0.05, about 14px at 375px) apart. */
const R = 5;

export default function ThresholdVizIsland({ y, p, config, text, labels, strings }: ThresholdVizIslandProps) {
  // Unique per island and the same at build time and in the browser (components.md 2.9). Only for id/for/aria-*.
  const uid = useId();
  const hydrated = useHydrated();
  const [t, setT] = useState<number>(config.slider.initial);
  const [live, setLive] = useState('');

  const { yDomain, lanes, digits } = config;
  // Where each dot sits does not depend on t: once.
  const points = useMemo(() => {
    const rows = laneRows(y, p, config.minGap);
    return y.map((label, i) => ({
      label,
      cx: pct(toPercentX(p[i] ?? 0, X_DOMAIN)),
      cy: pct(toPercentY((label === 1 ? lanes.positive : lanes.negative) - (rows[i] ?? 0) * lanes.row, yDomain)),
    }));
  }, [y, p, config]);

  const counts = confusionCounts(y, p, t);
  const metrics = metricsOf(counts);
  const fractions = metricFractions(counts);
  const positives = counts.tp + counts.fn;
  const negatives = counts.fp + counts.tn;
  const tText = formatNumber(t, digits.t);
  const metric = (value: number | null) => formatMetric(value, digits.metric);

  // The live region speaks once the slider has stayed put SETTLE_MS: one reading per drag, nothing on load.
  const settled = useSettled(t);
  useEffect(() => {
    if (settled === undefined) return;
    const c = confusionCounts(y, p, settled);
    const m = metricsOf(c);
    const spoken = (value: number | null) => (value === null ? strings.undefinedValue : metric(value));
    setLive(
      formatString(strings.announce, {
        t: formatNumber(settled, digits.t),
        ...c,
        accuracy: spoken(m.accuracy),
        precision: spoken(m.precision),
        recall: spoken(m.recall),
        f1: spoken(m.f1),
      }),
    );
  }, [settled]);

  const ids = { t: `${uid}-t`, desc: `${uid}-desc` };
  const tx = pct(toPercentX(t, X_DOMAIN));
  const cell = (key: keyof typeof CELL_SYMBOLS) => `${CELL_SYMBOLS[key]} = ${counts[key]}`;

  return (
    <figure className="atlas-viz-figure">
      <figcaption className="atlas-viz-caption">{strings.caption}</figcaption>

      <PlotFrame
        xDomain={X_DOMAIN}
        yDomain={yDomain}
        xTicks={config.xTicks}
        yTicks={[]}
        xTitle={text.axis}
        yTitle={strings.rule}
        label={formatString(strings.plotLabel, {
          total: y.length,
          pos: positives,
          neg: negatives,
          t: tText,
          predicted: counts.tp + counts.fp,
        })}
        describedBy={ids.desc}
        shape="short"
      >
        {/* The threshold line under the dots, so a dot right on it stays whole. */}
        <line className="atlas-viz-cursor" x1={tx} y1="0%" x2={tx} y2="100%" />
        {points.map(({ label, cx, cy }, i) => (
          <circle key={i} className={label === 1 ? 'atlas-viz-point' : 'atlas-viz-ring'} cx={cx} cy={cy} r={R} />
        ))}
      </PlotFrame>

      <ul className="atlas-viz-key">
        <li>
          <DotSwatch className="atlas-viz-point" r={R} />
          {text.positive}
        </li>
        <li>
          <DotSwatch className="atlas-viz-ring" r={R} />
          {text.negative}
        </li>
        <li>
          <Swatch className="atlas-viz-cursor" upright />
          {strings.threshold}
        </li>
      </ul>

      <div className="atlas-viz-controls" role="group" aria-label={strings.controls}>
        <VizSlider
          id={ids.t}
          labelHtml={labels.tHtml}
          ariaLabel={labels.tText}
          spec={config.slider}
          value={t}
          display={tText}
          valueText={formatString(strings.thresholdValueText, { value: tText })}
          disabled={!hydrated}
          onChange={setT}
        />
      </div>

      {/* Rows: true label, columns: prediction, the positive class first, as the lesson's table. */}
      <table className="atlas-viz-table atlas-viz-matrix">
        <caption className="sr-only">{formatString(strings.matrixLabel, { t: tText })}</caption>
        <thead>
          <tr>
            <th scope="col">{strings.trueLabel}</th>
            <th scope="col">{strings.predPositive}</th>
            <th scope="col">{strings.predNegative}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{formatString(strings.actualPositive, { n: positives })}</th>
            <td>{cell('tp')}</td>
            <td>{cell('fn')}</td>
          </tr>
          <tr>
            <th scope="row">{formatString(strings.actualNegative, { n: negatives })}</th>
            <td>{cell('fp')}</td>
            <td>{cell('tn')}</td>
          </tr>
        </tbody>
      </table>

      <div className="atlas-viz-readouts">
        {METRICS.map((key) => (
          <div key={key} className="atlas-viz-readout">
            {/* No mark on the plot stands for a metric: an empty cell keeps the rows on the readouts grid. */}
            <span className="atlas-viz-swatch" aria-hidden="true" />
            <span className="atlas-viz-readout-text">
              <span>{strings[key]}</span>
              <span className="atlas-viz-num">{fractions[key]}</span>
            </span>
            <span className="atlas-viz-num">{metric(metrics[key])}</span>
          </div>
        ))}
      </div>

      <div className="atlas-viz-status">
        <p data-off={metrics.precision === null ? undefined : ''}>{strings.noPositive}</p>
      </div>

      <p className="sr-only" id={ids.desc}>
        {text.description}
      </p>
      {/* Present and empty from the start; only its text changes, so screen readers speak it. */}
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </figure>
  );
}
