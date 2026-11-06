# Sinh ảnh (2): Diffusion, Stable Diffusion, LoRA (Diffusion models)

Bài: `cv/diffusion-models` (chỉ bản vi, khoảng 13 phút đọc). Bài cần biết trước trong roadmap: `cv/vae-gan` (xuất bản cùng PR), nên khối "Nhắc nhanh" giữ 2 câu (quyết định 61, `docs/architecture/cv-lessons.md` mục 2). LoRA đã dẫn ở `llm/evaluation-peft`; bài này chỉ nhắc công thức và dùng cùng ký hiệu $\mathbf{W}_0$, $\mathbf{A} \in \mathbb{R}^{r \times d_{\text{in}}}$, $\mathbf{B} \in \mathbb{R}^{d_{\text{out}} \times r}$, $\alpha/r$. Có một ô `PythonRunner` (NumPy), hai ô `LocalCode` (PyTorch) và chỗ giữ **VIZ `DiffusionNoiseViz`** (`cv-lessons.md` mục 1.2), cộng một bảng so sánh VAE, GAN, diffusion.

Ngày tra: **05–06/11/2026**. Cách tra: trang tóm tắt arXiv và bản HTML ar5iv của từng paper (WebFetch), README và file cấu hình của `CompVis/stable-diffusion` trên GitHub, model card `CompVis/stable-diffusion-v1-4` trên Hugging Face, tài liệu và script huấn luyện LoRA của `diffusers`. Giáo án gốc buổi 9 "Image generation (2)" (chỉ tham khảo).

## Nguồn

