// Numbers from scikit-learn for PolyFitViz (docs/architecture/viz/poly-fit.md, sections 9.2.1, 9.2.2, 9.4.1, 9.6 task P1).
// Python 3.14.5 + NumPy 2.4.6 + scikit-learn 1.8.0 (the versions Pyodide 314.0.7 ships; venv of section 2.5),
// 23/10/2026, `python -I fixture.py` run from an empty folder outside the repo. fixture.py:
//   import numpy as np
//   from sklearn.pipeline import make_pipeline
//   from sklearn.preprocessing import PolynomialFeatures
//   from sklearn.linear_model import LinearRegression
//   x_train = np.array([0.03, 0.12, 0.15, 0.23, 0.26, 0.35, 0.41, 0.47, 0.51, 0.6, 0.64, 0.73, 0.77, 0.85, 0.9, 0.98])
//   y_train = np.array([0.15, 1.06, 0.84, 0.96, 0.83, 0.94, 0.3, -0.09, -0.17, -0.32, -0.68, -0.84, -0.28, -0.82,
//                       -0.53, -0.02])
//   x_test = np.array([0.06, 0.18, 0.32, 0.43, 0.55, 0.67, 0.8, 0.94])
//   y_test = np.array([0.33, 0.66, 0.93, 0.43, -0.42, -1.11, -1.18, -0.45])
//   grid = np.linspace(0, 1, 11)
//   for d in range(1, 16):
//       m = make_pipeline(PolynomialFeatures(d, include_bias=False), LinearRegression()).fit(x_train[:, None], y_train)
//       tr = np.mean((m.predict(x_train[:, None]) - y_train) ** 2)
//       te = np.mean((m.predict(x_test[:, None]) - y_test) ** 2)
//       print(d, repr(float(tr)), repr(float(te)), m.predict(grid[:, None]).tolist() if d in (1, 3, 9, 15) else [])
// grid.x is np.linspace(0, 1, 11).tolist(), copied as printed (0.30000000000000004, …), so TS evaluates the same x.
// scikit-learn fits x unscaled, so at degree 15 it is ~1.2e-5 (relative) away from the stable fit: the tests use
// the tolerance of section 9.2.2, |Δ| ≤ 5e-4 · max(1, |v_py|), not exact equality.
// If SINE_TRAIN.rows or SINE_TEST.rows change, run the command again with the new numbers.
export const PYTHON_POLY_FIT = {
  train: [
    [0.03, 0.15], [0.12, 1.06], [0.15, 0.84], [0.23, 0.96], [0.26, 0.83], [0.35, 0.94], [0.41, 0.3], [0.47, -0.09],
    [0.51, -0.17], [0.6, -0.32], [0.64, -0.68], [0.73, -0.84], [0.77, -0.28], [0.85, -0.82], [0.9, -0.53], [0.98, -0.02],
  ],
  test: [[0.06, 0.33], [0.18, 0.66], [0.32, 0.93], [0.43, 0.43], [0.55, -0.42], [0.67, -1.11], [0.8, -1.18], [0.94, -0.45]],
  mse: [
    { degree: 1, train: 0.16631950392817857, test: 0.27320046663099196 },
    { degree: 2, train: 0.16243437326668853, test: 0.27661912078226847 },
    { degree: 3, train: 0.037662330598699584, test: 0.07535108981918688 },
    { degree: 4, train: 0.030849743870940072, test: 0.08957310105031292 },
    { degree: 5, train: 0.030085746202486774, test: 0.0968815349438353 },
    { degree: 6, train: 0.028715565423322997, test: 0.09820853739545457 },
    { degree: 7, train: 0.024676865753715513, test: 0.10273626516919904 },
    { degree: 8, train: 0.02156057810262687, test: 0.12153997133200878 },
    { degree: 9, train: 0.02055410756203322, test: 0.165550164990602 },
    { degree: 10, train: 0.018941658758429923, test: 0.3285538932469503 },
    { degree: 11, train: 0.007689445686979518, test: 0.6438694474808582 },
    { degree: 12, train: 0.001343163898151321, test: 3.5438791950309323 },
    { degree: 13, train: 0.0009465690877510356, test: 4.284823075955481 },
    { degree: 14, train: 0.00018878790334079886, test: 30.07021762953207 },
    { degree: 15, train: 1.0175002343048952e-11, test: 133.1963072184929 },
  ],
  grid: {
    x: [0.0, 0.1, 0.2, 0.30000000000000004, 0.4, 0.5, 0.6000000000000001, 0.7000000000000001, 0.8, 0.9, 1.0],
    pred: {
      1: [
        0.9545026361705354, 0.7802271089364283, 0.6059515817023212, 0.4316760544682141, 0.257400527234107, 0.083125,
        -0.09115052723410721, -0.2654260544682142, -0.43970158170232143, -0.6139771089364284, -0.7882526361705354,
      ],
      3: [
        0.0823586608373744, 0.7231336130806868, 0.9254063225068804, 0.8014256896227114, 0.46344061493493593,
        0.023699998950310705, -0.405547257824409, -0.7120522548824674, -0.7835660917171043, -0.5078398678215683,
        0.2273753173108971,
      ],
      9: [
        -2.9515825958407005, 1.1807643146411415, 0.8159398810197338, 0.9595029966795354, 0.48044591681838833,
        -0.18846295965092263, -0.49040257291634637, -0.5816875922388602, -0.6363461246396538, -0.6057663129435791,
        0.5559240584551661,
      ],
      15: [
        -471.1181863498688, 5.288607470657439, 1.3685154656248528, 1.0312646640094272, 0.4034362408518746,
        -0.15914757817984082, -0.3200012435019062, -1.0906537425518081, -0.25334751129150845, -0.5299876880645797,
        114.72378218650817,
      ],
    },
  },
} as const;
