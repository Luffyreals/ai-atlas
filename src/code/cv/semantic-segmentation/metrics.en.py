import numpy as np

# 64x64 image with three classes: 0 background, 1 circle, 2 small square
H = W = 64
K = 3
yy, xx = np.mgrid[0:H, 0:W]
gt = np.zeros((H, W), dtype=int)  # ground-truth mask
gt[(yy - 24) ** 2 + (xx - 24) ** 2 <= 15 ** 2] = 1
gt[44:52, 46:54] = 2
print("pixels per class:", np.bincount(gt.ravel()))


def report(name, pred):
    # C[i, j]: pixels of true class i predicted as class j (confusion matrix)
    C = np.bincount(K * gt.ravel() + pred.ravel(), minlength=K * K)
    C = C.reshape(K, K)
    tp = np.diag(C)  # intersection of predicted and true masks, per class
    iou = tp / (C.sum(0) + C.sum(1) - tp)  # intersection / union
    acc = tp.sum() / C.sum()  # pixel accuracy
    print(f"{name:9s} acc = {acc:.3f}  IoU = {np.round(iou, 3)}  "
          f"mIoU = {iou.mean():.3f}")


report("all bg", np.zeros_like(gt))
report("no square", np.where(gt == 2, 0, gt))  # misses the entire square

for s in [4, 8]:  # output stride: score map is s times smaller per side
    onehot = np.eye(K)[gt]  # (64, 64, 3)
    # Coarse scores: average one-hot values over each s x s cell
    coarse = onehot.reshape(H // s, s, W // s, s, K).mean(axis=(1, 3))
    near = coarse.repeat(s, axis=0).repeat(s, axis=1)  # nearest neighbor
    # Bilinear: pixel center positions on the coarse grid, interpolated per axis
    c = (np.arange(H) + 0.5) / s - 0.5
    f = np.floor(c).astype(int)
    i0, i1 = np.clip(f, 0, H // s - 1), np.clip(f + 1, 0, H // s - 1)
    t = (c - f)[:, None, None]
    rows = coarse[i0] * (1 - t) + coarse[i1] * t  # interpolate along rows
    bil = rows[:, i0] * (1 - t[:, 0]) + rows[:, i1] * t[:, 0]  # along cols
    report(f"nearest/{s}", near.argmax(-1))
    report(f"bilin/{s}", bil.argmax(-1))
