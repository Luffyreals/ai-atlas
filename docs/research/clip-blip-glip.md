# Ảnh + văn bản (1): CLIP, BLIP, GLIP

Bài: `cv/clip-blip-glip` (chỉ bản vi, khoảng 12–13 phút đọc). Bài cần biết trước trong roadmap: `cv/vision-transformer` (cùng PR), nên "Nhắc nhanh" 2 câu (quyết định 89). Có một ô `PythonRunner` (NumPy), một ô `LocalCode` (CLIP qua `transformers`) và hình `ClipContrastiveFigure` (chưa có, comment giữ chỗ) cùng bảng so sánh ba mô hình.

Ngày tra: **05–06/11/2026**. Cách tra: tải PDF từ arXiv, trích chữ bằng `pdftotext`, tìm và đọc các đoạn nêu bên dưới; trang Distill mở bằng WebFetch. Giáo án gốc: buổi CV về CLIP, BLIP, GLIP (chỉ tham khảo).

## Nguồn

- **[CLIP]** Radford, A., Kim, J. W., Hallacy, C., Ramesh, A., Goh, G., Agarwal, S., Sastry, G., Askell, A., Mishkin, P., Clark, J., Krueger, G., Sutskever, I. (2021). [*Learning Transferable Visual Models From Natural Language Supervision*](https://arxiv.org/abs/2103.00020). arXiv:2103.00020. Đã đọc: tóm tắt (400 triệu cặp); mục 2.3 và giả mã; mục 2.5 (5 ResNet, 3 ViT: B/32, B/16, L/14; $\tau$ khởi tạo tương đương 0.07, chặn để không nhân logit quá 100 "to prevent training instability"; lô 32 768; ViT-L/14@336px); mục 3.1.2 (bảng 1: 76.2% ImageNet zero-shot, ngang ResNet-50 gốc, không dùng 1.28 triệu ảnh có nhãn; cách nhìn bộ phân loại zero-shot như hồi quy logistic nhiều lớp, đầu vào và trọng số chuẩn hóa L2, không bias, bộ mã hóa chữ là hypernetwork); mục 3.1.4 (đa nghĩa crane, boxer; "A photo of a {label}." +1.3% ImageNet; "a type of pet"; gộp 80 prompt +3.5%; cộng lại gần 5%; gộp trong không gian embedding); mục 3.1.5 (yếu ở CLEVRCounts, KITTI Distance…); mục 6 (đếm, khoảng cách tới xe gần nhất gần như ngẫu nhiên; MNIST 88%, thua hồi quy logistic trên điểm ảnh thô; phân loại chi tiết xe, hoa, máy bay).
- **[INFONCE]** van den Oord, A., Li, Y., Vinyals, O. (2018). [*Representation Learning with Contrastive Predictive Coding*](https://arxiv.org/abs/1807.03748). arXiv:1807.03748. Chỉ dẫn làm nguồn của tên InfoNCE. [CLIP] mục 2.3 ghi rõ: hàm mất mát là multi-class N-pair loss (Sohn, 2016), được Oord và cộng sự (2018) phổ biến dưới tên InfoNCE. Chưa mở PDF của bài này (số mục, xem "Chưa xác minh").
- **[BLIP]** Li, J., Li, D., Xiong, C., Hoi, S. (2022). [*BLIP: Bootstrapping Language-Image Pre-training for Unified Vision-Language Understanding and Generation*](https://arxiv.org/abs/2201.12086). arXiv:2201.12086 (v1 28/1/2022, v2 15/2/2022). Đã đọc: tóm tắt; hình 2 và mục 3.1–3.2 (MED: bộ mã hóa đơn phương thức với ITC, bộ mã hóa chữ có điều kiện ảnh với cross-attention và ITM, bộ giải mã nhân quả với LM; ITC theo Li và cộng sự 2021a với momentum encoder và nhãn mềm; ITM dùng hard negative mining; encoder và decoder chia mọi tham số trừ lớp SA); mục 3.3 (CapFilt: captioner và filter khởi tạo từ cùng MED, fine-tune riêng trên COCO; filter bỏ chữ mà đầu ITM đoán không khớp, ở cả chữ web và chữ tổng hợp); mục 4.1 (14 triệu ảnh: COCO, VG, CC, CC12M, SBU; thêm LAION 115M, bảng 1 có dòng 129M); mục 4.3 (nucleus sampling $p = 0.9$ tốt hơn beam search).
- **[ALBEF]** Li, J. và cộng sự (2021), "Align before Fuse". Chỉ nhắc theo dẫn chứng của [BLIP] (Li et al. 2021a), chưa mở.
- **[BLIP2]** Li, J., Li, D., Savarese, S., Hoi, S. (2023). [*BLIP-2: Bootstrapping Language-Image Pre-training with Frozen Image Encoders and Large Language Models*](https://arxiv.org/abs/2301.12597). arXiv:2301.12597 (v1 30/1/2023, v3 15/6/2023). Đã đọc: tóm tắt; mục 3.1 (Q-Former 188M tham số, khởi tạo từ BERT-base, 32 truy vấn × 768, nhỏ hơn 257 × 1024 của ViT-L/14); mục 3.3 (lớp FC chiếu sang chiều embedding của LLM, đặt trước token chữ như soft visual prompt); hơn Flamingo-80B 8.7% trên VQAv2 zero-shot với ít hơn 54 lần tham số học (không đưa vào bài).
- **[GLIP]** Li, L. H., Zhang, P., Zhang, H., Yang, J., Li, C., Zhong, Y., Wang, L., Yuan, L., Zhang, L., Hwang, J.-N., Chang, K.-W., Gao, J. (2022). [*Grounded Language-Image Pre-training*](https://arxiv.org/abs/2112.03857). arXiv:2112.03857 (CVPR 2022 theo trang arXiv). Đã đọc: tóm tắt; mục 1 (prompt "person. bicycle. car. …", thay logit phân loại bằng điểm khớp vùng–từ, so với CLIP chỉ trộn ở tích vô hướng cuối; 27M dữ liệu grounding gồm 3M người gán và 24M cặp web, 78.1M cặp cụm từ–khung nhãn giả độ tin > 0.5; zero-shot 49.8 AP COCO, 26.9 AP LVIS; fine-tune 60.8 / 61.5); mục 3.1 (công thức $\mathbf{S}_{\text{cls}} = \mathbf{O}\mathbf{W}^\top$, $\mathbf{S}_{\text{ground}} = \mathbf{O}\mathbf{P}^\top$; prompt kiểu BERT tốt hơn "Detect: …"); mục 3.2 (deep fusion ở vài lớp mã hóa cuối, gọi kiểu CLIP là late fusion); mục 3.3 (thầy–trò, cụm danh từ do bộ phân tích NLP tách).
- **[BOW]** Yuksekgonul, M., Bianchi, F., Kalluri, P., Jurafsky, D., Zou, J. (2023). [*When and Why Vision-Language Models Behave like Bags-Of-Words, and What to Do About It?*](https://arxiv.org/abs/2210.01936). arXiv:2210.01936, ICLR 2023. Đã đọc: tóm tắt, mục 1–2 (ARO; ví dụ "the horse is eating the grass" và "the grass is eating the horse"; mức đoán mò 50%; "most models are near or below chance level" ở các bài quan hệ).
- **[MMN]** Goh, G., Cammarata, N., Voss, C., Carter, S., Petrov, M., Schubert, L., Radford, A., Olah, C. (4/3/2021). [*Multimodal Neurons in Artificial Neural Networks*](https://distill.pub/2021/multimodal-neurons/). Distill. Mở bằng WebFetch: xác nhận có phần về tấn công bằng chữ (typographic attack) trên CLIP. Đoạn trích nhận được không gồm ví dụ cụ thể.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Ví dụ "quả táo dán chữ iPod" của [MMN] | Nhớ là có, nhưng đoạn WebFetch trả về không gồm ví dụ này | Bài chỉ mô tả chung: dán chữ ghi tên vật khác lên ảnh có thể làm đổi nhãn |
| Số mục của InfoNCE trong [INFONCE] | Theo trí nhớ là mục 2.3; chưa mở PDF | Giữ "mục 2.3" ở Đọc thêm; reviewer nên kiểm |
| ALBEF (Li và cộng sự, 2021) | Chỉ dẫn qua [BLIP], chưa mở, không đưa link | Bài nhắc tên "ALBEF", không có link |
| Dung lượng tải của `openai/clip-vit-base-patch32` | Cache sau lần chạy: `pytorch_model.bin` 605 247 071 byte (revision `3d74acf…`) và `model.safetensors` 605 157 884 byte (revision `c237dc4…`, có lẽ nhánh chuyển đổi safetensors). Không rõ lần chạy trên máy khác có tải cả hai không | Bài ghi "trọng số khoảng 600 MB; trên máy chạy thử tải cả hai bản, khoảng 1.2 GB"; comment trong code ghi "0.6 tới 1.2 GB" |
| Kết quả đếm của ô CLIP | Một ảnh, một lần chạy; không phải phép đo | Bài nói rõ "chỉ là một ảnh", gợi ý tự đổi `n` |

## Ý chính

- Học đối chiếu ảnh–chữ: hai bộ mã hóa, chuẩn hóa L2, ma trận $N \times N$, cross-entropy đối xứng trên $\mathbf{S}/\tau$ [CLIP]. Đạo hàm theo $S_{ik}$ là $(p_{ik} - [k=i])/\tau$ (tự dẫn).
- Zero-shot = một hàng của $\mathbf{S}$ với câu nhãn; prompt và gộp prompt [CLIP 3.1.4].
- Giới hạn: đếm, khoảng cách, MNIST, chi tiết [CLIP 6]; quan hệ, thứ tự [BOW]; chữ trong ảnh [MMN].
- BLIP: MED + ITC/ITM/LM, CapFilt [BLIP]. BLIP-2: Q-Former giữa hai mô hình đóng băng [BLIP2].
- GLIP: detection là grounding, $\mathbf{O}\mathbf{P}^\top$, deep fusion, nhãn giả thầy–trò [GLIP].

## Kiểm chứng code

Code do `lesson-writer` chạy ngày 05–06/11/2026, thư mục làm việc ở scratchpad. `.en.py` là bản sao y nguyên của `.vi.py`.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `contrastive.vi.py`, `contrastive.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`), NumPy của Pyodide; đối chiếu thêm CPython 3.14 | Ô `PythonRunner`. Nạp 2.4 s, chạy 0.5 s. Output trùng CPython. Ma trận $\mathbf{S}$ có đường chéo 0.81, 0.77, 0.71, 0.66; `log N = 1.386`; mất mát đúng/sai: $\tau = 1$: 0.930/1.610; $\tau = 0.1$: 0.023/6.815; $\tau = 0.01$: 0.000/67.923; zero-shot cos `[-0.57 0.78 0.23 0.25]`, xác suất 0.9991 cho "dog"; argmax theo hàng `cat, dog, car, tree`. Khớp lời văn. `ast.parse(..., feature_version=(3, 10))` qua; 45 dòng, dòng dài nhất 74 ký tự |
| `clip_zero_shot.vi.py`, `clip_zero_shot.en.py` | chạy thật | 2026-11-05 | `.venv-cv`: Python 3.14.5, torch 2.15.0+cpu, transformers 5.22.1, pillow 13.0.0, `torch.manual_seed(0)`, chạy với `-I`, `HF_HOME` ở scratchpad | Ô `LocalCode`, `sampleVaries={false}`. Lần đầu 7 phút (gồm tải khoảng 1.2 GB), lần hai 1 phút 22 giây khi máy bận (nhiều agent chạy song song); hai lần output trùng từng byte. `1/tau = 100.0`; tròn đỏ 0.940 (tròn xanh 0.056); vuông xanh 0.957 (tròn xanh 0.042); tam giác vàng 1.000; ba hình tròn: 0.043 / 0.070 / 0.504 / 0.384 → "three red circles". Kết quả mẫu trong bài chép từ lần này. Sau lần chạy chỉ sửa một comment (dung lượng tải). `ast.parse(..., feature_version=(3, 10))` qua; 54 dòng, dòng dài nhất 72 ký tự |
