# Sử dụng API văn bản (Text API)

Bài: `llm/text-api` (chỉ bản vi, khoảng 10 phút đọc). Quyết định liên quan trong `docs/decisions.md`: số 53 (code gọi API là code minh họa, dùng SDK OpenAI-compatible, đọc khóa từ biến môi trường) và số 54 (code ở `src/code/llm/text-api/`, VIZ `SamplingViz` dùng ở bài này và `build-first-llm`, bảng nhà cung cấp ghi "kiểm tra lần cuối 10/2026").

Ngày tra: **24/10/2026**, bằng WebFetch, `curl` tới PyPI và mã nguồn trên GitHub. Thẻ nguồn: [PYPI], [OAI-README], [OAI-SRC], [OAI-TEXT], [OAI-ERR], [GEM-OAI], [GEM-RL], [GEM-MOD], [GROQ-OAI], [GROQ-MOD], [OLL-OAI], [H20], [F18], [HVD15]. Ý không có thẻ là kiến thức chung hoặc suy ra từ công thức. Giá tiền không ghi (theo yêu cầu).

## Nguồn

**SDK `openai` (Python):**

- **[PYPI]** [*openai trên PyPI*](https://pypi.org/project/openai/) (qua [JSON API](https://pypi.org/pypi/openai/json)). Bản mới nhất lúc tra: **3.37.0**, tải lên 22/10/2026, yêu cầu Python `>=3.10`. Bản lên rất nhanh, nên bài chỉ ghi "kiểm tra lần cuối 10/2026" và nên ghi tối thiểu `openai>=...` thay vì ghim một số.
- **[OAI-README]** OpenAI. [*openai-python README*](https://github.com/openai/openai-python) (nhánh `main`). Đã đọc: biến môi trường, lớp lỗi, retry, timeout, streaming.
- **[OAI-SRC]** OpenAI. Mã nguồn `openai-python`, [`completion_create_params.py`](https://github.com/openai/openai-python/blob/main/src/openai/types/chat/completion_create_params.py), [`_constants.py`](https://github.com/openai/openai-python/blob/main/src/openai/_constants.py), [`chat_completion_stream_options_param.py`](https://github.com/openai/openai-python/blob/main/src/openai/types/chat/chat_completion_stream_options_param.py), [`chat_completion_developer_message_param.py`](https://github.com/openai/openai-python/blob/main/src/openai/types/chat/chat_completion_developer_message_param.py). Chú thích (docstring) trong mã được sinh từ đặc tả API chính thức, nên dùng làm nguồn cho tham số của `chat.completions.create`. Trang tham chiếu web (`platform.openai.com/docs/api-reference/chat/create`) trả 403 với công cụ, trang `developers.openai.com/.../chat/.../create` trả 404, nên **không** dẫn hai trang đó.
- **[OAI-TEXT]** OpenAI. [*Text generation*](https://developers.openai.com/api/docs/guides/text) (hướng dẫn chính thức). Nói về vai trò `developer`, `user`, `assistant` và khuyên dùng Responses API.
- **[OAI-ERR]** OpenAI. [*Error codes*](https://developers.openai.com/api/docs/guides/error-codes). Hướng dẫn xử lý lỗi 429.

**Nhà cung cấp OpenAI-compatible:**

- **[GEM-OAI]** Google. [*OpenAI compatibility*](https://ai.google.dev/gemini-api/docs/openai) (Gemini API).
- **[GEM-RL]** Google. [*Rate limits*](https://ai.google.dev/gemini-api/docs/rate-limits).
- **[GEM-MOD]** Google. [*Models*](https://ai.google.dev/gemini-api/docs/models).
- **[GROQ-OAI]** Groq. [*OpenAI Compatibility*](https://console.groq.com/docs/openai).
- **[GROQ-MOD]** Groq. [*Supported models*](https://console.groq.com/docs/models).
- **[OLL-OAI]** Ollama. [*OpenAI compatibility*](https://docs.ollama.com/api/openai-compatibility).

**Lấy mẫu token:**

- **[H20]** Holtzman, A., Buys, J., Du, L., Forbes, M., Choi, Y. (2020). [*The Curious Case of Neural Text Degeneration*](https://arxiv.org/abs/1904.09751). ICLR 2020 (arXiv:1904.09751, bản đầu 4/2019, bản sửa 2/2020). Đề xuất nucleus sampling (top-p). Đã đọc bản HTML (ar5iv) mục 3 và 6, **chưa đọc kỹ toàn bài**. Lưu ý: arXiv ghi năm nộp 2019, hội nghị là 2020; bài nên ghi "2020 (ICLR)".
- **[F18]** Fan, A., Lewis, M., Dauphin, Y. (2018). [*Hierarchical Neural Story Generation*](https://aclanthology.org/P18-1082/). ACL 2018 (Volume 1: Long Papers), Melbourne, tr. 889-898. DOI `10.18653/v1/P18-1082` (arXiv:1805.04833). Xác minh thư mục và tóm tắt. **Không xác minh được trong chính bài này** việc top-k được mô tả ở đâu (tóm tắt không nhắc lấy mẫu; PDF công cụ không đọc được). Việc gán top-k cho Fan và cộng sự dựa vào [H20] mục 3.2, vốn cũng gán cho Holtzman và cộng sự 2018 và Radford và cộng sự 2019 (không phải ai cũng là "người phát minh"; xem "Chưa xác minh").
- **[HVD15]** Hinton, G., Vinyals, O., Dean, J. (2015). [*Distilling the Knowledge in a Neural Network*](https://arxiv.org/abs/1503.02531). arXiv:1503.02531 (NIPS 2014 Deep Learning Workshop). Mục 2 định nghĩa softmax có nhiệt độ $T$. Đã đọc bản ar5iv. Nguồn này dùng cho chưng cất mô hình, **không phải** cho việc lấy mẫu văn bản; dùng làm nguồn công thức, không nói "Hinton phát minh temperature trong LLM".

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Fan et al. (2018) có định nghĩa top-k ở mục nào, dùng $k$ bao nhiêu | Không đọc được PDF; tóm tắt không nhắc. | Dẫn [F18] như "một trong các nguồn đầu tiên dùng top-k", gán qua [H20]. Không nêu số $k$ trong bài. |
| Nguồn gốc lịch sử của "temperature" (cơ học thống kê, máy Boltzmann) | Chưa tra. Chỉ có [HVD15] cho công thức. | Không viết lịch sử. Có thể ghi "mượn tên từ vật lý" chỉ khi có nguồn; nếu không, bỏ. |
| Tên tham số `max_completion_tokens` có được nhà cung cấp khác chấp nhận không | Chỉ xác minh cho OpenAI [OAI-SRC]. [OLL-OAI] liệt kê `max_tokens`, không liệt kê `max_completion_tokens`. Gemini và Groq: trang đã đọc không nêu. | Code mẫu dùng **`max_tokens`** cho tương thích rộng (OpenAI vẫn nhận, đã ghi "deprecated"); bài nói rõ tên mới. `reviewer` chạy thử với nhà cung cấp thật. |
| Gói miễn phí của Groq | Trang [GROQ-MOD] chỉ nhắc "Developer Plan"; không thấy chữ "free". | Không ghi Groq "miễn phí" nếu chưa kiểm lại. Quyết định 54 nói người dùng dùng gói miễn phí Gemini hoặc Groq: nhờ người dùng xác nhận trên tài khoản. |
| Hạn mức cụ thể (RPM, TPM, RPD) của Gemini | Chỉ đọc tên các chiều, không đọc số. | Bài không ghi số. |
| Mức hỗ trợ JSON mode / tool calling của Groq | Trang [GROQ-OAI] không nêu. | Ghi "chưa kiểm" trong bảng; không suy ra. |
| Mức hỗ trợ `response_format` trên Gemini ở ngoài `client.beta.chat.completions.parse` | Chỉ thấy ví dụ `parse` (structured output). | Ghi theo đúng trang; thử thật trước khi dùng `json_schema` trong code mẫu. |
| Lấy mẫu "top-k" có được các API OpenAI-compatible phơi ra không | `chat.completions.create` của OpenAI **không có** `top_k` ([OAI-SRC] không có chuỗi `top_k`). Nhà cung cấp khác: chưa kiểm. | Bài nói top-k là kỹ thuật có thật nhưng API OpenAI không có tham số này; code chỉ dùng `temperature` và `top_p`. |
| Mức "kiểm tra lần cuối 10/2026" của tên model | Tên model đổi nhanh (xem bảng dưới). | Bảng ghi ngày; code đọc `LLM_MODEL` từ môi trường, không ghi cứng. |

## Ý chính

- **Vai trò trong `messages` [OAI-TEXT, OAI-SRC]:** `messages` là danh sách lượt nói, mỗi phần tử có `role` và `content`. `user`: yêu cầu của người dùng. `assistant`: lời model đã trả lời (bạn đưa lại để model "nhớ" cuộc trò chuyện, vì API **không giữ trạng thái**: mỗi lần gọi bạn phải gửi cả lịch sử). `system`: chỉ dẫn của nhà phát triển (vai trò, giọng điệu, quy tắc). OpenAI nay gọi vai trò này là **`developer`** với model dòng o trở lên ("replace the previous `system` messages" theo [OAI-SRC]); nhiều nhà cung cấp tương thích vẫn dùng `system`. Code mẫu dùng `system` cho tương thích rộng. Không phải mọi nhà cung cấp cư xử như nhau; mức ưu tiên giữa `developer` và `user` là quy ước của model chứ không phải đảm bảo an toàn.
- **Chat Completions và Responses [OAI-README, OAI-TEXT]:** OpenAI khuyên Responses API cho ứng dụng mới, nhưng README nói Chat Completions là chuẩn trước đó và "supported indefinitely". Chat Completions là giao diện mà các nhà cung cấp khác (Gemini, Groq, Ollama) phơi ra, nên bài dùng nó. Bài nên nói một câu về sự khác biệt.
- **`temperature` [OAI-SRC]:** khoảng 0 đến 2; cao thì ngẫu nhiên hơn, thấp thì tập trung hơn. OpenAI khuyên chỉnh `temperature` **hoặc** `top_p`, không chỉnh cả hai. Groq chuyển `temperature=0` thành `1e-8` (không chia cho 0) [GROQ-OAI]. Model suy luận (o-series) có thể không nhận một số tham số lấy mẫu (chưa xác minh cho tham số cụ thể; chỉ có [OAI-SRC] về `max_tokens` không tương thích o-series).
- **`top_p` [OAI-SRC, H20]:** chỉ xét tập token nhỏ nhất có tổng xác suất tối thiểu $p$ (nucleus), rồi lấy mẫu trong đó sau khi chuẩn hóa lại. Tập này co giãn theo từng bước: lúc model chắc chắn thì chỉ vài token, lúc phân vân thì nhiều token. Đây là điểm khác với top-k (số token cố định).
- **`max_tokens` và tên mới [OAI-SRC]:** `max_tokens` là chặn trên số token sinh ra; trên OpenAI nó đã **deprecated**, thay bằng **`max_completion_tokens`** (tính cả token suy luận ẩn của model suy luận) và không dùng được với o-series. Nó là trần chi phí và độ dài, **không** làm câu trả lời ngắn lại cho vừa: khi chạm trần, câu bị cắt giữa chừng và `finish_reason` là `"length"` (thay vì `"stop"`; suy ra từ API, đã quen thuộc; nên để `reviewer` chạy thật).
- **Streaming [OAI-README, OAI-SRC]:** `stream=True` trả các mảnh (chunk) theo thời gian, người dùng thấy chữ hiện dần thay vì chờ cả câu. Tổng số token (usage) chỉ có ở chunk cuối khi đặt `stream_options={"include_usage": True}`; nếu luồng bị ngắt có thể không nhận được chunk đó. Các lỗi giữa luồng báo `APITimeoutError` hoặc `APIConnectionError`; **luồng không tự retry**.
- **Token và chi phí (khái niệm):** token là đơn vị văn bản model đọc và sinh (không phải từ, không phải ký tự). Nhà cung cấp tính tiền và đặt hạn mức theo token, thường tách token **vào** (prompt, gồm cả lịch sử hội thoại) và **ra** (completion). Vì lịch sử được gửi lại mỗi lượt, chi phí một cuộc trò chuyện dài tăng nhanh hơn tuyến tính. `usage` trong phản hồi cho biết số token. Không ghi giá.
- **Xử lý lỗi [OAI-README]:** mọi lỗi của SDK kế thừa `openai.APIError`. `APIConnectionError` (không tới được máy chủ), `APITimeoutError` (quá giờ; chưa xác minh quan hệ kế thừa với `APIConnectionError`, nên bắt riêng khi cần), `APIStatusError` (có `status_code`, `response`) cùng các lớp con: `BadRequestError` 400, `AuthenticationError` 401, `PermissionDeniedError` 403, `NotFoundError` 404, `UnprocessableEntityError` 422, `RateLimitError` 429, `InternalServerError` ≥500. Thứ tự `except` nên đi từ cụ thể tới chung.
- **Retry có backoff [OAI-README, OAI-ERR, OAI-SRC]:** SDK có sẵn `max_retries` mặc định **2**, lùi theo cấp số nhân ngắn; tự thử lại với lỗi kết nối, 408, 409, 429 và ≥500; đặt `0` để tắt; đổi cho một yêu cầu bằng `client.with_options(max_retries=5)`. `timeout` mặc định **10 phút** (`connect=5` giây trong [OAI-SRC]); đổi bằng `OpenAI(timeout=...)` hoặc `with_options(timeout=...)`. Hướng dẫn 429 [OAI-ERR]: nếu có header `Retry-After` thì chờ ít nhất chừng đó; nếu không thì dùng exponential backoff có jitter và giới hạn số lần thử; **không retry** lỗi hết tiền hoặc vượt hạn mức chi tiêu (mã `credit_balance_exhausted`, `*_spend_limit_exceeded`, vì thử lại không khôi phục quyền truy cập). Nếu tự retry ở tầng ứng dụng, nhớ SDK đã retry rồi.
- **Đầu ra JSON [OAI-SRC]:** `response_format={"type": "json_object"}` là "JSON mode" cũ, bảo đảm chuỗi hợp lệ JSON (chưa đảm bảo đúng cấu trúc bạn muốn; nên hướng dẫn trong prompt). `{"type": "json_schema", "json_schema": {...}}` là Structured Outputs, bảo đảm khớp schema, "preferred for models that support it". Dù vậy luôn `json.loads` trong `try/except`, vì có thể bị cắt do `max_tokens` hoặc nhà cung cấp không hỗ trợ.
- **Nhà cung cấp tương thích [GEM-OAI, GROQ-OAI, OLL-OAI]:** cùng SDK, chỉ đổi `base_url`, khóa và tên model. Mức hỗ trợ khác nhau (bảng dưới). OpenAI gọi Gemini là bản "beta".
- **Biến môi trường [OAI-README]:** SDK tự đọc `OPENAI_API_KEY` khi không truyền `api_key`, và `OPENAI_BASE_URL` khi không truyền `base_url`. Vì vậy `OpenAI()` không đối số đã đủ. `LLM_MODEL` là quy ước của dự án (SDK không đọc); code tự đọc bằng `os.environ`.
- **Cơ chế lấy mẫu (cho `SamplingViz`):** model cho ra **logit** $z_i$ cho mọi token trong từ vựng. Chia logit cho $T$ rồi softmax [H20 §3.3, HVD15 §2]. Rồi (tùy chọn) cắt đuôi bằng top-k hoặc top-p, **chuẩn hóa lại**, rồi rút một token ngẫu nhiên. $T\to0$ tiến tới chọn token có logit lớn nhất (greedy); $T=1$ giữ nguyên phân phối của model; $T>1$ làm phẳng, token hiếm có cơ hội nhiều hơn.
- **Vì sao top-p ra đời [H20]:** chọn token xác suất cao nhất liên tục (greedy hoặc beam search) cho văn bản nhàm và lặp; lấy mẫu thẳng toàn từ vựng thì đuôi dài các token vô nghĩa đôi khi được chọn. Top-p cắt đuôi đó mà vẫn giữ đa dạng. Tác giả cũng nêu top-k có điểm yếu: $k$ cố định không hợp với cả phân phối nhọn và phẳng. Họ còn thấy top-k kết hợp temperature 0,7 dễ rơi vào lặp (§6.2).
- **Thứ tự áp dụng trong thực tế:** tài liệu OpenAI không nêu thứ tự; [H20] chỉ mô tả từng kỹ thuật. Trong `SamplingViz` chọn một thứ tự và **ghi rõ** là minh họa (xem "Công thức quan trọng").

## Công thức quan trọng

Ký hiệu theo site: logit $\mathbf{z}\in\mathbb{R}^V$ ($V$ là cỡ từ vựng), nhiệt độ $T$ (không có ký hiệu riêng trong CLAUDE.md; dùng $T$ như [HVD15], [H20] dùng $t$), xác suất $p_i$.

**Softmax có nhiệt độ** [HVD15 §2]:

$$p_i(T)=\frac{\exp(z_i/T)}{\sum_{j=1}^{V}\exp(z_j/T)}$$

Chia $\mathbf{z}$ cho $T$ trước softmax. Thứ tự các token không đổi (softmax đơn điệu); $T$ chỉ đổi độ **nhọn** của phân phối. $T<1$ khuếch đại chênh lệch logit; $T>1$ thu nhỏ chúng.

**Top-k:** giữ $k$ token có $p_i$ lớn nhất (tập $V^{(k)}$), đặt các token còn lại về 0 rồi chuẩn hóa lại [H20 §3.2]:

$$p_i^{(k)}=\begin{cases}p_i\Big/\sum_{j\in V^{(k)}}p_j & i\in V^{(k)}\\ 0 & \text{ngược lại}\end{cases}$$

**Top-p (nucleus):** $V^{(p)}$ là tập nhỏ nhất (lấy token xác suất giảm dần) sao cho [H20 §3.1]:

$$\sum_{i\in V^{(p)}}p_i\ \ge\ p$$

rồi chuẩn hóa lại bằng $p'=\sum_{i\in V^{(p)}}p_i$.

**Thứ tự trong VIZ** (quy ước của `summarizer`, chưa có nguồn): $\mathbf{z}\to$ chia $T$ $\to$ softmax $\to$ top-k $\to$ top-p $\to$ chuẩn hóa lại $\to$ rút mẫu. Nhiều thư viện mã nguồn mở làm đúng như vậy, nhưng nhà cung cấp API có thể khác; bài chỉ nói "minh họa".

### Số tự chạy (numpy, để dùng làm mặc định của `SamplingViz` hoặc ví dụ trong bài)

Năm token với logit $\mathbf{z}=[4,3,2,1,0]$ (kiểm bằng Python):

| $T$ | $p_1$ | $p_2$ | $p_3$ | $p_4$ | $p_5$ |
|---|---|---|---|---|---|
| 0,5 | 0,865 | 0,117 | 0,016 | 0,002 | 0,000 |
| 1 | 0,636 | 0,234 | 0,086 | 0,032 | 0,012 |
| 2 | 0,429 | 0,260 | 0,158 | 0,096 | 0,058 |

Với $T=0{,}1$: $p_1\approx1{,}000$ (gần như chắc chắn chọn token đầu). Xác suất cộng dồn ở $T=1$: $0{,}636;\ 0{,}871;\ 0{,}957;\ 0{,}988;\ 1$.

- **Top-k, $k=2$, $T=1$:** giữ $p_1,p_2$, chuẩn hóa lại thành $0{,}731;\ 0{,}269;\ 0;\ 0;\ 0$.
- **Top-p, $p=0{,}9$, $T=1$:** hai token đầu cộng dồn $0{,}871<0{,}9$ nên phải lấy thêm token thứ ba ($0{,}957\ge0{,}9$); chuẩn hóa lại thành $0{,}665;\ 0{,}245;\ 0{,}090;\ 0;\ 0$. Cùng bài toán, top-k hai token và top-p 0,9 giữ **số token khác nhau**: điểm minh họa tốt cho "top-p co giãn".

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; phần có "(gợi ý)" là của `summarizer`.

- **Cuộc trò chuyện không có trí nhớ (gợi ý):** API giống nhắn tin cho một người mất trí nhớ sau mỗi lần trả lời: bạn phải dán cả cuộc trò chuyện trước đó vào mỗi lần hỏi. Từ đó hiểu vì sao danh sách `messages` dài ra và chi phí tăng theo từng lượt.
- **Núm vặn nhiệt độ (gợi ý):** hai ví dụ cho cùng một câu hỏi: $T$ thấp giống học sinh chắc chắn nói câu quen thuộc nhất; $T$ cao giống học sinh liều, đôi khi nói ra điều lạ hoặc sai. Dùng bảng "Số tự chạy" ở trên làm hình.
- **Top-p như "lấy cho đủ 90% khả năng" (gợi ý):** xếp ứng viên từ khả năng cao xuống thấp, cộng dồn cho tới khi gần chắc chắn, rồi bỏ phần còn lại. Khi model chắc chắn, chỉ cần một hai ứng viên; khi phân vân, cần cả chục.
- **Ví dụ từ [H20]:** văn bản sinh bằng cách luôn chọn token xác suất cao nhất thường nhàm và lặp, còn lấy mẫu có kiểm soát thì gần văn người hơn. Hợp để mở phần "vì sao cần lấy mẫu".
- **Stream giống phát sóng trực tiếp (gợi ý):** chữ đến từng mảnh, giao diện hiện ngay; nhưng nếu đường truyền đứt giữa chừng thì phần đã nhận là phần dở dang và SDK không tự thử lại luồng đó.
- **Retry có backoff (gợi ý):** giống gõ cửa nhà đông người: gõ lại ngay thì chỉ thêm ồn; chờ lâu dần giữa các lần (1 giây, 2, 4...) và thêm chút ngẫu nhiên để nhiều người khỏi cùng gõ một lúc.

## Nhà cung cấp OpenAI-compatible (kiểm tra 24/10/2026)

Dùng cho bảng trong bài, ghi "kiểm tra lần cuối 10/2026" (quyết định 54).

| Nhà cung cấp | `base_url` | Tên model ví dụ | Streaming | JSON / `response_format` | Tool calling | Ghi chú |
|---|---|---|---|---|---|---|
| OpenAI | mặc định (không cần đặt) | tùy tài khoản; tên đổi nhanh nên không ghi ví dụ cụ thể | có [OAI-SRC] | `json_object` và `json_schema` [OAI-SRC] | có [OAI-SRC] (`tools`, `tool_choice`) | `max_tokens` đã deprecated, dùng `max_completion_tokens` |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/` [GEM-OAI] | `gemini-3.8-flash` (dùng trong ví dụ [GEM-OAI]); các bản flash khác ở [GEM-MOD] | có | structured output qua `client.beta.chat.completions.parse` với `response_format` | có (`tools`, `tool_choice`) | Trang tự ghi hỗ trợ thư viện OpenAI "still in beta". Có bậc **Free** theo [GEM-RL] (hạn mức tính **theo project**, các chiều RPM, TPM, RPD; reset RPD lúc nửa đêm giờ Thái Bình Dương). Trang [GEM-MOD] không nói model nào miễn phí |
| Groq | `https://api.groq.com/openai/v1` [GROQ-OAI] | `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`, `openai/gpt-oss-20b` ([GROQ-MOD], mục production) | không nêu rõ trên trang đã đọc (chưa kiểm) | chưa kiểm | chưa kiểm (trang chỉ nói có Responses API với function calling) | Trả **400** nếu có `logprobs`, `logit_bias`, `top_logprobs`, `messages[].name`; `n` phải bằng 1; `temperature=0` đổi thành `1e-8`. Groq khuyên dùng SDK riêng. Chưa xác nhận gói miễn phí |
| Ollama (máy bạn) | `http://localhost:11434/v1/` [OLL-OAI] | `llama3.2`, `qwen3:8b`, `gpt-oss:20b` (sau khi `ollama pull`) | có | có JSON mode; `response_format` có trong danh sách trường | có (`tools`); **không** hỗ trợ `tool_choice` | Khóa API bắt buộc có giá trị nhưng bị bỏ qua (ví dụ `api_key='ollama'`). Không hỗ trợ `logprobs`, `logit_bias`, `n`. Có `max_tokens`, `temperature`, `top_p`, `seed`, `stop`. Cloud: `https://ollama.com/v1`, khóa trong `OLLAMA_API_KEY` |

Tên model đổi rất nhanh (ví dụ [GEM-MOD] ghi các bản Gemini 2.5 chỉ còn cho người đã dùng, khuyên dùng bản 3.x cho dự án mới). Bài nên chỉ cách xem danh sách mới nhất (trang model của từng nhà), không hứa một cái tên cố định.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Tưởng API nhớ cuộc trò chuyện.** Không: bạn gửi lại toàn bộ `messages` mỗi lần. Hệ quả: chi phí và độ trễ tăng theo độ dài lịch sử, và có giới hạn cửa sổ ngữ cảnh.
2. **Ghi cứng API key trong code, rồi đẩy lên Git.** Dùng biến môi trường; SDK tự đọc `OPENAI_API_KEY`. Nếu đã lộ khóa, thu hồi và tạo khóa mới.
3. **Quên đổi cả `base_url` lẫn model khi đổi nhà cung cấp.** Gửi tên model của nhà này sang nhà kia thường trả 404 (`NotFoundError`) hoặc 400. Khóa của nhà này cũng không dùng được nhà kia (401).
4. **Chỉnh cả `temperature` lẫn `top_p`.** OpenAI khuyên chỉ chỉnh một trong hai [OAI-SRC], vì hai tham số cùng làm thay đổi phân phối và khó đoán tác động riêng.
5. **Nghĩ `temperature=0` luôn cho đúng một đáp án.** Gần như xác định nhưng không đảm bảo: [OAI-SRC] nói `seed` chỉ là "best effort" và "determinism is not guaranteed". Groq còn đổi 0 thành `1e-8` [GROQ-OAI]. Dùng $T=0$ cho tác vụ trích xuất, không dùng làm bằng chứng cho tính tái lập.
6. **Hiểu `max_tokens` là "viết ngắn lại".** Nó chỉ cắt cụt câu trả lời. Muốn ngắn, hãy yêu cầu trong prompt; kiểm tra `finish_reason`.
7. **Nhầm temperature đổi thứ tự token.** Không; softmax giữ thứ tự, chỉ đổi độ nhọn. Token có logit cao nhất luôn có xác suất cao nhất, ở mọi $T>0$.
8. **Nhầm top-k và top-p.** Top-k giữ số token cố định; top-p giữ số token **biến thiên** theo độ nhọn của phân phối [H20]. Và API của OpenAI không có `top_k` [OAI-SRC].
9. **Tưởng JSON mode đảm bảo đúng cấu trúc.** `json_object` chỉ đảm bảo JSON hợp lệ; muốn khớp schema phải dùng `json_schema` (nếu nhà cung cấp hỗ trợ) [OAI-SRC]. Dù vậy luôn kiểm tra và bắt `json.JSONDecodeError`.
10. **Retry mọi lỗi.** Chỉ retry lỗi tạm thời (kết nối, 408, 409, 429, ≥500) [OAI-README]. 400, 401, 403, 404, 422 là lỗi của yêu cầu hoặc quyền, thử lại không ích gì. Lỗi hết tiền hoặc vượt hạn mức chi tiêu cũng mang mã 429 nhưng không nên retry [OAI-ERR].
11. **Retry chồng retry.** SDK đã retry 2 lần mặc định; thêm vòng retry ở ngoài mà không đặt `max_retries=0` làm số lần gọi nhân lên [OAI-ERR nhắc tính SDK retry].
12. **Stream không tự retry và có thể thiếu `usage`.** Muốn có token, đặt `stream_options={"include_usage": True}`, và xử lý trường hợp luồng bị ngắt [OAI-SRC].
13. **Rate limit tính theo project, không theo khóa (Gemini).** Tạo thêm khóa trong cùng project không tăng hạn mức [GEM-RL].
14. **Giả định mọi nhà cung cấp "OpenAI-compatible" hỗ trợ đủ tính năng.** Mỗi nơi bỏ một vài trường (bảng trên). Gửi trường không hỗ trợ có thể bị bỏ qua im lặng hoặc trả 400.
15. **Dùng `system` và `developer` lẫn lộn.** OpenAI mới dùng `developer`; nhà cung cấp khác thường chỉ biết `system`. Chưa kiểm cách từng nơi xử lý `developer`.

## Liên quan tới bài nào

Slug theo mô tả của agent gọi; chưa mở `src/data/roadmap.ts` phiên này, nên `lesson-writer` cần kiểm lại.

- **Bài trước trong phần LLM:** các bài nền như `llm/transformer-llm` hoặc tương đương (token, logit, softmax ở đầu ra); softmax đã gặp ở phần ML/DL. Cần kiểm tên slug.
- **`llm/build-first-llm`:** dùng lại `SamplingViz` và lấy mẫu token; đây là bài sau trong quyết định 54.
- **`llm/prompt-engineering`** (nếu có) và các bài `llm/...` về streaming/giao diện (giáo án gốc có buổi "Lập trình giao diện: Gradio/Streamlit, streaming data từ API lên giao diện"): bài này nên hẹn các bài đó.
- **`llm/rag-chatbot`, `llm/agents`:** dùng `messages`, tool calling, structured output và xử lý lỗi từ bài này.
- **Softmax:** đã gặp ở phần ML/DL (nếu bài đó đã có); bài này chỉ thêm chia cho $T$.
- **Giáo án gốc (`giáo án ai.md`):** buổi 1 của phần LLM là "Sử dụng API liên quan tới văn bản" (dòng 72 của giáo án); chỉ tham khảo, không sửa.

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| API (giao diện lập trình ứng dụng) | API | Giữ "API" |
| Vai trò | Role (`system`, `user`, `assistant`) | Giữ tên vai trò bằng tiếng Anh trong code |
| Chỉ dẫn hệ thống | System prompt | Gloss lần đầu, giữ "system prompt" |
| Nhiệt độ | Temperature | Dịch "nhiệt độ", ký hiệu $T$, giữ `temperature` ở tên tham số |
| Lấy mẫu hạt nhân / top-p | Nucleus sampling / top-p | Giữ "top-p", gloss "nucleus sampling" |
| Top-k | Top-k sampling | Giữ nguyên |
| Logit | Logit | Giữ nguyên |
| Token | Token | Giữ nguyên |
| Truyền theo luồng | Streaming | Giữ "streaming", gloss "nhận kết quả từng mảnh" |
| Giới hạn tần suất | Rate limit | Giữ "rate limit", gloss "giới hạn số yêu cầu" |
| Lùi theo cấp số nhân | Exponential backoff | Gloss một lần, giữ "backoff" |
| Đầu ra có cấu trúc | Structured output | Dịch, giữ `response_format` |
| Chế độ JSON | JSON mode | Giữ nguyên |
| Cửa sổ ngữ cảnh | Context window | Đã có (kiểm glossary) |
| Giải mã tham lam | Greedy decoding | Dịch khi cần, ở mức $T\to0$ |

## Đọc thêm đề xuất

1. **OpenAI, hướng dẫn *Text generation* và *Error codes*.** [Text generation](https://developers.openai.com/api/docs/guides/text), [Error codes](https://developers.openai.com/api/docs/guides/error-codes). Đã đọc.
2. **`openai-python` README.** [GitHub](https://github.com/openai/openai-python). Đã đọc phần retry, timeout, streaming.
3. **Holtzman et al. (2020), *The Curious Case of Neural Text Degeneration*.** [arXiv:1904.09751](https://arxiv.org/abs/1904.09751). Đã đọc mục 3 và 6.2; chưa đọc kỹ cả bài.
4. **Hinton, Vinyals, Dean (2015), *Distilling the Knowledge in a Neural Network*.** [arXiv:1503.02531](https://arxiv.org/abs/1503.02531). Đã đọc mục 2 (công thức nhiệt độ).
5. **Fan, Lewis, Dauphin (2018), *Hierarchical Neural Story Generation*.** [ACL P18-1082](https://aclanthology.org/P18-1082/). Chỉ xác minh thư mục.
6. Trang tương thích của [Gemini](https://ai.google.dev/gemini-api/docs/openai), [Groq](https://console.groq.com/docs/openai), [Ollama](https://docs.ollama.com/api/openai-compatibility) cho người muốn đổi nhà cung cấp.

## Kiểm chứng code

Do `lesson-writer` chạy, cập nhật ngày 2026-10-24 sau review. Chưa có `.env.llm`, nên hai file gọi API chỉ đạt mức `chạy khô`, và bài **không có** khối "Kết quả mẫu". `content-reviewer` chạy thật khi có key. Ngoài bốn mức chuẩn, hai file gọi API còn được chạy hết với một máy chủ giả kiểu OpenAI viết trong scratchpad (trả phản hồi thường, `content` là `None`, JSON cắt cụt, 401, 429), để kiểm mọi nhánh của code; đó không phải `chạy thật`. Ô `stream` đã bỏ sau review (cắt độ dài bài): mục Streaming chỉ còn một đoạn trích 8 dòng trong MDX, không chạy.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `sampling.vi.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật qua `runpyo.mjs` (Python 3.14.2, NumPy 2.4.6) | Số khớp lời văn: $T = 0.5$: 0.599, 0.269, 0.081, top-p 0.9 giữ 3; $T = 1$: 0.382, 0.256, 0.14, giữ 5; $T = 1.5$: 0.286, 0.219, 0.147, giữ 7; top-k 3: 0.491, 0.329, 0.18, 0; top-p 0.9 ở $T = 1$: 0.415, 0.278, 0.153, 0.093, 0.062, rút 1000 lần được 386, 287, 172, 96, 59, năm token cuối 0. Bản `.en.py` cho cùng số |
| `chat.vi.py` | chạy khô | 2026-10-24 | `.venv-llm`: Python 3.14.5, openai 3.37.0 | Dừng ở `openai.APIConnectionError` sau khoảng 12 s (SDK thử lại 2 lần). Thiếu `OPENAI_API_KEY`: `KeyError: 'OPENAI_API_KEY'`. Máy chủ giả: lượt hai gửi 4 message (`system`, `user`, `assistant`, `user`); body chỉ có `messages`, `model`, `temperature` (đã bỏ `max_tokens`); `content` là `None` thì in "Đáp: " rỗng, không lỗi |
| `extract-json.vi.py` | chạy khô | 2026-10-24 | `.venv-llm`: Python 3.14.5, openai 3.37.0 | Code tự bắt `APIConnectionError`, nên chạy khô kết thúc bằng "Không kết nối được máy chủ…" (mã thoát 0) sau khoảng 22 s. Máy chủ giả: 200 thì in JSON; JSON cắt cụt hoặc `content` là `None` thì vào nhánh "Không đọc được JSON" (bắt `JSONDecodeError`, `TypeError`); 401 gọi 1 lần, in `Lỗi 401: {'message': ...}` (`e.body`, SDK đã bóc khóa `error`) và dòng gợi ý; 429 gọi 5 lần (1 + `max_retries=4`) rồi vào nhánh `RateLimitError` |

- Mọi file `.vi.py` và `.en.py`: `ast.parse(..., feature_version=(3, 10))` qua; ≤ 49 dòng, mỗi dòng ≤ 79 ký tự; cặp vi/en giống nhau sau khi bỏ comment và làm rỗng chuỗi. Bản `.en.py` của hai file gọi API cũng chạy với máy chủ giả như bản vi.
- Công thức trong bài (113 chỗ, kể cả quiz) render bằng `node_modules/katex` với `throwOnError`: 0 lỗi, 0 cảnh báo; MDX biên dịch được (`@mdx-js/mdx` + remark-gfm + remark-math).
- Đã đọc trong mã nguồn `openai` 3.37.0 (`.venv-llm`): `DEFAULT_MAX_RETRIES = 2`; timeout mặc định `connect=5`, còn lại 600 s; chờ trước lần thử lại thứ $n + 1$ là $\min(0.5 \cdot 2^n, 8) \cdot (1 - 0.25u)$ giây; theo `Retry-After` khi trong khoảng $(0, 120]$ giây, quá 120 giây thì không thử lại; tự thử lại 408, 409, 429, ≥ 500 và lỗi kết nối; 403 là `PermissionDeniedError`; `APITimeoutError` là lớp con của `APIConnectionError`; `APIStatusError.message` có dạng `Error code: 401 - {...}` nên code in `e.body` thay vì `e.message`; `chat.completions.create` không có `top_k`; chunk `include_usage` có `choices` rỗng.
- Cần `content-reviewer` kiểm khi chạy thật: nhà cung cấp đã chọn có nhận `temperature=0.3`/`0` và `response_format={"type": "json_object"}` không (mô hình reasoning của OpenAI chỉ nhận `temperature` mặc định; Gemini chỉ có ví dụ `parse`); `finish_reason` có ra `"length"` khi thêm `max_tokens=20` như lời văn; số token vào lượt hai có lớn hơn lượt một.
