# Self-supervised learning với ảnh (Self-Supervised Learning for Images)

Bài: `cv/self-supervised-learning` (chỉ bản vi, khoảng 12 phút đọc). Bài cần biết trước trong roadmap: `cv/vision-transformer` và `cv/image-augmentation`, cả hai xuất bản cùng PR nên link được; khối "Nhắc nhanh" giữ 2 câu (quyết định 61, `docs/architecture/cv-lessons.md` mục 2). Có một ô `PythonRunner` (NumPy: hàm mất mát NT-Xent), một ô `LocalCode` (PyTorch: SimCLR tí hon trên `load_digits` rồi linear probe) và chỗ giữ cho hình `SelfSupervisedFigure` (cv-lessons.md mục 4), kèm bảng so sánh ba họ phương pháp.

Ngày tra: **05/11/2026**. Cách tra: tải PDF từ arXiv, trích chữ bằng `pdftotext -layout`, đọc các mục ghi bên dưới; trang tóm tắt arXiv mở bằng WebFetch. Ý không có thẻ nguồn là kiến thức chung hoặc "tự tính" (có ghi rõ). Giáo án gốc: chỉ tham khảo.

## Nguồn

- **[ROT]** Gidaris, S., Singh, P., Komodakis, N. (2018). [*Unsupervised Representation Learning by Predicting Image Rotations*](https://arxiv.org/abs/1803.07728). arXiv:1803.07728, ICLR 2018. Đã đọc tóm tắt và mục 2: bốn góc xoay 0, 90, 180, 270 độ, bài toán phân loại 4 lớp.
- **[JIG]** Noroozi, M., Favaro, P. (2016). [*Unsupervised Learning of Visual Representations by Solving Jigsaw Puzzles*](https://arxiv.org/abs/1603.09246). arXiv:1603.09246, ECCV 2016. Đã đọc mục 3: 9 mảnh, $9! = 362\,880$ hoán vị, dùng một tập con 1 000 hoán vị chọn theo khoảng cách Hamming; mô hình đoán số thứ tự hoán vị. Mục 3 bàn về "đường tắt" (shortcut) như thống kê cấp thấp giữa các mảnh.
- **[SIMCLR]** Chen, T., Kornblith, S., Norouzi, M., Hinton, G. (2020). [*A Simple Framework for Contrastive Learning of Visual Representations*](https://arxiv.org/abs/2002.05709). arXiv:2002.05709, ICML 2020. Đã đọc mục 2.1 (công thức NT-Xent, $2(N-1)$ mẫu âm), mục 3 (bảng 1, hình 5, 6: crop + color distortion), mục 4.2 (projection head), mục 5 (bảng 5: nhiệt độ; hình 9: batch), phụ lục B.1, B.8.
- **[MOCO]** He, K., Fan, H., Wu, Y., Xie, S., Girshick, R. (2020). [*Momentum Contrast for Unsupervised Visual Representation Learning*](https://arxiv.org/abs/1911.05722). arXiv:1911.05722, CVPR 2020. Đã đọc mục 3 (hàng đợi, cập nhật động lượng, giả mã Algorithm 1) và mục 4.1 (ablation $K$ và $m$).
- **[BYOL]** Grill, J.-B., Strub, F., Altché, F. và cộng sự (2020). [*Bootstrap Your Own Latent: A New Approach to Self-Supervised Learning*](https://arxiv.org/abs/2006.07733). arXiv:2006.07733, NeurIPS 2020. Đã đọc mục 1 (thí nghiệm mạng ngẫu nhiên cố định: 1.4% → 18.8%), mục 3.1 (online, target, predictor, MSE trên vectơ chuẩn hóa, stop-gradient), mục 3.2 ($\tau_{\text{base}} = 0.996$, batch 4096).
- **[DINO]** Caron, M., Touvron, H., Misra, I., Jégou, H., Mairal, J., Bojanowski, P., Joulin, A. (2021). [*Emerging Properties in Self-Supervised Vision Transformers*](https://arxiv.org/abs/2104.14294). arXiv:2104.14294, ICCV 2021. Đã đọc tóm tắt, hình 1, mục 3.1 (tự chắt lọc, multi-crop, teacher EMA, centering, sharpening), mục 3.2 (nhiệt độ), mục 5.3 (collapse).
- **[MAE]** He, K., Chen, X., Xie, S., Li, Y., Dollár, P., Girshick, R. (2022). [*Masked Autoencoders Are Scalable Vision Learners*](https://arxiv.org/abs/2111.06377). arXiv:2111.06377, CVPR 2022. Đã đọc tóm tắt, mục 3 (che ngẫu nhiên, encoder chỉ thấy patch còn lại, decoder nhẹ, loss chỉ trên patch bị che, pixel chuẩn hóa), mục 4.1 (bảng 1), mục 4.2, 4.3 (linear probe và partial fine-tune).
- **[DINOV2]** Oquab, M., Darcet, T., Moutakanni, T. và cộng sự (2023). [*DINOv2: Learning Robust Visual Features without Supervision*](https://arxiv.org/abs/2304.07193). arXiv:2304.07193, TMLR 01/2024. Đã đọc tóm tắt, mục 3 (bộ dữ liệu LVD-142M) và mục 4 (ghép loss DINO và iBOT). Bài chỉ nhắc.
- **[CLIP]** Radford, A. và cộng sự (2021). [*Learning Transferable Visual Models From Natural Language Supervision*](https://arxiv.org/abs/2103.00020). arXiv:2103.00020. Chỉ dùng để nối với bài `cv/clip-blip-glip` (đã có nguồn ở `docs/research/multimodal.md`).

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Kích thước hàng đợi và giá trị $m$ mặc định của MoCo | Đã xác minh trong [MOCO] mục 4.1: $K = 65\,536$, $m = 0.999$, $\tau = 0.07$; $m = 0$ thì loss dao động, không hội tụ | Ghi trong bài |
| 76.5% của SimCLR | [SIMCLR] bảng 6: 76.5% là **ResNet-50 (4×)** (rộng gấp 4); ResNet-50 thường là 69.3% (bảng 6). Tóm tắt nói "khớp ResNet-50 có giám sát" | Bài ghi rõ "ResNet-50 rộng gấp 4" |
| Linear probe của MAE | [MAE] mục 4.3: MoCo v3 có linear probe cao hơn, nhưng partial fine-tune kém hơn MAE; tác giả nói linear probe và fine-tune "phần lớn không tương quan" | Bài chỉ nói định tính: MAE yếu hơn ở linear probe, mạnh khi fine-tune |
| Số cụ thể của DINOv2 | Không dùng số benchmark; chỉ nhắc LVD-142M và ghép loss DINO + iBOT | Chỉ nhắc |
| iBOT (Zhou và cộng sự, 2022) | Chưa mở paper | Không link; chỉ nhắc tên theo [DINOV2] |
| Hình attention map của DINO | Không chép hình; mô tả bằng lời theo hình 1 của [DINO] (ViT-S/8, attention của `[CLS]` ở các đầu của lớp cuối) | Mô tả bằng lời |

## Ý chính

- **Vì sao tự giám sát.** Ảnh không nhãn rẻ, nhãn đắt. Tạo một bài toán phụ (pretext task) mà nhãn sinh ra từ chính ảnh; học xong thì bỏ bài toán phụ, giữ bộ mã hóa. Đánh giá bằng **linear probe** (đóng băng bộ mã hóa, chỉ học một lớp tuyến tính trên đặc trưng; [SIMCLR] mục 2.3 gọi là "linear evaluation protocol") hoặc **fine-tune** cả mạng.
- **Pretext cổ điển.** [ROT]: xoay ảnh 0/90/180/270 độ, mạng đoán góc. Muốn đoán đúng phải biết vật nằm "đúng chiều" ra sao. [JIG]: cắt 9 mảnh, xáo theo một trong 1 000 hoán vị, mạng đoán hoán vị. Điểm yếu chung: mạng tìm đường tắt cấp thấp ([JIG] mục 3 tự bàn).
- **SimCLR [SIMCLR].** Lô $N$ ảnh, mỗi ảnh hai phép augmentation → $2N$ góc nhìn; với mỗi cặp dương, $2(N-1)$ góc nhìn còn lại là mẫu âm. Encoder $f$ cho $\mathbf{h}$, projection head $g$ (MLP một lớp ẩn, ReLU) cho $\mathbf{z}$. Loss NT-Xent trên cosine chia $\tau$. Sau huấn luyện **bỏ** $g$, dùng $\mathbf{h}$: $\mathbf{h}$ tốt hơn $\mathbf{z}$ hơn 10% (mục 4.2). Ghép crop + color distortion quan trọng nhất (mục 3, hình 5); chỉ crop thì histogram màu đủ để nhận ra hai mảnh cùng ảnh (hình 6). Batch 256 tới 8192 (8192 cho 16 382 mẫu âm mỗi cặp dương); batch lớn lợi nhiều khi ít epoch (hình 9). Bảng 5: có chuẩn hóa ℓ2, $\tau$ = 0.05 / 0.1 / 0.5 / 1 cho top-1 59.7 / 64.4 / 60.7 / 58.0 (100 epoch, batch 4096); không chuẩn hóa: 57.2 / 57.0. Phụ lục B.8: train lâu (> 300 epoch) thì $\tau$ tốt nhất trong {0.1, 0.5, 1.0} là 0.5. Augmentation màu mạnh giúp SimCLR nhưng không giúp (thậm chí hại) học có giám sát (bảng 1).
- **MoCo [MOCO].** Xem học đối chiếu như tra từ điển: truy vấn $\mathbf{q}$, khóa dương $\mathbf{k}_+$, các khóa âm. Từ điển là **hàng đợi** khóa của các lô trước ($K = 65\,536$), nên số mẫu âm không bị giới hạn bởi batch. Encoder khóa cập nhật **động lượng**: $\boldsymbol\theta_k \leftarrow m\boldsymbol\theta_k + (1-m)\boldsymbol\theta_q$, $m = 0.999$, để các khóa trong hàng đợi nhất quán. Ablation ($K = 4096$): $m$ = 0 / 0.9 / 0.99 / 0.999 / 0.9999 → fail / 55.2 / 57.8 / 59.0 / 58.9.
- **BYOL [BYOL].** Hai mạng: online (encoder, projector, **predictor**) và target (encoder, projector, là EMA của online). Online dự đoán vectơ target của góc nhìn kia; loss MSE trên vectơ chuẩn hóa $= 2 - 2\cos$; gradient chỉ qua online (stop-gradient). Không mẫu âm. Mạng ngẫu nhiên cố định làm target: 1.4% → học dự đoán nó được 18.8% (động lực của BYOL). 74.3% linear eval với ResNet-50.
- **DINO [DINO].** Tự chắt lọc không nhãn: student và teacher cùng kiến trúc, đầu ra softmax $K$ chiều; teacher = EMA của student ($\lambda$ từ 0.996 tới 1, lịch cosine). Multi-crop: 2 góc nhìn toàn cục $224^2$ (> 50% ảnh) và nhiều góc nhìn cục bộ $96^2$ (< 50%); teacher chỉ thấy góc nhìn toàn cục ("cục bộ sang toàn cục"). Chống sụp đổ (collapse) bằng **centering** ($\mathbf{c} \leftarrow m\mathbf{c} + (1-m)\cdot$ trung bình lô của đầu ra teacher, trừ vào logit teacher) và **sharpening** (nhiệt độ teacher thấp: $\tau_t$ khởi động 0.04 → 0.07 trong 30 epoch đầu, $\tau_s = 0.1$). Centering chống một chiều thống trị nhưng đẩy về phân phối đều; sharpening ngược lại; cả hai cân bằng nhau (mục 3.1, 5.3). Hình 1: attention của `[CLS]` ở lớp cuối của ViT-S/8 tự tách vật khỏi nền dù không có nhãn. ViT-B: 80.1% linear; ViT-S: 78.3% k-NN.
- **MAE [MAE].** Cắt patch như ViT, che ngẫu nhiên 75%; encoder ViT **chỉ** nhận 25% patch còn lại (không có mask token); decoder nhẹ (dưới 10% tính toán mỗi token so với encoder) nhận patch đã mã hóa cộng mask token, tái tạo pixel; loss MSE chỉ trên patch bị che; mục tiêu pixel chuẩn hóa theo từng patch giúp tốt hơn. Huấn luyện nhanh hơn từ 3 lần. ViT-H fine-tune 87.8% (ảnh 448, chỉ ImageNet-1K). Linear probe yếu hơn phương pháp đối chiếu (MoCo v3), partial fine-tune mạnh hơn; fine-tune chỉ một khối cuối của ViT-L: 73.5% → 81.0%.
- **DINOv2 [DINOV2].** Mở rộng DINO: dữ liệu tuyển chọn LVD-142M (142 triệu ảnh), ghép loss mức ảnh của DINO với loss mức patch của iBOT; đặc trưng dùng thẳng (đóng băng) cho nhiều tác vụ.
- **Nối CLIP.** CLIP là học đối chiếu giữa hai phương thức: cặp dương là (ảnh, chú thích), mẫu âm là các chú thích khác trong lô. SimCLR là cùng ý trong một phương thức: cặp dương là hai góc nhìn của cùng ảnh.

## Công thức quan trọng

Ký hiệu của bài: lô $N$ ảnh, $2N$ góc nhìn đánh số $1, \dots, 2N$; $\mathbf{h} = f(\tilde{\mathbf{x}})$, $\mathbf{z} = g(\mathbf{h})$; $\mathrm{sim}(\mathbf{u}, \mathbf{v}) = \mathbf{u}^\top\mathbf{v} / (\lVert\mathbf{u}\rVert\lVert\mathbf{v}\rVert)$; nhiệt độ $\tau$ (theo [SIMCLR], cv-lessons.md mục 2).

$$\ell_{i,j} = -\log \frac{\exp(\mathrm{sim}(\mathbf{z}_i, \mathbf{z}_j)/\tau)}{\sum_{k=1}^{2N} \mathbb{1}_{[k \ne i]} \exp(\mathrm{sim}(\mathbf{z}_i, \mathbf{z}_k)/\tau)}$$

Loss của lô là trung bình $\ell$ trên mọi cặp dương, cả $(i, j)$ lẫn $(j, i)$. Tự tính: khi $\tau \to \infty$ mọi số hạng bằng nhau, $\ell \to \log(2N-1)$.

EMA (MoCo, BYOL, DINO): $\boldsymbol\theta' \leftarrow m\boldsymbol\theta' + (1-m)\boldsymbol\theta$.

BYOL: $\lVert \bar{q} - \bar{z}' \rVert_2^2 = 2 - 2\cos(q, z')$ với $\bar{\cdot}$ là vectơ chuẩn hóa.

MAE: $\mathcal{L} = \frac{1}{|\mathcal{M}|}\sum_{i \in \mathcal{M}} \lVert \hat{\mathbf{x}}_i - \mathbf{x}_i \rVert^2$ trên tập patch bị che $\mathcal{M}$ (dạng chung của MSE; paper ghi "MSE between reconstructed and original images in the pixel space, only on masked patches").

## Thuật ngữ đề xuất

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Bài toán phụ | Pretext task | Dịch, lần đầu kèm "pretext task". Bài toán tự đặt ra, nhãn sinh từ chính dữ liệu, chỉ để học biểu diễn |
| Linear probe | Linear probe, linear evaluation | Giữ. Đóng băng bộ mã hóa, chỉ học một bộ phân loại tuyến tính trên đặc trưng, để đo chất lượng biểu diễn |
| Góc nhìn | View | Dịch, lần đầu kèm "view". Một bản augmentation của ảnh trong học đối chiếu |
| Cặp dương, mẫu âm | Positive pair, negative example | Dịch. Hai góc nhìn của cùng ảnh; góc nhìn của ảnh khác |
| Projection head | Projection head | Giữ. MLP nhỏ sau encoder, loss tính trên đầu ra của nó; bỏ đi sau khi học xong. Khác projector của LLM đa phương thức |
| Encoder động lượng | Momentum encoder | Giữ "encoder", dịch "động lượng". Bản sao của encoder, trọng số là EMA của encoder chính |
| Sụp đổ biểu diễn | Representation collapse | Dịch, lần đầu kèm "collapse". Mọi ảnh cho cùng một vectơ: loss thấp mà biểu diễn vô dụng |
| Tự chắt lọc | Self-distillation | Dịch. Chắt lọc tri thức mà thầy là bản EMA của chính trò, như DINO |
| Mô hình hóa ảnh bị che | Masked image modeling | Dịch, lần đầu kèm tiếng Anh. Che một phần ảnh rồi đoán lại, như MAE |
| Stop-gradient | Stop-gradient | Giữ. Coi một nhánh là hằng số khi lan truyền ngược |

## Kiểm chứng code

Code của bài do `lesson-writer` chạy ngày 05–06/11/2026, thư mục làm việc ở scratchpad. `.en.py` là bản sao y nguyên của `.vi.py` (`cmp` trùng).

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `nt-xent.vi.py`, `nt-xent.en.py` | chạy thật | 2026-11-06 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`) | Ô `PythonRunner`. Nạp khoảng 1.4–2.2 giây, chạy dưới 0.5 giây. `log(2N-1) = 1.946`; cosine cặp dương 0.99 (gần) và 0.22 (xa); loss theo $\tau$ = 0.05 / 0.1 / 0.5 / 1.0 / 10.0: gần 0.000 / 0.002 / 0.627 / 1.166 / 1.858, xa 7.087 / 3.765 / 1.877 / 1.864 / 1.933. Hai bản cho output trùng. Khớp lời văn. `ast.parse(..., feature_version=(3, 10))` qua; 34 dòng, dòng dài nhất 71 ký tự |
| `simclr-digits.vi.py`, `simclr-digits.en.py` | chạy thật | 2026-11-06 | `.venv-cv`: Python 3.14, torch 2.15.0+cpu, scikit-learn 1.9.1, `torch.manual_seed(0)`, chạy với `-I` | Ô `LocalCode`, `sampleVaries={false}`: hai lần chạy cho output trùng từng số. 17 giây (máy rảnh) tới 45 giây (máy bận, nhiều agent chạy song song). `last NT-Xent loss: 1.428`; 100 nhãn: ngẫu nhiên 0.740, SimCLR 0.840; 898 nhãn: ngẫu nhiên 0.843, SimCLR 0.918. Kết quả mẫu trong bài chép từ lần này. `ast.parse` qua; 60 dòng, dòng dài nhất 74 ký tự. Khối ```python 5 dòng trong bài chép đúng từ file (đã kiểm từng dòng) |
| (thử nghiệm) `scratchpad/ssl/code/raw.py` | chạy thật | 2026-11-06 | `.venv-cv` | Mốc "điểm ảnh thô + hồi quy logistic" với cùng cách chia: 100 nhãn 0.874, 898 nhãn 0.963. Số này được nêu trong hộp "Lỗi hay gặp" (ghi rõ "tự chạy, không có trong file") |
| (thử nghiệm) `scratchpad/ssl/code/exp1.py`, `exp2.py`, `exp3.py` | chạy thật | 2026-11-05/06 | `.venv-cv` | Các bản thử trước: CNN có global average pooling (rất chậm khi máy bận, features gần hằng số nên probe không chuẩn hóa chỉ đạt mức đoán bừa); MLP và CNN với $\mathbf{h}$ 64 chiều: SimCLR chỉ hơn encoder ngẫu nhiên vài phần nghìn đến vài phần trăm, có lúc thua. Chọn $\mathbf{h}$ 16 chiều và dịch theo từng mẫu bằng `affine_grid` để khác biệt rõ |

Thư mục scratchpad: `C:\Users\Dell\AppData\Local\Temp\claude\4f84e705e7298b11\a0c09d65-d7d4-455c-84cd-6993e7b18c30\scratchpad\ssl\` (`pdf\` chứa PDF và bản chữ trích, `code\` chứa bản thử). Nằm ngoài dự án, có thể bị xóa.
