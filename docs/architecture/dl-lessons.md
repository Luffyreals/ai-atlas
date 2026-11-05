# Phần Deep Learning (Phần 4): khuôn bài, code, VIZ và hình

> Phạm vi: 8 bài `dl/*`, **chỉ bản vi** (như quyết định 43, 53). Tài liệu này là hợp đồng chung cho `lesson-writer`, `viz-builder`, `content-reviewer` khi viết phần DL. Quyết định đầu vào: 115–122 trong [decisions.md](../decisions.md).
> Liên quan: [llm-lessons.md](llm-lessons.md) (component `LocalCode` mục 2.2, 4.1; bảng kiểm chứng mục 2.5, 4.7), [viz/README.md](viz/README.md) (quy ước VIZ, venv Pyodide mục 2.5), [viz/figures.md](viz/figures.md) (kit FIG), [lesson-template.mdx](../lesson-template.mdx).
>
> Viết ngày 05/11/2026.

## 1. Phạm vi từng bài

Các phần NLP, CV, LLM trỏ tới bài DL làm bài nền, nên ranh giới giữa các bài giữ đúng như sau (quyết định 116).

| Bài | Nội dung chính | Không có ở bài này |
|---|---|---|
| `dl/neural-networks` | Nơ-ron nhân tạo; perceptron và luật học perceptron; vì sao perceptron không giải được XOR; MLP; lan truyền xuôi dạng ma trận; hàm kích hoạt (step, sigmoid, tanh, ReLU, Leaky ReLU, GELU; softmax ở lớp ra); vì sao cần phi tuyến; hàm mất mát cross-entropy ở lớp ra; định lý xấp xỉ phổ quát (nêu ý, không chứng minh) | Lan truyền ngược (bài sau) |
| `dl/training-neural-networks` | Lan truyền ngược (quy tắc dây chuyền, dạng ma trận cho MLP 2 lớp, kiểm tra gradient bằng sai phân); vanishing/exploding gradient; khởi tạo Xavier/He; BatchNorm; Dropout; weight decay, early stopping, gradient clipping (ngắn) | Chi tiết các bộ tối ưu (bài `ml/optimizers`) |
| `dl/cnn` | Ảnh là ma trận/tensor (kênh màu); bộ lọc (làm mờ, làm nét, Sobel); phép tích chập 2D (thực chất là cross-correlation); padding, stride, kích thước đầu ra; nhiều kênh vào/ra; pooling; cấu trúc CNN; so với MLP: chia sẻ trọng số, kết nối cục bộ, số tham số; trường tiếp nhận | Các kiến trúc cụ thể (bài sau), ứng dụng thị giác (phần CV) |
| `dl/modern-cnn-architectures` | Ý tưởng chính và năm của LeNet-5, AlexNet, VGG, GoogLeNet/Inception (tích chập 1×1), ResNet (kết nối tắt), Xception (tích chập tách theo chiều sâu), SENet (kênh chú ý), YOLO (phát hiện vật thể một lượt: lưới, hộp, IoU, NMS ở mức ý tưởng) | Thực hành phân loại ảnh, transfer learning, MobileNet, EfficientNet (bài `cv/cnn-image-classification`) |
| `dl/rnn` | Dữ liệu chuỗi; trạng thái ẩn; mở rộng theo thời gian; các dạng bài toán (nhiều→một, nhiều→nhiều); lan truyền ngược theo thời gian (BPTT); vanishing/exploding theo thời gian; truncated BPTT, gradient clipping | Cổng (bài GRU, LSTM) |
| `dl/gru` | Cổng reset, cổng update, trạng thái ứng viên; phép nội suy giữa trạng thái cũ và mới; vì sao cổng giúp gradient đi xa; số tham số so với RNN | LSTM |
| `dl/lstm-bilstm` | Trạng thái ô (cell state); cổng quên, cổng vào, cổng ra; so với GRU; LSTM nhiều tầng; BiLSTM và khi nào dùng được (cả câu có sẵn, không dùng cho sinh văn bản) | Attention |
| `dl/transformers` | Hạn chế của RNN (tuần tự, đường đi dài); attention tích vô hướng có chia tỉ lệ; truy vấn, khóa, giá trị; self-attention; attention nhiều đầu; mã hóa vị trí (sin/cos, nhắc có học được và RoPE); khối Transformer (kết nối tắt, chuẩn hóa lớp, FFN); mặt nạ nhân quả; ba họ: encoder-only, decoder-only, encoder–decoder; độ phức tạp $O(L^2)$ | Cross-attention, teacher forcing, beam search chi tiết (bài `llm/seq2seq`); BERT, GPT (phần NLP); ViT (phần CV) |

## 2. Ký hiệu của phần DL

Thêm vào bảng ký hiệu của `CLAUDE.md` (quyết định 117):

