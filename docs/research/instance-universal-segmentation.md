# Instance và Universal Segmentation: Mask R-CNN, Mask2Former, SAM

Bài: `cv/instance-universal-segmentation` (chỉ bản vi, khoảng 12–13 phút đọc). Bài cần biết trước trong roadmap: `cv/semantic-segmentation` (xuất bản cùng đợt, có link), nên "Nhắc nhanh" 2 câu (quyết định 89). Phát hiện vật thể chưa có bài riêng: bài nhắc hộp bao, IoU hộp, NMS trong một mục ngắn của Lý thuyết. Có hai ô `PythonRunner` (NumPy, SciPy), một ô `LocalCode` (SAM qua `transformers`) và hình `SegmentationTasksFigure` (giữ chỗ) cùng bảng so sánh ba họ.

Ngày tra: **05–06/11/2026**. Cách tra: trang tóm tắt arXiv bằng WebFetch; PDF tải từ arXiv, trích chữ bằng `pdftotext -layout`, đọc các mục ghi bên dưới. Giáo án gốc buổi 5 phần CV: "Instance Segmentation: MaskRCNN; Universal Segmentation with attention: Mask2Former, Mask-DINO, EntitySeg, SAM" (chỉ tham khảo; Mask-DINO và EntitySeg không đưa vào bài để giữ độ dài).

## Nguồn

