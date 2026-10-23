// Types shared by VIZ islands and their wrappers (docs/architecture/viz.md, sections 4.5, 9.4.4). Types only.

/** The text of one axis, built by the wrapper in the page locale. */
export interface AxisText {
  name: string; // "Diện tích": in the plot's accessible name
  unit: string; // "m²": in aria-valuetext; '' for a quantity without a unit
  title: string; // "Diện tích (m²)": the visible axis title; just the name when the unit is ''
}
