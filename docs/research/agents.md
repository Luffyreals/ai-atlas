# Agents

Bài: `llm/agents` (chỉ bản vi, khoảng 12 phút đọc). Cần biết trước: `llm/langchain-llamaindex`. Quyết định liên quan trong `docs/mvp.md`: 53 (SDK OpenAI-compatible, key từ biến môi trường), 54 (code ở `src/code/llm/agents/`, hiện bằng `LocalCode`), 56 (ký hiệu $L$, $T$). Hình: `AgentLoopFigure` (`llm-lessons.md` mục 2.9). Giáo án gốc: Buổi 9, "Agents and related problems" (chỉ tham khảo).

Ngày tra: **24/10/2026**, bằng WebFetch, đọc docstring trong mã nguồn `openai` 3.37.0 (`.venv-llm`), và chạy thử code với máy chủ giả. Thẻ nguồn: [REACT], [TOOLFORMER], [OAI-FC], [OAI-SRC], [GEM-OAI], [GROQ-TOOL], [OLL-OAI], [OLL-TOOL], [ANTH], [OWASP], [MCP], [RUN]. Ý không có thẻ là kiến thức chung hoặc suy ra. Giá và hạn mức không ghi.

## Nguồn

- **[REACT]** Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., Cao, Y. (2022). [*ReAct: Synergizing Reasoning and Acting in Language Models*](https://arxiv.org/abs/2210.03629). arXiv:2210.03629 (nộp 10/2022; bản sửa 3/2023 là bản ICLR camera-ready, tức ICLR 2023). Đã đọc trang tóm tắt; **chưa đọc toàn bài**.
- **[TOOLFORMER]** Schick, T., Dwivedi-Yu, J., Dessì, R., Raileanu, R., Lomeli, M., Zettlemoyer, L., Cancedda, N., Scialom, T. (2023). [*Toolformer: Language Models Can Teach Themselves to Use Tools*](https://arxiv.org/abs/2302.04761). arXiv:2302.04761 (2/2023). Đã đọc trang tóm tắt; **chưa đọc toàn bài**. Trang arXiv không ghi hội nghị (xem "Chưa xác minh").
- **[OAI-FC]** OpenAI. [*Function calling*](https://developers.openai.com/api/docs/guides/function-calling). Trang hiện hành **dùng Responses API** (`function_call`, `call_id`, `function_call_output`), không có mã Chat Completions và không có mục bảo mật riêng.
- **[OAI-SRC]** OpenAI. Mã nguồn `openai-python` 3.37.0, thư mục `types/chat/`: [`chat_completion_tool_message_param.py`](https://github.com/openai/openai-python/blob/main/src/openai/types/chat/chat_completion_tool_message_param.py), [`completion_create_params.py`](https://github.com/openai/openai-python/blob/main/src/openai/types/chat/completion_create_params.py). Nguồn cho định dạng Chat Completions (xem quy ước của [text-api](text-api.md): không dẫn trang tham chiếu web vì không đọc được).
- **[GEM-OAI]** Google. [*OpenAI compatibility*](https://ai.google.dev/gemini-api/docs/openai), mục function calling.
- **[GROQ-TOOL]** Groq. [*Tool use*](https://console.groq.com/docs/tool-use).
- **[OLL-OAI]** Ollama. [*OpenAI compatibility*](https://docs.ollama.com/api/openai-compatibility).
- **[OLL-TOOL]** Ollama. [*Tool calling*](https://docs.ollama.com/capabilities/tool-calling) (API gốc của Ollama, không phải `/v1`).
- **[ANTH]** Schluntz, E., Zhang, B. (Anthropic, 19/12/2024). [*Building effective agents*](https://www.anthropic.com/engineering/building-effective-agents). Họ tên tác giả xác nhận ở [trang diễn giả của Barry Zhang](https://www.ai.engineer/speakers/barry-zhang) (AI Engineer, ghi đồng tác giả với Erik Schluntz, 12/2024). Trang tự ghi phần lớn bối cảnh công cụ đã thay đổi từ 12/2024; chỉ dùng cho khái niệm.
- **[OWASP]** OWASP Gen AI Security Project (2025). [*LLM01:2025 Prompt Injection*](https://genai.owasp.org/llmrisk/llm01-prompt-injection/).
- **[MCP]** [*What is the Model Context Protocol (MCP)?*](https://modelcontextprotocol.io/docs/getting-started/intro). Trang chính thức của giao thức.
- **[RUN]** Lần chạy thử của phiên này (mục "Kiểm chứng code").

## Ý chính

- **Agent là vòng lặp [ANTH].** Cách chia của Anthropic (nên ghi "một cách chia"): *workflow* là LLM và công cụ nối theo đường đi viết sẵn trong code; *agent* là khi chính LLM quyết định bước kế tiếp và công cụ nào. Gọn nhất: LLM dùng công cụ, nhìn kết quả từ môi trường, trong một vòng lặp. Lời khuyên cùng nguồn: bắt đầu từ cách đơn giản nhất, chỉ tăng độ phức tạp khi có lợi rõ.
- **ReAct [REACT].** Ý tưởng: cho model xen kẽ "nghĩ" (một dòng lập luận bằng chữ) và "làm" (một hành động như tra Wikipedia hay thao tác trong môi trường), rồi nhận quan sát và nghĩ tiếp. Lập luận giúp lập và chỉnh kế hoạch; hành động giúp lấy thông tin thật nên giảm bịa và lan truyền lỗi so với chỉ chain-of-thought. Thử trên HotpotQA, FEVER (hỏi đáp, kiểm chứng), ALFWorld, WebShop (ra quyết định tương tác); trên hai bộ sau, nguồn ghi vượt phương pháp imitation/RL "34% và 10%" tuyệt đối về tỷ lệ thành công chỉ với một hai ví dụ trong prompt. Không nêu điểm HotpotQA/FEVER (trang tóm tắt không có).
- **Tool calling hiện đại là bản có cấu trúc của ReAct (suy ra, không có nguồn nói thẳng).** Thay vì model viết "Action: ..." rồi ta tự cắt chuỗi, API nhận danh sách công cụ và trả lại `tool_calls` có tên và đối số dạng JSON. Phần "nghĩ" nhiều khi không hiện ra (nằm ẩn trong model). Bài nên nói đây là cách nhìn của người viết.
- **Toolformer [TOOLFORMER].** Hướng khác: *huấn luyện* model tự học khi nào gọi công cụ (máy tính, hỏi đáp, hai máy tìm kiếm, dịch, lịch), bằng tự giám sát và chỉ vài ví dụ cho mỗi API. Khác ReAct (chỉ dùng prompt). Bài chỉ cần một đoạn "công cụ cũng có thể được dạy vào model"; hiện nay tool calling của nhà cung cấp là kết quả của huấn luyện kiểu này nói chung (suy ra, không có nguồn: không viết thành khẳng định về một model cụ thể).
- **Vòng lặp tool calling trên Chat Completions [OAI-SRC, GROQ-TOOL]:** (1) gửi `messages` và `tools`; (2) nếu `message.tool_calls` rỗng thì `content` là câu trả lời, dừng; (3) nếu có, thêm nguyên message của assistant vào `messages`, chạy từng công cụ; (4) thêm một message `{"role": "tool", "tool_call_id": <id của lời gọi>, "content": <chuỗi kết quả>}` cho **mỗi** lời gọi; (5) gọi lại. Mỗi vòng tốn một lần gọi API và gửi lại cả lịch sử (xem token và chi phí ở [text-api](text-api.md)).
- **Định dạng công cụ [OAI-SRC, GROQ-TOOL, OLL-TOOL]:** `{"type": "function", "function": {"name", "description", "parameters": <JSON Schema>}}`. `description` quan trọng: model dựa vào nó để chọn công cụ. `arguments` trong lời gọi là **chuỗi JSON**, phải `json.loads`, và có thể sai (model sinh ra chữ).
- **`tool_choice` [OAI-SRC]:** `"none"` (không gọi), `"auto"` (mặc định khi có `tools`), `"required"` (phải gọi ít nhất một), hoặc ép một hàm `{"type": "function", "function": {"name": "..."}}`. Có `parallel_tool_calls` (bool) để cho phép nhiều lời gọi trong một lượt; [OAI-FC] nói nên xử lý 0, 1 hoặc nhiều lời gọi. Trang [OAI-FC] có thêm `strict` (khớp schema chặt) và ghi Chat Completions mặc định không strict; đó là nội dung của trang Responses, bài nên nói ngắn hoặc bỏ.
- **Khác Responses API [OAI-FC]:** Responses dùng `function_call_output` và `call_id`; Chat Completions dùng message `role: "tool"` và `tool_call_id`. Bài nói một câu như ở [text-api](text-api.md) (nhà cung cấp khác phơi ra Chat Completions).
- **Giới hạn số bước [ANTH]:** nguồn khuyên đặt điều kiện dừng như số vòng tối đa. Bài nên giải thích vì sao: model có thể gọi lặp mãi một công cụ (đã tái hiện trong [RUN], mục "Vòng lặp vô tận"), mỗi vòng tốn tiền, và lỗi tích lũy.
- **Quyền tối thiểu và xác nhận [OWASP]:** đối xử model như người dùng không tin cậy; ứng dụng giữ token API của mình, xử lý các hàm mở rộng trong code chứ không đưa quyền cho model; yêu cầu người xác nhận cho hành động rủi ro cao. [ANTH]: thử trong môi trường cô lập (sandbox) và có guardrail.
- **Prompt injection gián tiếp [OWASP]:** model đọc nội dung ngoài (web, file, kết quả công cụ) có chứa chỉ dẫn, và chỉ dẫn đó làm đổi hành vi. Kết quả công cụ là **dữ liệu, không phải lệnh**, nhưng model không phân biệt chắc chắn. Giảm thiểu theo [OWASP]: tách và gắn nhãn nội dung không tin cậy, kiểm tra đầu ra bằng code, lọc, thử tấn công định kỳ. Không có cách nào "chữa tận gốc"; câu này là diễn giải thận trọng, nguồn chỉ liệt kê biện pháp giảm thiểu.
- **Mức hỗ trợ tool calling của nhà cung cấp** (kiểm 24/10/2026): xem bảng dưới.
- **Multi-agent và MCP chỉ nhắc tên.** MCP là chuẩn mở để kết nối ứng dụng AI với hệ thống ngoài (dữ liệu, công cụ, quy trình); nguồn ví von như cổng USB-C [MCP]. Một công cụ qua MCP cuối cùng vẫn được model gọi như một tool. Multi-agent (nhiều agent chia việc, gọi nhau): chưa tìm nguồn chính thức phù hợp, xem "Chưa xác minh". Framework đã có ở [langchain-llamaindex](langchain-llamaindex.md): `create_agent` (LangChain, dựng trên LangGraph) và `FunctionAgent` (LlamaIndex); bài này hẹn "agent do framework dựng cũng chạy đúng vòng lặp này".

## Mức hỗ trợ tool calling (kiểm tra 24/10/2026)

| Nhà cung cấp | `tools` | `tool_choice` | Message kết quả | Ghi chú |
|---|---|---|---|---|
| OpenAI | có [OAI-SRC] | có: `none`, `auto`, `required`, ép hàm [OAI-SRC] | `role: "tool"` + `tool_call_id` [OAI-SRC] | Trang hướng dẫn hiện chỉ có mã Responses [OAI-FC] |
| Gemini (endpoint tương thích) | có, ví dụ `get_weather` [GEM-OAI] | trang chỉ ví dụ `"auto"`, không giải thích giá trị khác | **trang không mô tả** cách gửi `role: "tool"` | Trang tự ghi hỗ trợ thư viện OpenAI còn "beta". Cần chạy thật để biết |
| Groq | có (`tools`, JSON Schema) [GROQ-TOOL] | **trang không nêu** | `role: "tool"`, `tool_call_id`, kèm `name` [GROQ-TOOL] | Song song một lượt: chỉ một số model (ví dụ `llama-3.3-70b-versatile`, `llama-3.1-8b-instant` có; các `openai/gpt-oss-*` không). Trang ghi mọi model trên Groq hỗ trợ tool use. Trang [GROQ-OAI] của [text-api](text-api.md) lại ghi 400 nếu có `messages[].name`: xem "Chưa xác minh" |
| Ollama (`/v1`) | có [OLL-OAI] | **không hỗ trợ** [OLL-OAI] | trang `/v1` không nêu `role: "tool"`; API gốc dùng `tool_name`, **không** nhắc `tool_call_id` [OLL-TOOL] | Ví dụ chính thức dùng model `qwen3`; trang không liệt kê model nào hỗ trợ |

Ý cho bài: gửi `tool_choice` cho Ollama có thể bị bỏ qua hoặc báo lỗi (chưa kiểm); code mẫu **không** truyền `tool_choice` để chạy được ở cả bốn nơi. Model nhỏ chạy trên máy (Ollama) thường gọi công cụ kém ổn định hơn (suy ra từ kinh nghiệm chung, không có nguồn; không viết thành khẳng định).

## Công thức quan trọng

Không có công thức bắt buộc. Nếu bài muốn mô tả vòng lặp bằng ký hiệu (tùy chọn, quy ước của `summarizer`, không có nguồn): ở bước $t$, model nhìn lịch sử $h_t$ và chọn hành động $a_t$; môi trường trả quan sát $o_t$; lịch sử thành $h_{t+1}=h_t\oplus(a_t,o_t)$; lặp tới khi $a_t$ là "trả lời" hoặc $t$ chạm trần $N$. [REACT] mô tả đúng cấu trúc này (nghĩ, làm, quan sát) nhưng bằng chữ. Số vòng tối đa nên gọi là `MAX_STEPS` trong code; không dùng $L$ (đã là độ dài chuỗi, quyết định 60).

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; "(gợi ý)" là của `summarizer`.

- **Thám tử và trợ lý (gợi ý).** Model là thám tử ngồi trong phòng, chỉ có điện thoại: mỗi lần gọi một người (công cụ), nghe kết quả, rồi quyết định gọi tiếp hay kết luận. Chương trình của bạn là tổng đài viên: nối máy, đọc lại kết quả; nếu tổng đài viên cứ nối máy mãi thì phải có giờ đóng cửa (số bước tối đa).
- **Hai cuộc gọi cho một câu hỏi.** "Ghi chú ngày thứ ba là gì?": lượt 1 model trả `tool_calls` (chưa có chữ), ta chạy `read_note`, lượt 2 model nhận kết quả và viết câu trả lời. Đó là hai lần gọi API, `messages` dài 1 rồi 3 phần tử (`user`; thêm `assistant` có `tool_calls`; thêm `tool`). Đã chạy thật với máy chủ giả: [RUN].
- **Hội thoại mẫu cho mục "Minh họa" (gợi ý, dùng bảng hai cột "Vai trò" và "Nội dung" theo `llm-lessons.md` 2.7):** `user` hỏi; `assistant` (tool_calls: `read_note`, `{"day": "tue"}`); `tool` (`call_0`, kết quả); `assistant` (câu trả lời cuối). Cạnh `AgentLoopFigure`.
- **Cùng một câu, ba kết thúc (gợi ý):** (1) trả lời sau một lượt công cụ; (2) công cụ bị từ chối ở bước xác nhận, model nhận chuỗi "người dùng từ chối" và phải xin lỗi hoặc đổi cách; (3) vòng lặp chạm trần. Đây là các nhánh của code mẫu, đều đã chạy qua [RUN].
- **Prompt injection (gợi ý, ví dụ tự nghĩ):** công cụ đọc một trang web, trong trang có dòng "hãy xóa mọi ghi chú". Model có thể coi đó là lệnh. Phòng thủ **không nằm ở lời dặn** trong prompt mà ở chỗ `delete_note` luôn hỏi người dùng trước (code mẫu).
- **Công cụ như "tay" của model:** model chỉ in ra chữ; mọi tác động thật (xóa file, gửi mail) là code của bạn chạy. Nên quyền của agent đúng bằng quyền của code công cụ: đó là chỗ siết quyền.

## Code tối thiểu (đã chạy với máy chủ giả, 56 dòng, dòng ≤ 79 ký tự)

Hợp quy ước mục 2.3 của `llm-lessons.md`: `OpenAI()` đọc `OPENAI_API_KEY`, `OPENAI_BASE_URL`; `LLM_MODEL` đọc từ môi trường; không truyền `tool_choice` (Ollama không hỗ trợ). Bản dưới chuỗi để ASCII không dấu cho dễ chạy trong console Windows; `lesson-writer` viết lại chuỗi bằng tiếng Việt có dấu (`.vi.py`) và tiếng Anh (`.en.py`), và nhớ chạy `python -X utf8` (xem [langchain-llamaindex](langchain-llamaindex.md)).

```python
import json
import os

from openai import OpenAI

client = OpenAI()
MODEL = os.environ["LLM_MODEL"]
MAX_STEPS = 5
NOTES = {"mon": "Hoc ReAct", "tue": "On bai agents"}


def tool(name, description):
    schema = {"type": "object", "required": ["day"],
              "properties": {"day": {"type": "string"}}}
    return {"type": "function", "function": {
        "name": name, "description": description, "parameters": schema}}


TOOLS = [tool("read_note", "Doc ghi chu theo ngay (mon, tue)."),
         tool("delete_note", "Xoa ghi chu theo ngay.")]


def run_tool(name, args):
    day = args.get("day")
    if name == "read_note":
        return NOTES.get(day, "khong co ghi chu")
    if name == "delete_note":
        if input(f"Xoa ghi chu {day}? (y/N) ").strip().lower() != "y":
            return "nguoi dung tu choi"
        NOTES.pop(day, None)
        return "da xoa"
    return f"khong co cong cu {name}"


def agent(question):
    messages = [{"role": "user", "content": question}]
    for step in range(MAX_STEPS):
        reply = client.chat.completions.create(
            model=MODEL, messages=messages, tools=TOOLS
        ).choices[0].message
        if not reply.tool_calls:
            return reply.content
        messages.append(reply)
        for call in reply.tool_calls:
            try:
                args = json.loads(call.function.arguments)
                result = run_tool(call.function.name, args)
            except json.JSONDecodeError:
                result = "arguments khong phai JSON hop le"
            print(f"buoc {step + 1}: {call.function.name}")
            messages.append({"role": "tool", "tool_call_id": call.id,
                             "content": result})
    return "Dung: qua so buoc cho phep."


print(agent("Ghi chu thu hai la gi?"))
```

Ghi chú về code:

- `messages.append(reply)` thêm thẳng đối tượng message của SDK (chạy được với `openai` 3.37.0 ở [RUN]); nếu muốn giữ `messages` thuần dict thì dùng `reply.model_dump(exclude_none=True)` (chưa chạy thử cách này).
- Lời gọi tool lạ (`khong co cong cu ...`) và `JSONDecodeError` đều trả chuỗi lỗi **cho model** thay vì ném ngoại lệ: model thường tự sửa ở lượt sau (suy ra từ cách vòng lặp hoạt động; chưa quan sát với model thật).
- Còn thiếu cố ý (bài nên nói là "chưa đủ cho sản phẩm"): `json.loads` có thể ra không phải dict (`args.get` sẽ lỗi `AttributeError`); công cụ ném ngoại lệ khác; kết quả công cụ rất dài làm đầy cửa sổ ngữ cảnh; `delete_note` hỏi qua `input` (trong ứng dụng thật là hộp thoại). Câu hỏi "thứ hai" ứng với khóa `tue`: model phải tự suy `thứ hai` thành `mon`/`tue` nên có thể sai ngày, đổi ví dụ cho dễ (ví dụ khóa là tên ngày đầy đủ).
- Nên có `try/except openai.APIError` quanh lời gọi (đã dạy ở [text-api](text-api.md)); bản trên bỏ để vừa ≤ 60 dòng.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Tưởng model tự chạy công cụ.** Không: model chỉ **yêu cầu** gọi; code của bạn chạy và gửi kết quả lại. Thiếu bước gửi `role: "tool"` thì lần gọi sau thường báo lỗi 400 vì `tool_calls` chưa có kết quả (suy ra từ spec; [OAI-SRC] chỉ ghi `tool_call_id` bắt buộc; chưa kiểm).
2. **Quên `tool_call_id` hoặc ghép sai id.** Mỗi lời gọi có id riêng; mỗi kết quả phải mang đúng id [OAI-SRC]. Khi model gọi song song, phải trả đủ kết quả cho **mọi** lời gọi.
3. **Quên thêm message của assistant (có `tool_calls`) vào `messages` trước các message `tool`.** Lịch sử phải đủ cả hai.
4. **Không có trần số bước** nên vòng lặp chạy mãi và đốt token [ANTH]. Trần là điều kiện dừng bắt buộc, không chỉ "phòng xa".
5. **Tin `arguments` là JSON hợp lệ và đúng schema.** Đó là chữ model sinh ra; `json.loads` trong `try/except`, kiểm kiểu và giá trị trong code, kể cả khi dùng `strict` [OAI-FC khuyên kiểm đầu vào trong code của mình].
6. **Cấp cho công cụ quyền rộng** (xóa file, chạy shell, gửi tiền) rồi chỉ "dặn" model đừng làm bừa. Lời dặn trong prompt không phải hàng rào bảo vệ; quyền tối thiểu và xác nhận của người là hàng rào [OWASP].
7. **Coi kết quả công cụ là đáng tin.** Nội dung đọc từ web, email, file có thể chứa chỉ dẫn độc (prompt injection gián tiếp) [OWASP]. Đặc biệt nguy hiểm khi một agent vừa đọc nội dung ngoài vừa có công cụ có tác dụng phụ.
8. **Nhầm "agent" với "chatbot có nhiều công cụ" hoặc với một model đặc biệt.** Agent là cách *dùng* model: vòng lặp quanh nó. Cùng một model có thể dùng ở cả hai cách. [ANTH] còn khuyên nhiều khi workflow đơn giản là đủ.
9. **Nghĩ cứ mọi nhà cung cấp OpenAI-compatible đều hỗ trợ công cụ như nhau.** Bảng trên: Ollama không có `tool_choice`; Gemini ghi "beta"; mức hỗ trợ song song khác nhau theo model. Thử thật trước.
10. **Nhầm tên trường giữa Chat Completions và Responses** (`tool_call_id` và `call_id`; `role: "tool"` và `function_call_output`) khi chép ví dụ từ trang OpenAI hiện hành (đang dùng Responses) [OAI-FC].
11. **Nhầm ReAct (prompt) với Toolformer (huấn luyện).** Hai hướng khác nhau cho cùng bài toán "dùng công cụ" [REACT, TOOLFORMER].
12. **Cho rằng `temperature=0` làm agent xác định hoàn toàn.** Xem điểm 5 ở [text-api](text-api.md); chỉ gần xác định, nên test agent phải chịu được kết quả khác nhau.
13. **Gửi lại toàn bộ lịch sử và kết quả công cụ dài mỗi vòng** làm chi phí và độ trễ tăng nhanh và có thể đầy cửa sổ ngữ cảnh. Rút gọn kết quả công cụ trước khi đưa vào `messages`.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Hội nghị của Toolformer | Trang arXiv không ghi. Kiến thức chung cho rằng NeurIPS 2023, **chưa tra** | Bài ghi "Schick và cộng sự, 2023 (arXiv)"; không ghi hội nghị |
| Điểm số cụ thể của ReAct trên HotpotQA và FEVER | Trang tóm tắt chỉ cho "34% và 10%" của ALFWorld và WebShop | Chỉ dùng hai số đó, hoặc không dùng số nào; không nêu điểm khác |
| Gemini: cách trả kết quả công cụ qua endpoint tương thích | Trang [GEM-OAI] chỉ có ví dụ một lượt (gửi `tools`), không có `role: "tool"` | Chạy thật bằng khóa Gemini (reviewer); không khẳng định "chạy được" trước đó. Có thể tra thêm trang function calling riêng của Gemini (chưa mở) |
| Groq: `tool_choice` và streaming công cụ | Trang [GROQ-TOOL] không nêu | Ghi "chưa kiểm" trong bảng |
| Groq: `messages[].name` trả 400 hay không (với kết quả công cụ) | [GROQ-OAI] (đã đọc ở [text-api](text-api.md)) ghi 400 cho `messages[].name`, còn [GROQ-TOOL] ví dụ kết quả công cụ kèm `name`. Hai trang có vẻ mâu thuẫn | Code mẫu **không** truyền `name` ở message `tool`; reviewer thử thật với Groq |
| Ollama `/v1`: message `role: "tool"` và `tool_calls` trong phản hồi | [OLL-OAI] không nêu; [OLL-TOOL] (API gốc) dùng `tool_name` | Kiểm khi chạy thật; nếu không chạy thì ghi "chưa kiểm" trong bảng |
| Model nào hỗ trợ tool calling tốt, độ tin cậy với model nhỏ | Không có nguồn | Không nêu tên model; chỉ khuyên "thử và có trần số bước" |
| Multi-agent: nguồn chính thức để link | Chưa tìm và chưa mở trang nào (LangGraph, OpenAI Agents SDK, ...) | Chỉ nhắc khái niệm một câu và link tài liệu framework đã có ở [langchain-llamaindex](langchain-llamaindex.md) ([overview LangChain](https://docs.langchain.com/oss/python/langchain/overview)); `lesson-writer` hoặc phiên chính tra thêm nếu muốn link riêng |
| MCP: tên phiên bản đặc tả hiện hành, mức hỗ trợ của từng client | Trang ghi nhiều đường dẫn có ngày `2026-07-28`; chưa đọc kỹ | Chỉ nêu định nghĩa một câu và link trang giới thiệu; không ghi số bản |
| Phát biểu "tool calling = ReAct có cấu trúc", "model được huấn luyện cho tool calling" | Suy luận của người viết, không có nguồn nói thẳng | Ghi "cách nhìn của bài", không đưa vào như sự kiện |
| Hạn mức, giá | Không tra | Không ghi |

## Kiểm chứng code

Môi trường: `.venv-llm`, Python 3.14.5, `openai` 3.37.0, gọi bằng `-I -X utf8`, thư mục làm việc ở scratchpad (`.../scratchpad/agents-writer/`; lần chạy lại sau review: `.../scratchpad/agents-fix/`). Máy chủ giả: HTTP server tự viết (`fake.py` trong thư mục đó), cổng do hệ điều hành cấp (cổng 0), trả phản hồi kiểu Chat Completions theo kịch bản và in lại từng yêu cầu nhận được. **Không phải mô hình thật**, nên mức là `chạy khô` và bài không có "Kết quả mẫu". Không có `.env.llm` trong phiên viết bài (chỉ kiểm sự tồn tại của file, không mở).

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `agent-loop.vi.py` | chạy khô | 2026-10-24 | `.venv-llm`: Python 3.14.5, openai 3.37.0 | Bản sau review (kiểm `day` đầu `run_tool`, kiểm `isinstance(args, dict)` thay cho bắt `AttributeError`). `ast.parse(..., feature_version=(3, 10))` qua; 60 dòng, dòng dài nhất 77 ký tự. Thiếu key: `KeyError: 'OPENAI_API_KEY'`. Cổng đóng (`http://127.0.0.1:9/v1`): `openai.APIConnectionError` sau khoảng 20 s. Server giả (cổng 0, thư mục `agents-fix/`): (1) thường: server nhận 1 rồi 3 message (`user`, `assistant` có `tool_calls`, `tool` với `tool_call_id` `call_0`), in `Bước 1: read_note -> Viết agent đầu tiên.` rồi câu trả lời; (2) vòng lặp vô tận: dừng sau đúng 5 yêu cầu (1, 3, 5, 7, 9 message), in "Dừng: đã chạm trần số bước."; (3) `arguments` hỏng: `{day: tue` và `{"day": "thứ ba"` (JSON sai), `["tue"]`, `"tue"`, `null`, `3` (JSON không phải object): không sập, message `tool` mang "Lỗi: arguments phải là một JSON object hợp lệ."; (4) `{}` và `{"day": ["x"]}` với `read_note`: "Không có ghi chú ngày này." (trước đây `{"day": ["x"]}` làm sập vì `TypeError`); (5) `delete_note` thứ hai: gõ `n` hỏi `Xóa ghi chú thứ hai? (y/N)`, trả "Người dùng từ chối xóa."; gõ `y` trả "Đã xóa."; `delete_note` "chủ nhật" (không có) với `n` hay `y`, và `delete_note` `{"day": ["x"]}`: không hỏi, trả "Không có ghi chú ngày này."; xóa rồi đọc cùng ngày trong một lượt (gõ `y`): "Đã xóa." rồi "Không có ghi chú ngày này."; (6) tên lạ `run_shell`: "Không có công cụ tên run_shell."; (7) hai lời gọi một lượt: server nhận `user, assistant, tool, tool` với id `call_0`, `call_1`; (8) `MAX_STEPS = 3`, lượt nào cũng 2 lời gọi (quiz 1): 3 yêu cầu (1, 4, 7 message), 6 dòng `Bước`, rồi chuỗi dừng; (9) lời gọi có thêm trường `extra_content.google.thought_signature` (kiểu Gemini): `messages.append(reply)` gửi lại nguyên trường đó. Mọi yêu cầu: 2 công cụ, `enum` = `["thứ hai", "thứ ba"]`, không có `tool_choice` hay `parallel_tool_calls`. Message `assistant` gửi lại được tuần tự hóa thành `content: null` cùng `tool_calls` |
| `agent-loop.en.py` | chạy khô | 2026-10-24 | như trên | `ast.parse` qua; 60 dòng, dòng dài nhất 78 ký tự; so cặp với `.vi.py` (bỏ comment, làm rỗng chuỗi): giống nhau. Server giả: kịch bản thường in `Step 1: read_note -> Write a first agent.`, `enum` = `["monday", "tuesday"]`; `delete_note` + gõ `n`: hỏi `Delete the monday note? (y/N)`, trả "The user refused the deletion." |

Chưa chạy với mô hình thật (OpenAI, Gemini, Groq, Ollama): không có `.env.llm`; bảng nhà cung cấp trong bài chỉ dựa trên tài liệu.

Bản nháp 56 dòng ở mục "Code tối thiểu" (chuỗi ASCII, khóa `mon`/`tue`) đã được `summarizer` chạy khô với cùng kiểu máy chủ giả; bản trong bài thay khóa bằng tên ngày đầy đủ, thêm `enum`, bắt thêm `AttributeError`. Sau review, `AttributeError` được thay bằng kiểm `isinstance(args, dict)` (để không che lỗi thật trong công cụ), và `run_tool` kiểm `day` là chuỗi có trong `NOTES` trước khi đọc hay hỏi xóa.

Cần `content-reviewer` kiểm khi chạy thật: mô hình thật có trả `tool_calls` với đối số khớp `enum` tiếng Việt có dấu không; Gemini, Groq, Ollama có nhận message `role: "tool"` (không có `name`) không; số bước thực tế cho câu hỏi mẫu; câu "Xóa ghi chú thứ hai giúp tôi." có dẫn tới `delete_note` và bước hỏi xác nhận không.

## Liên quan tới bài nào

- **`llm/langchain-llamaindex`** (cần biết trước): `create_agent` và `FunctionAgent` chạy đúng vòng lặp này; bài này là "mở nắp" bên dưới. Có thể hỏi lại người đọc khi nào tự viết, khi nào dùng framework (ba câu hỏi ở [langchain-llamaindex](langchain-llamaindex.md)).
- **`llm/text-api`**: `messages`, vai trò, xử lý lỗi, retry, bảng nhà cung cấp. Bài này link tới đó, không chép lại.
- **`llm/rag-chatbot`**: truy xuất có thể bọc thành một công cụ (`search_docs`); trang RAG của LangChain đã làm thế [LC-RAG, xem [langchain-llamaindex](langchain-llamaindex.md)]. Hẹn một câu.
- **`llm/prompt-engineering`**: system prompt, chain-of-thought (ReAct dựa trên ý này), đầu ra có cấu trúc.
- **`llm/gradio-streamlit`**: giao diện cho agent (hiện từng bước).
- **`llm/evaluation-peft`, `llm/debugging-language-models`** (đợt 5): cách đánh giá và gỡ lỗi agent; bài này chỉ nhắc nên ghi log từng bước (suy ra).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Tác tử / agent | agent | Giữ "agent"; không dịch "tác tử" (người Việt quen "agent") |
| Gọi công cụ | tool calling / function calling | Gloss lần đầu, giữ tên tham số `tools` |
| Công cụ | tool | Dịch "công cụ" |
| Vòng lặp agent | agent loop | Dịch, giữ "agent" |
| Quan sát | observation | Dùng trong phần ReAct |
| Suy luận và hành động | ReAct (Reasoning and Acting) | Giữ "ReAct", gloss một lần |
| Tiêm lệnh (prompt injection) | prompt injection | Giữ "prompt injection"; gloss "chỉ dẫn độc lẫn vào dữ liệu" |
| Quyền tối thiểu | least privilege | Dịch, gloss tiếng Anh một lần |
| Hộp cát | sandbox | Giữ "sandbox" |
| Đa agent | multi-agent | Chỉ nhắc tên |
| Giao thức ngữ cảnh mô hình | Model Context Protocol (MCP) | Giữ "MCP", gloss một lần |

## Đọc thêm đề xuất

1. [Yao et al. (2022), *ReAct*](https://arxiv.org/abs/2210.03629). Đã đọc trang tóm tắt.
2. [Schick et al. (2023), *Toolformer*](https://arxiv.org/abs/2302.04761). Đã đọc trang tóm tắt.
3. [OpenAI, *Function calling*](https://developers.openai.com/api/docs/guides/function-calling) (lưu ý: ví dụ dùng Responses API).
4. [Anthropic, *Building effective agents*](https://www.anthropic.com/engineering/building-effective-agents) (12/2024; trang tự ghi nội dung công cụ đã đổi, chỉ nên đọc khái niệm).
5. [OWASP, *LLM01:2025 Prompt Injection*](https://genai.owasp.org/llmrisk/llm01-prompt-injection/).
6. [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro) (chỉ nhắc tên).
7. Trang tool use của [Groq](https://console.groq.com/docs/tool-use) và [Ollama](https://docs.ollama.com/capabilities/tool-calling), trang tương thích của [Gemini](https://ai.google.dev/gemini-api/docs/openai).
