"""Exact Lasso path (and exact Ridge numbers) of RegularizationViz on the sine data.

docs/architecture/viz.md, section 10.2.4. Writes two GENERATED files:
  src/data/datasets/sine-lasso-path.ts          SINE_LASSO_PATH: Lasso coefficients, one row per lambda level
  tests/unit/fixtures/regularization-python.ts  PYTHON_REGULARIZATION: exact MSE of Ridge and Lasso, zero counts

Run by hand with the venv of viz.md section 2.5 (the versions Pyodide 314.0.7 ships: Python 3.14.5,
NumPy 2.4.6, scikit-learn 1.8.0), from an empty folder outside the repo, so nothing local shadows a module:
  cd <an empty folder>
  C:/Users/Dell/.venvs/ai-atlas-py314/Scripts/python.exe -I "<repo>/scripts/sine-lasso-path.py"
Never run in the build or in CI. Run it again when SINE_TRAIN / SINE_TEST change or when Pyodide is upgraded
(new NumPy or scikit-learn may change a few bits of the features). A file whose content is the same apart from its
date line is left untouched, so a rerun on unchanged data gives an empty git diff.

Model: make_pipeline(PolynomialFeatures(15, include_bias=False), StandardScaler(), model) on x_train, so the
features are z_k = (x^k - mu_k) / sigma_k on the 16 training points. Objectives of the lesson (b not penalized):
  Ridge: (1/m) sum (y_hat - y)^2 + lam * ||w||_2^2     Lasso: (1/m) sum (y_hat - y)^2 + lam * ||w||_1
The features are the floats scikit-learn makes; every step after that is exact (fractions.Fraction):
  1. Z (train, test) from the pipeline, each float turned into a Fraction; Zc, yc centered exactly on train.
  2. Homotopy from lam_max = max_j |(2/m) z_j^T yc| down: on a segment with active set A and signs s_A,
     w_A(lam) = G_AA^-1 (c_A - (m lam / 2) s_A), G = Zc^T Zc, c = Zc^T yc. The next breakpoint is the largest
     lam below the current one where an active coefficient reaches 0 or an inactive |g_j| reaches lam,
     g_j = (2/m) z_j^T r. Every segment solves G_AA afresh, so the denominators do not grow with the steps.
  3. Each lambda level: solve on its segment, check KKT exactly (assert), b = y_bar - z_bar^T w.
  4. lam = 0: G w = c exactly (least squares, it interpolates the 16 points).
  5. Ridge, exactly: (G + m lam I) w = c for every lam > 0.
  6. Cross-check with scikit-learn, warnings as errors: Ridge(alpha=16 * lam) for lam >= 1e-12, Ridge(solver='svd')
     for every lam > 0, Lasso(alpha=lam / 2, max_iter=100_000, tol=1e-6) for lam in {1e-3, 1e-2, 1e-1}: same MSE
     strings (formatMse: 4 decimals, 2 from 10 up) and the same number of zero coefficients.
"""

import datetime
import re
import sys
import warnings
from fractions import Fraction
from pathlib import Path

import numpy as np
import sklearn
from sklearn.linear_model import Lasso, Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

warnings.simplefilter("error")

REPO = Path(__file__).resolve().parent.parent
SINE_TS = REPO / "src" / "data" / "datasets" / "sine.ts"
PATH_TS = REPO / "src" / "data" / "datasets" / "sine-lasso-path.ts"
FIXTURE_TS = REPO / "tests" / "unit" / "fixtures" / "regularization-python.ts"
COMMAND = "python -I scripts/sine-lasso-path.py (venv of viz.md section 2.5, from an empty folder)"

DEGREE = 15
# Same as SINE_REGULARIZATION.levels in sine.ts (tests/unit/regularization-sine.test.ts compares them).
EXPONENTS = [None] + list(range(-14, 2))
SKLEARN_RIDGE_FROM = -12  # Ridge's default solver (Cholesky on X^T X) is off in the 4th decimal below this
SKLEARN_LASSO = (-3, -2, -1)  # coordinate descent converges without a warning only here (section 10.2.5)
DATE_LINE = re.compile(r"^(// Date: |  date: ').*$", re.M)  # ignored when deciding whether a file changed


def read_rows(name):
    """The rows of one dataset in sine.ts: the one copy of the data."""
    text = SINE_TS.read_text(encoding="utf-8")
    block = re.search(r"export const " + name + r" = \{.*?rows: \[(.*?)\],\n\} as const", text, re.S)
    if block is None:
        sys.exit(f"cannot find the rows of {name} in {SINE_TS}")
    pairs = re.findall(r"\[(-?[\d.]+), (-?[\d.]+)\]", block.group(1))
    return [(float(x), float(y)) for x, y in pairs]


