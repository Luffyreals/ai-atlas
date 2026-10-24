// A 12px × at a point given in percent (docs/architecture/viz.md, sections 4.7, 12.4.3): the mean point of
// LinearFitViz, the least-squares point of GradientDescentViz, and their key swatches. Drawn with AtPoint, so the
// arms stay in px at every plot width. The halo (plot background, wider) keeps it readable where a line runs under it.
import AtPoint from './AtPoint';

export interface CrossMarkProps {
  x: string; // pct(toPercentX(…)), or '50%' in a swatch
  y: string; // pct(toPercentY(…))
  halo?: boolean;
}

export default function CrossMark({ x, y, halo }: CrossMarkProps) {
  const arms = (className: string) => (
    <>
      <line className={className} x1="-6" y1="-6" x2="6" y2="6" />
      <line className={className} x1="-6" y1="6" x2="6" y2="-6" />
    </>
  );
  return (
    <AtPoint x={x} y={y}>
      {halo && arms('atlas-viz-halo')}
      {arms('atlas-viz-marker')}
    </AtPoint>
  );
}
