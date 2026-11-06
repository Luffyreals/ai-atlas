# Phần Thị giác máy tính (5b): khuôn bài, code, hình và VIZ

> Phạm vi: 10 bài của phần 5b (`cv/*`), **chỉ bản vi** (như quyết định 43, 53). Phần này làm theo đúng khuôn của phần LLM ([llm-lessons.md](llm-lessons.md)); tài liệu chỉ ghi chỗ khác và các lựa chọn riêng của phần CV.
> Quyết định liên quan: 85–92 trong [decisions.md](../decisions.md). Viết ngày 05/11/2026, nhánh `claude/cv-lessons-5a2550`.

## 1. Danh sách bài, code và hình

| # | Bài (`cv/…`) | Ô chạy trên trang (`PythonRunner`) | Ô chạy trên máy (`LocalCode`) | Minh họa |
|---|---|---|---|---|
| 1 | `cnn-image-classification` | tích chập 2D bằng NumPy trên ảnh chữ số $8 \times 8$, công thức kích thước đầu ra | CNN nhỏ học trên `load_digits`; đếm tham số ResNet-18, MobileNetV3, EfficientNet-B0 (`weights=None`, không tải) | **VIZ `ConvolutionViz`**, FIG `ResidualBlockFigure` |
| 2 | `vision-transformer` | cắt patch và self-attention bằng NumPy | ViT tí hon học trên `load_digits` | FIG `VitFigure` |
| 3 | `semantic-segmentation` | IoU, mIoU, nội suy lên (upsampling) bằng NumPy | UNet nhỏ học trên ảnh hình học tự tạo | FIG `UnetFigure` |
| 4 | `instance-universal-segmentation` | semantic → instance bằng `scipy.ndimage.label`, ghép mask theo IoU, NMS | SAM (`facebook/sam-vit-base`) với điểm gợi ý trên ảnh tự vẽ | FIG `SegmentationTasksFigure` |
| 5 | `clip-blip-glip` | ma trận tương đồng và hàm mất mát tương phản (InfoNCE) bằng NumPy | CLIP (`openai/clip-vit-base-patch32`) phân loại zero-shot ảnh tự vẽ | FIG `ClipContrastiveFigure` |
| 6 | `llava` | ngân sách token ảnh: một ảnh, lưới AnyRes, nhiều ảnh | mô hình kiểu LLaVA cỡ nhỏ (≤ 2 GB) trả lời về ảnh tự vẽ | dùng lại `MultimodalFigure`, thêm bảng so sánh biến thể |
| 7 | `vae-gan` | mẹo tham số hóa lại (reparameterization) và KL dạng đóng, so với Monte Carlo | VAE và GAN tí hon trên `load_digits` | FIG `GenerativeModelsFigure` |
| 8 | `diffusion-models` | quá trình thêm nhiễu dạng đóng trên ảnh chữ số | DDPM tí hon trên dữ liệu 2D; đếm tham số LoRA | **VIZ `DiffusionNoiseViz`** |
| 9 | `image-augmentation` | lật, cắt, xoay, đổi màu, cutout, mixup bằng NumPy; thí nghiệm có và không có augmentation với scikit-learn | pipeline `torchvision.transforms.v2` trên ảnh tự vẽ | ảnh ra của ô `PythonRunner` (matplotlib), bảng so sánh |
| 10 | `self-supervised-learning` | hàm mất mát NT-Xent bằng NumPy | SimCLR tí hon trên `load_digits` rồi linear probe | FIG `SelfSupervisedFigure` |

Hai VIZ cho cả phần (giới hạn 1–2 của nhiệm vụ). Lý do chọn: tích chập và thêm nhiễu là hai quá trình "chạy theo bước" mà hình tĩnh khó cho cảm giác; các ý còn lại là sơ đồ, hình tĩnh đủ.

### 1.1. `ConvolutionViz` (bài 1)

