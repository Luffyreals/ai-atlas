# Pick the best span from start/end logits (synthetic) and handle no-answer
import numpy as np

# Passage tokenized by syllable; position 0 is [CLS] (data: vi)
toks = ("[CLS] vịnh hạ long được unesco công nhận là di sản thiên nhiên "
        "thế giới lần đầu năm 1994 và lần thứ hai năm 2000 .").split() #data:vi
L = len(toks)


def logits(peaks, base=-2.0):  # -2 everywhere except a few chosen positions
    z = np.full(L, base)
    for i, v in peaks.items():
        z[i] = v
    return z


def best_span(s, e, max_len=5):
    best, arg = -np.inf, None
    for i in range(1, L):  # skip [CLS] at position 0
        for j in range(i, min(i + max_len, L)):  # i <= j < i + max_len
            if s[i] + e[j] > best:
                best, arg = s[i] + e[j], (i, j)
    return best, arg


a, b = toks.index("1994"), toks.index("2000")  # 18 and 24
# Question 1: "... first inscribed in which year?"
s = logits({a - 1: 2.0, a: 3.9, b: 4.2})
e = logits({a: 4.5, b: 3.0})
i, j = int(np.argmax(s)), int(np.argmax(e))
print(f"argmax separately: start={i} {toks[i]}, end={j} {toks[j]}")
score, (i, j) = best_span(s, e)
span = " ".join(toks[i:j + 1])
print(f"best span: ({i}, {j}) '{span}' {score:.1f}")

# Question 2: "... how many km2 wide?" (not mentioned in the passage)
s = logits({0: 3.0, a: 2.4, b: 2.1})
e = logits({0: 3.2, a: 2.6, b: 1.0})
score, (i, j) = best_span(s, e)
null = s[0] + e[0]  # "no answer" score = the [CLS] span
span = " ".join(toks[i:j + 1])
print(f"best span: '{span}' {score:.1f}, null {null:.1f}")
for tau in [0.0, -1.5]:  # answer when score > null + tau
    print(f"tau={tau}:", span if score > null + tau else "(no answer)")
