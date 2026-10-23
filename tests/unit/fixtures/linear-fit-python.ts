// Numbers from Python for LinearFitViz (docs/architecture/viz.md, sections 2.5, 4.5, 6 task V1).
// Python 3.14.5 + NumPy 2.4.6 (the NumPy version Pyodide 314.0.7 ships), 23/10/2026, run from an empty folder.
// Command (x, y = the two columns of `rows`; W0, B0 = APARTMENTS_LINEAR_FIT.w.initial, .b.initial):
//   python -I -c "import numpy as np; x=np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85]);
//     y=np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8]); W0, B0 = 0, 10.9;
//     w,b=np.polyfit(x,y,1); print(repr(float(w)), repr(float(b)),
//     repr(float(np.mean((w*x+b-y)**2))), repr(float(np.mean((W0*x+B0-y)**2))))"
// Output: 0.1694765465669613 2.0394289598912314 0.3614792658055736 10.501999999999999
// Other ways to the same line differ in the last digits only, hence toBeCloseTo(…, 9) in the tests
// (same Python and NumPy, same day):
//   np.linalg.solve(X.T @ X, X.T @ y), as in normal-equation.py: 0.1694765465669612, 2.0394289598912345,
//     MSE 0.36147926580557393;
//   one-feature formula Σ(x − x̄)(y − ȳ) / Σ(x − x̄)², as in sklearn-fit.py: 0.16947654656696126,
//     2.0394289598912305, MSE 0.36147926580557427;
//   np.linalg.lstsq(X, y), as in outlier.py: 0.16947654656696126, 2.039428959891225.
//   Mean point: x.mean() = 52.4, y.mean() = 10.92 (repr of the float64 values).
// If APARTMENTS.rows or the initial w, b change, run the command again with the new numbers.
export const PYTHON_LINEAR_FIT = {
  rows: [
    [25, 6.7],
    [30, 6.5],
    [36, 8.8],
    [42, 8.8],
    [48, 9.4],
    [55, 12.2],
    [60, 12.0],
    [68, 14.1],
    [75, 13.9],
    [85, 16.8],
  ],
  best: { w: 0.1694765465669613, b: 2.0394289598912314, mse: 0.3614792658055736 },
  initial: { w: 0, b: 10.9, mse: 10.501999999999999 },
  mean: { x: 52.4, y: 10.92 },
} as const;