- Lớp thứ $l$ viết chỉ số trên trong ngoặc vuông: $\mathbf{W}^{[l]}$, $\mathbf{b}^{[l]}$, $\mathbf{z}^{[l]} = \mathbf{W}^{[l]}\mathbf{a}^{[l-1]} + \mathbf{b}^{[l]}$, $\mathbf{a}^{[l]} = g(\mathbf{z}^{[l]})$, $\mathbf{a}^{[0]} = \mathbf{x}$. Số lớp $N_L$ khi cần. Hàm kích hoạt $g$; sigmoid $\sigma$.
- Một nơ-ron: $z = \mathbf{w}^\top\mathbf{x} + b$. Hệ số tự do của một lớp là vectơ $\mathbf{b}$.
- Tích từng phần tử $\odot$. Ảnh và kernel: $\mathbf{X}$, $\mathbf{K}$; kích thước kernel $k$, padding $p$, stride $s$.
- Chuỗi: bước thời gian $t$ viết chỉ số dưới, $\mathbf{x}_t$, $\mathbf{h}_t$; độ dài chuỗi $L$ (như phần LLM, quyết định 60; không dùng $T$ vì $T$ là nhiệt độ). LSTM có $\mathbf{c}_t$; cổng $\mathbf{f}_t, \mathbf{i}_t, \mathbf{o}_t$ (LSTM), $\mathbf{r}_t, \mathbf{z}_t$ (GRU).
- Transformer: $\mathbf{Q}, \mathbf{K}, \mathbf{V}$, chiều mô hình $d$, chiều khóa $d_k$, số đầu $h$. Ma trận khóa $\mathbf{K}$ và kernel tích chập không xuất hiện trong cùng một bài.

## 3. Code

Như phần LLM ([llm-lessons.md](llm-lessons.md) mục 2.1), có hai chỗ:

| Code | Hiển thị | Ví dụ |
|---|---|---|
| Cơ chế cốt lõi, chỉ NumPy (cùng pandas, matplotlib, scipy, scikit-learn), chạy dưới vài giây | `PythonRunner` | perceptron học AND; lan truyền xuôi; lan truyền ngược và kiểm tra gradient; tích chập 2D; RNN/GRU/LSTM một bước; attention |
| Huấn luyện bằng PyTorch | `LocalCode` (`packages={['torch', ...]}`, `hardware` ghi CPU là đủ và thời gian chạy đo được) | MLP và CNN trên bộ `load_digits` của scikit-learn (ảnh 8×8, có sẵn khi cài, không tải mạng); RNN/GRU/LSTM trên chuỗi tự sinh; Transformer nhỏ trên bài toán đồ chơi |

- Mỗi ô một cặp `src/code/dl/<bài>/<tên>.vi.py` và `.en.py` (bản sao y nguyên khi chưa dịch), chương trình hoàn chỉnh, khoảng 40 dòng (tối đa 60), dòng ≤ 79 ký tự, Python 3.10+, có `seed` (`np.random.default_rng(0)`, `torch.manual_seed(0)`).
- Bài DL không gọi API, không có biến môi trường.
- **Kiểm chứng** (quyết định 118):
  - Ô `PythonRunner`: chạy bằng venv khớp phiên bản Pyodide `C:/Users/Dell/.venvs/ai-atlas-py314` ([viz/README.md](viz/README.md) mục 2.5). Số trích trong lời văn phải khớp lần chạy này.
  - Ô `LocalCode`: chạy thật hết bằng `.venv-dl/` ở gốc worktree (Python 3.14, torch CPU; đã chặn trong `.gitignore`). Kết quả mẫu chép nguyên văn từ lần chạy thật.
  - Thư mục làm việc ở scratchpad, gọi Python bằng `-I`.
  - Mỗi bài có `docs/research/<bài>.md` (nguồn tham khảo có thật kèm link, và mục `## Kiểm chứng code` theo khuôn [llm-lessons.md](llm-lessons.md) mục 4.7). `lesson-writer` viết file này (quyết định 115).

## 4. VIZ và hình tĩnh

Tối đa 1 VIZ mỗi bài, chỉ ở chỗ tương tác giúp hiểu rõ hơn; còn lại hình SVG tĩnh theo kit FIG, bố cục hẹp 360 đơn vị (quyết định 119).