- **Ý duy nhất:** một kernel trượt trên ảnh, mỗi vị trí cho **một số** là tổng tích từng ô; đổi kernel là đổi đặc trưng được phát hiện.
- Ảnh $8 \times 8$ cố định (chữ số vẽ tay bằng mảng số, giá trị 0–1) trong `src/data/datasets/`; kernel $3 \times 3$ chọn trong 4 mẫu: đồng nhất (identity), làm mờ (box blur), cạnh dọc, cạnh ngang; padding 0, stride 1 nên bản đồ đặc trưng $6 \times 6$.
- Điều khiển: chọn kernel; thanh trượt (hoặc nút Trước/Sau) vị trí $(i, j)$ của cửa sổ; khung cửa sổ trên ảnh, ô tương ứng trên bản đồ đặc trưng sáng lên; dòng phép tính 9 tích cộng lại hiện bên dưới, số dùng dấu chấm thập phân.
- Toán thuần TypeScript ở `src/lib/viz/convolution.ts` (có unit test, khớp ô NumPy của bài).

**Đã làm (06/11/2026).** Bài dùng: `import ConvolutionViz from '@components/viz/ConvolutionViz.astro';` rồi `<ConvolutionViz />` (không prop).

- File: wrapper `src/components/viz/ConvolutionViz.astro`, island `convolution-viz/ConvolutionVizIsland.tsx`, toán `src/lib/viz/convolution.ts`, ảnh và cấu hình `DIGIT_FOUR_8`, `DIGIT_FOUR_CONVOLUTION` trong `src/data/datasets/pixel-digits.ts` (kiểu `PixelImage` mới ở `types.ts`), kit mới `kit/PixelGrid.tsx` (`PixelGrid`, `CellFrame`), test `tests/unit/viz/convolution.test.ts` với fixture SciPy `tests/unit/fixtures/cv-viz-python.ts`.
- Ảnh: chữ số 4 tự vẽ, 8 × 8, giá trị 0 / 0.5 / 1; hai nét đứng ở cột 2 và 5, nét ngang ở hàng 4. Không lấy từ `load_digits` (ô NumPy của bài vẫn dùng `load_digits`, nên số trong VIZ khác số in ra của ô code; bài không cần trích số của VIZ).
- Kernel (thứ tự nút): đồng nhất; làm mờ (mọi ô 1/9, hiện là "1/9"); cạnh dọc đúng bằng $\mathbf{K}$ của ô NumPy `[[1, 0, −1]] × 3`; cạnh ngang là chuyển vị của nó. Mặc định: cạnh dọc. Phép tính là tương quan chéo (không lật kernel), như PyTorch và `scipy.signal.correlate2d`; comment đầu `convolution.ts` ghi rõ.
- Điều khiển: 4 nút `aria-pressed`; một thanh trượt 0–35 duyệt 36 ô của bản đồ theo thứ tự đọc (hàng, cột đếm từ 0 như NumPy). Bản đồ $6 \times 6$ vẽ trong khung $8 \times 8$, lùi vào một ô: mỗi ô ra nằm đúng dưới tâm cửa sổ của nó, vòng ngoài trống cho thấy padding 0 làm mất gì.
- Màu: ảnh, kernel đồng nhất và làm mờ dùng thang xám (độ mờ = giá trị); hai kernel cạnh dùng thang phân kỳ (dương `--atlas-viz-primary`, âm `--atlas-viz-alt`, độ đậm = |giá trị| / max |giá trị|), có chú giải chữ.
- Dòng phép tính: 9 tích xếp 3 hàng như cửa sổ (`1.0×(−1)`), rồi `= −1.5`. Dòng trạng thái giải thích từng kernel (4 câu xếp chồng, giữ chiều cao).
- Chuỗi: namespace `vizConvolution`, 25 key.

### 1.2. `DiffusionNoiseViz` (bài 8)

- **Ý duy nhất:** $\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol\epsilon$; khi $t$ tăng, phần ảnh co lại, phần nhiễu lớn dần, tới cuối gần như nhiễu thuần.
- Ảnh $16 \times 16$ cố định; nhiễu $\boldsymbol\epsilon$ cố định sinh bằng PRNG có seed (cùng một nhiễu ở mọi $t$, nên người đọc thấy ảnh "chìm" dần). Lịch tuyến tính của DDPM: $\beta_1 = 10^{-4}$ tới $\beta_T = 0.02$, $T = 1000$.
- Điều khiển: thanh trượt $t$ từ 0 tới 1000; hiện $\sqrt{\bar\alpha_t}$, $\sqrt{1-\bar\alpha_t}$ và một đồ thị nhỏ hai đường này theo $t$ có dấu vị trí hiện tại.
- Toán ở `src/lib/viz/diffusion.ts`, có unit test.

