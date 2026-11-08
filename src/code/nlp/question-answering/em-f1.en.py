# EM and token-level F1: SQuAD normalization and its Vietnamese variant
import re
import string
from collections import Counter


def normalize(s, en=True):
    s = s.lower()  # lowercase
    s = "".join(ch for ch in s if ch not in string.punctuation)  # drop punct
    if en:  # drop English articles; do NOT run this step on Vietnamese
        s = re.sub(r"\b(a|an|the)\b", " ", s)
    return " ".join(s.split())  # collapse whitespace


def em(pred, gold, en=True):
    return float(normalize(pred, en) == normalize(gold, en))


def f1(pred, gold, en=True):
    p, g = normalize(pred, en).split(), normalize(gold, en).split()
    if not p or not g:  # no-answer case: 1 only when both are empty
        return float(p == g)
    common = sum((Counter(p) & Counter(g)).values())  # shared tokens
    if common == 0:
        return 0.0
    prec, rec = common / len(p), common / len(g)
    return 2 * prec * rec / (prec + rec)


cases = [  # (prediction, gold answers, drop English articles?)
    ("1994.", ["1994"], False),
    ("năm 1994", ["1994"], False),  # data: vi
    ("năm 1994", ["1994", "năm 1994"], False),  # data: vi
    ("2000", ["1994"], False),
    ("The Eiffel Tower", ["Eiffel Tower"], True),
    ("vịnh Hạ Long ở Quảng Ninh", ["Quảng Ninh"], False),  # data: vi
    ("", [""], False),
    ("Long", ["Long An"], True),  # original SQuAD script: drops "an"
    ("Long", ["Long An"], False),  # Vietnamese variant
]
for pred, golds, en in cases:  # take the max score over gold answers
    e = max(em(pred, g, en) for g in golds)
    f = max(f1(pred, g, en) for g in golds)
    print(f"{pred!r:28} en={en!s:5} EM={e:.0f}  F1={f:.3f}")
