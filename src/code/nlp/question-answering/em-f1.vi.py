# EM và F1 mức token: chuẩn hóa của SQuAD, và bản cho tiếng Việt
import re
import string
from collections import Counter


def normalize(s, en=True):
    s = s.lower()  # chữ thường
    s = "".join(ch for ch in s if ch not in string.punctuation)  # bỏ dấu câu
    if en:  # bỏ mạo từ tiếng Anh; chấm tiếng Việt thì KHÔNG làm bước này
        s = re.sub(r"\b(a|an|the)\b", " ", s)
    return " ".join(s.split())  # gộp khoảng trắng


def em(pred, gold, en=True):
    return float(normalize(pred, en) == normalize(gold, en))


def f1(pred, gold, en=True):
    p, g = normalize(pred, en).split(), normalize(gold, en).split()
    if not p or not g:  # ca không có đáp án: chỉ đúng khi cả hai rỗng
        return float(p == g)
    common = sum((Counter(p) & Counter(g)).values())  # số token chung
    if common == 0:
        return 0.0
    prec, rec = common / len(p), common / len(g)
    return 2 * prec * rec / (prec + rec)


cases = [  # (dự đoán, các đáp án mẫu, có bỏ mạo từ tiếng Anh không)
    ("1994.", ["1994"], False),
    ("năm 1994", ["1994"], False),
    ("năm 1994", ["1994", "năm 1994"], False),
    ("2000", ["1994"], False),
    ("The Eiffel Tower", ["Eiffel Tower"], True),
    ("vịnh Hạ Long ở Quảng Ninh", ["Quảng Ninh"], False),
    ("", [""], False),
    ("Long", ["Long An"], True),  # script SQuAD nguyên bản: "an" bị bỏ
    ("Long", ["Long An"], False),  # bản tiếng Việt
]
for pred, golds, en in cases:  # lấy điểm cao nhất trên các đáp án mẫu
    e = max(em(pred, g, en) for g in golds)
    f = max(f1(pred, g, en) for g in golds)
    print(f"{pred!r:28} en={en!s:5} EM={e:.0f}  F1={f:.3f}")
