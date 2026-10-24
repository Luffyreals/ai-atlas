# GRPO advantage: normalize the rewards within a group of G answers
import numpy as np


def advantages(r, eps=1e-8):
    r = np.asarray(r, dtype=float)
    # eps avoids dividing by 0 when the whole group ties (not in the paper)
    return (r - r.mean()) / (r.std() + eps)


# G = 8 answers to the same question; 1 is correct, 0 is wrong
group = [1, 0, 0, 1, 0, 0, 0, 1]
a = advantages(group)
print("rewards   :", group)
print("advantages:", np.round(a, 3))
print("mean, std :", round(a.mean(), 6), round(a.std(), 3))

# The rarer a correct answer is in its group, the larger its advantage
for n_ok in (1, 3, 7):
    r = [1] * n_ok + [0] * (8 - n_ok)
    a_ok, a_bad = advantages(r)[[0, -1]]
    print(f"{n_ok} of 8 ok : right {a_ok:+.3f}, wrong {a_bad:+.3f}")

# The whole group ties: no learning signal
print("all wrong :", np.round(advantages([0] * 8), 3))

# Multiply every reward by 10: the advantages stay the same
scaled = advantages([10 * x for x in group])
print("scaled x10 same:", np.allclose(a, scaled))
