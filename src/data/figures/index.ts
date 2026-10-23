// Registry of the static figures (docs/architecture/viz.md, section 8). The key is the figure id: kebab-case
// name of <Name>Figure.astro without "Figure", the name of its words file here, and the element ids
// fig-<id>, fig-<id>-desc. tests/unit/figure-conventions.test.ts keeps components, files and keys in step.
import { ML_FAMILIES } from './ml-families';
import { ML_WORKFLOW } from './ml-workflow';
import type { FigureText } from './types';

export const FIGURES = {
  'ml-families': ML_FAMILIES,
  'ml-workflow': ML_WORKFLOW,
} as const satisfies Record<string, FigureText<string>>;
export type FigureId = keyof typeof FIGURES;
