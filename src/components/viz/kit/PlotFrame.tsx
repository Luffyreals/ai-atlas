// Axes, ticks and grid of a VIZ plot (docs/architecture/viz.md, sections 2.4, 4.3). No state, so it also renders
// as static HTML without client:*. Text (titles, tick labels) is HTML around the SVG, so it keeps the page's text
// size at every width; the SVG has no viewBox and children place marks with pct(toPercentX(…)) / pct(toPercentY(…)).
import type { CSSProperties, ReactNode } from 'react';
import { decimalsOf, formatNumber } from '../../../lib/viz/format';
import { pct, toPercentX, toPercentY, type Domain } from '../../../lib/viz/scale';

export interface PlotFrameProps {
  xDomain: Domain;
  yDomain: Domain;
  xTicks: readonly number[]; // formatted with formatNumber, decimals = max decimalsOf(tick)
  yTicks: readonly number[];
  xTitle: string; // "Diện tích (m²)": name + " (" + unit + ")"
  yTitle: string;
  label: string; // aria-label of the <svg role="img">
  describedBy?: string; // id of an sr-only description
  shape?: 'default' | 'short'; // 'short': a low plot (data-shape on .atlas-viz-chart, viz.css; section 9.4.7)
  children: ReactNode; // SVG marks
}

function tickLabels(ticks: readonly number[]): string[] {
  const digits = Math.max(0, ...ticks.map(decimalsOf));
  return ticks.map((tick) => formatNumber(tick, digits));
}

export default function PlotFrame({
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  xTitle,
  yTitle,
  label,
  describedBy,
  shape = 'default',
  children,
}: PlotFrameProps) {
  const xLabels = tickLabels(xTicks);
  const yLabels = tickLabels(yTicks);
  // The y tick column is as wide as its longest label (tabular figures: one ch per character).
  const style = { '--atlas-viz-ytick-ch': Math.max(1, ...yLabels.map((text) => text.length)) } as CSSProperties;
  return (
    <div className="atlas-viz-chart" style={style} data-shape={shape === 'short' ? 'short' : undefined}>
      <div className="atlas-viz-axis-title atlas-viz-ytitle" aria-hidden="true">
        {yTitle}
      </div>
      <div className="atlas-viz-yticks" aria-hidden="true">
        {yTicks.map((tick, i) => (
          <span key={tick} style={{ top: pct(toPercentY(tick, yDomain)) }}>
            {yLabels[i]}
          </span>
        ))}
      </div>
      <div className="atlas-viz-plot">
        <svg className="atlas-viz-svg" role="img" aria-label={label} aria-describedby={describedBy}>
          {xTicks
            .filter((tick) => tick !== xDomain[0])
            .map((tick) => {
              const x = pct(toPercentX(tick, xDomain));
              return <line key={`x${tick}`} className="atlas-viz-grid-line" x1={x} y1="0%" x2={x} y2="100%" />;
            })}
          {yTicks
            .filter((tick) => tick !== yDomain[0])
            .map((tick) => {
              const y = pct(toPercentY(tick, yDomain));
              return <line key={`y${tick}`} className="atlas-viz-grid-line" x1="0%" y1={y} x2="100%" y2={y} />;
            })}
          <line className="atlas-viz-axis" x1="0%" y1="100%" x2="100%" y2="100%" />
          <line className="atlas-viz-axis" x1="0%" y1="0%" x2="0%" y2="100%" />
          {children}
        </svg>
      </div>
      <div className="atlas-viz-xticks" aria-hidden="true">
        {xTicks.map((tick, i) => (
          <span key={tick} style={{ left: pct(toPercentX(tick, xDomain)) }}>
            {xLabels[i]}
          </span>
        ))}
      </div>
      <div className="atlas-viz-axis-title atlas-viz-xtitle" aria-hidden="true">
        {xTitle}
      </div>
    </div>
  );
}
