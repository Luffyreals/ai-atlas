# Họ LLaMA: RoPE, huấn luyện song song (The LLaMA Family)

Bài: `llm/llama-family` (chỉ bản vi, khoảng 13 phút đọc). Bài cần biết trước trong roadmap: `llm/build-first-llm`. Có một ô `PythonRunner` (NumPy, kiểm tính chất tương đối của RoPE), một ô `LocalCode` (PyTorch, RMSNorm + SwiGLU + RoPE) và hình `ParallelismFigure` (`docs/architecture/llm-lessons.md` mục 2.9; dùng lại được ở `llm-deployment`).

Ngày tra: **24/10/2026**. Cách tra: tải PDF từ arXiv, trích chữ bằng `pdftotext`, đọc các mục nêu bên dưới; chạy thật Python trong scratchpad. Ý không có thẻ nguồn là kiến thức chung hoặc suy ra từ công thức (có ghi rõ "tự tính").

## Nguồn

Đều đã tải và đọc đoạn liên quan (không đọc kỹ cả bài).

- **[L1]** Touvron, H., Lavril, T., Izacard, G., Martinet, X., Lachaux, M.-A., Lacroix, T., Rozière, B., Goyal, N., Hambro, E., Azhar, F., Rodriguez, A., Joulin, A., Grave, E., Lample, G. (2023). [*LLaMA: Open and Efficient Foundation Language Models*](https://arxiv.org/abs/2302.13971). arXiv:2302.13971. Đã đọc mục 2 (dữ liệu, kiến trúc, tối ưu, cài đặt hiệu quả).
- **[L2]** Touvron, H., Martin, L., Stone, K., và cộng sự (2023). [*Llama 2: Open Foundation and Fine-Tuned Chat Models*](https://arxiv.org/abs/2307.09288). arXiv:2307.09288 (bản đã đọc: v2, 19/7/2023). Đã đọc mục 2.1, bảng 1, 2, phụ lục A.2.1 (ngữ cảnh, GQA), thẻ mô hình (giấy phép).
- **[L3]** Grattafiori, A., Dubey, A., Jauhri, A., và cộng sự (Llama Team, AI @ Meta) (2024). [*The Llama 3 Herd of Models*](https://arxiv.org/abs/2407.21783). arXiv:2407.21783 (v1 31/7/2024; trang arXiv hiện ở v3, 23/11/2024). Đã đọc mục 1, 3.2 (kiến trúc), 3.3.2 (song song), phần mở rộng ngữ cảnh. Lưu ý: tất cả kết quả trong paper là của **Llama 3.1** (paper nói rõ ở phần giới thiệu), nên "Llama 3" và "Llama 3.1" trong giáo án là cùng một đợt mô hình.
- **[RMS]** Zhang, B., Sennrich, R. (2019). [*Root Mean Square Layer Normalization*](https://arxiv.org/abs/1910.07467). arXiv:1910.07467 (v1, 16/10/2019). Đã đọc tóm tắt và phương trình (4).
- **[GLU]** Shazeer, N. (2020). [*GLU Variants Improve Transformer*](https://arxiv.org/abs/2002.05202). arXiv:2002.05202 (12/2/2020). Đã đọc cả bài ngắn (công thức FFN-SwiGLU, bảng perplexity).
- **[ROPE]** Su, J., Lu, Y., Pan, S., Murtadha, A., Wen, B., Liu, Y. (2021). [*RoFormer: Enhanced Transformer with Rotary Position Embedding*](https://arxiv.org/abs/2104.09864). arXiv:2104.09864 (bản đã đọc: v5, 8/11/2023). Đã đọc mục 3.1 đến 3.4.
- **[GQA]** Ainslie, J., Lee-Thorp, J., de Jong, M., Zemlyanskiy, Y., Lebrón, F., Sanghai, S. (2023). [*GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints*](https://arxiv.org/abs/2305.13245). arXiv:2305.13245 (bản đã đọc: v3, 23/12/2023). Đã đọc tóm tắt và mục 2.
- **[MEG]** Shoeybi, M., Patwary, M., Puri, R., LeGresley, P., Casper, J., Catanzaro, B. (2019). [*Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism*](https://arxiv.org/abs/1909.08053). arXiv:1909.08053 (bản đã đọc: v4, 13/3/2020). Đã đọc tóm tắt và mục 3 (chia MLP và attention).
- **[GPIPE]** Huang, Y., Cheng, Y., Bapna, A., Firat, O., Chen, M. X., Chen, D., Lee, H., Ngiam, J., Le, Q. V., Wu, Y., Chen, Z. (2019). [*GPipe: Easy Scaling with Micro-Batch Pipeline Parallelism*](https://arxiv.org/abs/1811.06965). arXiv:1811.06965 (bản đã đọc: v5, 25/7/2019). Đã đọc tóm tắt, mục 2 (micro-batch, tái tính, "bubble").
- **[ZERO]** Rajbhandari, S., Rasley, J., Ruwase, O., He, Y. (2020). [*ZeRO: Memory Optimizations Toward Training Trillion Parameter Models*](https://arxiv.org/abs/1910.02054). arXiv:1910.02054 (bản đã đọc: v3, 13/5/2020). Đã đọc mục 1, 3 và 5.1 đến 5.3 (ba giai đoạn chia).

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Tên hội nghị/tạp chí của [RMS], [ROPE], [GQA], [GPIPE], [ZERO], [MEG] | Chỉ xác minh trang arXiv. (Gợi ý từ trí nhớ, chưa tra: RMSNorm NeurIPS 2019, GQA EMNLP 2023, GPipe NeurIPS 2019, ZeRO SC20, RoFormer đăng tạp chí Neurocomputing 2024.) | Ghi "arXiv:..., năm". Chỉ ghi nơi đăng nếu có người tra. Chú ý: [L2] dẫn RoFormer là "Su et al. 2022" (bản đăng), còn arXiv là 2021: ghi **2021 (arXiv)** để khớp link. |
| Ngày nộp arXiv v1 của [L1] | Văn bản PDF không ghi ngày. | Chỉ ghi "2023". |
| Độ dài ngữ cảnh của Llama 1 | Không có trong [L1] đã đọc; [L2] bảng 1 và phụ lục ghi "2k" (2048) cho Llama 1. | Ghi "2048, theo [L2]". |
| Cỡ từ vựng của Llama 1 và Llama 2 | Không tìm thấy trong phần đã đọc. | Không ghi. Chỉ ghi từ vựng 128 000 của Llama 3 [L3]. |
| Kích thước lớp FFN thực tế của Llama 1/2 | [L1] chỉ nói "2/3·4d"; số làm tròn trong mã nguồn phát hành không có trong paper. | Chỉ nói "khoảng $\tfrac{2}{3}\cdot 4d$ ở Llama 1". Llama 3 có số trong [L3] bảng 3 (xem bên dưới), và số đó **không** bằng $\tfrac{2}{3}\cdot 4d$. |
| Điều khoản của giấy phép Llama (hạn chế, ngưỡng người dùng...) | Chưa đọc văn bản giấy phép. | Chỉ nêu có: Llama 2 có "custom commercial license" [L2 thẻ mô hình]; Llama 3 có "Llama 3 Community License" [L3 mục 1]. Không mô tả điều khoản. Llama 1: paper không nêu giấy phép, không ghi. |
| Cách ghép cặp chiều của RoPE trong mã Llama phát hành | [ROPE] ghép chiều **liền kề** $(2i-1, 2i)$. Nhiều bản cài đặt Llama ghép nửa đầu với nửa sau của vectơ (hoán vị chiều, tương đương toán học). Chưa mở mã nguồn trong lần tra này. | Bài dạy cách ghép liền kề như [ROPE] và nói một câu "một số thư viện xếp chiều khác nhưng cùng ý". Hoặc bỏ câu đó nếu không kiểm. |
| Chi tiết Megatron-LM ngoài MLP/attention (embedding, cân bằng GPU) | Chỉ đọc lướt. | Bài chỉ dùng ý chia theo cột/hàng. |
| Tính "đúng" của các đoạn dưới đây ghi "tự tính" | Do `summarizer` tính từ số trong paper. | Có ghi cách tính, `lesson-writer` chạy lại nếu dùng. |

## Ý chính

Kiến trúc: LLaMA vẫn là Transformer chỉ có decoder như GPT (`build-first-llm`), với vài thay đổi đã có sẵn từ các paper trước. Bài nên nói rõ: **phần lớn "khác biệt" là tinh chỉnh nhỏ, và [L3] tự nhận vậy.**

- **Ba thay đổi của Llama 1 [L1 mục 2.2].** (1) Chuẩn hóa **trước** mỗi khối con (pre-norm) và dùng RMSNorm thay LayerNorm; (2) hàm kích hoạt **SwiGLU** thay ReLU, với chiều ẩn $\tfrac{2}{3}\cdot 4d$ thay vì $4d$; (3) bỏ embedding vị trí tuyệt đối, thay bằng **RoPE** ở **mỗi lớp** (cộng vào q và k trong attention, không cộng vào đầu vào một lần).
- **RMSNorm [RMS].** Giả thuyết của tác giả: lợi ích của LayerNorm đến từ việc co giãn (chia cho độ lớn), không phải việc trừ trung bình. Bỏ phép trừ trung bình thì rẻ hơn mà vẫn giữ tính bất biến khi nhân đầu vào với một hằng số. Paper báo cáo giảm thời gian chạy "7% đến 64%" tùy mô hình (so với LayerNorm, chủ yếu trên RNN và các mô hình họ đã thử, không phải riêng LLM). Tự kiểm bằng PyTorch: RMSNorm cho đầu ra có RMS bằng 1 và `norm(x) = norm(3x)`.
- **SwiGLU [GLU].** Lớp FFN thường là $\sigma(\mathbf{x}\mathbf{W}_1)\mathbf{W}_2$. GLU thêm một nhánh "cổng": hai phép chiếu tuyến tính, một nhánh qua hàm Swish, rồi nhân từng phần tử. Có **ba** ma trận thay vì hai, nên để giữ số tham số cố định, [GLU] giảm chiều ẩn đi hệ số $\tfrac{2}{3}$. Đó là lý do có $\tfrac{2}{3}\cdot 4d$. Trong thí nghiệm của [GLU], GEGLU và SwiGLU cho perplexity tốt nhất trong các biến thể đã thử (bảng 1 của paper; mô hình dịch seq2seq nhỏ, không phải LLM hiện đại). Paper không giải thích "vì sao": chỉ ghi nhận kết quả. Bài nên nói vậy.
- **RoPE [ROPE].** Ý chính: thay vì **cộng** vectơ vị trí vào embedding, ta **xoay** vectơ truy vấn và khóa một góc tỉ lệ với vị trí. Sau khi xoay, tích vô hướng $\mathbf{q}_m^\top \mathbf{k}_n$ chỉ còn phụ thuộc $m-n$ (vị trí tương đối) cộng với nội dung của q và k. Chi tiết toán ở mục "Công thức". Tính chất phụ: [ROPE] chứng minh cận trên của độ lớn tích vô hướng **giảm dần** khi khoảng cách tăng (với $\theta_i=10000^{-2(i-1)/d}$), và tự nhận là mong muốn cho ngôn ngữ ("long-term decay"). Chỉ là **cận**, không phải đảm bảo cho từng cặp.
- **GQA [GQA].** Khi sinh văn bản, mô hình lưu K và V của mọi token trước (KV cache). Bộ nhớ này phình theo ngữ cảnh và cỡ lô. Multi-query attention (MQA) dùng **một** đầu K/V cho mọi đầu truy vấn: nhanh, nhưng có thể giảm chất lượng. **GQA** ở giữa: chia các đầu truy vấn thành nhóm, mỗi nhóm dùng chung một đầu K/V. Paper còn đề xuất "uptraining": đổi một checkpoint MHA sang MQA/GQA bằng khoảng 5% tính toán huấn luyện gốc (khởi tạo bằng cách lấy trung bình các đầu K/V). Chú ý: chưa xác minh Llama 2 có dùng uptraining hay không; [L2] chỉ nói đã huấn luyện thử các biến thể GQA/MQA từ đầu trong thí nghiệm của họ (xem bên dưới). Bài không nói gì về chuyện này.
- **Llama 1 [L1].** Bốn cỡ: 6,7B, 13,0B, 32,5B, 65,2B tham số (bảng 2; paper gọi tắt 7B, 13B, 33B, 65B). Huấn luyện 1,0T token cho hai cỡ nhỏ và 1,4T token cho hai cỡ lớn; cỡ lô 4M token; tối ưu AdamW, $\beta_1=0{,}9$, $\beta_2=0{,}95$, weight decay 0,1, cắt gradient 1,0. Chỉ dùng dữ liệu **công khai** (CommonCrawl 67%, C4 15%, GitHub, Wikipedia, sách, ArXiv, StackExchange; bảng 1). Luận điểm trung tâm: một mô hình nhỏ huấn luyện **lâu hơn mức "tối ưu tính toán"** có thể tốt hơn khi suy luận, vì chi phí suy luận tính theo cỡ mô hình. Tóm tắt của [L1]: LLaMA-13B vượt GPT-3 (175B) trên phần lớn benchmark.
- **Llama 2 [L2].** Giữ kiến trúc của Llama 1, đổi: dữ liệu mới (tăng 40%), 2,0T token, **ngữ cảnh gấp đôi (2048 lên 4096)**, và **GQA ở cỡ 34B và 70B** (bảng 1). Cỡ 7B, 13B dùng attention nhiều đầu thường. Bản 34B được huấn luyện nhưng **không phát hành**. Phụ lục A.2.1: GQA với 8 đầu K/V cho kết quả "comparable" với MHA ở thí nghiệm 30B 150B token và tốt hơn MQA trung bình; tác giả nêu thêm lý do suy luận: khi chia attention theo đầu qua nhiều GPU (tensor parallel), MQA có ít đầu hơn số GPU nên không chia được. Có thêm Llama 2-Chat (fine-tune đối thoại), phần đó thuộc bài RLHF.
- **Llama 3 [L3].** Mục 3.2 tự nói kiến trúc "không khác nhiều" Llama và Llama 2; cải thiện đến chủ yếu từ **chất lượng dữ liệu và quy mô**. Thay đổi nhỏ: GQA với **8 đầu K/V** ở mọi cỡ (kể cả 8B); mặt nạ attention chặn các tài liệu khác nhau trong cùng một chuỗi; từ vựng **128K** (100K của tiktoken + 28K thêm; nén 3,94 ký tự/token so với 3,17 của Llama 2 trên mẫu tiếng Anh); **RoPE base 500 000** (thay 10 000) để hỗ trợ ngữ cảnh dài hơn. Cỡ: 8B, 70B, 405B (126 lớp, chiều 16 384, 128 đầu attention). Mô hình 405B huấn luyện trên **15,6T token**, ngữ cảnh 128K (mở rộng dần từ 8K ở cuối giai đoạn pre-train, sáu bước).
- **Bảng 3 của [L3] (đã đọc từ PDF).** 8B: 32 lớp, chiều 4 096, FFN 14 336, 32 đầu, 8 đầu K/V; 70B: 80 lớp, chiều 8 192, FFN 28 672, 64 đầu, 8 đầu K/V; 405B: 126 lớp, chiều 16 384, FFN 53 248, 128 đầu, 8 đầu K/V. Kích hoạt SwiGLU, từ vựng 128 000, RoPE $\theta=500\,000$. Tốc độ học đỉnh $3\times10^{-4}$, $1{,}5\times10^{-4}$, $8\times10^{-5}$. Tự tính: FFN 14 336 là khoảng 3,5 lần chiều 4 096, không phải $\tfrac{8}{3}\approx 2{,}67$ lần: Llama 3 **không** dùng đúng quy tắc $\tfrac{2}{3}\cdot 4d$ (paper không giải thích lý do ở phần đã đọc).
- **Giấy phép.** [L2]: "custom commercial license" (thẻ mô hình); [L3]: "Llama 3 Community License". Bài chỉ nêu: trọng số được phát hành theo giấy phép riêng của Meta, **không** phải giấy phép mã nguồn mở chuẩn; người đọc đọc giấy phép gốc trước khi dùng. Không tóm tắt điều khoản.

Huấn luyện song song: lý do chung là một mô hình lớn (và trạng thái tối ưu của nó) không vừa bộ nhớ một GPU, và một GPU quá chậm.

- **Data parallel (DP).** Mỗi GPU giữ **cả mô hình**, xử lý một phần dữ liệu khác nhau, rồi các GPU **cộng gộp gradient** (all-reduce) và cập nhật cùng một bước. Dễ dùng, nhưng không giảm bộ nhớ trên mỗi GPU [ZERO mục 1].
- **Tensor parallel (TP) [MEG].** Chia **ma trận của một lớp** ra nhiều GPU. Với MLP: chia ma trận thứ nhất theo **cột** (mỗi GPU tính một phần của kích hoạt, độc lập, không cần nói chuyện), chia ma trận thứ hai theo **hàng**, rồi một phép cộng gộp (all-reduce) cho ra kết quả. Với attention: mỗi GPU lo một số đầu. Kết quả: khoảng hai all-reduce ở chiều thuận cho mỗi khối Transformer, nên cần **kết nối nhanh** giữa các GPU, thường trong một máy. [MEG]: mô hình 8,3 tỷ tham số, 512 GPU (chia mô hình 8 cách), duy trì 15,1 PetaFLOPs, hiệu suất mở rộng 76%.
- **Pipeline parallel (PP) [GPIPE].** Chia mô hình theo **chiều sâu**: GPU 1 giữ các lớp đầu, GPU 2 các lớp tiếp theo... Để các GPU không ngồi chờ, mỗi lô nhỏ được cắt thành nhiều **micro-batch** nối đuôi nhau. Vẫn còn "bong bóng" (bubble) lúc đầu và cuối: tỉ lệ thời gian rảnh là $\tfrac{K-1}{M+K-1}$ với $K$ giai đoạn và $M$ micro-batch. Paper: bong bóng "không đáng kể" khi $M\ge 4K$. [GPIPE] còn dùng tái tính (re-materialization) để giảm bộ nhớ kích hoạt. Dùng được qua kết nối chậm hơn, vì chỉ chuyền kích hoạt giữa hai giai đoạn kề nhau [L3 mục 6.1 cho lý do này khi suy luận].
- **ZeRO/FSDP [ZERO].** Data parallel lãng phí: mỗi GPU giữ trùng một bản đầy đủ của tham số, gradient và trạng thái tối ưu. ZeRO **chia** những thứ đó giữa các GPU theo ba giai đoạn: (1) chia trạng thái tối ưu ($P_{os}$), (2) thêm gradient ($P_{os+g}$), (3) thêm tham số ($P_{os+g+p}$). Giữ nguyên tính chất của data parallel (mỗi GPU vẫn xử lý dữ liệu riêng), và paper nói giai đoạn 3 tốn thêm khoảng 50% lưu lượng liên lạc so với DP thường. FSDP (Fully Sharded Data Parallel) là tên cài đặt của PyTorch cho ý tưởng này; [L3] gọi "fully sharded data parallelism" và dẫn [ZERO] cùng hai tài liệu khác làm gốc.
- **Llama 3 dùng cả bốn kiểu cùng lúc: "4D parallelism" [L3 mục 3.3.2].** Tensor, pipeline, **context** (chia chuỗi vào thành các đoạn, giảm bộ nhớ cho ngữ cảnh rất dài) và data (FSDP). Thứ tự lồng nhau từ trong ra ngoài: [TP, CP, PP, DP]; FSDP ở ngoài cùng vì chịu được độ trễ mạng lớn hơn. 405B huấn luyện trên tới **16K GPU H100** (80GB, 700W), MFU (tỉ lệ khai thác tính toán của GPU) 38% đến 43% tùy cấu hình. Bài chỉ cần giữ ý: chọn kiểu song song theo **cái gì nằm vừa trong bộ nhớ** và **đường truyền nào nhanh** (trong máy: TP; giữa các máy: PP/DP).
- **Llama 1 [L1 mục 2.4].** Bản 65B: khoảng 380 token/giây/GPU trên **2048 GPU A100 80GB**, huấn luyện 1,4T token mất khoảng **21 ngày**. Tự kiểm: $380\times2048\times86\,400\times21\approx1{,}41\times10^{12}$, khớp 1,4T. Dùng được làm ví dụ "số liệu có thật" cho cảm giác quy mô. [L1] còn dùng mô hình và chuỗi song song và che phủ liên lạc bằng tính toán (không đi sâu).
- **Llama 2 [L2 bảng 2].** Tổng 3,3 triệu giờ GPU A100-80GB; riêng 70B: **1 720 320** giờ GPU; 7B: 184 320 giờ. (Đơn vị là giờ GPU, không phải giờ đồng hồ.)

## Công thức quan trọng

Ký hiệu theo site và quyết định 53, 54, 59, 60: độ dài chuỗi $L$ (không dùng $T$, vì $T$ là nhiệt độ), vectơ chữ đậm. Ghi chú này viết $d$ cho chiều mô hình như các paper, hàng $\mathbf{x}\in\mathbb{R}^d$ là một vectơ token. **Bài** viết $D$ cho chiều mô hình và $d = D/H$ cho số chiều mỗi đầu attention (RoPE và KV cache dùng $d$ theo nghĩa này).

**RMSNorm** [RMS pt. (4)] (đơn giản hơn LayerNorm vì không trừ trung bình; $\mathbf{g}$ là hệ số co giãn học được; $\epsilon$ nhỏ để tránh chia cho 0, [L1] và mã thực tế có, [RMS] ghi dạng thuần):

$$\mathrm{RMS}(\mathbf{x})=\sqrt{\frac{1}{d}\sum_{i=1}^{d}x_i^2+\epsilon},\qquad \bar{x}_i=\frac{x_i}{\mathrm{RMS}(\mathbf{x})}\,g_i$$

Nhân $\mathbf{x}$ với hằng $c>0$ thì $\mathrm{RMS}$ cũng nhân $c$ (bỏ qua $\epsilon$), nên đầu ra **không đổi**. Cần giải thích bằng lời: chuẩn hóa chỉ giữ "hướng" của vectơ, rồi $\mathbf{g}$ cho mô hình tự chọn độ lớn từng chiều.

**FFN-SwiGLU** [GLU], bỏ bias; $\mathbf{W},\mathbf{V}\in\mathbb{R}^{d\times d_{\text{ff}}}$, $\mathbf{W}_2\in\mathbb{R}^{d_{\text{ff}}\times d}$, $\odot$ là nhân từng phần tử:

$$\mathrm{FFN}_{\mathrm{SwiGLU}}(\mathbf{x})=\big(\mathrm{Swish}(\mathbf{x}\mathbf{W})\odot\mathbf{x}\mathbf{V}\big)\mathbf{W}_2,\qquad \mathrm{Swish}(u)=u\,\sigma(u)$$

($\sigma$ là hàm sigmoid; [GLU] viết $\mathrm{Swish}_1$, tham số $\beta=1$.) Ba ma trận, nên $d_{\text{ff}}\approx\tfrac{2}{3}\cdot4d$ giữ số tham số gần bằng FFN hai ma trận với $4d$: $2\cdot d\cdot 4d=3\cdot d\cdot\tfrac{8d}{3}$ (tự kiểm).

**RoPE, trường hợp hai chiều** [ROPE mục 3.2]. Xoay vectơ 2 chiều $\mathbf{x}=(x_1,x_2)$ một góc $m\theta$ ($m$ là vị trí token):

$$R(m\theta)\,\mathbf{x}=\begin{pmatrix}\cos m\theta & -\sin m\theta\\ \sin m\theta & \cos m\theta\end{pmatrix}\begin{pmatrix}x_1\\ x_2\end{pmatrix}$$

**Tính chất tương đối.** Ma trận xoay thỏa $R(a)^\top R(b)=R(b-a)$ (xoay ngược $a$ rồi xoay xuôi $b$ = xoay $b-a$). Nên với truy vấn $\mathbf{q}$ ở vị trí $m$ và khóa $\mathbf{k}$ ở vị trí $n$:

$$\big\langle R(m\theta)\mathbf{q},\,R(n\theta)\mathbf{k}\big\rangle=\mathbf{q}^\top R(m\theta)^\top R(n\theta)\,\mathbf{k}=\mathbf{q}^\top R\big((n-m)\theta\big)\,\mathbf{k}$$

Kết quả chỉ phụ thuộc $n-m$ (đổi chiều là đổi dấu góc, cùng độ lớn khoảng cách), và nội dung $\mathbf{q},\mathbf{k}$. Dịch cả hai vị trí cùng một đoạn thì điểm không đổi: đúng là "vị trí tương đối". Cách nhìn số phức (trực giác, chưa có trong [ROPE] đoạn đã đọc, tự suy): coi $(x_1,x_2)$ là $x_1+ix_2$, xoay là nhân với $e^{im\theta}$; tích vô hướng là $\mathrm{Re}\big(q\,\bar{k}\,e^{i(m-n)\theta}\big)$.

**RoPE, $d$ chiều** [ROPE pt. (15)–(16), tóm gọn]. Với $d$ chẵn, ghép các chiều thành $d/2$ cặp liền kề; cặp thứ $i$ ($i=1,\dots,d/2$) xoay với góc $m\theta_i$, mỗi cặp một tần số khác nhau:

$$\theta_i=b^{-2(i-1)/d},\qquad b=10\,000\ \text{(Llama 1, 2; Llama 3 dùng } b=500\,000\text{)}$$

Cặp đầu xoay nhanh (tần số cao, nhạy khoảng cách gần), cặp cuối xoay chậm (tần số thấp, nhạy khoảng cách xa). Điểm attention sau xoay vẫn chỉ phụ thuộc $m-n$, vì là tổng của $d/2$ số hạng dạng trên. Vị trí **không** được cộng vào embedding đầu vào: RoPE áp lên $\mathbf{q}$ và $\mathbf{k}$ (không áp lên $\mathbf{v}$) ở mỗi lớp [L1].

Hai hệ quả dễ kiểm: xoay **bảo toàn độ dài** vectơ ($\|R\mathbf{x}\|=\|\mathbf{x}\|$) và khi $m=n$ điểm bằng $\mathbf{q}^\top\mathbf{k}$ (không xoay). Cả hai đã kiểm bằng NumPy (xem dưới).

**GQA, cách tính KV cache** (tự suy từ định nghĩa, kiểm bằng số của [L3]). Với $N_{\text{layer}}$ lớp, $h_{kv}$ đầu K/V, chiều mỗi đầu $d_h$, $b_{\text{byte}}$ byte mỗi số, cỡ cache cho **một token**:

$$2\cdot N_{\text{layer}}\cdot h_{kv}\cdot d_h\cdot b_{\text{byte}}\quad(\text{hệ số 2 là K và V})$$

Llama 3 8B: $N_{\text{layer}}=32$, $h_{kv}=8$, $d_h=4096/32=128$ (tự suy, giả định chiều mỗi đầu bằng chiều ẩn chia số đầu), BF16 ($b_{\text{byte}}=2$): $2\cdot32\cdot8\cdot128\cdot2=131\,072$ byte (128 KiB) cho một token, tức đúng **1 GiB cho 8192 token**. Nếu có 32 đầu K/V (attention nhiều đầu thường) thì gấp **4 lần**: 512 KiB/token. (Tự tính, đã chạy bằng Python. Là minh họa cho "GQA giảm KV cache", không phải số đo từ paper.)

**Bong bóng pipeline** [GPIPE]: $K$ giai đoạn, $M$ micro-batch, tỉ lệ thời gian rảnh:

$$\text{bubble}=\frac{K-1}{M+K-1}$$

Tự tính: $K=4$: $M=4$ cho 3/7, khoảng 43%; $M=16$ cho 3/19, khoảng 16%. Nhiều micro-batch hơn thì bong bóng nhỏ hơn.

**Bộ nhớ trạng thái mô hình khi huấn luyện Adam, độ chính xác hỗn hợp** [ZERO mục 3, hình 1]. $\Psi$ tham số; tham số fp16 ($2\Psi$ byte), gradient fp16 ($2\Psi$), trạng thái tối ưu ($K\Psi$ byte, $K=12$ cho Adam hỗn hợp: bản sao fp32 của tham số, momentum, phương sai). Mỗi GPU của data parallel thường: $(2+2+K)\Psi=16\Psi$ byte. Với $N_d$ GPU data parallel:

| Chia | Byte mỗi GPU |
|---|---|
| Không chia (data parallel thường) | $(2+2+K)\Psi$ |
| ZeRO giai đoạn 1: chia trạng thái tối ưu | $\left(2+2+\tfrac{K}{N_d}\right)\Psi$ |
| ZeRO giai đoạn 2: thêm gradient | $\left(2+\tfrac{2+K}{N_d}\right)\Psi$ |
| ZeRO giai đoạn 3: thêm tham số | $\tfrac{(2+2+K)\Psi}{N_d}$ |

Ví dụ trong [ZERO hình 1]: $\Psi=7{,}5$ tỷ, $N_d=64$: **120 GB** (không chia), **31,4 GB**, **16,6 GB**, **1,9 GB**. Tự kiểm: $16\times7{,}5=120$; $(4+12/64)\times7{,}5=31{,}4$. Ghi chú: các số này chỉ gồm "trạng thái mô hình", chưa gồm kích hoạt. Bài chỉ cần bảng này ở mức khái niệm: chia thêm thì tiết kiệm bộ nhớ hơn nhưng GPU phải trao đổi thêm.

**Các số của Llama không có công thức, chỉ có trong bảng:** dùng bảng "Số liệu" bên dưới.

## Số tự chạy (Python, ngày 24/10/2026)

Máy phát triển, `.venv-llm`: Python 3.14.5, torch 2.14.1+cpu, NumPy dùng chung.

### Ô `PythonRunner` đề xuất (NumPy, kiểm tính chất tương đối của RoPE)

Ý: $d=8$ (4 cặp), hàm `rope(x, pos)` xoay từng cặp $(x_{2i},x_{2i+1})$ một góc $\text{pos}\cdot\theta_i$ với $\theta_i=10000^{-2i/d}$ (chỉ số $i$ bắt đầu từ 0), `np.random.default_rng(0)` sinh $\mathbf{q},\mathbf{k}\in\mathbb{R}^8$. Chạy thật, kết quả:

| Phép tính | Giá trị |
|---|---|
| $\mathbf{q}^\top\mathbf{k}$ (không xoay) | $-1{,}467987$ |
| $m=5,\ n=2$ ($m-n=3$) | $-1{,}586475$ |
| $m=105,\ n=102$ ($m-n=3$) | $-1{,}586475$ |
| $m=1005,\ n=1002$ ($m-n=3$) | $-1{,}586475$ |
| $m=5,\ n=3$ ($m-n=2$) | $-1{,}763129$ |
| $m=7,\ n=2$ ($m-n=5$) | $-1{,}142699$ |
| $\|\mathbf{q}\|$ trước và sau khi xoay ở vị trí 1000 | $1{,}862653$ và $1{,}862653$ |
| $m=n=9$: điểm có bằng $\mathbf{q}^\top\mathbf{k}$? | `True` |

Đọc: ba cặp cùng $m-n=3$ cho **cùng điểm** (tới 6 chữ số thập phân in ra) dù vị trí tuyệt đối là 5, 105 hay 1005; đổi $m-n$ thì điểm đổi. Điểm khác $-1{,}467987$ chứng tỏ xoay có tác dụng. Mã chạy tức thì (NumPy), khoảng 25 dòng kể cả phần in. Kịch bản đã chạy ở `scratchpad/llama/rope_np.py` (đường dẫn đầy đủ ở cuối file này); `lesson-writer` chép vào `src/code/llm/llama-family/` rồi chạy lại để ghi vào bảng kiểm chứng. Ghi chú: các số thập phân chỉ khớp ở mức in 6 chữ số; nếu bài so sánh bằng `==` thì sai, dùng `np.isclose`.

### Ô `LocalCode` đề xuất (PyTorch: RMSNorm + RoPE)

Gồm: lớp `RMSNorm` (tham số $\mathbf{g}$, $\epsilon=10^{-6}$), hàm `rope(x)` cho tensor `(batch, L, heads, d)` (ghép chiều liền kề, như [ROPE]), thử hai việc. 46 dòng, `torch.manual_seed(0)`, torch CPU, **khoảng 17 giây** (phần lớn là thời gian nạp torch). Kết quả:

- RMS của đầu ra RMSNorm trên 3 token đầu: `1.0000, 1.0000, 1.0000`.
- `norm(x)` và `norm(x*3)` giống nhau (`allclose`, sai số $10^{-5}$): `True`.
- Với cùng $\mathbf{q}$ và cùng $\mathbf{k}$ lặp lại ở 6 vị trí: điểm $(m=3,n=1)=2{,}10734$ và $(m=5,n=3)=2{,}10734$; `allclose` là `True`.
- `RMSNorm(16)` có 16 tham số (chỉ $\mathbf{g}$).

Cùng kịch bản ở `scratchpad/llama/torch_demo.py`. Chưa chạy `.en.py` (bài chỉ bản vi). Chưa có file nào trong `src/code/`: `summarizer` không tạo.

### Số tính tay đã kiểm bằng Python

| Đại lượng | Giá trị |
|---|---|
| $380\times2048\times86\,400\times21/10^{12}$ (token, từ số của [L1]) | 1,412 (nghìn tỷ token), khớp 1,4T |
| KV cache một token, Llama 3 8B, 8 đầu K/V, BF16 | 131 072 byte (128 KiB); 8192 token cho đúng 1,0 GiB |
| Cùng cấu hình nếu có 32 đầu K/V | 524 288 byte (512 KiB) mỗi token, gấp 4 |
| Bong bóng pipeline $(K,M)=(4,4),(4,16),(8,32)$ | 0,429; 0,158; 0,179 |
| ZeRO, $\Psi=7{,}5$ tỷ, $N_d=1$ và $N_d=64$ giai đoạn 1 | 120,0 GB và 31,4 GB |

## Số liệu của paper (để dựng bảng so sánh trong bài)

Chỉ ghi số có trong paper. Ô trống nghĩa là không tìm thấy trong phần đã đọc, **không** điền từ trí nhớ.

| | Llama 1 [L1] | Llama 2 [L2] | Llama 3 [L3] |
|---|---|---|---|
| Cỡ (tham số) | 6,7B; 13,0B; 32,5B; 65,2B | 7B; 13B; 70B phát hành; 34B huấn luyện, không phát hành | 8B; 70B; 405B |
| Token huấn luyện | 1,0T (hai cỡ nhỏ), 1,4T (hai cỡ lớn) | 2,0T | 405B: 15,6T |
| Ngữ cảnh | 2048 (theo [L2]) | 4096 | 8K ở pre-train, mở rộng tới 128K |
| Chuẩn hóa | RMSNorm, pre-norm | RMSNorm, pre-norm | (không nêu thay đổi) |
| FFN | SwiGLU, $\tfrac{2}{3}\cdot4d$ | SwiGLU | SwiGLU, FFN 14 336 / 28 672 / 53 248 |
| Vị trí | RoPE mỗi lớp | RoPE | RoPE, $\theta=500\,000$ |
| Attention | nhiều đầu | GQA ở 34B, 70B | GQA, 8 đầu K/V mọi cỡ |
| Từ vựng | | | 128 000 |
| Tính toán | 2048 A100 80GB, khoảng 21 ngày cho 65B, 380 token/s/GPU | 3,3M giờ GPU A100-80GB; 70B: 1 720 320 giờ GPU | tới 16K GPU H100 80GB; MFU 38% đến 43% |
| Giấy phép | (không nêu trong paper) | "custom commercial license" | "Llama 3 Community License" |

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; "(gợi ý)" là của `summarizer`.

- **RoPE như kim đồng hồ (gợi ý).** Mỗi cặp chiều là một mặt đồng hồ; mỗi token xoay kim một góc tùy vị trí. Hai token cách nhau 3 vị trí luôn lệch nhau cùng một góc, ở bất kỳ chỗ nào trong câu. Mỗi cặp có tốc độ xoay riêng, như kim giây, kim phút, kim giờ: kim nhanh phân biệt khoảng cách gần, kim chậm phân biệt khoảng cách xa. Ô NumPy trên chính là kiểm chứng "cùng độ lệch thì cùng điểm".
- **So với embedding vị trí tuyệt đối (gợi ý).** Embedding tuyệt đối gắn cho mỗi vị trí một "nhãn" cộng vào token; mô hình phải tự học rằng "vị trí 5 và 3" tương tự "vị trí 105 và 103". RoPE đưa điều đó vào cấu trúc tính toán. Nói thẳng: [ROPE] cũng là một trong nhiều cách mã hóa vị trí tương đối, và bài không so sánh chúng.
- **Chỉ xoay q và k, không xoay v (gợi ý).** Điểm attention là tích q·k nên mới cần "độ lệch"; v chỉ là nội dung được lấy ra, không cần biết vị trí.
- **GQA như chung tủ sách (gợi ý).** MHA: mỗi đầu truy vấn có thư viện riêng (K, V). MQA: cả lớp dùng chung một thư viện. GQA: mỗi nhóm đầu dùng chung một thư viện. Thư viện nhỏ đi thì cái phải mang theo khi sinh văn bản (KV cache) nhẹ đi. Dùng ví dụ số 1 GiB so với 4 GiB cho 8192 token ở trên.
- **Bốn cách chia một việc (gợi ý, nối với `ParallelismFigure`).** Hình ba hàng cùng một mô hình có $L$ lớp: DP chia **dữ liệu** (mỗi GPU cả mô hình, một mẩu dữ liệu), TP chia **ma trận trong một lớp** (mỗi GPU một nửa ma trận), PP chia **các lớp** (GPU 1 lớp đầu, GPU 2 lớp sau). Ẩn dụ: nhà bếp làm 100 suất ăn: nhiều bếp giống nhau mỗi bếp 25 suất (DP); mỗi món do hai đầu bếp cùng làm (TP); dây chuyền sơ chế, nấu, bày (PP). Chữ trong hình ngắn; phần nói về FSDP và "context parallel" đặt ở lời văn, không vào hình (hình theo kế hoạch chỉ có ba kiểu).
- **Vì sao ZeRO có ích (gợi ý).** 8 GPU cùng cất giữ cùng một bản sao: giống 8 người cùng giữ một cuốn sổ ghi chép giống hệt. ZeRO chia cuốn sổ thành 8 phần, mỗi người giữ một phần, ai cần trang nào thì hỏi người giữ. Tiết kiệm giấy, đổi lấy việc phải nói chuyện nhiều hơn. Số 120 GB so với 1,9 GB cho 7,5B tham số làm ví dụ.
- **Bài học về chiến lược (gợi ý).** Chuyển từ "thêm kiến trúc phức tạp" sang "thêm dữ liệu và quy mô": [L3] tự nói kiến trúc Llama 3 không khác nhiều Llama 2, tăng ở dữ liệu (15,6T token so với 2,0T). Tự tính: gấp khoảng 7,8 lần. Nối tới `llm/pretraining-data`.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Nghĩ RoPE "mã hóa vị trí vào embedding".** Không: RoPE xoay q và k ngay trong attention, ở **mỗi lớp**. Embedding đầu vào không chứa thông tin vị trí.
2. **Nghĩ RoPE làm điểm attention chỉ phụ thuộc khoảng cách.** Sai: điểm vẫn phụ thuộc nội dung q và k; chỉ phần ảnh hưởng của **vị trí** là tương đối. Nói "tính chất tương đối" chứ không phải "chỉ theo khoảng cách".
3. **Nghĩ RoPE tự cho phép ngữ cảnh dài tùy ý.** Mô hình chỉ được huấn luyện tới một độ dài; vượt xa thì chất lượng có thể giảm. Llama 3 phải **huấn luyện thêm** từ 8K lên 128K theo sáu bước [L3]. Cơ số $\theta = 500\,000$ đã đặt ngay từ đầu pre-train ([L3] bảng 3), **không** phải một bước của giai đoạn mở rộng ngữ cảnh. Đừng suy ra thêm gì khác.
4. **Quên RoPE cần số chiều chẵn.** Chiều mỗi đầu phải chẵn để ghép cặp (suy ra từ cách làm).
5. **Nhầm "RMSNorm nhanh hơn" với "chắc chắn tốt hơn".** [RMS] giả thuyết rằng bỏ trừ trung bình là đủ và báo cáo tăng tốc; mức tăng 7% đến 64% tùy mô hình và không phải riêng cho LLM. Không nói "tốt hơn LayerNorm" tuyệt đối.
6. **Nhầm vị trí chuẩn hóa.** Pre-norm đặt chuẩn hóa **trước** mỗi khối con (attention, FFN), trong nhánh dư; bản Transformer gốc đặt sau (post-norm). [L1] nói chọn pre-norm "để cải thiện độ ổn định huấn luyện".
7. **Nghĩ SwiGLU là "một loại ReLU".** SwiGLU có thêm một nhánh cổng và thêm một ma trận; $\tfrac{2}{3}$ bù lại số tham số.
8. **Nhầm GQA với MQA hoặc nghĩ GQA giảm số đầu truy vấn.** GQA giữ nguyên số đầu truy vấn, chỉ giảm số đầu **K/V**. Nó giảm bộ nhớ KV cache và băng thông khi suy luận, không giảm nhiều số tham số (và Llama 2 còn tăng FFN trong thí nghiệm để bù, [L2 phụ lục]).
9. **Cho rằng Llama là "mở mã nguồn" kiểu MIT/Apache.** Trọng số có giấy phép riêng của Meta ([L2], [L3]). Gọi là "open weights" (mở trọng số) hay "open-source" là tranh luận, bài chỉ nêu có giấy phép riêng. (Không dẫn nguồn cho tranh luận này.)
10. **Nhầm các kiểu song song.** Data parallel không giúp mô hình vừa bộ nhớ (mỗi GPU vẫn giữ cả mô hình). Tensor parallel cần đường truyền nhanh. Pipeline có bong bóng. ZeRO/FSDP là data parallel **có chia** trạng thái, không phải model parallel.
11. **Nhầm "nhiều GPU hơn" với "nhanh hơn tương ứng".** Bảng 4 của [L3]: từ 8 192 lên 16 384 GPU (cùng chuỗi 8 192), sức tính mỗi GPU giảm từ 430 xuống 400 TFLOPs, nên tổng chỉ nhanh khoảng $2 \times 400/430 \approx 1.86$ lần (tự tính). MFU 43% ở 8 192 GPU nghĩa là hơn một nửa sức tính lý thuyết không được dùng (trao đổi dữ liệu, bong bóng, phép tính không chạy hết công suất...); MFU so với đỉnh lý thuyết, không phải hiệu suất mở rộng. Không dùng "76% scaling efficiency" của [MEG] làm ví dụ: đó là weak scaling (tăng cỡ mô hình theo số GPU), không phải giữ nguyên mô hình rồi thêm GPU.
12. **Nhầm 3.1 với 3.** Giáo án ghi "LLAMA 3.1". [L3] ghi kết quả của Llama 3.1. Trong bài, dùng "Llama 3 (3.1)" một lần rồi gọn.
13. **Nhầm cỡ "7B" với 7,0 tỷ chính xác.** [L1] bảng 2 ghi 6,7B, 13,0B, 32,5B, 65,2B; tên gọi chỉ là tên tắt.
14. **Trộn $L$ và $T$.** Độ dài chuỗi là $L$; $T$ chỉ nhiệt độ (quyết định 60). Không ghi $T$ cho độ dài khi nói về RoPE hay KV cache.

## Điểm cần phiên chính chốt (câu hỏi cho người dùng)

1. **Ghép cặp chiều của RoPE:** ghép liền kề như [ROPE] (đề xuất, khớp ký hiệu bài) hay nửa đầu với nửa sau như nhiều bản cài đặt Llama (chưa kiểm)? Đề xuất giữ liền kề.
2. **`ParallelismFigure` có cần ô thứ tư cho FSDP/ZeRO hay chỉ ba kiểu (data, tensor, pipeline) như kế hoạch?** Đề xuất ba kiểu trong hình, ZeRO/FSDP bằng bảng bộ nhớ trong lời.
3. **Có đưa bảng so sánh Llama 1, 2, 3 (mục "Số liệu của paper") vào bài hay không?** Đề xuất có, dùng bảng Markdown, giữ ô trống ghi "không nêu".
4. **Ví dụ KV cache và ZeRO là số tự tính từ công thức và số trong paper:** có giữ làm ví dụ (kèm "tự tính")? Đề xuất giữ vì dễ hình dung quy mô.

## Liên quan tới bài nào

- **Cần biết trước:** `llm/build-first-llm` (GPT decoder-only, mặt nạ nhân quả, vòng lặp huấn luyện). Gián tiếp `dl/transformers` (self-attention nhiều đầu, q, k, v), `ml/gradient-descent` (gradient, tối ưu), `math/` (ma trận, tích vô hướng, ma trận xoay).
- **Trước:** `llm/gpt-family-finetuning` (GPT-1/2 và fine-tune; bài này kế thừa kiến trúc).
- **Sau:** `llm/deepseek-family` (MoE, có `llama-family` làm bài cần biết trước), `llm/multimodal` (Llama làm LLM nền; có `llama-family` và `cv/llava` làm bài cần biết trước), `llm/llm-deployment` (dùng lại `ParallelismFigure`; KV cache, tensor và pipeline parallel khi suy luận), `llm/pretraining-data` (dữ liệu quyết định nhiều hơn kiến trúc), `llm/evaluation-peft` (LoRA, lượng tử hóa trên mô hình Llama).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Chuẩn hóa căn bậc hai trung bình bình phương | Root mean square layer normalization (RMSNorm) | Giữ "RMSNorm" |
| Hàm cổng tuyến tính (GLU), SwiGLU | Gated linear unit, SwiGLU | Giữ "SwiGLU" |
| Mã hóa vị trí xoay | Rotary position embedding (RoPE) | Giữ "RoPE", gloss "mã hóa vị trí xoay" lần đầu |
| Attention truy vấn theo nhóm | Grouped-query attention (GQA) | Giữ "GQA", gloss lần đầu |
| Attention một truy vấn | Multi-query attention (MQA) | Giữ "MQA" |
| Bộ nhớ đệm K/V | KV cache | Giữ "KV cache" |
| Song song dữ liệu | Data parallelism | Dịch, gloss lần đầu |
| Song song tensor | Tensor parallelism | Dịch ("tensor" giữ nguyên) |
| Song song đường ống | Pipeline parallelism | Dịch; "pipeline" giữ nguyên khi đứng một mình |
| Chia nhỏ hoàn toàn | Fully sharded data parallel (FSDP) | Giữ "FSDP"; "shard" giữ nguyên |
| Bong bóng (pipeline) | Pipeline bubble | Dịch, gloss |
| Tỉ lệ khai thác tính toán | Model FLOPs utilization (MFU) | Giữ "MFU" |
| Trọng số mở | Open weights | Dịch, gloss |

## Đọc thêm đề xuất

Đều đã mở và đọc phần liên quan.

1. **Su và cộng sự (2021)**, [RoFormer, arXiv:2104.09864](https://arxiv.org/abs/2104.09864): nguồn gốc RoPE, có chứng minh tính tương đối.
2. **Touvron và cộng sự (2023)**, [LLaMA, arXiv:2302.13971](https://arxiv.org/abs/2302.13971): mục 2 ngắn, đọc được trong 10 phút.
3. **Grattafiori và cộng sự (2024)**, [The Llama 3 Herd of Models, arXiv:2407.21783](https://arxiv.org/abs/2407.21783): mục 3.2 (kiến trúc) và 3.3 (cơ sở hạ tầng và song song).
4. **Ainslie và cộng sự (2023)**, [GQA, arXiv:2305.13245](https://arxiv.org/abs/2305.13245).
5. **Shoeybi và cộng sự (2019)**, [Megatron-LM, arXiv:1909.08053](https://arxiv.org/abs/1909.08053) và **Rajbhandari và cộng sự (2020)**, [ZeRO, arXiv:1910.02054](https://arxiv.org/abs/1910.02054) cho phần song song.

## Kiểm chứng code

Code của bài do `lesson-writer` chạy ngày 24/10/2026, thư mục làm việc ở scratchpad; `content-reviewer` chạy lại cùng ngày và xác nhận hai mức dưới đây (`rope-relative`: chạy thật trên Pyodide thật; `llama-parts`: chạy thật với torch, output trùng từng byte với kết quả mẫu trong bài). Lần sửa theo review sau đó không đổi code. Hai dòng cuối là thử nghiệm của summarizer ở scratchpad, không phải code trong bài.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `rope-relative.vi.py`, `rope-relative.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`), Python 3.14.2, NumPy 2.4.6 | Ô `PythonRunner`. Hai bản cho output trùng từng byte. Chạy tức thì (khoảng 4 giây kể cả nạp Pyodide và NumPy). `q.k = -1.467987`; cột `rotate`: ba cặp $m-n=3$ (5/2, 105/102, 1005/1002) cùng $-1.586475$, $m-n=2$ cho $-1.763129$, cặp (2, 5) cho $-1.628434$; cột `add`: $1.176863$, $-0.574756$, $1.312702$, $1.810203$, $0.829287$; độ dài $1.862653$ trước và sau khi xoay. Khớp lời văn. `ast.parse(..., feature_version=(3, 10))` qua; 36 dòng, dòng dài nhất 73 ký tự |
| `llama-parts.vi.py`, `llama-parts.en.py` | chạy thật | 2026-10-24 | `.venv-llm`, Python 3.14.5, torch 2.14.1+cpu, `torch.manual_seed(0)` | Ô `LocalCode`, `sampleVaries={false}`. Hai bản và hai lần chạy cho output trùng từng byte (tất định). 3 tới 10 giây (lần đầu chậm hơn vì nạp torch). RMS sau chuẩn hóa `[1.0, 1.0, 1.0, 1.0, 1.0]`, `norm(3x) == norm(x): True`, tham số FFN $4D$ và SwiGLU $\tfrac{2}{3}\cdot 4D$ cùng 18432 ($D=48$), ma trận điểm 5×5 có đường chéo hằng (0.82, −0.31, −1.54, …; trên chéo 0.87). Kết quả mẫu trong bài chép từ lần này. `ast.parse(..., feature_version=(3, 10))` qua; 59 dòng, dòng dài nhất 78 ký tự |
| (thử nghiệm) `scratchpad/llama/rope_np.py` | chạy thật | 2026-10-24 | `.venv-llm`: Python 3.14.5, NumPy | Do summarizer chạy. Ba cặp $m-n=3$ cùng điểm −1,586475 |
| (thử nghiệm) `scratchpad/llama/torch_demo.py` | chạy thật | 2026-10-24 | `.venv-llm`: Python 3.14.5, torch 2.14.1+cpu | Do summarizer chạy. Khoảng 17 giây; 46 dòng |
