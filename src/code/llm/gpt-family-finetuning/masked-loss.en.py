# Loss on the answer only: one batch of three tasks, labels -100
import math

import torch
import torch.nn.functional as F

torch.manual_seed(0)
EOS, V = 256, 257  # each byte (0-255) is a token, plus one EOS token
PAIRS = [  # (prompt, answer): translation, summary, code generation
    ("Translate to French: Good morning.", "Bonjour."),
    ("Summarize: Heavy rain forced this afternoon's match to be delayed.",
     "The match was delayed by rain."),
    ("Write a Python function that returns the square of x.",
     "def sq(x):\n    return x * x"),
]


def encode(prompt, answer):
    p = list((prompt + "\n").encode("utf-8"))
    a = list(answer.encode("utf-8")) + [EOS]  # keep EOS: learn to stop
    return p + a, [-100] * len(p) + a  # prompt labels are -100


rows = [encode(p, a) for p, a in PAIRS]
n = max(len(ids) for ids, _ in rows)
# Pad to the longest sequence: pad token is EOS, pad label is -100
ids = torch.tensor([r + [EOS] * (n - len(r)) for r, _ in rows])
labels = torch.tensor([lb + [-100] * (n - len(lb)) for _, lb in rows])

# Dummy, untrained model: an embedding then one linear layer
model = torch.nn.Sequential(torch.nn.Embedding(V, 32),
                            torch.nn.Linear(32, V))
logits = model(ids)  # (B, n, V)

# Shift by one: the logit at position t predicts the token at t + 1
z = logits[:, :-1].reshape(-1, V)
y = labels[:, 1:].reshape(-1)
keep = y != -100
print(f"shape: {tuple(ids.shape)}")
print(f"counted per row: {keep.view(len(PAIRS), -1).sum(1).tolist()}")
print(f"counted: {keep.sum()} / {y.numel()}")

loss = F.cross_entropy(z, y)  # ignore_index=-100 is the default
by_hand = F.cross_entropy(z[keep], y[keep])  # filter, then average
print(f"loss: {loss:.4f}, by hand: {by_hand:.4f}, ln V: {math.log(V):.4f}")

# Mistake: masking by the pad token id also hides the answer's real EOS
wrong = labels.masked_fill(ids == EOS, -100)[:, 1:].reshape(-1)
print(f"mask by pad id: {(wrong != -100).sum()} counted")
print(f"all -100: {F.cross_entropy(z, torch.full_like(y, -100))}")