def solve(M, rhs):
    """Exact Gaussian elimination: M x = r for every r in rhs (lists of Fractions). M must be regular."""
    n = len(M)
    A = [list(row) + [r[i] for r in rhs] for i, row in enumerate(M)]
    for k in range(n):
        pivot = next((i for i in range(k, n) if A[i][k] != 0), None)
        assert pivot is not None, "singular matrix"
        A[k], A[pivot] = A[pivot], A[k]
        for i in range(k + 1, n):
            if A[i][k] != 0:
                f = A[i][k] / A[k][k]
                A[i] = [a - f * p for a, p in zip(A[i], A[k])]
    out = []
    for col in range(len(rhs)):
        x = [Fraction(0)] * n
        for k in range(n - 1, -1, -1):
            s = A[k][n + col] - sum(A[k][j] * x[j] for j in range(k + 1, n))
            x[k] = s / A[k][k]
        out.append(x)
    return out


def sign(v):
    return (v > 0) - (v < 0)


def fmt_mse(v):
    """formatMse of src/lib/viz/poly-fit.ts with digits { mse: 4, mseLarge: 2 }."""
    small = f"{v:.4f}"
    return small if float(small) < 10 else f"{v:.2f}"


def main():
    train = read_rows("SINE_TRAIN")
    test = read_rows("SINE_TEST")
    m = len(train)
    n = DEGREE
    assert m == 16 and len(test) == 8, (len(train), len(test))
    x_train = np.array([x for x, _ in train])
    y_train = np.array([y for _, y in train])
    x_test = np.array([x for x, _ in test])
    y_test = np.array([y for _, y in test])

    # Step 1: the features of the pipeline, then exact arithmetic from here on.
    prep = make_pipeline(PolynomialFeatures(DEGREE, include_bias=False), StandardScaler()).fit(x_train[:, None])
    Z = [[Fraction(float(v)) for v in row] for row in prep.transform(x_train[:, None])]
    Zt = [[Fraction(float(v)) for v in row] for row in prep.transform(x_test[:, None])]
    y = [Fraction(float(v)) for v in y_train]
    yt = [Fraction(float(v)) for v in y_test]
    zbar = [sum(Z[i][k] for i in range(m)) / m for k in range(n)]
    ybar = sum(y) / m
    Zc = [[Z[i][k] - zbar[k] for k in range(n)] for i in range(m)]
    yc = [v - ybar for v in y]
    G = [[sum(Zc[i][j] * Zc[i][k] for i in range(m)) for k in range(n)] for j in range(n)]
    c = [sum(Zc[i][j] * yc[i] for i in range(m)) for j in range(n)]
    half_m = Fraction(m, 2)

    def grad(w):
        """g_j = (2/m) z_j^T r, r = yc - Zc w."""
        return [(c[j] - sum(G[j][k] * w[k] for k in range(n))) / half_m for j in range(n)]

    def intercept(w):
        return ybar - sum(zbar[k] * w[k] for k in range(n))

    def mse(rows_z, ys, w):
        b = intercept(w)
        total = Fraction(0)
        for z, target in zip(rows_z, ys):
            e = b + sum(z[k] * w[k] for k in range(n)) - target
            total += e * e
        return total / len(ys)

    def segment(active, signs):
        """w_A(lam) = u - lam v on the active set."""
        sub = [[G[j][k] for k in active] for j in active]
        u, s_solved = solve(sub, [[c[j] for j in active], [Fraction(s) for s in signs]])
        return u, [half_m * v for v in s_solved]

    # Step 2: the homotopy, from lam_max down to below the smallest positive level.
    lambdas = [Fraction(0) if e is None else Fraction(float(f"1e{e}")) for e in EXPONENTS]
    smallest = min(v for v in lambdas if v > 0)
    g0 = [cj / half_m for cj in c]
    first = max(range(n), key=lambda j: abs(g0[j]))
    lam_max = abs(g0[first])
    segments = []  # (upper lam, lower lam, active, signs, u, v)
    active, signs, lam = [first], [sign(g0[first])], lam_max
    while True:
        u, v = segment(active, signs)
        candidates = []  # (lam, kind, j, new sign)
        for pos, j in enumerate(active):
            if v[pos] != 0:
                t = u[pos] / v[pos]
                if 0 < t < lam:
                    candidates.append((t, "drop", j, 0))
        for j in range(n):
            if j in active:
                continue
            # g_j(lam) = alpha + lam beta
            gu = sum(G[j][k] * u[p] for p, k in enumerate(active))
            gv = sum(G[j][k] * v[p] for p, k in enumerate(active))
            alpha = (c[j] - gu) / half_m
            beta = gv / half_m
            for s in (1, -1):
                if 1 - s * beta != 0:
                    t = s * alpha / (1 - s * beta)  # alpha + t beta = s t
                    if 0 < t < lam:
                        candidates.append((t, "add", j, s))
        nxt = max((t for t, *_ in candidates), default=Fraction(0))
        segments.append((lam, nxt, list(active), list(signs), u, v))
        if nxt == 0 or nxt < smallest:
            break
        for t, kind, j, s in candidates:
            if t != nxt:
                continue
            if kind == "drop":
                p = active.index(j)
                del active[p]
                del signs[p]
            else:
                active.append(j)
                signs.append(s)
        assert active, "empty active set below lam_max"
        lam = nxt
    print(f"lam_max = {float(lam_max)!r}; {len(segments) - 1} breakpoints down to {float(segments[-1][1]):.3g}")

    # Steps 3 and 4: Lasso at every level, KKT checked exactly.
    lasso = []
    for e, lam in zip(EXPONENTS, lambdas):
        if lam == 0:
            w = solve(G, [c])[0]
        elif lam >= lam_max:
            w = [Fraction(0)] * n
        else:
            upper, lower, act, sg, u, v = next(s for s in segments if s[1] <= lam <= s[0])
            assert lower < lam < upper, f"level 1e{e} sits on a breakpoint"
            w = [Fraction(0)] * n
            for p, j in enumerate(act):
                w[j] = u[p] - lam * v[p]
            g = grad(w)
            for p, j in enumerate(act):
                assert sign(w[j]) == sg[p], f"KKT, 1e{e}: sign of w_{j + 1}"
                assert g[j] == lam * sg[p], f"KKT, 1e{e}: g_{j + 1} != lam s"
            for j in range(n):
                if j not in act:
                    assert abs(g[j]) <= lam, f"KKT, 1e{e}: |g_{j + 1}| > lam"
        if lam > 0:
            assert all(abs(gj) <= lam for gj in grad(w)), f"KKT, 1e{e}"
            print(f"KKT ok   lambda = 1e{e}")
        lasso.append(w)

    # Step 5: Ridge, exactly.
    ridge = [lasso[0] if lam == 0 else solve([[G[j][k] + (m * lam if j == k else 0) for k in range(n)]
                                              for j in range(n)], [c])[0] for lam in lambdas]

    levels = []
    for e, lam, wl, wr in zip(EXPONENTS, lambdas, lasso, ridge):
        levels.append({
            "lambda": 0.0 if e is None else float(f"1e{e}"),
            "ridge": (float(mse(Z, y, wr)), float(mse(Zt, yt, wr))),
            "lasso": (float(mse(Z, y, wl)), float(mse(Zt, yt, wl)), sum(1 for v in wl if v == 0)),
        })

    # Step 6: scikit-learn agrees on every shown string.
    def sk_check(model, lam, exact, zeros=None):
        pipe = make_pipeline(PolynomialFeatures(DEGREE, include_bias=False), StandardScaler(), model)
        pipe.fit(x_train[:, None], y_train)
        tr = float(np.mean((pipe.predict(x_train[:, None]) - y_train) ** 2))
        te = float(np.mean((pipe.predict(x_test[:, None]) - y_test) ** 2))
        got = (fmt_mse(tr), fmt_mse(te))
        want = (fmt_mse(exact[0]), fmt_mse(exact[1]))
        assert got == want, f"{type(model).__name__}, lambda {lam}: scikit-learn {got}, exact {want}"
        if zeros is not None:
            sk_zeros = int(np.sum(pipe[-1].coef_ == 0))
            assert sk_zeros == zeros, f"Lasso, lambda {lam}: scikit-learn {sk_zeros} zeros, exact {zeros}"

    for e, level in zip(EXPONENTS, levels):
        if e is None:
            continue
        lam = level["lambda"]
        sk_check(Ridge(alpha=m * lam, solver="svd"), lam, level["ridge"])
        if e >= SKLEARN_RIDGE_FROM:
            sk_check(Ridge(alpha=m * lam), lam, level["ridge"])
        if e in SKLEARN_LASSO:
            sk_check(Lasso(alpha=lam / 2, max_iter=100_000, tol=1e-6), lam, level["lasso"][:2], level["lasso"][2])
    print("scikit-learn agrees: Ridge (svd) at every lambda > 0, Ridge (default) from 1e-12, Lasso at 1e-3..1e-1")

    print(f"{'lambda':>8} | ridge train   test  | lasso train   test   zeros")
    for e, level in zip(EXPONENTS, levels):
        r, l = level["ridge"], level["lasso"]
        name = "0" if e is None else f"1e{e}"
        print(f"{name:>8} | {fmt_mse(r[0]):>7} {fmt_mse(r[1]):>7} | {fmt_mse(l[0]):>7} {fmt_mse(l[1]):>7} {l[2]:>3}")

    # The two generated files.
    versions = {"python": sys.version.split()[0], "numpy": np.__version__, "sklearn": sklearn.__version__}
    today = datetime.date.today().isoformat()
    stamp = (f"// Python {versions['python']}, NumPy {versions['numpy']}, scikit-learn {versions['sklearn']}.\n"
             f"// Command: {COMMAND}\n"
             f"// Date: {today}\n")

    def num(v):
        return "0" if v == 0 else repr(float(v))

    def wrap(items, indent, width=120):
        lines, line = [], indent
        for i, item in enumerate(items):
            piece = item + ("," if i < len(items) - 1 else "")
            if line.strip() and len(line) + 1 + len(piece) > width:
                lines.append(line.rstrip())
                line = indent
            line += piece + " "
        lines.append(line.rstrip())
        return "\n".join(lines)

    rows_ts = []
    for e, w in zip(EXPONENTS, lasso):
        name = "λ = 0, least squares" if e is None else f"λ = 1e{e}"
        rows_ts.append(f"  // {name}\n  {{\n    b: {num(intercept(w))},\n    w: [\n{wrap([num(v) for v in w], '      ')}\n    ],\n  }},")
    path_ts = (
        "// src/data/datasets/sine-lasso-path.ts — GENERATED by scripts/sine-lasso-path.py — do not edit by hand.\n"
        + stamp +
        "// Exact Lasso solutions (rational arithmetic, KKT checked) of (1/m) Σ(ŷ − y)² + λ Σ|w_k| for the degree-15\n"
        "// pipeline PolynomialFeatures(15, include_bias=False) + StandardScaler on SINE_TRAIN (viz.md section 10.2.4).\n"
        "// One row per SINE_REGULARIZATION.levels, same order. Row 0 (λ = 0) is plain least squares, shared with Ridge.\n"
        "// Relative imports only.\n"
        "export interface CoefRow {\n"
        "  b: number;\n"
        "  w: readonly number[]; // w[k − 1] is the coefficient of z_k = (x^k − μ_k) / σ_k, k = 1..15; exact zeros are 0\n"
        "}\n\n"
        "export const SINE_LASSO_PATH: readonly CoefRow[] = [\n"
        + "\n".join(rows_ts) + "\n];\n"
    )

    def pairs(rows):
        return wrap([f"[{x!r}, {v!r}]" for x, v in rows], "    ")

    level_ts = []
    for e, level in zip(EXPONENTS, levels):
        r, l = level["ridge"], level["lasso"]
        level_ts.append(
            f"    {{\n      lambda: {num(level['lambda'])},\n"
            f"      ridge: {{ mseTrain: {r[0]!r}, mseTest: {r[1]!r} }},\n"
            f"      lasso: {{ mseTrain: {l[0]!r}, mseTest: {l[1]!r}, zeros: {l[2]} }},\n    }},"
        )
    fixture_ts = (
        "// tests/unit/fixtures/regularization-python.ts — GENERATED by scripts/sine-lasso-path.py — do not edit by hand.\n"
        + stamp +
        "// Exact MSE (rational arithmetic on the features scikit-learn makes, then rounded once to a float) of Ridge and\n"
        "// Lasso at every level of SINE_REGULARIZATION, and the number of Lasso coefficients exactly 0\n"
        "// (docs/architecture/viz.md, sections 10.2.3, 10.2.4, 10.4.1). train and test are copies of the sine rows.\n"
        "export const PYTHON_REGULARIZATION = {\n"
        f"  versions: {{ python: '{versions['python']}', numpy: '{versions['numpy']}', sklearn: '{versions['sklearn']}' }},\n"
        f"  date: '{today}',\n"
        f"  command: '{COMMAND}',\n"
        f"  train: [\n{pairs(train)}\n  ],\n"
        f"  test: [\n{pairs(test)}\n  ],\n"
        f"  lambdaMax: {float(lam_max)!r},\n"
        "  levels: [\n" + "\n".join(level_ts) + "\n  ],\n"
        "} as const;\n"
    )

    for target, content in ((PATH_TS, path_ts), (FIXTURE_TS, fixture_ts)):
        old = target.read_text(encoding="utf-8") if target.exists() else None
        if old is not None and DATE_LINE.sub("", old) == DATE_LINE.sub("", content):
            print(f"unchanged: {target.relative_to(REPO)}")
            continue
        with open(target, "w", encoding="utf-8", newline="\n") as f:
            f.write(content)
        print(f"wrote: {target.relative_to(REPO)}")


if __name__ == "__main__":
    main()
