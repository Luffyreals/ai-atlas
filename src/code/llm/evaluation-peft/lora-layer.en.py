# A hand-written LoRA layer: freeze W_0, train only A and B
import torch

torch.manual_seed(0)


class LoRALinear(torch.nn.Module):
    def __init__(self, base, r=4, alpha=8):
        super().__init__()
        self.base = base
        self.base.weight.requires_grad_(False)  # freeze W_0
        d_out, d_in = base.weight.shape
        self.A = torch.nn.Parameter(torch.randn(r, d_in) * 0.01)
        self.B = torch.nn.Parameter(torch.zeros(d_out, r))  # B = 0
        self.scale = alpha / r

    def forward(self, x):  # h = W_0 x + (alpha / r) B A x
        return self.base(x) + self.scale * (x @ self.A.T @ self.B.T)

    def merged_weight(self):  # W = W_0 + (alpha / r) B A
        return self.base.weight + self.scale * self.B @ self.A


base = torch.nn.Linear(64, 64, bias=False)
layer = LoRALinear(base)
# Target: W_0 plus a rank-2 update (easy, since r = 4 >= 2)
W_target = base.weight.detach() + 0.1 * torch.randn(64, 2) @ torch.randn(2, 64)
x, x_test = torch.randn(10, 64), torch.randn(200, 64)  # only 10 training rows


def mse(inp):
    return ((layer(inp) - inp @ W_target.T) ** 2).mean()


with torch.no_grad():
    print("same at start:", torch.equal(layer(x), base(x)))
    print(f"test loss before: {mse(x_test):.5f}")

opt = torch.optim.Adam([layer.A, layer.B], lr=1e-2)
for step in range(300):
    loss = mse(x)
    opt.zero_grad()
    loss.backward()
    if step == 0:  # B = 0, so the gradient of A is 0 at the first step
        print("grad A zero:", bool((layer.A.grad == 0).all()),
              "| grad B zero:", bool((layer.B.grad == 0).all()))
    opt.step()
    if step % 100 == 0 or step == 299:
        print(f"step {step}: train loss {loss.item():.5f}")

n_train = sum(p.numel() for p in layer.parameters() if p.requires_grad)
n_all = sum(p.numel() for p in layer.parameters())
print(f"trainable {n_train} of {n_all}")
with torch.no_grad():
    print(f"test loss after: {mse(x_test):.5f}")
    merged = x_test @ layer.merged_weight().T  # merge, then run as a Linear
    print("merge ok:", torch.allclose(merged, layer(x_test), atol=1e-5))
