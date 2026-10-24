# Làm giao diện với Gradio/Streamlit

Bài: `llm/gradio-streamlit` (chỉ bản vi, khoảng 10 phút đọc, đợt 2). Cần biết trước: `llm/text-api`. Quyết định liên quan trong `docs/decisions.md`: số 53 (SDK OpenAI-compatible, key đọc từ biến môi trường, code gọi API là code minh họa) và số 54 (code ở `src/code/llm/gradio-streamlit/`, hiện bằng `LocalCode`, không chọn nhà cung cấp mặc định).

Ngày tra: **24/10/2026**, bằng WebFetch, `curl` tới PyPI và mã nguồn Gradio trên GitHub. Thẻ nguồn: [PYPI-G], [PYPI-S], [G-CI], [G-GUIDE], [G-SRC], [G-CHG], [S-CHAT], [S-WS], [S-INPUT], [S-MSG], [S-STATE]. Ý không có thẻ là kiến thức chung hoặc suy ra. Chưa chạy thử code nào trong phiên này.

## Nguồn

**Phiên bản (PyPI, `https://pypi.org/pypi/<gói>/json`):**

- **[PYPI-G]** [*gradio trên PyPI*](https://pypi.org/project/gradio/). Bản mới nhất lúc tra: **6.30.0**, tải lên 08/10/2026, yêu cầu Python `>=3.10`.
- **[PYPI-S]** [*streamlit trên PyPI*](https://pypi.org/project/streamlit/). Bản mới nhất lúc tra: **1.66.1**, tải lên 21/10/2026, yêu cầu Python `>=3.11`. Lưu ý: Streamlit cần Python cao hơn mức tối thiểu của `openai` (3.10). Venv `.venv-llm/` dùng Python 3.14.5 nên đủ.

**Gradio:**

- **[G-CI]** Gradio. [*ChatInterface*](https://www.gradio.app/docs/gradio/chatinterface) (trang tham chiếu). Đã đọc: chữ ký, `fn(message, history)`, generator, `additional_inputs`, `examples`, `launch()`.
- **[G-GUIDE]** Gradio. [*Creating a Chatbot Fast*](https://www.gradio.app/guides/creating-a-chatbot-fast). Đã đọc: cách viết hàm chat, `yield` để streaming, định dạng history. Trang **không có** ví dụ gọi SDK OpenAI kèm streaming; chỉ có ví dụ một dòng `gr.load_chat("http://localhost:11434/v1/", model="llama3.2", token="***")` (cần `pip install openai`). Ví dụ gọi `client.chat.completions.create(stream=True)` trong `yield` là code của bài, phải chạy thử.
- **[G-SRC]** Gradio. Mã nguồn [`gradio/chat_interface.py`](https://github.com/gradio-app/gradio/blob/main/gradio/chat_interface.py) (nhánh `main`). Chữ ký `ChatInterface.__init__` **không còn tham số `type`**.
- **[G-CHG]** Gradio. [*CHANGELOG.md*](https://github.com/gradio-app/gradio/blob/main/CHANGELOG.md). Mục 6.0.0-dev.0 ghi PR #12012 "Remove tuples format from the chatbot". Các mục cũ (PR #9194, 2024) đã đánh dấu `type='tuples'` là deprecated.

**Streamlit:**

- **[S-CHAT]** Streamlit. [*Build conversational apps*](https://docs.streamlit.io/develop/tutorials/chat-and-llm-apps/build-conversational-apps). Đã đọc: khuôn lịch sử trong `st.session_state.messages`, `st.chat_message`, `st.chat_input`, `st.write_stream`. Trang ví dụ ghi cứng model `gpt-3.5-turbo` (cũ) và đọc key bằng `st.secrets`; bài của ta đọc `LLM_MODEL` và key từ biến môi trường (quyết định 53).
- **[S-WS]** Streamlit. [*st.write_stream*](https://docs.streamlit.io/develop/api-reference/write-magic/st.write_stream) (v1.66.0).
- **[S-INPUT]** Streamlit. [*st.chat_input*](https://docs.streamlit.io/develop/api-reference/chat/st.chat_input) (v1.66.0).
- **[S-MSG]** Streamlit. [*st.chat_message*](https://docs.streamlit.io/develop/api-reference/chat/st.chat_message) (v1.66.0).
- **[S-STATE]** Streamlit. [*Session State*](https://docs.streamlit.io/develop/concepts/architecture/session-state).

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Code mẫu Gradio và Streamlit chạy được với `openai` 3.37.0 và nhà cung cấp thật | Chưa chạy. Chưa cài `gradio`, `streamlit` vào `.venv-llm/` | `lesson-writer` viết và kiểm; phiên chính thêm `gradio` và `streamlit` vào `scripts/requirements-llm.txt` (bản đã chạy thử). Mức kiểm tối thiểu: `chạy khô` (ứng dụng khởi động được) |
| Định dạng `history` của Gradio khi `content` là chuỗi hay là danh sách mảnh | [G-GUIDE] nói ví dụ có cả hai dạng; chưa thử với `ChatInterface` văn bản thuần ở 6.30.0 | Hàm chat nên lấy `content` dạng chuỗi và thử thật; bài nói history là danh sách dict `role`/`content` |
| Có ghi "từ phiên bản nào" Streamlit thêm `st.write_stream` | Trang tham chiếu chỉ có bộ chọn v1.66.0, không ghi "added in" | Không ghi số phiên bản thêm vào; chỉ nói "bản hiện hành 1.66" |
| Gradio 6 có `gr.ChatInterface` đòi `type="messages"` hay không | Chữ ký trong mã nguồn không có `type`; [G-CI] không nhắc `type`. Mốc bỏ tuples là 6.0 theo changelog | Code mẫu **không** truyền `type`. Bài ghi `gradio>=6` và nhắc người đọc code cũ trên mạng hay có `type="messages"` (đã bỏ) |
| Mức hỗ trợ `stream=True` của từng nhà cung cấp | Ollama có; Gemini có (theo `text-api.md`); Groq chưa kiểm | Bảng nhà cung cấp ở `text-api` là nguồn chuẩn; bài này link tới đó |
| Chạy thật của `st.write_stream` với luồng của nhà cung cấp không phải OpenAI | [S-WS] chỉ nói parse sẵn luồng OpenAI (Chat Completions và Responses) và LangChain | Mọi nhà cung cấp trong bài dùng SDK `openai` nên luồng cùng kiểu; vẫn phải chạy thử |
| Triển khai ứng dụng (Hugging Face Spaces, Streamlit Community Cloud) | Chưa tra | Ngoài phạm vi bài; hẹn bài `llm/docker-cloud` |

## Ý chính

- **Vì sao cần giao diện:** bài `text-api` chạy trong terminal. Giao diện chat cho người không biết lập trình dùng được, và cho bạn thấy cuộc trò chuyện. Cả hai thư viện biến vài chục dòng Python thành ứng dụng web, không cần HTML hay JavaScript. Chỉ tải được bản chạy trên máy bạn: ứng dụng là chương trình Python chạy một server cục bộ (nên bài dùng `LocalCode`, không chạy trên trang).
- **Gradio, ý tưởng cốt lõi [G-CI]:** bạn viết **một hàm** `fn(message, history)`; `gr.ChatInterface(fn)` dựng sẵn khung chat (ô nhập, nút gửi, danh sách tin nhắn, ví dụ mẫu, nút dừng). Hàm trả một chuỗi thì hiện một lần. Hàm là **generator** (dùng `yield`) thì chữ hiện dần. `demo.launch()` mở server.
- **Streamlit, ý tưởng cốt lõi [S-CHAT, S-STATE]:** bạn viết một **script chạy từ trên xuống dưới**, và Streamlit chạy lại **toàn bộ script** mỗi khi người dùng làm gì đó. Biến Python thường bị đặt lại mỗi lần chạy lại, nên lịch sử phải giữ trong `st.session_state`. Khuôn: nếu chưa có khóa `messages` thì tạo danh sách rỗng; vẽ lại mọi tin nhắn cũ bằng `st.chat_message`; `st.chat_input` trả `None` cho tới khi người dùng gửi; khi có chữ thì thêm vào lịch sử và hỏi model. Chạy bằng `streamlit run app.py`.
- **Lịch sử hội thoại có hai tầng:** (1) giao diện cần nhớ để vẽ lại; (2) API không giữ trạng thái (`text-api`), nên bạn phải gửi lại cả danh sách `messages` mỗi lượt. Ở Gradio, `history` do thư viện giữ, bạn nối thêm tin mới rồi gửi cả danh sách. Ở Streamlit, bạn tự giữ danh sách trong `session_state` và gửi nó đi. Lịch sử dài thì tốn token và có thể vượt cửa sổ ngữ cảnh.
- **Streaming lên giao diện:** gọi API với `stream=True`, nhận từng mảnh `chunk.choices[0].delta.content` (mảnh có thể rỗng hoặc `None`, nên phải kiểm). Gradio: cộng dồn chuỗi rồi `yield` phần đã có (mỗi lần `yield` thay phần cũ; thư viện chỉ gửi phần khác biệt tới trình duyệt [G-GUIDE]). Streamlit: đưa thẳng luồng của OpenAI vào `st.write_stream`, hàm hiện chữ dần và **trả về toàn bộ văn bản** để bạn lưu vào lịch sử [S-WS, S-CHAT]. Nếu không lưu giá trị trả về, lượt sau model "quên" câu trả lời trước.
- **Định dạng messages:** cả hai dùng dạng dict `{"role": "user" | "assistant", "content": ...}`, giống danh sách `messages` của `chat.completions.create`. Vì vậy chuyển tiếp lịch sử vào API gần như không phải đổi gì. Ở Gradio, `history` không chứa `system`; bạn tự thêm tin `system` ở đầu danh sách trước khi gọi API (suy ra từ cấu trúc; kiểm khi chạy thử).
- **So sánh (cho bảng trong bài):**

| | Gradio | Streamlit |
|---|---|---|
| Mô hình | Gọi hàm, thư viện lo khung giao diện | Chạy lại cả script mỗi lần tương tác |
| Chat | Một dòng: `gr.ChatInterface(fn)` | Tự ghép `st.chat_message`, `st.chat_input`, `session_state` |
| Lịch sử | Thư viện giữ, truyền vào `fn` | Bạn giữ trong `st.session_state` |
| Streaming | `yield` chuỗi cộng dồn | `st.write_stream(luồng)` |
| Hợp với | Demo mô hình nhanh, chia sẻ liên kết | Ứng dụng nhiều thành phần (bảng, biểu đồ, thanh bên) |
| Chạy | `python app.py` | `streamlit run app.py` |
| Python tối thiểu (PyPI, 10/2026) | 3.10 | 3.11 |

  Cột "Hợp với" là nhận xét chung, không phải số liệu từ tài liệu.
- **Nối API OpenAI-compatible:** dựng `client` như khuôn ở `llm-lessons.md` mục 2.3 (`OPENAI_BASE_URL`, `OPENAI_API_KEY`, `LLM_MODEL`), dùng lại từ bài `text-api`. Gradio cũng có `gr.load_chat(base_url, model=..., token=...)` tạo giao diện chat từ một endpoint OpenAI-compatible chỉ bằng một dòng [G-GUIDE]; bài chỉ nhắc để so sánh, vì code tự viết dạy được cơ chế (chưa kiểm hành vi bên trong của hàm này).
- **Ngoài phạm vi (hẹn bài sau):** triển khai ứng dụng lên cloud (`llm/docker-cloud`), RAG trong giao diện (`llm/rag-chatbot`), prompt hệ thống tốt (`llm/prompt-engineering`).

## Công thức quan trọng

Không có công thức toán. Hai khuôn code ngắn dùng làm khung cho bài (diễn đạt lại từ [G-GUIDE] và [S-CHAT], phải chạy thử trước khi đưa vào bài):

- Gradio: hàm `chat(message, history)` dựng danh sách `messages` = tin `system` + `history` + tin `user` mới; gọi `client.chat.completions.create(..., stream=True)`; cộng dồn `delta.content` và `yield` chuỗi; `gr.ChatInterface(chat).launch()`.
- Streamlit: khởi tạo `st.session_state.messages`; vẽ lại lịch sử; `if prompt := st.chat_input(...)`: thêm tin user, mở `st.chat_message("assistant")`, `reply = st.write_stream(luồng)`, thêm tin assistant vào lịch sử.

Mỗi chương trình là một file hoàn chỉnh, ≤ 60 dòng (quy ước mục 2.3). Gói pip: `gradio>=6` và `streamlit` (cần Python 3.11+); dòng `pip install` không ghim bản theo mục 2.6, trừ khi `gradio` đổi API (ghi mức tối thiểu).

## Ví dụ hoặc trực giác hay

Diễn đạt lại; phần có "(gợi ý)" là của `summarizer`.

- **Gradio như cái khung ảnh, Streamlit như bảng trắng (gợi ý):** Gradio đưa sẵn khung, bạn chỉ đưa ảnh (hàm). Streamlit đưa bảng trắng, mỗi lần có ai chạm vào thì xóa sạch và vẽ lại từ đầu, nên cái gì cần nhớ phải ghi vào sổ tay (`session_state`).
- **Phát thanh viên đọc từng câu (gợi ý):** streaming giống việc đọc tin trực tiếp: người nghe nghe ngay phần đã đọc. Với Gradio, bạn đọc lại cả đoạn từ đầu mỗi lần thêm một từ (`yield` chuỗi cộng dồn), và hệ thống chỉ gửi phần mới. Với Streamlit, hàm `write_stream` tự đọc tiếp và đưa lại cả bản ghi để bạn lưu.
- **Ví dụ hội thoại cho mục Minh họa (gợi ý):** bảng hai cột "Vai trò / Nội dung" cho ba lượt, thêm cột hoặc chú thích "gửi lên API ở lượt 3" để thấy cả lịch sử được gửi lại (theo quy ước mục 2.7 điểm 2).
- **Thí nghiệm "quên" (gợi ý):** cho người đọc bỏ dòng lưu câu trả lời vào lịch sử rồi hỏi "câu em vừa trả lời là gì?", để thấy model quên. Phải thử thật trước khi viết kết quả.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Dùng biến Python thường để lưu lịch sử ở Streamlit.** Script chạy lại từ đầu mỗi lần tương tác, biến bị đặt lại; phải dùng `st.session_state` [S-STATE].
2. **Ghi đè `st.session_state.messages = []` ở đầu script.** Phải kiểm "chưa có khóa" mới khởi tạo, nếu không lịch sử mất mỗi lượt [S-STATE].
3. **Quên lưu câu trả lời của model vào lịch sử.** Ở Streamlit, giá trị `st.write_stream` trả về phải được thêm vào lịch sử [S-WS, S-CHAT]. Ở Gradio, lịch sử do thư viện giữ, nhưng nếu bạn `yield` sai (chỉ phần mới thay vì chuỗi cộng dồn) thì khung chat hiện thiếu chữ [G-GUIDE].
4. **Mảnh stream có `content` rỗng hoặc `None`.** Phải kiểm trước khi cộng chuỗi, nếu không `TypeError` hoặc chữ `None` hiện lên (`text-api.md`: luồng gửi các chunk, mảnh cuối có thể không có nội dung; kiểm khi chạy thử).
5. **Tưởng Gradio `history` có tin `system`.** Tin `system` bạn tự thêm khi gọi API; `history` chỉ gồm lượt của người dùng và trợ lý [G-CI] (kiểm khi chạy thử).
6. **Dùng ví dụ cũ có `type="messages"` hoặc history dạng cặp (tuple).** Đã bị bỏ ở Gradio 6 [G-CHG, G-SRC]. Code cũ trên mạng có thể báo lỗi.
7. **Lịch sử dài làm chi phí và độ trễ tăng.** Mỗi lượt gửi lại cả hội thoại (xem `text-api.md`); ứng dụng thật cần cắt bớt hoặc tóm tắt, hẹn các bài sau.
8. **Lộ key.** Đọc từ biến môi trường, không ghi cứng, không dán vào ô nhập trên giao diện công khai. Tutorial của Streamlit dùng `st.secrets` (`.streamlit/secrets.toml`), nhưng bài này thống nhất dùng biến môi trường (quyết định 53) để cùng khuôn với `text-api`. Nếu chạy `streamlit run` ở thư mục có `secrets.toml`, đừng đẩy file đó lên Git.
9. **Mở ứng dụng ra mạng công khai mà không giới hạn.** `launch(share=True)` (có ở Gradio, chưa tra trong phiên này) hay triển khai công khai cho người lạ dùng key của bạn có thể tốn tiền và vượt hạn mức. Chỉ ghi nếu kiểm lại tài liệu; nếu không, bỏ.
10. **Nghĩ hai thư viện chỉ dành cho chatbot.** Cả hai làm được giao diện cho bất kỳ hàm Python nào (ảnh, bảng, âm thanh); `ChatInterface` và `st.chat_*` chỉ là phần dựng sẵn cho chat.

## Liên quan tới bài nào

Kiểm theo `src/data/roadmap.ts` (phiên này, đã đọc):

- **Cần biết trước:** `llm/text-api` (SDK OpenAI-compatible, `messages`, streaming, biến môi trường). Bài này dựng trên bài đó và link tới bảng nhà cung cấp ở đó.
- **Bài kế tiếp:** `llm/docker-cloud` (có `llm/gradio-streamlit` là bài cần biết trước): đóng gói ứng dụng của bài này thành image. Nên giữ ứng dụng ở dạng một file để bài sau đóng gói được.
- **Cùng đợt 2 (không link, quyết định mục 2.8):** `llm/prompt-engineering`, `llm/image-video-api`, `llm/web-crawling-mongodb`.
- **Đợt sau:** `llm/rag-chatbot` (giao diện chat có truy xuất), `llm/agents`.
- **Giáo án gốc (`giáo án ai.md`, dòng 73):** Buổi 2 của phần LLM là "Lập trình giao diện: công cụ Gradio/StreamLit, kết nối giao diện với API, streaming data từ API lên giao diện". Bài này phủ đủ ba ý đó.

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Giao diện chat | Chat interface | Dịch |
| Lịch sử hội thoại | Conversation history | Dịch, giữ `history` trong code |
| Phiên làm việc | Session (`st.session_state`) | Giữ `session_state`; gloss "trạng thái của một phiên trình duyệt" |
| Truyền theo luồng | Streaming | Đã đề xuất ở `text-api`: giữ "streaming" |
| Hàm sinh (generator) | Generator | Giữ "generator", gloss "hàm dùng `yield`" |
| Chạy lại script | Rerun | Dịch "chạy lại"; giữ "rerun" khi nhắc cơ chế Streamlit |
| Mảnh | Chunk | Đã đề xuất ở `text-api` |

## Đọc thêm đề xuất

1. [Gradio, *ChatInterface*](https://www.gradio.app/docs/gradio/chatinterface) và [*Creating a Chatbot Fast*](https://www.gradio.app/guides/creating-a-chatbot-fast). Đã đọc.
2. [Streamlit, *Build conversational apps*](https://docs.streamlit.io/develop/tutorials/chat-and-llm-apps/build-conversational-apps), [*st.write_stream*](https://docs.streamlit.io/develop/api-reference/write-magic/st.write_stream), [*Session State*](https://docs.streamlit.io/develop/concepts/architecture/session-state). Đã đọc.
3. Link trang tài liệu của đúng phiên bản đã chạy thử khi trang có chọn phiên bản (quy ước mục 2.7 điểm 5).

## Kiểm chứng code

Do `lesson-writer` chạy, thư mục làm việc ở scratchpad, Python gọi bằng `-I -X utf8`. Chưa có `.env.llm` nên chưa chạy thật với nhà cung cấp nào; bài không có kết quả mẫu. Ngoài mức `chạy khô` theo định nghĩa (cổng đóng `127.0.0.1:9`), cả hai ứng dụng còn được chạy hết luồng với một **server giả lập** API kiểu OpenAI (thư viện chuẩn `http.server`, trả SSE gồm mảnh đầu `content: ""`, 5 mảnh chữ, mảnh `finish_reason` có `delta` rỗng, một mảnh không có `choices`, rồi `[DONE]`; server ghi lại `messages` nhận được).

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `gradio-chat.vi.py` | chạy khô | 2026-10-24 | Python 3.14.5, openai 3.37.0, gradio 6.30.0 | `ast.parse(feature_version=(3, 10))` qua; 52 dòng, dòng dài nhất 78 ký tự. Nạp file bằng `runpy` (không `launch`), dựng được `gr.ChatInterface`; gọi `chat` với cổng đóng: `openai.APIConnectionError`. Thiếu `OPENAI_API_KEY`: `KeyError: 'OPENAI_API_KEY'` trước khi mở server. Với server giả lập: `yield` cộng dồn đúng 5 bước tới chuỗi đầy đủ; lượt 2 (history lấy qua `gr.Chatbot().postprocess` rồi `preprocess`, đúng đường đi của Gradio) gửi lên `system, user, assistant, user`, `content` đều là chuỗi. `launch(prevent_thread_lock=True)` rồi gọi qua `gradio_client` (`/chat`) trả câu trả lời đầy đủ |
| `gradio-chat.en.py` | chạy khô | 2026-10-24 | như trên | Như bản vi với server giả lập; cùng cấu trúc từng dòng sau khi bỏ comment và làm rỗng chuỗi |
| `streamlit-chat.vi.py` | chạy khô | 2026-10-24 | Python 3.14.5, openai 3.37.0, streamlit 1.66.1 | `ast.parse` qua; 42 dòng, dòng dài nhất 77 ký tự. `AppTest.from_file`: lần chạy đầu không lỗi; gửi tin với cổng đóng: `APIConnectionError: Connection error.` hiện trong app. Thiếu key: `KeyError` ngay lần chạy đầu. Với server giả lập, hai lượt: `session_state.messages` có 2 rồi 4 tin, `st.write_stream` trả về chuỗi đầy đủ, lượt 2 gửi `system, user, assistant, user`. Bản bỏ dòng lưu `reply`: lượt 2 gửi `system, user, user`. Bản khởi tạo `messages = []` không điều kiện: lượt 2 chỉ còn tin của lượt 2. `streamlit run --server.headless true` khởi động, `/_stcore/health` trả `ok` |
| `streamlit-chat.en.py` | chạy khô | 2026-10-24 | như trên | Như bản vi với `AppTest` và server giả lập |
| khối `python` trong bài (2 khối: khởi tạo `session_state`, vòng lặp streaming 7 dòng có `if not chunk.choices`) | cú pháp | 2026-10-24 | Python 3.14.5 | `ast.parse(feature_version=(3, 10))` qua; kiểm lại sau khi sửa theo review |
| `gradio-chat.vi.py`, `gradio-chat.en.py` (content-reviewer) | cú pháp + chạy khô | 2026-10-24 | Python 3.14.5, openai 3.37.0, gradio 6.30.0 | Đối chiếu lại với server giả lập: `yield` cộng dồn, lượt 2 gửi `content` dạng chuỗi. `gr.ChatInterface(chat, type="messages")`: `TypeError` (tham số `type` đã bỏ ở Gradio 6). `save_history: bool = False` có trong chữ ký `gr.ChatInterface` (lưu vào local storage của trình duyệt) |
| `streamlit-chat.vi.py`, `streamlit-chat.en.py` (content-reviewer) | cú pháp + chạy khô | 2026-10-24 | Python 3.14.5, openai 3.37.0, streamlit 1.66.1 | `AppTest` với server giả lập, 3 lượt: lượt 1, 2, 3 gửi lên 2, 4, 6 tin (đúng $2k$) |
