"""Exact gradient-descent paths of GradientDescentViz on the apartment table.

docs/architecture/viz/gradient-descent.md, sections 12.2 and 12.6 task D0. Writes one GENERATED file:
  tests/unit/fixtures/gradient-descent-python.ts   PYTHON_GRADIENT_DESCENT

Run by hand with the venv of viz/README.md section 2.5 (the versions Pyodide 314.0.7 ships: Python 3.14.5, NumPy 2.4.6),
from an empty folder outside the repo, so nothing local shadows a module:
  cd <an empty folder>
  C:/Users/Dell/.venvs/ai-atlas-py314/Scripts/python.exe -I "<repo>/scripts/gradient-descent-fixture.py"
Never run in the build or in CI. Run it again when APARTMENTS.rows or APARTMENTS_GD change, or when Pyodide is
upgraded. A file whose content is the same apart from its date line is left untouched, so a rerun on unchanged data
gives an empty git diff.

Model (the lesson ml/gradient-descent, decision 55): x~ = (x - 25) / 60 (min-max), y raw, y_hat = w~ x~ + b~,
L = (1/m) sum (y_hat - y)^2, grad = (2/m) X^T (X theta - y), theta <- theta - eta grad, from (0, 0).
  1. x~ as NumPy makes it, (area - area.min()) / (area.max() - area.min()); asserted equal bit for bit to
     (a - 25) / 60, the one division src/lib/viz/gradient-descent.ts does. eta and y are the same doubles as in TS.
  2. From there everything is exact (fractions.Fraction, no limit_denominator): the least-squares point, its MSE,
     the Hessian H = (2/m) [sum x~^2, sum x~; sum x~, m], every point and MSE of every path. Each exact number is
     rounded once to a double when written.
  3. L and mu, the eigenvalues of H, to 50 digits (decimal), then rounded once.
  4. A path stops after MAX_STEPS steps, or at the first point outside the box (exitStep). reachStep is the first
     step with MSE <= REACH_RATIO * least MSE, REACH_RATIO the double 1.01 as in TS.
  5. Cross-check, warnings as errors: the same paths in NumPy (theta -= eta * (2/m) * X.T @ (X @ theta - y)) and
     np.linalg.eigvalsh(H): relative error below 1e-12, and the same strings at every step (MSE by formatMse,
     w~ and b~ with 2 decimals, w with 4, b with 2), the same reachStep and exitStep.
"""

import datetime
import re
import sys
import warnings
from decimal import Decimal, getcontext
from fractions import Fraction
from pathlib import Path

import numpy as np

warnings.simplefilter("error")

REPO = Path(__file__).resolve().parent.parent
APARTMENTS_TS = REPO / "src" / "data" / "datasets" / "apartments.ts"
FIXTURE_TS = REPO / "tests" / "unit" / "fixtures" / "gradient-descent-python.ts"
COMMAND = "python -I scripts/gradient-descent-fixture.py (venv of docs/architecture/viz/README.md section 2.5, from an empty folder)"

# Same as APARTMENTS_GD in apartments.ts (tests/unit/viz/gradient-descent-apartments.test.ts compares them).
LEVELS = [0.05, 0.3, 0.7, 0.8, 0.85]
START = (0, 0)
MAX_STEPS = 100
W_BOX = (-10, 22)
B_BOX = (-4, 20)
REACH_RATIO = 1.01
DIGITS = {"params": 2, "w": 4, "b": 2, "mse": 4, "mseLarge": 2}
DATE_LINE = re.compile(r"^(// Date: |  date: ').*$", re.M)  # ignored when deciding whether a file changed


def read_rows():
    """The rows of APARTMENTS in apartments.ts: the one copy of the data."""
    text = APARTMENTS_TS.read_text(encoding="utf-8")
    block = re.search(r"export const APARTMENTS = \{.*?rows: \[(.*?)\],\n\} as const", text, re.S)
    if block is None:
        sys.exit(f"cannot find the rows of APARTMENTS in {APARTMENTS_TS}")
    pairs = re.findall(r"\[(-?[\d.]+), (-?[\d.]+)\]", block.group(1))
    return [(float(x), float(y)) for x, y in pairs]


