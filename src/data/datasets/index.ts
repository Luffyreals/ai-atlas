// Registry of the shared lesson datasets (docs/architecture/viz.md, section 2.5).
// The key is the dataset id: <DatasetTable dataset="…" /> and the "# dataset: …" marker in src/code/ use it.
import { APARTMENTS } from './apartments';
import { SINE_TEST, SINE_TRAIN } from './sine';
import type { XYDataset } from './types';

export const DATASETS = {
  apartments: APARTMENTS,
  'sine-train': SINE_TRAIN,
  'sine-test': SINE_TEST,
} as const satisfies Record<string, XYDataset>;
export type DatasetId = keyof typeof DATASETS;
