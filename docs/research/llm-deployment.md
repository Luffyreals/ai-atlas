# Deploy LLM: nhiều GPU, phân tán (Deploying LLMs: Multi-GPU and Distributed Serving)

Bài: `llm/llm-deployment` (chỉ bản vi, khoảng 12 phút). Cần biết trước: `llm/deploy-custom-model`, `llm/evaluation-peft`. Quyết định liên quan trong `docs/mvp.md`: 53 (code minh họa), 54 (không ghi cứng tên model), 56 (độ dài chuỗi là $L$), 57 (ô `PythonRunner` chạy bằng Pyodide thật). Ngày tra: **24/10/2026**. Giáo án gốc: buổi 23 phần LLM, "Deploy trên nhiều GPUs, Deploy phân tán mô hình" (dòng 94).

Cách tra: đọc trang tóm tắt arXiv/USENIX và tài liệu vLLM; tải PDF Llama 3 và đọc mục 6 bằng `pdftotext`; chạy thật code bằng Pyodide. Ý không có thẻ nguồn là kiến thức chung hoặc tự tính (có ghi).

## Nguồn

- **[ORCA]** Yu, G.-I., Jeong, J. S., Kim, G.-W., Kim, S., Chun, B.-G. (2022). [*Orca: A Distributed Serving System for Transformer-Based Generative Models*](https://www.usenix.org/conference/osdi22/presentation/yu). OSDI 2022, tr. 521-538. Đã đọc trang tóm tắt (không đọc toàn văn).
- **[VLLM-P]** Kwon, W., Li, Z., Zhuang, S., Sheng, Y., Zheng, L., Yu, C. H., Gonzalez, J. E., Zhang, H., Stoica, I. (2023). [*Efficient Memory Management for Large Language Model Serving with PagedAttention*](https://arxiv.org/abs/2309.06180). arXiv:2309.06180, SOSP 2023. Đã đọc tóm tắt; ngày 24/10/2026 tải PDF (`pdftotext`) để kiểm vị trí: số 20,4% tới 38,2% bộ nhớ KV cache dùng cho trạng thái token thật ở **mục 1** (hình 2); decode (generation phase) memory-bound, dùng phép nhân ma trận với vectơ, ở **mục 2.2**; khối chỉ được cấp khi các khối trước đã đầy, không giữ trước cho độ dài tối đa, ở **mục 4.3**; bảng khối ở mục 4.1 và 4.3.
- **[SPEC]** Leviathan, Y., Kalman, M., Matias, Y. (2022; sửa lại 5/2023). [*Fast Inference from Transformers via Speculative Decoding*](https://arxiv.org/abs/2211.17192). arXiv:2211.17192, ICML 2023 (oral, theo trang arXiv). Đã đọc tóm tắt. Bài ghi **2022 (arXiv)** để khớp link, hoặc "2022/2023".
- **[SGL]** Zheng, L., Yin, L., Xie, Z., Sun, C., Huang, J., Yu, C. H., Cao, S., Kozyrakis, C., Stoica, I., Gonzalez, J. E., Barrett, C., Sheng, Y. (2023; v2 6/2024). [*SGLang: Efficient Execution of Structured Language Model Programs*](https://arxiv.org/abs/2312.07104). arXiv:2312.07104. Trang arXiv không nêu nơi đăng. Đã đọc tóm tắt. Nhiều nguồn ghi năm 2024 (bản v2); bài ghi "2023 (arXiv)" cho khớp link.
- **[L3]** Grattafiori, A., Dubey, A., Jauhri, A., và cộng sự (Llama Team) (2024). [*The Llama 3 Herd of Models*](https://arxiv.org/abs/2407.21783) (PDF đã tải, đọc mục 6 và bảng 3). Đã có trong [*llama-family*](llama-family.md).
- **[VLLM-PAR]** vLLM. [*Parallelism and Scaling*](https://docs.vllm.ai/en/v0.32.0/serving/parallelism_scaling/) (bản 0.32.0). Đã đọc: cách chọn chiến lược, lệnh `vllm serve`, hai dòng log "GPU KV cache size" (tổng số token KV cache chứa được) và "Maximum concurrency" (ước lượng số yêu cầu chạy cùng lúc với độ dài `max_model_len`). Trang không nói gì về nhân bản đầu K/V khi số GPU lớn hơn số đầu K/V.
- **[VLLM-PA-DOC]** vLLM. [*Paged Attention (design)*](https://docs.vllm.ai/en/stable/design/paged_attention/). Trang tự ghi là dựa trên bản gốc và **không còn mô tả code hiện tại**; chỉ dùng để link, không dựa vào chi tiết.
- **[VLLM-SRV]** vLLM. [*Online serving (OpenAI-compatible server)*](https://docs.vllm.ai/en/stable/serving/online_serving/). Đã đọc ở [*deploy-custom-model*](deploy-custom-model.md).
- **[PYPI]** Bản mới nhất lúc tra (JSON API của PyPI): [`vllm`](https://pypi.org/project/vllm/) **0.32.0** (18/10/2026, Python `>=3.11,<3.15`), [`sglang`](https://pypi.org/project/sglang/) **0.5.22** (16/10/2026, Python `>=3.11`).
- **[GQA], [MEG], [GPIPE]:** xem [*llama-family*](llama-family.md) (GQA: arXiv:2305.13245; Megatron-LM: arXiv:1909.08053; GPipe: arXiv:1811.06965). Quantization (absmax, LLM.int8, GPTQ, QLoRA): xem [*evaluation-peft*](evaluation-peft.md).

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Cơ chế PagedAttention (bảng khối, chia sẻ khối) | Đã kiểm trong PDF [VLLM-P]: 20,4% tới 38,2% ở mục 1; cấp khối theo nhu cầu ở mục 4.3 (bảng khối mục 4.1, 4.3; chia sẻ khối mục 4.4). Trang design của vLLM nói không còn khớp code. | Bài chỉ nói ý: chia KV cache thành khối nhỏ, cấp phát khi cần, như phân trang bộ nhớ của hệ điều hành. Không mô tả chi tiết. |
| Con số tăng thông lượng (36,9 lần của [ORCA], 2 đến 4 lần của [VLLM-P], 2 đến 3 lần của [SPEC], 6,4 lần của [SGL]) | Là số do tác giả báo cáo, trên phần cứng, mô hình, tải riêng, so với hệ thống cơ sở của thời đó. | Nếu dùng, ghi "paper báo cáo", kèm điều kiện. Không đặt cạnh nhau như bảng xếp hạng. |
| Cơ chế RadixAttention, structured output của [SGL] | Chỉ biết tên từ tóm tắt. | Bài chỉ nêu SGLang là một server khác, link. |
| Decode bị giới hạn bởi băng thông bộ nhớ | Có nguồn: [VLLM-P] mục 2.2 (generation phase dùng nhân ma trận với vectơ, "underutilizes GPU computation and becomes memory-bound"); mục 1 cũng nói vậy. Phía prefill bị giới hạn bởi tính toán: chưa tra nguồn. | Bài nói như một cách nghĩ thường gặp, dẫn [VLLM-P] mục 2.2, không kèm số đo. |
| Chunked prefill, disaggregated prefill/decode, prefix caching | Chưa đọc. | Không viết. |
| Cổng mặc định, yêu cầu phần cứng của `vllm serve` | Xem [*deploy-custom-model*](deploy-custom-model.md) mục "Chưa xác minh". | Ghi `--port` rõ khi cần. |
| Lệnh `vllm serve` trên máy thật | Máy không có GPU, chưa cài vLLM. | Mức `đối chiếu` ([VLLM-PAR]). |
| Số tham số chính xác của Llama 3 8B/70B | [L3] chỉ ghi tên 8B, 70B. Số 8,03 B và 70,55 B là **tự tính** từ bảng 3 (xem dưới). | Ghi "tự tính từ kiến trúc"; khớp tên gọi. |
| Định nghĩa chuẩn của TTFT, TPOT | Đã tra: trang *Benchmark CLI* của vLLM v0.32.0 định nghĩa TTFT (gồm hàng đợi và prefill) và TPOT $= (t_{\text{total}} - \text{TTFT})/(N - 1)$, và ghi "terminology is not standardized". [L3] dùng "time-to-first-token" và "time-to-incremental-token". | Bài dùng định nghĩa của vLLM v0.32.0, nhắc tên gọi chưa thống nhất. |

## Ý chính

- **Hai khoản bộ nhớ khi suy luận.** (1) **Trọng số**: số tham số nhân số byte mỗi tham số (BF16: 2, int8: 1, int4: 0,5). Cố định, không đổi theo số người dùng. (2) **KV cache**: K và V của mọi token đã xử lý, ở mọi lớp, để token mới không phải tính lại. Lớn lên theo độ dài $L$ và theo số chuỗi đồng thời. Chưa kể kích hoạt tạm và hằng số lượng tử hóa.
- **Hậu quả.** Trọng số cho biết model **có vừa** GPU không; KV cache cho biết **phục vụ được bao nhiêu người** cùng lúc. Số tự tính: Llama 3 8B BF16 chiếm khoảng 15 GiB trọng số; trên GPU 80 GB còn chỗ cho khoảng 59 chuỗi 8192 token (bỏ qua kích hoạt và phần dự trữ, nên thực tế ít hơn). Dùng làm ví dụ cho "KV cache quyết định số người dùng".
- **GQA liên quan trực tiếp.** Llama 3 giữ 8 đầu K/V ở mọi cỡ [L3 bảng 3], nên KV cache 8B nhỏ hơn 4 lần so với khi có 32 đầu K/V (tự tính: 1 GiB so với 4 GiB cho 8192 token). Nối với [*llama-family*](llama-family.md).
- **Prefill và decode.** Prefill: xử lý cả lời nhắc cùng lúc, điền KV cache, ra token đầu tiên. Decode: sinh từng token một, mỗi bước thêm một mục vào KV cache. [L3 mục 6.1] đo hai giai đoạn riêng (trục prefill đo "time-to-first-token", decode đo "time-to-incremental-token"), tức là hai giai đoạn có đặc tính khác nhau.
- **Tensor parallel khi suy luận.** Chia ma trận của mỗi lớp ra nhiều GPU trong **một máy** (kết nối nhanh, NVLink). Mỗi bước phải trao đổi giữa GPU, nên cần đường truyền nhanh [L3 mục 6.1; MEG]. Số GPU nên chia hết số đầu (Llama 2 nhắc MQA có ít đầu K/V hơn số GPU thì không chia được [llama-family]); trang [VLLM-PAR] không nói gì về điều này, nên không khẳng định thêm.
- **Pipeline parallel khi suy luận.** Chia theo lớp, dùng giữa các máy (đường truyền chậm hơn, chỉ chuyền kích hoạt giữa hai giai đoạn kề nhau). Khác huấn luyện: suy luận **không có backward** nên không phải "xả" đường ống, bong bóng không phải vấn đề lớn; chia lô thành micro-batch để tăng thông lượng, đổi lại độ trễ tăng chút [L3 mục 6.1]. Llama 3 405B ở BF16 không vừa 8 GPU H100 của một máy nên dùng 16 GPU trên hai máy [L3 mục 6.1].
- **Chọn chiến lược theo [VLLM-PAR].** Vừa một GPU thì không cần phân tán. Một máy nhiều GPU: tensor parallel với `tensor_parallel_size` bằng số GPU. Nhiều máy: `tensor_parallel_size` bằng số GPU mỗi máy, `pipeline_parallel_size` bằng số máy. GPU không có NVLink: trang ưu tiên pipeline.
- **Batching.** Gom nhiều yêu cầu vào một lượt chạy để tận dụng GPU. Batching tĩnh phải chờ cả lô xong; yêu cầu ngắn chờ yêu cầu dài. **Continuous batching** ([ORCA] gọi là *iteration-level scheduling*): lập lịch từng **bước** sinh token, yêu cầu xong thì trả ngay, yêu cầu mới vào ngay ở bước sau. [ORCA] còn có *selective batching* (chỉ gộp một số phép tính trong Transformer); paper báo cáo 36,9 lần thông lượng so với FasterTransformer trên GPT-3 175B ở cùng độ trễ.
- **PagedAttention [VLLM-P].** KV cache của mỗi yêu cầu to và đổi kích thước khi sinh; cấp phát liền một mảng lớn gây phân mảnh và lãng phí, nên giới hạn cỡ lô. Ý tưởng: chia thành khối nhỏ cấp theo nhu cầu, như phân trang trong hệ điều hành. Paper báo cáo gần như không lãng phí KV cache và thông lượng 2 đến 4 lần so với Orca và FasterTransformer cùng độ trễ. vLLM là hệ thống cài đặt ý này.
- **Thông lượng và độ trễ đánh đổi.** Lô lớn thì token/giây toàn hệ thống tăng, nhưng mỗi người chờ lâu hơn. Hai số cần đo: **TTFT** (thời gian tới token đầu, chịu ảnh hưởng của prefill và hàng đợi) và **TPOT** (thời gian giữa hai token liên tiếp ở decode). [L3 hình 24] vẽ chính đường đánh đổi này theo cỡ lô. Nối với p50/p95 ở [*deploy-custom-model*](deploy-custom-model.md).
- **Speculative decoding (chỉ nhắc) [SPEC].** Mô hình nhỏ đề xuất vài token, mô hình lớn kiểm tra song song; cách lấy mẫu đảm bảo **phân bố đầu ra không đổi**. Paper báo cáo nhanh 2 đến 3 lần trên T5-XXL.
- **Quantization khi triển khai.** Giảm byte mỗi tham số nên model vừa GPU nhỏ hơn và đọc ít bộ nhớ hơn. [L3 mục 6.2] dùng FP8 cho Llama 3 405B: lượng tử hóa phần lớn tham số và kích hoạt của lớp FFN (khoảng 50% thời gian suy luận), **không** lượng tử hóa tham số attention, và không lượng tử hóa lớp Transformer đầu và cuối. Nối [*evaluation-peft*](evaluation-peft.md).
- **Công cụ làm ví dụ.** vLLM 0.32.0 và SGLang 0.5.22 (bản mới nhất ngày 24/10/2026); chỉ link, không dạy API. Theo quy tắc mục 2.6 của `llm-lessons.md`: không viết "tốt nhất", không so sánh hai công cụ.

## Công thức quan trọng

Ký hiệu (khớp bài và [*llama-family*](llama-family.md)): độ dài chuỗi $L$ (không dùng $T$), số lớp $N_{\text{layer}}$, số đầu K/V $H_{\text{kv}}$, chiều mỗi đầu $d$, số byte mỗi số $s$, số tham số $\Psi$, số chiều mô hình $D$ (khóa `dim` trong code).

**Bộ nhớ trọng số** (xấp xỉ), $\Psi$ tham số, $s$ byte mỗi tham số:

$$M_{\text{w}} \approx \Psi \cdot s$$

BF16: $s=2$; int8: $s=1$; int4: $s=0{,}5$ (chưa kể hằng số lượng tử hóa; QLoRA thêm khoảng 0,127 bit mỗi tham số, xem [evaluation-peft]).

**KV cache**, $B$ là số chuỗi đồng thời (batch):

$$M_{\text{KV}} = 2 \cdot N_{\text{layer}} \cdot H_{\text{kv}} \cdot d \cdot s \cdot L \cdot B$$

Giải thích từng thừa số (diễn đạt cho bài):

- **2:** lưu cả khóa K và giá trị V.
- $N_{\text{layer}}$: mỗi lớp attention có cache riêng.
- $H_{\text{kv}}\cdot d$: kích thước vectơ K (hoặc V) lưu cho một token ở một lớp. Với GQA, $H_{\text{kv}}$ nhỏ hơn số đầu truy vấn.
- $L$: mỗi token đã xử lý có một mục; cache tăng **tuyến tính** theo $L$.
- $s$: byte mỗi số (BF16 là 2).
- $B$: mỗi chuỗi có cache riêng, không dùng chung (trừ khi có chia sẻ tiền tố, chưa nói tới).

Một token: $2\cdot N_{\text{layer}}\cdot H_{\text{kv}}\cdot d\cdot s$ byte. Llama 3 8B: $2\cdot32\cdot8\cdot128\cdot2=131\,072$ byte (128 KiB); $d=4096/32=128$. Llama 3 70B: $2\cdot80\cdot8\cdot128\cdot2=327\,680$ byte (320 KiB); $d=8192/64=128$ (suy ra, giả định chiều đầu bằng chiều ẩn chia số đầu).

**Số tham số từ kiến trúc** (tự tính, SwiGLU 3 ma trận, nhúng và đầu ra tách rời, bỏ chuẩn hóa):
$\Psi \approx N_{\text{layer}}\,(2D^2 + 2D\,H_{\text{kv}}d + 3\,D\,D_{\text{ff}}) + 2\,V D$, với $V=128\,000$ [L3 bảng 3]. Cho 8,03 B (8B) và 70,55 B (70B).

**Số chuỗi đồng thời tối đa** (đơn giản hóa): $B_{\max}\approx\left\lfloor\dfrac{M_{\text{GPU}}-M_{\text{w}}}{M_{\text{KV}}(L,B{=}1)}\right\rfloor$. Bỏ qua kích hoạt tạm và phần dự trữ; bài nên nói rõ là ước lượng cận trên.

## Ví dụ hoặc trực giác hay

- **Bàn ăn nhà hàng (gợi ý).** Trọng số là diện tích bếp, cố định. KV cache là số bàn đang phục vụ, mỗi bàn chiếm chỗ tăng dần khi gọi thêm món (token). Bếp rộng mà ít bàn thì phí; nhiều bàn dài thì hết chỗ. Chia nhỏ chỗ ngồi theo nhu cầu (PagedAttention) thay vì giữ trọn bàn 16 người cho cả nhóm 2 người.
- **Taxi và xe buýt (gợi ý).** Batching tĩnh như xe buýt chạy khi đủ khách, và chạy hết tuyến mới cho khách mới lên. Continuous batching như xe buýt cho khách xuống và lên ở **mỗi trạm** (mỗi bước decode).
- **Prefill như đọc đề, decode như viết từng chữ (gợi ý).** Đọc cả đề một lượt (song song được); viết bài phải từng chữ một, và mỗi chữ cần nhìn lại mọi thứ đã viết (KV cache).
- **Tensor parallel như hai người cùng làm một phép nhân ma trận; pipeline như dây chuyền (gợi ý).** Dùng lại `ParallelismFigure` (llm-lessons.md mục 2.9, vẽ ba kiểu data, tensor, pipeline; hình đã dùng ở `llama-family`). Ở bài này đọc hình lại: suy luận hầu như không dùng data parallel cho **một** bản model (nhân bản model để phục vụ nhiều người là data parallel ở tầng dịch vụ, nên nói một câu).
- **KV cache gấp bốn nhờ GQA (gợi ý).** So 1 GiB với 4 GiB cho cùng một yêu cầu 8192 token.

### Ô `PythonRunner` đề xuất (đã chạy thật, 44 dòng, Python thuần, vượt mức 40 dòng của CLAUDE.md nên lesson-writer cần rút gọn)

File: `scratchpad/ld/mem.py`. Hai hàm: `n_params(c)` và `kv_bytes(c, seq_len, batch, byte=2)`; hai cấu hình lấy từ bảng 3 của [L3] (8B: 32 lớp, chiều 4096, FFN 14 336, 32 đầu, 8 đầu K/V; 70B: 80 lớp, 8192, 28 672, 64 đầu, 8 đầu K/V), $V=128\,000$. In trọng số ở BF16, int8, int4 và KV cache cho ba cặp $(L,B)$: (8192, 1), (8192, 16), (32768, 16). Thêm hai dòng: 8B với 32 đầu K/V, và số chuỗi tối đa trên 80 GB. Chạy bằng Pyodide thật (xem "Kiểm chứng code"). Kết quả (1 GiB $=1024^3$ byte):

| Cấu hình | Giá trị |
|---|---|
| 8B tham số (tự tính) | 8,03 B |
| 8B trọng số BF16 / int8 / int4 | 15,0 / 7,5 / 3,7 GiB |
| 8B KV cache $L=8192,B=1$ | 1,0 GiB |
| 8B KV cache $L=8192,B=16$ | 16,0 GiB |
| 8B KV cache $L=32768,B=16$ | 64,0 GiB |
| 70B tham số (tự tính) | 70,55 B |
| 70B trọng số BF16 / int8 / int4 | 131,4 / 65,7 / 32,9 GiB |
| 70B KV cache $L=8192,B=1$ | 2,5 GiB |
| 70B KV cache $L=8192,B=16$ | 40,0 GiB |
| 70B KV cache $L=32768,B=16$ | 160,0 GiB |
| 8B với 32 đầu K/V, $L=8192$ | 4,0 GiB |
| 8B trên GPU 80 GB (thập phân), số chuỗi $L=8192$ tối đa | 59 |

Đọc: KV cache của 8B ở $L=32768$, $B=16$ (64 GiB) đã gấp hơn bốn lần trọng số (15 GiB); KV cache 70B ở cùng cấu hình (160 GiB) vượt cả một GPU 80 GB, tức là cần chia model dù đã quantize. Số chia: $L$ gấp 4 thì KV gấp 4; $B$ gấp 16 thì gấp 16. Nhận xét: 70B BF16 (131,4 GiB) không vừa một GPU 80 GB, cần ít nhất hai GPU chỉ để chứa trọng số, chưa tính KV cache (suy ra từ số trên; bài không nêu một GPU cụ thể, chỉ nói "80 GB" như ví dụ).

### Đối chiếu tài liệu (không chạy được, không có GPU)

```sh
# Một máy 4 GPU, tensor parallel [VLLM-PAR]
vllm serve <tên-model> --tensor-parallel-size 4

# Hai máy, mỗi máy 8 GPU [VLLM-PAR]
vllm serve <đường-dẫn-model> \
    --tensor-parallel-size 8 \
    --pipeline-parallel-size 2 \
    --distributed-executor-backend ray
```

Hai lệnh sao theo ví dụ trên trang [VLLM-PAR] (trang dùng `facebook/opt-13b` cho lệnh đầu). Bài dùng `<tên-model>` như chỗ trống, không ghi cứng model (quyết định 54). Cổng: thêm `--port` rõ nếu client cần (xem [*deploy-custom-model*](deploy-custom-model.md)). Client: `OPENAI_BASE_URL=http://<host>:<port>/v1`, không đổi code từ `text-api`.

## Kiểm chứng code

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `memory.vi.py`, `memory.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 (Python 3.14.2) qua `runpyo.mjs`, theo quyết định 61; `ast.parse(..., feature_version=(3, 10))` qua bằng `.venv-llm` | Chạy lại sau review (khóa `d` đổi thành `dim`), cả bản vi và en đều chạy thật trên Pyodide; output không đổi, token code vi/en giống hệt (bỏ comment). 37 dòng, Python thuần, chạy tức thì. Hai bản in giống hệt nhau: 8.03B / 70.55B tham số; trọng số 15.0 / 7.5 / 3.7 và 131.4 / 65.7 / 32.9 GiB; KV cache 1.0 / 16.0 / 64.0 và 2.5 / 40.0 / 160.0 GiB; 32 đầu K/V: 4.0 GiB; 59 chuỗi trên 80 GB. Mọi số trong bài khớp lần chạy này. Rút gọn từ bản 44 dòng `scratchpad/ld/mem.py` của ghi chú |
| khối `sh` (hai lệnh `vllm serve`) trong bài | đối chiếu | 2026-10-24 | tài liệu [VLLM-PAR] bản 0.32.0 | Reviewer đối chiếu lại với trang, khớp. Chưa chạy; máy không có GPU và chưa cài vLLM. Lệnh đầu thêm `--port 8001` (như bài `deploy-custom-model`), lệnh sau theo ví dụ cụm Ray hai máy của trang |

## Điểm dễ hiểu nhầm

1. **Quên KV cache khi ước lượng bộ nhớ.** Chỉ tính trọng số thì tưởng model vừa, nhưng chuỗi dài và nhiều người dùng làm KV cache vượt cả trọng số (8B ở $L=32768$, $B=16$: 64 GiB so với 15 GiB).
2. **Nghĩ KV cache không phụ thuộc số người dùng.** Mỗi chuỗi có cache riêng nên tỉ lệ thuận với $B$.
3. **Nhầm "tham số" và "đầu K/V".** GQA chỉ giảm số đầu K/V, không giảm số đầu truy vấn; số đầu truy vấn không xuất hiện trong công thức KV cache.
4. **Đếm byte theo tên "8B".** 8B chỉ là tên gọi; số tính từ kiến trúc là 8,03 B. Hơn nữa quantization còn có hằng số phụ.
5. **Nghĩ quantization int4 luôn dùng được.** Chất lượng có thể giảm; [L3] không lượng tử hóa lớp đầu, lớp cuối và attention ở FP8 vì mô hình nhạy với một số kiểu lượng tử hóa.
6. **Nhầm tensor parallel với data parallel.** Tensor parallel chia **một** model ra nhiều GPU để vừa bộ nhớ và giảm thời gian mỗi bước; data parallel nhân bản cả model để phục vụ nhiều yêu cầu hơn.
7. **Dùng tensor parallel qua đường truyền chậm.** Cần liên lạc ở mỗi lớp, nên dùng trong một máy; giữa các máy ưu tiên pipeline [L3 mục 6.1; VLLM-PAR].
8. **Nghĩ bong bóng pipeline luôn là vấn đề.** Ở suy luận không có backward nên không phải xả đường ống; micro-batch vẫn có ích nhưng tăng độ trễ [L3].
9. **Nhầm continuous batching với batching tĩnh,** và nghĩ batch lớn luôn tốt. Batch lớn tăng thông lượng nhưng tăng độ trễ mỗi người; chọn theo mục tiêu (nhiều khách hay phản hồi nhanh).
10. **Nhầm TTFT và TPOT.** TTFT là chờ token đầu (prefill, hàng đợi); TPOT là nhịp token sau. Người dùng chat cảm nhận cả hai.
11. **Tin con số "gấp N lần" của paper như mặc định.** Mỗi con số có điều kiện (mô hình, phần cứng, tải, hệ thống so sánh) [ORCA, VLLM-P, SPEC, SGL].
12. **Hiểu speculative decoding làm đổi kết quả.** [SPEC]: phân bố đầu ra giữ nguyên; chỉ nhanh hơn.
13. **Tưởng "OpenAI-compatible" nghĩa là cùng hiệu năng hay tính năng.** Xem [*deploy-custom-model*](deploy-custom-model.md) điểm 8.
14. **Trộn $L$ và $T$:** độ dài chuỗi là $L$ (quyết định 60).

## Liên quan tới bài nào

Slug đã đối chiếu `src/data/roadmap.ts`.

- **Cần biết trước (roadmap):** `llm/deploy-custom-model` (một máy, `base_url`, p50/p95), `llm/evaluation-peft` (quantization, bộ nhớ trọng số). Chuỗi: `llm/gpt-family-finetuning` → `llm/evaluation-peft` → bài này.
- **Dùng lại:** `llm/llama-family` (KV cache, GQA, song song tensor/pipeline, `ParallelismFigure`), `llm/text-api` (khuôn `OpenAI(base_url=...)`).
- **Gần nhau:** `llm/build-first-llm` (vòng lặp sinh token, nên KV cache có nghĩa), `llm/rlhf`, `llm/multimodal` (cùng đợt 6 theo llm-lessons.md mục 2.8: `dpo`, `deepseek-family`, `multimodal`, `llm-deployment`). Bài cùng đợt chỉ ghi tên, không gắn link. `llm/deepseek-family`: MoE và nén KV cache khác (chỉ nhắc nếu có, chưa tra).
- Bài **cuối** phần LLM; kết thúc bằng tóm tắt và đọc thêm.

## Thuật ngữ đề xuất

Chưa đối chiếu `docs/glossary.md`; `lesson-writer` kiểm xem mục nào đã có trước khi thêm.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Suy luận (chạy model) | Inference | Dịch |
| Phục vụ model | Model serving | Gloss, giữ "serving" (đã dùng ở `deploy-custom-model`) |
| Giai đoạn nạp lời nhắc | Prefill | Giữ "prefill", gloss lần đầu |
| Giai đoạn sinh token | Decode | Giữ "decode", gloss lần đầu |
| Bộ nhớ đệm K/V | KV cache | Giữ nguyên |
| Gộp lô liên tục | Continuous batching | Gloss, giữ tên Anh |
| Thời gian tới token đầu | Time to first token (TTFT) | Giữ "TTFT" |
| Thời gian mỗi token | Time per output token (TPOT) | Giữ "TPOT"; định nghĩa theo trang Benchmark CLI của vLLM v0.32.0 |
| Giải mã suy đoán | Speculative decoding | Gloss một lần |
| Song song tensor / đường ống | Tensor / pipeline parallelism | Như `llama-family` |
| Thông lượng, độ trễ | Throughput, latency | Dịch |

## Đọc thêm đề xuất

1. [vLLM: Parallelism and Scaling](https://docs.vllm.ai/en/v0.32.0/serving/parallelism_scaling/) (đã đọc, bản 0.32.0).
2. Kwon và cộng sự (2023), [PagedAttention, arXiv:2309.06180](https://arxiv.org/abs/2309.06180) (đã đọc tóm tắt, kiểm mục 1–4 trong PDF).
3. Yu và cộng sự (2022), [Orca, OSDI 2022](https://www.usenix.org/conference/osdi22/presentation/yu) (đã đọc tóm tắt).
4. Grattafiori và cộng sự (2024), [The Llama 3 Herd of Models](https://arxiv.org/abs/2407.21783), mục 6 (Inference): pipeline và FP8.
5. Leviathan và cộng sự (2022), [Speculative Decoding, arXiv:2211.17192](https://arxiv.org/abs/2211.17192) (nếu muốn thêm).
6. Zheng và cộng sự (2023), [SGLang, arXiv:2312.07104](https://arxiv.org/abs/2312.07104); các công cụ: [vLLM](https://pypi.org/project/vllm/) 0.32.0, [SGLang](https://pypi.org/project/sglang/) 0.5.22.

## Điểm cần phiên chính chốt

1. **Ví dụ "59 chuỗi trên GPU 80 GB" là số tự tính, bỏ qua kích hoạt:** có giữ (kèm "ước lượng cận trên") hay bỏ? Đề xuất giữ.
2. **Có nhắc FP8 của Llama 3 405B [L3 mục 6.2] hay chỉ nói chung về int8/int4?** Đề xuất nhắc một câu, vì là nguồn có thật.
3. **`ParallelismFigure` dùng lại ở bài này:** đọc lại hình, hay chỉ link về `llama-family`? Đề xuất dùng lại hình (mỗi trang một lần, đã hợp quy ước mục 2.9).
