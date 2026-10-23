// Pyodide runtime settings. The version must equal `pyodide` in package.json (checked by deps.test.ts).
export const PYODIDE_VERSION = '314.0.7';
export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
export const OUTPUT_LIMIT_CHARS = 100_000; // per run, stdout + stderr
export const FLUSH_INTERVAL_MS = 50;
export const FLUSH_MAX_CHARS = 16_384;
export const MAX_FIGURES = 10;
export const FIGURE_DPI = 100;
export const LONG_RUN_HINT_MS = 10_000; // show the "press Stop" hint after this long