| Bài | Loại | Tên | Ý chính |
|---|---|---|---|
| `dl/neural-networks` | FIG | `MlpFigure` | Bên trái: một nơ-ron (các $x_j$ nhân $w_j$, cộng $b$, ra $z$, qua $g$, ra $a$). Bên phải (hoặc phía dưới): MLP 2 → 3 → 1 với lớp vào, lớp ẩn, lớp ra |
| `dl/training-neural-networks` | **VIZ** | `GradientFlowViz` | Chọn hàm kích hoạt (sigmoid, tanh, ReLU), cách khởi tạo (độ lệch chuẩn 1, Xavier, He) và số lớp (2–20). Cột thể hiện độ lớn gradient ở từng lớp trên thang log, từ lớp đầu tới lớp cuối. Thấy được gradient tiêu biến (sigmoid), bùng nổ (std 1 với ReLU) và ổn định (He với ReLU). Thiết kế: [viz/gradient-flow.md](viz/gradient-flow.md) |
| `dl/cnn` | **VIZ** | `ConvolutionViz` | Ảnh xám 8×8, chọn kernel 3×3 (đồng nhất, làm mờ, làm nét, Sobel dọc, Sobel ngang), chọn vị trí cửa sổ. Hiện cửa sổ trên ảnh, phép nhân từng ô và tổng, cùng bản đồ đặc trưng 6×6. Thiết kế: [viz/convolution.md](viz/convolution.md) |
| `dl/modern-cnn-architectures` | FIG | `ResidualBlockFigure` | $\mathbf{x}$ → tích chập 3×3 → BN → ReLU → tích chập 3×3 → BN → $\oplus$ → ReLU, đường tắt mang $\mathbf{x}$ vòng qua tới $\oplus$ |
| `dl/rnn` | FIG | `RnnUnrolledFigure` | Bên trái: ô RNN có vòng lặp. Bên phải: mở rộng ra 3 bước $t-1, t, t+1$, mỗi bước nhận $\mathbf{x}_t$, trả $\mathbf{h}_t$, cùng trọng số |
| `dl/gru` | FIG | `GruCellFigure` | Ô GRU: $\mathbf{h}_{t-1}$, $\mathbf{x}_t$ vào; cổng $\mathbf{r}_t$, $\mathbf{z}_t$ (sigmoid); ứng viên $\tilde{\mathbf{h}}_t$ (tanh); nội suy theo $\mathbf{z}_t$ ra $\mathbf{h}_t$ |
| `dl/lstm-bilstm` | FIG | `LstmCellFigure` | Ô LSTM: đường trạng thái ô $\mathbf{c}_{t-1} \to \mathbf{c}_t$ chạy ngang phía trên, nhân với cổng quên, cộng phần mới từ cổng vào; cổng ra tạo $\mathbf{h}_t$ |
| `dl/transformers` | FIG | `TransformerBlockFigure` | Đọc từ dưới lên: token → embedding + mã hóa vị trí → khung "× N": attention nhiều đầu → cộng và chuẩn hóa → FFN → cộng và chuẩn hóa (kết nối tắt vòng qua mỗi khối con) → đầu ra |

Chữ của hình ở `src/data/figures/<tên>.ts` (vi và en), như các hình đã có. Chưa có hình thì bài để comment giữ chỗ `{/* FIG: ... */}` hoặc `{/* VIZ: ... */}` ở mục "Minh họa".

### 4.1. Lô FIG DL-A (05/11/2026): `MlpFigure`, `ResidualBlockFigure`, `TransformerBlockFigure`

**File:**

- Hình: `src/components/figures/{Mlp,ResidualBlock,TransformerBlock}Figure.astro`; chữ vi/en: `src/data/figures/{mlp,residual-block,transformer-block}.ts`; đăng ký trong `FIGURES` (id `mlp`, `residual-block`, `transformer-block`). Khối `vi` do `viz-builder` viết theo bảng trên (bài chưa có comment FIG lúc làm), khối `en` là bản nháp.
- Dùng trong bài (bản vi và en giống hệt, không có prop), ở mục "Minh họa":

  ```mdx
  import MlpFigure from '@components/figures/MlpFigure.astro';
  <MlpFigure />
  ```

  Tương tự `ResidualBlockFigure` (`dl/modern-cnn-architectures`), `TransformerBlockFigure` (`dl/transformers`).

**Kit, mở rộng cho lô này:** `FigFormula.astro` (mới) và hàm thuần `src/lib/figures/formula.ts` (mới), không sửa `FigMath`, `FigNode`, `geometry.ts`, `figures.css`.

