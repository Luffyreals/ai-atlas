// Shapes of the shared lesson datasets (docs/architecture/viz/shared.md, section 4.1). Types only.
// Relative imports only: Playwright e2e imports these files too, and it does not know the @data/* alias.
import type { LessonId, Localized } from '../roadmap';

export type Row = readonly [x: number, y: number];

export interface DatasetColumn {
  name: Localized; // axis title and table header, e.g. { vi: 'Diện tích', en: 'Floor area' }
  unit: Localized; // e.g. { vi: 'm²', en: 'm²' }; '' in every locale for a quantity without a unit
  digits: number; // decimals in the table; every value must already have at most this many
  python: string; // variable name in the lesson code, e.g. 'area'; a valid Python identifier
}

export interface XYDataset {
  id: string; // registry key, and the "# dataset: <id>" marker in src/code/
  lessons: readonly LessonId[]; // lessons whose code must carry this data (viz/README.md, section 2.5)
  caption: Localized; // DatasetTable caption; says so when the numbers are made up
  itemLabel: Localized; // what one point is, for the legend: { vi: 'Một căn hộ', en: 'One apartment' }
  description: Localized; // 1–2 sentences for screen readers: what the cloud of points shows
  x: DatasetColumn;
  y: DatasetColumn;
  rows: readonly Row[]; // table order; the Python arrays list the same numbers in the same order
}

/**
 * Logits of one next-token step, for SamplingViz (docs/architecture/llm-lessons.md, section 4.6.1). Not x/y data,
 * so not in DATASETS (that registry feeds DatasetTable). The lesson code copies `logits` under "# logits: <id>".
 */
export interface TokenDistribution {
  id: string; // the "# logits: <id>" marker in src/code/
  lessons: readonly LessonId[]; // lessons that show it; those with code must carry the marker
  context: Localized; // the text before the next token, e.g. { vi: 'Hôm nay trời rất', en: 'The weather today is very' }
  tokens: Localized<readonly string[]>; // same length as logits, most likely first
  logits: readonly number[]; // fixed, shared by both locales, so the numbers match the Python cell
  description: Localized; // 1–2 sentences for screen readers
}

/**
 * A small grey-scale image drawn by hand as numbers, for the CV VIZ (docs/architecture/cv-lessons.md, sections 1.1,
 * 1.2): never taken from a dataset under copyright. `pixels[r][c]`, row 0 at the top, every row `width` long.
 */
export interface PixelImage {
  id: string;
  lessons: readonly LessonId[]; // lessons whose VIZ shows it
  width: number;
  height: number;
  range: readonly [min: number, max: number]; // every pixel lies in it; min is drawn as the background
  pixels: readonly (readonly number[])[];
  description: Localized; // what the picture shows, for screen readers
}