def fixed(v, digits):
    """formatNumber of src/lib/viz/format.ts: toFixed, U+2212 for negatives, never a negative zero."""
    text = f"{abs(v):.{digits}f}"
    return "\u2212" + text if v < 0 and float(text) != 0 else text


def fmt_mse(v):
    """formatMse of src/lib/viz/poly-fit.ts with digits { mse: 4, mseLarge: 2 }."""
    small = fixed(v, DIGITS["mse"])
    return small if float(small) < 10 else fixed(v, DIGITS["mseLarge"])


def shown(w, b, mn, rng, mse):
    """The strings of one step: MSE, w~, b~, then w and b of y_hat = w x + b on raw x."""
    wo = w / rng
    bo = b - wo * mn
    return (fmt_mse(mse), fixed(w, DIGITS["params"]), fixed(b, DIGITS["params"]), fixed(wo, DIGITS["w"]),
            fixed(bo, DIGITS["b"]))


def in_box(w, b):
    return W_BOX[0] <= w <= W_BOX[1] and B_BOX[0] <= b <= B_BOX[1]


def main():
    sys.stdout.reconfigure(encoding="utf-8")  # the table below prints U+2212; a Windows console defaults to cp1252
    rows = read_rows()
    m = len(rows)
    assert m == 10, m
    area = np.array([x for x, _ in rows])
    rent = np.array([y for _, y in rows])

    # Step 1: the scaled feature, NumPy against the TS formula.
    mn, mx = float(area.min()), float(area.max())
    rng = mx - mn
    assert (mn, rng) == (25.0, 60.0), (mn, rng)
    xs_np = (area - area.min()) / (area.max() - area.min())
    xs = [(a - mn) / rng for a, _ in rows]
    assert [float(v) for v in xs_np] == xs, "min-max scaling: NumPy and (x - min) / range differ"

    # Step 2: exact arithmetic from here on.
    X = [Fraction(v) for v in xs]
    Y = [Fraction(y) for _, y in rows]
    MN, RNG = Fraction(mn), Fraction(rng)

    def mse(w, b):
        return sum((w * x + b - y) ** 2 for x, y in zip(X, Y)) / m

    Sxx = sum(x * x for x in X)
    Sx = sum(X)
    Sy = sum(Y)
    Sxy = sum(x * y for x, y in zip(X, Y))
    w_best = (m * Sxy - Sx * Sy) / (m * Sxx - Sx * Sx)
    b_best = (Sy - w_best * Sx) / m
    best = mse(w_best, b_best)
    w_best_orig = w_best / RNG
    b_best_orig = b_best - w_best_orig * MN

    h11, h12, h22 = 2 * Sxx / m, 2 * Sx / m, Fraction(2)
    target = Fraction(REACH_RATIO) * best
    two_over_m = Fraction(2, m)

    def path(eta):
        eta = Fraction(eta)
        w, b = Fraction(START[0]), Fraction(START[1])
        points = [(w, b)]
        exit_step = None if in_box(w, b) else 0
        k = 0
        while k < MAX_STEPS and exit_step is None:
            k += 1
            r = [w * x + b - y for x, y in zip(X, Y)]
            w, b = w - eta * two_over_m * sum(x * e for x, e in zip(X, r)), b - eta * two_over_m * sum(r)
            points.append((w, b))
            if not in_box(w, b):
                exit_step = k
        losses = [mse(w, b) for w, b in points]
        reach = next((i for i, v in enumerate(losses) if v <= target), None)
        return points, losses, reach, exit_step

    # Step 3: eigenvalues of H to 50 digits.
    getcontext().prec = 50

    def dec(q):
        return Decimal(q.numerator) / Decimal(q.denominator)

    half = dec((h11 - h22) / 2)
    disc = (half * half + dec(h12) * dec(h12)).sqrt()
    mean = dec((h11 + h22) / 2)
    L, mu = mean + disc, mean - disc

    # Step 5: NumPy.
    Xm = np.column_stack([xs_np, np.ones(m)])
    eig = np.linalg.eigvalsh(np.array([[float(h11), float(h12)], [float(h12), float(h22)]]))
    assert abs(eig[1] - float(L)) <= 1e-12 * float(L) and abs(eig[0] - float(mu)) <= 1e-12 * float(L), (eig, L, mu)

    def numpy_path(eta, steps):
        theta = np.array([float(START[0]), float(START[1])])
        out = [theta.copy()]
        for _ in range(steps):
            theta = theta - eta * (2 / m) * (Xm.T @ (Xm @ theta - rent))
            out.append(theta.copy())
        return [(float(t[0]), float(t[1]), float(np.mean((Xm @ t - rent) ** 2))) for t in out]

    levels = []
    worst_rel = 0.0
    worst_margin = float("inf")
    strings = 0
    for eta in LEVELS:
        points, losses, reach, exit_step = path(eta)
        steps = len(points) - 1
        approx = numpy_path(eta, steps)
        for k, ((w, b), loss, (wn, bn, ln)) in enumerate(zip(points, losses, approx)):
            for exact, got in ((w, wn), (b, bn), (loss, ln)):
                rel = abs(float(exact) - got) / max(1.0, abs(float(exact)))
                worst_rel = max(worst_rel, rel)
                assert rel < 1e-12, f"eta {eta}, step {k}: NumPy {got}, exact {float(exact)}"
            want = shown(w, b, MN, RNG, loss)
            got = shown(Fraction(wn), Fraction(bn), MN, RNG, Fraction(ln))
            assert want == got, f"eta {eta}, step {k}: NumPy shows {got}, exact {want}"
            strings += len(want)
            # How far the MSE is from the 1 % mark, relative: rounding can never move a step across it.
            worst_margin = min(worst_margin, float(abs(loss - target) / target))
        np_reach = next((i for i, (_, _, v) in enumerate(approx) if v <= REACH_RATIO * float(best)), None)
        np_exit = next((i for i, (w, b, _) in enumerate(approx) if not in_box(w, b)), None)
        assert (np_reach, np_exit) == (reach, exit_step), (eta, np_reach, np_exit, reach, exit_step)
        levels.append({"eta": eta, "points": points, "losses": losses, "reach": reach, "exit": exit_step})

    print(f"x~ bit-equal to NumPy's min-max scaling; min {mn}, range {rng}")
    print(f"best: w~ {float(w_best)!r}, b~ {float(b_best)!r}, MSE {float(best)!r}; "
          f"w {float(w_best_orig)!r}, b {float(b_best_orig)!r}")
    print(f"H = [{float(h11)!r}, {float(h12)!r}; {float(h12)!r}, 2]; L {float(L)!r}, mu {float(mu)!r}, "
          f"2/L {float(2 / L)!r}, 1/L {float(1 / L)!r}, kappa {float(L / mu)!r}")
    print(f"NumPy agrees: worst relative error {worst_rel:.2e}, {strings} strings equal; "
          f"closest MSE to the 1 % mark: {worst_margin:.2e} (relative)")
    print(f"{'eta':>5} | steps reach exit | MSE at 1..5 | end: MSE, (w~, b~), w, b")
    for level in levels:
        ls = level["losses"]
        w, b = level["points"][-1]
        s = shown(w, b, MN, RNG, ls[-1])
        print(f"{level['eta']:>5} | {len(ls) - 1:>5} {str(level['reach']):>5} {str(level['exit']):>4} | "
              f"{', '.join(fmt_mse(float(v)) for v in ls[1:6])} | {s[0]}, ({s[1]}, {s[2]}), {s[3]}, {s[4]}")

    # The generated file.
    versions = {"python": sys.version.split()[0], "numpy": np.__version__}
    today = datetime.date.today().isoformat()

    def num(v):
        f = float(v)
        return "0" if f == 0 else repr(f)

    def opt(v):
        return "null" if v is None else str(v)

    level_ts = []
    for level in levels:
        steps = []
        for (w, b), loss in zip(level["points"], level["losses"]):
            wo = w / RNG
            steps.append(f"        [{num(w)}, {num(b)}, {num(wo)}, {num(b - wo * MN)}, {num(loss)}],")
        (we, be), le = level["points"][-1], level["losses"][-1]
        wo = we / RNG
        level_ts.append(
            f"    {{\n      eta: {level['eta']!r},\n"
            f"      reachStep: {opt(level['reach'])},\n"
            f"      exitStep: {opt(level['exit'])},\n"
            f"      end: {{ step: {len(level['points']) - 1}, w: {num(we)}, b: {num(be)}, wOriginal: {num(wo)}, "
            f"bOriginal: {num(be - wo * MN)}, mse: {num(le)} }},\n"
            "      // [w~, b~, w, b, MSE] at steps 0, 1, 2, …\n"
            "      steps: [\n" + "\n".join(steps) + "\n      ],\n    },"
        )
    rows_ts = "\n".join(f"    [{x:g}, {y!r}]," for x, y in rows)
    fixture_ts = (
        "// tests/unit/fixtures/gradient-descent-python.ts — GENERATED by scripts/gradient-descent-fixture.py — "
        "do not edit by hand.\n"
        f"// Python {versions['python']}, NumPy {versions['numpy']}.\n"
        f"// Command: {COMMAND}\n"
        f"// Date: {today}\n"
        "// Exact numbers (rational arithmetic on x~ = (x - 25) / 60 as NumPy makes it, each rounded once to a double)\n"
        "// of GradientDescentViz (docs/architecture/viz/gradient-descent.md, sections 12.2, 12.6 task D0): the least-squares point on\n"
        "// x~ and in raw units, the Hessian and its eigenvalues L, mu, and the gradient-descent path of every level of\n"
        "// APARTMENTS_GD from (0, 0): every step until maxSteps or the first one outside the box. NumPy agreed on\n"
        "// every shown string when this was written. rows is a copy of APARTMENTS.rows.\n"
        "export interface PythonGdLevel {\n"
        "  eta: number;\n"
        "  reachStep: number | null; // first step with MSE <= 1.01 * best.mse\n"
        "  exitStep: number | null; // first step outside wBox x bBox\n"
        "  end: { step: number; w: number; b: number; wOriginal: number; bOriginal: number; mse: number };\n"
        "  steps: readonly (readonly [w: number, b: number, wOriginal: number, bOriginal: number, mse: number])[];\n"
        "}\n\n"
        "export const PYTHON_GRADIENT_DESCENT: {\n"
        "  versions: { python: string; numpy: string };\n"
        "  date: string;\n"
        "  command: string;\n"
        "  rows: readonly (readonly [number, number])[];\n"
        "  scale: { min: number; range: number };\n"
        "  start: { w: number; b: number };\n"
        "  maxSteps: number;\n"
        "  wBox: readonly [number, number];\n"
        "  bBox: readonly [number, number];\n"
        "  best: { w: number; b: number; mse: number; wOriginal: number; bOriginal: number };\n"
        "  hessian: { h11: number; h12: number; h22: number; L: number; mu: number };\n"
        "  levels: readonly PythonGdLevel[];\n"
        "} = {\n"
        f"  versions: {{ python: '{versions['python']}', numpy: '{versions['numpy']}' }},\n"
        f"  date: '{today}',\n"
        f"  command: '{COMMAND}',\n"
        f"  rows: [\n{rows_ts}\n  ],\n"
        f"  scale: {{ min: {mn:g}, range: {rng:g} }},\n"
        f"  start: {{ w: {START[0]}, b: {START[1]} }},\n"
        f"  maxSteps: {MAX_STEPS},\n"
        f"  wBox: [{W_BOX[0]}, {W_BOX[1]}],\n"
        f"  bBox: [{B_BOX[0]}, {B_BOX[1]}],\n"
        f"  best: {{ w: {num(w_best)}, b: {num(b_best)}, mse: {num(best)}, wOriginal: {num(w_best_orig)}, "
        f"bOriginal: {num(b_best_orig)} }},\n"
        f"  hessian: {{ h11: {num(h11)}, h12: {num(h12)}, h22: {num(h22)}, L: {float(L)!r}, mu: {float(mu)!r} }},\n"
        "  levels: [\n" + "\n".join(level_ts) + "\n  ],\n"
        "};\n"
    )

    old = FIXTURE_TS.read_text(encoding="utf-8") if FIXTURE_TS.exists() else None
    if old is not None and DATE_LINE.sub("", old) == DATE_LINE.sub("", fixture_ts):
        print(f"unchanged: {FIXTURE_TS.relative_to(REPO)}")
        return
    with open(FIXTURE_TS, "w", encoding="utf-8", newline="\n") as f:
        f.write(fixture_ts)
    print(f"wrote: {FIXTURE_TS.relative_to(REPO)}")


if __name__ == "__main__":
    main()
