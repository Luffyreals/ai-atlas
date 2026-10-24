// Axis text of a VIZ, built by the wrapper in the page locale (docs/architecture/viz/, sections 4.5, 9.4.1;
// decision 50). Pure, relative imports only: Playwright e2e may import this file.
import type { DatasetColumn } from '../../data/datasets/types';
import type { Locale } from '../../data/roadmap';

/** The text of one axis. */
export interface AxisText {
  name: string; // "Diện tích": in the plot's accessible name
  unit: string; // "m²": in aria-valuetext; '' for a quantity without a unit
  title: string; // "Diện tích (m²)": the visible axis title; just the name when the unit is '' (DatasetTable's rule)
}

export function axisText(column: Pick<DatasetColumn, 'name' | 'unit'>, locale: Locale): AxisText {
  const name = column.name[locale];
  const unit = column.unit[locale];
  return { name, unit, title: unit === '' ? name : `${name} (${unit})` };
}