- **[DDPM]** Ho, J., Jain, A., Abbeel, P. (2020). [*Denoising Diffusion Probabilistic Models*](https://arxiv.org/abs/2006.11239). arXiv:2006.11239 (v1 19/6/2020, v2 16/12/2020; NeurIPS 2020). Đã đọc: quá trình thuận $q(\mathbf{x}_t \mid \mathbf{x}_{t-1}) = \mathcal{N}(\sqrt{1-\beta_t}\,\mathbf{x}_{t-1}, \beta_t\mathbf{I})$, dạng đóng $q(\mathbf{x}_t \mid \mathbf{x}_0)$, $T = 1000$, $\beta$ tuyến tính $10^{-4} \to 0.02$, $L_{\text{simple}}$, Thuật toán 1 và 2, $\sigma_t^2 = \beta_t$ hoặc $\tilde\beta_t$ (kết quả tương tự), dữ liệu đưa về $[-1, 1]$, U-Net kiểu PixelCNN++ với embedding hình sin của $t$; CIFAR-10: IS 9.46, FID 3.17.
- **[DDIM]** Song, J., Meng, C., Ermon, S. (2021). [*Denoising Diffusion Implicit Models*](https://arxiv.org/abs/2010.02502). arXiv:2010.02502 (v1 6/10/2020; ICLR 2021). Cùng mục tiêu huấn luyện với DDPM; quá trình không Markov; "10× to 50× faster" theo thời gian chạy (tóm tắt).
- **[LDM]** Rombach, R., Blattmann, A., Lorenz, D., Esser, P., Ommer, B. (2022). [*High-Resolution Image Synthesis with Latent Diffusion Models*](https://arxiv.org/abs/2112.10752). arXiv:2112.10752 (v1 20/12/2021; CVPR 2022). Đã đọc: hàm mất mát trên $\mathcal{E}(\mathbf{x})$ (pt. 2), cross-attention $Q = W_Q\varphi_i(z_t)$, $K, V$ từ $\tau_\theta(y)$ (mục 3.3), $f \in \{1, \dots, 32\}$ với LDM-4 và LDM-8 tốt nhất, autoencoder KL-reg và VQ-reg; mô hình chữ-ra-ảnh của paper: BERT tokenizer + Transformer, 1.45B tham số, LAION-400M.
- **[SD]** CompVis. [*stable-diffusion* README](https://github.com/CompVis/stable-diffusion) và [`configs/stable-diffusion/v1-inference.yaml`](https://github.com/CompVis/stable-diffusion/blob/main/configs/stable-diffusion/v1-inference.yaml). README: autoencoder hệ số 8, U-Net 860M, bộ mã hóa chữ CLIP ViT-L/14 đóng băng 123M, pretrain $256 \times 256$ rồi tinh chỉnh $512 \times 512$, tập con LAION-5B, `--scale 7.5` mặc định. Cấu hình: `linear_start: 0.00085`, `linear_end: 0.0120`, `timesteps: 1000`, `channels: 4`, `model_channels: 320`, `channel_mult: [1, 2, 4, 4]`, `attention_resolutions: [4, 2, 1]`, `num_res_blocks: 2`, `transformer_depth: 1`, `context_dim: 768`. Lịch "linear" của repo là tuyến tính theo căn bậc hai: [`ldm/modules/diffusionmodules/util.py`](https://github.com/CompVis/stable-diffusion/blob/main/ldm/modules/diffusionmodules/util.py), `make_beta_schedule`: `torch.linspace(linear_start ** 0.5, linear_end ** 0.5, n_timestep) ** 2` (đã mở 06/11/2026).
- **[SDCARD]** Rombach, R., Esser, P. [*CompVis/stable-diffusion-v1-4* model card](https://huggingface.co/CompVis/stable-diffusion-v1-4). Latent $H/f \times W/f \times 4$, $f = 8$; bộ mã hóa chữ ViT-L/14; loss là tái tạo nhiễu; "10 % dropping of the text-conditioning" cho classifier-free guidance.
- **[CFG]** Ho, J., Salimans, T. (2022). [*Classifier-Free Diffusion Guidance*](https://arxiv.org/abs/2207.12598). arXiv:2207.12598 (26/7/2022; bản ngắn ở NeurIPS 2021 Workshop on Deep Generative Models). Pt. 6: $\tilde\epsilon = (1+w)\epsilon_\theta(z, c) - w\,\epsilon_\theta(z)$; token rỗng $\varnothing$ với xác suất $p_{\text{uncond}}$ (0.1 và 0.2 tốt như nhau, 0.5 kém hơn); tăng $w$ đổi đa dạng lấy chất lượng.
- **[LORA]** Hu, E. J., Shen, Y., Wallis, P., Allen-Zhu, Z., Li, Y., Wang, S., Wang, L., Chen, W. (2022). [*LoRA: Low-Rank Adaptation of Large Language Models*](https://arxiv.org/abs/2106.09685). arXiv:2106.09685 (ICLR 2022). Đã dùng ở `llm/evaluation-peft`; bài này chỉ nhắc.
- **[DIFFLORA]** Hugging Face. [*LoRA* (diffusers training guide)](https://huggingface.co/docs/diffusers/training/lora) và [`train_text_to_image_lora.py`](https://github.com/huggingface/diffusers/blob/main/examples/text_to_image/train_text_to_image_lora.py): `target_modules=["to_k", "to_q", "to_v", "to_out.0"]`, `--rank` mặc định 4.
- **[DB]** Ruiz, N., Li, Y., Jampani, V., Pritch, Y., Rubinstein, M., Aberman, K. (2023). [*DreamBooth: Fine Tuning Text-to-Image Diffusion Models for Subject-Driven Generation*](https://arxiv.org/abs/2208.12242). arXiv:2208.12242 (v1 25/8/2022; CVPR 2023). "Just a few images", từ định danh riêng, prior preservation loss.

## Chưa xác minh

- "Hệ số guidance quá cao làm ảnh gắt màu, méo" (hộp Lỗi hay gặp thứ ba): kinh nghiệm phổ biến khi dùng Stable Diffusion; paper [CFG] chỉ nói đa dạng giảm và FID tăng lại ở $w$ lớn. Có thể bỏ nửa câu "gắt màu" nếu reviewer muốn chỉ giữ ý có nguồn.
- "Trong thực tế người ta hay ghép DreamBooth với LoRA": tài liệu [DIFFLORA] có script `train_dreambooth_lora.py` và câu "LoRA can also be combined with other training techniques like DreamBooth"; "hay" là nhận định chung.
- Độ dài 77 token của bộ mã hóa chữ CLIP không ghi trong bài (cố ý), chỉ ghi `context_dim: 768`.

## Ý chính

- Dạng đóng dẫn bằng "tổng Gauss độc lập là Gauss, phương sai cộng lại": $\alpha_t(1-\alpha_{t-1}) + 1 - \alpha_t = 1 - \alpha_t\alpha_{t-1}$, lặp lại ra $\bar\alpha_t$.
- Hệ số $\sqrt{\alpha_t}$ giữ phương sai bằng 1 (variance preserving).
- DDIM tất định ($\sigma = 0$): $\hat{\mathbf{x}}_0$ từ nhiễu dự đoán, rồi $\mathbf{x}_{t'} = \sqrt{\bar\alpha_{t'}}\hat{\mathbf{x}}_0 + \sqrt{1-\bar\alpha_{t'}}\,\epsilon_\theta$ (pt. 12 của [DDIM] với $\sigma_t = 0$).
- Latent $512 \times 512 \times 3 \to 64 \times 64 \times 4$: nhỏ hơn 48 lần (tự tính).
- CFG: $(1+w)\epsilon_c - w\epsilon_\varnothing = \epsilon_\varnothing + s(\epsilon_c - \epsilon_\varnothing)$, $s = 1 + w$.
- LoRA $r = 4$ trên 32 lớp attention của U-Net SD v1: 797 184 tham số, khoảng 0.093% của 859 520 964; khoảng 3.2 MB ở fp32 (tự tính).

## Kiểm chứng code

Code của bài do `lesson-writer` chạy ngày 2026-11-06, thư mục làm việc ở scratchpad. Ô `PythonRunner` chạy bằng Pyodide thật (`runpyo.mjs`, quyết định 61). Ba file `.en.py` là bản sao y nguyên của `.vi.py` (chưa dịch). Mọi file qua `ast.parse(..., feature_version=(3, 10))`, mọi dòng ≤ 79 ký tự.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `forward-noise.vi.py` | chạy thật | 2026-11-06 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`) | Ô `PythonRunner`, 34 dòng. Nạp 13.2 s, chạy 12.0 s (gồm tải scikit-learn, matplotlib). In $\sqrt{\bar\alpha_t}$ / $\sqrt{1-\bar\alpha_t}$: t=100 0.9471/0.3209, t=250 0.7239/0.6899, t=500 0.2803/0.9599, t=1000 0.0064/1.0000; từng bước t=500: mean 0.2742, std 0.9624; dạng đóng 0.2803, 0.9599. Có một hình (5 ảnh). Khớp lời văn, bảng Lý thuyết và các bước "Hãy thử" |
| `tiny-ddpm.vi.py` | chạy thật | 2026-11-06 | Python 3.14 (`.venv-cv`), torch 2.15.0+cpu, scikit-learn 1.9.1 | `LocalCode`, 52 dòng. 1 phút 53 giây trên máy phát triển. Loss 0.895 → 0.192 … 0.243 (bước 5000); noise: mean dist 0.262, 35% trong 0.1; mẫu: 0.042, 90%. Kết quả mẫu trong bài chép từ lần này. Một lần chạy trước đó (cùng file) dừng với mã 1 sau 6 phút, không in gì, lúc máy bận nhiều agent; chạy lại bản 200 bước và bản đủ đều xong bình thường |
| `lora-attention.vi.py` | chạy thật | 2026-11-06 | Python 3.14 (`.venv-cv`), torch 2.15.0+cpu | `LocalCode`, 51 dòng, 4.5 s. `full 696640, LoRA r=4: 13824`, `same output at init: True`, `797184`, `0.093%`. Output tất định (`sampleVaries={false}`) |
| (đối chiếu) `scratchpad/diff/count_sd.py` | chạy thật | 2026-11-06 | `.venv-cv` + diffusers 0.42.1, peft 0.21.2 cài `--target` vào scratchpad (không đụng venv) | Dựng `UNet2DConditionModel` theo cấu hình SD v1 (không tải trọng số): 859 520 964 tham số; `add_adapter(LoraConfig(r=4, target_modules=["to_k","to_q","to_v","to_out.0"]))` cho 797 184 tham số huấn luyện. Trùng `lora-attention.vi.py` |
