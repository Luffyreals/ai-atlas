# Đánh giá mô hình và PEFT: LoRA, quantization, distillation, pruning (Model Evaluation and PEFT)

Bài: `llm/evaluation-peft` (chỉ bản vi, được dài tới khoảng 15 phút đọc, quyết định 54 trong `docs/mvp.md`). Bài cần biết trước: `llm/gpt-family-finetuning`. Bài sau dùng nó làm tiền đề: `llm/llm-deployment`. Giáo án (buổi 17, phần LLM) nêu: đánh giá chất lượng mô hình, PEFT, LoRA, lượng tử hóa, chắt lọc tri thức, tỉa tham số, thực hành thư viện Unsloth.

Ngày tra: **24/10/2026**. Cách tra: WebFetch trang arXiv của 9 paper (tên, tác giả, ngày nộp, hội nghị nếu trang nêu); tải PDF của Hu 2021, Hinton 2015, Dettmers 2023, Brown 2020, Dettmers 2022 rồi trích chữ bằng `pdftotext` (đã đọc đúng các đoạn nêu trong "Ý chính", chưa đọc cả bài); WebFetch trang GitHub của Unsloth và trang chủ tài liệu PEFT; lấy phiên bản gói bằng `pip index versions`; chạy thật Python trong scratchpad. Ý không có thẻ nguồn là kiến thức chung hoặc suy ra từ công thức.

## Nguồn