- **[PAN]** Kirillov, A., He, K., Girshick, R., Rother, C., Dollár, P. (2019). [*Panoptic Segmentation*](https://arxiv.org/abs/1801.00868). arXiv:1801.00868 (v1 3/1/2018, v3 10/4/2019), CVPR 2019. Đã đọc mục 3 (thing, stuff, định dạng bài toán), mục 4 (ghép đoạn ở IoU > 0.5, định lý ghép duy nhất, công thức PQ, tách SQ × RQ, RQ là F1; PQ tính từng lớp rồi lấy trung bình).
- **[MRCNN]** He, K., Gkioxari, G., Dollár, P., Girshick, R. (2017). [*Mask R-CNN*](https://arxiv.org/abs/1703.06870). arXiv:1703.06870 (v1 20/3/2017, v3 24/1/2018), ICCV 2017. Đã đọc tóm tắt (5 fps), mục 3 (đầu mask $Km^2$, sigmoid từng pixel, cross-entropy nhị phân trung bình, chỉ mask của lớp đúng; $L = L_{cls} + L_{box} + L_{mask}$; RoIPool làm tròn $[x/16]$ và làm tròn ranh giới ô; RoIAlign dùng $x/16$, nội suy song tuyến tính tại 4 điểm đặt đều mỗi ô, gộp max hoặc trung bình), bảng 2b (sigmoid 30.3 so với softmax 24.8 AP mask), bảng 2c (RoIPool 26.9, RoIAlign 30.3 AP mask, ResNet-50-C4), mask $28 \times 28$ (hình 4).
- **[FRCNN]** Ren, S., He, K., Girshick, R., Sun, J. (2015). [*Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks*](https://arxiv.org/abs/1506.01497). arXiv:1506.01497. Chỉ dẫn qua [MRCNN]; không đọc lại.
- **[DETR]** Carion, N., Massa, F., Synnaeve, G., Usunier, N., Kirillov, A., Zagoruyko, S. (2020). [*End-to-End Object Detection with Transformers*](https://arxiv.org/abs/2005.12872). arXiv:2005.12872. Đã đọc tóm tắt (dự đoán tập, ghép đôi, bỏ NMS và hộp neo). Số truy vấn 100 xác nhận qua bảng 1 của [M2F] (cột "100 queries" cho DETR).
- **[MF]** Cheng, B., Schwing, A. G., Kirillov, A. (2021). [*Per-Pixel Classification is Not All You Need for Semantic Segmentation*](https://arxiv.org/abs/2107.06278). arXiv:2107.06278, NeurIPS 2021. Đã đọc mục 3 (lớp "no object" $\varnothing$, $K+1$ lớp, ghép đôi như DETR, mask $m_i[h,w] = \text{sigmoid}(E_{mask}[:, i]^\top E_{pixel}[:, h, w])$).
- **[M2F]** Cheng, B., Misra, I., Schwing, A. G., Kirillov, A., Girdhar, R. (2022). [*Masked-attention Mask Transformer for Universal Image Segmentation*](https://arxiv.org/abs/2112.01527). arXiv:2112.01527, CVPR 2022. Đã đọc tóm tắt (57.8 PQ COCO, 50.1 AP COCO, 57.7 mIoU ADE20K), mục 3.2 (công thức (2), (3) của masked attention: 0 trong mask đã cắt ngưỡng 0.5, $-\infty$ ngoài mask; không có hệ số $1/\sqrt{d}$ trong công thức), 3.2.2 (đặc trưng nhiều độ phân giải luân phiên "round robin"), 3.3 (mất mát trên $K = 12544$ điểm lấy mẫu, giảm bộ nhớ huấn luyện 3 lần), bảng 1 (R50: Mask2Former 51.9 PQ sau 50 epoch, MaskFormer 46.5 sau 300 epoch; Swin-L 200 truy vấn cho 57.8), mục 4.6 (vẫn phải huấn luyện riêng từng bài toán).
- **[SAM]** Kirillov, A., Mintun, E., Ravi, N., Mao, H., Rolland, C., Gustafson, L., Xiao, T., Whitehead, S., Berg, A. C., Lo, W.-Y., Dollár, P., Girshick, R. (2023). [*Segment Anything*](https://arxiv.org/abs/2304.02643). arXiv:2304.02643 (v1 5/4/2023), ICCV 2023. Đã đọc mục 3 (ba phần; ViT pre-train MAE; bộ mã hóa ảnh chạy một lần mỗi ảnh; prompt thưa, dày; bộ giải mã attention hai chiều; 50 ms trên CPU trong trình duyệt; 3 mask, chỉ lan truyền ngược mask có mất mát nhỏ nhất; đầu dự đoán IoU), mục 4 (động cơ dữ liệu ba giai đoạn), mục 5 (SA-1B: 11 triệu ảnh, 1.1 tỉ mask), phụ lục A (ảnh $1024 \times 1024$, embedding $64 \times 64$, 256 kênh; đầu IoU học bằng MSE).
- **[SAM2]** Ravi, N. và cộng sự (2024). [*SAM 2: Segment Anything in Images and Videos*](https://arxiv.org/abs/2408.00714). arXiv:2408.00714 (v1 1/8/2024, v2 28/10/2024). Đã đọc tóm tắt và mục 1, 4 (memory attention, memory bank), 5 (SA-V: 35.5 triệu mask, 50.9 nghìn video); "chính xác hơn và nhanh hơn 6 lần SAM trên ảnh" theo tóm tắt.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Hội nghị của [MRCNN], [SAM] | Trang arXiv không ghi hội nghị. ICCV 2017 và ICCV 2023 là hiểu biết chung, chưa mở trang hội nghị. | Bài chỉ ghi arXiv và năm cho hai bài này; [PAN], [MF], [M2F] ghi hội nghị theo trường "comments" của arXiv. |
| "Mỗi lần làm tròn lệch tới nửa ô (8 pixel)" | Tự suy từ phép làm tròn $[x/16]$ của [MRCNN]; bài báo không ghi số pixel. | Ghi trong lời là ví dụ, không gán cho bài báo. |
| Thứ tự 3 mask của SAM | [SAM] không nói thứ tự theo chất lượng; trong lần chạy của bài, mask đầu không phải mask tốt nhất ở hình nào. | Bài chỉ nói "thứ tự cố định, không theo chất lượng; hãy chọn theo `iou_scores`". |
| Số đề xuất của RPN | "Vài trăm tới vài nghìn" là hiểu biết chung về Faster R-CNN, không trích số. | Giữ cách nói ước lượng. |
| SAM 2 trên video | Chỉ đọc tóm tắt và mục kiến trúc; không dùng số benchmark video. | Bài chỉ nêu ý bộ nhớ, SA-V và "6 lần nhanh hơn trên ảnh" theo tóm tắt. |
| Dung lượng RAM của ô SAM | Không đo đỉnh bộ nhớ. Lần chạy đầu lỗi `not enough memory: you tried to allocate 805306368 bytes` khi máy còn khoảng 0.7 GB trống (các agent khác chạy song song). | `hardware` ghi "một khối bộ nhớ khoảng 0.8 GB, hãy để trống vài GB RAM", không ghi con số đỉnh. |

## Ý chính

- Ba bài toán trên cùng ảnh: semantic (pixel → lớp), instance (tập mask có lớp và điểm, chỉ thing), panoptic (pixel → (lớp, mã đối tượng), cả thing lẫn stuff, đoạn không chồng nhau) [PAN].
- PQ: ghép đoạn ở IoU > 0.5 (ghép duy nhất vì đoạn không chồng nhau), $\text{PQ} = \sum_{TP}\text{IoU} / (|TP| + \frac12|FP| + \frac12|FN|) = \text{SQ} \times \text{RQ}$ [PAN].
- Mask R-CNN: Faster R-CNN + đầu mask; RoIAlign thay RoIPool vì làm tròn làm lệch đặc trưng, mask cần chính xác tới pixel [MRCNN].
- Phân loại mask: DETR (truy vấn, ghép đôi, không NMS) → MaskFormer (mask = sigmoid của tích vô hướng embedding truy vấn và embedding pixel) → Mask2Former (masked attention, một kiến trúc cho ba bài toán, vẫn huấn luyện riêng) [DETR, MF, M2F].
- SAM: phân vùng theo gợi ý; bộ mã hóa ảnh nặng một lần, bộ giải mã nhẹ cho mỗi gợi ý; 3 mask và điểm IoU dự đoán cho gợi ý mơ hồ; SA-1B [SAM]. SAM 2: bộ nhớ cho video [SAM2].

## Thuật ngữ đề xuất

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Instance segmentation | Instance segmentation | Giữ, lần đầu ghi "phân vùng từng đối tượng". Tách mỗi vật đếm được thành một mask riêng, kèm lớp và điểm tin cậy |
| Panoptic segmentation | Panoptic segmentation | Giữ, lần đầu ghi "phân vùng toàn cảnh". Mỗi pixel một cặp (lớp, mã đối tượng), gồm cả thing và stuff |
| Thing, stuff | Thing, stuff | Giữ. Thing: lớp đếm được (người, xe); stuff: vùng không đếm được (trời, đường) |
| PQ | Panoptic quality | Giữ viết tắt. Độ đo của panoptic: ghép đoạn ở IoU > 0.5, $\text{PQ} = \text{SQ} \times \text{RQ}$ |
| SQ, RQ | Segmentation quality, recognition quality | Giữ viết tắt. SQ: IoU trung bình của các cặp ghép được; RQ: F1 của việc tìm vật |
| Hộp bao | Bounding box | Dịch, lần đầu kèm tiếng Anh. Hình chữ nhật $[x_1, y_1, x_2, y_2]$ quanh vật |
| Phát hiện vật thể | Object detection | Dịch. Tìm các vật trong ảnh, mỗi vật một hộp bao, lớp và điểm tin cậy |
| NMS | Non-maximum suppression | Giữ viết tắt, lần đầu ghi "triệt tiêu điểm không cực đại". Giữ hộp điểm cao, bỏ các hộp chồng lên nó quá ngưỡng IoU |
| RoI | Region of interest | Giữ viết tắt, lần đầu ghi "vùng quan tâm". Hộp đề xuất mà đặc trưng của nó được lấy ra để phân loại và tô mask |
| RoIAlign, RoIPool | RoIAlign, RoIPool | Giữ. Hai cách lấy đặc trưng cỡ cố định cho một RoI; RoIAlign không làm tròn tọa độ, dùng nội suy song tuyến tính |
| RPN | Region proposal network | Giữ viết tắt, lần đầu ghi "mạng đề xuất vùng". Phần của Faster R-CNN đề xuất các hộp có thể chứa vật |
| Truy vấn vật thể | Object query | Dịch, lần đầu kèm tiếng Anh. Vectơ học được trong DETR, MaskFormer; mỗi truy vấn trả về một vật (hộp hoặc mask) hoặc "không có vật" |
| Ghép đôi | Bipartite matching | Dịch, lần đầu kèm tiếng Anh. Ghép mỗi vật thật với đúng một dự đoán sao cho tổng chi phí nhỏ nhất |
| Phân loại mask | Mask classification | Dịch. Dự đoán một tập mask, mỗi mask một nhãn lớp, thay cho phân loại từng pixel |
| Masked attention | Masked attention | Giữ. Cross-attention chỉ trong vùng mask truy vấn đoán ở lớp trước (ngoài vùng cộng $-\infty$) |
| Phân vùng theo gợi ý | Promptable segmentation | Dịch, lần đầu kèm tiếng Anh. Bài toán của SAM: trả mask cho thứ được chỉ vào bằng điểm, hộp hay mask |
| Điểm gợi ý | Point prompt | Dịch. Tọa độ một điểm người dùng bấm vào vật cần tách |
| Động cơ dữ liệu | Data engine | Dịch, lần đầu kèm tiếng Anh. Vòng lặp mô hình giúp gán nhãn, dữ liệu mới huấn luyện lại mô hình (SAM, SAM 2) |
| Backbone | Backbone | Giữ, lần đầu có thể ghi "mạng xương sống". Mạng trích đặc trưng dùng chung cho các đầu ra |

## Kiểm chứng code

Code của bài do `lesson-writer` chạy ngày 05–06/11/2026, thư mục làm việc ở scratchpad (`.../scratchpad/seg4/`). `.en.py` là bản sao y nguyên của `.vi.py` (chưa dịch).

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `label.vi.py`, `label.en.py` | chạy thật | 2026-11-06 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`), NumPy 2.4.6, SciPy 1.18.0 | Ô `PythonRunner`. Hai bản cho output trùng nhau. Tải gói khoảng 6 giây, chạy khoảng 3 giây (lần đầu tới 9 giây khi máy bận). Cách 1: `components: 2`, IoU hàng 2 là `0.42 0.58`, `TP=2 FP=0 FN=1 PQ=0.633`. Cách 2: `components after erosion: 3`, ma trận hoán vị, `PQ=1.000`. Không có ngẫu nhiên. Khớp lời văn (tính tay $(1 + 113/194)/2.5 = 0.633$). `ast.parse(..., feature_version=(3, 10))` qua; 37 dòng, mọi dòng ≤ 79 ký tự |
| `nms.vi.py`, `nms.en.py` | chạy thật | 2026-11-06 | Như trên, chỉ NumPy | Ô `PythonRunner`. Hai bản trùng output; chạy dưới 1 giây. IoU: 0.78 (0–1), 0.54 (0–2), 0.64 (1–2); `thr=0.5: keep [0, 3]`, `thr=0.6: keep [0, 2, 3]`, `thr=0.8: keep [0, 1, 2, 3]`. Khớp lời văn. `ast.parse` qua; 30 dòng |
| `sam.vi.py`, `sam.en.py` | chạy thật | 2026-11-06 | `.venv-cv`: Python 3.14, torch 2.15.0+cpu, transformers 5.22.1, pillow 13.0.0, `torch.manual_seed(0)`, `-I`, `HF_HOME` ở scratchpad | Ô `LocalCode`, `sampleVaries={false}`. Checkpoint `facebook/sam-vit-base`: `model.safetensors` 374 979 480 byte (khoảng 375 MB). Lần đầu (có tải) khoảng 6 phút và lỗi hết RAM ở bộ mã hóa ảnh (máy bận, còn khoảng 0.7 GB trống); ba lần chạy sau (offline) qua, 1 phút 16 giây tới 2 phút 3 giây khi máy bận. Hai lần chạy bản cuối cho output trùng từng dòng (tất định). `image embedding: (1, 256, 64, 64)`; A: mask tốt nhất IoU 0.997 (`best: 2`); B: 0.993 (`best: 2`); C: 1.0 (`best: 1`); hai mask đầu của A diện tích khoảng gấp đôi, IoU khoảng 0.5 (phủ cả hai hình tròn); `iou_scores` có giá trị 1.016, 1.015. Kết quả mẫu trong bài chép từ lần chạy này (bỏ dòng thanh tiến trình "Loading weights" của stderr). `ast.parse` qua; 50 dòng, mọi dòng ≤ 79 ký tự |