**Đã làm (06/11/2026).** Bài dùng: `import DiffusionNoiseViz from '@components/viz/DiffusionNoiseViz.astro';` rồi `<DiffusionNoiseViz />` (không prop).

- File: wrapper `src/components/viz/DiffusionNoiseViz.astro`, island `diffusion-noise-viz/DiffusionNoiseVizIsland.tsx`, toán `src/lib/viz/diffusion.ts`, ảnh và cấu hình `DIGIT_THREE_16`, `DIGIT_THREE_DIFFUSION` trong `pixel-digits.ts`, test `tests/unit/viz/diffusion.test.ts`.
- Ảnh: chữ số 3 đậm tự vẽ, 16 × 16, giá trị −1 (nền), 0 (mép mềm), 1 (nét). Hiển thị: độ mờ $(v + 1)/2$, cắt về $[-1, 1]$.
- Lịch: `linearBetas` theo đúng cách tính của `np.linspace`, `alphaBars` có $\bar\alpha_0 = 1$ ($t = 0$ là ảnh gốc). Đã so với NumPy 2.5.4 tại $t$ = 1, 10, 100, 250, 500, 750, 1000 (sai số tương đối < 1e-12): $\bar\alpha_{250} = 0.5241$, $\bar\alpha_{500} = 0.0786$, $\bar\alpha_{1000} = 4.04 \times 10^{-5}$; $\sqrt{\bar\alpha_t}$ / $\sqrt{1-\bar\alpha_t}$ hiện 0.724 / 0.690 ở $t = 250$, 0.006 / 1.000 ở $t = 1000$. Hai đường cắt nhau lần đầu ở $t = 260$.
- Nhiễu: `gaussianNoise(2026, 256)`, Box–Muller trên mulberry32 (`createRng` của `sampling.ts`). Để HTML lúc build và lần render đầu ở trình duyệt khớp tới chữ số cuối, $\ln$ và $\cos$ tính bằng `detLn` (qua `detLog10`) và `detCos` (chuỗi Taylor), chỉ dùng $+ - \times \div$ và `Math.sqrt`; test so với `Math.log`, `Math.cos` (sai số < 1e-14) và với Box–Muller viết bằng `Math` (< 1e-12).
- Điều khiển: thanh trượt $t$ 0–1000, bước 1, bắt đầu ở 250 (không có JS vẫn thấy ảnh lẫn nhiễu). Ba ảnh $\mathbf{x}_0$, $\boldsymbol\epsilon$, $\mathbf{x}_t$; công thức; hai dòng số (cũng là chú giải đồ thị); đồ thị nhỏ hai đường theo $t$ (`PlotFrame shape="short"`) có vạch và hai dấu ở $t$ hiện tại; dòng trạng thái ($t = 0$, giữa chừng, $\sqrt{\bar\alpha_t} < 0.1$).
- **KaTeX qua named slot của Astro**, không qua props: riêng $\sqrt{\bar\alpha_t}$ đã khoảng 3,5 KB HTML, công thức và hai ký hiệu sẽ đẩy `props` vượt 8 KB. Slot là HTML tĩnh (`<astro-slot>`), island chỉ đặt vào chỗ. Props đo bằng `serializeProps` của Astro: 4,8 KB (ConvolutionViz: 4,1 KB).
- Chuỗi: namespace `vizDiffusion`, 21 key. Công thức và hai ký hiệu là hằng `String.raw` trong wrapper.
- `viz.css` thêm `.atlas-viz-panels`, `.atlas-viz-pixels`, `.atlas-viz-px` (+ `[data-sign]`), `.atlas-viz-matrix`, `.atlas-viz-sum`; `.atlas-viz-status-stack > p` thành `> *`. Cỡ sau khi bỏ comment: khoảng 2 210 byte gzip (ngân sách 2 560).

## 2. Quy ước nội dung riêng của phần CV

