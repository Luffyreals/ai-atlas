# RLHF (Reinforcement Learning from Human Feedback)

Bài: `llm/rlhf` (chỉ bản vi, khoảng 13 phút đọc). Cần biết trước: `llm/gpt-family-finetuning` (SFT, InstructGPT bước 1). Bài sau dùng nó làm tiền đề: `llm/dpo`. Hình tĩnh: `RlhfStagesFigure` (`llm-lessons.md` 2.9). Giáo án buổi 15: "Priority training techniques - RLHF".

Ngày tra: **24/10/2026**. Cách tra: tải PDF của Ouyang 2022, Stiennon 2020, Gao 2022, Bai 2022, Schulman 2017, Christiano 2017, trích chữ bằng `pdftotext`, đọc các đoạn và công thức nêu dưới đây (chưa đọc cả bài); WebFetch trang arXiv và tài liệu TRL; chạy thật Python. Ý không có thẻ nguồn là kiến thức chung hoặc suy ra từ công thức.

## Nguồn

- **[BT52]** Bradley, R. A., Terry, M. E. (1952). [*Rank Analysis of Incomplete Block Designs: I. The Method of Paired Comparisons*](https://doi.org/10.2307/2334029). Biometrika 39, tr. 324-345. **Không đọc được toàn văn**; thông tin trích dẫn lấy từ [C17] (mục 2) và tài liệu TRL, mô hình nêu ở dạng $P(i \succ j)=\tau_i/(\tau_i+\tau_j)$ theo các nguồn thứ cấp.
- **[C17]** Christiano, P., Leike, J., Brown, T. B., Martic, M., Legg, S., Amodei, D. (2017). [*Deep reinforcement learning from human preferences*](https://arxiv.org/abs/1706.03741). arXiv:1706.03741 (nộp 12/6/2017, trang hiện ở v4). Trang arXiv không nêu hội nghị. Đã đọc tóm tắt và mục 2.2.
- **[Z19]** Ziegler, D. M., Stiennon, N., Wu, J., Brown, T. B., Radford, A., Amodei, D., Christiano, P., Irving, G. (2019). [*Fine-Tuning Language Models from Human Preferences*](https://arxiv.org/abs/1909.08593). arXiv:1909.08593. Chỉ đọc tóm tắt (lần đầu áp dụng cho mô hình ngôn ngữ).
- **[S20]** Stiennon, N., Ouyang, L., Wu, J., Ziegler, D. M., Lowe, R., Voss, C., Radford, A., Amodei, D., Christiano, P. (2020). [*Learning to summarize from human feedback*](https://arxiv.org/abs/2009.01325). NeurIPS 2020 (theo trang arXiv; arXiv v3 ngày 15/2/2022). Đã đọc mục 3-4.3 (số mục theo trang PDF, chưa đối chiếu từng tiêu đề).
- **[S17]** Schulman, J., Wolski, F., Dhariwal, P., Radford, A., Klimov, O. (2017). [*Proximal Policy Optimization Algorithms*](https://arxiv.org/abs/1707.06347). arXiv:1707.06347 (v2, 28/8/2017). Trang arXiv không nêu hội nghị. Đã đọc mục 3 (clipped surrogate).
- **[O22]** Ouyang, L., Wu, J., Jiang, X., và cộng sự (20 tác giả) (2022). [*Training language models to follow instructions with human feedback*](https://arxiv.org/abs/2203.02155). arXiv:2203.02155 (nộp 4/3/2022). Trang arXiv không nêu hội nghị. Đã đọc mục 3.1-3.5, phụ lục C.
- **[B22]** Bai, Y., Jones, A., Ndousse, K., Askell, A., và cộng sự (31 tác giả) (2022). [*Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback*](https://arxiv.org/abs/2204.05862). arXiv:2204.05862 (nộp 12/4/2022, một phiên bản). Bộ dữ liệu "HH-RLHF" công bố ở [GitHub của Anthropic](https://github.com/anthropics/hh-rlhf) (link do paper nêu, chưa mở trang). Đã đọc tóm tắt, mục 4.3 phần công thức.
- **[G22]** Gao, L., Schulman, J., Hilton, J. (2022). [*Scaling Laws for Reward Model Overoptimization*](https://arxiv.org/abs/2210.10760). arXiv:2210.10760 (nộp 19/10/2022, một phiên bản). Trang ghi "Preprint. Under review", không nêu hội nghị. Đã đọc mục 1, 3.1, 3.5-3.6.
- **[TRL]** Tài liệu Hugging Face TRL, trang [*Reward Modeling*](https://huggingface.co/docs/trl/reward_trainer) (bản `trl` 1.16.0, đọc 24/10/2026). Dùng để mô tả API; không chép code.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Hội nghị của [C17], [S17], [O22], [B22], [G22] | Trang arXiv không nêu. Chỉ [S20] có ghi NeurIPS 2020 trên trang. | Ghi "arXiv:..., năm". Không ghi hội nghị cho các bài còn lại |
| Toàn văn [BT52] | Không truy cập được. | Chỉ nói "mô hình so sánh cặp (Bradley và Terry, 1952)" và công thức qua [C17], [TRL]. Không trích số trang nội dung |
| Dẫn xuất nghiệm tối ưu $\pi^*\propto\pi_{\text{ref}}e^{r/\beta}$ | Không đọc nguồn nào dẫn trong lần tra này (thường gắn với paper DPO, Rafailov và cộng sự 2023, **chưa tra**). Đã kiểm số (xem dưới). | Nếu dùng thì ghi "suy ra từ mục tiêu", hẹn `llm/dpo`; không gán cho paper nào khi chưa tra |
| `PPOTrainer` trong TRL | Wheel `trl` 1.16.0 không có module PPO (chỉ có `RewardTrainer`; trang docs `ppo_trainer` không có ở v1.16.0 nhưng có ở `main`). Chưa biết lý do. | Chỉ nhắc `RewardTrainer` (trl 1.16.0). Không viết "TRL có PPO" nếu không ghi phiên bản |
| Con số "lệch giữa trợ lý hữu ích và vô hại" của [B22] | Mới đọc tóm tắt và đoạn mở đầu; không đọc số. | Không nêu số của [B22] ngoài hai điều đã trích dưới đây |
| Trạng thái "RLHF hiện được dùng ở mô hình nào" | Chưa tra. Quy tắc `llm-lessons.md` 2.6 cấm "mới nhất". | Bài dừng ở InstructGPT (2022) và [B22] như sự kiện có năm |

## Ý chính

- **Vấn đề cần giải [O22].** Mục tiêu huấn luyện của mô hình tiền huấn luyện (dự đoán token kế tiếp trên web) khác với mục tiêu "làm theo chỉ dẫn của người dùng, hữu ích và an toàn". RLHF đưa phán đoán của người vào vòng huấn luyện. Chỉ SFT thì mô hình chỉ bắt chước đáp án mẫu; RLHF cho nó tín hiệu "câu nào được ưa hơn".
- **Ba bước [O22].** (1) Thu lời trình diễn của người gán nhãn, fine-tune có giám sát. (2) Thu dữ liệu so sánh (người chọn đầu ra tốt hơn), huấn luyện reward model dự đoán lựa chọn đó. (3) Dùng điểm của reward model làm phần thưởng, tối ưu chính sách (policy, tức chính mô hình ngôn ngữ) bằng PPO. Bước 2 và 3 có thể lặp. Cỡ dữ liệu của InstructGPT: khoảng 13 nghìn prompt cho SFT, 33 nghìn cho RM, 31 nghìn cho PPO.
- **Dòng dõi.** Ý "học phần thưởng từ so sánh cặp của người" xuất phát từ RL cổ điển [C17] (Atari, robot; chỉ cần phản hồi trên dưới 1% số bước tương tác). [Z19] đưa nó vào mô hình ngôn ngữ; [S20] làm cho tóm tắt (Reddit TL;DR) và là khuôn của [O22]; [O22] làm cho chỉ dẫn tổng quát; [B22] làm trợ lý hữu ích và vô hại.
- **Reward model [S20, O22].** Lấy mô hình SFT, thay lớp đầu ra bằng một đầu vô hướng: vào (prompt, đáp án), ra một con số. [O22] chỉ dùng RM 6B: mục 3 nêu hai lý do, (a) tiết kiệm nhiều tính toán, (b) RM 175B có thể huấn luyện không ổn định nên kém phù hợp để dùng làm value function trong RL. Huấn luyện bằng cross-entropy trên cặp: hiệu điểm là log odds (logit) người thích đáp án này hơn. Đây là mô hình Bradley–Terry, [C17] nói rõ và ví với điểm Elo của cờ vua.
- **Dữ liệu xếp hạng nhiều đáp án [O22].** Người gán nhãn xếp $K$ đáp án ($K$ từ 4 đến 9) cho một prompt, tạo $\binom{K}{2}$ cặp. Các cặp cùng prompt rất tương quan; xáo trộn từng cặp thành điểm dữ liệu riêng thì RM overfit sau một epoch. Họ đưa **mọi cặp của một prompt vào cùng một batch** (cũng chỉ cần một lượt forward cho mỗi đáp án). Huấn luyện RM đúng **một epoch**; nhiều epoch làm loss kiểm tra tệ đi rõ. Đối chiếu SFT ở bài trước, nơi nhiều epoch lại có ích (đừng nhầm).
- **Mức điểm tự do.** Hàm mất mát chỉ phụ thuộc hiệu điểm nên cộng một hằng số vào mọi điểm không đổi gì. [O22] chuẩn hóa sao cho lời trình diễn có điểm trung bình 0 trước khi RL; [S20] cũng chuẩn hóa như vậy cho bản tóm tắt tham chiếu. [TRL] nêu thêm tùy chọn `center_rewards_coefficient` (khuyến nghị 0,01) để phạt điểm lệch khỏi 0.
- **Bước RL [S20, O22].** Môi trường là "bandit": nhận một prompt, mô hình sinh cả câu trả lời, RM cho một điểm duy nhất, hết lượt. [S20] coi mỗi token là một bước thời gian nhưng chỉ thưởng ở cuối câu. Chính sách khởi tạo từ mô hình SFT; value function khởi tạo từ RM.
- **Phạt KL.** Phần thưởng thực là điểm RM trừ $\beta$ nhân log tỉ số xác suất giữa chính sách đang học và mô hình tham chiếu (mô hình SFT). [S20] nêu hai tác dụng: (a) như thưởng entropy, ngăn chính sách sụp về một kiểu đáp án; (b) giữ đầu ra không đi quá xa vùng RM từng thấy khi huấn luyện. Giá trị $\beta$ trong các paper: [O22] dùng 0,02; [B22] dùng giá trị rất nhỏ 0,001 (ghi "very small value"). [S20] nói họ theo cách đã làm ở Jaques và cộng sự 2019 (arXiv:1907.00456; **chưa đọc** paper đó).
- **PPO ở mức trực giác [S17].** PPO là thuật toán policy gradient cho phép cập nhật nhiều lần trên cùng lô dữ liệu mà không để chính sách đổi quá nhiều: nó cắt tỉ số xác suất mới/cũ vào khoảng $[1-\epsilon, 1+\epsilon]$ (ví dụ $\epsilon=0{,}2$) để mất động lực kéo xa hơn. Chỉ cần ý "bước nhỏ, an toàn", không dẫn đầy đủ. Lưu ý: kẹp này giữ chính sách gần **chính sách cũ ở bước trước**, khác phạt KL giữ gần **mô hình SFT ban đầu**. [G22] mục 3.6 nói đúng là: kẹp của PPO ngầm phạt KL so với $\pi_{\text{old}}$, không phải so với $\pi_{\text{init}}$; nó chỉ gián tiếp làm KL so với $\pi_{\text{init}}$ tăng chậm lại (không có phạt KL thì KL vẫn tăng đều theo số bước). Họ cũng ghi chạy không phạt KL tường minh lại ít overoptimization hơn chạy có phạt KL tường minh, và chưa rõ vì sao. **Không** gán cho [G22] câu "kẹp không thay được phạt KL".
- **PPO-ptx [O22].** RL làm tụt điểm trên một số tập NLP công khai ("alignment tax"). Cách giảm: cộng vào mục tiêu một thành phần log-likelihood trên dữ liệu tiền huấn luyện (hệ số $\gamma$). Họ ghi: trộn pretraining hiệu quả hơn việc chỉ tăng hệ số KL (tăng tới 2,0 vẫn không sửa được các vết tụt). [B22] nêu: mô hình nhỏ chịu "alignment tax" nặng, mô hình 13B và 52B thì không tụt ở zero-shot (và few-shot bằng nhau).
- **Kết quả đáng nêu [O22].** Đầu ra của InstructGPT 1.3B được người ưa hơn đầu ra GPT-3 175B (ít hơn 100 lần tham số). Chỉ nêu ở dạng "trong đánh giá của họ, trên phân phối prompt của họ".
- **Reward hacking / overoptimization.** RM chỉ là một hàm xấp xỉ rút ra từ ít dữ liệu so sánh. [S20] (hình 5): tối ưu nhẹ thì tóm tắt tốt lên, tối ưu mạnh thì chất lượng thật tụt, cuối cùng RM thậm chí **tương quan nghịch** với ưa thích của người; ROUGE cũng bị như vậy. [G22] đo có hệ thống bằng một RM "vàng" thay cho người: điểm vàng đầu tiên tăng rồi giảm khi KL tăng (luật Goodhart: "khi một thước đo thành mục tiêu thì nó thôi là thước đo tốt"). Họ khớp được hai dạng hàm (dưới). Hệ số phụ thuộc cỡ RM, cỡ dữ liệu; RM và dữ liệu lớn hơn thì ít bị hơn.
- **Hai phát hiện của [G22] nên nói cẩn thận.** (1) Với RL, **phạt KL không cải thiện** đường cong "điểm vàng theo KL"; nó chỉ làm điểm vàng hội tụ sớm hơn, giống dừng sớm (ghi rõ trong bài của họ là "có thể rất nhạy với siêu tham số"). Nên đừng viết "phạt KL ngăn reward hacking" như chân lý. (2) Best-of-$n$ tiêu tốn ít KL hơn RL cho cùng mức tối ưu. Đây là thiết lập tổng hợp (RM vàng, không phải người) nên không khái quát hết.
- **[B22]: hữu ích và vô hại, online.** Họ huấn luyện reward model gọi là "preference model" trên hai bộ so sánh (hữu ích, vô hại). Họ cập nhật PM và chính sách theo vòng lặp **gần như hàng tuần** với phản hồi mới ("iterated online"). Quan sát: điểm thưởng tăng xấp xỉ **tuyến tính theo căn bậc hai của KL** từ chính sách khởi đầu (ở giai đoạn đầu huấn luyện, thấy ở mọi lần chạy). Hữu ích và vô hại thường kéo nhau ngược chiều, nhưng một hỗn hợp cả hai vẫn học được hành vi hữu ích khi thích hợp.
- **Chi phí và ràng buộc.** RLHF cần ba mô hình (chính sách, tham chiếu, RM) cộng value function, cần người gán nhãn (khoảng 40 hợp đồng viên ở [O22]) và nhạy với siêu tham số. Đây là động lực của DPO (bài sau). Chỉ hẹn, không giải.

## Công thức quan trọng

Ký hiệu theo site: prompt $\mathbf{x}$, đáp án $\mathbf{y}$, tham số $\boldsymbol{\theta}$, hàm mất mát $\mathcal{L}$. Đề xuất ký hiệu riêng của bài: điểm reward model $r_{\boldsymbol{\theta}}(\mathbf{x},\mathbf{y})$; đáp án được chọn $\mathbf{y}_w$ và bị loại $\mathbf{y}_l$ (khớp [O22]); chính sách $\pi_{\boldsymbol{\phi}}$ (tham số $\boldsymbol{\phi}$ để khỏi trùng RM), mô hình tham chiếu $\pi_{\text{ref}}$ (SFT), hệ số phạt KL $\beta$ (khớp [O22], không đụng $\eta$ là tốc độ học), $\sigma$ là sigmoid. Cần thêm $\beta$, $\pi$ vào chỗ ký hiệu nếu `lesson-writer` thấy cần.

**Mô hình Bradley–Terry** ([BT52] qua [C17], [TRL]): xác suất đáp án $\mathbf{y}_w$ được ưa hơn $\mathbf{y}_l$:

$$P(\mathbf{y}_w \succ \mathbf{y}_l \mid \mathbf{x}) = \sigma\big(r_{\boldsymbol{\theta}}(\mathbf{x},\mathbf{y}_w) - r_{\boldsymbol{\theta}}(\mathbf{x},\mathbf{y}_l)\big) = \frac{e^{r_w}}{e^{r_w}+e^{r_l}}$$

(đẳng thức thứ hai là phép biến đổi đại số: nhân tử và mẫu của sigmoid với $e^{r_w}$; cần giải thích bằng lời trong bài.)

**Loss reward model** ([S20] mục "Reward models"; [O22] pt. (1) có thêm $1/\binom{K}{2}$):

$$\mathcal{L}(\boldsymbol{\theta}) = -\,\mathbb{E}_{(\mathbf{x},\mathbf{y}_w,\mathbf{y}_l)\sim\mathcal{D}}\Big[\log \sigma\big(r_{\boldsymbol{\theta}}(\mathbf{x},\mathbf{y}_w) - r_{\boldsymbol{\theta}}(\mathbf{x},\mathbf{y}_l)\big)\Big]$$

Giải thích: đây là log-likelihood âm của lựa chọn người. Gọi $m = r_w - r_l$ (lề). Giá trị đã chạy: $-\log\sigma(m)$ bằng 0,6931 khi $m=0$ (đoán mò, $\ln 2$), 0,3133 khi $m=1$, 0,1269 khi $m=2$, 0,0181 khi $m=4$, 1,3133 khi $m=-1$, 2,1269 khi $m=-2$. Gradient theo lề: $\partial\mathcal{L}/\partial m = -(1-\sigma(m)) = -\sigma(-m)$; cặp càng bị xếp sai thì gradient càng lớn. Với điểm tuyến tính $r=\mathbf{w}^\top\boldsymbol{\varphi}(\mathbf{x},\mathbf{y})$ (dành cho ô NumPy): $\nabla_{\mathbf{w}}\mathcal{L} = -\frac{1}{m_{\text{cặp}}}\sum_i (1-p_i)\,(\boldsymbol{\varphi}_{w,i}-\boldsymbol{\varphi}_{l,i})$, với $p_i=\sigma(\mathbf{w}^\top\Delta\boldsymbol{\varphi}_i)$. Chú ý ký hiệu: số cặp nên dùng chữ khác $m$ (đã là số mẫu) hoặc dùng $N$; ở đây tạm viết $m_{\text{cặp}}$.

**Mục tiêu RL có phạt KL** ([S20] mục 3.3 và [O22] pt. (2) khi $\gamma=0$): phần thưởng mỗi cặp (prompt, đáp án):

$$R(\mathbf{x},\mathbf{y}) = r_{\boldsymbol{\theta}}(\mathbf{x},\mathbf{y}) - \beta \log\frac{\pi_{\boldsymbol{\phi}}(\mathbf{y}\mid\mathbf{x})}{\pi_{\text{ref}}(\mathbf{y}\mid\mathbf{x})}$$

Chính sách cực đại hóa kỳ vọng của $R$ trên prompt $\mathbf{x}$ và đáp án $\mathbf{y}\sim\pi_{\boldsymbol{\phi}}$. Kỳ vọng của số hạng log chính là KL: $\mathbb{E}_{\mathbf{y}\sim\pi_{\boldsymbol{\phi}}}[\log(\pi_{\boldsymbol{\phi}}/\pi_{\text{ref}})] = D_{\text{KL}}(\pi_{\boldsymbol{\phi}}\,\|\,\pi_{\text{ref}})$ (phép suy diễn của người viết, định nghĩa KL). Khi tính theo token, tổng log tỉ số các token cho log tỉ số của cả câu ([O22] nói "per-token KL penalty").

**Mục tiêu PPO-ptx** ([O22] pt. (2), $\mathcal{D}_{\text{pretrain}}$ là dữ liệu tiền huấn luyện, $\gamma$ là hệ số; paper cực đại hóa nên là "mục tiêu", không phải mất mát):

$$\text{objective}(\boldsymbol{\phi}) = \mathbb{E}_{(\mathbf{x},\mathbf{y})\sim\pi_{\boldsymbol{\phi}}}\Big[r_{\boldsymbol{\theta}}(\mathbf{x},\mathbf{y}) - \beta\log\tfrac{\pi_{\boldsymbol{\phi}}(\mathbf{y}\mid\mathbf{x})}{\pi_{\text{SFT}}(\mathbf{y}\mid\mathbf{x})}\Big] + \gamma\,\mathbb{E}_{\mathbf{x}\sim\mathcal{D}_{\text{pretrain}}}\big[\log\pi_{\boldsymbol{\phi}}(\mathbf{x})\big]$$

Chỉ nhắc ở dạng một câu; không cần công thức trong bài nếu quá dài.

**PPO clipped surrogate** ([S17] pt. (7); chỉ để nói trực giác; $\rho_t=\pi_{\text{mới}}/\pi_{\text{cũ}}$, $\hat A_t$ là advantage ước lượng):

$$L^{\text{CLIP}}=\mathbb{E}_t\Big[\min\big(\rho_t\hat A_t,\ \text{clip}(\rho_t,1-\epsilon,1+\epsilon)\hat A_t\big)\Big]$$

Nên **không** đưa advantage hay hàm giá trị vào bài; chỉ nói "bước càng lớn so với chính sách cũ thì phần thưởng không được tính thêm".

**Hai dạng hàm của overoptimization** ([G22]; $d=\sqrt{D_{\text{KL}}(\pi\,\|\,\pi_{\text{init}})}$, $R(0)=0$; $\alpha$, $\beta$ là hệ số khớp, tên trùng $\beta$ của KL nên khi viết đổi tên, ví dụ $a$, $b$):

$$R_{\text{bon}}(d)=d\,(\alpha_{\text{bon}}-\beta_{\text{bon}}\,d),\qquad R_{\text{RL}}(d)=d\,(\alpha_{\text{RL}}-\beta_{\text{RL}}\log d)$$

(đã đọc đúng hai biểu thức này ở mục 1 của [G22]; $d$ định nghĩa là căn bậc hai của KL.) Ý: điểm vàng tăng rồi giảm, đỉnh ở một $d$ hữu hạn. Bài chỉ cần nói "đường cong hình chuông ngược", có thể không đưa công thức.

**Điểm gradient của [B22]:** điểm thưởng RL $\approx$ tuyến tính theo $\sqrt{D_{\text{KL}}}$ ở giai đoạn đầu; nêu bằng lời.

## Ví dụ hoặc trực giác hay

Diễn đạt lại; "(gợi ý)" là của `summarizer`.

- **Ba bước như học nấu ăn (gợi ý):** (1) xem đầu bếp làm mẫu rồi bắt chước (SFT); (2) thử nhiều món, có giám khảo chọn "món A ngon hơn món B", từ đó bạn học được "khẩu vị của giám khảo" (reward model); (3) tự nấu mãi để được giám khảo ảo (reward model) chấm điểm cao, nhưng có một sợi dây giữ không cho bạn đi quá xa cách nấu quen thuộc (phạt KL).
- **Reward model như điểm Elo [C17]:** hiệu điểm quyết định xác suất thắng. Hai đáp án cách nhau 0 điểm thì 50/50; lề 2 thì khoảng 88%; lề 4 thì khoảng 98% (số từ $\sigma(2)$ và $\sigma(4)$, đã chạy). So sánh với [B22]: họ dùng Elo để so các mô hình.
- **Vì sao dùng so sánh, không chấm điểm tuyệt đối (gợi ý, lập luận của summarizer; chưa có nguồn đọc kỹ cho phần "ổn định hơn"):** người dễ nói "A hơn B" hơn là cho 7/10; [O22] vẫn dùng so sánh và xếp hạng.
- **Sợi dây KL (gợi ý):** ví dụ ba đáp án trong ô NumPy. Với phần thưởng $(0,1,3)$ và chính sách tham chiếu $(0{,}6; 0{,}3; 0{,}1)$, nghiệm tối ưu của mục tiêu có phạt KL là $\pi^*\propto\pi_{\text{ref}}\,e^{r/\beta}$ (đã kiểm bằng 20 000 phân phối ngẫu nhiên: không cái nào vượt). $\beta=10$: gần như đứng yên, $D_{\text{KL}}=0{,}005$, $\mathbb{E}[r]=0{,}69$. $\beta=1$: dịch về đáp án 3, $D_{\text{KL}}=0{,}77$, $\mathbb{E}[r]=2{,}00$. $\beta=0{,}3$: dồn gần hết (99,6%) vào đáp án 3, $D_{\text{KL}}=2{,}27$. Kéo sợi dây lỏng ra thì chính sách lao vào đáp án điểm cao nhất, kể cả khi điểm đó là lỗi của RM. Gắn với "reward hacking".
- **Hacking có thể trông thế nào (gợi ý, từ [Z19], [S20], [O22]):** [Z19] ghi các mô hình tóm tắt hay chép nguyên câu từ đầu vào và nói chúng "có thể đang khai thác" việc người gán nhãn dựa vào quy tắc đơn giản. [O22] nói mô hình đôi khi rào đón ("hedge") quá mức và họ nghi một phần vì người gán nhãn được dặn thưởng sự khiêm tốn tri thức, và RM học theo. Đừng bịa ví dụ "mô hình viết dài để lừa RM" như kết luận của paper; đây chỉ là kiểu thiên lệch có thể xảy ra nếu RM thích câu dài (không đọc được nguồn khẳng định trong lần tra này).
- **Đường cong hình chuông ngược (gợi ý):** vẽ bằng hình, trục ngang là "mức tối ưu" (độ lệch KL), hai đường: điểm RM (tăng mãi) và chất lượng thật (tăng rồi giảm). Hai đường tách nhau là khoảng hacking. Hình tĩnh hoặc bảng, không có VIZ (`llm-lessons.md` 2.9 chỉ có `RlhfStagesFigure`).

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Nhầm reward model với mô hình đang được huấn luyện.** RM là một mô hình riêng (khởi tạo từ SFT, thêm đầu vô hướng), huấn luyện xong rồi **đóng băng** khi chạy RL [O22]. Chính sách mới là thứ được cập nhật ở bước 3.
2. **Nhầm "điểm RM cao" với "tốt".** RM chỉ là xấp xỉ từ ít dữ liệu so sánh; [S20] và [G22] cho thấy tối ưu quá tay thì chất lượng thật tụt (luật Goodhart). Phải dừng sớm hoặc giữ gần tham chiếu, và vẫn cần đánh giá bằng người.
3. **Hiểu "phạt KL ngăn mọi reward hacking".** [S20] mô tả nó như một dây giữ; nhưng [G22], trong thiết lập tổng hợp của họ, thấy nó chỉ giống dừng sớm và không cải thiện đường biên điểm-KL. Nói đúng: dây giữ giảm tốc độ rời xa, không đảm bảo an toàn.
4. **Nhầm hai "KL".** Phạt KL của RLHF là giữa chính sách và mô hình **SFT**; kẹp của PPO là giữa chính sách mới và chính sách **cũ vừa rồi**. [G22] mục 3.6: kẹp ngầm phạt KL so với $\pi_{\text{old}}$, chỉ gián tiếp làm KL so với $\pi_{\text{init}}$ tăng chậm; trong thí nghiệm của họ, chạy không phạt KL tường minh lại ít overoptimization hơn, chưa rõ vì sao.
5. **Quên rằng loss Bradley–Terry không có điểm gốc.** Cộng hằng số vào mọi điểm không đổi loss; điểm tuyệt đối vô nghĩa, chỉ hiệu mới có nghĩa. Vì vậy phải chuẩn hóa [O22] hoặc dùng `center_rewards_coefficient` [TRL].
6. **Dữ liệu tách được hoàn toàn thì trọng số tăng mãi.** Đã chạy: bốn cặp tách được tuyến tính, $\mathbf{w}$ vẫn lớn dần sau 200 bước ($\mathbf{w}\approx(7{,}27;\ 4{,}37)$, loss 0,0526 và còn giảm). Với dữ liệu thật, đây là lý do cần ít epoch, dừng sớm, và sợ overfit RM (RM của [O22] overfit nếu lặp nhiều epoch). Đừng nói "huấn luyện đến khi hội tụ" ở bài này mà không nói loss chỉ về 0 khi trọng số vô hạn.
7. **Xáo trộn các cặp cùng một prompt.** [O22]: các cặp cùng một prompt rất tương quan; coi từng cặp là mẫu độc lập thì RM overfit sau một epoch. Gom tất cả cặp của một prompt vào một batch.
8. **Nhầm RLHF với "tăng kiến thức".** RLHF dạy hành vi (làm theo chỉ dẫn, giọng điệu, né nội dung hại), không thêm kiến thức. [O22] vẫn thấy lỗi bịa đặt và nhận giả thuyết sai làm tiền đề. (Ghi rõ đây là quan sát của họ ở năm 2022.)
9. **Nhầm hữu ích với vô hại là một mục tiêu duy nhất.** [B22] huấn luyện trên hai bộ so sánh vì hai mục tiêu thường kéo ngược chiều; mô hình chỉ vô hại sẽ từ chối quá mức.
10. **Dùng "RLHF = PPO".** PPO chỉ là một thuật toán cho bước 3 trong [S20], [O22], [B22]. Bài sau (`llm/dpo`) bỏ cả bước RL. Cũng đừng nói "TRL có PPO" khi không nêu phiên bản (xem "Chưa xác minh").
11. **Kết quả nhỏ không khái quát.** "1,3B hơn 175B" là kết quả của [O22] trên phân phối prompt của họ, đánh giá bằng người gán nhãn của họ. Ghi kèm paper và năm (`llm-lessons.md` 2.6).

## Số tự chạy (Python, ngày 24/10/2026)

File thử ở scratchpad `bt_rlhf.py` (37 dòng, ngoài repo). Chạy ở hai môi trường: `.venv-llm` (NumPy 2.5.4) và venv Pyodide `C:/Users/Dell/.venvs/ai-atlas-py314` (NumPy 2.4.6, theo `llm-lessons.md` 2.5 là bản cần dùng cho ô `PythonRunner`). **Hai môi trường cho cùng đầu ra** (băm MD5 trùng khớp). Không có tính ngẫu nhiên trong phần Bradley–Terry; phần KL dùng `default_rng(0)`.

Dữ liệu thử: 4 cặp, mỗi đáp án có hai đặc trưng (độ hữu ích, độ dài chia 10), điểm tuyến tính $r=\mathbf{w}^\top\boldsymbol{\varphi}$.

| Đại lượng | Giá trị |
|---|---|
| Loss tại $\mathbf{w}=\mathbf{0}$ | 0,6931 ($=\ln 2$), cả bốn $p_i=0{,}5$ |
| Gradient tại $\mathbf{w}=\mathbf{0}$ | $(-0{,}2125;\ -0{,}0500)$; trùng đạo hàm số (sai phân, đến 4 chữ số) |
| Sau 1 bước ($\eta=1$) | $\mathbf{w}=(0{,}213;\ 0{,}050)$ |
| Sau 10 bước | loss 0,4222, $\mathbf{w}=(1{,}615;\ 0{,}519)$, độ chính xác 100% |
| Sau 50 / 100 / 200 bước | loss 0,1637 / 0,0949 / 0,0526; $\mathbf{w}$ tiếp tục tăng |
| Lề cuối (sau 200 bước) | $(5{,}527;\ 2{,}325;\ 2{,}332;\ 3{,}926)$; xác suất đúng $(0{,}996;\ 0{,}911;\ 0{,}911;\ 0{,}981)$ |

- **Dữ liệu tách được nên không có nghiệm hữu hạn**: loss còn giảm ở bước 200. Bài nên chốt số bước cố định và nói thẳng.
- Lưu ý khi viết code: nếu in độ chính xác **trước** khi cập nhật trọng số (như thử nghiệm của summarizer), bước 1 báo 0% vì lề bằng 0 và điều kiện `margin > 0` là sai. Nên tính độ chính xác sau khi cập nhật.
- **Ví dụ KL, ba đáp án**, phần thưởng $(0;\ 1;\ 3)$, tham chiếu $(0{,}6;\ 0{,}3;\ 0{,}1)$:

| $\beta$ | $\pi^*$ | $D_{\text{KL}}$ | $\mathbb{E}[r]$ | mục tiêu $J$ |
|---|---|---|---|---|
| 10 | (0,563; 0,311; 0,127) | 0,005 | 0,691 | 0,6442 |
| 1 | (0,175; 0,238; 0,587) | 0,767 | 1,998 | 1,2308 |
| 0,3 | (0,000; 0,004; 0,996) | 2,27 | 2,992 | 2,3104 |

  Kiểm bằng 20 000 phân phối Dirichlet ngẫu nhiên: không phân phối nào vượt $J^*$ (tốt nhất 0,6441 / 1,2308 / 2,3065).
- Không có số đo nào về "RM thật" hay PPO thật; các con số đó chỉ lấy từ paper.

### Đề xuất ô `PythonRunner`

Một ô NumPy (khoảng 25-30 dòng): đặt bốn cặp, hàm `loss_and_grad`, in loss và gradient tại $\mathbf{w}=0$, chạy 50 bước và in loss, độ chính xác, lề; **nên gọi phần kiểm gradient bằng sai phân là bài tập, không nhét vào**. Không cần seed (không có ngẫu nhiên). Có thể thêm ô thứ hai ngắn cho ví dụ KL ba đáp án (dùng công thức $\pi^*$ và in $D_{\text{KL}}$, $\mathbb{E}[r]$ cho ba giá trị $\beta$), bỏ phần tìm kiếm ngẫu nhiên để gọn. Thư viện: chỉ `numpy` (có trong Pyodide). **Phải chạy lại bằng venv Pyodide** trước khi chép số vào bài (đã chạy lần này, khớp).

TRL: chỉ nhắc `RewardTrainer` của `trl` 1.16.0 (dữ liệu có cột `chosen`/`rejected`, loss đúng công thức Bradley–Terry ở trên) trong lời văn hoặc khối code không chạy. `trl` chưa có trong `.venv-llm` và `scripts/requirements-llm.txt` (chỉ tải wheel không cài để kiểm cấu trúc). Không đưa vào code chạy.

## Liên quan tới bài nào

- **Cần biết trước:** `llm/gpt-family-finetuning` (SFT là bước 1 của [O22]; cặp prompt-completion; nhắc "overfit không sao" chỉ đúng với SFT của họ).
- **Trước:** `ml/overfitting-underfitting` (RM overfit sau một epoch; Goodhart là một dạng overfit với thước đo); `ml/gradient-descent` nếu đã xuất bản (gradient, tốc độ học $\eta$); `ml/logistic-regression` nếu có trong lộ trình (sigmoid và cross-entropy là cùng một công thức; chưa kiểm roadmap).
- **Sau:** `llm/dpo` (bỏ reward model và vòng RL; nghiệm $\pi^*\propto\pi_{\text{ref}}e^{r/\beta}$ là cầu nối); `llm/evaluation-peft` (đánh giá bằng người và bằng mô hình).
- Hẹn ngoài bài: học tăng cường tổng quát và policy gradient (không có bài riêng; chỉ trực giác ở mức một đoạn).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Học tăng cường từ phản hồi của người | Reinforcement learning from human feedback (RLHF) | Dịch và gloss lần đầu; sau đó dùng "RLHF" |
| Mô hình phần thưởng | Reward model (RM) | Dịch, gloss; sau đó dùng "reward model" hoặc "RM" cho ngắn |
| Chính sách | Policy | Dịch, giải thích "chính sách là chính mô hình ngôn ngữ đang sinh chữ" |
| Mô hình tham chiếu | Reference model | Dịch (ở đây là mô hình SFT) |
| Phạt KL | KL penalty | Giữ "KL" (độ lệch Kullback–Leibler), giải thích bằng lời |
| Mô hình Bradley–Terry | Bradley–Terry model | Giữ tên riêng |
| Lề (hiệu điểm) | Margin | Dịch |
| Dữ liệu so sánh/ưa thích | Comparison / preference data | Dịch |
| Hack phần thưởng | Reward hacking | Giữ tiếng Anh (người Việt quen dùng), gloss |
| Tối ưu quá mức | Overoptimization | Dịch, gloss |
| Luật Goodhart | Goodhart's law | Dịch, gloss |
| Thuế căn chỉnh | Alignment tax | Giữ tiếng Anh kèm giải thích, dịch gượng thì khó hiểu |
| Người gán nhãn | Labeler | Dịch |
| Lời trình diễn | Demonstration | Đã có ở bài trước |

## Đọc thêm đề xuất

1. **Ouyang và cộng sự (2022)**, InstructGPT: [arXiv:2203.02155](https://arxiv.org/abs/2203.02155). Đọc mục 3.5 (RM và RL) và phụ lục C.
2. **Stiennon và cộng sự (2020)**, tóm tắt từ phản hồi của người: [arXiv:2009.01325](https://arxiv.org/abs/2009.01325). Đọc mục 3 và 4.3 (hình 5).
3. **Christiano và cộng sự (2017)**: [arXiv:1706.03741](https://arxiv.org/abs/1706.03741). Đọc mục 2.2 (Bradley–Terry và Elo).
4. **Bai và cộng sự (2022)**, HH-RLHF: [arXiv:2204.05862](https://arxiv.org/abs/2204.05862). Dữ liệu: [github.com/anthropics/hh-rlhf](https://github.com/anthropics/hh-rlhf).
5. **Gao, Schulman, Hilton (2022)**: [arXiv:2210.10760](https://arxiv.org/abs/2210.10760). Đọc mục 1 và 3.6.
6. **Schulman và cộng sự (2017)**, PPO: [arXiv:1707.06347](https://arxiv.org/abs/1707.06347). Đọc mục 3.
7. Tài liệu Hugging Face: [Reward Modeling](https://huggingface.co/docs/trl/reward_trainer) (TRL 1.16.0).

## Kiểm chứng code

Code của bài do `lesson-writer` chạy ngày 24/10/2026, thư mục làm việc ở scratchpad. Dòng cuối là thử nghiệm của summarizer ở scratchpad, không phải code trong bài.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `reward-model.vi.py`, `reward-model.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`), Python 3.14.2, NumPy 2.4.6 | Ô `PythonRunner`. Hai bản cho cùng output. `w = 0: loss 0.6931, grad [-0.1417 -0.3167]`; bước 1: loss 0.5833, acc 0.83; bước 10: loss 0.2808, acc 1.00; bước 100: loss 0.0567, acc 1.00, `w [4.9 3.08]`; `r(good) = 5.95, r(bad) = 10.70`, `P(bad > good) = 0.991`. Khớp lời văn. Gradient tại $\mathbf{w}=\mathbf{0}$ kiểm tay: $-0.5 \times$ trung bình hiệu đặc trưng $(0.2833, 0.6333)$. `ast.parse(..., feature_version=(3, 10))` qua; 39 dòng, dòng dài nhất ≤ 79 ký tự. `content-reviewer` chạy lại độc lập cả bản vi và en trên Pyodide thật (`runpyo.mjs`) ngày 2026-10-24: output khớp lời văn |
| `kl-leash.vi.py`, `kl-leash.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`), Python 3.14.2, NumPy 2.4.6 | Ô `PythonRunner`. Hai bản cho cùng output. `assert` (không phân phối Dirichlet nào trong 20 000, seed 0, vượt mục tiêu của $\pi^*$) qua ở cả 6 giá trị $\beta$. Dòng `ref`: E[r] 0.600, E[q] 0.330; $\beta=10$: KL 0.005; $\beta=1.5$: KL 0.317, E[q] 0.419 (cao nhất); $\beta=0.5$: $\pi(C)=0.935$; $\beta=0.3$: $\pi(C)=0.996$, E[r] 2.992, E[q] 0.303. Khớp lời văn. `ast.parse(..., feature_version=(3, 10))` qua; 30 dòng. `content-reviewer` chạy lại độc lập cả bản vi và en trên Pyodide thật (`runpyo.mjs`) ngày 2026-10-24: output khớp lời văn, kể cả $eta=0.5$: E[q] 0.332 (ngang dòng `ref` 0.330) |
| (đối chiếu nguồn) lời văn của bài | đối chiếu | 2026-10-24 | PDF gốc của các paper (arXiv); TRL 1.16.0 | `content-reviewer` đối chiếu các khẳng định với PDF gốc và TRL 1.16.0. Đã sửa theo review: lý do RM 6B ([O22] mục 3), điều [G22] mục 3.6 nói về kẹp PPO và phạt KL, "vài chục nghìn prompt được xếp hạng", [B22] mô hình 13B/52B tốt lên ở zero-shot |
| (thử nghiệm) `bt_rlhf.py`, Bradley–Terry 4 cặp và ví dụ KL | chạy thật | 2026-10-24 | `.venv-llm` NumPy 2.5.4 và venv Pyodide NumPy 2.4.6, Python 3.14, `-I` | Cùng đầu ra ở hai môi trường. Loss 0,6931 → 0,4222 (10 bước) → 0,0526 (200 bước); gradient khớp sai phân; $\pi^*$ khớp tìm kiếm ngẫu nhiên |
