// LinearFitViz (docs/architecture/viz.md, sections 4.5–4.7). One idea: the best line is the line with the
// smallest MSE. Two sliders set w and b of ŷ = wx + b; the plot redraws the line, one vertical residual per
// point and the MSE at once. "Show the best line" lays the least-squares line and its MSE over it.
// Every string, symbol and number arrives through props (LinearFitViz.astro), so the first render in the
// browser is the build HTML exactly: no window, no Intl, numbers through formatNumber, positions through pct().
import { useEffect, useId, useRef, useState } from 'react';
import type { Row } from '../../../data/datasets/types';
import { formatString } from '../../../i18n/format';
import type { UiStrings } from '../../../i18n/ui';
import { formatNumber, lineParts } from '../../../lib/viz/format';
import {
  isNearBest,
  mse,
  predict,
  type BestFit,
  type Line,
  type LinearFitConfig,
  type Point,
} from '../../../lib/viz/linear-fit';
import { clamp, clipLineToBox, pct, toPercentX, toPercentY } from '../../../lib/viz/scale';
import PlotFrame from '../kit/PlotFrame';
import type { AxisText } from '../kit/types';
import { useHydrated } from '../kit/use-hydrated';
import { useSettled } from '../kit/use-settled';
import VizSlider from '../kit/VizSlider';

export interface LinearFitVizIslandProps {
  rows: readonly Row[];
  config: LinearFitConfig;
  best: BestFit; // fitLeastSquares(rows), computed by the wrapper
  mean: Point; // meanPoint(rows): the best line always passes through it (decision 24)
  axes: { x: AxisText; y: AxisText };
  itemLabel: string;
  description: string;
  labels: { wHtml: string; wText: string; bHtml: string; bText: string };
  symbols: { yHat: string; x: string }; // KaTeX HTML, build time
  strings: UiStrings<'vizLinearFit'>;
}

// dangerouslySetInnerHTML below only ever gets KaTeX HTML made by renderInlineMarkup() in LinearFitViz.astro,
// at build time, from strings in this repo. Never reader input.
const html = (markup: string) => ({ __html: markup });

/** A line mark clipped to the plot box; nothing when the line misses the box. */
function LineMark({ line, config, className, off }: { line: Line; config: LinearFitConfig; className: string; off?: boolean }) {
  const segment = clipLineToBox(line, config.xDomain, config.yDomain);
  if (!segment) return null;
  const { xDomain, yDomain } = config;
  return (
    <line
      className={className}
      x1={pct(toPercentX(segment.x1, xDomain))}
      y1={pct(toPercentY(segment.y1, yDomain))}
      x2={pct(toPercentX(segment.x2, xDomain))}
      y2={pct(toPercentY(segment.y2, yDomain))}
      data-off={off || undefined}
    />
  );
}

/** "ŷ = 0.1700x + 2.00", with ŷ and x in KaTeX. */
function Equation({ line, config, symbols }: { line: Line; config: LinearFitConfig; symbols: LinearFitVizIslandProps['symbols'] }) {
  const parts = lineParts(line, config.digits);
  return (
    <span className="atlas-viz-num">
      <span dangerouslySetInnerHTML={html(symbols.yHat)} /> = {parts.w}
      <span dangerouslySetInnerHTML={html(symbols.x)} /> {parts.sign} {parts.b}
    </span>
  );
}

/**
 * A 12px × at a point given in percent: the nested <svg> moves the origin there, so the arms stay in px.
 * The halo (plot background, wider) keeps it readable where a line runs under it.
 */
function CrossMark({ x, y, halo }: { x: string; y: string; halo?: boolean }) {
  const arms = (className: string) => (
    <>
      <line className={className} x1="-6" y1="-6" x2="6" y2="6" />
      <line className={className} x1="-6" y1="6" x2="6" y2="-6" />
    </>
  );
  return (
    <svg x={x} y={y} width="1" height="1" overflow="visible">
      {halo && arms('atlas-viz-halo')}
      {arms('atlas-viz-marker')}
    </svg>
  );
}

/** A short line in a 24px swatch, drawn with the same class as the mark on the plot. */
function Swatch({ className, upright }: { className: string; upright?: boolean }) {
  return (
    <svg className="atlas-viz-swatch" aria-hidden="true" focusable="false">
      {upright ? (
        <line className={className} x1="50%" y1="15%" x2="50%" y2="85%" />
      ) : (
        <line className={className} x1="0%" y1="50%" x2="100%" y2="50%" />
      )}
    </svg>
  );
}

