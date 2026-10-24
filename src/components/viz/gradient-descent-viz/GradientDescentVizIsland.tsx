// GradientDescentViz (docs/architecture/viz.md, sections 12.2.7, 12.2.8, 12.4.4, 12.4.5). One idea: every step goes
// against the gradient on the MSE "bowl"; a small η crawls, a middle η gets to the bottom fast, an η close to 2/L
// jumps back and forth across the valley, and an η above 2/L flies off the map.
// A slider picks one of five η levels; Step, Reset and Run/Stop walk the path. A contour map shows the path over
// (w̃, b̃), a chart shows the MSE by step on a log scale, and a status line names the outcome.
// Every string arrives through props (GradientDescentViz.astro). The five paths and nine level curves are computed
// once, here, with + − × ÷ and Math.sqrt only (gradient-descent.ts, detLog10), so the first render in the browser
// is the build HTML exactly.
import { useEffect, useId, useMemo, useState } from 'react';
import type { Row } from '../../../data/datasets/types';
import { formatString } from '../../../i18n/format';
import type { UiStrings } from '../../../i18n/ui';
import { formatNumber, lineParts } from '../../../lib/viz/format';
import {
  contour,
  gdOutcome,
  gdPath,
  hessian,
  inBox,
  minMaxOf,
  scaleRows,
  toOriginal,
  unitCircle,
  type GradientDescentConfig,
  type Params,
} from '../../../lib/viz/gradient-descent';
import { fitLeastSquares } from '../../../lib/viz/linear-fit';
import { formatMse, toPolyline } from '../../../lib/viz/poly-fit';
import { detLog10, pct, toPercentX, toPercentY } from '../../../lib/viz/scale';
import CrossMark from '../kit/CrossMark';
import PlotCurve from '../kit/PlotCurve';
import PlotFrame from '../kit/PlotFrame';
import { DotSwatch, Swatch } from '../kit/Swatch';
import { useHydrated } from '../kit/use-hydrated';
import { useSettled } from '../kit/use-settled';
import VizSlider from '../kit/VizSlider';

export interface GradientDescentVizIslandProps {
  rows: readonly Row[]; // APARTMENTS.rows, raw (m², million VND/month)
  config: GradientDescentConfig;
  labels: { etaHtml: string; etaText: string }; // KaTeX of "η" only; w̃, b̃, ŷ are Unicode in the strings
  strings: UiStrings<'vizGradientDescent'>;
}

/** One animation step every STEP_MS: 100 steps take about 6 s (section 12.2.7). */
export const STEP_MS = 60;
/** A no-break space toggled at the end of a repeated live message, so screen readers read it again. */
const AGAIN = ' ';

/** The label of a whole power of ten, as a string, never through a float: −1 → "0.1", 3 → "1000". */
function powerOfTenLabel(exp: number): string {
  return exp >= 0 ? `1${'0'.repeat(exp)}` : `0.${'0'.repeat(-exp - 1)}1`;
}

function reducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function GradientDescentVizIsland({ rows, config, labels, strings }: GradientDescentVizIslandProps) {
  // Unique per island and the same at build time and in the browser (components.md 2.9). Only for id/for/aria-*.
  const uid = useId();
  const hydrated = useHydrated();
  const [level, setLevel] = useState(config.slider.initial);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [live, setLive] = useState('');
  // The same sentence twice (Step at the end, Reset twice) would not change the region's text, so nothing would
  // be read; a trailing no-break space, on and off, makes it a change.
  const say = (text: string) => setLive((previous) => (previous === text ? text + AGAIN : text));

  const { wDomain, bDomain, logMseDomain, digits, maxSteps } = config;
  const stepDomain = [0, maxSteps] as const;

  // Five paths × up to 100 steps × 10 rows and nine ellipses × 49 points, once: well under 1 ms.
  const fixed = useMemo(() => {
    const s = minMaxOf(rows);
    const scaled = scaleRows(rows, s);
    const best = fitLeastSquares(scaled);
    const h = hessian(scaled);
    const circle = unitCircle(config.contourHalf);
    const contours = config.contourLevels.map((l) => toPolyline(contour(scaled, best, l, circle), wDomain, bDomain));
    const paths = config.levels.map((eta) => gdPath(scaled, eta, best.mse, config));
    return {
      s,
      best,
      contours,
      paths,
      logs: paths.map((path) => path.mse.map(detLog10)),
      outcomes: paths.map((path) => gdOutcome(path, h.L)),
      limit: formatNumber(2 / h.L, digits.limit),
    };
  }, [rows, config]);
  const { s, best, contours, paths, logs, outcomes, limit } = fixed;

  const path = paths[level];
  const last = path.points.length - 1;
  const eta = config.levels[level];
  const etaText = formatNumber(eta, digits.eta);
  const mseText = (value: number) => formatMse(value, digits);
  const stepText = (k: number) => formatNumber(k, 0);
  const maxText = stepText(maxSteps);
  const at = (p: Params) => ({ x: pct(toPercentX(p.w, wDomain)), y: pct(toPercentY(p.b, bDomain)) });

  /** The status line at step k of level i (section 12.2.8); '' in the middle of a path. */
  const statusAt = (i: number, k: number): string => {
    const outcome = outcomes[i];
    const end = paths[i].points.length - 1;
    if (k === 0) return formatString(strings.hint, { max: maxText });
    if (outcome.kind === 'reached' && k >= outcome.step) {
      return formatString(strings.reached, { step: stepText(outcome.step) });
    }
    if (outcome.kind === 'diverged' && k === end) {
      return formatString(strings.diverged, { limit, step: stepText(outcome.step) });
    }
    if (outcome.kind === 'unfinished' && k === end) {
      const note = outcome.zigzag ? formatString(strings.zigzagNote, { limit }) : strings.slowNote;
      return `${formatString(strings.notYet, { max: maxText, mse: mseText(paths[i].mse[k]) })} ${note}`;
    }
    return '';
  };

  // The animation: one step per STEP_MS, on requestAnimationFrame (stops in a hidden tab, never catches up in a
  // burst). The phase is kept, so 100 steps take 100 · STEP_MS whatever the frame rate.
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      if (now - previous >= STEP_MS) {
        previous = now - ((now - previous) % STEP_MS);
        setStep((k) => Math.min(k + 1, last));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, last]);

  // The end of a run: the button reads Run again and the status sentence is spoken.
  useEffect(() => {
    if (running && step >= last) {
      setRunning(false);
      say(statusAt(level, last));
    }
  }, [running, step, last]);

  // A new η speaks once the slider has stayed put SETTLE_MS (one reading per drag). Its timer runs on when a
  // button is pressed meanwhile: then the button's own sentence wins, and "back at the start" would be wrong.
  const settled = useSettled(level);
  useEffect(() => {
    if (settled === undefined || step !== 0 || running) return;
    say(formatString(strings.announceEta, { eta: formatNumber(config.levels[settled], digits.eta) }));
  }, [settled]);

  const chooseLevel = (next: number) => {
    setRunning(false);
    setStep(0);
    setLevel(next);
  };

  const stepOnce = () => {
    setRunning(false);
    if (step >= last) {
      say(strings.atEnd);
      return;
    }
    const next = step + 1;
    setStep(next);
    say(formatString(strings.announceStep, { step: stepText(next), mse: mseText(path.mse[next]) }));
  };

  const reset = () => {
    setRunning(false);
    setStep(0);
    say(strings.resetDone);
  };

  const runOrStop = () => {
    if (running) {
      setRunning(false);
      say(formatString(strings.stopped, { step: stepText(step), mse: mseText(path.mse[step]) }));
      return;
    }
    if (reducedMotion()) {
      // No animation: straight to the end, then the outcome.
      setStep(last);
      say(statusAt(level, last));
      return;
    }
    if (step >= last) setStep(0);
    setRunning(true);
    say(strings.running);
  };

  const k = Math.min(step, last);
  const current = path.points[k];
  const shown = path.points.slice(0, k + 1);
  const trail = toPolyline(
    shown.map((p) => ({ x: p.w, y: p.b })),
    wDomain,
    bDomain,
  );
  const mseCurve = toPolyline(
    logs[level].slice(0, k + 1).map((y, i) => ({ x: i, y })),
    stepDomain,
    logMseDomain,
  );
  const status = statusAt(level, k);
  const sizers = [
    ...new Set([statusAt(level, 0), ...paths.map((p, i) => statusAt(i, p.points.length - 1))]),
  ];
  const line = toOriginal(current, s);
  const parts = lineParts(line, { w: digits.w, b: digits.b });
  const bestText = mseText(best.mse);
  const startMark = at(config.start);
  const bottom = at(best);
  const ids = { eta: `${uid}-eta`, mapDesc: `${uid}-map-desc`, chartDesc: `${uid}-chart-desc` };
  const referenceY = pct(toPercentY(detLog10(best.mse), logMseDomain));

  return (
    <figure className="atlas-viz-figure">
      <figcaption className="atlas-viz-caption">{formatString(strings.caption, { limit })}</figcaption>

      <PlotFrame
        xDomain={wDomain}
        yDomain={bDomain}
        xTicks={config.wTicks}
        yTicks={config.bTicks}
        xTitle={strings.wAxis}
        yTitle={strings.bAxis}
        label={formatString(strings.mapLabel, { eta: etaText, step: stepText(k) })}
        describedBy={ids.mapDesc}
        shape="equal"
      >
        {/* Bottom to top: level curves, the path so far, a dot per step, the bottom, the start, the current point. */}
        {contours.map((points, i) => (
          <PlotCurve key={`l${i}`} points={points} className="atlas-viz-level" />
        ))}
        <PlotCurve points={trail} className="atlas-viz-path" />
        {/* Steps 1..k−1 are always in the box: a path ends at its first point outside it (exitStep). */}
        {shown.slice(1, k).map((p, i) => (
          <circle key={`s${i}`} className="atlas-viz-step" cx={at(p).x} cy={at(p).y} r="3" />
        ))}
        <CrossMark x={bottom.x} y={bottom.y} halo />
        <circle className="atlas-viz-ring" cx={startMark.x} cy={startMark.y} r="6" />
        {/* Only the current point may be outside: the last point of a diverging path is not drawn. */}
        {k >= 1 && inBox(current, config) && (
          <circle className="atlas-viz-point" cx={at(current).x} cy={at(current).y} r="6" />
        )}
      </PlotFrame>

      <ul className="atlas-viz-key">
        <li>
          <Swatch className="atlas-viz-level" onPlot />
          {strings.levels}
        </li>
        <li>
          <Swatch className="atlas-viz-path" dot="step" />
          {strings.path}
        </li>
        <li>
          <DotSwatch className="atlas-viz-ring" />
          {strings.start}
        </li>
        <li>
          <DotSwatch className="atlas-viz-point" />
          {strings.current}
        </li>
        <li>
          <svg className="atlas-viz-swatch" aria-hidden="true" focusable="false">
            <CrossMark x="50%" y="50%" />
          </svg>
          {strings.best}
        </li>
      </ul>

      <div className="atlas-viz-controls" role="group" aria-label={strings.controls}>
        <VizSlider
          id={ids.eta}
          labelHtml={labels.etaHtml}
          ariaLabel={labels.etaText}
          spec={config.slider}
          value={level}
          display={etaText}
          valueText={formatString(strings.etaValueText, { value: etaText })}
          disabled={!hydrated}
          onChange={chooseLevel}
        />
        {/* Never disabled after hydration: a button with nothing to do says so in the live region (12.2.7). */}
        <div className="atlas-viz-choice">
          <button type="button" className="atlas-viz-toggle" disabled={!hydrated} onClick={stepOnce}>
            {strings.step}
          </button>
          <button type="button" className="atlas-viz-toggle" disabled={!hydrated} onClick={reset}>
            {strings.reset}
          </button>
          <button type="button" className="atlas-viz-toggle" disabled={!hydrated} onClick={runOrStop}>
            {running ? strings.stop : strings.run}
          </button>
        </div>
      </div>

      <div className="atlas-viz-readouts">
        <div className="atlas-viz-readout">
          <span className="atlas-viz-swatch" aria-hidden="true" />
          <span className="atlas-viz-readout-text">{strings.stepsDone}</span>
          <span className="atlas-viz-num">
            {stepText(k)} / {maxText}
          </span>
        </div>
        <div className="atlas-viz-readout">
          <Swatch className="atlas-viz-series" />
          <span className="atlas-viz-readout-text">{strings.mse}</span>
          <span className="atlas-viz-num">{mseText(path.mse[k])}</span>
        </div>
        <div className="atlas-viz-readout">
          <DotSwatch className="atlas-viz-point" />
          <span className="atlas-viz-readout-text">{strings.params}</span>
          <span className="atlas-viz-num">
            ({formatNumber(current.w, digits.params)}, {formatNumber(current.b, digits.params)})
          </span>
        </div>
        <div className="atlas-viz-readout">
          <span className="atlas-viz-swatch" aria-hidden="true" />
          <span className="atlas-viz-readout-text">{strings.original}</span>
          <span className="atlas-viz-num">{formatString(strings.lineFormula, parts)}</span>
        </div>
      </div>

      <PlotFrame
        xDomain={stepDomain}
        yDomain={logMseDomain}
        xTicks={config.stepTicks}
        yTicks={config.logMseTicks}
        yTickLabels={config.logMseTicks.map(powerOfTenLabel)}
        xTitle={strings.stepAxis}
        yTitle={strings.mseAxis}
        label={formatString(strings.chartLabel, { step: stepText(k), mse: mseText(path.mse[k]) })}
        describedBy={ids.chartDesc}
        shape="short"
      >
        <line className="atlas-viz-reference" x1="0%" y1={referenceY} x2="100%" y2={referenceY} />
        <PlotCurve points={mseCurve} className="atlas-viz-series" />
        <circle
          className="atlas-viz-point"
          cx={pct(toPercentX(k, stepDomain))}
          cy={pct(toPercentY(logs[level][k], logMseDomain))}
          r="4"
        />
      </PlotFrame>

      <ul className="atlas-viz-key">
        <li>
          <Swatch className="atlas-viz-reference" />
          {formatString(strings.bestLine, { best: bestText })}
        </li>
      </ul>

      {/* The sentence of this step, over every sentence any level can end with (hidden, aria-hidden): the line is
          as tall as the longest from the start, so nothing below it moves when a sentence appears mid-run. */}
      <div className="atlas-viz-status atlas-viz-status-stack">
        <p>{status}</p>
        {sizers.map((text, i) => (
          <p key={i} aria-hidden="true" data-off>
            {text}
          </p>
        ))}
      </div>

      <p className="sr-only" id={ids.mapDesc}>
        {formatString(strings.mapDesc, {
          w: formatNumber(best.w, digits.params),
          b: formatNumber(best.b, digits.params),
          best: bestText,
          start: mseText(paths[0].mse[0]),
        })}
      </p>
      <p className="sr-only" id={ids.chartDesc}>
        {formatString(strings.chartDesc, { best: bestText })}
      </p>
      {/* Present and empty from the start; only its text changes, so screen readers speak it. */}
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </figure>
  );
}
