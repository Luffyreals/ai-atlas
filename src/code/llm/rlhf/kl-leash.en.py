# The KL leash: the optimal policy of E[r] - beta * KL(pi || pi_ref)
import numpy as np

# One prompt, three answers: A curt, B correct and concise, C long, one error
pi_ref = np.array([0.6, 0.3, 0.1])  # probabilities of the SFT model
r = np.array([0.0, 1.0, 3.0])  # reward model scores (likes long answers)
q = np.array([0.0, 1.0, 0.3])  # true quality, unknown in real life
rng = np.random.default_rng(0)
trials = rng.dirichlet(np.ones(3), size=20000)  # random distributions


def kl(p):
    return np.sum(p * np.log(p / pi_ref), axis=-1)


def row(label, p):
    cols = list(p) + [kl(p), p @ r, p @ q]
    print(f"{label:>4} " + " ".join(f"{x:6.3f}" for x in cols))


print("beta   pi(A)  pi(B)  pi(C)     KL   E[r]   E[q]")
row("ref", pi_ref)
for beta in (10, 3, 1.5, 1, 0.5, 0.3):
    # optimal solution: pi_ref times e^(r/beta), then normalise to sum to 1
    pi = pi_ref * np.exp(r / beta)
    pi /= pi.sum()
    best = pi @ r - beta * kl(pi)
    # check: no random distribution has a larger objective
    assert np.all(trials @ r - beta * kl(trials) <= best + 1e-12)
    row(beta, pi)
