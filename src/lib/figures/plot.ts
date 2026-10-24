// Schematic plots of static figures (docs/architecture/viz/static-plots.md, section 11.4.1): data coordinates (y up) to
// viewBox units (y down), with one scale for both axes so a circle stays round. Pure functions, no DOM.
// Relative imports only: Playwright e2e may import this file too, and it does not know the @lib/* alias.
import { round1, type Pt } from './geometry';

/** A plot area in viewBox units. One `unit` for both axes, so a circle stays round. */
export interface PlotBox {
  x: number; // top-left corner
  y: number;
  unit: number; // viewBox units per data unit
  xDomain: readonly [min: number, max: number];
  yDomain: readonly [min: number, max: number];
}

/** An ellipse in data units; majorAngle in degrees, counter-clockwise from the +x axis (y up). */
export interface Ellipse {
  centre: Pt;
  semiMajor: number;
  semiMinor: number;
  majorAngle: number;
}

/** Level curves of f(w) = (w − c)ᵀ A (w − c), A = u uᵀ + v vᵀ / axisRatio², u at majorAngle, v ⟂ u. */
export interface Quadratic {
  centre: Pt;
  majorAngle: number; // degrees, counter-clockwise from the +x axis
  axisRatio: number; // semi-minor / semi-major, in (0, 1]
}

export function plotSize(box: PlotBox): { width: number; height: number } {
  return {
    width: round1((box.xDomain[1] - box.xDomain[0]) * box.unit),
    height: round1((box.yDomain[1] - box.yDomain[0]) * box.unit),
  };
}

/** Data → viewBox, rounded with round1. Throws when p lies outside the domain (catches typos). */
export function toView(box: PlotBox, p: Pt): Pt {
  const [x, y] = p;
  const [x0, x1] = box.xDomain;
  const [y0, y1] = box.yDomain;
  if (!(x >= x0 && x <= x1 && y >= y0 && y <= y1)) {
    throw new Error(`toView: (${x}, ${y}) lies outside the plot domain [${x0}, ${x1}] × [${y0}, ${y1}].`);
  }
  return [round1(box.x + (x - x0) * box.unit), round1(box.y + (y1 - y) * box.unit)];
}

/** "x,y x,y …" for <polygon> / <polyline>. */
export function pointsAttr(box: PlotBox, points: readonly Pt[]): string {
  return points.map((p) => toView(box, p).join(',')).join(' ');
}

/** Attributes of <ellipse>; transform is `rotate(${-majorAngle} cx cy)`: the sign flips with the y axis. */
export function ellipseAttrs(
  box: PlotBox,
  e: Ellipse,
): { cx: number; cy: number; rx: number; ry: number; transform: string } {
  const [cx, cy] = toView(box, e.centre);
  const angle = round1(-e.majorAngle);
  return { cx, cy, rx: round1(e.semiMajor * box.unit), ry: round1(e.semiMinor * box.unit), transform: `rotate(${angle} ${cx} ${cy})` };
}

function axes(q: Quadratic): { u: Pt; v: Pt } {
  if (!(q.axisRatio > 0 && q.axisRatio <= 1)) throw new Error(`Quadratic: axisRatio must be in (0, 1], got ${q.axisRatio}.`);
  const phi = (q.majorAngle * Math.PI) / 180;
  return { u: [Math.cos(phi), Math.sin(phi)], v: [-Math.sin(phi), Math.cos(phi)] };
}

/** f(w) = (w − c)ᵀ A (w − c) = (u·d)² + (v·d)² / axisRatio², d = w − c. */
export function quadraticValue(q: Quadratic, w: Pt): number {
  const { u, v } = axes(q);
  const d = [w[0] - q.centre[0], w[1] - q.centre[1]];
  const along = u[0] * d[0] + u[1] * d[1];
  const across = (v[0] * d[0] + v[1] * d[1]) / q.axisRatio;
  return along * along + across * across;
}

/** ∇f(w) = 2 A (w − c). */
export function quadraticGradient(q: Quadratic, w: Pt): Pt {
  const { u, v } = axes(q);
  const d = [w[0] - q.centre[0], w[1] - q.centre[1]];
  const along = u[0] * d[0] + u[1] * d[1];
  const across = (v[0] * d[0] + v[1] * d[1]) / (q.axisRatio * q.axisRatio);
  return [2 * (along * u[0] + across * v[0]), 2 * (along * u[1] + across * v[1])];
}

/** The level curve of q through `through`, scaled by `scale` about the centre: semiMajor = scale · √f(through). */
export function levelEllipse(q: Quadratic, through: Pt, scale: number = 1): Ellipse {
  if (!(scale > 0)) throw new Error(`levelEllipse: scale must be positive, got ${scale}.`);
  const radius = Math.sqrt(quadraticValue(q, through));
  if (radius === 0) throw new Error(`levelEllipse: (${through.join(', ')}) is the centre; no level curve passes through it.`);
  return { centre: q.centre, semiMajor: scale * radius, semiMinor: scale * radius * q.axisRatio, majorAngle: q.majorAngle };
}
