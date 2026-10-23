// Key and readout swatches of every VIZ (docs/architecture/viz.md, sections 4.3, 9.4.5; decision 50): a swatch
// draws the same mark with the same class as the plot, so its colour and dash always match. Decorative: the
// words next to it carry the meaning (aria-hidden).

export interface SwatchProps {
  className: string; // the role class of the line on the plot, e.g. atlas-viz-primary
  /** A point on the line; the swatch is then 36px wide (atlas-viz-swatch-wide), so a 6 4 dash shows on both sides. */
  dot?: 'point' | 'ring';
  /** A short upright line instead of a level one (a residual). */
  upright?: boolean;
}

/** A short line in a 24px swatch (36px with a dot). */
export function Swatch({ className, dot, upright }: SwatchProps) {
  return (
    <svg className={dot ? 'atlas-viz-swatch atlas-viz-swatch-wide' : 'atlas-viz-swatch'} aria-hidden="true" focusable="false">
      {upright ? (
        <line className={className} x1="50%" y1="15%" x2="50%" y2="85%" />
      ) : (
        <line className={className} x1="0%" y1="50%" x2="100%" y2="50%" />
      )}
      {dot && <circle className={`atlas-viz-${dot}`} cx="50%" cy="50%" r="4" />}
    </svg>
  );
}

export interface DotSwatchProps {
  className: string; // the role class of the point on the plot, e.g. atlas-viz-point
  r?: number; // radius in px, 6 by default (the plot's points)
}

/** A point mark alone in a 24px swatch. */
export function DotSwatch({ className, r = 6 }: DotSwatchProps) {
  return (
    <svg className="atlas-viz-swatch" aria-hidden="true" focusable="false">
      <circle className={className} cx="50%" cy="50%" r={r} />
    </svg>
  );
}