export default function LinearFitVizIsland({
  rows,
  config,
  best,
  mean,
  axes,
  itemLabel,
  description,
  labels,
  symbols,
  strings,
}: LinearFitVizIslandProps) {
  // Unique per island and the same at build time and in the browser (components.md 2.9). Only for id/for/aria-*.
  const uid = useId();
  const hydrated = useHydrated();
  const [w, setW] = useState(config.w.initial);
  const [b, setB] = useState(config.b.initial);
  const [showBest, setShowBest] = useState(false);
  const [live, setLive] = useState('');

  const { digits, xDomain, yDomain } = config;
  const yourMse = mse(rows, { w, b });
  const near = isNearBest(yourMse, best.mse);
  const yourMseText = formatNumber(yourMse, digits.mse);
  const bestMseText = formatNumber(best.mse, digits.mse);

  // The live region speaks the MSE once the sliders have stayed put SETTLE_MS (one reading per drag).
  const position = `${w} ${b}`;
  const settled = useSettled(position);
  // The last position spoken, or cancelled by "Show the best line": its pending reading must not follow.
  const spoken = useRef<string | undefined>(undefined);
  // Runs only when a new position settles. The sliders have not moved since, so yourMseText and near are
  // the numbers of that position.
  useEffect(() => {
    if (settled === undefined || settled === spoken.current) return;
    spoken.current = settled;
    const text = formatString(strings.announce, { mse: yourMseText });
    setLive(near ? `${text} ${strings.nearBest}` : text);
  }, [settled]);

  const toggleBest = () => {
    const next = !showBest;
    setShowBest(next);
    if (!next) {
      // Nothing to say (aria-pressed already says "not pressed"). Emptied, so the next press changes the
      // text again and is spoken even when it is the same reading.
      setLive('');
      return;
    }
    spoken.current = position;
    setLive(
      formatString(strings.announceBest, {
        w: formatNumber(best.w, digits.w),
        b: formatNumber(best.b, digits.b),
        mse: bestMseText,
      }),
    );
  };

  const ids = { w: `${uid}-w`, b: `${uid}-b`, desc: `${uid}-desc` };
  const valueText = (value: string, template: string) =>
    formatString(template, { value, xUnit: axes.x.unit, yUnit: axes.y.unit });
  const wText = formatNumber(w, digits.w);
  const bText = formatNumber(b, digits.b);
  const cx = rows.map(([x]) => pct(toPercentX(x, xDomain)));
  const meanText = { x: formatNumber(mean.x, digits.meanX), y: formatNumber(mean.y, digits.meanY) };

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
        label={formatString(strings.plotLabel, { count: rows.length, x: axes.x.name, y: axes.y.name })}
        describedBy={ids.desc}
      >
        {/* Bottom to top: residuals, best line, your line, mean point, points. One residual per point,
            even at length 0. */}
        {rows.map(([x, y], i) => (
          <line
            key={`e${i}`}
            className="atlas-viz-error"
            x1={cx[i]}
            y1={pct(toPercentY(clamp(y, yDomain), yDomain))}
            x2={cx[i]}
            y2={pct(toPercentY(clamp(predict({ w, b }, x), yDomain), yDomain))}
          />
        ))}
        <LineMark line={best} config={config} className="atlas-viz-reference" off={!showBest} />
        <LineMark line={{ w, b }} config={config} className="atlas-viz-primary" />
        <CrossMark x={pct(toPercentX(mean.x, xDomain))} y={pct(toPercentY(mean.y, yDomain))} halo />
        {rows.map(([, y], i) => (
          <circle key={`p${i}`} className="atlas-viz-point" cx={cx[i]} cy={pct(toPercentY(y, yDomain))} r="6" />
        ))}
      </PlotFrame>

      <ul className="atlas-viz-key">
        <li>
          <svg className="atlas-viz-swatch" aria-hidden="true" focusable="false">
            <circle className="atlas-viz-point" cx="50%" cy="50%" r="6" />
          </svg>
          {itemLabel}
        </li>
        <li>
          <svg className="atlas-viz-swatch" aria-hidden="true" focusable="false">
            <CrossMark x="50%" y="50%" />
          </svg>
          {formatString(strings.meanPoint, meanText)}
        </li>
        <li>
          <Swatch className="atlas-viz-error" upright />
          {strings.residual}
        </li>
      </ul>

      <div className="atlas-viz-readouts">
        <div className="atlas-viz-readout">
          <Swatch className="atlas-viz-primary" />
          <span className="atlas-viz-readout-text">
            <span>{strings.yourLine}</span>
            <Equation line={{ w, b }} config={config} symbols={symbols} />
          </span>
          <span className="atlas-viz-num">{formatString(strings.mseValue, { value: yourMseText })}</span>
        </div>
        <div className="atlas-viz-readout" data-off={!showBest || undefined}>
          <Swatch className="atlas-viz-reference" />
          <span className="atlas-viz-readout-text">
            <span>{strings.bestLine}</span>
            <Equation line={best} config={config} symbols={symbols} />
          </span>
          <span className="atlas-viz-num">{formatString(strings.mseValue, { value: bestMseText })}</span>
        </div>
      </div>

      <div className="atlas-viz-controls" role="group" aria-label={strings.controls}>
        <VizSlider
          id={ids.w}
          labelHtml={labels.wHtml}
          ariaLabel={labels.wText}
          spec={config.w}
          value={w}
          display={wText}
          valueText={valueText(wText, strings.wValueText)}
          disabled={!hydrated}
          onChange={setW}
        />
        <VizSlider
          id={ids.b}
          labelHtml={labels.bHtml}
          ariaLabel={labels.bText}
          spec={config.b}
          value={b}
          display={bText}
          valueText={valueText(bText, strings.bValueText)}
          disabled={!hydrated}
          onChange={setB}
        />
      </div>

      <button
        type="button"
        className="atlas-viz-toggle"
        aria-pressed={showBest}
        disabled={!hydrated}
        onClick={toggleBest}
      >
        <span className="atlas-viz-toggle-box" aria-hidden="true">
          <span className="atlas-check" />
        </span>
        <span>{strings.showBest}</span>
      </button>

      <div className="atlas-viz-status">
        {near && (
          <p className="atlas-viz-near">
            <span className="atlas-check" aria-hidden="true" />
            {strings.nearBest}
          </p>
        )}
        {showBest && <p>{formatString(strings.bestNote, { mse: bestMseText })}</p>}
      </div>

      <p className="sr-only" id={ids.desc}>
        {`${description} ${formatString(strings.meanNote, meanText)}`}
      </p>
      {/* Present and empty from the start; only its text changes, so screen readers speak it. */}
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </figure>
  );
}
