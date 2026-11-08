# FastText-style character n-grams and a vector for an unseen word
import numpy as np


def ngrams(word, nmin=3, nmax=6):
    w = "<" + word + ">"  # mark start and end of word
    return [w[i:i + n] for n in range(nmin, nmax + 1)
            for i in range(len(w) - n + 1)]


def fnv1a(s):  # 32-bit FNV-1a hash (FastText uses a variant)
    h = 2166136261
    for b in s.encode("utf-8"):
        h = ((h ^ b) * 16777619) % 2**32
    return h


print(ngrams("nhà"))  # data: vi
print(len(ngrams("nhà_văn")), "n-grams for nhà_văn")  # data: vi

# N-gram vector table: RANDOM numbers, only to show composition
BUCKET, d = 10_000, 300
Z = np.random.default_rng(0).normal(size=(BUCKET, d))


def vec(word):  # word vector = sum of its n-gram vectors
    return sum(Z[fnv1a(g) % BUCKET] for g in ngrams(word))


def cos(u, v):
    return u @ v / (np.linalg.norm(u) * np.linalg.norm(v))


new = "nhà_văn"  # data: vi; unseen word not in the training set
for w in ["nhà_thơ", "nhà_báo", "văn_học", "con_mèo"]:  # data: vi
    shared = len(set(ngrams(new)) & set(ngrams(w)))
    print(f"{w:8s} shared {shared:2d}  cos {cos(vec(new), vec(w)):.2f}")
