# Greedy decoding and beam search on a made-up probability table
import numpy as np

# P[prev][next] = p(next token | previous token), as if the source was read
P = {
    "<s>": {"the": 0.5, "a": 0.4, "<eos>": 0.1},
    "the": {"cat": 0.34, "dog": 0.33, "bird": 0.33},
    "a": {"bird": 0.9, "cat": 0.1},
    "cat": {"<eos>": 1.0},
    "dog": {"<eos>": 1.0},
    "bird": {"<eos>": 0.52, "flies": 0.48},
    "flies": {"<eos>": 1.0},
}


def lp(n, alpha):  # length penalty of Wu et al. (2016)
    return ((5 + n) / 6) ** alpha


def beam_search(width, alpha=0.0, max_len=6):
    beams, done = [(0.0, ["<s>"])], []  # (summed log-probability, tokens)
    for _ in range(max_len):
        cand = [(score + np.log(p), seq + [tok])  # extend by every token
                for score, seq in beams
                for tok, p in P[seq[-1]].items()]
        cand.sort(key=lambda c: -c[0])
        beams = []
        for score, seq in cand[:width]:  # keep only the best width candidates
            (done if seq[-1] == "<eos>" else beams).append((score, seq))
        if not beams:
            break
    # pick by score divided by lp; length n counts <eos>, not <s>
    score, seq = max(done, key=lambda c: c[0] / lp(len(c[1]) - 1, alpha))
    return " ".join(seq[1:-1]), score, score / lp(len(seq) - 1, alpha)


for width, alpha in [(1, 0.0), (2, 0.0), (2, 0.6)]:
    text, score, s = beam_search(width, alpha)
    print(f"B={width} alpha={alpha}: '{text}' p={np.exp(score):.3f} s={s:.3f}")
