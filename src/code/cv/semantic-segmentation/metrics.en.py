import numpy as np

# Ảnh 64x64 có ba lớp: 0 nền, 1 hình tròn, 2 hình vuông nhỏ
H = W = 64
K = 3
yy, xx = np.mgrid[0:H, 0:W]
gt = np.zeros((H, W), dtype=int)  # mask đúng
gt[(yy - 24) ** 2 + (xx - 24) ** 2 <= 15 ** 2] = 1
gt[44:52, 46:54] = 2
print("pixels per class:", np.bincount(gt.ravel()))


def report(name, pred):
    # C[i, j]: số pixel lớp đúng i bị đoán là lớp j (ma trận nhầm lẫn)
    C = np.bincount(K * gt.ravel() + pred.ravel(), minlength=K * K)
    C = C.reshape(K, K)
    tp = np.diag(C)  # phần giao của mask đoán và mask đúng, từng lớp
    iou = tp / (C.sum(0) + C.sum(1) - tp)  # giao / hợp
    acc = tp.sum() / C.sum()  # pixel accuracy
    print(f"{name:9s} acc = {acc:.3f}  IoU = {np.round(iou, 3)}  "
          f"mIoU = {iou.mean():.3f}")


report("all bg", np.zeros_like(gt))
report("no square", np.where(gt == 2, 0, gt))  # bỏ sót cả hình vuông

for s in [4, 8]:  # output stride: bản đồ điểm nhỏ hơn ảnh s lần mỗi chiều
    onehot = np.eye(K)[gt]  # (64, 64, 3)
    # Điểm thô: trung bình one-hot trên từng ô s x s
    coarse = onehot.reshape(H // s, s, W // s, s, K).mean(axis=(1, 3))
    near = coarse.repeat(s, axis=0).repeat(s, axis=1)  # gần nhất
    # Song tuyến tính: vị trí tâm pixel trên lưới thô, nội suy từng trục
    c = (np.arange(H) + 0.5) / s - 0.5
    f = np.floor(c).astype(int)
    i0, i1 = np.clip(f, 0, H // s - 1), np.clip(f + 1, 0, H // s - 1)
    t = (c - f)[:, None, None]
    rows = coarse[i0] * (1 - t) + coarse[i1] * t  # nội suy theo hàng
    bil = rows[:, i0] * (1 - t[:, 0]) + rows[:, i1] * t[:, 0]  # theo cột
    report(f"nearest/{s}", near.argmax(-1))
    report(f"bilin/{s}", bil.argmax(-1))
