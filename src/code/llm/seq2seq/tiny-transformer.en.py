# Tiny encoder-decoder Transformer that learns to reverse 6 digits
import torch
from torch import nn

torch.manual_seed(0)
BOS, EOS, L, D = 0, 1, 6, 64  # L: sequence length, D: width
TOK = ["<BOS>", "<EOS>"] + list("0123456789")  # digits get ids 2..11
V = len(TOK)  # vocabulary of 12 tokens
CAUSAL = True  # set to False to try without the decoder mask

def batch(n):
    src = torch.randint(2, V, (n, L))
    tgt = src.flip(1)  # target: the source written backwards
    dec_in = torch.cat([torch.full((n, 1), BOS), tgt], 1)  # shifted right
    dec_out = torch.cat([tgt, torch.full((n, 1), EOS)], 1)  # labels + <EOS>
    return src, dec_in, dec_out

class Seq2Seq(nn.Module):
    def __init__(self):
        super().__init__()
        self.emb, self.pos = nn.Embedding(V, D), nn.Embedding(L + 1, D)
        self.tf = nn.Transformer(D, nhead=4, num_encoder_layers=2,
                                 num_decoder_layers=2, dim_feedforward=128,
                                 dropout=0.0, batch_first=True)
        self.out = nn.Linear(D, V)

    def embed(self, x):  # token embedding plus position embedding
        return self.emb(x) + self.pos(torch.arange(x.size(1)))

    def forward(self, src, dec_in):
        n = dec_in.size(1)
        mask = self.tf.generate_square_subsequent_mask(n) if CAUSAL else None
        h = self.tf(self.embed(src), self.embed(dec_in), tgt_mask=mask,
                    tgt_is_causal=CAUSAL)
        return self.out(h)  # (batch, n, V) logits

model = Seq2Seq()
opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
for step in range(301):  # teacher forcing: feed the true target
    src, dec_in, dec_out = batch(64)
    z = model(src, dec_in).transpose(1, 2)  # cross_entropy: classes in dim 1
    loss = nn.functional.cross_entropy(z, dec_out)
    opt.zero_grad()
    loss.backward()
    opt.step()
    if step % 100 == 0:
        print(f"step {step:3d}  loss {loss.item():.3f}")

model.eval()
with torch.no_grad():
    src, dec_in, dec_out = batch(500)  # 500 new sequences
    forced = (model(src, dec_in).argmax(-1) == dec_out).all(1).float().mean()
    seq = torch.full((500, 1), BOS)  # free-running: feed back its own tokens
    for _ in range(L + 1):
        nxt = model(src, seq)[:, -1].argmax(-1, keepdim=True)  # greedy
        seq = torch.cat([seq, nxt], dim=1)
    free = (seq[:, 1:] == dec_out).all(1).float().mean()
print(f"exact match, teacher forcing: {forced:.3f}  greedy: {free:.3f}")
print("src:", *[TOK[i] for i in src[0].tolist()])
print("out:", *[TOK[i] for i in seq[0, 1:].tolist()])
