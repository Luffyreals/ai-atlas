# Data augmentation trong CV (Data Augmentation in Computer Vision)

Bài: `cv/image-augmentation` (chỉ bản vi, khoảng 12 phút đọc). Bài cần biết trước trong roadmap: `cv/cnn-image-classification` (cùng đợt, có link) và `ml/data-preprocessing` (chưa xuất bản, chỉ ghi tên; "Nhắc nhanh" 3 câu về tiền xử lý, chia train/kiểm định/test, rò rỉ dữ liệu). Có hai ô `PythonRunner` (ô ở mục Minh họa là lưới ảnh matplotlib, ô ở mục Ví dụ code là thí nghiệm scikit-learn), một ô `LocalCode` (torchvision v2) và bảng "phép biến đổi – khi dùng – khi tránh". Không có FIG hay VIZ riêng (`docs/architecture/cv-lessons.md` mục 1, dòng 9).

Ngày tra: **05–06/11/2026**. Cách tra: trang arXiv mở bằng WebFetch; PDF RandAugment tải về và trích chữ bằng `pdftotext`; ar5iv (bản HTML của arXiv) cho mixup và CutMix; trang tài liệu torchvision bằng WebFetch; chữ ký hàm kiểm bằng `inspect` trong `.venv-cv`. Giáo án gốc: buổi về Data augmentation trong phần CV (chỉ tham khảo).

## Nguồn

