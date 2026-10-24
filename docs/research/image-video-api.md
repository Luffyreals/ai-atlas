# API cho hình ảnh và video (Image and Video APIs)

Bài: `llm/image-video-api` (chỉ bản vi, khoảng 10 phút đọc; tiên quyết `llm/text-api`). Quyết định liên quan trong `docs/decisions.md`: số 53 (SDK OpenAI-compatible, đọc khóa từ biến môi trường), 54 (code ở `src/code/llm/image-video-api/`, bảng nhà cung cấp chỉ ở `text-api`), 54 "phiên chính tự chọn" (video chỉ ở mức khái niệm), 55 (kết quả mẫu chỉ lấy từ lần chạy thật).

Ngày tra: **24/10/2026**, bằng WebFetch, WebSearch và mã nguồn `openai-python` trên GitHub. Thẻ nguồn: [OAI-VIS], [OAI-IMG], [OAI-VID], [OAI-SRC], [GEM-OAI], [GEM-IMG], [GROQ-VIS], [OLL-OAI], [C2PA], [OAI-C2PA]. Giá tiền không ghi. Giáo án gốc: buổi 11 phần LLM "Sử dụng API liên quan tới hình ảnh + video" (chỉ tham khảo).

## Nguồn

- **[OAI-VIS]** OpenAI. [*Images and vision*](https://developers.openai.com/api/docs/guides/images-vision). Đã đọc: cách đưa ảnh, `detail`, định dạng, giới hạn. Ví dụ trên trang dùng **Responses API**; trang liệt kê Chat Completions là API hỗ trợ ảnh nhưng không minh họa cú pháp, nên cú pháp Chat Completions lấy từ [OAI-SRC].
- **[OAI-IMG]** OpenAI. [*Image generation*](https://developers.openai.com/api/docs/guides/image-generation). Đã đọc 100 000 ký tự đầu của 114 677; phần cuối chưa đọc.
- **[OAI-VID]** OpenAI. [*Video generation with Sora*](https://developers.openai.com/api/docs/guides/video-generation). Trang ghi API **đã ngừng**; giữ lại để tham khảo.
- **[OAI-SRC]** OpenAI. Mã nguồn `openai-python`: [`chat_completion_content_part_image_param.py`](https://github.com/openai/openai-python/blob/main/src/openai/types/chat/chat_completion_content_part_image_param.py), [`image_generate_params.py`](https://github.com/openai/openai-python/blob/main/src/openai/types/image_generate_params.py), [`images_response.py`](https://github.com/openai/openai-python/blob/main/src/openai/types/images_response.py). Chú thích trong mã sinh từ đặc tả API.
- **[GEM-OAI]** Google. [*OpenAI compatibility*](https://ai.google.dev/gemini-api/docs/openai) (ảnh vào, `images.generate`, video, embeddings).
- **[GEM-IMG]** Google. [*Image generation*](https://ai.google.dev/gemini-api/docs/image-generation) (API gốc của Gemini, không phải lớp tương thích). Đã đọc 100 000 ký tự đầu của 174 170.
- **[GROQ-VIS]** Groq. [*Vision*](https://console.groq.com/docs/vision).
- **[OLL-OAI]** Ollama. [*OpenAI compatibility*](https://docs.ollama.com/api/openai-compatibility).
- **[C2PA]** C2PA. [*Coalition for Content Provenance and Authenticity*](https://c2pa.org/). Trang chủ chỉ nêu mục đích; không nêu hạn chế.
- **[OAI-C2PA]** OpenAI. [*C2PA in ChatGPT Images*](https://help.openai.com/en/articles/8912793-c2pa-in-chatgpt-images). **WebFetch trả 403, chưa đọc trực tiếp**; nội dung dưới đây lấy từ bản tóm tắt của kết quả tìm kiếm, nên xem là chưa xác minh (xem bảng cuối).

## Ý chính

1. **Ảnh vào là một phần tử trong `content`.** Với Chat Completions, `content` của lượt `user` là **danh sách** các phần: `{"type": "text", "text": ...}` và `{"type": "image_url", "image_url": {"url": ..., "detail": ...}}` [OAI-SRC]. Một lượt trộn được chữ và ảnh.
2. **`url` là địa chỉ web hoặc data URL base64.** Ảnh cục bộ: đọc byte, mã hóa base64, ghép thành `data:image/jpeg;base64,<...>` (hoặc `image/png`) [OAI-VIS, GEM-OAI, GROQ-VIS, OLL-OAI]. Base64 là dạng chạy được ở **cả bốn** nhà cung cấp; URL ảnh thì Ollama không hỗ trợ [OLL-OAI].
3. **`detail`** (tùy chọn, OpenAI): `auto`, `low`, `high`, `original`; mặc định `auto`; giá trị được phép phụ thuộc model [OAI-SRC, OAI-VIS]. Ý: `low` cho hiểu thô và rẻ, `high` cho độ chi tiết thường, `original` cho ảnh nhỏ chữ dày. Mỗi ảnh tính vào token vào và bị tính tiền [OAI-VIS].
4. **Định dạng và giới hạn (OpenAI):** PNG, JPEG, WEBP, GIF không động; tổng yêu cầu tối đa 512 MB, tối đa 1 500 ảnh mỗi yêu cầu; giới hạn theo model còn thấp hơn [OAI-VIS]. Bài không cần ghi số; nên ghi "mỗi nhà một giới hạn, xem tài liệu".
5. **Sinh ảnh dùng endpoint khác chat:** `client.images.generate(model=..., prompt=..., size=..., n=...)`. Kết quả nằm ở `response.data[0]`, thường là `b64_json` (chuỗi base64) rồi giải mã ra byte để lưu file [OAI-IMG, GEM-OAI].
6. **Tham số hiện hành của OpenAI [OAI-IMG, OAI-SRC]:** `model`, `prompt`, `n` (mặc định 1), `size` (gợi ý 1024x1024, 1536x1024, 1024x1536; cũng nhận `WIDTHxHEIGHT` tùy chỉnh theo điều kiện trên trang), `quality` (`low`, `medium`, `high`, `xhigh`, `max`, `auto`), `output_format` (`png` mặc định, `jpeg`, `webp`), `background`, `moderation` (`auto` hoặc `low`), `safety_identifier` (mã người dùng cuối ẩn danh, thay cho `user` đã deprecated). Với các model ảnh GPT, trang nói API trả base64 và **không mô tả** lựa chọn URL.
7. **`response_format` khác nhau theo nhà cung cấp.** SDK vẫn có trường `response_format: "url" | "b64_json"` [OAI-SRC], nhưng trang OpenAI cho model ảnh GPT không nhắc nó [OAI-IMG]. Gemini liệt kê `response_format` trong tham số được hỗ trợ, ví dụ dùng `'b64_json'` [GEM-OAI]. Code mẫu nên **đọc `b64_json`**, và bài nói rõ nơi nào trả URL thì URL hết hạn nên phải tải về.
8. **Gemini qua lớp tương thích:** `images.generate` chỉ nhận `prompt`, `model`, `n`, `size`, `response_format`; tham số khác bị **bỏ qua im lặng**; thứ khác (như `aspect_ratio`, `safety_settings`) đi qua `extra_body` [GEM-OAI]. Trang vẫn ghi hỗ trợ thư viện OpenAI là beta.
9. **Groq và Ollama chỉ hiểu ảnh, không sinh ảnh** theo các trang đã đọc: Groq nhận ảnh vào, ra chữ [GROQ-VIS]; trang Ollama không nhắc `/v1/images/generations` [OLL-OAI]. Chưa dùng được `images.generate` với hai nơi này.
10. **Video: job bất đồng bộ.** Một lần render mất vài phút, nên API không trả video ngay: `POST` tạo job, trả `id` và trạng thái; bạn **hỏi lại** (polling) theo chu kỳ, hoặc nhận webhook; tải file khi xong; trạng thái `queued`, `in_progress`, `completed`, `failed` [OAI-VID]. Link tải chỉ sống tối đa khoảng một giờ nên phải chép về kho của bạn [OAI-VID]. Dùng làm khuôn khái niệm: gửi yêu cầu, giữ `id`, chờ, lấy kết quả.
11. **Video không còn ổn định giữa các nhà.** Videos API của OpenAI ngừng ngày 24/9/2026 [OAI-VID]. Gemini ghi các model Veo 3.1 Preview đóng ngày 22/10/2026; video với `gemini-omni-1.1-flash` **không** có trên endpoint `/v1/videos` tương thích OpenAI, mà qua SDK gốc và Interactions API [GEM-OAI]. Hệ quả cho bài: **không có code video chạy được qua SDK `openai`**; chỉ giảng mô hình job và polling, có thể kèm đoạn giả mã tự viết (không gắn với nhà nào).
12. **Kiểm duyệt đầu vào và đầu ra.** OpenAI lọc cả prompt lẫn ảnh sinh ra; yêu cầu bị chặn trả `error.code = "moderation_blocked"`, có thể kèm `moderation_stage` (`input`, `output`, `unknown`) và `categories`; lỗi `image_generation_user_error` không nên thử lại khi chưa đổi prompt [OAI-IMG]. Có thể cần xác minh tổ chức trước khi dùng model ảnh [OAI-IMG]. Bài video (cũ) của OpenAI từ chối nhân vật có bản quyền, người thật và ảnh đầu vào có mặt người [OAI-VID].
13. **Nguồn gốc nội dung (provenance).** C2PA là chuẩn mở "Content Credentials", gắn lịch sử nguồn gốc và chỉnh sửa vào tệp, kiểu "nhãn dinh dưỡng" [C2PA]. Gemini nói mọi ảnh sinh ra đều có watermark **SynthID** [GEM-IMG]. Theo bản tóm tắt chưa xác minh của [OAI-C2PA]: OpenAI từng nói metadata dễ bị xóa vô tình hoặc cố ý (chụp màn hình, nền tảng xã hội), và nay kèm watermark vô hình; không tín hiệu nào đảm bảo nội dung đúng, chưa chỉnh sửa hay đúng bản quyền. Ý đáng dạy: metadata dễ mất, watermark bền hơn nhưng không tuyệt đối, **không thấy dấu cũng không chứng minh ảnh là thật**.
14. **Bản quyền:** quyền sở hữu và rủi ro với ảnh sinh ra phụ thuộc điều khoản của từng nhà cung cấp và luật từng nước. Chưa tra điều khoản cụ thể (xem bảng cuối). Bài nên khuyên: đọc điều khoản dịch vụ, không đưa ảnh có bản quyền hay mặt người thật khi chưa có phép, ghi rõ ảnh do AI tạo khi công bố.

## Công thức quan trọng

Không có. Một điểm kỹ thuật nhỏ: base64 biểu diễn ba byte bằng bốn ký tự nên chuỗi dài hơn tệp gốc khoảng một phần ba (kiến thức chung, không cần nguồn). Vì vậy ảnh lớn nên thu nhỏ trước khi nhúng.

## Bảng nhà cung cấp (kiểm tra 24/10/2026)

Chỉ để lấy ý. Theo quyết định 54, **bảng nhà cung cấp chính thức nằm ở `text-api`**; bài này link sang đó và chỉ ghi phần ảnh. Tên model đổi rất nhanh, nên không ghi cứng vào code (biến `IMAGE_MODEL` theo quy ước `<KHẢ_NĂNG>_MODEL` ở `docs/architecture/llm-lessons.md` mục 2.3).

| Nhà cung cấp | Ảnh vào qua `messages` | Sinh ảnh `images.generate` | Video qua SDK `openai` |
|---|---|---|---|
| OpenAI | có: URL, data URL base64, file ID; `detail` [OAI-VIS, OAI-SRC] | có; model ví dụ trên trang: `gpt-image-2.5-sunburst`, `gpt-image-2.5-flare`; trả base64 [OAI-IMG] | không: Videos API đã ngừng 24/9/2026 [OAI-VID] |
| Google Gemini | có, ví dụ data URL base64 với `gemini-3.8-flash` [GEM-OAI] | có, tham số hạn chế, ví dụ trang dùng `gemini-2.5-flash-image` [GEM-OAI]; trang gốc ghi model này là **legacy** [GEM-IMG] | không [GEM-OAI] |
| Groq | có: URL (tối đa 20 MB) hoặc data URL base64; Qwen tối đa 3 ảnh/yêu cầu; có JSON mode và tool use kèm ảnh [GROQ-VIS] | không nêu [GROQ-VIS] | không nêu |
| Ollama | có: **chỉ base64**, không URL [OLL-OAI] | trang không nhắc [OLL-OAI] | không nêu |

Tên model vision của Groq trên [GROQ-VIS] (`qwen/qwen3.8-27b`; một model khác đang ở bản xem trước giới hạn) và model Ollama nhận ảnh: **chưa tra**; cần `ollama pull` một model có hỗ trợ ảnh, tên chưa kiểm.

## Ví dụ hoặc trực giác hay

Diễn đạt lại; phần "(gợi ý)" là của `summarizer`.

- **Ảnh thành chữ trước khi model đọc (gợi ý):** với model chat, ảnh bị cắt thành các mảnh nhỏ rồi biến thành token như chữ, nên ảnh to tốn token và tiền giống đoạn văn dài. Hợp để nối sang `multimodal`.
- **Hai cánh cửa khác nhau (gợi ý):** hiểu ảnh đi qua cửa chat (`chat.completions`, ảnh nằm trong tin nhắn); tạo ảnh đi qua cửa riêng (`images.generate`, vào là prompt, ra là byte ảnh). Nhiều người tưởng một API làm cả hai.
- **Gửi bưu kiện qua dịch vụ giao nhận (gợi ý) cho video:** bạn gửi đơn, nhận mã vận đơn (`id`), hỏi tình trạng định kỳ, và khi hàng tới thì phải lấy ngay vì kho chỉ giữ một giờ. Gần với polling có backoff đã học ở `text-api`.
- **Ví dụ bù lại sự thay đổi nhanh (từ [OAI-VID] và [GEM-OAI]):** hai nhà lớn đều đóng hoặc đổi API video trong vài tuần của năm 2026. Dùng làm lý do để bài nói "đừng viết cứng vào một nhà".
- **Dấu vân tay trong ảnh (gợi ý):** C2PA như tờ khai đính kèm tệp, dễ bị xé; watermark như dấu in chìm trong giấy, khó xóa hơn nhưng vẫn có thể bị phá bằng chỉnh sửa mạnh.

## Mô hình code đề xuất (cho `src/code/llm/image-video-api/`, chưa chạy thử)

Chưa chạy thử, chưa có key. Cần `reviewer` chạy thật theo mục 2.5 của `llm-lessons.md`.

- **`describe-image`** (hiểu ảnh, `LocalCode`): đọc một ảnh nhỏ cùng thư mục (hoặc tự tạo bằng thư viện chuẩn để không cần tệp ngoài), mã hóa base64, ghép data URL, gọi `client.chat.completions.create(model=os.environ["LLM_MODEL"], messages=[{"role": "user", "content": [{"type": "text", ...}, {"type": "image_url", "image_url": {"url": data_url}}]}])`. `LLM_MODEL` phải là model có khả năng nhìn ảnh; bài nói rõ.
- **`generate-image`** (sinh ảnh, `LocalCode`): `client.images.generate(model=os.environ["IMAGE_MODEL"], prompt=..., size="1024x1024", n=1)`, rồi `base64.b64decode(response.data[0].b64_json)` ghi ra tệp. Không truyền `response_format` mặc định, vì model ảnh GPT không mô tả nó (ý chính 7); nhà nào cần thì bài nói. Thêm `try/except` cho `openai.BadRequestError` (kiểm duyệt).
- **Chuyên đề job video:** chỉ ở mức khái niệm, không có `.py` chạy được qua SDK `openai` (ý chính 11). Nếu cần, một đoạn giả mã nhỏ trong MDX.
- **Hội thoại mẫu cho mục Minh họa** (quy ước mục 2.7): bảng "Vai trò / Nội dung" với một lượt `user` có hai phần (chữ và ảnh), một lượt `assistant`. Lưu ý lượt `user` có `content` dạng danh sách, khác với `content` là chuỗi ở `text-api`.
- Kết quả mẫu chỉ lấy từ lần chạy thật; chữ `IMAGE_MODEL` là biến môi trường, không ghi tên model vào code.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Nhầm `image_url` với "chỉ nhận URL".** Tên là `image_url` nhưng `url` cũng nhận data URL base64; Ollama chỉ nhận dạng này [OLL-OAI].
2. **Gửi ảnh cho model không nhìn được ảnh.** Lỗi 400 hoặc câu trả lời bịa. `LLM_MODEL` phải là model có khả năng vision; mỗi nơi một model và một giới hạn số ảnh (Groq: 3 ảnh với Qwen) [GROQ-VIS].
3. **Quên tiền tố `data:image/...;base64,`** hoặc ghi sai kiểu MIME so với định dạng thật.
4. **Tưởng một endpoint làm cả hiểu và sinh ảnh.** Chat để hiểu; `images.generate` để tạo [OAI-IMG].
5. **Truyền tham số `images.generate` cho nhà cung cấp khác rồi tưởng có tác dụng.** Gemini bỏ qua im lặng tham số lạ [GEM-OAI]; Groq và Ollama chưa hỗ trợ sinh ảnh.
6. **Đọc `url` trong kết quả khi API trả `b64_json`** (hoặc ngược lại): `response.data[0].url` có thể là `None`. Kiểm hai trường [OAI-SRC].
7. **Quên rằng ảnh tốn token và tiền** [OAI-VIS]; ảnh lớn nên thu nhỏ, hoặc dùng `detail="low"` khi chỉ cần ý chung.
8. **Chờ video như gọi chat.** Video là job: không có kết quả ngay; không polling dày đặc, dùng backoff hoặc webhook; tải file sớm vì link hết hạn [OAI-VID].
9. **Thử lại vô hạn khi bị kiểm duyệt.** `moderation_blocked` và `image_generation_user_error` không đổi nếu prompt không đổi [OAI-IMG].
10. **Coi thiếu C2PA là bằng chứng ảnh thật, hoặc có C2PA là bằng chứng ảnh đúng sự thật.** Metadata dễ mất; có dấu chỉ nói công cụ nào đã tạo, không nói nội dung đúng [OAI-C2PA, chưa xác minh trực tiếp].
11. **Ghi cứng tên model sinh ảnh/video.** Cả hai nhóm model đổi hoặc ngừng trong vài tuần (xem ý chính 11); dùng `IMAGE_MODEL`.
12. **Đăng ảnh AI không ghi rõ hoặc ảnh dùng người thật, nhãn hiệu.** Rủi ro bản quyền, quyền hình ảnh và điều khoản dịch vụ (xem "Chưa xác minh").

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Trang C2PA của OpenAI [OAI-C2PA] | WebFetch 403; chỉ có tóm tắt tìm kiếm (OpenAI từng nói metadata dễ bị xóa, nay kèm watermark vô hình, nhưng không rõ áp dụng cho **API** hay chỉ ChatGPT). | Viết "OpenAI nói..." chỉ khi `reviewer` mở được trang; nếu không, chỉ dẫn [C2PA] và [GEM-IMG] (SynthID), và nói thận trọng về OpenAI. Không khẳng định API OpenAI gắn C2PA hay SynthID. |
| Chi tiết SynthID (cơ chế, độ bền) | Chỉ có câu "mọi ảnh sinh ra đều có SynthID" ở [GEM-IMG]; chưa đọc tài liệu SynthID. | Dẫn một câu; không mô tả cơ chế. |
| Điều khoản bản quyền ảnh sinh ra của OpenAI, Google | Chưa tra điều khoản dịch vụ. | Không nêu ai sở hữu ảnh; chỉ khuyên đọc điều khoản và tham vấn khi dùng thương mại. |
| Luật bản quyền và AI (Mỹ, EU, Việt Nam) | Chưa tra. | Không nêu. Nếu cần, tra riêng. |
| Quy định bắt buộc gắn nhãn nội dung AI ở Việt Nam hoặc EU | Chưa tra. | Không nêu. |
| Model vision và giới hạn ảnh của Gemini (qua lớp tương thích) | Trang [GEM-OAI] chỉ có ví dụ; trang Image understanding chưa đọc. | Không nêu số cho Gemini. |
| Model Ollama nhận ảnh, và Ollama có `/v1/images/generations` không | [OLL-OAI] không nhắc; chưa tra trang model. | Ghi "chưa thấy hỗ trợ". Nếu người dùng có Ollama, thử thật. |
| Groq: sinh ảnh, và dữ liệu giá trên Groq | Trang vision không nhắc sinh ảnh. | Ghi "không nêu". |
| Hành vi `images.generate` thật (OpenAI, Gemini): trường nào có giá trị (`b64_json` hay `url`), tên model nào chạy được với key hiện có | Chưa chạy; chưa có key. | `reviewer` chạy thật trước khi bài có kết quả mẫu. Nếu không có key sinh ảnh, bài ghi mức "đối chiếu" (mục 2.5 `llm-lessons.md`) và **không** có kết quả mẫu. |
| Model OpenAI hiểu ảnh ở Chat Completions: danh sách model nào nhận `image_url` | [OAI-VIS] nói "tùy model". | Không nêu tên; trỏ về trang model. |
| Thời điểm tài liệu thay đổi: tên model sinh ảnh (`gpt-image-2.5-*`), Gemini (`gemini-2.5-flash-image` đang legacy) | Có thể lỗi thời trong vài tuần. | Chỉ ghi trong bảng này; trong bài ghi "kiểm tra lần cuối 10/2026" hoặc chỉ link. |
| Giá và hạn mức sinh ảnh | Theo yêu cầu, không ghi. | Link trang giá của nhà cung cấp. |

## Liên quan tới bài nào

- **`llm/text-api`** (tiên quyết trong `roadmap.ts`): `messages`, `OpenAI(base_url=...)`, bảng nhà cung cấp, retry và xử lý lỗi. Bài này mở rộng `content` từ chuỗi thành danh sách.
- **`llm/multimodal`:** giải thích **vì sao** model nhìn được ảnh (bộ mã hóa ảnh, token ảnh). Bài này chỉ dùng API; hẹn bài đó.
- **`cv/llava`** và phần CV: nền cho ảnh đầu vào.
- **`llm/prompt-engineering`:** prompt cho sinh ảnh và cho hiểu ảnh (cùng đợt 2; chỉ ghi tên, không link).
- **`llm/gradio-streamlit`:** có thể bọc ví dụ hiểu ảnh thành giao diện tải ảnh lên (cùng đợt 2; chỉ ghi tên).
- **`llm/agents`:** tool calling có thể gọi công cụ sinh ảnh.
- **`llm/llm-deployment`, `docker-cloud`:** liên quan khi tự chạy model ảnh trên hạ tầng của bạn.

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Đầu vào ảnh / hiểu ảnh | Image input / vision | Giữ "vision" khi nói về model |
| Data URL | Data URL | Giữ nguyên, gloss "địa chỉ chứa chính dữ liệu ảnh dạng base64" |
| Base64 | Base64 | Giữ nguyên |
| Sinh ảnh | Image generation | Dịch |
| Tác vụ bất đồng bộ | Asynchronous job | Dịch, gloss "gửi rồi chờ kết quả sau" |
| Hỏi lại định kỳ | Polling | Giữ "polling", gloss "hỏi lại trạng thái theo chu kỳ" |
| Webhook | Webhook | Giữ nguyên |
| Kiểm duyệt nội dung | Content moderation | Dịch |
| Nguồn gốc nội dung | Content provenance | Dịch |
| Dấu thủy vô hình / watermark | Watermark | Giữ "watermark", gloss "dấu in chìm" |
| Thông tin xác thực nội dung | Content Credentials (C2PA) | Giữ tên chuẩn, gloss một lần |

## Đọc thêm đề xuất

1. OpenAI, [*Images and vision*](https://developers.openai.com/api/docs/guides/images-vision) và [*Image generation*](https://developers.openai.com/api/docs/guides/image-generation). Đã đọc phần lớn.
2. Google, [*OpenAI compatibility*](https://ai.google.dev/gemini-api/docs/openai) và [*Image generation*](https://ai.google.dev/gemini-api/docs/image-generation).
3. Groq, [*Vision*](https://console.groq.com/docs/vision); Ollama, [*OpenAI compatibility*](https://docs.ollama.com/api/openai-compatibility).
4. C2PA, [*c2pa.org*](https://c2pa.org/): chuẩn Content Credentials.
5. OpenAI, [*Video generation with Sora*](https://developers.openai.com/api/docs/guides/video-generation): chỉ như ví dụ lịch sử về mô hình job bất đồng bộ (API đã ngừng).

## Kiểm chứng code

Do `lesson-writer` chạy khi viết bản vi (chưa có `.env.llm`, nên chưa có lần chạy thật với nhà cung cấp). `content-reviewer` chạy lại và bổ sung theo `docs/architecture/llm-lessons.md` mục 2.5.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `data-url.vi.py` | chạy thật | 2026-10-24 | **Pyodide 314.0.7 thật** (Python 3.14.2, `runpyo.mjs`), chỉ thư viện chuẩn | Sau review: đổi sang `zlib.compress(raw, 9)` và `demo_png(48)` (ảnh 48 × 48). In `PNG bytes: 118`, `base64 chars: 160`, `ratio: 1.356`, `data URL start: data:image/png;base64,iVBORw0KGgoAAAANSU...`, `round trip ok: True`; khớp lời văn ($4\lceil 118/3\rceil = 160$, đệm `==`). `.en.py` ra đúng số đó. CPython 3.14.5 Windows (`.venv-llm`, zlib-ng) cũng ra 118/160. Lần chạy cũ (bản `zlib.compress(raw)`, ảnh 64 × 64) chỉ chạy trên CPython Windows, ra 152 byte, trong khi Pyodide thật ra 153 byte → 204 ký tự: số liệu cũ trong lời văn sai trên trang, đã sửa |
| `describe-image.vi.py` | chạy khô | 2026-10-24 | Python 3.14.5, openai 3.37.0 (`.venv-llm`) | Có thêm máy chủ giả cục bộ. Thiếu key thì `KeyError: 'OPENAI_API_KEY'`. Với máy chủ giả cục bộ (sau khi đổi sang `demo_png(48)`, nén mức 9): ảnh thử ghi ra 118 byte, yêu cầu gửi đi đúng dạng (`content` là danh sách `text` + `image_url`), data URL dài 182 = 22 + 160 ký tự, kết thúc bằng `==`; in câu trả lời giả. Cả `.vi.py` và `.en.py`. Không có kết quả mẫu |
| `generate-image.vi.py` | chạy khô | 2026-10-24 | Python 3.14.5, openai 3.37.0 (`.venv-llm`) | Dừng ở `openai.APIConnectionError` sau khoảng 9 s; thiếu `IMAGE_MODEL` thì `KeyError: 'IMAGE_MODEL'`. Thêm: với máy chủ giả, nhánh `b64_json` lưu tệp đúng byte, nhánh `url` in link, lỗi 400 `moderation_blocked` in mã lỗi rồi thoát mã 1 (cả `.vi.py` và `.en.py`). Không có kết quả mẫu |
| khối `text` trong bài | đối chiếu | 2026-10-24 | | Giả mã polling, không gắn nhà cung cấp; trạng thái và gợi ý chu kỳ đối chiếu [OAI-VID] |

Ghi chú: trên Windows, khi stdout bị chuyển hướng (không phải cửa sổ dòng lệnh), `print` chữ tiếng Việt của `.vi.py` báo `UnicodeEncodeError` (cp1252). Chạy với `-X utf8` (hoặc `PYTHONUTF8=1` khi không dùng `-I`) thì hết. Ảnh hưởng mọi `.vi.py` có chuỗi tiếng Việt, không riêng bài này.
