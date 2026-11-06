// A small grey-scale picture as SVG (docs/architecture/cv-lessons.md, sections 1.1, 1.2): ConvolutionViz and
// DiffusionNoiseViz. The viewBox counts cells, so children (a window frame, a selected cell) are placed in cells;
// no text inside, so scaling the viewBox is safe here (viz/README.md section 2.4 is about text). A pixel is a rect of
// class atlas-viz-px; its value is the fill-opacity over the plot background, its sign (data-sign) picks the colour.
import type { ReactNode } from 'react';

export interface PixelCell {
  opacity: string; // "0.00" … "1.00", fixed decimals: the same at build time and after hydration
  sign?: '+' | '-' | ''; // a diverging map: '+' primary, '-' alt; '' or absent: ink
}

export interface PixelGridProps {
  rows: number; // of the viewBox
  cols: number;
  cells: readonly (readonly PixelCell[])[]; // cells[r][c]
  offset?: number; // first cell drawn at (offset, offset): a 6 × 6 map inside an 8 × 8 frame
  gridLines?: boolean; // thin lines between cells, for a picture small enough to count them
  label: string; // aria-label of the <svg role="img">
  describedBy?: string;
  children?: ReactNode; // overlays in cell units, drawn last
}

export default function PixelGrid({ rows, cols, cells, offset = 0, gridLines, label, describedBy, children }: PixelGridProps) {
  return (
    <svg
      className="atlas-viz-pixels"
      viewBox={`0 0 ${cols} ${rows}`}
      role="img"
      aria-label={label}
      aria-describedby={describedBy}
    >
      {cells.flatMap((row, r) =>
        row.map((cell, c) =>
          // A fully transparent cell draws nothing: fewer nodes, the same picture.
          cell.opacity === '0.00' ? null : (
            <rect
              key={`${r}-${c}`}
              className="atlas-viz-px"
              data-sign={cell.sign || undefined}
              x={c + offset}
              y={r + offset}
              width="1"
              height="1"
              fillOpacity={cell.opacity}
            />
          ),
        ),
      )}
      {gridLines &&
        Array.from({ length: cols - 1 }, (_, i) => (
          <line
            key={`v${i}`}
            className="atlas-viz-grid-line"
            x1={i + 1}
            y1="0"
            x2={i + 1}
            y2={rows}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      {gridLines &&
        Array.from({ length: rows - 1 }, (_, i) => (
          <line
            key={`h${i}`}
            className="atlas-viz-grid-line"
            x1="0"
            y1={i + 1}
            x2={cols}
            y2={i + 1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      {children}
    </svg>
  );
}

export interface CellFrameProps {
  x: number; // left, in cells
  y: number; // top, in cells
  size: number; // in cells
}

/** The frame of a window or a selected cell: accent 3px on a 7px halo of the plot background, in screen px. */
export function CellFrame({ x, y, size }: CellFrameProps) {
  const rect = (className: string) => (
    <rect
      className={className}
      x={x}
      y={y}
      width={size}
      height={size}
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
  );
  return (
    <>
      {rect('atlas-viz-halo')}
      {rect('atlas-viz-primary')}
    </>
  );
}
