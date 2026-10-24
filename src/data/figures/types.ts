// Shapes of the static figures' words (docs/architecture/viz/figures.md, section 8.4). Types only.
// Relative imports only: Playwright e2e imports these files too, and it does not know the @data/* alias.
import type { Locale } from '../roadmap';

/** One label. A string is one line; an array is one string per line, broken by hand for this language. */
export type Lines = string | readonly string[];

export interface FigureStrings<K extends string> {
  caption: string; // visible <figcaption>; $…$ rendered with KaTeX at build
  label: string; // aria-label of the SVG: kind of figure + subject, one short phrase
  description: string; // sr-only: everything the figure says, in reading order, 1–4 sentences
  labels: Record<K, Lines>; // text drawn in the SVG, at most 3 lines each; no $…$
}

export type FigureText<K extends string> = Record<Locale, FigureStrings<K>>;
