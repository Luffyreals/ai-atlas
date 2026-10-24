// Marks sized in px at a position given in percent (docs/architecture/viz/, sections 2.4, 9.4.4): the nested
// 1 × 1 <svg> moves the origin to (x, y) and lets its children overflow, so a child drawn around 0,0 keeps its
// size at every plot width. CrossMark is drawn with it.
import type { ReactNode } from 'react';

export interface AtPointProps {
  x: string; // pct(toPercentX(…))
  y: string; // pct(toPercentY(…))
  children: ReactNode; // SVG marks in px around 0,0
}

export default function AtPoint({ x, y, children }: AtPointProps) {
  return (
    <svg x={x} y={y} width="1" height="1" overflow="visible">
      {children}
    </svg>
  );
}
