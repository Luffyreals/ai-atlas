// Feature maps from NumPy for ConvolutionViz (docs/architecture/viz/convolution.md).
// Python 3.14.5 + NumPy 2.4.6 (the versions Pyodide 314.0.7 ships; venv of viz/README.md section 2.5), 05/11/2026,
// `python -I conv.py` run from an empty folder outside the repo. conv.py:
//   import numpy as np
//   X = np.array([[0]*8, [0]*8, [0,0,9,9,9,9,0,0], [0,0,9,9,9,9,0,0],
//                 [0,0,9,9,9,9,0,0], [0,0,9,9,9,9,0,0], [0]*8, [0]*8], dtype=float)
//   K = {"identity": [[0,0,0],[0,1,0],[0,0,0]], "blur": np.full((3, 3), 1/9),
//        "sharpen": [[0,-1,0],[-1,5,-1],[0,-1,0]],
//        "sobelVertical": [[-1,0,1],[-2,0,2],[-1,0,1]],
//        "sobelHorizontal": [[-1,-2,-1],[0,0,0],[1,2,1]]}
//   def conv(X, K):                       # cross-correlation, "valid", stride 1
//       K = np.asarray(K, float); k = K.shape[0]; n = X.shape[0] - k + 1
//       Y = np.zeros((n, n))
//       for i in range(n):
//           for j in range(n):
//               Y[i, j] = np.sum(X[i:i+k, j:j+k] * K)
//       return Y
//   for name, k in K.items(): print(name, np.round(conv(X, k), 10).tolist())
// Rounded to 10 decimals (the blur gives 3.0000000000000004 and the like); compare with toBeCloseTo.
import type { KernelId } from '../../../src/lib/viz/convolution';

export const PYTHON_IMAGE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 9, 9, 9, 9, 0, 0],
  [0, 0, 9, 9, 9, 9, 0, 0],
  [0, 0, 9, 9, 9, 9, 0, 0],
  [0, 0, 9, 9, 9, 9, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

export const PYTHON_FEATURE_MAPS: Record<KernelId, number[][]> = {
  identity: [
    [0, 0, 0, 0, 0, 0],
    [0, 9, 9, 9, 9, 0],
    [0, 9, 9, 9, 9, 0],
    [0, 9, 9, 9, 9, 0],
    [0, 9, 9, 9, 9, 0],
    [0, 0, 0, 0, 0, 0],
  ],
  blur: [
    [1, 2, 3, 3, 2, 1],
    [2, 4, 6, 6, 4, 2],
    [3, 6, 9, 9, 6, 3],
    [3, 6, 9, 9, 6, 3],
    [2, 4, 6, 6, 4, 2],
    [1, 2, 3, 3, 2, 1],
  ],
  sharpen: [
    [0, -9, -9, -9, -9, 0],
    [-9, 27, 18, 18, 27, -9],
    [-9, 18, 9, 9, 18, -9],
    [-9, 18, 9, 9, 18, -9],
    [-9, 27, 18, 18, 27, -9],
    [0, -9, -9, -9, -9, 0],
  ],
  sobelVertical: [
    [9, 9, 0, 0, -9, -9],
    [27, 27, 0, 0, -27, -27],
    [36, 36, 0, 0, -36, -36],
    [36, 36, 0, 0, -36, -36],
    [27, 27, 0, 0, -27, -27],
    [9, 9, 0, 0, -9, -9],
  ],
  sobelHorizontal: [
    [9, 27, 36, 36, 27, 9],
    [9, 27, 36, 36, 27, 9],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [-9, -27, -36, -36, -27, -9],
    [-9, -27, -36, -36, -27, -9],
  ],
};