Đánh giá:
- **[H21]** Hendrycks, D., Burns, C., Basart, S., Zou, A., Mazeika, M., Song, D., Steinhardt, J. (2021). [*Measuring Massive Multitask Language Understanding*](https://arxiv.org/abs/2009.03300). arXiv:2009.03300 (nộp 9/2020, v3 1/2021); trang arXiv ghi ICLR 2021. Đã đọc tóm tắt.
- **[Z23]** Zheng, L., Chiang, W.-L., Sheng, Y., và cộng sự (2023). [*Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*](https://arxiv.org/abs/2306.05685). arXiv:2306.05685 (nộp 6/2023, v4 12/2023); trang arXiv ghi NeurIPS 2023 Datasets and Benchmarks Track. Đã đọc tóm tắt.
- **[B20]** Brown, T. B., Mann, B., Ryder, N., và cộng sự (2020). [*Language Models are Few-Shot Learners*](https://arxiv.org/abs/2005.14165). arXiv:2005.14165. Chỉ dùng mục 4 ("Measuring and Preventing Memorization of Benchmarks") và phụ lục C cho chuyện rò rỉ dữ liệu test. Đã đọc mục 2 phần dữ liệu, mục 4 phần mở đầu và đoạn mô tả lọc 13-gram.

PEFT, LoRA, QLoRA:
- **[Hu21]** Hu, E. J., Shen, Y., Wallis, P., Allen-Zhu, Z., Li, Y., Wang, S., Wang, L., Chen, W. (2021). [*LoRA: Low-Rank Adaptation of Large Language Models*](https://arxiv.org/abs/2106.09685). arXiv:2106.09685 (nộp 6/2021, v2 10/2021). Trang arXiv không nêu hội nghị. Đã đọc tóm tắt và mục 4.1, 4.2.
- **[D23]** Dettmers, T., Pagnoni, A., Holtzman, A., Zettlemoyer, L. (2023). [*QLoRA: Efficient Finetuning of Quantized LLMs*](https://arxiv.org/abs/2305.14314). arXiv:2305.14314 (nộp 5/2023). Trang arXiv ghi "Extended NeurIPS submission", không nêu nơi đăng. Đã đọc tóm tắt, mục 1-3 (NF4, double quantization), phần nói về chọn lớp gắn LoRA.

Lượng tử hóa:
- **[D22]** Dettmers, T., Lewis, M., Belkada, Y., Zettlemoyer, L. (2022). [*LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale*](https://arxiv.org/abs/2208.07339). arXiv:2208.07339 (nộp 8/2022, v2 11/2022); trang arXiv ghi NeurIPS 2022. Đã đọc tóm tắt và mục 2.1 (định nghĩa absmax).
- **[F22]** Frantar, E., Ashkboos, S., Hoefler, T., Alistarh, D. (2022). [*GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers*](https://arxiv.org/abs/2210.17323). arXiv:2210.17323 (nộp 10/2022, v2 3/2023); trang arXiv ghi ICLR 2023. Chỉ đọc tóm tắt; chỉ nhắc tên.

Chắt lọc và tỉa:
- **[Hi15]** Hinton, G., Vinyals, O., Dean, J. (2015). [*Distilling the Knowledge in a Neural Network*](https://arxiv.org/abs/1503.02531). arXiv:1503.02531 (3/2015; ban đầu là bài của NIPS 2014 Deep Learning Workshop). Đã đọc mục 1, 2 (nhiệt độ, hàm mục tiêu) và phần thử trên MNIST.
- **[Ha15]** Han, S., Pool, J., Tran, J., Dally, W. J. (2015). [*Learning both Weights and Connections for Efficient Neural Networks*](https://arxiv.org/abs/1506.02626). arXiv:1506.02626 (nộp 6/2015, v3 10/2015); trang arXiv ghi NIPS 2015. Chỉ đọc tóm tắt.
- **[F23]** Frantar, E., Alistarh, D. (2023). [*SparseGPT: Massive Language Models Can Be Accurately Pruned in One-Shot*](https://arxiv.org/abs/2301.00774). arXiv:2301.00774 (nộp 1/2023, v3 3/2023). Trang arXiv không nêu hội nghị. Chỉ đọc tóm tắt; chỉ nhắc tên.

Thư viện (tài liệu mở, chỉ dùng để mô tả; không chép code):
- **[PEFT]** Hugging Face, [*PEFT*](https://huggingface.co/docs/peft/index) (trang chủ tài liệu; trang không ghi số phiên bản). Gói `peft` bản mới nhất trên PyPI ngày 24/10/2026: **0.21.2**.
- **[BNB]** Gói `bitsandbytes`: bản mới nhất trên PyPI ngày 24/10/2026: **0.50.2**. Chưa đọc tài liệu riêng; chỉ ghi tên và bản.
- **[UNS]** Unsloth, [kho GitHub](https://github.com/unslothai/unsloth). Mô tả: bộ công cụ mã nguồn mở để chạy và huấn luyện LLM; lõi theo giấy phép Apache 2.0, một số thành phần tùy chọn (giao diện Studio) theo AGPL-3.0. Gói `unsloth` bản mới nhất trên PyPI ngày 24/10/2026: **2026.10.8**.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Hội nghị của [Hu21], [D23], [F23] | Trang arXiv không nêu. [Hu21] thường được dẫn là ICLR 2022, [D23] là NeurIPS 2023, [F23] là ICML 2023; **chưa xác minh**. | Ghi "arXiv:..., năm". Riêng [H21] (ICLR 2021), [Z23] (NeurIPS 2023 Datasets and Benchmarks), [D22] (NeurIPS 2022), [F22] (ICLR 2023), [Ha15] (NIPS 2015) có trên trang arXiv. |
| Nguồn gốc của perplexity | Không tra được một paper đáng tin để gán. | Định nghĩa bằng công thức (exp của trung bình NLL), không gán cho tác giả nào. Nếu muốn dẫn, tra thêm một giáo trình xử lý ngôn ngữ trước. |
| Mức rò rỉ dữ liệu của MMLU hay benchmark cụ thể nào | Chưa tra, chưa đọc. | Chỉ nêu cơ chế và phương pháp phát hiện của [B20] (trùng 13-gram); không nói benchmark nào "đã bị rò rỉ". |
| Cách đo contamination của các paper sau 2020, và công cụ chống rò rỉ | Chưa tra. | Không nêu; nói chung "chưa có cách làm chuẩn" theo chính [B20] (tại thời điểm 2020). |
| Phần trăm đồng thuận 80% của [Z23] | Chỉ đọc câu trong tóm tắt, chưa đọc bảng số. | Nêu "hơn 80%" kèm "theo tóm tắt của chính tác giả", không nêu thêm số. |
| Kết quả cụ thể của QLoRA trên MMLU, Vicuna benchmark | Chỉ đọc tóm tắt ("Guanaco đạt 99,3% ChatGPT trên Vicuna benchmark"). | Không nêu số này trong bài; bài chỉ nêu bộ nhớ và cách làm. |
| Khẳng định tăng tốc 2:4 sparsity trên phần cứng | [F23] chỉ nêu mô hình hỗ trợ 2:4, 4:8; không đọc số tăng tốc. | Chỉ nói "tỉa kiểu có cấu trúc dễ tăng tốc hơn tỉa rời rạc" ở mức chung, ghi là nhận định của người viết; không có số. |
| Số "2× nhanh hơn, ít hơn 70% VRAM" của Unsloth | Là tuyên bố tiếp thị trên trang GitHub, chưa kiểm chứng, và trang không gắn riêng cho LoRA hay QLoRA. | Không nêu số. Bài chỉ nhắc tên Unsloth, nói là thư viện hỗ trợ LoRA/QLoRA, không chạy code của nó. |
| Bài chắt lọc ở quy mô LLM (DistilBERT, v.v.) | Chưa tra. | Không nêu tên mô hình chắt lọc cụ thể; chỉ nêu ý của [Hi15]. |
| API cụ thể của `peft`, `bitsandbytes` (tên lớp, tham số) | Chưa đọc tài liệu API, chưa cài vào venv. | Không viết code gọi chúng thành "chạy được"; nếu cần minh họa thì viết khối `text` không chạy, ghi phiên bản, đánh dấu mức kiểm chứng `đối chiếu` sau khi đọc tài liệu đúng bản. |

## Ý chính

### Đánh giá mô hình

- **Hai kiểu đo khác nhau.** (1) Đo **chất lượng mô hình ngôn ngữ** bằng chính mục tiêu huấn luyện: loss và perplexity trên văn bản chưa thấy. (2) Đo **khả năng làm việc** bằng bộ câu hỏi có đáp án (benchmark) hoặc bằng người/mô hình chấm đáp án tự do. Loss thấp không bảo đảm làm tốt việc người dùng cần; điểm benchmark không cho biết mô hình có dễ dùng không. Gắn với lưu ý của [O22] trong `gpt-family-finetuning` (loss kiểm tra tăng mà đánh giá của người vẫn tốt lên).
- **Perplexity** là lũy thừa (exp) của trung bình NLL trên mỗi token. Trực giác: mô hình "phân vân giữa bao nhiêu token một cách đều nhau" ở mỗi bước. Đoán đều trên $V$ token cho perplexity bằng đúng $V$. Chỉ so sánh được khi **cùng bộ tách token và cùng tập đánh giá**: đổi tokenizer thì mẫu số đổi (suy ra từ công thức; không có nguồn riêng).
- **Benchmark nhiều lựa chọn: MMLU [H21].** 57 tác vụ (toán sơ cấp, lịch sử Mỹ, khoa học máy tính, luật...), câu hỏi trắc nghiệm; lúc công bố (2020), mô hình GPT-3 lớn nhất chỉ hơn mức đoán mò gần 20 điểm phần trăm. Tác giả còn nêu hai điểm: điểm số không đều giữa các môn, và mô hình không biết mình sai. Dùng làm ví dụ cho "benchmark = đề thi chuẩn hóa".
- **Số benchmark phải kèm paper và năm** (`llm-lessons.md` 2.6). Không viết bảng xếp hạng "hiện tại". Bài nên tả cách đọc điểm (random baseline, số shot, đo ở prompt nào) hơn là liệt kê điểm.
- **LLM làm giám khảo [Z23].** Dùng một LLM mạnh chấm đáp án của mô hình khác để đo câu hỏi mở mà benchmark trắc nghiệm không đo được. Tác giả giới thiệu MT-bench (câu hỏi nhiều lượt) và Chatbot Arena (người dùng bỏ phiếu giữa hai đáp án ẩn danh). Họ nêu các **thiên lệch**: vị trí (thiên về đáp án đứng trước hoặc sau), độ dài (thiên về đáp án dài), tự ưu ái (giám khảo chấm cao đáp án của chính nó), và khả năng suy luận hạn chế khi chấm toán. Theo tóm tắt của chính họ, giám khảo mạnh như GPT-4 đồng thuận với sự ưa thích của người trên 80%, ngang mức người với người. Cách giảm thiên lệch ở mức ý (đổi chỗ hai đáp án rồi chấm lại) là của paper; chưa đọc chi tiết.
- **Rò rỉ dữ liệu test (contamination) [B20].** Dữ liệu huấn luyện lấy từ web, mà benchmark cũng nằm trên web, nên mô hình có thể đã **thấy đề thi**. Nhóm GPT-3 đã tìm và loại các đoạn trùng với tập dev/test, nhưng **một lỗi trong bước lọc** làm lọt một số trường hợp; vì chi phí huấn luyện quá cao nên không huấn luyện lại, họ chỉ phân tích tác động còn lại (mục 4). Họ viết rằng phát hiện contamination ở quy mô internet là "lĩnh vực nghiên cứu mới" chưa có thực hành chuẩn (tại thời điểm 2020). Cách đo của họ: đánh dấu mẫu có trùng **13-gram** với dữ liệu huấn luyện (gram là từ viết thường tách theo khoảng trắng, không phải token; phụ lục C dùng N từ 8 đến 13 tùy bộ đề; mẫu ngắn hơn N từ thì xét trùng cả câu), rồi so điểm giữa phần "sạch" và phần "nghi bị trùng". Chỉ nêu cơ chế này; không nói mức ảnh hưởng chung vì phải đọc đúng bảng của paper.
- **Bài học cho người đọc:** (a) đừng tin một điểm benchmark của chính mô hình mình fine-tune nếu dữ liệu fine-tune có thể chứa đề; (b) giữ một tập kiểm tra riêng, chưa từng đưa vào huấn luyện hay chọn siêu tham số (gắn `ml/overfitting-underfitting`); (c) đánh giá bằng người hoặc giám khảo LLM trên **câu hỏi của đúng bài toán của bạn**.

### PEFT và LoRA

- **PEFT (Parameter-Efficient Fine-Tuning) là gì [PEFT].** Nhóm phương pháp chỉ huấn luyện một lượng nhỏ tham số (thêm vào hoặc chọn ra) thay vì cập nhật toàn bộ mô hình, để giảm bộ nhớ và dung lượng lưu trữ mà vẫn đạt chất lượng gần fine-tune đầy đủ. Trang tài liệu PEFT nói cả điều này: nó là khung cho nhiều phương pháp; LoRA chỉ là một.
- **Vì sao cần.** Fine-tune đầy đủ phải giữ gradient và trạng thái tối ưu cho **mọi** tham số. [Hu21] ước tính với GPT-3 175B và Adam: bộ nhớ huấn luyện từ 1,2 TB xuống 350 GB (xấp xỉ 2/3 nếu $r\ll d_{\text{model}}$ vì không giữ trạng thái tối ưu của tham số đóng băng), điểm kiểm (checkpoint) từ 350 GB xuống 35 MB khi $r=4$ và chỉ gắn vào $\mathbf{W}_q,\mathbf{W}_v$ (giảm khoảng 10 000 lần).
- **LoRA [Hu21].** Đóng băng trọng số gốc $\mathbf{W}_0\in\mathbb{R}^{d\times k}$; thêm cập nhật hạng thấp $\Delta\mathbf{W}=\mathbf{B}\mathbf{A}$ với $\mathbf{B}\in\mathbb{R}^{d\times r}$, $\mathbf{A}\in\mathbb{R}^{r\times k}$, $r\ll\min(d,k)$. Chỉ $\mathbf{A},\mathbf{B}$ được huấn luyện. Đầu ra $\mathbf{h}=\mathbf{W}_0\mathbf{x}+\frac{\alpha}{r}\mathbf{B}\mathbf{A}\mathbf{x}$.
- **Giả thuyết đằng sau:** khi thích nghi với một tác vụ, **cập nhật trọng số có "hạng nội tại" thấp** (lấy cảm hứng từ Aghajanyan và cộng sự 2020, về "chiều nội tại"; chưa tra paper này nên chỉ nêu qua [Hu21]). Đây là giả thuyết được kiểm bằng thực nghiệm, không phải định lý.
- **Khởi tạo [Hu21].** $\mathbf{A}$ khởi tạo Gaussian ngẫu nhiên, $\mathbf{B}$ khởi tạo **bằng 0**, nên $\Delta\mathbf{W}=0$ lúc bắt đầu: mô hình bắt đầu đúng như mô hình gốc. (Đã kiểm trong code bên dưới: đầu ra trùng khít trước khi huấn luyện.)
- **Hệ số $\alpha/r$ [Hu21].** Nhân $\Delta\mathbf{W}\mathbf{x}$ với $\alpha/r$, $\alpha$ là hằng số theo $r$; họ đặt $\alpha$ bằng giá trị $r$ đầu tiên thử và không chỉnh. Mục đích: đổi $r$ mà ít phải chỉnh lại siêu tham số; với Adam, chỉnh $\alpha$ gần như tương đương chỉnh tốc độ học (khi khởi tạo được co giãn phù hợp). Không có lập luận chặt hơn trong paper; đừng nói quá.
- **Không thêm độ trễ khi suy luận [Hu21].** Có thể **gộp** $\mathbf{W}=\mathbf{W}_0+\frac{\alpha}{r}\mathbf{B}\mathbf{A}$ rồi suy luận như thường. Khác với adapter. Cái giá: khó trộn nhiều tác vụ với $\mathbf{A},\mathbf{B}$ khác nhau trong một batch nếu đã gộp. Mặt lợi: lưu 100 bản tinh chỉnh chỉ tốn 350 GB + 100 × 35 MB, thay vì 100 × 350 GB (con số của paper).
- **Gắn vào đâu.** [Hu21] chỉ gắn vào các ma trận attention ($\mathbf{W}_q,\mathbf{W}_k,\mathbf{W}_v,\mathbf{W}_o$), thực nghiệm chính dùng $\mathbf{W}_q$ và $\mathbf{W}_v$, đóng băng MLP "cho đơn giản và tiết kiệm tham số". [D23] lại thấy khi dùng LoRA kiểu "chỉ query và value" thì **không tái hiện được** chất lượng fine-tune đầy đủ trên mô hình nền lớn; **gắn vào mọi lớp tuyến tính** của khối Transformer mới khớp 16-bit; họ báo các siêu tham số khác như $r$ không ảnh hưởng (theo mục 3 của [D23]). Hai paper hơi khác nhau: nói rõ khi viết, đừng chọn một bên.
- **Số liệu để dạy:** GPT-3 175B trong [Hu21] dùng 18M tham số khả huấn luyện (ngân sách được nêu rõ trong bảng so sánh). Ta tự kiểm bằng phép nhân: $96$ lớp × $2$ ma trận ($\mathbf{W}_q,\mathbf{W}_v$) × $r(d+k)$ với $r=4$, $d=k=12288$ cho **18 874 368**, khớp "18M". (Cấu hình 96 lớp và $d_{\text{model}}=12288$ là của GPT-3 175B theo [B20]; suy từ công thức, chưa ghi vào tài liệu này từ bảng cấu hình, **người viết đối chiếu lại bảng 2.1 của [B20]** trước khi nêu.)

### QLoRA

- **Ý chính [D23].** Lượng tử hóa mô hình nền xuống **4 bit và đóng băng**, rồi truyền gradient **qua** mô hình lượng tử hóa vào các adapter LoRA. Tóm tắt nêu fine-tune được mô hình 65B trên một GPU 48 GB mà vẫn giữ chất lượng như fine-tune 16-bit đầy đủ; trong phần mở đầu: fine-tune 16-bit LLaMA 65B thông thường cần hơn 780 GB bộ nhớ GPU.
- **Ba đóng góp kỹ thuật [D23].** (1) **NormalFloat 4-bit (NF4):** kiểu dữ liệu 4 bit dựa trên lượng tử hóa theo phân vị, được mô tả là tối ưu theo lý thuyết thông tin cho dữ liệu phân phối chuẩn có tâm 0; trọng số mạng thường xấp xỉ chuẩn nên phù hợp; thực nghiệm tốt hơn int4 và float4. (2) **Double quantization:** lượng tử hóa luôn các hằng số lượng tử hóa; với khối 64, hằng số FP32 tốn $32/64=0{,}5$ bit/tham số, sau đó chỉ còn khoảng $0{,}127$ bit/tham số, tiết kiệm trung bình khoảng 0,37 bit mỗi tham số (khoảng 3 GB cho mô hình 65B). (3) **Paged optimizers:** quản lý các đỉnh bộ nhớ khi huấn luyện.
- **Hai kiểu dữ liệu.** Một kiểu để **lưu** (NF4) và một kiểu để **tính** (BFloat16): trọng số được giải lượng tử về BF16 ngay lúc nhân ma trận. Adapter LoRA giữ ở 16 bit. Nên: lượng tử hóa tiết kiệm chỗ **lưu**, không phải mọi phép tính chạy ở 4 bit.
- **Chỉ lượng tử hóa mô hình nền, không lượng tử hóa adapter.** Gradient chỉ cần cho adapter (trọng số 4 bit đóng băng); [D23] nêu rằng bộ nhớ của gradient adapter (kích hoạt) còn lớn hơn cả trọng số LoRA, nên họ dùng gradient checkpointing (chỉ đọc qua, chi tiết ở phần phụ lục).

### Lượng tử hóa (quantization)

- **Ý tưởng chung.** Biểu diễn trọng số (hay kích hoạt) bằng số có ít bit hơn, ví dụ FP16 sang int8 hoặc int4. Lợi: tiết kiệm bộ nhớ và băng thông. Hại: **sai số làm tròn**.
- **Absmax [D22].** Với ma trận $\mathbf{X}$: hệ số co giãn $s=127/\max_{ij}|X_{ij}|$; $\mathbf{X}_{\text{int8}}=\operatorname{round}(s\,\mathbf{X})$ nằm trong $[-127,127]$; giải lượng tử $\hat{\mathbf{X}}=\mathbf{X}_{\text{int8}}/s$. Công thức tổng quát cho $b$ bit: $q_{\max}=2^{b-1}-1$ (127 với 8 bit, 7 với 4 bit). Cách làm này đối xứng quanh 0.
- **Bước lượng tử hóa là $\pm\frac{1}{2s}$.** Sai số làm tròn mỗi phần tử tối đa $\frac{1}{2s}=\frac{\max|X|}{2q_{\max}}$; số bit giảm 4 thì $q_{\max}$ giảm từ 127 xuống 7 (khoảng 18 lần), nên sai số tăng theo (đã kiểm bằng số, bên dưới).
- **Điểm yếu: giá trị ngoại lai (outlier).** Absmax dùng một hệ số cho cả tensor; **một giá trị lớn** làm $s$ nhỏ, và mọi giá trị còn lại bị làm tròn thô. [D22] thấy từ cỡ **6,7 tỷ tham số** trở lên, các đặc trưng ngoại lai có biên độ lớn xuất hiện có hệ thống và làm quantization 8 bit đơn giản mất chất lượng; giải pháp của họ gồm **vector-wise quantization** (hằng số riêng cho từng tích trong) và **phân rã độ chính xác hỗn hợp**: tách các chiều ngoại lai (ngưỡng biên độ 6,0 trong paper) ra nhân ở 16 bit, trong khi hơn 99,9% giá trị còn lại nhân ở 8 bit; không mất chất lượng đến 175B theo tóm tắt của họ.
- **Quantization sau huấn luyện (post-training) cho LLM.** [F22] **GPTQ**: lượng tử hóa trọng số một lần (one-shot) bằng thông tin bậc hai xấp xỉ, xuống 3 hoặc 4 bit với mất mát nhỏ; lượng tử hóa mô hình 175B tốn khoảng bốn giờ GPU. Chỉ nhắc tên và ý ("không huấn luyện lại, dùng một ít dữ liệu mẫu để chỉnh sai số"); phần "dùng một ít dữ liệu mẫu" là hiểu biết chung, **chưa đọc trong paper** nên không viết thành khẳng định.
- **Bộ nhớ chỉ tính trọng số (phép nhân, không phải đo):** mô hình 7 tỷ tham số cần khoảng 14 GB ở FP16 (2 byte/tham số), 7 GB ở int8, 3,5 GB ở int4; chưa kể kích hoạt, KV cache, hằng số lượng tử hóa.
- **Lượng tử hóa nhận biết khi huấn luyện** (quantization-aware training) không có trong phạm vi bài, chỉ nhắc để phân biệt (không nguồn).

### Chắt lọc tri thức (distillation) [Hi15]

- **Ý tưởng.** Dùng mô hình lớn ("thầy", cumbersome model) tạo ra **nhãn mềm** (soft targets) để huấn luyện mô hình nhỏ ("trò"). Nhãn mềm chứa nhiều thông tin hơn nhãn cứng: xác suất nhỏ của các lớp sai cho biết lớp nào "giống" lớp nào. Ví dụ trong paper (diễn đạt lại): một chữ số 2 có thể có xác suất bé là 3 hơn là 7, cho thấy cấu trúc giống nhau mà nhãn cứng không có.
- **Nhiệt độ $T$.** Softmax có $T$: $q_i=\dfrac{\exp(z_i/T)}{\sum_j\exp(z_j/T)}$; $T=1$ là softmax thường; $T$ lớn làm phân phối **mềm** hơn (lộ rõ xác suất nhỏ). Trò được huấn luyện ở cùng nhiệt độ cao với thầy, **sau huấn luyện dùng $T=1$**. Đây cùng nhiệt độ với `SamplingViz` ở `text-api`, nhưng ở đây dùng khác mục đích (lúc huấn luyện, không phải lúc sinh): nói rõ để khỏi nhầm.
- **Hàm mục tiêu.** Kết hợp hai mất mát: cross-entropy với nhãn mềm của thầy (ở nhiệt độ $T$) và cross-entropy với nhãn cứng (ở $T=1$). Vì độ lớn gradient của phần nhãn mềm co theo $1/T^2$, **phải nhân phần đó với $T^2$** để tỉ lệ đóng góp của hai phần không đổi khi đổi $T$.
- **Kết quả trên MNIST [Hi15].** Mạng lớn (2 lớp ẩn 1200 nơ-ron, có chính quy hóa mạnh) có 67 lỗi test; mạng nhỏ hơn (2 lớp 800 nơ-ron, không chính quy hóa) có 146 lỗi; mạng nhỏ này khi học thêm nhiệm vụ khớp nhãn mềm ở $T=20$ chỉ còn 74 lỗi. Có thể dùng làm một câu minh họa; nêu rõ là MNIST năm 2015, không phải LLM.
- **Ở giới hạn nhiệt độ cao,** chắt lọc tương đương khớp logit (bình phương sai số giữa logit của trò và thầy sau khi trừ trung bình mỗi mẫu) (mục 2.1 của [Hi15]); không cần đưa vào bài, nhưng là điểm nối với "khớp logit".
- **Chắt lọc cho LLM:** chưa tra. Bài chỉ nên nói ý ở dạng chung, kèm cảnh báo đây là thiết lập của [Hi15] (phân loại).

### Tỉa tham số (pruning) [Ha15], [F23]

- **Ý tưởng [Ha15].** Bỏ các kết nối ít quan trọng của mạng đã huấn luyện. Quy trình ba bước: huấn luyện mạng để biết kết nối nào quan trọng, **tỉa** các kết nối yếu, **huấn luyện lại** các trọng số còn lại. Theo tóm tắt: AlexNet giảm 9 lần tham số (từ 61 triệu xuống 6,7 triệu) và VGG-16 giảm 13 lần (138 triệu xuống 10,3 triệu) mà không giảm độ chính xác trên ImageNet. Thiết lập là mạng thị giác 2015, không phải LLM.
- **Tiêu chí "quan trọng" của [Ha15]** (chưa đọc chi tiết): ngầm hiểu là theo độ lớn trọng số; **chưa xác minh**, đừng viết nếu chưa đọc mục 3 của paper.
- **SparseGPT [F23]** (chỉ nhắc tên): tỉa mô hình họ GPT lớn **một lần, không huấn luyện lại**, đạt ít nhất 50% độ thưa mà mất mát chính xác nhỏ; chạy trên OPT-175B và BLOOM-176B dưới 4,5 giờ; 60% thưa không theo cấu trúc mà perplexity tăng không đáng kể; hỗ trợ cả mẫu thưa bán cấu trúc 2:4 và 4:8; dùng chung được với lượng tử hóa.
- **Thưa không có cấu trúc khác thưa có cấu trúc** (nhận định chung, không nguồn riêng): tỉa rời rạc làm ma trận "lỗ chỗ" nên cần phần cứng hay thư viện hỗ trợ mới thấy nhanh hơn; chỉ giảm số tham số khác nhiều giảm thời gian chạy.

### Unsloth (chỉ nhắc tên)

- Bộ công cụ mã nguồn mở để huấn luyện và chạy LLM [UNS], hỗ trợ LoRA và QLoRA. Lõi Apache 2.0; một số thành phần giao diện tùy chọn theo AGPL-3.0. Không nêu số tăng tốc (không kiểm chứng). Không đưa code của nó vào bài. Gói `unsloth` 2026.10.8 (PyPI, 24/10/2026): chưa cài, chưa chạy.

## Công thức quan trọng

Ký hiệu theo site: trọng số $\mathbf{W}$, đầu vào $\mathbf{x}$, tham số $\boldsymbol{\theta}$, mất mát $\mathcal{L}$, độ dài chuỗi $L$, nhiệt độ $T$. Với LoRA dùng thêm hạng $r$ và hệ số $\alpha$ (không nằm trong bảng ký hiệu của `CLAUDE.md`; cần giải thích ở lần đầu).

**Perplexity** (trên chuỗi $s_1,\dots,s_N$ gồm $N$ token, NLL trung bình theo token):

$$\text{PPL}=\exp\!\Big(-\frac{1}{N}\sum_{t=1}^{N}\log p_{\boldsymbol{\theta}}(s_t\mid s_{<t})\Big)$$

Cần giải thích bằng lời: bên trong dấu exp là cross-entropy trung bình đã gặp ở `build-first-llm`; đoán đều trên $V$ token cho $\text{PPL}=V$; PPL càng nhỏ càng tốt.

**LoRA** ([Hu21] pt. (3), kèm hệ số co giãn trong 4.1):

$$\mathbf{h}=\mathbf{W}_0\mathbf{x}+\frac{\alpha}{r}\,\mathbf{B}\mathbf{A}\mathbf{x},\qquad \mathbf{B}\in\mathbb{R}^{d\times r},\ \mathbf{A}\in\mathbb{R}^{r\times k},\ r\ll\min(d,k)$$

**Số tham số** của một ma trận $d\times k$: đầy đủ $dk$; LoRA $r(d+k)$. Tỉ lệ $\dfrac{r(d+k)}{dk}$. Với $d=k=4096$, $r=8$: 65 536 so với 16 777 216, tức 0,39% (đã chạy, xem dưới).

**Gộp trọng số khi suy luận:** $\mathbf{W}=\mathbf{W}_0+\frac{\alpha}{r}\mathbf{B}\mathbf{A}$.

**Absmax $b$ bit** (viết lại từ [D22] mục 2.1 cho $b$ bit tổng quát; paper viết cho 8 bit):

$$q_{\max}=2^{b-1}-1,\qquad s=\frac{q_{\max}}{\max_{ij}|W_{ij}|},\qquad \mathbf{W}_{\text{q}}=\operatorname{round}(s\,\mathbf{W}),\qquad \hat{\mathbf{W}}=\frac{\mathbf{W}_{\text{q}}}{s}$$

Sai số mỗi phần tử không vượt quá $\dfrac{1}{2s}$ (trừ phần tử bị cắt, không xảy ra với absmax vì $|sW_{ij}|\le q_{\max}$).

**Softmax có nhiệt độ** ([Hi15], mục 2) và **mất mát chắt lọc** (dạng tổng quát của bài; [Hi15] mô tả bằng lời, trọng số $\lambda$ giữa hai phần là cách viết của người tóm tắt):

$$q_i=\frac{\exp(z_i/T)}{\sum_j\exp(z_j/T)},\qquad \mathcal{L}=\lambda\,T^{2}\,\mathrm{CE}\big(\mathbf{q}^{\text{thầy}}_{T},\mathbf{q}^{\text{trò}}_{T}\big)+(1-\lambda)\,\mathrm{CE}\big(\mathbf{y},\mathbf{q}^{\text{trò}}_{1}\big)$$

Giải thích: $\mathbf{q}_T$ là softmax ở nhiệt độ $T$; $\mathbf{y}$ là nhãn cứng; nhân $T^2$ để gradient của phần mềm không bị co theo $1/T^2$ ([Hi15]).

**Bộ nhớ trọng số** (phép nhân của người tóm tắt): $\text{bộ nhớ}\approx \dfrac{\text{số tham số}\times\text{số bit}}{8}$ byte; QLoRA có thêm $\approx 0{,}127$ bit/tham số cho hằng số lượng tử hóa [D23] (khối 64, double quantization).

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; chỗ có "(gợi ý)" là của `summarizer`.

- **LoRA như miếng dán lên bản gốc (gợi ý, nối với `LoraFigure`):** ma trận $\mathbf{W}_0$ là một cuốn sách in sẵn, bị khóa. Thay vì in lại cả cuốn, bạn ghi **một tờ ghi chú nhỏ** ($\mathbf{B}\mathbf{A}$) kẹp vào; khi đọc, cộng nội dung hai nơi. Tờ ghi chú nhỏ vì được **tạo từ hai thanh hẹp** ($d\times r$ và $r\times k$), như một bảng nhân hai vectơ cho ra cả bảng lớn. Hình `LoraFigure` (llm-lessons.md 2.9) nên vẽ đúng ba khối: $\mathbf{W}_0$ đóng băng, $\mathbf{B}$ và $\mathbf{A}$ khả huấn luyện, dấu cộng ở đầu ra.
- **Bảng so sánh số tham số (gợi ý, đã tính):** một ma trận $4096\times4096$ có 16 777 216 tham số; LoRA với $r=1,\,8,\,64$ cho 8 192; 65 536; 524 288 tham số, tức 0,05%; 0,39%; 3,1%. Chỉ rõ đây là **một** ma trận; mô hình có hàng trăm ma trận. Dùng ví dụ GPT-3 ($r=4$, 18 874 368 tham số) làm cột mốc có nguồn.
- **Lượng tử hóa như làm tròn tiền (gợi ý):** int8 giống làm tròn đến 1 xu khi tổng chênh lệch lớn; int4 như làm tròn đến cả đồng khi có một giao dịch cực lớn kéo "thước đo" giãn ra: **một ngoại lai làm thước chia thô cho tất cả**. Ví dụ số (đã chạy): thêm một phần tử bằng 40 vào ma trận chuẩn thì sai số của các phần tử còn lại nhảy từ 0,011 lên 0,091 ở int8 và từ 0,195 lên 0,992 ở int4 (xem bên dưới); ở 4 bit, sai số xấp xỉ **bằng cả độ lệch chuẩn của dữ liệu** vì gần như mọi phần tử bị làm tròn về 0. Đây là bản mini của vấn đề ngoại lai trong [D22].
- **Thầy giáo và học sinh (gợi ý, từ [Hi15]):** học sinh chỉ học đáp án đúng/sai thì mất thông tin; nếu thầy nói thêm "đáp án này sai nhưng gần đúng hơn đáp án kia", học sinh học được cách thầy suy nghĩ. Nhiệt độ $T$ cao như bảo thầy nói thật cặn kẽ.
- **Tỉa như cắt tỉa cành (gợi ý):** huấn luyện đầy đủ như để cây mọc; tỉa cành yếu; rồi chăm lại phần còn lại (huấn luyện lại), như ba bước của [Ha15].
- **Điểm benchmark như điểm thi (gợi ý):** nếu học sinh đã thấy đề thi, điểm cao chưa chứng minh gì (contamination). Giám khảo LLM như một giáo viên chấm bài tự luận: nhanh, nhưng thiên về bài dài và bài đứng trước ([Z23]).
- **Bảng cho mục Minh họa (gợi ý, theo `llm-lessons.md` 2.7 mục 2):** "Bốn cách làm mô hình gọn hơn": cột "Làm gì", "Huấn luyện lại?", "Lợi chính", "Cái giá": LoRA (thêm adapter nhỏ, huấn luyện adapter, tiết kiệm bộ nhớ huấn luyện và chỗ lưu, giữ hạng thấp); quantization (giảm số bit, thường không cần huấn luyện lại, tiết kiệm chỗ lưu và băng thông, sai số làm tròn); distillation (huấn luyện mô hình nhỏ bằng nhãn mềm, có, mô hình nhỏ chạy nhanh, cần mô hình thầy và dữ liệu); pruning (bỏ kết nối, tùy phương pháp, ít tham số, cần hỗ trợ phần cứng mới nhanh hơn). Đây là bảng của người tóm tắt, tổng hợp từ các mục trên.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **LoRA không làm mô hình nhỏ hơn.** Mô hình gốc vẫn còn nguyên; LoRA chỉ giảm số tham số **huấn luyện** và dung lượng **bản tinh chỉnh**. [Hu21] nói rõ cần giữ cả mô hình 350 GB khi triển khai.
2. **Nhầm hạng $r$ với "độ chính xác".** $r$ lớn hơn không tự nhiên tốt hơn: [D23] báo cáo trong thiết lập của họ $r$ không ảnh hưởng chất lượng khi LoRA đã gắn vào mọi lớp; nhưng đó là kết quả trên một thiết lập, không phải quy luật. Đừng khuyên giá trị $r$ cụ thể.
3. **Gắn LoRA chỉ vào query và value là đủ.** [Hu21] làm vậy; [D23] thấy chưa đủ để khớp fine-tune đầy đủ trên mô hình nền lớn (xem trên).
4. **$\mathbf{B}=0$ lúc đầu không có nghĩa gradient bằng 0 cho cả hai.** (Suy ra từ công thức, đã kiểm trong code: huấn luyện chạy và loss giảm.) Gradient của $\mathbf{A}$ lúc đầu bằng 0 vì $\mathbf{B}=0$, nhưng gradient của $\mathbf{B}$ khác 0, nên sau bước đầu $\mathbf{A}$ mới bắt đầu nhận gradient. Người viết có thể tự kiểm lại bằng một bước `loss.backward()` trước khi viết câu này.
5. **Quantization 4 bit không nghĩa là phép tính ở 4 bit.** QLoRA lưu 4 bit, tính 16 bit sau khi giải lượng tử [D23].
6. **Int4 tệ hơn int8 gấp nhiều lần với cùng cách làm tròn.** Số đã chạy: sai số trung bình tăng khoảng 18 lần (0,0108 lên 0,195) trên ma trận chuẩn; ngoại lai làm cả hai tệ đi. Đừng khái quát sang mô hình thật: đây là ma trận ngẫu nhiên.
7. **Perplexity thấp không có nghĩa "tốt hơn" khi so hai mô hình khác tokenizer** (suy từ định nghĩa).
8. **Điểm benchmark cao có thể do đã thấy đề (contamination)** [B20], và giám khảo LLM thiên lệch về vị trí, độ dài, tự ưu ái [Z23]. Bài nên kết thúc mục đánh giá bằng: dùng nhiều cách đo và một tập kiểm tra của riêng bạn.
9. **"Tỉa 50%" không có nghĩa nhanh gấp đôi.** Cần phần cứng/thư viện hỗ trợ độ thưa (nhận định chung).
10. **Chắt lọc không phải là fine-tune mô hình nhỏ bằng nhãn cứng.** Điểm chính là nhãn mềm ở nhiệt độ cao [Hi15]; và nhiệt độ ở đây khác nhiệt độ lúc sinh văn bản ở `SamplingViz`, dù cùng công thức softmax.
11. **Cài `peft`/`bitsandbytes`/Unsloth không có nghĩa chạy được trên máy không GPU.** Chưa kiểm; ghi "cần GPU" chỉ nếu đã đọc tài liệu đúng phiên bản.
12. **Số benchmark và số bộ nhớ của paper gắn với thiết lập và năm của họ** (`llm-lessons.md` 2.6): ghi kèm paper và năm, không viết "hiện nay".

## Số tự chạy (Python, ngày 24/10/2026)

Hai script nằm ở scratchpad (`np_demo.py` 34 dòng, `lora_torch.py` 42 dòng), **không** nằm trong repo.

### Ô `PythonRunner`: NumPy (Pyodide)

Chạy bằng venv Pyodide `C:/Users/Dell/.venvs/ai-atlas-py314` (Python 3.14.5, NumPy **2.4.6**, đúng bản Pyodide 314.0.7), `python -I`. `rng = np.random.default_rng(0)`; ma trận $\mathbf{W}$ là `rng.normal(0, 1, size=(256, 256))` kiểu `float32`, giá trị tuyệt đối lớn nhất 4,732. Hàm absmax: $q_{\max}=2^{b-1}-1$, $s=q_{\max}/\max|W|$, làm tròn và cắt vào $[-q_{\max},q_{\max}]$, giải lượng tử bằng $/s$.

| Đại lượng | Giá trị |
|---|---|
| Ma trận $4096\times4096$, $r=8$: tham số đầy đủ / LoRA / tỉ lệ | 16 777 216 / 65 536 / 0,3906% |
| GPT-3 175B, 96 lớp × 2 ma trận × $r=4$, $d=k=12288$ | 18 874 368 |
| int8 absmax: RMSE / sai số lớn nhất | 0,01079 / 0,01863 |
| int4 absmax: RMSE / sai số lớn nhất | 0,19508 / 0,33798 |
| Thêm một phần tử bằng 40 (ngoại lai), RMSE của các phần tử khác, int8 | 0,09084 |
| Như trên, int4 | 0,99199 |

- Kết quả khớp lập luận: sai số tối đa của int8 phải $\le\frac{4{,}732}{2\times127}=0{,}01863$ và đúng bằng giá trị đó; của int4 $\le\frac{4{,}732}{2\times7}=0{,}3380$ và đúng bằng giá trị đó. (Sai số lớn nhất đạt cận trên vì tập 65 536 phần tử đủ lớn để có phần tử rơi sát điểm giữa của hai mức.)
- Với ngoại lai bằng 40: $\frac{1}{2s}$ tăng khoảng 8,5 lần ($40/4{,}73$), và RMSE int4 xấp xỉ độ lệch chuẩn của dữ liệu (1,0). Nghĩa là gần như mọi phần tử bị làm tròn về 0.
- **Số đã in dưới dạng làm tròn 5 chữ số; người viết chạy lại script trước khi ghi con số vào bài** (và nếu đổi kích thước ma trận, số đổi).
- Lưu ý khi viết thành ô cho người đọc: cần `float32`, `np.random.default_rng(0)`; không cần thư viện nào ngoài NumPy.

### Ô `LocalCode`: PyTorch, lớp LoRA tự viết

Chạy bằng `.venv-llm` (torch **2.14.1+cpu**, Python 3.14.5, `python -I -X utf8`), `torch.manual_seed(0)`. Lớp `LoRALinear(base, r=4, alpha=8)`: đóng băng `base`, $\mathbf{A}$ là `randn(r, in) * 0.01`, $\mathbf{B}$ là `zeros(out, r)`, `scale = alpha / r`; `forward = base(x) + scale * (x @ A.T @ B.T)`; hàm `merged_weight` trả $\mathbf{W}_0+\text{scale}\cdot\mathbf{B}\mathbf{A}$. Đặt bài toán: `Linear(64, 64)` không bias, đầu vào `x` kích thước $10\times64$, đích là đầu ra của (trọng số gốc + một ma trận hạng 2 nhân 0,1); Adam, `lr=1e-2`, 300 bước, chỉ huấn luyện $\mathbf{A},\mathbf{B}$.

Output (đã chạy thật, copy nguyên):

```text
same at start: True
0 1.16814
100 3e-05
200 0.0
299 0.0
trainable 512 of 4608
merge ok: True
```

- **Ý dùng cho bài:** (1) $\mathbf{B}=0$ nên đầu ra ban đầu trùng khít mô hình gốc (`True`); (2) chỉ 512 trong 4608 tham số được huấn luyện ($r(d+k)=4\times128=512$; còn lại $64\times64=4096$ là của $\mathbf{W}_0$); (3) gộp trọng số cho đầu ra giống lúc chạy tách (`merge ok`, `atol=1e-5`).
- **Cảnh báo về chính ví dụ này (phải nói trong bài, nếu dùng):** `x` chỉ có 10 mẫu cho ma trận $64\times64$, bài toán dễ (đích là hạng 2 mà $r=4\ge2$), nên loss về 0 không chứng minh LoRA mạnh; nó chỉ chứng minh cơ chế chạy đúng. Đừng viết "LoRA học hoàn hảo". Loss kiểm tra trên mẫu khác chưa đo.
- Tổng thời gian chạy: chưa đo chính thức, tức thì trên CPU. Mức kiểm chứng đề xuất: `chạy thật`.
- Dòng `print(0 ... 1.16814)` phụ thuộc seed và phiên bản torch; nếu bài trích số này thì phải chạy lại đúng môi trường.

### Đề xuất code của bài

- **Một ô `PythonRunner`** (NumPy, ≤ 40 dòng): đếm tham số LoRA (công thức $r(d+k)$) và đo sai số absmax int8/int4, thêm một ngoại lai để thấy tác động. Chỉ dùng NumPy, chạy được trong Pyodide; **phải chạy lại bằng venv Pyodide** trước khi chốt số (đã chạy bằng venv đó ở trên).
- **Một ô `LocalCode`** (PyTorch, ≤ 60 dòng, mỗi dòng ≤ 79 ký tự): lớp `LoRALinear` như trên, `packages={['torch']}`, không cần biến môi trường, không cần mạng. Đề xuất file `src/code/llm/evaluation-peft/lora-layer.vi.py` (và `.en.py`).
- **Không** đưa `peft`, `bitsandbytes`, `transformers`, Unsloth vào code chạy: chưa có trong `.venv-llm`, nhiều phần cần GPU (với `bitsandbytes` chưa kiểm, ghi "chưa xác minh"). Nếu bài nhắc tên: chỉ viết lời văn hoặc khối `text` không chạy, kèm phiên bản **`peft` 0.21.2, `bitsandbytes` 0.50.2, `unsloth` 2026.10.8** (bản mới nhất trên PyPI ngày 24/10/2026, lấy bằng `pip index versions`). Báo phiên chính nếu muốn thêm gói vào `scripts/requirements-llm.txt`.
- **Hình `LoraFigure`:** xem `llm-lessons.md` 2.9; ba khối $\mathbf{W}_0$ (đóng băng), $\mathbf{B}$ và $\mathbf{A}$ (huấn luyện), dấu cộng, đầu vào $\mathbf{x}$ chia làm hai nhánh; chú thích hạng $r$ và $\alpha/r$. Chữ vi/en nằm ở `src/data/figures/`.
- Dòng phiên bản của mục "Ví dụ code" theo `llm-lessons.md` 2.6: "Code trong bài chạy thử lần cuối tháng 10/2026, với Python 3.14 và PyTorch 2.14" (ô NumPy: NumPy 2.4 của Pyodide). Lấy từ bảng kiểm chứng ở cuối.

## Liên quan tới bài nào

- **Cần biết trước:** `llm/gpt-family-finetuning` (SFT là nền tảng; fine-tune đầy đủ là thứ PEFT thay thế; cách đo "chưa thấy" của FLAN).
- **Trước:** `ml/overfitting-underfitting` (tập kiểm tra, rò rỉ qua tập test); `ml/regularization` (chính quy hóa; điểm nối với "hạng thấp" là một dạng ràng buộc, nhận định chung, không nguồn); `llm/build-first-llm` (cross-entropy, NLL, perplexity); `llm/text-api` (nhiệt độ ở `SamplingViz`, khác nhiệt độ chắt lọc); `llm/rlhf` (đánh giá ưa thích của người).
- **Sau:** `llm/llm-deployment` (lượng tử hóa khi triển khai); `llm/deploy-custom-model` (có `evaluation-peft` làm bài cần biết trước ở roadmap; cũng dùng bộ nhớ mô hình).
- Ngoài bài: `dl/transformers` (các ma trận $\mathbf{W}_q,\mathbf{W}_k,\mathbf{W}_v,\mathbf{W}_o$ và MLP); `llm/dpo` (đánh giá sau căn chỉnh).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Tinh chỉnh tiết kiệm tham số | Parameter-efficient fine-tuning (PEFT) | Dịch, gloss lần đầu; sau đó dùng "PEFT" |
| Thích nghi hạng thấp | Low-rank adaptation (LoRA) | Giữ "LoRA" làm tên; gloss "thích nghi hạng thấp" lần đầu |
| Hạng (của ma trận) | Rank | Dịch; nhắc đã gặp ở `math/linear-algebra` nếu có |
| Bộ chuyển đổi | Adapter | Giữ "adapter" (người Việt hay dùng nguyên) |
| Lượng tử hóa | Quantization | Dịch, gloss lần đầu |
| Chắt lọc tri thức | Knowledge distillation | Dịch, gloss lần đầu |
| Nhãn mềm | Soft targets | Dịch, gloss lần đầu |
| Tỉa tham số | Pruning | Dịch, gloss lần đầu |
| Độ thưa | Sparsity | Dịch |
| Giá trị ngoại lai | Outlier | Dịch; ở ngữ cảnh đặc trưng của LLM có thể ghi kèm "outlier" |
| Độ rối (độ phân vân) | Perplexity | Giữ "perplexity" (quen dùng tiếng Anh); giải thích bằng lời |
| Bộ đánh giá chuẩn | Benchmark | Giữ "benchmark" |
| Rò rỉ dữ liệu test | Test-set contamination | Dịch, gloss lần đầu |
| LLM làm giám khảo | LLM-as-a-judge | Dịch, gloss lần đầu |
| Hệ số co giãn (trong lượng tử hóa) | Scale (scaling factor) | Dịch |
| Điểm kiểm | Checkpoint | Giữ "checkpoint" |

## Đọc thêm đề xuất

1. **Hu và cộng sự (2021)**, LoRA: [arXiv:2106.09685](https://arxiv.org/abs/2106.09685). Đọc mục 4.
2. **Dettmers và cộng sự (2023)**, QLoRA: [arXiv:2305.14314](https://arxiv.org/abs/2305.14314). Đọc mục 3 (NF4, double quantization).
3. **Dettmers và cộng sự (2022)**, LLM.int8(): [arXiv:2208.07339](https://arxiv.org/abs/2208.07339). Đọc mục 2.1 (absmax) và phần ngoại lai.
4. **Hinton và cộng sự (2015)**, chắt lọc tri thức: [arXiv:1503.02531](https://arxiv.org/abs/1503.02531). Đọc mục 1-2.
5. **Han và cộng sự (2015)**, tỉa trọng số: [arXiv:1506.02626](https://arxiv.org/abs/1506.02626).
6. **Hendrycks và cộng sự (2021)**, MMLU: [arXiv:2009.03300](https://arxiv.org/abs/2009.03300); **Zheng và cộng sự (2023)**, giám khảo LLM: [arXiv:2306.05685](https://arxiv.org/abs/2306.05685).
7. Chỉ nhắc tên (đã đọc tóm tắt): GPTQ [arXiv:2210.17323](https://arxiv.org/abs/2210.17323); SparseGPT [arXiv:2301.00774](https://arxiv.org/abs/2301.00774).
8. Tài liệu Hugging Face: [PEFT](https://huggingface.co/docs/peft/index) (`peft` 0.21.2). Link tới đúng phiên bản khi trang có phiên bản (`llm-lessons.md` 2.7).

## Kiểm chứng code

Code của bài nằm ở `src/code/llm/evaluation-peft/`. Hai dòng cuối là thử nghiệm của `summarizer` ở scratchpad, không phải code trong bài.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `lora-quant.vi.py`, `lora-quant.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2, NumPy 2.4.6), `default_rng(0)` | Ô `PythonRunner`, 43 dòng (thêm một dòng comment về `np.clip` sau review, output không đổi). Reviewer chạy lại cả hai bản bằng Pyodide thật, trùng. 8192 / 65536 / 524288 trên 16777216 (0.05% / 0.39% / 3.12%); GPT-3 r = 4: 18874368; max abs 4.732; int8 rmse 0.0108, max 0.0186 = cận 0.0186, 0 là 1.4%; int4 rmse 0.1951, max 0.3380 = cận, 0 là 26.3%; ngoại lai 40: int8 rmse 0.0908 (cận 0.1575, 0 là 12.4%), int4 rmse 0.9920 (cận 2.8571, 0 là 99.6%). Hai bản in giống hệt nhau, khớp lời văn |
| `lora-layer.vi.py`, `lora-layer.en.py` | chạy thật | 2026-10-24 | `.venv-llm`, Python 3.14.5, torch 2.14.1+cpu, `torch.manual_seed(0)`, `python -I -X utf8` | 57 dòng, dòng dài nhất 79 ký tự, khoảng 5 giây. Kết quả mẫu trong bài chép nguyên văn từ lần chạy này (cả hai bản in giống hệt): same at start True; grad A zero True, grad B zero False; train loss 2.39636 xuống 0.00000; test loss 1.14020 xuống 0.87876; trainable 512 of 4608; merge ok True. Biến thể 100 mẫu huấn luyện (chỉ đổi dòng `x`, chạy ở scratchpad): test loss sau 0.00001. Độ lệch gộp và hai nhánh đo thêm: 2.4e-6. Reviewer chạy lại cả hai bản bằng torch thật, output trùng từng ký tự |
| (thử nghiệm) `np_demo.py` | chạy thật | 2026-10-24 | venv Pyodide `ai-atlas-py314`, Python 3.14.5, NumPy 2.4.6 | Thử nghiệm của summarizer; số khớp ô `lora-quant` |
| (thử nghiệm) `lora_torch.py` | chạy thật | 2026-10-24 | `.venv-llm`, torch 2.14.1+cpu | Thử nghiệm của summarizer, tiền thân của `lora-layer` |

Cả bốn file qua `ast.parse(..., feature_version=(3, 10))`. So cặp vi/en sau khi bỏ comment và làm rỗng chuỗi: giống nhau từng dòng.

Đối chiếu nguồn khi viết bài (24/10/2026, `pdftotext` trên PDF arXiv): bảng 2.1 của [B20] (GPT-3 175B: 96 lớp, $d_{\text{model}} = 12288$); mục 4 và phần mở đầu của nó trong [B20] (lỗi lọc, 13-gram, kết luận "phần lớn benchmark gần như không đổi", PIQA và Winograd bị đánh dấu); mục 4.1, 4.2, 7.1 của [Hu21] (ngân sách 18M ứng với $r = 4$ cho hai loại ma trận trên 96 lớp); đoạn chọn lớp của [D23]; tóm tắt và mục 2.1 của [D22] (6.7B, hơn 99.9% giá trị ở 8 bit); mục 2 và phần MNIST của [Hi15]; tóm tắt và mục 3 của [Ha15] (tỉa theo ngưỡng trọng số, huấn luyện lại là bước quan trọng).
