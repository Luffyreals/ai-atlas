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
