import numpy as np

# Boxes [x1, y1, x2, y2] and detector confidence scores
# 0, 1: two boxes for person A; 2: person B standing next to A; 3: person C
boxes = np.array([[10, 10, 50, 90], [14, 12, 54, 92],
                  [22, 10, 62, 90], [100, 20, 140, 100]], dtype=float)
scores = np.array([0.95, 0.80, 0.90, 0.85])

def box_iou(a, b):
    # Intersection: rightmost left edge to leftmost right edge
    w = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
    h = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = w * h
    area = lambda r: (r[2] - r[0]) * (r[3] - r[1])
    return inter / (area(a) + area(b) - inter)

def nms(thr):
    order = list(np.argsort(-scores))  # highest score first
    keep = []
    while order:
        i = order.pop(0)
        keep.append(int(i))
        # drop remaining boxes that overlap the kept box above the threshold
        order = [j for j in order if box_iou(boxes[i], boxes[j]) <= thr]
    return sorted(keep)

M = np.array([[box_iou(a, b) for b in boxes] for a in boxes])
print(np.round(M, 2))
for thr in (0.5, 0.6, 0.8):
    print(f"thr={thr}: keep {nms(thr)}")
