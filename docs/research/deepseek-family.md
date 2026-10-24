# Họ DeepSeek: MoE, MLA, GRPO (The DeepSeek Family)

Bài: `llm/deepseek-family` (chỉ bản vi, khoảng 13 phút đọc). Bài cần biết trước trong roadmap: `llm/llama-family`, `llm/rlhf`. Có hình `MoeFigure` (`docs/architecture/llm-lessons.md` mục 2.9) và đề xuất hai ô `PythonRunner` (NumPy). Không có ô `LocalCode`.

Ngày tra: **24/10/2026**. Cách tra: tải PDF từ arXiv, trích chữ bằng `pdftotext`, đọc các mục nêu dưới đây; trang arXiv và thẻ mô hình Hugging Face mở bằng WebFetch. Phần công thức: `pdftotext` làm mất ký hiệu toán, nên công thức bên dưới được viết lại từ cấu trúc còn đọc được cộng với văn xuôi quanh nó (đã đối chiếu số hạng, chỉ số, điều kiện). `lesson-writer` mở lại PDF ở các phương trình nêu số nếu cần chắc.

Phạm vi theo yêu cầu: chỉ phiên bản có paper hoặc báo cáo kỹ thuật công khai, ghi mốc thời gian. Bài này **không** nói đến chuyện "mạnh nhất" hay "mới nhất" (`llm-lessons.md` mục 2.6).

## Nguồn

