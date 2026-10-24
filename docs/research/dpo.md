# DPO (Direct Preference Optimization)

Bài: `llm/dpo` (chỉ bản vi, khoảng 11 phút đọc). Cần biết trước: `llm/rlhf`. Hình tĩnh: dùng lại `RlhfStagesFigure` để so sánh (`llm-lessons.md` 2.9); không có VIZ. Giáo án buổi 16: "Priority training techniques - DPO".

Ngày tra: **24/10/2026**. Cách tra: tải PDF của Rafailov 2023, Azar 2023, Ethayarajh 2024, Hong 2024, trích chữ bằng `pdftotext`; đọc kỹ mục 4, 5.1, 5.2, 6.1-6.2, 7, phụ lục A.1, A.2, A.4, B của Rafailov; đọc mục 1, 5 của Azar; đọc tóm tắt và mục 1 của Ethayarajh, tóm tắt và mục 4 của Hong (chưa đọc hết). WebFetch trang arXiv và tài liệu TRL. Chạy thật Python bằng Pyodide. Ý không có thẻ nguồn là kiến thức chung hoặc suy ra từ công thức.

## Nguồn

- **[R23]** Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., Finn, C. (2023). [*Direct Preference Optimization: Your Language Model is Secretly a Reward Model*](https://arxiv.org/abs/2305.18290) (PDF: [arxiv.org/pdf/2305.18290](https://arxiv.org/pdf/2305.18290)). arXiv:2305.18290 (v1 29/5/2023, v3 29/7/2024). Trang arXiv không nêu hội nghị.
- **[A23]** Azar, M. G., Rowland, M., Piot, B., Guo, D., Calandriello, D., Valko, M., Munos, R. (2023). [*A General Theoretical Paradigm to Understand Learning from Human Preferences*](https://arxiv.org/abs/2310.12036) (giới thiệu IPO). arXiv:2310.12036 (v1 18/10/2023, v2 22/11/2023). PDF ghi "Under review"; trang arXiv không nêu hội nghị.
- **[E24]** Ethayarajh, K., Xu, W., Muennighoff, N., Jurafsky, D., Kiela, D. (2024). [*KTO: Model Alignment as Prospect Theoretic Optimization*](https://arxiv.org/abs/2402.01306). ICML 2024 (PMLR 235; PDF và trang arXiv đều ghi). arXiv:2402.01306 (v1 2/2/2024, v5 8/9/2026).
- **[H24]** Hong, J., Lee, N., Thorne, J. (2024). [*ORPO: Monolithic Preference Optimization without Reference Model*](https://arxiv.org/abs/2403.07691). arXiv:2403.07691 (v1 12/3/2024, v2 14/3/2024). Trang arXiv ghi "Preprint", không nêu hội nghị.
- **[RLHF]** Các nguồn của bài trước, xem `docs/research/rlhf.md`: Ouyang 2022 ([arXiv:2203.02155](https://arxiv.org/abs/2203.02155)), Stiennon 2020 ([arXiv:2009.01325](https://arxiv.org/abs/2009.01325)), Gao 2022 ([arXiv:2210.10760](https://arxiv.org/abs/2210.10760)), mô hình Bradley–Terry (1952).
- **[TRL]** Tài liệu Hugging Face TRL, trang [*DPO Trainer*](https://huggingface.co/docs/trl/dpo_trainer) (bản `trl` 1.16.0, đọc 24/10/2026). Chỉ dùng để nêu tên và API; không chép code.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Hội nghị của [R23], [A23], [H24] | Trang arXiv không nêu. Kiến thức nền cho rằng R23 ở NeurIPS 2023, A23 ở AISTATS 2024, H24 ở EMNLP 2024, nhưng **chưa xác minh được trong lần tra này**. | Ghi "arXiv:..., năm". Không ghi hội nghị. Chỉ [E24] ghi ICML 2024 |
| Toàn văn Bradley–Terry (1952) | Không truy cập được (đã ghi ở `rlhf.md`). | Như bài RLHF: nói "mô hình so sánh cặp" và dẫn qua [R23] |
| Con số tuyệt đối của [R23] (win rate 61% so với PPO 57% ở TL;DR; 58% người chuộng DPO so với PPO) | Đã đọc đúng trong PDF, nhưng do GPT-4 hoặc nhóm tình nguyện viên nhỏ chấm, mô hình tối đa 6B. | Nếu nêu thì ghi "trong thiết lập của họ, mô hình cỡ nhỏ, 2023". Không viết "DPO tốt hơn PPO" như chân lý |
| Mục 3-5 của [H24] (công thức ORPO), mục 3-4 của [E24] (công thức KTO) | Chỉ đọc tóm tắt, phần giới thiệu và vài đoạn. Chưa tự dẫn lại công thức. | Chỉ nhắc ý một câu mỗi phương pháp, không đưa công thức |
| `DPOTrainer` ở `trl` 1.16.0 chạy được thật | Chỉ đọc tài liệu; chưa cài `trl`, chưa chạy. | Chỉ nhắc tên và phiên bản, không đưa code chạy |
| "DPO được dùng ở mô hình nào hiện nay" | Chưa tra. Quy tắc `llm-lessons.md` 2.6 cấm "mới nhất". | Bài dừng ở sự kiện có năm trong các paper trên |
| Mọi kết luận "DPO ổn định hơn PPO" | [R23] mục 5.2 là lập luận lý thuyết về phương sai, không phải phép đo trực tiếp; mục 6 chỉ có kết quả thực nghiệm cỡ nhỏ. | Viết là "lập luận của tác giả" |

## Ý chính

- **Vấn đề.** RLHF ([RLHF], bài trước) cần reward model riêng, rồi chạy RL (PPO) với lấy mẫu từ chính sách trong lúc huấn luyện. [R23] mô tả quy trình này là phức tạp và hay không ổn định. Ý của họ: có thể bỏ cả hai thứ đó mà vẫn tối ưu **đúng cùng mục tiêu** (RL có phạt KL).
- **Ba bước dẫn xuất [R23] mục 4, phụ lục A.** (1) Với một reward $r$ bất kỳ, nghiệm tối ưu của mục tiêu RL có phạt KL có dạng đóng $\pi^*(\mathbf{y}\mid\mathbf{x})=\frac{1}{Z(\mathbf{x})}\pi_{\text{ref}}(\mathbf{y}\mid\mathbf{x})\,e^{r(\mathbf{x},\mathbf{y})/\beta}$, $Z$ là hằng số chuẩn hóa chỉ phụ thuộc $\mathbf{x}$. (2) Lấy log hai vế để **đảo** thành reward theo chính sách: $r=\beta\log\frac{\pi^*}{\pi_{\text{ref}}}+\beta\log Z$. (3) Bradley–Terry chỉ phụ thuộc **hiệu** hai reward cùng prompt, nên $\beta\log Z(\mathbf{x})$ triệt tiêu. Còn lại xác suất ưa thích chỉ gồm $\pi^*$ và $\pi_{\text{ref}}$, không còn reward, không còn $Z$.
- **Đổi biến, không xấp xỉ thêm.** Thay $\pi^*$ bằng chính sách đang học $\pi_{\boldsymbol{\theta}}$ rồi cực đại log-likelihood của dữ liệu ưa thích. Kết quả là hồi quy logistic trên "lề" giữa hai log tỉ số. Đây là cùng dạng với loss reward model của RLHF, chỉ khác "điểm" nay là $\beta\log(\pi_{\boldsymbol{\theta}}/\pi_{\text{ref}})$ ([R23] mục 4).
- **Reward ẩn.** [R23] gọi $\hat r(\mathbf{x},\mathbf{y})=\beta\log\frac{\pi_{\boldsymbol{\theta}}(\mathbf{y}\mid\mathbf{x})}{\pi_{\text{ref}}(\mathbf{y}\mid\mathbf{x})}$ là reward ẩn (implicit reward). Mô hình ngôn ngữ vừa là chính sách vừa là reward model: "Your Language Model is Secretly a Reward Model" (tiêu đề của chính paper).
- **Không mất tính tổng quát [R23] mục 5.1.** Hai reward chỉ khác nhau một hàm của $\mathbf{x}$ cho cùng phân phối ưa thích và cùng chính sách tối ưu (hai bổ đề của họ). Định lý 1: mọi lớp reward phù hợp Bradley–Terry đều biểu diễn được dưới dạng $\beta\log(\pi/\pi_{\text{ref}})$ nên cách đặt tham số này không làm hẹp lớp reward. Chỉ nêu ý, không chứng minh.
- **Cách DPO học (gradient) [R23] mục 4.** Tăng log-prob của câu thắng $\mathbf{y}_w$, giảm log-prob của câu thua $\mathbf{y}_l$. Mỗi cặp được nhân một **trọng số**: cặp mà reward ẩn đang xếp **sai** (câu thua đang được chấm cao hơn) thì trọng số lớn. Họ nói bản bỏ trọng số này có thể làm mô hình suy biến (phụ lục, bảng 3; chưa đọc bảng).
- **Quy trình [R23] mục 4.** (1) Dữ liệu ưa thích có sẵn (hoặc lấy mẫu hai đáp án từ $\pi_{\text{ref}}$ rồi người chọn). (2) Tối ưu loss DPO theo kiểu offline, không lấy mẫu trong lúc huấn luyện. $\pi_{\text{ref}}$ lấy là mô hình SFT. Nếu không có SFT thì họ tinh chỉnh trên các đáp án được chọn rồi dùng làm tham chiếu.
- **Vai trò $\beta$ [R23].** $\beta$ là hệ số của phạt KL. $\beta$ lớn: chính sách bị giữ gần $\pi_{\text{ref}}$. $\beta$ nhỏ: được phép lệch xa. Họ dùng $\beta=0{,}1$ mặc định, riêng tóm tắt TL;DR dùng $0{,}5$ (phụ lục B). [TRL] cũng đặt mặc định 0,1 và ghi "$\beta$ cao hơn là ít lệch hơn so với mô hình tham chiếu".
- **So với RLHF [R23].** Không reward model riêng, không vòng RL, không lấy mẫu từ LM trong lúc huấn luyện, chỉ một siêu tham số chính. Trong thiết lập của họ (mô hình đến 6B, 2023): ở thí nghiệm cảm xúc IMDb, DPO cho đường biên reward-KL tốt nhất, kể cả khi PPO được cho reward đúng; ở tóm tắt TL;DR, win rate khoảng 61% so với 57% của PPO (GPT-4 chấm); DPO ít nhạy hơn PPO với nhiệt độ lấy mẫu. Cần nói kèm: phạm vi nhỏ, GPT-4 là người chấm, chính họ ghi chưa biết DPO mở rộng đến mô hình rất lớn ra sao.
- **Giới hạn do chính tác giả nêu [R23] mục 7.** Chưa rõ DPO khái quát ngoài phân phối thế nào so với reward model rõ ràng; chưa rõ **reward over-optimization** biểu hiện ra sao ở DPO (họ nêu đường win rate giảm nhẹ ở hình 3 phải là có thể một ví dụ nhưng không khẳng định); thử nghiệm đến 6B; kết quả GPT-4 phụ thuộc prompt chấm.
- **IPO [A23].** Lý thuyết tổng quát "PO" gồm cả RLHF và DPO như trường hợp riêng. Họ chỉ ra DPO có thể **overfit** dữ liệu ưa thích: nếu một đáp án luôn thắng thì DPO đẩy xác suất nó về 1 **bất kể $\beta$** (ví dụ thật nhỏ của họ). IPO thay hàm logit bằng hàm đồng nhất, nên loss thành hồi quy bình phương: kéo "lề log tỉ số" về một số hữu hạn phụ thuộc hệ số điều chuẩn, không phải tới vô cực. Kết quả IPO của họ chủ yếu là ví dụ minh họa nhỏ. Đây là điều người viết đọc ra; không nói IPO "tốt hơn".
- **KTO [E24].** Không cần dữ liệu cặp. Mỗi mẫu chỉ cần nhãn nhị phân "đáp án này tốt / xấu". Lấy cảm hứng từ lý thuyết triển vọng của Kahneman và Tversky (người nhạy với mất mát hơn lợi ích). Họ gọi nhóm loss như DPO là "human-aware losses" (HALO). Họ báo cáo kết quả bằng hoặc hơn các phương pháp dựa trên cặp ở cỡ 1B đến 30B, và nêu rằng không có một HALO nào tốt nhất cho mọi tình huống.
- **ORPO [H24].** Gộp SFT và căn chỉnh thành **một giai đoạn, không cần mô hình tham chiếu**: loss SFT cộng một số hạng phạt dựa trên **odds ratio** giữa câu thắng và câu thua (một phạt nhẹ cho kiểu đáp án bị loại). Họ báo cáo kết quả trên Phi-2, Llama-2 và Mistral đến 7B.

## Công thức quan trọng

Ký hiệu theo `rlhf.md`: prompt $\mathbf{x}$, đáp án $\mathbf{y}$, câu được chọn $\mathbf{y}_w$ và bị loại $\mathbf{y}_l$, chính sách $\pi_{\boldsymbol{\theta}}$ (ghi chú này viết theo paper; **bài DPO đã chọn $\pi_{\boldsymbol{\phi}}$** cho chính sách để khớp bài RLHF, nơi $\boldsymbol{\theta}$ là tham số của RM, và có một câu chú thích ký hiệu của paper), tham chiếu $\pi_{\text{ref}}$, phạt KL $\beta$, sigmoid $\sigma$, mất mát $\mathcal{L}$. Tốc độ học vẫn là $\eta$. Log-prob của cả câu là tổng log-prob các token; nên nói rõ trong bài.

**1. Mục tiêu RL có phạt KL** (như bài RLHF; [R23] pt. 3, [S20]):

$$\max_{\pi}\ \mathbb{E}_{\mathbf{x},\ \mathbf{y}\sim\pi(\cdot\mid\mathbf{x})}\big[r(\mathbf{x},\mathbf{y})\big]-\beta\,D_{\text{KL}}\big(\pi(\cdot\mid\mathbf{x})\,\|\,\pi_{\text{ref}}(\cdot\mid\mathbf{x})\big)$$

**2. Nghiệm tối ưu** ([R23] pt. 4, phụ lục A.1; $Z$ là tổng trên mọi đáp án):

$$\pi^*(\mathbf{y}\mid\mathbf{x})=\frac{1}{Z(\mathbf{x})}\,\pi_{\text{ref}}(\mathbf{y}\mid\mathbf{x})\,e^{r(\mathbf{x},\mathbf{y})/\beta},\qquad Z(\mathbf{x})=\sum_{\mathbf{y}}\pi_{\text{ref}}(\mathbf{y}\mid\mathbf{x})\,e^{r(\mathbf{x},\mathbf{y})/\beta}$$

Cách [R23] chứng minh (A.1), diễn đạt lại để giải thích bằng lời: chuyển $\max$ thành $\min$ rồi chia cho $\beta$. Biểu thức trong kỳ vọng là $\log\frac{\pi}{\pi_{\text{ref}}}-\frac{r}{\beta}$. Gộp $-\frac{r}{\beta}$ vào mẫu số bằng cách viết $\log\frac{\pi}{\pi_{\text{ref}}e^{r/\beta}}$. Nhân và chia cho $Z$ để mẫu số thành một **phân phối hợp lệ** $\pi^*$, ta được $\log\frac{\pi}{\pi^*}-\log Z$. Kỳ vọng của $\log\frac{\pi}{\pi^*}$ chính là KL giữa $\pi$ và $\pi^*$; $\log Z$ không phụ thuộc $\pi$. KL nhỏ nhất bằng 0 khi hai phân phối trùng nhau (bất đẳng thức Gibbs), nên $\pi=\pi^*$. Chứng minh này là điểm "mỗi bước có lời" cho bài.

**3. Đảo ra reward** ([R23] pt. 5): lấy log hai vế của (2) rồi chuyển vế:

$$r(\mathbf{x},\mathbf{y})=\beta\log\frac{\pi^*(\mathbf{y}\mid\mathbf{x})}{\pi_{\text{ref}}(\mathbf{y}\mid\mathbf{x})}+\beta\log Z(\mathbf{x})$$

$Z$ khó tính vì phải cộng trên mọi đáp án có thể, nên cần có cách tránh nó.

**4. Thay vào Bradley–Terry** ([R23] pt. 6, phụ lục A.2): $P(\mathbf{y}_1\succ\mathbf{y}_2\mid\mathbf{x})=\sigma\big(r(\mathbf{x},\mathbf{y}_1)-r(\mathbf{x},\mathbf{y}_2)\big)$ (đã có ở bài RLHF). Hai đáp án cùng prompt $\mathbf{x}$ nên có cùng $\beta\log Z(\mathbf{x})$, hiệu của chúng triệt tiêu:

$$P(\mathbf{y}_1\succ\mathbf{y}_2\mid\mathbf{x})=\sigma\!\Big(\beta\log\frac{\pi^*(\mathbf{y}_1\mid\mathbf{x})}{\pi_{\text{ref}}(\mathbf{y}_1\mid\mathbf{x})}-\beta\log\frac{\pi^*(\mathbf{y}_2\mid\mathbf{x})}{\pi_{\text{ref}}(\mathbf{y}_2\mid\mathbf{x})}\Big)$$

**5. Loss DPO** ([R23] pt. 7): thay $\pi^*$ bằng $\pi_{\boldsymbol{\theta}}$ rồi lấy log-likelihood âm trên dữ liệu:

$$\mathcal{L}_{\text{DPO}}(\boldsymbol{\theta};\pi_{\text{ref}})=-\,\mathbb{E}_{(\mathbf{x},\mathbf{y}_w,\mathbf{y}_l)\sim\mathcal{D}}\Big[\log\sigma\Big(\beta\log\frac{\pi_{\boldsymbol{\theta}}(\mathbf{y}_w\mid\mathbf{x})}{\pi_{\text{ref}}(\mathbf{y}_w\mid\mathbf{x})}-\beta\log\frac{\pi_{\boldsymbol{\theta}}(\mathbf{y}_l\mid\mathbf{x})}{\pi_{\text{ref}}(\mathbf{y}_l\mid\mathbf{x})}\Big)\Big]$$

Viết gọn cho ô code: $d=\big(\log\pi_{\boldsymbol{\theta}}(\mathbf{y}_w)-\log\pi_{\text{ref}}(\mathbf{y}_w)\big)-\big(\log\pi_{\boldsymbol{\theta}}(\mathbf{y}_l)-\log\pi_{\text{ref}}(\mathbf{y}_l)\big)$ và $\mathcal{L}=-\log\sigma(\beta d)$ cho mỗi cặp. (Đây là cùng một phép biến đổi $\log\frac{a}{b}$ thành hiệu hai log, là phép đại số; cần một câu giải thích trong bài.) Phụ lục B của [R23] có code PyTorch tương ứng: `-logsigmoid(beta * (pi_logratios - ref_logratios))`.

**6. Gradient** ([R23] mục 4, phụ lục A.4; $\hat r=\beta\log\frac{\pi_{\boldsymbol{\theta}}}{\pi_{\text{ref}}}$):

$$\nabla_{\boldsymbol{\theta}}\mathcal{L}_{\text{DPO}}=-\beta\,\mathbb{E}\Big[\underbrace{\sigma\big(\hat r(\mathbf{x},\mathbf{y}_l)-\hat r(\mathbf{x},\mathbf{y}_w)\big)}_{\text{trọng số: lớn khi xếp sai}}\big(\nabla_{\boldsymbol{\theta}}\log\pi_{\boldsymbol{\theta}}(\mathbf{y}_w\mid\mathbf{x})-\nabla_{\boldsymbol{\theta}}\log\pi_{\boldsymbol{\theta}}(\mathbf{y}_l\mid\mathbf{x})\big)\Big]$$

Ghi chú: $\hat r(\mathbf{y}_l)-\hat r(\mathbf{y}_w)=-\beta d$ nên trọng số là $\sigma(-\beta d)$, khớp "gradient theo lề" ở `rlhf.md` ($\sigma(-m)$). Kiểm bằng đạo hàm: $\partial\mathcal{L}/\partial\log\pi_{\boldsymbol{\theta}}(\mathbf{y}_w)=-\beta\sigma(-\beta d)$ và ngược dấu với $\mathbf{y}_l$ (suy ra từ $-\log\sigma(\beta d)$ và $\sigma'=\sigma(1-\sigma)$).

**7. IPO** ([A23] pt. 17; $\tau$ là hệ số điều chuẩn, $h=\log\frac{\pi_{\boldsymbol{\theta}}(\mathbf{y}_w)}{\pi_{\boldsymbol{\theta}}(\mathbf{y}_l)}-\log\frac{\pi_{\text{ref}}(\mathbf{y}_w)}{\pi_{\text{ref}}(\mathbf{y}_l)}$, cùng đại lượng $d$ ở trên): $\mathcal{L}_{\text{IPO}}=\mathbb{E}\big[(h-\tfrac{1}{2\tau})^2\big]$. Đây là phép hồi quy bình phương đưa $h$ về $\frac{1}{2\tau}$. Nếu nhắc công thức thì phải đổi ký hiệu $\tau$ khỏi $\beta$ và nhấn: ở [TRL] tham số `beta` được dùng cho $\tau$ khi `loss_type="ipo"`.

**Ví dụ số khớp bài RLHF** (đã chạy ngày 24/10/2026, tham chiếu $(0{,}6;\,0{,}3;\,0{,}1)$, reward $(0;\,1;\,3)$): với $\beta=10;\,1;\,0{,}3$, đại lượng $r-\beta\log(\pi^*/\pi_{\text{ref}})$ **bằng nhau ở cả ba đáp án** (0,6442; 1,2308; 2,3104). Đó chính là $\beta\log Z$, và cũng là giá trị mục tiêu $J^*$ ở bảng của `rlhf.md`. Đây là kiểm chứng số của bước 3 và 4: phần dư là hằng số theo $\mathbf{y}$ nên triệt tiêu khi lấy hiệu. Tự dựng, không có trong paper.

## Ví dụ hoặc trực giác hay

Diễn đạt lại; "(gợi ý)" là của `summarizer`.

- **Học từ bài làm của chính bạn (gợi ý).** Trong RLHF bạn thuê một giám khảo (reward model) rồi tự nấu mãi để lấy điểm. DPO bỏ giám khảo: ta cho mô hình xem cặp "món A hơn món B" và dạy trực tiếp "so với cách nấu cũ, hãy nghiêng về A và xa B". Điểm số nằm ngay trong chính mô hình, qua tỉ số giữa xác suất mới và xác suất cũ.
- **Điểm của một đáp án là "đã dịch chuyển bao nhiêu so với tham chiếu".** Reward ẩn $\beta\log(\pi_{\boldsymbol{\theta}}/\pi_{\text{ref}})$ dương nghĩa là mô hình mới thích đáp án đó hơn mô hình cũ. DPO chỉ cần hiệu giữa câu thắng và câu thua. Không có "điểm tuyệt đối", như bài RLHF đã nhắc.
- **Chiếc dây KL ở $\beta$ (gợi ý).** Cùng ví dụ ba đáp án của bài trước: $\beta$ lớn thì $\pi^*$ gần như đứng yên, $\beta$ nhỏ thì dồn vào đáp án điểm cao. Ở DPO dây này nằm trong cách đặt loss: cùng một độ dịch chuyển $d$, $\beta$ nhỏ cho "điểm" $\beta d$ nhỏ nên mô hình phải dịch chuyển nhiều hơn mới đạt cùng loss. Chỉ là diễn giải của người viết, khớp với ô code (bảng dưới).
- **Vì sao lề lớn không phải luôn tốt (gợi ý, từ [A23]).** Nếu dữ liệu cho thấy A luôn thắng B, DPO tiếp tục đẩy $d$ lên vô hạn vì loss chỉ về 0 khi $d\to\infty$ (giống ví dụ "dữ liệu tách được" ở bài RLHF). Đừng kết luận "$\beta$ đủ lớn là an toàn"; [A23] nói điều ngược lại ở thí nghiệm nhỏ của họ.
- **Dùng lại `RlhfStagesFigure` để so sánh.** Hai hàng cạnh nhau: RLHF (SFT, reward model, RL) và DPO (SFT, một bước tối ưu loss từ cặp ưa thích). Nhấn: DPO **giữ** SFT làm mô hình tham chiếu và **giữ** dữ liệu ưa thích, chỉ bỏ hai bước sau của RLHF.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **"DPO không có reward."** Có, ngầm: $\beta\log(\pi_{\boldsymbol{\theta}}/\pi_{\text{ref}})$. Chỉ là không huấn luyện mô hình reward riêng.
2. **"DPO không cần mô hình SFT hay mô hình tham chiếu."** Cần $\pi_{\text{ref}}$ trong loss (phải tính log-prob của nó, thường giữ bản đóng băng hoặc tính sẵn). [R23] khuyến nghị khởi tạo từ SFT. ORPO ([H24]), SimPO (Meng và cộng sự, 2024, [arXiv:2405.14734](https://arxiv.org/abs/2405.14734)) và một số biến thể khác bỏ hẳn mô hình tham chiếu.
3. **"DPO là RL."** Không có vòng RL, không có PPO, không lấy mẫu trong lúc huấn luyện. Nó là hồi quy logistic trên dữ liệu có sẵn (offline). Nhưng nó tối ưu **cùng mục tiêu** RL có phạt KL ([R23]).
4. **"$\beta$ lớn thì học mạnh hơn."** Ngược lại về mặt giữ gần: $\beta$ lớn là giữ gần $\pi_{\text{ref}}$ hơn. Đừng nhầm với tốc độ học $\eta$. Cũng đừng nhầm với "$\beta$ trong IPO là $\tau$": ở [TRL], tham số `beta` thành $\tau$ khi chọn loss IPO.
5. **Loss thấp = mô hình tốt.** DPO có thể kéo cả xác suất câu thắng **xuống** miễn là câu thua xuống nhiều hơn (loss chỉ phụ thuộc hiệu). [TRL] ghi nhận xét: thực tế thường là giảm khả năng của câu bị loại hơn là tăng câu được chọn. Cần theo dõi cả `rewards/accuracies` và sinh thử văn bản, cùng đánh giá bằng người hoặc mô hình, không chỉ loss. Đây là điều tài liệu TRL nêu, không phải kết luận của [R23].
6. **Nhầm hai thứ "so với tham chiếu".** Trong ô code, log-prob của **cả câu** là tổng log-prob các token, không phải trung bình. Câu dài có log-prob rất âm, nên hiệu giữa hai câu dài khác nhau phụ thuộc độ dài. [TRL] có biến thể `sigmoid_norm` (SimPO) nói đến việc chuẩn hóa theo độ dài; chỉ nhắc "độ dài có thể gây thiên lệch", không đào sâu vì chưa đọc paper SimPO.
7. **"DPO luôn tốt hơn RLHF."** Kết quả của [R23] là ở mô hình đến 6B, năm 2023, bốn thiết lập; chính họ nêu chưa biết ở quy mô lớn. [A23] nêu DPO overfit trong ví dụ nhỏ. Viết "trong thí nghiệm của họ".
8. **Dữ liệu ưa thích "lệch phân phối".** DPO dùng dữ liệu cố định; nếu đáp án trong dữ liệu không do $\pi_{\text{ref}}$ sinh thì có lệch phân phối. [R23] xử lý bằng cách tinh chỉnh $\pi_{\text{ref}}$ trên các câu được chọn khi không có SFT. Chỉ nhắc một câu.
9. **Nhầm với KTO và ORPO.** KTO dùng nhãn tốt/xấu **không cần cặp**; ORPO **không cần tham chiếu** và gộp với SFT. Chỉ nhắc tên và link, không dạy.
10. **Quên rằng $Z$ chỉ triệt tiêu khi hai đáp án cùng prompt.** Đó là lý do dữ liệu phải là cặp **cùng một $\mathbf{x}$**.

## Số tự chạy (Python, ngày 24/10/2026)

**Đã thay bằng dữ liệu trong bài.** Mục này giữ lại số của bản thử đầu. Bài dùng dữ liệu khác ở cặp 3 (log-prob câu bị loại của chính sách là $-48$, nên $d = (5, -2, 3, 2)$: cặp 3 nay có $d = 3$), và trọng số gradient in trong bài là $\sigma(-\beta d)$, không nhân $\beta$. Số đúng của bài nằm ở mục "Kiểm chứng code".

File thử: `dpo_loss.py` (khoảng 35 dòng, ngoài repo, ở scratchpad). **Chạy bằng Pyodide thật** qua `runpyo.mjs` (NumPy do Pyodide cung cấp), như quyết định 61. Không có tính ngẫu nhiên. Dữ liệu là log-prob toàn câu giả lập của 4 cặp.

Dữ liệu: `pi_w=(-38,-55,-47,-60)`, `pi_l=(-44,-50,-45,-58)`, `ref_w=(-40,-52,-46,-61)`, `ref_l=(-41,-49,-44,-57)`. Từ đó $d=(5,\,-2,\,0,\,2)$: cặp 1 policy đã dịch đúng hướng, cặp 2 dịch sai hướng, cặp 3 không đổi, cặp 4 hơi đúng.

| $\beta$ | loss trung bình | $P(\text{chosen})$ từng cặp |
|---|---|---|
| 0,01 | 0,6870 | 0,512; 0,495; 0,500; 0,505 |
| 0,1 | 0,6409 | 0,622; 0,450; 0,500; 0,550 |
| 0,5 | 0,5996 | 0,924; 0,269; 0,500; 0,731 |
| 1,0 | 0,7384 | 0,993; 0,119; 0,500; 0,881 |

- Ở $\beta=0{,}1$: loss từng cặp $(0{,}4741;\,0{,}7981;\,0{,}6931;\,0{,}5981)$, trọng số gradient $\beta\,\sigma(-\beta d)=(0{,}0378;\,0{,}0550;\,0{,}0500;\,0{,}0450)$. Cặp xếp sai (cặp 2) có trọng số lớn nhất, cặp xếp đúng mạnh (cặp 1) nhỏ nhất. Đây đúng là "trọng số lớn khi xếp sai".
- Khi policy trùng reference: $d=0$, loss mọi cặp bằng $\ln 2=0{,}6931$ với mọi $\beta$.
- **Loss trung bình không đơn điệu theo $\beta$** (0,6870, 0,6409, 0,5996, rồi 0,7384). Lý do: cặp 2 có $d<0$ nên $\beta$ lớn làm nó tệ hơn, và ở $\beta=1$ cặp đó chiếm ưu thế. Bài không được viết "$\beta$ lớn thì loss nhỏ" hay ngược lại; chỉ nói $\beta d$ là đối số của sigmoid, nên $\beta$ khuếch đại cả cặp đúng lẫn cặp sai. Nếu muốn một ví dụ gọn hơn, có thể chỉ in một cặp $d>0$ và một cặp $d<0$.
- Ví dụ ba đáp án (khớp bảng của `rlhf.md`): $r-\beta\log(\pi^*/\pi_{\text{ref}})$ cho ba đáp án bằng nhau và bằng $\beta\log Z$ = 0,6442 ($\beta=10$), 1,2308 ($\beta=1$), 2,3104 ($\beta=0{,}3$). Đã chạy bằng Python trong venv Pyodide (`-I`).

### Đề xuất ô `PythonRunner`

Một ô NumPy, khoảng 30 dòng, giống `dpo_loss.py` ở trên (đã chạy ra output ở bảng; **phải chạy lại sau khi lesson-writer sửa**). Nội dung: đặt log-prob giả lập của policy và reference trên bốn cặp, hàm `dpo_loss` trả $d$, loss và trọng số gradient, in loss từng cặp ở $\beta=0{,}1$, in bảng loss trung bình theo $\beta\in\{0{,}01;\,0{,}1;\,0{,}5;\,1\}$, rồi in trường hợp policy trùng reference (loss $=\ln 2$). Chỉ `numpy`. Output in tiếng Anh ngắn (quy ước `llm-lessons.md` 2.4). Tên file: `src/code/llm/dpo/dpo-loss.vi.py` (và bản sao `.en.py`). Bài tập mở: đổi dữ liệu để $d$ toàn dương và xem loss giảm khi $\beta$ tăng; hoặc thêm gradient theo `pi_w`.

`DPOTrainer`: chỉ nhắc tên trong lời văn kèm "`trl` 1.16.0", dữ liệu có cột `prompt`, `chosen`, `rejected`, `loss_type` mặc định `"sigmoid"` (tức loss DPO gốc), `beta` mặc định 0,1, `ref_model` bỏ trống thì dùng bản chính sách trước khi huấn luyện ([TRL]). **Không** đưa code chạy, không có khối `LocalCode` ở bài này nếu không cần (chưa kiểm chứng `trl`).

## Liên quan tới bài nào

- **Cần biết trước:** `llm/rlhf` (Bradley–Terry, mục tiêu RL có phạt KL, $\pi_{\text{ref}}$, $\beta$, ví dụ ba đáp án, lề). Nên liên kết đến phần đó và nhắc lại một đoạn ngắn thay vì viết lại.
- **Trước:** `llm/gpt-family-finetuning` (SFT làm mô hình tham chiếu); `ml/logistic-regression` nếu có (loss DPO là hồi quy logistic; chưa kiểm roadmap).
- **Sau:** `llm/evaluation-peft` (đánh giá bằng người và bằng mô hình, và LoRA; nhiều người chạy DPO cùng LoRA, nhưng bài nào cũng không phụ thuộc điều đó); `llm/deepseek-family` (nếu bài đó nhắc phương pháp RL; chưa kiểm).
- Hẹn ngoài bài: SimPO, RSO, các biến thể khác ở danh sách loss của [TRL]; học tăng cường tổng quát.

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Tối ưu hóa ưa thích trực tiếp | Direct Preference Optimization (DPO) | Dịch ở lần đầu, sau đó dùng "DPO" |
| Reward ẩn | Implicit reward | Dịch, gloss: reward tính từ tỉ số xác suất của chính sách và tham chiếu |
| Hàm phân hoạch / hằng số chuẩn hóa | Partition function ($Z$) | Dùng "hằng số chuẩn hóa" cho dễ hiểu, kèm tiếng Anh |
| Log tỉ số xác suất | Log-ratio | Dịch |
| Học ngoại tuyến | Offline | Gloss: dữ liệu có sẵn, không lấy mẫu trong lúc huấn luyện |
| Tỉ số odds | Odds ratio | Giữ tên; chỉ khi nhắc ORPO |
| Overfit dữ liệu ưa thích | Overfitting to preferences | Giữ "overfit" |
| IPO, KTO, ORPO | IPO, KTO, ORPO | Giữ tên viết tắt, ghi tên đầy đủ ở lần đầu: Identity Preference Optimization (tên "IPO" do [A23] đặt cho trường hợp $\Psi=\text{Identity}$), Kahneman–Tversky Optimization, Odds Ratio Preference Optimization |

## Đọc thêm đề xuất

1. **Rafailov và cộng sự (2023)**, DPO: [arXiv:2305.18290](https://arxiv.org/abs/2305.18290). Đọc mục 4 (dẫn xuất) và phụ lục A.1, A.2.
2. **Azar và cộng sự (2023)**, IPO: [arXiv:2310.12036](https://arxiv.org/abs/2310.12036). Đọc mục 5.
3. **Ethayarajh và cộng sự (2024)**, KTO: [arXiv:2402.01306](https://arxiv.org/abs/2402.01306) (ICML 2024).
4. **Hong, Lee, Thorne (2024)**, ORPO: [arXiv:2403.07691](https://arxiv.org/abs/2403.07691).
5. Tài liệu Hugging Face: [DPO Trainer](https://huggingface.co/docs/trl/dpo_trainer) (TRL 1.16.0).
6. Bài trước: Ouyang và cộng sự (2022), [arXiv:2203.02155](https://arxiv.org/abs/2203.02155) (RLHF).

## Kiểm chứng code

Dòng đầu là code trong bài (do `lesson-writer` chạy). Hai dòng sau là thử nghiệm phụ, không phải code trong bài.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `dpo-loss.vi.py`, `.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật qua `runpyo.mjs` (Python 3.14.2, NumPy 2.4.6); `ast.parse(feature_version=(3, 10))` qua bằng `.venv-llm`; content-reviewer chạy lại độc lập cả `.vi.py` và `.en.py` bằng Pyodide thật, khớp mọi số | Ô `PythonRunner`, 44 dòng, dòng dài nhất 74 ký tự. Sau review đổi tên biến `pi_w`, `ref_w`… thành `logp_w`, `ref_logp_w`…; chạy lại, output không đổi. $d = (5, -2, 3, 2)$; ở $\beta = 0.1$: loss 0.4741 / 0.7981 / 0.5544 / 0.5981, trọng số $\sigma(-\beta d)$ 0.3775 / 0.5498 / 0.4256 / 0.4502, accuracy 0.75; loss trung bình theo $\beta = 0.01; 0.1; 0.5; 1$: 0.6833 / 0.6062 / 0.4767 / 0.5773; chính sách trùng tham chiếu: 0.6931 = $\ln 2$. Mọi số trong bài khớp |
| (thử nghiệm) kiểm $r-\beta\ln(\pi^*/\pi_{\text{ref}})$ không đổi theo $\mathbf{y}$ | chạy thật | 2026-10-24 | Pyodide thật qua `runpyo.mjs` (script tạm ở scratchpad, không trong repo); content-reviewer chạy lại độc lập bảng bước 3 và các số trong quiz, khớp | $\beta = 10; 1; 0.3$ cho hằng số 0.6442 / 1.2308 / 2.3104; ở $\beta = 1$: $\pi^* = (0.175, 0.238, 0.587)$, $\beta\ln(\pi^*/\pi_{\text{ref}}) = (-1.2308, -0.2308, 1.7692)$, $Z = 3.424$. Bảng ở bước 3 của bài lấy từ lần này |
| (thử nghiệm) `dpo_loss.py` của summarizer, dữ liệu khác bài | chạy thật | 2026-10-24 | Pyodide qua `runpyo.mjs` | Loss trung bình 0,6870 / 0,6409 / 0,5996 / 0,7384 (dữ liệu cũ, $d = (5, -2, 0, 2)$; bài đã đổi cặp 3 thành $d = 3$) |
