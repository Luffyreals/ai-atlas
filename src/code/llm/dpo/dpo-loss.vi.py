# Hàm mất mát DPO trên bốn cặp ưa thích giả lập
import numpy as np

# ln pi(y | x) của cả câu = tổng log-prob các token (số giả lập).
# w: câu được chọn, l: câu bị loại. Mỗi vị trí là một cặp.
# Chính sách đang học:
logp_w = np.array([-38.0, -55.0, -47.0, -60.0])
logp_l = np.array([-44.0, -50.0, -48.0, -58.0])
# Mô hình tham chiếu (SFT):
ref_logp_w = np.array([-40.0, -52.0, -46.0, -61.0])
ref_logp_l = np.array([-41.0, -49.0, -44.0, -57.0])


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def dpo(beta, logp_w, logp_l, ref_logp_w, ref_logp_l):
    r_w = beta * (logp_w - ref_logp_w)  # phần thưởng ẩn của câu được chọn
    r_l = beta * (logp_l - ref_logp_l)  # phần thưởng ẩn của câu bị loại
    margin = r_w - r_l  # lề, bằng beta * d
    loss = np.logaddexp(0, -margin)  # = -ln sigmoid(lề), tính ổn định
    weight = sigmoid(-margin)  # trọng số của cặp trong gradient
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

# Chính sách trùng tham chiếu: d = 0, loss = ln 2 với mọi beta
loss = dpo(0.5, ref_logp_w, ref_logp_l, ref_logp_w, ref_logp_l)[2]
print("policy = ref:", np.round(loss, 4), f"ln 2 = {np.log(2):.4f}")
