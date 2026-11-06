import numpy as np


def iou(box, boxes):
    # box: (4,), boxes: (N, 4) với dạng (x1, y1, x2, y2)
    x1 = np.maximum(box[0], boxes[:, 0])
    y1 = np.maximum(box[1], boxes[:, 1])
    x2 = np.minimum(box[2], boxes[:, 2])
    y2 = np.minimum(box[3], boxes[:, 3])
    inter = np.maximum(0, x2 - x1) * np.maximum(0, y2 - y1)
    area1 = (box[2] - box[0]) * (box[3] - box[1])
    area2 = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
    union = area1 + area2 - inter
    return inter / union


def nms(boxes, scores, threshold):
    # Sắp xếp theo điểm giảm dần
    order = scores.argsort()[::-1]
    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(int(i))
        if order.size == 1:
            break
        # Tính IoU của hộp điểm cao nhất với các hộp còn lại
        ious = iou(boxes[i], boxes[order[1:]])
        # Giữ lại các hộp có IoU nhỏ hơn ngưỡng
        order = order[1:][ious < threshold]
    return keep


# 5 hộp: 3 hộp mèo (0..2), 2 hộp chó (3..4)
boxes = np.array([
    [10, 10, 50, 50],      # hộp 0 (mèo)
    [12, 14, 52, 54],      # hộp 1 (mèo)
    [14, 17, 54, 57],      # hộp 2 (mèo)
    [100, 100, 140, 140],  # hộp 3 (chó)
    [104, 105, 144, 145],  # hộp 4 (chó)
])
scores = np.array([0.90, 0.80, 0.60, 0.85, 0.70])

print("IoU hop 0 voi cac hop 1..4:", np.round(iou(boxes[0], boxes[1:]), 2))
print("IoU hop 3 voi hop 4:       ", np.round(iou(boxes[3], boxes[4:])[0], 2))
print("NMS voi nguong 0.5:        ", nms(boxes, scores, 0.5))
print("NMS voi nguong 0.7:        ", nms(boxes, scores, 0.7))
