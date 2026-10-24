# Họ GPT và fine-tune đa nhiệm (The GPT Family and Multi-Task Fine-Tuning)

Bài: `llm/gpt-family-finetuning` (chỉ bản vi, khoảng 12 phút đọc). Bài cần biết trước: `llm/build-first-llm`. Bài sau dùng nó làm tiền đề: `llm/rlhf`, `llm/evaluation-peft`. Giáo án (buổi 13, phần LLM) nêu năm tác vụ: QA, sinh code, tóm tắt, truy hồi thông tin, dịch.

Ngày tra: **24/10/2026**. Cách tra: tải PDF của Radford 2018, Radford 2019, Brown 2020, Wei 2021, Sanh 2021, Ouyang 2022 rồi trích chữ bằng `pdftotext` (đã đọc đúng các đoạn nêu trong "Ý chính", chưa đọc cả bài); WebFetch trang arXiv, tài liệu TRL và Transformers; chạy thật Python trong scratchpad. Ý không có thẻ nguồn là kiến thức chung hoặc suy ra từ công thức.

## Nguồn

- **[R18]** Radford, A., Narasimhan, K., Salimans, T., Sutskever, I. (2018). [*Improving Language Understanding by Generative Pre-Training*](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf) (PDF). OpenAI, báo cáo kỹ thuật. Đã đọc mục 3 (phương pháp) và phần thiết lập.
- **[R19]** Radford, A., Wu, J., Child, R., Luan, D., Amodei, D., Sutskever, I. (2019). [*Language Models are Unsupervised Multitask Learners*](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) (PDF). OpenAI, báo cáo kỹ thuật (báo cáo GPT-2). Đã đọc tóm tắt, mục 2, 3.5-3.8.
- **[B20]** Brown, T. B., Mann, B., Ryder, N., và cộng sự (2020). [*Language Models are Few-Shot Learners*](https://arxiv.org/abs/2005.14165). arXiv:2005.14165 (nộp 5/2020; trang hiện ở v4, 7/2020). Trang arXiv không nêu hội nghị. Đã đọc tóm tắt và mục 2 (các thiết lập đánh giá).
- **[W21]** Wei, J., Bosma, M., Zhao, V. Y., Guu, K., Yu, A. W., Lester, B., Du, N., Dai, A. M., Le, Q. V. (2021). [*Finetuned Language Models Are Zero-Shot Learners*](https://arxiv.org/abs/2109.01652). arXiv:2109.01652 (nộp 9/2021; trang hiện ở v5, 2/2022). Trang arXiv không nêu hội nghị. Mô hình tên FLAN. Đã đọc tóm tắt, mục 2.1, phần hạn chế.
- **[S21]** Sanh, V., Webson, A., Raffel, C., Bach, S. H., và cộng sự (41 tác giả) (2021). [*Multitask Prompted Training Enables Zero-Shot Task Generalization*](https://arxiv.org/abs/2110.08207). arXiv:2110.08207; trang PDF ghi "Published as a conference paper at ICLR 2022". Mô hình tên T0. Đã đọc tóm tắt và mục 2-3.
- **[O22]** Ouyang, L., Wu, J., Jiang, X., và cộng sự (2022). [*Training language models to follow instructions with human feedback*](https://arxiv.org/abs/2203.02155). arXiv:2203.02155 (nộp 3/2022). Trang arXiv không nêu hội nghị. Chỉ dùng phần SFT; phần RM và PPO thuộc bài `llm/rlhf`.
- **[TRL]** Tài liệu Hugging Face TRL, trang [*SFT Trainer*](https://huggingface.co/docs/trl/sft_trainer) (bản `trl` 1.16.0, đọc ngày 24/10/2026). Tài liệu mở, dùng để mô tả API; không chép code.
- **[CT]** Tài liệu Hugging Face Transformers, trang [*Chat templates*](https://huggingface.co/docs/transformers/chat_templating) (bản 5.20.2, đọc ngày 24/10/2026).

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Hội nghị của [B20], [W21], [O22] | Trang arXiv không nêu. Thường được dẫn là NeurIPS 2020, ICLR 2022, NeurIPS 2022; **chưa xác minh** trong lần tra này. | Ghi "arXiv:..., năm"; chỉ ghi hội nghị nếu có người xác minh. Riêng [S21] đã xác minh: ICLR 2022. |
| Bài về sinh code (Codex, Chen và cộng sự 2021) | Chưa tra, chưa đọc. | Bài không nêu số liệu hay tên mô hình sinh code; chỉ dùng "sinh code" như một kiểu cặp (mô tả, đáp án) trong định dạng dữ liệu. Muốn dẫn thì tra trước. |
| Bài toán "truy hồi" trong định dạng text-to-text | Không có paper đọc được cho cách đưa truy hồi vào SFT. | Mục "Định dạng dữ liệu" ghi rõ đây là **cách minh họa của bài**, không phải kết quả của paper. Truy hồi theo nghĩa embedding và RAG thuộc `llm/rag-chatbot`. |
| Số trong bảng so sánh T0 với GPT-3 | [S21] có bảng so sánh với GPT-3 ở một số tập; chưa đọc số. | Chỉ nêu câu từ tóm tắt ("vượt mô hình lớn gấp tới 16 lần"), không nêu số cụ thể. |
| Tên mô hình hay phiên bản "mới nhất" của họ GPT sau 2022 | Chưa tra. Quy tắc `llm-lessons.md` 2.6 cấm viết "mới nhất". | Bài dừng ở GPT-3 và InstructGPT như các sự kiện có năm. |
| Số tham số của GPT-1 | [R18] mô tả 12 lớp, 768 chiều, 12 đầu attention; **không** đọc được số tham số tổng. | Không ghi số tham số GPT-1. (Con số 117M của [R19] là cho mô hình cùng cấu hình nhỏ nhất của GPT-2, xem dưới.) |
| Mã hóa token cho `<|im_start|>` | Dạng ChatML chỉ thấy trong ví dụ của [CT] và [TRL]; không xác minh nguồn gốc. | Gọi là "một kiểu chat template" kèm ví dụ trong tài liệu HF; không gán cho công ty nào. |

## Ý chính

### GPT-1, GPT-2, GPT-3: từ fine-tune sang không cần fine-tune

- **GPT-1 [R18]: hai giai đoạn.** (1) Pre-train không giám sát một Transformer decoder-only bằng mục tiêu dự đoán token kế tiếp trên BooksCorpus. (2) Fine-tune có giám sát trên từng tác vụ, thêm một lớp tuyến tính + softmax. Cấu hình: 12 lớp, 768 chiều, 12 đầu attention, ngữ cảnh 512 token, BPE 40 000 phép gộp. Báo cáo cải thiện mức tốt nhất trên 9 trong 12 tập đã thử.
- **Fine-tune của GPT-1 có thêm mục tiêu phụ.** Khi fine-tune, [R18] cộng thêm mất mát mô hình ngôn ngữ vào mất mát phân loại, với trọng số $\lambda$. Họ nói nó giúp tổng quát hóa và hội tụ nhanh hơn, và có ích hơn ở tập lớn (thử nghiệm bỏ mục tiêu phụ).
- **Biến đổi đầu vào kiểu "duyệt tuần tự" (traversal-style) [R18].** Thay vì thiết kế kiến trúc riêng cho mỗi tác vụ, mọi đầu vào có cấu trúc được xếp thành **một chuỗi token** với token bắt đầu, kết thúc và dấu phân cách (`$`). Ví dụ suy diễn ngôn ngữ: nối tiền đề, dấu phân cách, giả thuyết. Đây là tiền thân trực tiếp của ý "đưa mọi tác vụ về một chuỗi văn bản" của FLAN, T0 và chat template.
- **GPT-2 [R19]: bỏ bước fine-tune.** Huấn luyện mô hình ngôn ngữ lớn hơn trên **WebText** (khoảng 8 triệu tài liệu, 40 GB văn bản, lấy từ các đường link ngoài trên Reddit có ít nhất 3 "karma", đã bỏ trang Wikipedia). Có bốn cỡ: 117M, 345M, 762M, 1542M tham số (12, 24, 36, 48 lớp). Từ vựng BPE mức byte 50 257 (đã nêu ở `build-first-llm`).
- **Ý trung tâm của [R19]: điều kiện hóa theo tác vụ.** Một hệ thống tổng quát nên mô hình hóa $p(\text{đầu ra}\mid\text{đầu vào},\text{tác vụ})$, không chỉ $p(\text{đầu ra}\mid\text{đầu vào})$. Vì tác vụ, đầu vào và đầu ra đều là văn bản, có thể **ghi tác vụ ngay trong ngữ cảnh** và để mô hình ngôn ngữ tiếp tục. Họ đo ở chế độ zero-shot (không cập nhật tham số), 7 trên 8 tập mô hình ngôn ngữ đạt kết quả tốt nhất lúc đó.
- **GPT-2 khi nhắc tác vụ bằng văn bản [R19].** Tóm tắt: thêm `TL;DR:` sau bài báo rồi sinh (top-$k$ với $k=2$, lấy 3 câu đầu); bỏ gợi ý này thì điểm tụt 6,4 điểm. Dịch: ngữ cảnh là các cặp "câu tiếng Anh = câu tiếng Pháp" rồi "câu tiếng Anh =": 5 BLEU (Anh sang Pháp), 11,5 BLEU (Pháp sang Anh). QA: ngữ cảnh là vài cặp hỏi đáp, trả lời đúng 4,1% câu của Natural Questions. Đọc hiểu CoQA: 55 F1 (không dùng 127 000 mẫu huấn luyện của tập đó).
- **Điểm yếu GPT-2, chính tác giả nêu [R19]:** tóm tắt chỉ "vừa nhỉnh hơn" việc chọn ngẫu nhiên 3 câu theo ROUGE; hay lẫn chi tiết; dịch yếu; QA thấp. Họ viết rằng hiệu năng zero-shot "còn xa" mức dùng được thực tế. Dùng làm câu chuyển: **chỉ nhắc bằng lời chưa đủ**, nên mới có instruction tuning.
- **GPT-3 [B20]: tăng cỡ và đưa ví dụ vào ngữ cảnh.** 175 tỷ tham số (tám cỡ, từ 125 triệu), ngữ cảnh 2048 token. Ba thiết lập đánh giá, **không cập nhật tham số ở cả ba thiết lập**: **few-shot** (vài ví dụ trong ngữ cảnh, thường 10-100 tùy ngữ cảnh chứa được), **one-shot** (một ví dụ), **zero-shot** (chỉ có lời mô tả tác vụ). So với **fine-tuning** (cập nhật tham số, cần hàng nghìn đến hàng trăm nghìn ví dụ có nhãn cho mỗi tác vụ).
- **"In-context learning" ở [B20] là tên cho việc học từ ví dụ trong ngữ cảnh, không có bước gradient.** Chú thích trong paper nói thuật ngữ "zero-shot transfer" gây nhầm vì thực ra có ví dụ lúc suy luận, nên họ dùng "in-context learning". Paper cũng nói **không fine-tune GPT-3** và coi đó là hướng tương lai. Kết quả mạnh ở dịch, QA, cloze và một số việc "thích nghi tại chỗ" (xáo chữ, cộng ba chữ số); vẫn yếu ở một số tập.

### Instruction tuning / SFT đa nhiệm

- **FLAN [W21]: fine-tune trên nhiều tác vụ được diễn đạt bằng lời hướng dẫn.** Mô hình nền 137B (LaMDA-PT, decoder-only, thuần "dense"), tinh chỉnh trên hơn 60 tập NLP (62 tập, 12 cụm tác vụ), mỗi tập có **10 mẫu lời hướng dẫn** viết tay (có tới 3 mẫu "đảo chiều" tác vụ, ví dụ yêu cầu viết bài đánh giá phim thay vì phân loại cảm xúc). Kết quả: ở tác vụ chưa thấy, FLAN zero-shot vượt GPT-3 175B zero-shot trên 20 trong 25 tập.
- **Cách đo "chưa thấy" của FLAN rất chặt.** Chia tập dữ liệu thành cụm theo loại tác vụ, **bỏ nguyên cả cụm** khỏi huấn luyện rồi mới đánh giá trên cụm đó (ví dụ bỏ mọi tập suy diễn ngôn ngữ khi đo NLI). Nên mỗi lần đo phải huấn luyện một mô hình riêng.
- **Giới hạn của FLAN [W21]:** (a) không cải thiện nhiều tác vụ kiểu "hoàn thành câu" (suy luận thường thức, coreference: chỉ hơn mô hình nền ở 3 trong 7 tập); (b) với mô hình **nhỏ** (khoảng 8B trở xuống), instruction tuning còn **làm hại** tác vụ chưa thấy, vì dung lượng mô hình bị tác vụ huấn luyện chiếm hết (giả thuyết của tác giả, không phải kết luận chắc chắn); (c) tác giả nêu số tập, cỡ mô hình và việc có dùng lời hướng dẫn đều quan trọng.
- **T0 [S21]: cùng ý, khác thiết kế.** Mô hình encoder-decoder T5 11B (bản "LM-adapted" của Lester và cộng sự 2021), huấn luyện trên hỗn hợp tập có giám sát đã chuyển sang dạng "prompted" bằng nhiều mẫu prompt cho mỗi tập, đo zero-shot trên tác vụ chưa thấy. Tóm tắt nêu mô hình thường vượt mô hình lớn gấp tới 16 lần trên các tập chuẩn và gấp tới 6 lần trên một phần BIG-bench. Công cụ mẫu prompt là kho **P3** (Public Pool of Prompts), công khai.
- **Điểm chung của FLAN và T0:** nhiều tác vụ + nhiều cách diễn đạt cho mỗi tác vụ, mọi thứ là **cặp văn bản vào, văn bản ra**. Khác nhau ở kiến trúc (decoder-only và encoder-decoder), kích cỡ, nguồn tập dữ liệu. Chỉ nêu những điểm này; không so số giữa hai paper (cách đo khác nhau).
- **SFT trong InstructGPT [O22]:** bước 1 là fine-tune GPT-3 có giám sát trên **lời trình diễn của người gán nhãn** (demonstrations), khoảng 13 nghìn prompt (từ API và do người gán nhãn viết). Huấn luyện **16 epoch** với cosine decay và residual dropout 0,2. Họ ghi nhận loss kiểm tra **tăng sau 1 epoch** (overfit) nhưng huấn luyện thêm vẫn cải thiện điểm của mô hình phần thưởng và đánh giá ưa thích của người, nên chọn mô hình theo điểm RM trên tập kiểm tra, không theo loss. Gắn với `ml/overfitting-underfitting`, nhưng không nên kết luận "overfit không sao"; đó là quan sát của paper trong thiết lập của họ.
- **Thành phần prompt của InstructGPT [O22, Bảng 1, prompt API]:** sinh nội dung (Generation) 45,6%, QA mở (Open QA) 12,4%, brainstorming 11,2%, chat 8,4%, viết lại (Rewrite) 6,6%, tóm tắt (Summarization) 4,2%, phân loại (Classification) 3,5%, khác (Other) 3,5%, QA đóng (Closed QA) 2,6%, trích xuất (Extract) 1,9%. Ý nên dùng: **phần lớn là tác vụ sinh, không phải phân loại hay QA**. Nhắc phần RM và PPO là của `llm/rlhf`.
- **Cùng một công thức SFT, khác nhau ở dữ liệu.** SFT chỉ là cực tiểu hóa NLL của chuỗi đáp án, **có điều kiện** theo phần đầu vào [TRL]. Khác biệt giữa "fine-tune một tác vụ" (GPT-1) và "SFT đa nhiệm" (FLAN, T0, InstructGPT) là **trộn nhiều tác vụ và nhiều cách diễn đạt** vào cùng một lần huấn luyện.

### Định dạng dữ liệu và chat template

- **Mọi tác vụ thành cặp (đầu vào, đầu ra) dạng văn bản.** Năm tác vụ của giáo án, cách minh họa **của bài** (không phải kết quả của paper, trừ chỗ có thẻ):
  - QA: đầu vào là ngữ cảnh + câu hỏi, đầu ra là câu trả lời ngắn (QA mở nằm trong thành phần prompt của [O22]; QA kiểu mẫu của [R19] dùng vài cặp hỏi đáp trong ngữ cảnh).
  - Tóm tắt: bài báo vào, bản tóm tắt ra ([R19] dùng `TL;DR:`; [W21], [S21] có tập tóm tắt trong hỗn hợp huấn luyện, chưa kiểm cụ thể từng tập).
  - Dịch: câu nguồn vào, câu đích ra ([R19] dùng cặp "A = B"; [B20] đo dịch ở ba thiết lập).
  - Sinh code: mô tả hoặc chữ ký hàm vào, thân hàm ra (không nguồn, xem "Chưa xác minh").
  - Truy hồi: ví dụ "truy vấn và đoạn văn vào, nhãn 'liên quan' hoặc 'không' ra" (không nguồn, cách minh họa của bài).
- **Cặp prompt-completion và dạng hội thoại [TRL].** Bốn dạng bộ dữ liệu: `{"text"}`; `{"messages":[...]}`; `{"prompt","completion"}` dạng chuỗi; và `prompt`, `completion` là danh sách thông điệp (hội thoại). Với dạng hội thoại, `SFTTrainer` tự áp chat template.
- **Chat template [CT].** Mô hình ngôn ngữ chỉ tiếp tục một dãy token; hội thoại là danh sách `{"role","content"}` (vai: `system`, `user`, `assistant`) được chuyển thành dãy token có **token điều khiển**. Mỗi mô hình có template riêng: cùng một mô hình nền mà hai bản tinh chỉnh dùng định dạng khác nhau (ví dụ `[INST] ... [/INST]` so với `<|user|>` và `<|assistant|>`), dùng sai token thì chất lượng "tệ đi rõ rệt" (cách [CT] diễn đạt). `apply_chat_template(..., tokenize=..., add_generation_prompt=...)`.
- **`add_generation_prompt`: khi suy luận thì thêm, khi huấn luyện thì không [CT].** Khi sinh, thêm token mở lượt của assistant để mô hình trả lời thay vì "viết tiếp lời người dùng". Khi huấn luyện đặt `add_generation_prompt=False`.
- **Đừng thêm token đặc biệt hai lần [CT].** Template đã chứa `<bos>`/`<eos>` cần thiết; nếu `tokenize=False` rồi tự tách token sau đó thì đặt `add_special_tokens=False`, nếu không sẽ trùng lặp.
- **EOS phải khớp với template [TRL].** Ví dụ trong tài liệu: một số mô hình nền (họ Qwen) cần đặt `eos_token` trùng token kết thúc lượt của template (với ví dụ họ nêu là `<|im_end|>`), nếu không câu trả lời không biết dừng.

### Chỉ tính loss trên phần trả lời

- **Vì sao mask prompt.** Mục tiêu là học $p(\text{đáp án}\mid\text{đầu vào})$. Nếu tính loss cả phần đầu vào, mô hình bị ép "học thuộc" câu hỏi và dung lượng bị tiêu cho việc đó. (Đây là lập luận của `summarizer`; [TRL] chỉ nêu cách làm và mặc định, không đưa lập luận. Nói rõ khi viết.)
- **Cách làm trong PyTorch/HF: nhãn $-100$.** Vị trí không tính loss gán nhãn $-100$, là giá trị `ignore_index` mặc định của `F.cross_entropy`; TRL cũng dùng $-100$ làm "ignore index" mặc định cho vị trí đệm [TRL]. Hai bước: (1) **dịch một vị trí**: logit tại vị trí $t$ dự đoán token $t+1$; (2) **mask** nhãn của prompt và của phần đệm.
- **TRL (bản 1.16.0) [TRL]:** `completion_only_loss` (mặc định `None`: với bộ dữ liệu prompt-completion thì chỉ tính trên phần completion, với bộ dữ liệu dạng `text` thì tính trên toàn chuỗi); `assistant_only_loss=True` (chỉ cho dữ liệu hội thoại, **yêu cầu** chat template có cặp từ khóa `{% generation %}` và `{% endgeneration %}`; với một số họ mô hình TRL tự vá template; mặc định `False`). Hai cờ dùng chung được.
- **Với dữ liệu nhiều lượt**, `assistant_only_loss` mask cả `system` và `user`, giữ mọi lượt `assistant` [TRL].
- **Câu cảnh báo kỹ thuật:** nếu mọi nhãn trong batch đều là $-100$ thì `F.cross_entropy` trả `nan` (đã chạy thật, bên dưới).

## Công thức quan trọng

Ký hiệu theo site: chuỗi đầu vào $\mathbf{x}$, chuỗi đáp án $\mathbf{y}=(y_1,\dots,y_L)$ (độ dài $L$, theo `build-first-llm`), tham số $\boldsymbol{\theta}$, hàm mất mát $\mathcal{L}$.

**Mục tiêu fine-tune của GPT-1** ([R18] pt. (5); $\mathcal{L}_2$ là log-likelihood của nhãn $y$ cho đầu vào $x_1,\dots,x_m$, $\mathcal{L}_1$ là log-likelihood của mô hình ngôn ngữ, $\lambda$ là trọng số; paper **cực đại hóa** nên là log-likelihood, không phải mất mát):

$$\mathcal{L}_3(\mathcal{C})=\mathcal{L}_2(\mathcal{C})+\lambda\,\mathcal{L}_1(\mathcal{C}),\qquad \mathcal{L}_2(\mathcal{C})=\sum_{(x,y)}\log P(y\mid x_1,\dots,x_m)$$

**Mô hình hóa theo tác vụ** ([R19] mục 2):

$$p(\text{đầu ra}\mid\text{đầu vào},\text{tác vụ})$$

**Mất mát SFT chỉ trên đáp án** (viết lại theo mô tả của [TRL]; với $\mathcal{A}$ là tập vị trí thuộc phần đáp án trong chuỗi đã ghép $\mathbf{x}\Vert\mathbf{y}$, mỗi vị trí dự đoán bằng các token đứng trước nó):

$$\mathcal{L}_{\text{SFT}}(\boldsymbol{\theta})=-\frac{1}{|\mathcal{A}|}\sum_{t\in\mathcal{A}}\log p_{\boldsymbol{\theta}}\big(s_t\mid s_{<t}\big)$$

Cần giải thích bằng lời: $s$ là chuỗi đã ghép; $|\mathcal{A}|$ chỉ đếm vị trí **không bị mask**, nên loss là trung bình trên token đáp án, không phải trên cả chuỗi và không phụ thuộc độ dài prompt. Lưu ý [TRL] viết **tổng** (không chia $|\mathcal{A}|$) trong mô tả, còn log của Trainer ghi "trung bình trên token không bị mask"; bài chọn dạng trung bình, nói rõ. Đếm mẫu số theo **token** hay theo **mẫu** khi gộp batch là chuyện của thư viện; không nói chi tiết.

**Dịch một vị trí:** logit tại vị trí $t$ ghép với nhãn tại vị trí $t+1$ (`logits[:, :-1]` với `labels[:, 1:]`). Quên bước này là lỗi kinh điển (xem "Điểm dễ hiểu nhầm").

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; chỗ có "(gợi ý)" là của `summarizer`.

- **Từ "thợ học việc từng nghề" đến "thợ biết nghe lời" (gợi ý):** GPT-1 như thuê một thợ đã biết đọc, rồi dạy riêng từng nghề (mỗi tác vụ một lần fine-tune). GPT-2 và GPT-3 như thuê người đọc rất nhiều, rồi chỉ **dặn bằng lời** hoặc **làm mẫu vài lần** (zero-shot, few-shot). FLAN, T0, InstructGPT như cho người thợ ấy **tập nghe lời dặn** qua hàng nghìn kiểu dặn khác nhau, để lần sau gặp lời dặn lạ vẫn hiểu.
- **Zero-shot, one-shot, few-shot của [B20] qua cùng một bài dịch (gợi ý, ghép từ ví dụ trong paper về dịch):** "Dịch sang tiếng Pháp: cheese =>" (zero-shot); thêm một dòng "sea otter => loutre de mer" (one-shot); thêm vài dòng nữa (few-shot). **Không có tham số nào đổi**; cái đổi duy nhất là văn bản đầu vào. Đối lập: fine-tune là đổi tham số.
- **Hai kiểu "học" cạnh nhau (gợi ý):** bảng bốn dòng GPT-1 / GPT-2 / GPT-3 / FLAN, T0, InstructGPT với các cột "cập nhật tham số?", "dữ liệu có nhãn", "cách báo tác vụ". Làm thành bảng trong mục Minh họa theo `llm-lessons.md` 2.7 (bài LLM không có VIZ vẫn giữ mục Minh họa với bảng).
- **Mặt nạ như tờ giấy che lời giải (gợi ý):** khi cho học sinh làm bài tập, **chỉ chấm phần học sinh viết**, không chấm lại đề bài in sẵn. Đề bài là phần bị che khi chấm (nhãn $-100$). Nối với "tờ che" của mặt nạ nhân quả ở `build-first-llm`, nhưng **khác bản chất**: mặt nạ nhân quả che *đầu vào của attention*, còn nhãn $-100$ che *đầu ra của loss*. Nhắc rõ để khỏi nhầm.
- **Một batch có ba tác vụ (gợi ý):** ba cặp (dịch, tóm tắt, sinh code) ghép chung một batch, đệm đến độ dài lớn nhất. Cho người đọc in từng dòng ra với cột "token, nhãn" để thấy nhãn $-100$ phủ toàn bộ phần prompt và phần đệm.
- **Loss tăng lại trong lúc chất lượng tốt lên (gợi ý, từ [O22]):** để cảnh báo "đừng chỉ nhìn loss kiểm tra": ở thiết lập của họ, loss kiểm tra tăng sau 1 epoch mà đánh giá của người vẫn tốt lên khi huấn luyện thêm. **Đừng khái quát** thành quy tắc.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Nhầm "zero-shot" của GPT-2 với "không có ví dụ nào".** [B20] cảnh báo "zero-shot transfer" hay bị dùng cho cả trường hợp có ví dụ trong ngữ cảnh. Bài nên tách: zero-shot = chỉ có lời mô tả; one-shot, few-shot = có ví dụ trong ngữ cảnh; **cả ba không cập nhật tham số**.
2. **Nhầm in-context learning với fine-tune.** In-context: tham số giữ nguyên, "học" mất ngay khi ngữ cảnh mới bắt đầu. Fine-tune: đổi tham số, bền.
3. **Nhầm instruction tuning với "dạy thêm kiến thức".** Các paper cho thấy nó cải thiện khả năng **làm theo yêu cầu bằng lời** trên tác vụ chưa thấy; [W21] lại cho thấy nó **không cải thiện** nhiều tác vụ dạng hoàn thành câu và **làm hại** mô hình nhỏ. Đừng hứa quá.
4. **Hiểu sai SFT với RLHF.** SFT chỉ bắt chước đáp án mẫu (cực tiểu NLL); RLHF thêm tín hiệu ưa thích của người. [O22] dùng SFT làm bước 1. Hẹn `llm/rlhf`.
5. **Quên dịch một vị trí.** Dùng `logits` và `labels` cùng chỉ số: mô hình học "chép lại token hiện tại", loss gần 0 một cách vô nghĩa, và sinh văn bản thì hỏng. Cần ví dụ kiểm tra: đảo hai token cuối của nhãn.
6. **Quên mask phần đệm (padding).** Phần đệm bị tính vào loss, kéo loss về một giá trị nhân tạo. Ở code thử của `summarizer`, phần đệm dùng EOS nên "full loss" cũng đếm các vị trí này.
7. **Mask luôn cả token kết thúc (EOS) của đáp án.** Nếu nhãn của EOS cũng là $-100$ thì mô hình không học cách **dừng**, câu trả lời kéo dài vô hạn. Nên **giữ** EOS trong phần nhãn. [TRL] cảnh báo EOS cần khớp với template.
8. **Dùng sai chat template.** Template của mô hình khác nhau; dùng template của mô hình này cho mô hình kia làm chất lượng tụt [CT]. Và **thêm token đặc biệt hai lần** là lỗi hay gặp khi `tokenize=False` rồi tách token riêng.
9. **`assistant_only_loss=True` nhưng template không có `{% generation %}`.** Không có từ khóa thì không xác định được phần assistant [TRL]; cần kiểm tra template (tài liệu cảnh báo, chưa chạy thật trong lần tra này).
10. **Batch toàn nhãn $-100$ cho loss `nan`.** Xảy ra khi cả batch chỉ có prompt dài bị cắt (ví dụ cắt theo `max_length` làm mất phần đáp án). Đã kiểm trong PyTorch: `F.cross_entropy` trả `nan`. Đó là một trong các lý do cần kiểm số token không bị mask.
11. **Trộn tác vụ không cân bằng.** Chưa có nguồn đọc kỹ cho việc trộn; chỉ nên nói chung "dữ liệu nhiều tác vụ phải có cả nhiều cách diễn đạt" (ý của [W21], [S21]); không khuyên tỉ lệ cụ thể.
12. **Dùng benchmark của paper làm xếp hạng "hiện tại".** Số trong [W21], [S21], [O22] gắn với thiết lập và năm của họ; quy tắc `llm-lessons.md` 2.6: ghi kèm paper và năm.

## Số tự chạy (Python, ngày 24/10/2026)

Chạy bằng `.venv-llm` (torch 2.14.1+cpu, Python 3.14.5, `python -I`), `torch.manual_seed(0)`. File thử nằm ở scratchpad (`masked_loss.py`, 42 dòng), **không** nằm trong repo.

Thử nghiệm: ba cặp (dịch, tóm tắt, sinh code) mã hóa bằng byte (từ vựng 256 byte và một EOS, $V=257$), ghép prompt, xuống dòng, đáp án và EOS, đệm bằng EOS; nhãn của prompt và phần đệm là $-100$; mô hình giả là `Embedding` + `Linear` với trọng số ngẫu nhiên (chưa huấn luyện); dịch một vị trí.

| Đại lượng | Giá trị |
|---|---|
| Token được tính loss (không phải $-100$) / tổng vị trí sau khi dịch một vị trí | 44 / 147 |
| Loss có mask | 5,767 |
| Loss không mask (tính cả prompt và đệm) | 5,787 |
| Đoán đều, $\ln V$ | 5,549 |

- Kiểm: `F.cross_entropy(..., ignore_index=-100)` **bằng** `F.cross_entropy` trên các phần tử đã lọc `labels != -100` (`torch.allclose` trả `True`). Khi mọi nhãn là $-100$ trả `nan`.
- **Số mẫu này chưa dạy được gì về hiệu quả của mask**: mô hình chưa huấn luyện nên hai loss gần như bằng nhau (cùng gần $\ln V$). Giá trị dạy học nằm ở **số token** (44/147) và **tính chất** `ignore_index`, không ở loss. Nếu muốn thấy khác biệt thật thì phải huấn luyện vài trăm bước và so; chưa chạy. Không nên đặt "kết quả mẫu" kiểu "loss giảm nhờ mask" nếu chưa chạy thật.
- Cỡ ba cặp ví dụ **không dấu** để chuỗi mã hóa đơn giản (mỗi ký tự có dấu là 2 đến 3 byte); nếu dùng tiếng Việt có dấu thì số token đổi, **phải chạy lại** rồi mới ghi số.

### Đề xuất code của bài

- Một ô `LocalCode` (≤ 60 dòng, mỗi dòng ≤ 79 ký tự): tính loss có mask trên batch nhỏ bằng PyTorch như trên, có thể in từng dòng "token, nhãn" của một mẫu. Không cần tải mô hình (không cần mạng); đã chạy được trên CPU trong chưa đến một giây.
- **Không** đưa `transformers`/`trl` vào code chạy: `SFTTrainer` cần tải mô hình (ví dụ Qwen 0.6B). Nếu bài nhắc, chỉ nhắc bằng khối code không chạy hoặc lời văn, kèm phiên bản: **`transformers` 5.20.2, `trl` 1.16.0** (bản mới nhất trên PyPI ngày 24/10/2026, lấy bằng `pip index versions`). Hai gói này **chưa** có trong venv `.venv-llm` và chưa trong `scripts/requirements-llm.txt`. Nếu phiên chính muốn có ô chạy thật với chat template, cần thêm `transformers` (và tải một tokenizer nhỏ qua mạng); báo phiên chính quyết.
- Dòng phiên bản của mục "Ví dụ code" theo `llm-lessons.md` 2.6 lấy từ bảng kiểm chứng ở cuối.

## Liên quan tới bài nào

- **Cần biết trước:** `llm/build-first-llm` (mô hình ngôn ngữ, cross-entropy, decoder-only, mặt nạ nhân quả; ký hiệu độ dài $L$).
- **Trước:** `ml/overfitting-underfitting` (loss huấn luyện và kiểm tra; quan sát của [O22]); `llm/text-api` (prompt, vai `system`/`user`/`assistant` ở API trò chuyện, là cùng khái niệm với chat template; few-shot prompt nằm ở `llm/prompt-engineering`).
- **Sau:** `llm/rlhf` (bước SFT là bước 1 của [O22]); `llm/evaluation-peft` (fine-tune hiệu quả: LoRA, đánh giá); `llm/dpo`.
- Hẹn ngoài bài: tokenization (`nlp/tokenization`), RAG và truy hồi (`llm/rag-chatbot`).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Tinh chỉnh có giám sát | Supervised fine-tuning (SFT) | Dịch, gloss lần đầu; sau đó dùng "SFT" |
| Tinh chỉnh theo hướng dẫn | Instruction tuning | Dịch, gloss lần đầu |
| Học trong ngữ cảnh | In-context learning | Dịch, gloss lần đầu |
| Few-shot, one-shot, zero-shot | Few-shot, one-shot, zero-shot | Giữ nguyên |
| Mẫu trò chuyện | Chat template | Dịch "mẫu trò chuyện (chat template)"; sau đó dùng "chat template" |
| Lời trình diễn | Demonstration | Dịch; nói rõ là đáp án mẫu do người viết |
| Chỉ số bỏ qua | Ignore index (`-100`) | Giữ `ignore_index`, giải thích bằng lời |
| Đệm | Padding | Dịch |
| Token kết thúc | End-of-sequence (EOS) token | Giữ "EOS" |

## Đọc thêm đề xuất

1. **Radford và cộng sự (2018)**, GPT-1: [PDF](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf). Đọc mục 3.
2. **Radford và cộng sự (2019)**, GPT-2: [PDF](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf). Đọc mục 2 và 3.5-3.8.
3. **Brown và cộng sự (2020)**, GPT-3: [arXiv:2005.14165](https://arxiv.org/abs/2005.14165). Đọc mục 2 (ba thiết lập).
4. **Wei và cộng sự (2021)**, FLAN: [arXiv:2109.01652](https://arxiv.org/abs/2109.01652).
5. **Sanh và cộng sự (2021)**, T0: [arXiv:2110.08207](https://arxiv.org/abs/2110.08207) (ICLR 2022).
6. **Ouyang và cộng sự (2022)**, InstructGPT: [arXiv:2203.02155](https://arxiv.org/abs/2203.02155). Phần SFT; phần còn lại cho bài `rlhf`.
7. Tài liệu Hugging Face: [Chat templates](https://huggingface.co/docs/transformers/chat_templating) (Transformers 5.20.2) và [SFT Trainer](https://huggingface.co/docs/trl/sft_trainer) (TRL 1.16.0). Link tới đúng phiên bản khi trang có phiên bản (`llm-lessons.md` 2.7).

## Kiểm chứng code

Code của bài do `lesson-writer` chạy ngày 24/10/2026, thư mục làm việc ở scratchpad. Dòng cuối là thử nghiệm của summarizer ở scratchpad, không phải code trong bài.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `label-mask.vi.py`, `label-mask.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`), Python 3.14.2, NumPy 2.4.6 | Ô `PythonRunner`. Cả hai bản do writer chạy, rồi content-reviewer chạy lại thật trên Pyodide thật, cùng kết quả. Chạy xong khoảng 3 giây (kể cả tải NumPy). Bản vi: chuỗi khi sinh kết thúc bằng `<\|assistant\|>`; `scored: 4 / 17`, khớp lời văn. Bản en: `scored: 4 / 16` (câu tiếng Anh khác số từ). `ast.parse(..., feature_version=(3, 10))` qua |
| `masked-loss.vi.py`, `masked-loss.en.py` | chạy thật | 2026-10-24 | `.venv-llm`, Python 3.14.5, torch 2.14.1+cpu, `torch.manual_seed(0)` | Cả hai bản do writer chạy, rồi content-reviewer chạy lại thật bằng torch, output trùng từng byte. Chạy dưới 3 giây trên CPU, hai lần cùng output (tất định, `sampleVaries={false}`). Bản vi: `shape: (3, 103)`, `counted per row: [14, 34, 28]`, `counted: 76 / 306`, loss 5.7787 bằng lọc tay, $\ln V$ 5.5491, che theo id đệm còn 73, toàn $-100$ cho `nan`; kết quả mẫu trong bài chép từ lần này. Bản en (chuỗi tiếng Anh): `(3, 98)`, `[9, 31, 28]`, `68 / 291`, loss 5.8213, 65. `ast.parse(..., feature_version=(3, 10))` qua; 50 dòng, mọi dòng ≤ 79 ký tự |
| (thử nghiệm) `masked_loss.py`, loss có mask trên batch 3 cặp | chạy thật | 2026-10-24 | `.venv-llm`, Python 3.14.5, torch 2.14.1+cpu, `torch.manual_seed(0)` | Chạy tức thì. 44/147 token được tính loss; loss có mask 5,767, không mask 5,787, đoán đều 5,549 (mô hình chưa huấn luyện). `ignore_index=-100` khớp với lọc tay; batch toàn $-100$ cho `nan` |
