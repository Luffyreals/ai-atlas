// A curve in data space, clipped to the plot box (docs/architecture/viz.md, sections 2.4, 9.2.2, 9.4.4).
// The nested <svg> fills the plot and maps viewBox 0 0 100 100 onto it without keeping the aspect ratio, so
// toPolyline's percent coordinates land where pct(toPercentX/Y(…)) marks do. overflow="hidden" lets the browser
// cut the curve at the plot's edge (never clamp y: that would draw flat runs along the edge), and
// non-scaling-stroke keeps the stroke width and dashes in screen px however the box is stretched.

export interface PlotCurveProps {
  points: string; // toPolyline(...) output
  className: string; // a role class: atlas-viz-primary | atlas-viz-series | atlas-viz-series-alt | atlas-viz-guide
  off?: boolean; // data-off on the nested svg: hidden, keeps its place
}

export default function PlotCurve({ points, className, off }: PlotCurveProps) {
  return (
    <svg
      x="0"
      y="0"
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      overflow="hidden"
      data-off={off || undefined}
    >
      <polyline className={className} points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
