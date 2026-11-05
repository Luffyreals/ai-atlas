// Output of the Python cell src/code/nlp/tokenization/bpe.vi.py for BpeMergeViz (docs/architecture/viz/bpe-merge.md),
// copied verbatim. Run 05/11/2026 in Pyodide 314.0.7 under Node (Python 3.14.2, the version the page runs),
// `pyodide.runPythonAsync(<file>)` with the stdout lines collected. The cell uses the standard library only.
// If BPE_SYLLABLES or the cell change, run the cell again and paste the new output here.
export const PYTHON_BPE_OUTPUT = `start vocab: 13
 1: n + g (29)
 2: ư + ờ (19)
 3: ng + _ (14)
 4: ườ + ng_ (11)
 5: n + h (10)
 6: ng + ườ (8)
 7: ngườ + i (8)
 8: người + _ (8)
 9: nh + à (7)
10: nhà + _ (7)
11: t + r (6)
12: tr + ường_ (6)
end vocab: 25
trường -> ['trường_']
thương -> ['t', 'h', 'ư', 'ơ', 'ng_']
nhường -> ['nh', 'ường_']
nghiêng -> ['ng', 'h', 'i', 'ê', 'ng_']`;
