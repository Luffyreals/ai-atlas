# Sinh ảnh (1): VAE, GAN, CycleGAN, Pix2Pix

Bài: `cv/vae-gan` (chỉ bản vi, khoảng 13 phút đọc). Bài cần biết trước trong roadmap: `dl/modern-cnn-architectures` và `math/probability-statistics`, cả hai **chưa xuất bản**, nên theo `docs/architecture/cv-lessons.md` mục 2 và quyết định 89, khối "Nhắc nhanh" dài một đoạn (phân phối, lấy mẫu, Gauss nhiều chiều chéo, kỳ vọng và Monte Carlo, độ lệch KL, autoencoder). Có một ô `PythonRunner` (NumPy), hai ô `LocalCode` (PyTorch + scikit-learn), chỗ giữ FIG `GenerativeModelsFigure` và một bảng so sánh bốn mô hình.

Ngày tra: **05–06/11/2026**. Cách tra: trang arXiv mở bằng WebFetch; PDF tải từ arXiv rồi trích chữ bằng `pdftotext -layout`, đọc các mục nêu bên dưới. Ý không có thẻ nguồn là kiến thức chung hoặc tự dẫn (có ghi rõ).

## Nguồn

- **[VAE]** Kingma, D. P., Welling, M. (2014). [*Auto-Encoding Variational Bayes*](https://arxiv.org/abs/1312.6114). arXiv:1312.6114 (v1 20/12/2013; v10 1/5/2014; bản đã đọc: v11, 10/12/2022, chỉ sửa lỗi chính tả ở tóm tắt). Trang arXiv không ghi hội nghị; năm 2014 theo thông lệ trích dẫn (ICLR 2014). Đã đọc mục 2.2 (cận dưới, phương trình 1–3), 2.3 (ước lượng SGVB; "M = 100 và L = 1"), 2.4 (mẹo tham số hóa lại, ví dụ $z = \mu + \sigma\epsilon$), mục 3 (VAE với $q$ Gauss chéo, phương trình 10; bộ giải mã Gauss hoặc Bernoulli) và phụ lục B (KL dạng đóng $-D_{\mathrm{KL}} = \frac12\sum_j(1 + \log\sigma_j^2 - \mu_j^2 - \sigma_j^2)$).
- **[VAEINTRO]** Kingma, D. P., Welling, M. (2019). [*An Introduction to Variational Autoencoders*](https://arxiv.org/abs/1906.02691). arXiv:1906.02691, Foundations and Trends in Machine Learning 12(4). Chỉ mở trang arXiv (tiêu đề, tác giả, nơi đăng); đưa vào "Đọc thêm" như tài liệu dẫn nhập, không trích nội dung.
- **[GAN]** Goodfellow, I. J., Pouget-Abadie, J., Mirza, M., Xu, B., Warde-Farley, D., Ozair, S., Courville, A., Bengio, Y. (2014). [*Generative Adversarial Networks*](https://arxiv.org/abs/1406.2661) (tiêu đề trên arXiv; bản hội nghị NIPS 2014 tên "Generative Adversarial Nets"). arXiv:1406.2661 v1, 10/6/2014. Đã đọc mục 3 (phương trình minimax 1; đoạn "log(1 − D(G(z))) saturates ... train G to maximize log D(G(z))"; Algorithm 1 với $k$ bước cho $D$, "We used k = 1"), mục 4.1 (Mệnh đề 1: $D^*_G = p_{\text{data}}/(p_{\text{data}} + p_g)$; Định lý 1: giá trị nhỏ nhất $-\log 4$ khi và chỉ khi $p_g = p_{\text{data}}$, qua độ lệch Jensen–Shannon), mục 6 ("Helvetica scenario": $G$ dồn quá nhiều $\mathbf{z}$ vào cùng một $\mathbf{x}$ nếu cập nhật $G$ quá nhiều mà không cập nhật $D$).
- **[DCGAN]** Radford, A., Metz, L., Chintala, S. (2016). [*Unsupervised Representation Learning with Deep Convolutional Generative Adversarial Networks*](https://arxiv.org/abs/1511.06434). arXiv:1511.06434 (v1 19/11/2015; v2 7/1/2016, ghi "under review as a conference paper at ICLR 2016"). Đã đọc mục 3 (hộp "Architecture guidelines for stable Deep Convolutional GANs": strided conv ở $D$, fractional-strided conv ở $G$, batchnorm cả hai, bỏ lớp kết nối đầy đủ ẩn, ReLU + Tanh ở $G$, LeakyReLU ở $D$), mục 4 (Adam, tốc độ học 0.0002, $\beta_1 = 0.5$), mục 6.3.2 (phép cộng trừ vectơ trên mẫu khuôn mặt).
- **[P2P]** Isola, P., Zhu, J.-Y., Zhou, T., Efros, A. A. (2017). [*Image-to-Image Translation with Conditional Adversarial Networks*](https://arxiv.org/abs/1611.07004). arXiv:1611.07004 (v1 21/11/2016; bản đã đọc: v3, 26/11/2018), CVPR 2017. Đã đọc mục 3.1 (phương trình 1–4: $\mathcal{L}_{\text{cGAN}}$, $\mathcal{L}_{L1}$, "L1 rather than L2 as L1 encourages less blurring"; nhiễu chỉ ở dạng dropout, bật cả lúc test, đầu ra ít ngẫu nhiên), 3.2.1 (U-Net, nối tắt lớp $i$ với lớp $n - i$), 3.2.2 (PatchGAN: phân loại từng mảnh $N \times N$ rồi lấy trung bình; L1 và L2 làm ảnh mờ), 3.3 (loss không bão hòa cho $G$, chia mục tiêu của $D$ cho 2, Adam 0.0002, $\beta_1 = 0.5$), mục 4 (tập facade 400 ảnh; ablation với $\lambda = 100$; mục 4.4 PatchGAN $70 \times 70$ tốt nhất).
- **[CYC]** Zhu, J.-Y., Park, T., Isola, P., Efros, A. A. (2017). [*Unpaired Image-to-Image Translation using Cycle-Consistent Adversarial Networks*](https://arxiv.org/abs/1703.10593). arXiv:1703.10593 (v1 30/3/2017; bản đã đọc: v7, 24/8/2020; bản mở rộng của bài ICCV 2017). Đã đọc mục 1 (ánh xạ "highly under-constrained", vô số ánh xạ $G$), mục 3.1–3.3 (mất mát GAN, mất mát chu trình chuẩn L1, hàm mục tiêu đầy đủ phương trình 3, "$\lambda = 10$"), mục 4 (thay log-likelihood bằng least-squares loss), mục 5.2 (identity loss), mục 6 (giới hạn: thay đổi hình dạng gần như thất bại, ví dụ chó ↔ mèo), phụ lục 7.1–7.2 (PatchGAN $70 \times 70$; chia mục tiêu của $D$ cho 2; bộ sinh kiểu ResNet của Johnson và cộng sự).

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| "Ảnh VAE mờ vì bộ giải mã trả trung bình của các ảnh có thể" | Là cách giải thích phổ biến, không phải kết luận của [VAE]. [P2P] mục 3.1, 3.2.2 và 4 ghi L1/L2 làm ảnh mờ, và L1 cho trung vị của phân phối có điều kiện. Ảnh mẫu của ô VAE (không có ô `#` nào) phù hợp với giải thích này | Bài trình bày như lập luận, nối với [P2P] cho L1/L2; không gán cho [VAE] |
| Tiêu đề [GAN] | arXiv ghi "Generative Adversarial Networks"; bản NIPS 2014 có tên "Generative Adversarial Nets" (theo trí nhớ, không tra trang NeurIPS) | Bài dùng tiêu đề arXiv |
| Năm của [VAE] | arXiv không ghi hội nghị; ICLR 2014 theo trí nhớ | Ghi "2014", link arXiv |
| Năm của [DCGAN] | v2 ghi "under review ... ICLR 2016"; việc được nhận không tra | Ghi "2016" như thiết kế (cv-lessons.md), link arXiv |
| Độ đa dạng thấp của Pix2Pix | [P2P] mục 3.1 nói dropout chỉ cho "minor stochasticity"; ô "Điểm yếu" trong bảng của bài ghi "đầu ra ít đa dạng" | Giữ, đúng ý tác giả |
| Diffusion "giữ được ưu điểm của cả hai ở mức đáng kể" | Nhận định chung, dẫn sang bài `cv/diffusion-models` | Viết mềm, không kèm số |

## Ý chính và công thức

Tự dẫn trong bài (khớp [VAE] phụ lục B và [GAN] mục 4.1):

- ELBO: $\log p_\theta(\mathbf{x}) = \mathcal{L}_{\text{ELBO}} + D_{\mathrm{KL}}(q_\phi(\mathbf{z}\mid\mathbf{x}) \parallel p_\theta(\mathbf{z}\mid\mathbf{x}))$, rồi $\mathcal{L}_{\text{ELBO}} = \mathbb{E}_q[\log p_\theta(\mathbf{x}\mid\mathbf{z})] - D_{\mathrm{KL}}(q_\phi \parallel p(\mathbf{z}))$. Bài dẫn bằng đẳng thức (không dùng bất đẳng thức Jensen), để thấy khoảng cách chính là KL tới hậu nghiệm thật.
- KL một chiều: $\frac12(\mu^2 + \sigma^2 - 1 - \log\sigma^2)$, từ $\mathbb{E}[(z-\mu)^2] = \sigma^2$, $\mathbb{E}[z^2] = \mu^2 + \sigma^2$.
- $D^*$: làm lớn $a\log y + b\log(1-y)$ từng điểm, $y = a/(a+b)$.
- Gradient bão hòa: $\partial_a \log(1-\sigma(a)) = -\sigma(a)$, $\partial_a \log\sigma(a) = 1 - \sigma(a)$.

Ký hiệu: $J$ số chiều của $\mathbf{z}$ (theo [VAE]); $D$ của GAN là bộ phân biệt, bài ghi rõ khác $D$ số chiều và $D_{\mathrm{KL}}$. Mục Pix2Pix dùng $\mathbf{x}$ cho ảnh nguồn, $\mathbf{y}$ cho ảnh đích (theo [P2P]); bài ghi rõ $\mathbf{y}$ là ảnh, không phải nhãn.

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05–06/11/2026, thư mục làm việc ở scratchpad. Máy phát triển rất bận trong lúc chạy (nhiều agent chạy song song), nên thời gian thực dài hơn nhiều so với lượng tính toán.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `reparam-kl.vi.py`, `reparam-kl.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`) | Ô `PythonRunner`. Nạp 2.2 giây, chạy 0.6 giây. `closed form KL = 1.1627`; Monte Carlo: n = 10 → 0.6253 (−0.5374), 100 → 1.0871 (−0.0755), 1 000 → 1.1397 (−0.0229), 10 000 → 1.1668 (+0.0041), 100 000 → 1.1656 (+0.0029); `mean of z: [1.001 -0.503]`, `std of z: [0.501 1.503]`; `grad mu MC: [1.001 -0.503]` so với `[1. -0.5]`; `grad sigma MC: [-1.497 0.84]` so với `[-1.5 0.833]`. Khớp lời văn. 39 dòng, dòng dài nhất ≤ 79 ký tự. `.en.py` là bản sao y nguyên |
| `tiny-vae.vi.py`, `tiny-vae.en.py` | chạy thật | 2026-11-05, 2026-11-06 | `.venv-cv`: Python 3.14, torch 2.15.0+cpu, scikit-learn 1.9.1, chạy với `-I -X utf8` | Ô `LocalCode`, `sampleVaries={false}`. Bản vi chạy ngày 05/11 (5 phút 43 giây khi máy rất bận), bản en chạy ngày 06/11 (6.4 giây khi máy rảnh): hai output **trùng từng dòng** (tất định với `torch.manual_seed(0)`). recon 38.65 → 27.75 → 26.45 → 24.14 → 23.07 → 22.74 (epoch 1, 5, 10, 20, 40, 60); KL 0.33 → 0.73 → 0.61 → 1.55 → 2.03 → 2.13; ảnh sinh từ $\mathbf{z} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$ in bằng ký tự, không có ô `#` nào. Kết quả mẫu trong bài chép từ lần này. 55 dòng, dòng dài nhất ≤ 79 ký tự |
| `tiny-gan.vi.py`, `tiny-gan.en.py` | chạy thật | 2026-11-06 | như trên | Ô `LocalCode`, `sampleVaries={false}`. Lần chạy đầu (bản cũ dùng `split(..., drop_last=True)`) lỗi `TypeError`, đã sửa thành `randperm(...)[:28 * 64].view(28, 64)`. Lần sau bị dừng không rõ lý do ở sau epoch 50 khi máy rất bận (output tới đó trùng lần chạy đủ). Bản vi chạy đủ ngày 06/11: 12.0 giây; bản en: 9.3 giây; hai output **trùng từng dòng**. loss D 1.229, 1.263, 1.139, 1.295, 1.268; loss G 0.571, 0.642, 0.791, 0.780, 0.785; D(real) 0.68 → 0.53; D(fake) 0.57 → 0.46 (epoch 1, 10, 25, 50, 100); đếm chữ số trong 1 000 ảnh giả: `[77 90 148 115 128 112 81 64 104 81]` (đủ 10 chữ số, không sụp mode). Không có cảnh báo hội tụ của `LogisticRegression`. 51 dòng, dòng dài nhất ≤ 79 ký tự |

`ast.parse(..., feature_version=(3, 10))` qua cho cả ba file. Công thức trong bài render bằng `node_modules/katex` ở chế độ `strict: "error"`: 0 lỗi (đã bỏ chữ tiếng Việt có dấu trong `\text{}`). Frontmatter đọc được bằng `js-yaml`: 4 câu quiz.

Bản PDF và chữ trích: `C:\Users\Dell\AppData\Local\Temp\claude\4f84e705e7298b11\a0c09d65-d7d4-455c-84cd-6993e7b18c30\scratchpad\vaegan\pdf\` (ngoài dự án, có thể bị xóa).