- `FigFormula` vẽ một công thức ngắn là một hàng **phần** trong một `<text>`. Mỗi phần là một `MathLabel` của `FigMath` (ký hiệu nghiêng hoặc đậm đứng, `sub`, `before`, `after`), cộng hai thứ mới: `sup` (chỉ số trên 13 đơn vị, nâng bằng `dy` = 0,35 cỡ chữ: 1–2 chữ số hay chữ Latin, có thể trong ngoặc vuông, ví dụ `[1]` của $\mathbf{a}^{[1]}$) và `hat` (dấu mũ, vẽ bằng chữ dựng sẵn như ŷ U+0177, có trong tập con latin-ext của Barlow; dấu mũ ghép U+0302 thì không có). Dùng cho $f(\mathbf{x})$, $\mathbf{x} + f(\mathbf{x})$, $\mathbf{a}^{[1]}$, $\hat{y}$.
- `checkFormula` báo lỗi build khi có chữ thường (luật của `checkMathLabel`), `sup` sai dạng, một phần có cả `sub` và `sup`, hay `hat` trên chữ không có bản dựng sẵn (bảng `HATS`). Khoảng cách: 3 đơn vị quanh phép toán, 1 đơn vị sát ngoặc.
- Dùng lại lớp `.atlas-fig-math`, `.atlas-fig-math-bold`, nên `figures.css` không đổi và e2e đo được như `FigMath`.
- Test: `tests/unit/viz/figure-formula.test.ts`.

**Quyết định tự chọn (đổi lại được khi người dùng duyệt):**

- Cả ba hình chỉ có bố cục hẹp (cùng lý do llm-lessons.md 2.9.1).
- `MlpFigure`: hai phần xếp dọc, mỗi phần có tiêu đề. Trên: $x_1$, $x_2$, ba chấm dọc, $x_n$ bên trái; mũi tên mang $w_1$, $w_2$, $w_n$ vào khối "Tổng có trọng số"; $b$ đi xuống vào khối đó; $z$ ghi trên mũi tên tới $g$, rồi $a$. Công thức $z = \mathbf{w}^\top\mathbf{x} + b$ để ở chú thích. Dưới: MLP 2 → 3 → 1, mỗi cặp lớp kề nhau nối đủ; tên lớp ở hàng trên, vectơ $\mathbf{x}$, $\mathbf{a}^{[1]}$, $\hat{y}$ ở hàng dưới. **Nơ-ron vẽ bằng ô vuông**, không phải hình tròn: `circle` rời không được e2e đo (llm-lessons.md 2.9.1). Ba nơ-ron ẩn là ô trống `accent` ("mỗi ô là một nơ-ron như ở trên"), nơ-ron ra là ô trống thường.
- `ResidualBlockFigure`: đọc **từ trên xuống** như Hình 2 của He và cộng sự (khác `TransformerBlockFigure`, đọc từ dưới lên như Vaswani và cộng sự). Ngoặc bên trái (`FigArrow head={false}`) gom năm lớp thành $f(\mathbf{x})$. Đường tắt rời khối $\mathbf{x}$ bên phải, chạy dọc lề phải và vào phép cộng từ bên cạnh. Phép cộng là ô nhỏ "+" (`accent`), không phải vòng tròn ⊕ (U+2295 không có trong Barlow, lý do như `LoraFigure`). Chú thích nói thêm đường tắt dùng tích chập 1×1 khi số kênh đổi.
- `TransformerBlockFigure`: khác `EncoderDecoderFigure` ở chỗ vẽ **bên trong** một khối (cộng và chuẩn hóa, FFN, kết nối tắt), một chồng, không có cross-attention. Mã hóa vị trí vào ô "+" từ bên phải. Hai kết nối tắt rẽ ra từ mũi tên vào khối con, chạy lên một làn trong khung "× N khối" ở bên phải, vào khối "Cộng và chuẩn hóa" ngay sau khối con. Chỉ "Attention nhiều đầu" là `accent`. Chú thích ghi công thức Post-LN và một câu về Pre-LN.
- Token mẫu: "con mèo ngủ" (vi), "the cat sleeps" (en), mỗi token một ô.

## 5. Hợp đồng với `lesson-writer`

Ngoài template, `CLAUDE.md` và `.claude/agents/lesson-writer.md`:

1. Chỉ tạo và sửa `src/content/docs/vi/dl/<bài>.mdx`, `src/code/dl/<bài>/*`, `docs/research/<bài>.md`. Không sửa `roadmap.ts`, glossary, i18n, template, component; báo trong báo cáo, phiên chính sửa. Không chạy lệnh `npm` trong lúc các bài khác đang được viết song song.
2. Khối "Nhắc nhanh" khi bài cần biết trước chưa xuất bản (nhiều bài ML nền như `ml/logistic-regression`, `ml/softmax-regression`, `ml/optimizers` đang được viết ở nhánh khác).
3. Link nội bộ chỉ tới bài đã có trên `main`: 5 bài ML (`ml-overview`, `linear-regression`, `overfitting-underfitting`, `regularization`, `gradient-descent`) và 23 bài `llm/*`, cộng 8 bài `dl/*` (cùng xuất bản trong một PR, nên được link lẫn nhau). Bài ML, NLP, CV chưa có thì ghi tên, không link (quyết định 120).
4. Báo cáo có: đường dẫn file; mức kiểm chứng từng file; thuật ngữ mới cho mục "Deep Learning" của glossary; chỗ FIG/VIZ; điểm chưa chắc.
