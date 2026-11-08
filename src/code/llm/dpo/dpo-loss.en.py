# DPO loss on four mock preference pairs
import numpy as np

# ln pi(y | x) of entire sequence = sum of token log-probs (mock numbers).
# w: chosen response, l: rejected response. Each index is one pair.
# Policy model being trained:
logp_w = np.array([-38.0, -55.0, -47.0, -60.0])
logp_l = np.array([-44.0, -50.0, -48.0, -58.0])
# Reference model (SFT):
ref_logp_w = np.array([-40.0, -52.0, -46.0, -61.0])
ref_logp_l = np.array([-41.0, -49.0, -44.0, -57.0])


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def dpo(beta, logp_w, logp_l, ref_logp_w, ref_logp_l):
    r_w = beta * (logp_w - ref_logp_w)  # implicit reward of chosen
    r_l = beta * (logp_l - ref_logp_l)  # implicit reward of rejected
    margin = r_w - r_l  # margin, equals beta * d
    loss = np.logaddexp(0, -margin)  # = -ln sigmoid(margin), stable
    weight = sigmoid(-margin)  # weight of the pair in the gradient
    return r_w, r_l, loss, weight


d = (logp_w - ref_logp_w) - (logp_l - ref_logp_l)
print("d =", d)
pairs = (logp_w, logp_l, ref_logp_w, ref_logp_l)
r_w, r_l, loss, weight = dpo(0.1, *pairs)  # beta = 0.1
print("reward chosen  ", np.round(r_w, 2))
print("reward rejected", np.round(r_l, 2))
print("loss   ", np.round(loss, 4))
print("weight ", np.round(weight, 4))
print("accuracy", np.mean(r_w > r_l))

for beta in (0.01, 0.1, 0.5, 1.0):
    loss = dpo(beta, *pairs)[2]
    print(f"beta {beta:<4}: mean loss {loss.mean():.4f}",
          np.round(loss, 3))

# Policy matches reference: d = 0, loss = ln 2 for all beta
loss = dpo(0.5, ref_logp_w, ref_logp_l, ref_logp_w, ref_logp_l)[2]
print("policy = ref:", np.round(loss, 4), f"ln 2 = {np.log(2):.4f}")