- **[MOE]** Dai, D., Deng, C., Zhao, C., Xu, R.X., Gao, H., Chen, D., Li, J., Zeng, W., Yu, X., Wu, Y., Xie, Z., Li, Y.K., Huang, P., Luo, F., Ruan, C., Sui, Z., Liang, W. (2024). [*DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models*](https://arxiv.org/abs/2401.06066). arXiv:2401.06066 (v1, 11/1/2024). Đã đọc tóm tắt, mục 3 (kiến trúc, cân bằng tải), cấu hình mục 4, 5.
- **[MATH]** Shao, Z., Wang, P., Zhu, Q., Xu, R., Song, J., Bi, X., Zhang, H., Zhang, M., Li, Y.K., Wu, Y., Guo, D. (2024). [*DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*](https://arxiv.org/abs/2402.03300). arXiv:2402.03300 (bản đã đọc: v3, 27/4/2024). Đã đọc tóm tắt và mục 4.1 (từ PPO đến GRPO, giám sát theo kết quả).
- **[V2]** DeepSeek-AI (2024). [*DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model*](https://arxiv.org/abs/2405.04434). arXiv:2405.04434 (bản đã đọc: v5, 19/6/2024; mã arXiv cho biết nộp 5/2024). Đã đọc tóm tắt, mục 2.1 (MLA), 2.2 (MoE, định tuyến giới hạn thiết bị), 3.1.2 (cấu hình).
- **[V3]** DeepSeek-AI (2024). [*DeepSeek-V3 Technical Report*](https://arxiv.org/abs/2412.19437). arXiv:2412.19437 (bản đã đọc: v2, 18/2/2025; mã arXiv cho biết nộp 12/2024). Đã đọc tóm tắt, mục 1 (bảng chi phí), 2.1.2 (cân bằng tải), 2.2 (MTP), 3.3 (FP8), cấu hình mục 4.2, phần nói về MTP khi suy luận.
- **[R1]** DeepSeek-AI (2025). [*DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*](https://arxiv.org/abs/2501.12948). arXiv:2501.12948. Trang arXiv ghi v1 22/1/2025, v2 4/1/2026, và tham chiếu tạp chí *Nature* 645, 633–638 (2025). **Bản đã đọc là v2** (4/1/2026), nên số liệu bên dưới lấy từ v2. Đã đọc tóm tắt, mục 1, 2 (GRPO, phần thưởng, R1-Zero), 3 (quy trình nhiều giai đoạn), 4 (bảng 3), phần hạn chế. Chưa đối chiếu v1.
- **[V32]** DeepSeek-AI (2025). [*DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models*](https://arxiv.org/abs/2512.02556). arXiv:2512.02556 (v1, 2/12/2025, chỉ có v1). **Chỉ đọc trang tóm tắt**, chưa đọc nội dung.
- **[WANG]** Wang, L., Gao, H., Zhao, C., Sun, X., Dai, D. (2024). [*Auxiliary-Loss-Free Load Balancing Strategy for Mixture-of-Experts*](https://arxiv.org/abs/2408.15664). arXiv:2408.15664 (v1, 28/8/2024). Paper gốc của cách cân bằng tải bằng bias mà [V3] dùng. Đã đọc trang tóm tắt (24/10/2026): tóm tắt viết loss phụ lớn "will introduce non-negligible interference gradients into training", tức đưa vào gradient gây nhiễu và làm giảm chất lượng. Bài dẫn nguồn này cho câu "loss phụ làm nhiễu gradient".
- **[V4]** *(Không dùng trong bài, quyết định 61.)* DeepSeek-AI (2026). [*DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence*](https://arxiv.org/abs/2606.19348). Trang arXiv ghi nộp 26/4/2026 (v1) nhưng mã `2606.…` không khớp tháng 4 (xem "Chưa xác minh"). **Chỉ đọc trang tóm tắt và thẻ mô hình**, chưa đọc nội dung.
- **[HF]** Thẻ mô hình Hugging Face (chỉ để lấy giấy phép): [DeepSeek-V3](https://huggingface.co/deepseek-ai/DeepSeek-V3), [DeepSeek-R1](https://huggingface.co/deepseek-ai/DeepSeek-R1), [DeepSeek-V4-Pro](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro) (thẻ V4 không dùng trong bài, quyết định 61).

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Mã arXiv của [V4] *(không dùng trong bài, quyết định 61)* | Trang arXiv ghi nộp 26/4/2026 nhưng ID `2606.19348`; thẻ mô hình Hugging Face cũng dẫn đúng ID này. Một mã `2606` thường là tháng 6. Chưa rõ lỗi ở đâu. | Nếu nhắc V4, ghi "báo cáo kỹ thuật, arXiv:2606.19348, trang arXiv ghi nộp 26/4/2026". Hoặc chỉ nhắc ngắn một câu và dẫn link. Người dùng có thể tự mở link để kiểm |
| Nội dung [V32] và [V4] | Chỉ đọc tóm tắt. Các ý bên dưới (DSA, CSA/HCA, mHC, Muon) là **tên kỹ thuật mà tóm tắt nêu**, chưa đọc cơ chế | Chỉ nêu tên và một câu mục đích như tóm tắt viết. Không có công thức, không có số benchmark |
| Ngày phát hành mô hình (khác ngày nộp paper) | Thẻ Hugging Face không ghi ngày phát hành. Chỉ có ngày nộp arXiv | Dùng ngày nộp arXiv (ghi rõ "ngày nộp paper") |
| Các phiên bản không có paper trong lần tra này (V2.5, V3-0324, R1-0528, V3.1, V3.2-Exp, các mô hình khác) | Không tra | Không nêu, đúng phạm vi yêu cầu |
| Điều khoản giấy phép | Chưa đọc văn bản giấy phép | Chỉ nêu tên giấy phép theo thẻ mô hình (mục "Giấy phép"). Không tóm tắt điều khoản |
| Mốc "V3 là đầu tiên dùng FP8 ở quy mô cực lớn" | Là lời **tự nhận** của [V3] ("for the first time, validate…") | Ghi "theo báo cáo của chính tác giả" |
| Sự khác nhau giữa [R1] v1 và v2 (số, cách trình bày) | Chưa đối chiếu | Dùng số của v2 và nói "bản đăng trên *Nature*/v2". Không so với v1 |
| Tên hội nghị của [MOE] và [MATH] | Chỉ xác minh trang arXiv | Ghi "arXiv, năm" |
| Hạng vượt trội của DeepSeek so với mô hình khác | Là kết quả benchmark do tác giả báo cáo | Nếu nêu, ghi kèm paper và năm, không viết "tốt nhất" |

## Ý chính

Dòng thời gian (ngày nộp paper trên arXiv; V2, V3 chỉ biết tháng):

| Mốc | Paper | Điểm mới |
|---|---|---|
| 11/1/2024 | DeepSeekMoE [MOE] | Expert chia nhỏ, expert dùng chung |
| 5/2/2024 (v3 27/4/2024) | DeepSeekMath [MATH] | GRPO |
| 5/2024 | DeepSeek-V2 [V2] | MLA, dùng DeepSeekMoE, định tuyến giới hạn thiết bị |
| 12/2024 | DeepSeek-V3 [V3] | Cân bằng tải không dùng loss phụ, MTP, huấn luyện FP8 |
| 22/1/2025 | DeepSeek-R1 [R1] | RL thuần với phần thưởng theo luật (R1-Zero), quy trình nhiều giai đoạn |
| 2/12/2025 | DeepSeek-V3.2 [V32] | Chỉ nêu: tóm tắt nói kiến trúc thêm DeepSeek Sparse Attention (DSA) |
| 26/4/2026 (theo trang arXiv) | DeepSeek-V4 [V4] | *(Không dùng trong bài, quyết định 61.)* Tóm tắt nêu tên attention lai CSA/HCA, mHC, Muon |

(Ngày v1 của [MATH] là 5/2/2024, đã kiểm trên trang arXiv.)

**Mạch chung của bài.** DeepSeek không đổi hẳn kiến trúc Transformer (`llama-family`). Mỗi paper tối ưu một điểm nghẽn: **bộ nhớ và tính toán khi suy luận** (MoE, MLA), **chi phí huấn luyện** (cân bằng tải, FP8, MTP) và **cách dạy mô hình suy luận** (GRPO, R1). Điểm nên nói với người đọc: phần lớn đây là kỹ thuật kết hợp từ nhiều nguồn; paper tự nói rõ gốc (ví dụ expert dùng chung gắn với Rajbhandari 2022, MTP lấy cảm hứng từ Gloeckle 2024).

**DeepSeekMoE [MOE].**
- MoE (mixture of experts): thay một FFN bằng nhiều FFN nhỏ (expert) và một bộ định tuyến (router). Mỗi token chỉ đi qua vài expert, nên tổng tham số lớn mà tính toán mỗi token nhỏ. Khớp với `MoeFigure`.
- Vấn đề paper nêu ở MoE kiểu GShard (chọn top-2 trong $N$ expert): mỗi expert phải học kiến thức rất lẫn lộn, khó chuyên môn hóa, và nhiều expert học lặp lại kiến thức chung.
- **Chia nhỏ expert (fine-grained segmentation).** Chia mỗi expert thành $m$ expert nhỏ (chiều ẩn FFN còn $1/m$), đồng thời chọn nhiều hơn $m$ lần expert để tính toán không đổi. Số tổ hợp tăng mạnh: với 16 expert chọn 2 có $\binom{16}{2}=120$ tổ hợp; chia mỗi expert thành 4 (64 expert, chọn 8) có $\binom{64}{8}=4\,426\,165\,368$ (paper nêu đúng hai số này; đã kiểm bằng Python).
- **Expert dùng chung (shared expert isolation).** Dành $K_s$ expert mà **mọi token đều đi qua**, không qua router, để chúng giữ kiến thức chung. Số expert định tuyến được chọn giảm $K_s$ để tính toán không đổi. Paper ghi mầm mống của ý này thuộc Rajbhandari và cộng sự (2022), khác ở chỗ họ nhìn từ góc độ thuật toán chứ không từ kỹ thuật hệ thống.
- **Cân bằng tải.** Router tự học dễ bị "sụp định tuyến" (routing collapse): chỉ vài expert được chọn, số còn lại không được huấn luyện; và nếu expert nằm trên nhiều thiết bị thì mất cân bằng tạo nút thắt tính toán. [MOE] dùng hai loss phụ: mức expert (hệ số $\alpha_1$ nhỏ) và mức thiết bị (hệ số $\alpha_2$ lớn hơn).
- Cấu hình DeepSeekMoE 16B: 2 expert dùng chung và 64 expert định tuyến (mỗi expert bằng 0,25 lần FFN chuẩn), mỗi token đi qua 2 expert dùng chung và 6 trong 64; tổng khoảng 16,4B tham số, khoảng 2,8B được kích hoạt. Tóm tắt báo cáo: bản 16B ngang LLaMA2 7B với khoảng 40% tính toán (bảng 4 ghi 39,6% so với LLaMA2 7B). Đây là kết quả của paper trên bộ benchmark của họ.

**DeepSeek-V2 [V2].**
- 236B tham số, 21B được kích hoạt cho mỗi token, ngữ cảnh 128K, tiền huấn luyện 8,1T token. Mỗi lớp MoE (trừ lớp đầu) có 2 expert dùng chung và 160 expert định tuyến, mỗi token chọn 6 expert định tuyến.
- **MLA (multi-head latent attention): nén KV.** Thay vì lưu K và V cho từng đầu, ta nén đầu vào $\mathbf{h}_t$ thành **một vectơ ẩn $\mathbf{c}_t$** có số chiều nhỏ ($d_c\ll n_h d_h$) và **chỉ lưu vectơ này** trong KV cache. K và V được khôi phục bằng hai ma trận "mở rộng". Khi suy luận, các ma trận mở rộng có thể được gộp vào các phép nhân khác nên không cần dựng K, V đầy đủ. So với GQA ở `llama-family`: GQA giảm KV cache bằng cách **dùng chung** đầu K/V; MLA giảm bằng cách **nén**.
- **Vấn đề RoPE.** RoPE nhạy vị trí nên không "gộp" được vào bước mở rộng. Cách giải của paper: "decoupled RoPE", dùng thêm một phần nhỏ chiều ($d_h^R=64$) chỉ để mang thông tin vị trí, và phần này cũng được lưu vào cache. Đây là chi tiết có thể chỉ nêu một câu.
- **Định tuyến giới hạn thiết bị.** Mỗi token chỉ gửi tới tối đa $M$ thiết bị: trước hết chọn $M$ thiết bị có điểm khớp cao nhất, sau đó chọn top-$K$ trong các expert của chúng. $M=3$ trong cấu hình huấn luyện, và theo paper kết quả "gần ngang" định tuyến top-$K$ không giới hạn.
- Kết quả tóm tắt, **so với DeepSeek 67B (mô hình dày của chính họ)**: tiết kiệm 42,5% chi phí huấn luyện, giảm KV cache 93,3%, thông lượng sinh tối đa gấp 5,76 lần. Cần ghi rõ mốc so sánh.

**DeepSeek-V3 [V3].**
- 671B tham số, 37B được kích hoạt, 14,8T token tiền huấn luyện, 61 lớp, chiều ẩn 7168; 128 đầu, mỗi đầu 128 chiều; $d_c=512$, $d_h^R=64$; MoE trừ ba lớp đầu, mỗi lớp 1 expert dùng chung và 256 expert định tuyến (chiều ẩn 2048), mỗi token chọn 8, và gửi tới tối đa 4 node. Mở rộng ngữ cảnh hai giai đoạn: 32K rồi 128K.
- **Cân bằng tải không dùng loss phụ** (phương pháp của [WANG]). Loss phụ nếu quá lớn làm hại chất lượng; [WANG] giải thích là nó đưa gradient gây nhiễu vào huấn luyện. [V3] thêm một **số hạng lệch (bias) $b_i$ cho mỗi expert**, chỉ dùng khi **chọn** top-$K$; còn **trọng số cổng** vẫn tính từ điểm gốc. Cuối mỗi bước huấn luyện, nhìn tải của cả lô: expert quá tải thì giảm $b_i$ một lượng $\gamma$, expert vắng thì tăng $b_i$ một lượng $\gamma$ ($\gamma$ là "tốc độ cập nhật bias"; paper dùng 0,001 cho 14,3T token đầu, rồi 0,0). Vẫn có thêm một loss cân bằng theo chuỗi, hệ số cực nhỏ (0,0001), chỉ để tránh mất cân bằng quá mức trong một chuỗi. Điểm cổng tính bằng sigmoid (V2 dùng softmax), rồi chuẩn hóa giữa các expert đã chọn.
- **MTP (multi-token prediction).** Ngoài dự đoán token kế tiếp, mỗi vị trí còn dự đoán thêm token xa hơn để tăng tín hiệu huấn luyện. Khác bản trước (Gloeckle 2024) dự đoán song song bằng các đầu độc lập, V3 dự đoán **tuần tự** và giữ chuỗi nhân quả ở mỗi độ sâu. Dùng một mô-đun MTP (độ sâu $D=1$): tức dự đoán thêm một token. Mô-đun MTP dùng chung embedding và đầu ra với mô hình chính. Khi suy luận có thể **bỏ** mô-đun MTP, hoặc dùng cho giải mã suy đoán (speculative decoding): paper báo cáo token thứ hai được chấp nhận 85–90%, tăng tốc độ giải mã 1,8 lần. Trọng số loss MTP $\lambda$: 0,3 cho 10T token đầu, 0,1 cho phần còn lại.
- **FP8.** Phần lớn phép nhân ma trận lớn chạy ở FP8 (định dạng E4M3 cho mọi tensor), một số phép vẫn giữ độ chính xác cao. Co giãn theo ô nhỏ: kích hoạt theo ô $1\times128$ (mỗi token, 128 kênh), trọng số theo khối $128\times128$; cộng dồn có độ chính xác cao hơn. Paper báo cáo sai số tương đối của loss so với BF16 dưới 0,25% (thí nghiệm trên hai cỡ mô hình nhỏ hơn, khoảng 1T token). Tác giả tự nói đây là lần đầu kiểm chứng FP8 ở quy mô cực lớn.
- **Chi phí (bảng 1 của [V3]).** Tổng **2,788M giờ GPU H800** (2,664M tiền huấn luyện, 0,119M mở rộng ngữ cảnh, 0,005M hậu huấn luyện). **Giả định thuê 2 USD mỗi giờ GPU thì khoảng 5,576 triệu USD.** Paper nói rõ con số này **chỉ tính lần huấn luyện chính thức, không gồm nghiên cứu và thí nghiệm trước đó**. Bài phải ghi kèm lời chú này.
- Hậu huấn luyện của V3 có chắt lọc (distill) khả năng suy luận từ họ R1.

**GRPO [MATH].**
- GRPO (group relative policy optimization) là một biến thể của PPO (xem `rlhf`, PPO ở mức trực giác). PPO cần thêm **mô hình giá trị (critic)** cỡ ngang chính sách để làm baseline cho advantage: tốn bộ nhớ và tính toán. GRPO bỏ critic: với mỗi câu hỏi, **lấy mẫu một nhóm $G$ câu trả lời** từ chính sách cũ, rồi dùng **thống kê trong nhóm** làm baseline.
- Lập luận paper nêu cho "vì sao hợp": phần thưởng thường chỉ chấm ở token cuối, khó huấn luyện critic chính xác ở từng token; và mô hình phần thưởng vốn được huấn luyện trên **so sánh giữa các câu trả lời cùng một câu hỏi**, nên advantage tương đối trong nhóm phù hợp tính chất đó.
- KL: PPO trong RLHF cộng phạt KL vào phần thưởng; GRPO **cộng trực tiếp KL giữa chính sách đang học và chính sách tham chiếu vào mục tiêu**, nên không làm phức tạp việc tính advantage. Ước lượng KL dùng bộ ước lượng không chệch, luôn không âm (xem công thức).
- Giám sát theo kết quả (outcome supervision): chấm điểm câu trả lời cuối; mọi token của câu trả lời nhận **cùng một advantage**. [MATH] còn có giám sát theo quá trình (từng bước); R1 không dùng.

**DeepSeek-R1 [R1].**
- Dùng GRPO trên nền DeepSeek-V3-Base. **R1-Zero:** RL thuần, **không có bước SFT trước**; phần thưởng chỉ dựa trên việc câu trả lời cuối có đúng không, không ràng buộc quá trình suy luận. Mẫu lời nhắc chỉ ép cấu trúc: suy luận trước, đáp án sau.
- **Phần thưởng theo luật (rule-based):** (1) thưởng đúng: bài toán có đáp án xác định thì yêu cầu ghi đáp án theo định dạng (ví dụ trong hộp) để kiểm tra bằng luật; bài code thì dùng trình biên dịch và các ca kiểm thử; (2) thưởng định dạng: ép phần suy luận nằm trong cặp thẻ nhất định. Hai phần cộng với trọng số bằng nhau. Paper nói họ **không dùng mô hình phần thưởng thần kinh** (kể cả theo kết quả hay theo quá trình) cho bài suy luận, vì dễ bị reward hacking khi RL quy mô lớn và đắt khi phải huấn luyện lại.
- Kết quả R1-Zero (báo cáo của paper): AIME 2024 pass@1 tăng từ 15,6% lên 77,9% trong quá trình RL; độ dài câu trả lời tăng dần; xuất hiện hành vi tự kiểm tra, suy nghĩ lại ("aha moment" ở một phiên bản trung gian là lời của paper). Thiết lập huấn luyện R1-Zero: tốc độ học $3\times10^{-6}$, hệ số KL 0,001, nhiệt độ lấy mẫu 1, **16 câu trả lời cho mỗi câu hỏi**, 32 câu hỏi mỗi bước (lô 512), tổng 10 400 bước.
- Hạn chế của R1-Zero (paper): đọc khó, trộn tiếng Anh và tiếng Trung trong một chuỗi suy luận, yếu ở các việc ngoài suy luận.
- **R1 (quy trình nhiều giai đoạn):** (1) SFT với **vài nghìn** mẫu "khởi động lạnh" (cold start) có lối suy nghĩ dễ đọc; (2) RL thiên về suy luận, có thêm thưởng nhất quán ngôn ngữ; (3) lấy mẫu từ chối và SFT lần nữa với cả dữ liệu suy luận lẫn không suy luận; (4) RL giai đoạn hai để mô hình hữu ích và vô hại.
- Bảng 3 của [R1] (v2): AIME 2024 pass@1 của R1 là 79,8% (R1-Zero 77,9%); Codeforces rating 2029 (R1-Zero 1444); MMLU 90,8%. Là kết quả của paper, trên cách đánh giá của họ.
- Chắt lọc: paper nói đã chắt lọc năng lực sang các mô hình nhỏ hơn (R1-Distill, nền Qwen và Llama; thẻ mô hình liệt kê các cỡ 1,5B đến 70B). Phần này ngoài trọng tâm của bài (bài `evaluation-peft` có chắt lọc).
- Phần hạn chế mục kết luận có nêu: đầu ra có cấu trúc và dùng công cụ còn yếu, hiệu quả token chưa tối ưu. Nên đưa vào "Lỗi hay gặp" hoặc "Tóm tắt" như một lưu ý.

**Sau R1 (chỉ nêu, không đi sâu; chỉ đọc tóm tắt).**
- [V32], 2/12/2025: theo tóm tắt, điểm mới về kiến trúc là DeepSeek Sparse Attention (DSA) nhằm giảm chi phí ngữ cảnh dài, cùng quy trình RL mở rộng và dữ liệu cho tác vụ có công cụ.
- *(Không dùng trong bài, quyết định 61.)* [V4], nộp 26/4/2026 theo trang arXiv: tóm tắt nêu hai mô hình MoE (Pro: 1,6T tham số, 49B kích hoạt; Flash: 284B, 13B), ngữ cảnh 1 triệu token, attention lai (CSA, HCA), mHC, bộ tối ưu Muon, tiền huấn luyện hơn 32T token. Tác giả gọi là bản xem trước (preview).
- Gợi ý: một bảng mốc thời gian ngắn ở cuối phần lý thuyết là đủ, bài không giải thích cơ chế của V3.2 và V4.

**Giấy phép (theo thẻ mô hình; chưa đọc văn bản).**
- DeepSeek-V3: mã nguồn theo giấy phép MIT; trọng số theo "Model License" (nhãn "Model Agreement"), không phải MIT.
- DeepSeek-R1: thẻ ghi mã và trọng số theo MIT. Thẻ cũng nói bản chắt lọc dựa trên Qwen-2.5 (Apache 2.0) và Llama 3.1/3.3 (giấy phép Llama), tức giấy phép của mô hình nền vẫn áp dụng.
- *(Không dùng trong bài, quyết định 61.)* DeepSeek-V4-Pro: thẻ ghi mã và trọng số theo MIT.
- V2: không tra. Bài chỉ nêu "xem giấy phép gốc của từng bản trước khi dùng".

## Công thức quan trọng

Ký hiệu theo site và theo bài: vectơ chữ đậm, độ dài chuỗi $L$ (không dùng $T$ cho độ dài, vì $T$ là nhiệt độ), chiều ẩn $d$. Để tránh trùng, **$G$ là kích thước nhóm của GRPO**; theo cách viết của [V3] (bài dùng y như vậy), $N_s$ là số expert dùng chung, $N_r$ là số expert định tuyến, $K_r$ là số expert định tuyến được chọn mỗi token. [MOE] viết $mN$, $mK$, $K_s$ cho $N_s+N_r$, $N_s+K_r$, $N_s$. Paper dùng $T$ cho số token trong một lô ở công thức cân bằng tải; bài dùng $B$.

**MoE, một token** ($\mathbf{u}$ là đầu vào của lớp FFN, $\mathbf{e}_i$ là vectơ "trung tâm" của expert $i$; [V3] pt. (12), tương đương [MOE] pt. (9)–(11)):

$$\mathbf{h}=\mathbf{u}+\sum_{i=1}^{N_s}\mathrm{FFN}^{(s)}_i(\mathbf{u})+\sum_{i=1}^{N_r}g_i\,\mathrm{FFN}^{(r)}_i(\mathbf{u})$$

Điểm khớp $s_i=\mathrm{Softmax}_i(\mathbf{u}^\top\mathbf{e}_i)$ (V2, [MOE]); cổng giữ lại chỉ ở top-$K_r$:

$$g_i=\begin{cases}s_i,& s_i\in\mathrm{TopK}(\{s_j\mid 1\le j\le N_r\},\,K_r)\\ 0,&\text{otherwise}\end{cases}$$

Giải thích bằng lời: $N_s$ expert dùng chung **luôn** chạy (không có cổng). Trong $N_r$ expert định tuyến chỉ $K_r$ expert có điểm cao nhất được chạy, và đầu ra được nhân với điểm của chúng. Số tham số tăng theo $N_r$, nhưng số FFN chạy mỗi token chỉ là $N_s+K_r$. Số hạng $+\mathbf{u}$ là kết nối dư.

**V3 thay phần điểm cổng** ([V3] pt. (12)–(16), phương pháp của [WANG]): điểm bằng sigmoid $s_i=\sigma(\mathbf{u}^\top\mathbf{e}_i)$, cổng được chuẩn hóa giữa các expert đã chọn, còn việc **chọn** dùng điểm cộng bias:

$$g_i=\frac{g'_i}{\sum_{j=1}^{N_r}g'_j},\qquad g'_i=\begin{cases}s_i,& s_i+b_i\in\mathrm{TopK}(\{s_j+b_j\mid 1\le j\le N_r\},\,K_r)\\0,&\text{otherwise}\end{cases}$$

Cập nhật bias sau mỗi bước: $b_i\leftarrow b_i-\gamma$ nếu expert $i$ quá tải, $b_i\leftarrow b_i+\gamma$ nếu thiếu tải. Bias **không** đi vào trọng số cổng; nó chỉ đổi expert nào được chọn. (Đây là cách tả theo văn xuôi của paper. Cách đo "quá tải" trong cài đặt thật là tải của cả lô.)

**Loss cân bằng mức expert của [MOE]** (dùng để giải thích vì sao V3 muốn bỏ nó; $B$ token; bài chỉ tả bằng lời, không đưa công thức):

$$\mathcal{L}_{\text{ExpBal}}=\alpha_1\sum_{i=1}^{N_r}f_iP_i,\quad f_i=\frac{N_r}{K_rB}\sum_{t=1}^{B}\mathbb{1}(\text{token }t\text{ chọn expert }i),\quad P_i=\frac1B\sum_{t=1}^{B}s_{i,t}$$

$f_i$ là tỉ lệ token đi vào expert $i$ (đã chuẩn hóa, bằng 1 nếu cân bằng hoàn hảo) và $P_i$ là điểm trung bình router gán cho expert $i$. Tích $f_iP_i$ lớn khi expert vừa nhận nhiều token vừa được router chuộng; giảm tổng này đẩy tải về đều.

**MLA, nén KV** ([V2] pt. (9)–(11); bỏ phần RoPE tách riêng): $\mathbf{c}_t$ là vectơ ẩn nén, $d_c$ chiều:

$$\mathbf{c}_t=\mathbf{W}^{DKV}\mathbf{h}_t,\qquad \mathbf{k}_t=\mathbf{W}^{UK}\mathbf{c}_t,\qquad \mathbf{v}_t=\mathbf{W}^{UV}\mathbf{c}_t$$

Chỉ $\mathbf{c}_t$ được lưu trong cache.

**KV cache cho một token** ([V2] bảng 1; $n_h$ đầu, $d_h$ chiều mỗi đầu, $N_{\text{layer}}$ lớp, $n_g$ nhóm của GQA; số phần tử, không phụ thuộc độ chính xác):

| Cơ chế | Số phần tử mỗi token |
|---|---|
| MHA | $2\,n_h d_h N_{\text{layer}}$ |
| GQA | $2\,n_g d_h N_{\text{layer}}$ |
| MQA | $2\,d_h N_{\text{layer}}$ |
| MLA | $(d_c+d_h^R)\,N_{\text{layer}}$ |

V2 chọn $d_c=4d_h$ và $d_h^R=d_h/2$, nên cache bằng $4{,}5\,d_hN_{\text{layer}}$, tức bằng GQA với **2,25 nhóm** (paper nêu đúng điều này), và paper nói chất lượng mạnh hơn MHA. **Tự tính** với số của [V3] (128 đầu, $d_h=128$, $d_c=512$, $d_h^R=64$, 61 lớp): MLA $=576\times61=35\,136$ phần tử; nếu dùng MHA thường $=2\times128\times128\times61=1\,998\,848$; tỉ lệ khoảng 56,9 lần nhỏ hơn. Đây là so sánh trên giấy với cùng số đầu, không phải số đo; nó **khác** con số 93,3% của [V2] (so với DeepSeek 67B, mô hình khác, dùng GQA). Đừng trộn hai số.

**MTP** ([V3] pt. (21)–(25)). $D$ mô-đun nối tiếp; mô-đun $k$ nhận biểu diễn ở độ sâu trước và embedding của token $(i+k)$, dự đoán token $(i+k+1)$. Loss mỗi độ sâu là cross-entropy trên token đó, trung bình các độ sâu nhân $\lambda$:

$$\mathcal{L}_{\text{MTP}}^{k}=-\frac1L\sum_{i=2+k}^{L+1}\log P_i^{k}[t_i],\qquad \mathcal{L}_{\text{MTP}}=\frac{\lambda}{D}\sum_{k=1}^{D}\mathcal{L}_{\text{MTP}}^{k}$$

($L$ là độ dài chuỗi đầu vào; $t_i$ là token thật ở vị trí $i$.) Bằng lời: thêm một phần mất mát "đoán token xa hơn". Với $D=1$, $k=1$: mỗi vị trí đoán thêm token ngay sau token kế tiếp.

**GRPO** ([R1] pt. (1)–(3), [MATH] pt. (3)–(4)). Với câu hỏi $q$, lấy mẫu nhóm $\{o_1,\dots,o_G\}$ từ chính sách cũ $\pi_{\theta_{\text{old}}}$; chấm điểm $r_1,\dots,r_G$. Advantage:

$$\hat{A}_i=\frac{r_i-\mathrm{mean}(\{r_1,\dots,r_G\})}{\mathrm{std}(\{r_1,\dots,r_G\})}$$

Mục tiêu (cực đại hóa; $\varepsilon$ và $\beta$ là siêu tham số; [R1] pt. (1) viết ở mức cả câu trả lời, [MATH] pt. (3) viết ở mức token và lấy trung bình theo $|o_i|$; mức token cho cùng một $\hat{A}_i$ ở mọi token của câu $i$):

$$\mathcal{J}(\theta)=\mathbb{E}\Big[\frac1G\sum_{i=1}^{G}\Big(\min\big(\rho_i\hat{A}_i,\ \mathrm{clip}(\rho_i,1-\varepsilon,1+\varepsilon)\hat{A}_i\big)-\beta\,\mathbb{D}_{\mathrm{KL}}(\pi_\theta\,\|\,\pi_{\text{ref}})\Big)\Big],\quad \rho_i=\frac{\pi_\theta(o_i\mid q)}{\pi_{\theta_{\text{old}}}(o_i\mid q)}$$

$$\mathbb{D}_{\mathrm{KL}}(\pi_\theta\,\|\,\pi_{\text{ref}})=\frac{\pi_{\text{ref}}(o_i\mid q)}{\pi_\theta(o_i\mid q)}-\log\frac{\pi_{\text{ref}}(o_i\mid q)}{\pi_\theta(o_i\mid q)}-1$$

Đọc: phần $\min(\cdot,\mathrm{clip})$ là kẹp của PPO (`rlhf`). Khác PPO ở chỗ **$\hat{A}_i$ lấy từ nhóm**, không từ critic. Bộ ước lượng KL luôn $\ge 0$ (vì $x-\log x-1\ge0$ với $x>0$).

Tính chất dễ kiểm (đã kiểm trong ô NumPy bên dưới): advantage trong một nhóm có **trung bình 0 và độ lệch chuẩn 1**; nhân mọi phần thưởng với một hằng dương không đổi advantage; nếu mọi phần thưởng bằng nhau (ví dụ cả nhóm đều sai) thì $\mathrm{std}=0$, tử bằng 0: advantage bằng 0 (cài đặt thêm $\epsilon$ nhỏ vào mẫu số để khỏi chia cho 0; paper không nói đến chi tiết này, đây là cách xử lý của ô minh họa).

**Phần thưởng theo luật của R1-Zero** ([R1] pt. (4)):

$$\text{rule}=\text{acc}+\text{format}$$

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; "(gợi ý)" là của `summarizer`.

- **MoE như bệnh viện nhiều khoa (gợi ý, nối `MoeFigure`).** Không ai khám đủ mọi khoa: mỗi bệnh nhân (token) được lễ tân (router) chuyển tới vài bác sĩ chuyên khoa (expert). Bệnh viện có rất nhiều bác sĩ (tổng tham số lớn), nhưng mỗi ca chỉ dùng vài người (tính toán nhỏ). **Chia nhỏ expert** như đổi từ vài khoa lớn thành nhiều chuyên khoa hẹp, và một ca khám có thể ghép nhiều chuyên khoa hơn. **Expert dùng chung** như khoa khám tổng quát: ai cũng qua, nên các khoa chuyên sâu không phải mỗi nơi dạy lại điều cơ bản.
- **Số tổ hợp.** 120 so với hơn 4,4 tỉ: cách rất nhanh để người đọc thấy chia nhỏ expert cho mô hình "nhiều cách ghép" hơn nhiều ở cùng chi phí.
- **Tổng tham số không bằng chi phí (gợi ý).** V3: 671B tham số nhưng mỗi token chỉ kích hoạt 37B (khoảng 5,5%; tự tính $37/671$). Nhắc rằng **bộ nhớ vẫn phải chứa toàn bộ** 671B tham số, chỉ **tính toán** mỗi token mới nhỏ. Đây là chỗ hay hiểu nhầm.
- **Bias cân bằng tải như loa phân luồng (gợi ý).** Quầy nào đông thì tạm hạ biển chỉ dẫn ("đông, hãy sang quầy khác"), quầy vắng thì nâng lên. Quan trọng: chỉ đổi **ai được chọn**, không đổi **mỗi người được trọng số bao nhiêu** trong kết quả cuối, nên không "bóp méo" gradient như loss phụ. (Nói thận trọng: "không bóp méo" là cách giải thích của người viết bài; paper chỉ nói loss phụ quá lớn làm hại chất lượng.)
- **MLA như nén ảnh trước khi cất (gợi ý).** GQA cất ít bản sao hơn; MLA cất bản **nén** rồi giải nén khi cần. Cách tự tính ở trên (35 136 so với khoảng 2 triệu phần tử mỗi token) cho cảm giác quy mô; nhớ nói đây là phép tính với cùng số đầu.
- **MTP như đọc trước vài chữ (gợi ý).** Khi học, mô hình bị bắt đoán cả chữ kế tiếp lẫn chữ sau nữa, nên phải "lập kế hoạch" xa hơn một chút. Khi dùng thật có thể bỏ phần phụ, hoặc dùng làm "bản nháp" cho giải mã suy đoán (khớp 85–90% theo [V3]).
- **GRPO như chấm điểm theo lớp (gợi ý).** Thầy cho cả lớp 8 bạn cùng một đề; thay vì chấm theo thang tuyệt đối, ta hỏi "bạn này hơn trung bình lớp bao nhiêu độ lệch chuẩn?". Bạn làm đúng khi cả lớp ít người đúng được thưởng nhiều (ô NumPy: 3 trong 8 đúng cho +1,291 mỗi bạn đúng, −0,775 mỗi bạn sai; 1 trong 8 đúng cho +2,646). Cả lớp cùng sai thì không ai được gì. Không cần "thầy phụ" (critic) đoán điểm trước.
- **R1-Zero: dạy bằng đúng sai (gợi ý).** Không dạy cách giải, chỉ nói "đáp án đúng hay sai"; mô hình tự thử nhiều lần và giữ lại các lối đi dẫn tới đúng. Nối với `RlhfStagesFigure`: RLHF cần mô hình phần thưởng học từ người; R1-Zero dùng **luật kiểm tra được** (đáp án toán, ca kiểm thử), nên không có reward model để bị lừa. Giới hạn: chỉ hợp với bài có đáp án kiểm tra được.
- **Phân biệt với `dpo`.** DPO bỏ bước RL; GRPO **giữ RL** nhưng bỏ critic. Khác nhau về chỗ bỏ.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Nghĩ mô hình 671B chạy với chi phí và bộ nhớ của 37B.** 37B là số tham số được **kích hoạt** mỗi token; bộ nhớ vẫn phải giữ đủ 671B tham số, và các expert nằm rải ở nhiều GPU nên còn tốn liên lạc (nên có định tuyến giới hạn thiết bị/node).
2. **Hiểu "5,576 triệu USD" là tổng chi phí làm DeepSeek-V3.** Là giá giả định (2 USD/giờ GPU) cho **lần huấn luyện chính thức** (2,788M giờ GPU H800), **không** gồm nghiên cứu, thí nghiệm bỏ đi, dữ liệu, nhân sự [V3 mục 1].
3. **Gán mọi thứ cho DeepSeek.** MoE có từ lâu (Shazeer 2017 và các paper khác); expert dùng chung, MTP, GRPO (biến thể PPO) đều có tiền thân mà chính paper dẫn. Bài nên nói rõ "DeepSeek kết hợp và tối ưu".
4. **Nhầm "chia nhỏ expert" với "thêm expert".** Tổng tham số expert **không đổi**; mỗi expert nhỏ đi $m$ lần và mỗi token chọn nhiều hơn $m$ lần [MOE].
5. **Nhầm hai loại bias.** Bias $b_i$ của cân bằng tải chỉ dùng khi **chọn** expert; trọng số cổng vẫn tính từ điểm gốc. Không phải bias của lớp tuyến tính.
6. **Hiểu "không dùng loss phụ" nghĩa là hoàn toàn không có cân bằng nào khác.** V3 vẫn có loss cân bằng theo chuỗi với hệ số cực nhỏ (0,0001), và vẫn có giới hạn node [V3].
7. **Trộn con số 93,3% của V2 với phép tính trên giấy.** 93,3% là so với DeepSeek 67B; còn tỉ lệ nén nếu so cùng số đầu là một phép tính khác (xem mục công thức). Ghi rõ mốc so sánh.
8. **Nghĩ MLA chỉ là "GQA khác tên".** GQA chia sẻ K/V giữa các đầu; MLA nén thành vectơ ẩn rồi mở rộng, và cần xử lý RoPE riêng (decoupled RoPE) vì RoPE phụ thuộc vị trí và không gộp được vào phép mở rộng [V2].
9. **Nghĩ MTP luôn được dùng khi suy luận.** Mục tiêu chính của MTP trong V3 là cải thiện huấn luyện; khi suy luận có thể bỏ mô-đun hoặc dùng cho giải mã suy đoán [V3].
10. **Nhầm GRPO với "không có RL" hay "không cần phần thưởng".** GRPO vẫn cần phần thưởng cho từng câu trả lời; chỉ bỏ mô hình giá trị. Advantage tính trong nhóm nên **nhóm quá nhỏ hoặc cả nhóm cùng điểm cho tín hiệu bằng 0**.
11. **Nghĩ advantage của GRPO "tuyệt đối".** Nó chỉ là **thứ hạng tương đối trong nhóm**: cùng một câu trả lời có advantage khác nhau khi đặt vào nhóm khác. Nhân phần thưởng với hằng dương không đổi gì.
12. **Nhầm "RL thuần" với "không có dữ liệu".** R1-Zero không SFT trước, nhưng bắt đầu từ DeepSeek-V3-Base đã tiền huấn luyện (14,8T token) và cần câu hỏi có đáp án kiểm tra được [R1].
13. **Nghĩ phần thưởng theo luật dùng được cho mọi việc.** Chỉ cho bài kiểm tra được (toán có đáp án, code có ca kiểm thử). Paper tự nêu hạn chế: R1-Zero yếu ở các việc khác, nên R1 mới phải qua nhiều giai đoạn.
14. **Nhầm R1-Zero và R1.** R1-Zero: RL thuần, đọc khó, trộn ngôn ngữ. R1: có dữ liệu khởi động lạnh, thưởng nhất quán ngôn ngữ, SFT và RL nhiều giai đoạn [R1].
15. **Nhầm "DeepSeek-R1" với các bản chắt lọc.** Thẻ mô hình cho thấy R1-Distill là mô hình **Qwen hoặc Llama đã được fine-tune** bằng dữ liệu do R1 sinh ra, kích thước nhỏ hơn rất nhiều; đó không phải kiến trúc MoE của R1.
16. **"Mã MIT" nghĩa là trọng số MIT.** Với V3, mã MIT còn trọng số theo "Model License" riêng. Với R1-Distill, giấy phép nền (Qwen, Llama) vẫn áp dụng. Luôn dẫn người đọc tới giấy phép gốc (thẻ mô hình).
17. **Viết "mới nhất", "mạnh nhất".** Theo `llm-lessons.md` mục 2.6, bài chỉ nhắc mô hình như sự kiện có năm; số benchmark ghi kèm paper và năm.

## Số tự chạy (Pyodide thật, 24/10/2026)

Chạy bằng `node .../tools/runpyo.mjs <file>` từ thư mục worktree (Pyodide trong `node_modules`, NumPy của Pyodide). Hai file đặt ở scratchpad (`ds/moe.py`, `ds/grpo.py`; đường dẫn đầy đủ ở cuối). `lesson-writer` chép vào `src/code/llm/deepseek-family/` rồi chạy lại.

### Ô `PythonRunner` 1: định tuyến top-$K$, tải mỗi expert, cân bằng bằng bias

Ý: $B=64$ token, $N=8$ expert, $K=2$; điểm khớp = sigmoid của logit ngẫu nhiên (`np.random.default_rng(0)`), cộng thêm 1,0 vào expert 0 để cố ý tạo mất cân bằng. Hàm `route(scores, bias, k)` chọn top-$k$ trên `score + bias`, cổng là điểm gốc đã chuẩn hóa trên các expert được chọn (kiểu V3). 200 bước: expert quá tải thì giảm bias, thiếu tải thì tăng bias, mỗi lần 0,01 (dùng `np.sign(load - load.mean())`). Đã chạy thật:

| Đại lượng | Giá trị |
|---|---|
| Tải mỗi expert ở bước 0 (tổng 128 lượt chọn) | `[42 15 6 17 13 12 9 14]` |
| Tải mỗi expert sau 200 bước | `[18 16 18 16 15 16 15 14]` |
| Cổng của token 0 (hai expert được chọn) | `[0.454 0.546]`, tổng 1,0 |
| Số expert mỗi token | luôn bằng 2 |

Đọc: expert 0 nhận 42 trong 128 lượt chọn lúc đầu (chia đều là 16 mỗi expert), sau khi chỉnh bias còn 18. Số expert mỗi token vẫn bằng 2, tức bias chỉ đổi expert nào được chọn. Chạy tức thì (NumPy), khoảng 25 dòng. **Chú ý:** quy tắc cập nhật trong ô (dấu của độ chênh với tải trung bình) là phiên bản đơn giản hóa của mô tả "quá tải thì giảm một lượng $\gamma$, thiếu tải thì tăng $\gamma$" trong [V3]; bài nên ghi rõ "bản đơn giản". Đây là mô phỏng nhỏ, không phải số đo của DeepSeek.

### Ô `PythonRunner` 2: advantage của GRPO trên một nhóm

Ý: hàm `advantages(r, eps=1e-8)` = $(r-\text{mean})/(\text{std}+\epsilon)$ trên $G=8$ câu trả lời; phần thưởng 1 (đúng) hoặc 0 (sai). Đã chạy thật:

| Phép tính | Kết quả |
|---|---|
| Phần thưởng `[1,0,0,1,0,0,0,1]` (3 đúng trên 8) | advantage `[1.291 -0.775 -0.775 1.291 -0.775 -0.775 -0.775 1.291]` |
| Trung bình và độ lệch chuẩn của advantage | 0,0 và 1,0 |
| Cả nhóm sai (8 số 0) | tất cả 0,0 |
| Chỉ 1 đúng trên 8 | đúng: 2,646; mỗi câu sai: −0,378 |
| Nhân phần thưởng với 10 | `np.allclose` là `True` |

Đọc: câu đúng hiếm thì thưởng lớn (+2,646 khi 1 trong 8 đúng, +1,291 khi 3 trong 8); cả nhóm cùng điểm cho advantage 0 (không có tín hiệu học). Độ lệch chuẩn dùng `np.std` mặc định (chia cho $G$, không chia $G-1$); paper không nói rõ, ghi trong bài "độ lệch chuẩn của nhóm". Chạy tức thì, khoảng 15 dòng.

### Số tính tay đã kiểm bằng Python

| Đại lượng | Giá trị |
|---|---|
| $\binom{16}{2}$ và $\binom{64}{8}$ | 120 và 4 426 165 368 (khớp [MOE]) |
| KV cache MLA mỗi token, cấu hình [V3] ($d_c=512$, $d_h^R=64$, 61 lớp) | $(512+64)\times61=35\,136$ phần tử |
| Nếu MHA, cùng số đầu và $d_h$ (128 đầu, 128 chiều) | $2\times128\times128\times61=1\,998\,848$ phần tử, gấp khoảng 56,9 lần |
| Cùng phép tính với cấu hình [V2] (60 lớp) | tỉ lệ 56,9 (lớp triệt tiêu); $1-576/32\,768\approx98{,}2\%$ nhỏ hơn MHA |
| $4{,}5\,d_h$ so với $2\,n_g d_h$ (V2) | $4{,}5\,d_h=576$ khi $d_h=128$; khớp $n_g=2{,}25$ |
| Tỉ lệ kích hoạt của V3 | $37/671\approx5{,}5\%$ |

## Liên quan tới bài nào

- **Cần biết trước:** `llm/llama-family` (RoPE, GQA, KV cache, song song; bài này kế thừa và so với GQA). Gián tiếp `dl/transformers`, `llm/build-first-llm` (decoder, loss cross-entropy), `ml/gradient-descent`.
- **Tham chiếu (không bắt buộc trước):** `llm/rlhf` (PPO, KL, advantage, `RlhfStagesFigure`), `llm/dpo` (bỏ RL; so sánh với GRPO).
- **Sau:** `llm/llm-deployment` (KV cache, MoE khi suy luận trên nhiều GPU: `ParallelismFigure`; nhắc MLA, định tuyến giới hạn thiết bị), `llm/evaluation-peft` (chắt lọc, lượng tử hóa, so sánh FP8), `llm/pretraining-data` (14,8T token của V3).
- **Hình:** `MoeFigure` (docs/architecture/llm-lessons.md mục 2.9): token, router, expert; nên có cả "expert dùng chung" và "expert định tuyến" để khớp lời văn.

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Hỗn hợp chuyên gia | Mixture of experts (MoE) | Giữ "MoE", gloss lần đầu |
| Expert (chuyên gia) | Expert | Giữ "expert" (như router) |
| Bộ định tuyến | Router | Dịch "bộ định tuyến", gloss "router" |
| Expert dùng chung | Shared expert | Dịch |
| Chia nhỏ expert | Fine-grained expert segmentation | Dịch, gloss |
| Sụp định tuyến | Routing collapse | Dịch, gloss |
| Cân bằng tải | Load balancing | Dịch |
| Attention tiềm ẩn đa đầu | Multi-head latent attention (MLA) | Giữ "MLA" |
| Dự đoán nhiều token | Multi-token prediction (MTP) | Giữ "MTP" |
| Giải mã suy đoán | Speculative decoding | Dịch, gloss |
| Tối ưu chính sách tương đối theo nhóm | Group relative policy optimization (GRPO) | Giữ "GRPO" |
| Hàm lợi thế | Advantage | Giữ "advantage" (đã dùng ở `rlhf`; kiểm glossary) |
| Phần thưởng theo luật | Rule-based reward | Dịch |
| Chắt lọc tri thức | Knowledge distillation | Dịch (có ở `evaluation-peft`) |
| Khởi động lạnh | Cold start | Dịch, gloss |
| Giờ GPU | GPU hours | Dịch |

## Điểm cần phiên chính chốt (câu hỏi cho người dùng)

1. **Có nêu V3.2 và V4 không?** Chỉ đọc tóm tắt; V4 có mâu thuẫn mã arXiv. Đề xuất: có, một dòng mỗi bản trong bảng mốc thời gian, kèm link, không giải thích cơ chế.
2. **Kích thước nhóm và độ lệch chuẩn trong ô GRPO:** dùng $G=8$, `np.std` mặc định. Đề xuất giữ (nhỏ, dễ đọc); paper R1-Zero dùng $G=16$.
3. **Số tự tính (tỉ lệ nén MLA 56,9 lần, $37/671\approx5{,}5\%$):** giữ làm ví dụ, ghi "tự tính" và không trộn với 93,3% của V2? Đề xuất giữ.
4. **Có đưa bảng so sánh số liệu paper (V2, V3, R1) không?** Đề xuất: có, bảng ngắn (tham số tổng/kích hoạt, token, số expert) lấy từ mục "Ý chính".

## Đọc thêm đề xuất

Đều đã mở; ghi rõ mức đã đọc.

1. **DeepSeek-AI (2025)**, [DeepSeek-R1, arXiv:2501.12948](https://arxiv.org/abs/2501.12948): mục 2 (GRPO, phần thưởng theo luật, R1-Zero) đọc được trong 15 phút.
2. **Dai và cộng sự (2024)**, [DeepSeekMoE, arXiv:2401.06066](https://arxiv.org/abs/2401.06066): hình 2 và mục 3.
3. **DeepSeek-AI (2024)**, [DeepSeek-V2, arXiv:2405.04434](https://arxiv.org/abs/2405.04434): mục 2.1 (MLA) và bảng 1.
4. **DeepSeek-AI (2024)**, [DeepSeek-V3 Technical Report, arXiv:2412.19437](https://arxiv.org/abs/2412.19437): mục 2.1.2, 2.2, 3.3.
5. **Shao và cộng sự (2024)**, [DeepSeekMath, arXiv:2402.03300](https://arxiv.org/abs/2402.03300): mục 4.1 (GRPO).
6. **Wang và cộng sự (2024)**, [Auxiliary-Loss-Free Load Balancing, arXiv:2408.15664](https://arxiv.org/abs/2408.15664): paper gốc của cân bằng tải bằng bias (đã đưa vào Đọc thêm của bài).

## Kiểm chứng code

Code của bài do `lesson-writer` chạy ngày 24/10/2026, thư mục làm việc ở scratchpad. Hai ô `PythonRunner` chạy bằng Pyodide thật (`runpyo.mjs`), theo quyết định 61. `content-reviewer` chạy lại cả bốn file (vi và en) bằng Pyodide thật cùng ngày 2026-10-24, output trùng với bảng dưới; code không đổi sau review. Hai dòng cuối là thử nghiệm của `summarizer`, không phải code trong bài.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `moe-routing.vi.py`, `moe-routing.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`), Python 3.14.2, NumPy 2.4.6 | Ô `PythonRunner`. Hai bản cho output trùng từng byte. Tải bước 0 `[42 15  6 17 13 12  9 14]`, bước 199 `[18 16 18 16 15 16 15 14]`; bias `[-0.17  0.02  0.13 -0.01  0.05  0.07  0.12  0.08]`; cổng token 0 `[0.454 0.546]`; mỗi token đúng 2 expert. Khớp lời văn. `ast.parse(..., feature_version=(3, 10))` qua; 32 dòng, mọi dòng ≤ 79 ký tự. Reviewer chạy lại vi và en bằng Pyodide thật (2026-10-24): trùng từng số |
| `grpo-advantage.vi.py`, `grpo-advantage.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`), Python 3.14.2, NumPy 2.4.6 | Ô `PythonRunner`. Hai bản cho output trùng từng byte. Advantage `[1.291 -0.775 ...]`, trung bình 0.0, std 1.0; 1/3/7 trên 8 đúng: đúng +2.646/+1.291/+0.378, sai −0.378/−0.775/−2.646; cả nhóm sai cho toàn 0; nhân 10 cho `True`. Khớp lời văn và phép dẫn $\sqrt{(1-p)/p}$. `ast.parse(..., feature_version=(3, 10))` qua; 29 dòng, mọi dòng ≤ 79 ký tự. Reviewer chạy lại vi và en bằng Pyodide thật (2026-10-24): trùng từng số |
| (thử nghiệm) `scratchpad/ds/moe.py` | chạy thật | 2026-10-24 | Pyodide (`runpyo.mjs`), NumPy | Do summarizer chạy; tiền thân của `moe-routing`, cùng số tải |
| (thử nghiệm) `scratchpad/ds/grpo.py` | chạy thật | 2026-10-24 | Pyodide (`runpyo.mjs`), NumPy | Do summarizer chạy; tiền thân của `grpo-advantage` |

Công thức GRPO, MoE (có expert dùng chung), bias cân bằng tải và KV cache của MLA trong bài được chép từ mã nguồn LaTeX của các paper (tải từ `arxiv.org/e-print/<id>`, vì `pdftotext` làm mất ký hiệu): [R1] pt. GRPO trong `sn-article.tex` (bản v2), [MATH] mục 4.1, [MOE] mục 3, [V3] mục 2.1.2, [V2] bảng 1. Ngày nộp v1 của [MATH] (5/2/2024), [V2] (7/5/2024), [V3] (27/12/2024) và [V32] (2/12/2025) đã kiểm trên trang arXiv.
