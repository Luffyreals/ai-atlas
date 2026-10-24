# Prompt Engineering

Bài: `llm/prompt-engineering` (chỉ bản vi, khoảng 12 phút đọc, đợt 2 theo `docs/architecture/llm-lessons.md` mục 2.8). Bài cần biết trước: `llm/text-api` (đã có tóm tắt ở `docs/research/text-api.md`). Bài sau dùng lại: `llm/rag-chatbot`. Giáo án gốc: "Buổi 3: Prompt Engineering" của phần LLM (chỉ có một dòng, không có chi tiết).

Ngày tra: **24/10/2026**, bằng WebFetch vào trang tóm tắt arXiv và trang tài liệu của nhà cung cấp. Thẻ nguồn: [B20], [W22], [K22], [M22], [S24], [G23], [PR22], [OWASP], [OAI], [ANT], [GEM]. Ý không có thẻ là kiến thức chung hoặc suy ra. Đã đọc **tóm tắt (abstract)** của các paper, **chưa đọc toàn văn**, trừ khi ghi khác.

## Nguồn

**Paper:**

- **[B20]** Brown, T. B., Mann, B., Ryder, N., Subbiah, M. và cộng sự (2020). [*Language Models are Few-Shot Learners*](https://arxiv.org/abs/2005.14165). arXiv:2005.14165. Mô hình GPT-3 (175 tỷ tham số) làm tác vụ chỉ qua văn bản trong prompt, không cập nhật trọng số. Trang arXiv không ghi hội nghị (hội nghị là NeurIPS 2020, xem "Chưa xác minh").
- **[W22]** Wei, J., Wang, X., Schuurmans, D., Bosma, M., Ichter, B., Xia, F., Chi, E., Le, Q., Zhou, D. (2022). [*Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*](https://arxiv.org/abs/2201.11903). arXiv:2201.11903 (bản đầu 1/2022, bản sửa 1/2023).
- **[K22]** Kojima, T., Gu, S. S., Reid, M., Matsuo, Y., Iwasawa, Y. (2022). [*Large Language Models are Zero-Shot Reasoners*](https://arxiv.org/abs/2205.11916). arXiv:2205.11916. NeurIPS 2022.
- **[M22]** Min, S., Lyu, X., Holtzman, A., Artetxe, M., Lewis, M., Hajishirzi, H., Zettlemoyer, L. (2022). [*Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?*](https://arxiv.org/abs/2202.12837). EMNLP 2022. Nguồn cho "ví dụ trong prompt giúp bằng cách nào".
- **[S24]** Sprague, Z., Yin, F., Rodriguez, J. D., Jiang, D., Wadhwa, M., Singhal, P., Zhao, X., Ye, X., Mahowald, K., Durrett, G. (2024). [*To CoT or not to CoT? Chain-of-thought helps mainly on math and symbolic reasoning*](https://arxiv.org/abs/2409.12183). ICLR 2025. Nguồn cho "CoT không giúp mọi tác vụ".
- **[G23]** Greshake, K., Abdelnabi, S., Mishra, S., Endres, C., Holz, T., Fritz, M. (2023). [*Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection*](https://arxiv.org/abs/2302.12173). arXiv:2302.12173 (cs.CR). Trang arXiv không ghi hội nghị (xem "Chưa xác minh").
- **[PR22]** Perez, F., Ribeiro, I. (2022). [*Ignore Previous Prompt: Attack Techniques For Language Models*](https://arxiv.org/abs/2211.09527). arXiv:2211.09527, ML Safety Workshop tại NeurIPS 2022. Đưa ra hai kiểu tấn công: chiếm mục tiêu (goal hijacking) và làm lộ prompt ẩn (prompt leaking).

**Bảo mật:**

- **[OWASP]** OWASP Gen AI Security Project. [*LLM01:2025 Prompt Injection*](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) (thuộc "OWASP Top 10 for LLM Applications", bản 2025).

**Hướng dẫn chính thức của nhà cung cấp** (đều đã mở, tên trang đúng như ghi):

- **[OAI]** OpenAI. [*Prompt engineering*](https://developers.openai.com/api/docs/guides/prompt-engineering). Địa chỉ cũ `platform.openai.com/docs/guides/prompt-engineering` chuyển hướng (301) sang địa chỉ này; dẫn địa chỉ mới.
- **[ANT]** Anthropic. [*Prompt engineering overview*](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) và trang [*Prompting best practices*](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) (trang này chỉ thấy được **qua đường dẫn** của trang overview, **chưa mở**). Địa chỉ cũ `docs.anthropic.com/...` chuyển hướng sang `platform.claude.com`.
- **[GEM]** Google. [*Prompt design strategies*](https://ai.google.dev/gemini-api/docs/prompting-strategies) (Gemini API).

## Ý chính

- **Prompt có bốn phần hay gặp** (kiến thức chung, khớp với [OAI], [GEM]): vai trò hoặc chỉ dẫn chung, ngữ cảnh (tài liệu, dữ kiện), nhiệm vụ cụ thể, định dạng đầu ra mong muốn. Không bắt buộc đủ bốn; cái nào thiếu mà model hay đoán sai thì thêm. [GEM] khuyên nêu rõ nhiệm vụ, giới hạn độ dài hoặc nội dung và định dạng; đặt quy tắc quan trọng và vai trò ở chỉ dẫn hệ thống; dùng một kiểu dấu phân cách nhất quán (thẻ XML hoặc tiêu đề Markdown).
- **Vai trò thông điệp và mức ưu tiên [OAI]:** chỉ dẫn của nhà phát triển đứng trên thông điệp của người dùng cuối; người dùng cuối cung cấp đầu vào mà quy tắc áp dụng lên. Với bài này đây là quy ước của model, không phải đảm bảo an toàn (xem prompt injection). Quan hệ `system`/`developer` đã nói ở `text-api`; chỉ link, không lặp.
- **Zero-shot và few-shot [B20, OAI, GEM]:** zero-shot là chỉ nói nhiệm vụ; few-shot là thêm vài cặp đầu vào, đầu ra mẫu vào prompt. Model không được huấn luyện lại, chỉ "học" từ văn bản trong ngữ cảnh ([B20] nêu rõ không có cập nhật gradient). [GEM]: zero-shot kém tin cậy hơn về định dạng; ví dụ nên đa dạng vừa phải, cùng cấu trúc, và đừng quá nhiều vì dễ làm model bám sát mẫu (họ dùng chữ "overfitting"). [OAI]: ví dụ nên bao phủ nhiều trường hợp.
- **Ví dụ giúp bằng cách nào [M22]:** theo thí nghiệm trên 12 model (có GPT-3), xáo trộn nhãn trong ví dụ gần như không làm giảm hiệu quả ở bài phân loại và trắc nghiệm. Ví dụ chủ yếu cho model biết **không gian nhãn**, **kiểu văn bản đầu vào** và **định dạng chuỗi**. Hệ quả cho bài: đừng nghĩ few-shot là "dạy kiến thức"; nó chỉ rõ định dạng và phạm vi đáp án. Chỉ áp dụng cho các tác vụ và model trong paper, không khái quát cho mọi tác vụ.
- **Chain-of-thought [W22]:** đưa vào ví dụ cả các bước suy luận trung gian (không chỉ đáp án) làm model suy luận tốt hơn ở toán, suy luận thường thức và ký hiệu. Tác giả mô tả khả năng này xuất hiện ở model đủ lớn. Mốc tham khảo trong abstract: model 540 tỷ tham số với 8 ví dụ đạt kết quả tốt nhất lúc đó trên GSM8K (bộ bài toán lời văn).
- **Zero-shot CoT [K22]:** chỉ cần một câu chỉ dẫn ngắn bảo model suy luận từng bước trước khi trả lời, không cần ví dụ viết tay. Với text-davinci-002, độ chính xác trên MultiArith tăng từ 17,7% lên 78,7%, trên GSM8K từ 10,4% lên 40,7% (số theo abstract; model cũ, chỉ nêu như một sự kiện có năm, không phải khuyến nghị dùng model đó).
- **CoT không phải lúc nào cũng có ích [S24]:** phân tích gộp cho thấy CoT giúp chủ yếu ở toán và logic ký hiệu, ít hơn nhiều ở tác vụ khác (ví dụ MMLU, trừ câu có tính toán ký hiệu). Có thể bật có chọn lọc để tiết kiệm chi phí suy luận.
- **Lưu ý với model reasoning [OAI]:** model reasoning làm tốt khi chỉ nêu mục tiêu cấp cao; model GPT thông thường cần chỉ dẫn rõ và chính xác hơn (OpenAI ví von đồng nghiệp cấp cao với đồng nghiệp mới vào nghề). Hệ quả: với model đã tự suy luận nội bộ, kiểu "hãy nghĩ từng bước" thường thừa. **Đã xác minh (24/10/2026):** trang *Reasoning best practices* của OpenAI có mục "Avoid chain-of-thought prompts" (https://developers.openai.com/api/docs/guides/reasoning-best-practices). Viết theo nguyên tắc: kiểm bằng bộ ví dụ nhỏ xem câu "nghĩ từng bước" có tăng chất lượng hay chỉ tăng token.
- **Ràng buộc định dạng, structured output [OAI, GEM, OWASP]:** nêu định dạng ngay trong prompt (danh sách, bảng, một từ, JSON với khóa cố định) và cho một ví dụ mẫu; [GEM] còn gợi ý "bắt đầu hộ" phần đầu của cấu trúc để model viết tiếp. [OAI] tách Structured Outputs (JSON theo schema) thành một tính năng riêng. Chi tiết `response_format`, `json_object` và `json_schema` đã ở `text-api`: bài này chỉ link, và nhắc nguyên tắc **kiểm tra đầu ra bằng mã** (như [OWASP] khuyên: định nghĩa định dạng mong đợi và xác thực bằng mã xác định).
- **Prompt injection [G23, PR22, OWASP]:** prompt injection là đầu vào làm đổi hành vi của model ngoài ý bạn. Trực tiếp: người dùng gõ chỉ dẫn lừa model. Gián tiếp [G23]: chỉ dẫn ẩn trong dữ liệu mà ứng dụng tự lấy (trang web, tệp, email), vì ứng dụng LLM làm mờ ranh giới giữa dữ liệu và chỉ dẫn. [G23] chứng minh trên Bing Chat và công cụ gợi ý mã; [PR22] mô tả chiếm mục tiêu và làm lộ prompt ẩn. [OWASP] nói RAG và fine-tune **không** ngăn hoàn toàn.
- **Biện pháp phòng thủ theo [OWASP]** (diễn đạt lại): giới hạn phạm vi hành vi trong chỉ dẫn hệ thống; xác thực đầu ra bằng mã; lọc đầu vào và đầu ra; quyền tối thiểu, giữ khóa API và việc gọi hàm ở mã ứng dụng, không giao cho model; yêu cầu người duyệt với hành động rủi ro cao; tách và gắn nhãn nội dung bên ngoài không tin cậy; thử tấn công định kỳ, coi model như người dùng không đáng tin. Thông điệp cho bài: chỉ dẫn trong prompt giảm rủi ro nhưng **không phải rào chắn bảo mật**; chặn hậu quả bằng thiết kế hệ thống.
- **Đánh giá prompt bằng bộ ví dụ nhỏ [ANT, OAI]:** [ANT] đòi có tiêu chí thành công rõ và cách kiểm thử có kiểm chứng trước khi tối ưu prompt (hướng dẫn của họ dựa trên giả định đó). [OAI] khuyên dựng bộ đánh giá (eval) để theo dõi hành vi prompt theo thời gian và ghim phiên bản model (snapshot) cho ứng dụng thật. Gợi ý của summarizer: 10-20 ca (cả ca dễ, ca biên, ca tấn công), chạy lại sau mỗi lần sửa prompt, đo bằng quy tắc đơn giản (khớp nhãn, JSON hợp lệ) trước khi dùng "model chấm model". Tương tự tập kiểm tra ở ML: **không** chỉnh prompt chỉ theo ví dụ đã thấy.
- **Lặp và chia nhỏ [GEM, ANT]:** đổi cách diễn đạt, đổi thứ tự các phần, tách một việc phức tạp thành nhiều prompt nối tiếp (prompt chaining), mỗi bước một chỉ dẫn.
- **Nguyên tắc, không theo mẹo của một model:** cả ba nhà cung cấp đều trỏ tới tài liệu theo từng model để tinh chỉnh (ví dụ [ANT] tách trang "best practices" riêng cho model mới nhất; [GEM] có mục riêng cho Gemini 3 và nói model mới bỏ qua `temperature` và tham số lấy mẫu tùy chỉnh). Bài chỉ dạy nguyên tắc chung và link tới ba trang để người đọc xem mẹo hiện hành.

## Công thức quan trọng

Không có công thức. Có thể dùng một đại lượng đơn giản cho phần đánh giá, theo ký hiệu site (số ca $m$, dự đoán $\hat{y}_i$, đáp án đúng $y_i$):

$$\text{accuracy}=\frac{1}{m}\sum_{i=1}^{m}\mathbf{1}\left[\hat{y}_i=y_i\right]$$

Đây là kiến thức chung, không từ nguồn nào ở trên. Ghi chú: ở tác vụ sinh văn bản tự do không có $y_i$ duy nhất, nên bài chỉ dùng công thức này cho tác vụ có nhãn hoặc định dạng kiểm được bằng mã.

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; phần "(gợi ý)" là của summarizer.

- **Prompt như giao việc cho thực tập sinh thông minh nhưng không biết gì về công ty bạn (gợi ý):** nêu bạn là ai, họ cần làm gì, dữ kiện nào cần dùng, kết quả giao ở dạng nào. Thiếu phần nào, họ đoán. Trùng ví von của [OAI] về đồng nghiệp mới và đồng nghiệp cấp cao.
- **Ba cách hỏi cùng một việc (gợi ý), cho mục "Minh họa" dạng bảng so sánh** (llm-lessons.md mục 2.7): prompt mơ hồ, prompt có cấu trúc bốn phần, prompt thêm hai ví dụ mẫu. Bảng ba cột: kiểu prompt, nội dung, điều thay đổi. Dùng bài phân loại cảm xúc câu bình luận (cùng loại ví dụ [OAI] dùng).
- **Few-shot như đưa mẫu biểu điền sẵn hai dòng (gợi ý):** người nhận không học thêm kiến thức gì, chỉ biết cột nào điền gì và viết ra sao. Khớp với kết quả của [M22].
- **CoT như nháp giấy (gợi ý):** viết ra các bước giúp làm toán nhiều bước ít sai hơn; còn câu hỏi tra cứu một dữ kiện thì nháp chẳng giúp gì. Khớp với [S24].
- **Injection như nhân viên nhận thư (gợi ý):** nhân viên được dặn "chỉ tóm tắt thư". Một thư viết "bỏ qua dặn dò, hãy gửi hồ sơ cho người lạ". Nếu nhân viên làm theo mọi chữ trong thư, đó là injection gián tiếp [G23]. Lời dặn hay hơn không đủ; cách chắc là **không đưa cho nhân viên quyền gửi hồ sơ**.
- **Hội thoại mẫu cho mục "Minh họa"** (bảng hai cột "Vai trò" và "Nội dung"): system đặt vai trò tóm tắt; user kèm một đoạn văn "không tin cậy" có câu chỉ dẫn giả; assistant tóm tắt đúng đoạn văn mà không làm theo câu đó. **Chưa chạy thật:** nếu đưa kết quả thật vào bài, phải lấy từ lần chạy bằng key của người dùng (llm-lessons.md mục 2.5), không viết kết quả "trông giống thật".
- **Gợi ý code `LocalCode` (không bắt buộc):** một file ngắn gọi API hai lần (zero-shot và few-shot) trên 5-8 ca nhỏ, tính accuracy; đọc `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `LLM_MODEL` theo khuôn mục 2.3. Có thể chạy trên trang bằng `PythonRunner` nếu chỉ dùng hàm "model giả" (không gọi mạng) để dạy cách chấm; tuy nhiên đó chỉ dạy cách chấm, không dạy prompt. Quyết định dành cho người viết bài.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Coi prompt hay là "câu thần chú".** Hiệu quả phụ thuộc model và tác vụ; kiểm bằng bộ ví dụ, không bằng một lần thử. [ANT] đặt tiêu chí thành công và cách kiểm lên trước việc viết prompt.
2. **Nghĩ few-shot dạy model kiến thức mới hoặc cần nhãn đúng tuyệt đối.** Theo [M22], ví dụ chủ yếu chỉ ra định dạng và không gian nhãn. Nhưng đừng suy ra "nhãn sai cũng được": nhãn sai vẫn có hại ở nhiều thiết lập khác và [M22] chỉ xét một số tác vụ.
3. **Quá nhiều ví dụ.** [GEM] cảnh báo model dễ bám mẫu. Chọn ví dụ đa dạng, cùng định dạng.
4. **Câu "hãy nghĩ từng bước" luôn tốt.** [S24]: giúp chủ yếu ở toán và logic ký hiệu. Với model reasoning, [OAI] nói chúng làm tốt với mục tiêu cấp cao; nên kiểm trước khi thêm. Thêm CoT còn tốn token và thời gian.
5. **Tin rằng lời giải thích của CoT chính là lý do thật của model.** Chưa đọc nguồn nào ở trên nói điều này; chỉ nêu như lời cảnh báo chung và đánh dấu "chưa xác minh" nếu đưa vào bài (xem "Chưa xác minh").
6. **Tưởng "bỏ qua chỉ dẫn của người dùng" trong system prompt là đủ chống injection.** [OWASP] nói không có cách nào hoàn toàn ngăn được; cần giảm quyền, kiểm đầu ra, tách nội dung không tin cậy, người duyệt.
7. **Chỉ coi injection là chuyện người dùng gõ bậy.** [G23]: dữ liệu mà ứng dụng tự lấy (web, email, tài liệu RAG) cũng mang chỉ dẫn. Đây là lý do `rag-chatbot` phải nhắc lại.
8. **Tin đầu ra JSON mà không kiểm.** Ngay cả khi yêu cầu định dạng, luôn xác thực bằng mã (như `text-api` và [OWASP]).
9. **Dán dữ liệu bí mật vào prompt rồi tưởng không ai lấy ra được.** [PR22] có kiểu tấn công làm lộ prompt ẩn (prompt leaking). Đừng đặt khóa hay bí mật trong prompt.
10. **Sao chép "mẹo" của model này sang model khác.** Mẹo phụ thuộc phiên bản; ba nhà cung cấp đều có trang riêng cho từng model.
11. **Chỉnh prompt đến khi khớp bộ ví dụ đã thấy.** Giống overfitting: để dành một số ca chưa dùng để kiểm lại (gợi ý, kiến thức chung).

## Liên quan tới bài nào

Slug đã đối chiếu `src/data/roadmap.ts` ngày 24/10/2026.

- **Cần biết trước:** `llm/text-api` (vai trò thông điệp, `temperature`, `response_format`, biến môi trường, xử lý lỗi). Bài này link tới đó cho cả định dạng JSON và lấy mẫu.
- **Bài dùng lại:** `llm/rag-chatbot` (cần biết trước gồm bài này): ghép ngữ cảnh truy xuất vào prompt, injection gián tiếp qua tài liệu truy xuất. `llm/agents` (injection khi model gọi công cụ, quyền tối thiểu) và `llm/evaluation-peft` (đánh giá có hệ thống hơn bộ ví dụ nhỏ). Hai bài sau **chưa** kiểm xem có khai báo bài này là cần biết trước hay không; chỉ nhắc tên, không gắn link nếu cùng đợt chưa xuất bản.
- **Bài hẹn:** `llm/gradio-streamlit` cùng đợt 2, chỉ ghi tên, không gắn link.
- **Giáo án gốc:** "Buổi 3: Prompt Engineering" (chỉ một dòng).

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Hội nghị của [B20] (NeurIPS 2020), [W22] (NeurIPS 2022), [G23] (có thể AISec 2023) | Trang arXiv đã đọc không ghi hội nghị. NeurIPS cho [B20] và [W22] là kiến thức chung nhưng chưa kiểm trên trang | Ghi "arXiv, năm" cho cả ba. Chỉ ghi hội nghị nếu kiểm được trên trang chính thức. Không ghi hội nghị cho [G23] |
| Định nghĩa zero-shot, one-shot, few-shot trong [B20] | Abstract chỉ nói về few-shot, không dùng chữ zero-shot hay one-shot. Định nghĩa đầy đủ nằm trong thân bài, chưa đọc | Định nghĩa trong bài viết bằng lời của mình. Không trích số liệu của [B20] ngoài "175 tỷ tham số" |
| Lời khuyên chính thức "đừng dùng CoT với model reasoning" | **Đã xác minh** (2026-10-24): trang [*Reasoning best practices*](https://developers.openai.com/api/docs/guides/reasoning-best-practices) của OpenAI có mục "Avoid chain-of-thought prompts": các model này tự suy luận nội bộ nên bảo chúng "think step by step" hay "explain your reasoning" là không cần, có thể không giúp và đôi khi làm kém đi | Bài viết "OpenAI khuyên tránh prompt kiểu CoT với mô hình reasoning", kèm nguyên tắc kiểm bằng bộ ví dụ |
| Lời giải thích của CoT có phản ánh quá trình suy luận thật của model không | Chưa tra nguồn nào | Không khẳng định. Nếu muốn viết, tra thêm một paper về "faithfulness" của CoT rồi ghi nguồn |
| Các số của [K22] (17,7%→78,7%; 10,4%→40,7%) | Lấy từ abstract bản v4; có thể khác bản khác | Chỉ dùng như ví dụ về "một model, một thời điểm", ghi kèm năm 2022 và tên model |
| [S24] "MMLU, câu có dấu bằng" | Lấy từ abstract, chưa đọc toàn văn | Chỉ nói "giúp chủ yếu ở toán và logic ký hiệu, ít ở tác vụ khác" |
| Khẳng định "model mới bỏ qua `temperature`" của [GEM] | Chỉ đọc trên trang đã tóm tắt; không khẳng định với OpenAI hay Anthropic | Chỉ dùng như ví dụ rằng tham số lấy mẫu phụ thuộc model; không dạy tham số cụ thể (đã có ở `text-api`) |
| Câu "10-20 ca" cho bộ ví dụ nhỏ | Đề xuất của summarizer, không có nguồn | Ghi là gợi ý, không gán cho nguồn nào |
| Hành vi thật của model với hội thoại mẫu chống injection | Chưa chạy | Cần `content-reviewer` chạy bằng key người dùng nếu bài đưa kết quả mẫu |

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Kỹ thuật prompt | Prompt engineering | Giữ "prompt engineering" |
| Chỉ dẫn | Instruction | Dịch |
| Học trong ngữ cảnh | In-context learning | Dịch, gloss một lần |
| Zero-shot, few-shot | Zero-shot, few-shot | Giữ nguyên, gloss "không ví dụ", "vài ví dụ" |
| Chuỗi suy luận | Chain-of-thought (CoT) | Gloss một lần, sau đó dùng "CoT" |
| Mô hình reasoning (suy luận) | Reasoning model | Giữ "reasoning" |
| Đầu ra có cấu trúc | Structured output | Đã đề xuất ở `text-api` |
| Tấn công chèn prompt | Prompt injection | Giữ "prompt injection", gloss "chèn chỉ dẫn" |
| Chèn gián tiếp | Indirect prompt injection | Dịch, gloss |
| Chiếm mục tiêu | Goal hijacking | Dịch khi cần |
| Làm lộ prompt | Prompt leaking | Dịch khi cần |
| Bộ đánh giá | Evaluation set (eval) | Dịch |
| Quyền tối thiểu | Least privilege | Dịch |

## Đọc thêm đề xuất

1. [OpenAI, *Prompt engineering*](https://developers.openai.com/api/docs/guides/prompt-engineering). Đã đọc.
2. [Anthropic, *Prompt engineering overview*](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) (trỏ tới *Prompting best practices*). Đã đọc trang overview.
3. [Google, *Prompt design strategies*](https://ai.google.dev/gemini-api/docs/prompting-strategies). Đã đọc.
4. [OWASP, *LLM01:2025 Prompt Injection*](https://genai.owasp.org/llmrisk/llm01-prompt-injection/). Đã đọc.
5. [Wei et al. (2022)](https://arxiv.org/abs/2201.11903) và [Kojima et al. (2022)](https://arxiv.org/abs/2205.11916), cho người muốn đọc paper gốc về CoT. Chỉ đọc abstract.
6. [Greshake et al. (2023)](https://arxiv.org/abs/2302.12173), cho phần prompt injection gián tiếp. Chỉ đọc abstract.

## Kiểm chứng code

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `score.vi.py`, `score.en.py` | chạy thật | 2026-10-24 | Python 3.14.5 (venv Pyodide `ai-atlas-py314`), chỉ thư viện chuẩn | A: accuracy 0.625, 3 không hợp lệ, sai ca [2, 6, 7]; B: accuracy 0.875, 0 không hợp lệ, sai ca [6]; một ca = 0.125. Hai bản cho cùng số, khớp lời văn |
| `compare-prompts.vi.py`, `.en.py` | chạy khô | 2026-10-24 | Python 3.14.5, openai 3.37.0 (`.venv-llm`) | Có thêm server giả cục bộ. Thiếu `OPENAI_API_KEY`: `KeyError: 'OPENAI_API_KEY'`. Với server giả kiểu OpenAI ở 127.0.0.1 (trả nhãn cố định): chạy hết 16 lần gọi mỗi bản, in đủ hai dòng zero-shot/few-shot; log request cho thấy `system` có câu về thẻ và mọi lượt `user` (cả `SHOTS`) được bọc `<binh_luan>`/`<comment>`. Chưa có `.env.llm` nên không có kết quả mẫu, lời văn không trích số |
| `injection-check.vi.py`, `.en.py` | chạy khô | 2026-10-24 | Python 3.14.5, openai 3.37.0 (`.venv-llm`) | Có thêm server giả cục bộ. Thiếu key: `KeyError`. Server giả trả `XK-7Q2` thì in dòng cảnh báo; trả câu thường thì in "không thấy chuỗi mồi". `replace("<", "(").replace(">", ")")` vô hiệu hóa cả thẻ lồng `</tai_</tai_lieu>lieu>`, chữ hoa, thêm dấu cách. Chưa có kết quả mẫu |
| Cả ba cặp | `ast.parse`, so cặp vi/en | 2026-10-24 | tokenize, bỏ comment, làm rỗng chuỗi | Cú pháp đúng; phần code vi và en giống hệt |
| Công thức trong bài | render KaTeX | 2026-10-24 | `node_modules/katex`, `strict` báo mọi cảnh báo | 22 công thức (cả quiz), 0 cảnh báo, 0 lỗi, không có chữ Việt có dấu trong công thức |
