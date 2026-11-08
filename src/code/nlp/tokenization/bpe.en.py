# Toy BPE: learn merge rules from a frequency dictionary of syllables
from collections import Counter

# Syllables and their counts (same data as BpeMergeViz; data: vi)
WORDS = {"người": 8, "ngành": 3, "nghề": 4, "trường": 6,  # data: vi
         "đường": 5, "thương": 3, "nhà": 7}  # data: vi
END = "_"  # end-of-syllable marker


def merge(symbols, pair):
    # Replace every adjacent occurrence of pair with a single merged symbol.
    out, i = [], 0
    while i < len(symbols):
        if tuple(symbols[i:i + 2]) == pair:
            out.append(pair[0] + pair[1])
            i += 2
        else:
            out.append(symbols[i])
            i += 1
    return out


# Start with each syllable split into characters plus the end marker
corpus = {w: list(w) + [END] for w in WORDS}
vocab = {s for syms in corpus.values() for s in syms}
print("start vocab:", len(vocab))
merges = []
for step in range(1, 13):
    pairs = Counter()  # count adjacent pairs, weighted by syllable frequency
    for w, syms in corpus.items():
        for pair in zip(syms, syms[1:]):
            pairs[pair] += WORDS[w]
    best = max(pairs, key=pairs.get)  # ties go to the pair seen first
    merges.append(best)
    corpus = {w: merge(syms, best) for w, syms in corpus.items()}
    print(f"{step:2d}: {best[0]} + {best[1]} ({pairs[best]})")
print("end vocab:", len(vocab) + len(merges))

# Segment syllables by replaying the learned merges in order
for w in ["trường", "thương", "nhường", "nghiêng"]:  # data: vi
    syms = list(w) + [END]
    for pair in merges:
        syms = merge(syms, pair)
    print(w, "->", syms)