- **Khuôn bài:** đúng 9 mục của template, theo [llm-lessons.md](llm-lessons.md) mục 2.7: mục "Minh họa" không bỏ; mục "Ví dụ code" mở bằng câu phiên bản ("Code trong bài chạy thử lần cuối tháng 11/2026, với Python 3.14, PyTorch 2.15 và torchvision 0.29.") và câu nói ô nào chạy trên trang, ô nào chạy trên máy.
- **"Nhắc nhanh":** dài tới một đoạn (4–6 câu) ở ba bài có bài nền phần DL hoặc Toán chưa xuất bản và nặng kiến thức: `cnn-image-classification` (tích chập, pooling, lan truyền ngược qua CNN), `vision-transformer` (self-attention, khối Transformer), `vae-gan` (phân phối, kỳ vọng, KL, mạng nơ-ron). `image-augmentation` 2–3 câu (tiền xử lý dữ liệu). Các bài chỉ cần bài `cv/*` (xuất bản cùng đợt) giữ 2 câu (quyết định 61).
- **Ký hiệu** (thêm vào bảng của template, chỉ dùng trong phần CV):
  - ảnh $\mathbf{X} \in \mathbb{R}^{H \times W \times C}$ (cao, rộng, số kênh); kernel $\mathbf{K}$ cỡ $k \times k$, stride $s$, padding $p$; kích thước đầu ra $\lfloor (H + 2p - k)/s \rfloor + 1$;
  - cỡ patch $P$, số patch $N = (H/P)(W/P)$, số chiều embedding $D$ (như bài `llm/multimodal`);
  - mask $\mathbf{M}$; IoU $= |A \cap B| / |A \cup B|$;
  - biến ẩn $\mathbf{z}$; bộ mã hóa $q_\phi(\mathbf{z} \mid \mathbf{x})$, bộ giải mã $p_\theta(\mathbf{x} \mid \mathbf{z})$; GAN: $G$, $D$ (ghi rõ $D$ của GAN là bộ phân biệt, khác $D$ số chiều);
  - diffusion: bước $t = 1, \dots, T$, $\beta_t$, $\alpha_t = 1 - \beta_t$, $\bar\alpha_t = \prod_{s \le t} \alpha_s$. Bài nói rõ $T$ ở đây là số bước, khác nhiệt độ $T$ của phần LLM;
  - nhiệt độ của CLIP và NT-Xent: $\tau$ (theo paper).
- **Tên mô hình** là sự kiện có năm và paper ("ResNet (He và cộng sự, 2016)"). Không "mạnh nhất", "mới nhất", không bảng xếp hạng "hiện tại"; số benchmark kèm paper và năm.
- **Ảnh:** không dùng ảnh chụp. Ảnh là mảng NumPy tự tạo (hình học, chữ số vẽ bằng số), `sklearn.datasets.load_digits` (có sẵn trong scikit-learn, chạy được trên Pyodide, không tải mạng), hoặc ảnh vẽ bằng PIL trong code `LocalCode`. Không tải bộ dữ liệu (CIFAR, ImageNet, COCO) trong code của bài; bài chỉ nhắc tên và link.

## 3. Code và kiểm chứng

