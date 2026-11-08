# Exact dedup, then near-duplicates (MinHash + LSH), on 5 handmade lines
import hashlib
import re
import unicodedata
import numpy as np

docs = ["Hanoi is the capital of Vietnam, a city over a thousand years old.",
        "Hanoi is the capital of Vietnam, an old city over 1000 years old.",
        "Pho is a famous traditional noodle soup of Vietnam.",
        "Buy now at cheap prices, click here to get free gifts today!"]
# Line 1: a copy of line 0, but upper case, decomposed (NFD), extra spaces
docs.insert(1, "  " + unicodedata.normalize("NFD", docs[0]).upper())
words = [re.findall(r"\w+", unicodedata.normalize("NFC", d).lower())
         for d in docs]  # NFC, lower case, drop punctuation, split words

# 1) Exact: SHA-256 of the normalised text; drop it if the hash was seen
keys = [hashlib.sha256(" ".join(w).encode()).digest() for w in words]
keep = [i for i, k in enumerate(keys) if k not in keys[:i]]
print("raw equal:", docs[0] == docs[1], "| after exact:", keep)


def h(k, s):  # k-th hash function: first 60 bits of SHA-1 (not hash())
    return int(hashlib.sha1(f"{k}|{s}".encode()).hexdigest()[:15], 16)


# 2) MinHash: shingles are word pairs; signature of K numbers, r per band
K, r = 64, 4
sh = {i: set(zip(words[i], words[i][1:])) for i in keep}
sig = {i: np.array([min(h(k, s) for s in sh[i]) for k in range(K)])
       for i in keep}
for x, y in [(x, y) for x in keep for y in keep if x < y]:
    J = len(sh[x] & sh[y]) / len(sh[x] | sh[y])
    same = sig[x] == sig[y]  # K true/false values
    cand = same.reshape(-1, r).all(axis=1).any()  # one whole band matches
    print(f"{x}-{y}: J = {J:.2f}, MinHash = {same.mean():.2f}, cand = {cand}")
