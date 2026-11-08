# Packing: join documents, insert EOS, cut into L-token sequences, then mask
import numpy as np

docs = ["hanoi is the capital of vietnam a city over a thousand years old",
        "pho is a famous traditional noodle soup of vietnam",
        "buy now at cheap prices click here to get free gifts today"]
L = 12
toks = [d.split() + ["<eos>"] for d in docs]  # each word is one token
print("lengths:", [len(t) for t in toks])

# Option 1, padding: cut each document alone, pad the last chunk to L
chunks = sum(-(-len(t) // L) for t in toks)  # divide and round up
pad = chunks * L - sum(len(t) for t in toks)
print(f"padding: {chunks} sequences, {pad} pad tokens")

# Option 2, packing: join all documents into one stream, cut every L tokens
stream = [w for t in toks for w in t]
n = len(stream) // L
print(f"packing: {n} sequences, {len(stream) - n * L} tokens left over")
seq = np.array(stream[L:2 * L])  # second sequence: has a document boundary
eos = seq == "<eos>"
doc = np.cumsum(eos) - eos  # document index, goes up after each EOS
print(seq, doc, sep="\n")

causal = np.tril(np.ones((L, L), dtype=bool))  # causal mask
mask = causal & (doc[:, None] == doc[None, :])  # plus: same document
print(f"visible cells: causal = {causal.sum()}, per-doc = {mask.sum()}")
print(mask[4].astype(int))  # row 4, first token of doc 1: sees itself
