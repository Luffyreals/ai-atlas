# Phân loại ảnh với Transformer: Attention, ViT (Vision Transformer)

Bài: `cv/vision-transformer` (chỉ bản vi, khoảng 13 phút đọc). Bài cần biết trước trong roadmap: `cv/cnn-image-classification` (cùng PR, link được) và `dl/transformers` (chưa xuất bản, nên có khối "Nhắc nhanh" dài một đoạn theo quyết định 89). Bài `llm/multimodal` đã dạy cắt patch và $N = (H/P)(W/P)$; bài này chỉ nhắc gọn và đi sâu vào ViT như một bộ phân loại. Có một ô `PythonRunner` (NumPy), một ô `LocalCode` (PyTorch) và chỗ giữ hình `VitFigure`.

Ngày tra: **05/11/2026**. Cách tra: tải PDF từ arXiv, trích chữ bằng `pdftotext -layout`, đọc các mục nêu dưới đây; trang tóm tắt arXiv mở bằng WebFetch. Ý không có thẻ nguồn là kiến thức chung hoặc "tự tính".

## Nguồn

- **[VIT]** Dosovitskiy, A., Beyer, L., Kolesnikov, A., Weissenborn, D., Zhai, X., Unterthiner, T., Dehghani, M., Minderer, M., Heigold, G., Gelly, S., Uszkoreit, J., Houlsby, N. (2021). [*An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale*](https://arxiv.org/abs/2010.11929). arXiv:2010.11929 (v1 22/10/2020; bản đã đọc v2, 3/6/2021, ghi "Published as a conference paper at ICLR 2021"). Đã đọc: mở đầu, mục 3.1 (phương trình 1–4, đoạn "Inductive bias", "Hybrid"), 3.2 (fine-tune ở độ phân giải cao, nội suy 2D embedding vị trí), 4.1 (bộ dữ liệu, bảng 1), 4.3 (yêu cầu dữ liệu), 4.5 (khoảng cách attention), phụ lục về CLS và GAP, D.4 (embedding vị trí).
- **[DEIT]** Touvron, H., Cord, M., Douze, M., Massa, F., Sablayrolles, A., Jégou, H. (2021). [*Training data-efficient image transformers & distillation through attention*](https://arxiv.org/abs/2012.12877). arXiv:2012.12877 (v1 23/12/2020; v2 15/1/2021). Đã đọc: tóm tắt, mở đầu, mục 4 (chắt lọc nhãn cứng, token chắt lọc), mục 5.1 (lướt), mục 6 (augmentation).
- **[SWIN]** Liu, Z., Lin, Y., Cao, Y., Hu, H., Wei, Y., Zhang, Z., Lin, S., Guo, B. (2021). [*Swin Transformer: Hierarchical Vision Transformer using Shifted Windows*](https://arxiv.org/abs/2103.14030). arXiv:2103.14030 (v1 25/3/2021; v2 17/8/2021). Đã đọc: tóm tắt, mục 3.1 (patch $4 \times 4$, patch merging), 3.2 (phương trình 1–2 chi phí, cửa sổ dịch $\lfloor M/2 \rfloor$, $M = 7$), đoạn kết quả ImageNet-22K.
- **[ATT]** Vaswani, A. và cộng sự (2017). [*Attention Is All You Need*](https://arxiv.org/abs/1706.03762). Dùng như bài `llm/build-first-llm` (không đọc lại).

## Các sự kiện dùng trong bài và chỗ kiểm

| Ý trong bài | Nguồn |
|---|---|
| $\mathbf{Z}_0 = [\mathbf{x}_{\text{cls}}; \mathbf{x}_1\mathbf{E}; \dots] + \mathbf{E}_{\text{pos}}$, $\mathbf{E}_{\text{pos}} \in \mathbb{R}^{(N+1) \times D}$; Pre-LN, MLP hai lớp GELU; $\mathbf{y} = \mathrm{LN}(\mathbf{z}_L^0)$ | [VIT] mục 3.1, pt. 1–4 |
| Đầu phân loại: MLP một lớp ẩn khi pre-train, một lớp tuyến tính khi fine-tune (khởi tạo 0, mục 3.2) | [VIT] 3.1, 3.2 |
| CLS và GAP cho kết quả tương tự khi chỉnh tốc độ học | [VIT] phụ lục (hình 9) |
| Bảng ViT-B/L/H: 12/24/32 khối, $D$ 768/1024/1280, MLP 3072/4096/5120, 12/16/16 đầu, 86M/307M/632M | [VIT] bảng 1 |
| Ba giả định của CNN (cục bộ, lân cận 2D, đẳng biến tịnh tiến); ViT chỉ dùng cấu trúc 2D khi cắt patch và nội suy vị trí | [VIT] đoạn "Inductive bias", 3.2 |
| ImageNet 1.3M ảnh, 1k lớp; ImageNet-21k 14M, 21k lớp; JFT 303M ảnh, 18k lớp | [VIT] 4.1 |
| Trên ImageNet ViT kém ResNet cùng cỡ vài điểm %; ViT-L kém ViT-B; 21k ngang nhau; JFT mới thấy hết lợi | [VIT] mở đầu, 4.3 |
| ViT-B/32 kém hẳn ResNet-50 ở tập 9M, tốt hơn ở 90M+ | [VIT] 4.3 |
| Có đầu nhìn gần cả ảnh ngay ở lớp thấp, có đầu nhìn rất gần; khoảng cách tăng theo độ sâu | [VIT] 4.5 |
| Không embedding vị trí kém xa có; các kiểu vị trí khác nhau gần như ngang nhau | [VIT] D.4 |
| DeiT: chỉ ImageNet, một máy 8 GPU, 53 giờ pre-train; 83.1% top-1 (86M, không dữ liệu ngoài); tới 85.2% có chắt lọc | [DEIT] tóm tắt, mở đầu |
| Token chắt lọc học $y_t = \arg\max_c Z_t(c)$; loss nhãn cứng $\frac12$CE + $\frac12$CE; thầy mặc định RegNetY-16GF; thầy CNN tốt hơn thầy Transformer | [DEIT] mục 4, 5.1 |
| Augmentation: RandAugment, Mixup, CutMix, random erasing, repeated augmentation; stochastic depth; "transformers require a strong data augmentation" | [DEIT] mục 6 |
| Swin: patch $4 \times 4$; $\Omega(\text{MSA}) = 4hwC^2 + 2(hw)^2C$, $\Omega(\text{W-MSA}) = 4hwC^2 + 2M^2hwC$; $M = 7$; dịch $\lfloor M/2 \rfloor$; patch merging | [SWIN] 3.1, 3.2 |
| Swin-L (pre-train ImageNet-22K, ảnh 384) đạt 87.3% top-1 ImageNet-1K | [SWIN] tóm tắt, bảng 1(b) |

## Tự tính

- Trường tiếp nhận sau $l$ lớp $3 \times 3$ stride 1: $(2l+1)^2$. Phủ $8 \times 8$ cần 4 lớp; $224 \times 224$ cần 112 lớp ($2 \cdot 112 + 1 = 225$).
- $224/16 = 14$, $N = 196$, 197 token, $197^2 = 38\,809$; $P = 8$: 785 token, $616\,225$ cặp (gấp ≈ 15.9). $384/16 = 24$, 577 token, $577^2 = 332\,929$, gấp ≈ 8.58 so với 38 809 (quiz câu 2).

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Ý "CNN truyền thiên kiến quy nạp sang ViT qua nhãn" | [DEIT] chỉ nói thầy CNN tốt hơn và nêu giả thuyết về thiên kiến quy nạp qua chắt lọc (đoạn mục 5.1, đọc lướt) | Bài viết "một cách hiểu là", không khẳng định |
| Cấu hình huấn luyện chính xác của từng con số DeiT (224 hay 384, 300 hay 1000 epoch) | Bảng 5 trích chữ bị vỡ cột | Bài chỉ dùng hai số trong tóm tắt: 83.1% và "tới 85.2%" |
| "Thư viện `timm` có hàm nội suy embedding vị trí" | Không tra | Đã bỏ khỏi bài |
| ICLR 2021 của [VIT] | PDF v2 ghi "Published as a conference paper at ICLR 2021" | Ghi ICLR 2021 |

## Kiểm chứng code

Code do `lesson-writer` chạy ngày 05–06/11/2026, thư mục làm việc ở scratchpad.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `patch-attention.vi.py`, `patch-attention.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`): Python 3.14.2, NumPy 2.4.6, scikit-learn 1.8.0; cũng chạy bằng CPython 3.14 (output trùng) | Ô `PythonRunner`. `label: 0 image: (8, 8)`; `patches: (4, 16) N = 4`; `patch 1 = top-right block: True`; `tokens Z: (5, 8)`; ma trận $\mathbf{A}$ $5 \times 5$, hàng 0 `[0.084 0.09 0.457 0.132 0.238]`; `row sums: [1. 1. 1. 1. 1.]`; `all weights > 0: True`; `output: (5, 8)`; bảng: 5/25, 17/289, 197/38809, 785/616225. Hai bản giống hệt (`cmp`). `ast.parse(..., feature_version=(3, 10))` qua; 43 dòng, dòng dài nhất 76 ký tự. Pyodide: tải gói khoảng 19 giây, chạy khoảng 34 giây (lần đầu, máy bận) |
| `tiny-vit.vi.py`, `tiny-vit.en.py` | chạy thật | 2026-11-06 | `.venv-cv`: Python 3.14.5, torch 2.15.0+cpu, scikit-learn 1.9.1, chạy với `-I` | Ô `LocalCode` (không đặt `sampleVaries={false}`). Mặc định số luồng: `ViT: 18218 params, test acc 0.958` / `CNN: 16122 params, test acc 0.986`, khoảng 2 phút 17 giây khi máy rảnh (lần đầu gần 14 phút khi nhiều agent cùng chạy torch). Với `OMP_NUM_THREADS=1`: ViT 0.972, CNN 0.986, khoảng 2 phút: số của ViT phụ thuộc số luồng, nên bài ghi rõ. Kết quả mẫu chép từ lần chạy mặc định. `ast.parse(..., feature_version=(3, 10))` qua; 58 dòng, dòng dài nhất 74 ký tự |