- **Chỗ đặt:** `src/code/cv/<bài>/<tên>.vi.py` và `.en.py` (bản sao y nguyên khi chưa dịch). Mỗi file là chương trình hoàn chỉnh. Chữ in ra: tiếng Anh ngắn hoặc chỉ số (như các phần khác; luật bỏ chuỗi của `code-pairs` chỉ áp dụng cho `llm/`).
- **`PythonRunner`:** chỉ `numpy`, `scipy`, `scikit-learn`, `matplotlib`; ≤ 40 dòng gợi ý; seed khi ngẫu nhiên. **Kiểm bằng Pyodide 314.0.7 thật trong Node** (quyết định 61), không chỉ CPython.
- **`LocalCode`:** PyTorch CPU, ≤ 60 dòng, dòng ≤ 79 ký tự, Python 3.10+, `torch.manual_seed(0)`, chạy dưới khoảng 3 phút trên CPU. Mô hình huấn luyện sẵn được tải từ Hugging Face khi tổng dung lượng ≤ 2 GB; lời văn ghi dung lượng tải. Tên checkpoint (ví dụ `openai/clip-vit-base-patch32`) được ghi trong code, vì là một tệp trọng số cố định có paper, không phải dịch vụ API (khác quy tắc tên model của phần LLM). Không có biến môi trường, không key.
- **Venv `.venv-cv/`** ở gốc worktree (đã chặn trong `.gitignore`), gói ghim ở `scripts/requirements-cv.txt`: torch 2.15.0+cpu, torchvision 0.29.2+cpu, transformers 5.22.1, numpy 2.5.4, scipy 1.18.1, scikit-learn 1.9.1, matplotlib 3.11.2, pillow 13.0.0. Bộ nhớ đệm Hugging Face đặt ở scratchpad (`HF_HOME`), không nằm trong repo.
- **Kết quả mẫu** trong `LocalCode` chỉ lấy từ lần chạy thật; output tất định thì `sampleVaries={false}`.
- **Bảng kiểm chứng:** mỗi bài có `docs/research/<bài>.md` (nguồn có thật: tác giả, năm, link; mục "Chưa xác minh"; mục `## Kiểm chứng code` theo khuôn [llm-lessons.md](llm-lessons.md) mục 2.5).
- **Test:** `python-syntax` quét cả khối ` ```python ` trong bài `cv/`; luật "mọi `.vi.py` của bài đã xuất bản có dòng trong bảng kiểm chứng" mở rộng cho `cv/` (quyết định 91).

## 4. Hình tĩnh (FIG)

Theo [viz/figures.md](viz/figures.md) mục 8 và kit ở `src/components/figures/kit/`, chỉ bố cục hẹp 360 đơn vị (quyết định 62). Chữ vi/en ở `src/data/figures/<tên>.ts`, đăng ký trong `index.ts`.

| Hình | Bài | Ý chính |
|---|---|---|
| `ResidualBlockFigure` | 1 | Đầu vào đi qua hai lớp tích chập, cộng với chính nó qua đường tắt: khối chỉ cần học phần dư $F(\mathbf{x})$ |
| `VitFigure` | 2 | Ảnh cắt thành $N$ patch, chiếu thành $N$ vectơ, thêm token `[CLS]` và embedding vị trí, qua bộ mã hóa Transformer, đầu ra của `[CLS]` vào lớp phân loại |
| `UnetFigure` | 3 | Nhánh co (độ phân giải giảm, số kênh tăng) và nhánh giãn đối xứng, nối tắt (skip connection) mang chi tiết từ nhánh co sang nhánh giãn cùng tầng |
| `SegmentationTasksFigure` | 4 | Cùng một cảnh có ba đáp án: semantic (mỗi pixel một lớp), instance (mỗi vật đếm được một mask), panoptic (cả hai) |
| `ClipContrastiveFigure` | 5 | $N$ ảnh và $N$ câu mô tả thành hai dãy vectơ; ma trận $N \times N$ độ tương đồng, đường chéo là cặp đúng được kéo lên, phần còn lại bị đẩy xuống |
| `GenerativeModelsFigure` | 7 | Hai hàng: VAE (bộ mã hóa → $\boldsymbol\mu, \boldsymbol\sigma$ → $\mathbf{z}$ → bộ giải mã) và GAN (nhiễu → $G$ → ảnh giả; ảnh thật và giả → $D$ → thật hay giả) |
| `SelfSupervisedFigure` | 10 | Một ảnh, hai phép augmentation, hai góc nhìn qua cùng bộ mã hóa; hai vectơ của cùng ảnh được kéo gần, vectơ của ảnh khác bị đẩy xa |

`llava` dùng lại `MultimodalFigure` của `llm/multimodal` kèm câu dẫn.

## 5. Quy trình

1. `lesson-writer` viết 10 bài song song (mỗi agent chỉ sửa file của bài mình, không chạy lệnh `npm`), kèm `docs/research/<bài>.md`. Hình và VIZ để comment giữ chỗ `{/* FIG: … */}`, `{/* VIZ: … */}`.
2. Phiên chính đổi `status.vi` trong `roadmap.ts`, gộp thuật ngữ vào mục "Thị giác máy tính" của `docs/glossary.md`.
3. `content-reviewer` từng bài (song song) → `lesson-writer` sửa.
4. `viz-builder`: 2 VIZ, rồi 7 FIG (lần lượt, vì cùng sửa `src/data/figures/index.ts`).
5. `tester` (mở rộng test cho `cv/`, chạy check/test/build/e2e) → `analyst` → sửa → báo cáo `docs/progress/2026-11-05-cv.md` → PR.
