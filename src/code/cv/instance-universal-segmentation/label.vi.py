import numpy as np
from scipy import ndimage

# Ảnh 20 x 32 có ba đồng xu cùng một lớp; xu B và xu C chạm nhau
yy, xx = np.indices((20, 34))
def disk(cy, cx, r):
    return (yy - cy) ** 2 + (xx - cx) ** 2 <= r ** 2
gt = [disk(6, 5, 4), disk(11, 15, 5), disk(11, 27, 6)]  # 3 mask thật
semantic = gt[0] | gt[1] | gt[2]  # mask semantic: chỉ biết "là xu"

def iou(a, b):
    return (a & b).sum() / (a | b).sum()

def pq(pred):
    # Ghép dự đoán với vật thật khi IoU > 0.5, rồi tính PQ
    M = np.array([[iou(p, g) for g in gt] for p in pred])
    tp = [M[i, j] for i in range(len(pred)) for j in range(3)
          if M[i, j] > 0.5]
    fp, fn = len(pred) - len(tp), 3 - len(tp)
    print("IoU (pred x true):")
    print(np.round(M, 2))
    print(f"TP={len(tp)} FP={fp} FN={fn} "
          f"PQ={sum(tp) / (len(tp) + 0.5 * fp + 0.5 * fn):.3f}")

# Cách 1: mỗi vùng liền nhau là một vật
labels, n = ndimage.label(semantic)
print(f"components: {n}")
pq([labels == k for k in range(1, n + 1)])

# Cách 2: co mask để tách chỗ chạm, đánh số, rồi trả mỗi pixel
# về hạt giống gần nhất (một dạng watershed rất thô)
seeds, n2 = ndimage.label(ndimage.binary_erosion(semantic, iterations=1))
_, (iy, ix) = ndimage.distance_transform_edt(seeds == 0,
                                             return_indices=True)
labels2 = seeds[iy, ix] * semantic
print(f"components after erosion: {n2}")
pq([labels2 == k for k in range(1, n2 + 1)])