- **[CUTOUT]** DeVries, T., Taylor, G. W. (2017). [*Improved Regularization of Convolutional Neural Networks with Cutout*](https://arxiv.org/abs/1708.04552). arXiv:1708.04552 (v1 15/8/2017, v2 29/11/2017). Đã đọc tóm tắt: che ngẫu nhiên các vùng vuông của đầu vào khi huấn luyện; kết hợp được với augmentation khác.
- **[MIXUP]** Zhang, H., Cissé, M., Dauphin, Y. N., Lopez-Paz, D. (2018). [*mixup: Beyond Empirical Risk Minimization*](https://arxiv.org/abs/1710.09412). ICLR 2018 (v2 27/4/2018 ghi "ICLR camera ready version"). Đã đọc mục 1–3.1 (bản ar5iv): $\tilde{x} = \lambda x_i + (1-\lambda)x_j$, $\tilde{y} = \lambda y_i + (1-\lambda)y_j$ với nhãn one-hot; $\lambda \sim \mathrm{Beta}(\alpha, \alpha)$; "$\alpha \in [0.1, 0.4]$" cải thiện so với ERM trên ImageNet, $\alpha$ lớn thì underfit; trộn trong cùng một mini-batch sau khi xáo.
- **[CUTMIX]** Yun, S., Han, D., Oh, S. J., Chun, S., Choe, J., Yoo, Y. (2019). [*CutMix: Regularization Strategy to Train Strong Classifiers with Localizable Features*](https://arxiv.org/abs/1905.04899). ICCV 2019 (oral). Đã đọc mục 3.1 (bản ar5iv): $\tilde{x} = \mathbf{M} \odot x_A + (\mathbf{1} - \mathbf{M}) \odot x_B$, nhãn trộn bằng $\lambda$; $\lambda \sim \mathrm{Beta}(1, 1)$ (đều); $r_w = W\sqrt{1-\lambda}$, $r_h = H\sqrt{1-\lambda}$, nên tỉ lệ diện tích cắt là $1 - \lambda$.
- **[AA]** Cubuk, E. D., Zoph, B., Mané, D., Vasudevan, V., Le, Q. V. (2019). [*AutoAugment: Learning Augmentation Policies from Data*](https://arxiv.org/abs/1805.09501). CVPR 2019 (v3 11/4/2019). Đã đọc tóm tắt: chính sách gồm nhiều chính sách con, mỗi chính sách con hai phép, mỗi phép có xác suất và độ mạnh; mỗi ảnh mỗi mini-batch chọn ngẫu nhiên một chính sách con.
- **[RA]** Cubuk, E. D., Zoph, B., Shlens, J., Le, Q. V. (2020). [*RandAugment: Practical automated data augmentation with a reduced search space*](https://arxiv.org/abs/1909.13719). arXiv:1909.13719 (v2 14/11/2019); đăng ở NeurIPS 2020. Đã đọc (PDF, `pdftotext`): tóm tắt, mục 2–3, mục 4 bảng 4, hình 3. Các ý dùng trong bài: AutoAugment ban đầu dùng học tăng cường để tìm; $K = 14$ phép; độ mạnh trên thang nguyên 0–10; một độ mạnh chung $M$ cho mọi phép; hai tham số $N$, $M$, cả hai tăng thì regularization mạnh hơn; không gian tìm kiếm $10^{32}$ (AA) so với $10^{2}$ (RA) ở bảng đầu bài; "AutoAugment expended 15K GPU hours for search" (bản cho phát hiện vật thể, bảng 4); độ mạnh tốt nhất tăng theo cỡ mô hình và theo cỡ tập train (hình 3).
- **[ALEX]** Krizhevsky, A., Sutskever, I., Hinton, G. E. (2012). [*ImageNet Classification with Deep Convolutional Neural Networks*](https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html). NeurIPS 2012. Mục 4.1: cắt ngẫu nhiên $224 \times 224$ từ ảnh $256 \times 256$ cộng lật ngang; lúc test lấy trung bình 10 vùng (4 góc, giữa, và bản lật). Ghi theo trí nhớ, xem mục "Chưa xác minh".
- **[SURVEY]** Shorten, C., Khoshgoftaar, T. M. (2019). [*A survey on Image Data Augmentation for Deep Learning*](https://doi.org/10.1186/s40537-019-0197-0). Journal of Big Data 6, 60. Chỉ dùng làm "Đọc thêm".
- **[TV]** PyTorch. [*Transforming and augmenting images*](https://docs.pytorch.org/vision/stable/transforms.html), tài liệu torchvision (bản `stable`, không có URL theo phiên bản). Đã đọc: v2 có từ torchvision 0.15 (3/2023), biến đổi được ảnh cùng hộp bao, mask, video; khuyên dùng v2. Chữ ký `v2.RandAugment(num_ops=2, magnitude=9, num_magnitude_bins=31, ...)` kiểm bằng `inspect` trên torchvision 0.29.2; `v2.SanitizeBoundingBoxes` có trong bản này.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Chi tiết augmentation và 10-crop của AlexNet [ALEX] | Không mở lại PDF trong lần tra này; ghi theo trí nhớ (mục 4.1 của paper). Đây là chi tiết rất hay được dẫn. | Giữ trong bài; reviewer nên mở PDF đối chiếu. |
| Hội nghị của [RA] | Trang arXiv không ghi hội nghị; tôi nhớ bài đăng ở NeurIPS 2020 (và workshop CVPR 2020). | Đọc thêm chỉ ghi năm 2020 và link arXiv, không ghi hội nghị. |
| "Code tính lại $\lambda$ theo diện tích thật" của CutMix | Ý này có trong code chính thức trên GitHub (theo trí nhớ), không thấy trong đoạn mục 3.1 đã đọc. | Bài viết "code tính lại $\lambda$", không gán cho paper. |
| Độ lớn ô cutout trong paper (cỡ cho từng bộ dữ liệu) | Không tra. | Bài chỉ nói "ô vuông cỡ cố định", không ghi số. |
| Số giờ GPU của AutoAugment cho phân loại | Không tra. | Chỉ ghi số 15 nghìn giờ GPU mà [RA] nêu cho bản phát hiện vật thể. |

## Lựa chọn khi viết

- Ô lưới ảnh đặt ở mục **Minh họa** (là phần minh họa chính, theo `cv-lessons.md`), mục Ví dụ code có ô scikit-learn và ô `LocalCode`.
- Thí nghiệm dùng `MLPClassifier((64,), max_iter=1000)` thay vì `LogisticRegression`: với mô hình tuyến tính, augmentation dịch làm độ chính xác trên ảnh gốc giảm từ 0.935 xuống 0.883 (mô hình quá yếu), làm mờ thông điệp chính. Số của `LogisticRegression` được nhắc trong lời văn như một thử nghiệm phụ (đã chạy trên Pyodide).
- `max_iter=1000` để không có `ConvergenceWarning` (với 300 thì có).

## Kiểm chứng code

Code của bài do `lesson-writer` chạy ngày 2026-11-05 và 2026-11-06, thư mục làm việc ở scratchpad. Máy đang bận (nhiều agent chạy song song) nên thời gian đo dài hơn bình thường.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `gallery.vi.py`, `gallery.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`), NumPy 2.4.6, SciPy 1.18.0, scikit-learn 1.8.0, matplotlib (Agg); thêm CPython 3.14 venv `ai-atlas-py314` để xem ảnh | Ô `PythonRunner` ở mục Minh họa. `mixup label` 0.3 ở vị trí 1, 0.7 ở vị trí 6; nhãn đoán: original 6, flip 1, shift 1px 1, rotate 15 6, rotate 180 9, contrast 6, noise 6, cutout 6, mixup 1. Đã xem ảnh lưới 3 x 3, khớp `figureAlt`. 43 dòng, dòng dài nhất 75 ký tự. `ast.parse(..., feature_version=(3, 10))` qua. Pyodide: load 41 s, run 50 s khi máy bận (lần đầu, gồm nạp matplotlib) |
| `shift-experiment.vi.py`, `shift-experiment.en.py` | chạy thật | 2026-11-06 | Pyodide 314.0.7 thật trong Node; CPython 3.14 venv `ai-atlas-py314` (scikit-learn 1.8) | Ô `PythonRunner`. `no aug train 300: test 0.938, shifted test 0.401`; `shift aug train 1500: test 0.937, shifted test 0.882`. Pyodide và CPython cho cùng số. Không có cảnh báo. Pyodide: run 27 s khi máy bận; CPython khi máy rảnh hơn khoảng 3–5 s. Thử phụ `LogisticRegression(max_iter=2000)` cùng chia và cùng thứ tự gọi ngẫu nhiên, trên Pyodide: 0.935 / 0.372 (không aug), 0.883 / 0.595 (có aug), khớp lời văn. 37 dòng. `ast.parse` qua |
| `torchvision-pipeline.vi.py`, `torchvision-pipeline.en.py` | chạy thật | 2026-11-06 | `.venv-cv`, Python 3.14, torch 2.15.0+cpu, torchvision 0.29.2+cpu, pillow 13.0.0, `torch.manual_seed(0)`, chạy với `-I` | Ô `LocalCode`, `sampleVaries={false}`. Ba lần chạy cho output trùng nhau (tất định). 9 s khi máy rảnh hơn (44–84 s khi máy bận), gần hết là nạp torch. Kết quả mẫu trong bài chép từ lần chạy ngày 06/11. Kiểm thêm bằng script phụ: cả 62 pixel lệch giữa màu ảnh và mask (`agreement 0.993`) đều nằm sát viền giữa các lớp. 55 dòng, dòng dài nhất 78 ký tự. `ast.parse(..., feature_version=(3, 10))` qua |
| khối `python` trong bài (`eval_tf = ...`) | cú pháp | 2026-11-06 | | Chép đúng 2 dòng từ `torchvision-pipeline.vi.py` |
