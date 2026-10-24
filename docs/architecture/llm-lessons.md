# Phần LLM (5c): khuôn bài, `LocalCode`, kiểm chứng code và `SamplingViz`

> Phạm vi: 23 bài của phần 5c (`llm/*`), **chỉ bản vi** (quyết định 53, như quyết định 43). Tài liệu chốt cách bài LLM trình bày code mà trang không chạy được, cách kiểm chứng code đó, các quy ước nội dung riêng của phần này, danh sách hình và đặc tả `SamplingViz`.
> Liên quan: [components.md](components.md) (mẫu wrapper Astro, `PythonRunner` mục 2.3–2.4 và 4.6, hình thức mục 4.9), [viz/README.md](viz/README.md) (quy ước VIZ mục 2, FIG mục 8), [roadmap-data.md](roadmap-data.md) (slug 23 bài), [docs/lesson-template.mdx](../lesson-template.mdx).
>
> Viết ngày 24/10/2026. Chỗ ghi "đã kiểm chứng" là đã đọc mã nguồn trong `node_modules`, chạy thật, hoặc đọc log CI cùng ngày, không phải suy đoán.

**Quyết định đầu vào** ([decisions.md](../decisions.md)):

| # | Quyết định | Áp dụng ở |
|---|---|---|
| 43 | Bản en của các bài làm sau; trang `/en/` của bài chưa dịch là trang fallback | 2.4, 2.10 |
| 53 | Viết cả 23 bài, chỉ bản vi, sau bài Gradient Descent. Code gọi API là **code minh họa**, không chạy trên trang. Dùng SDK OpenAI-compatible (thư viện `openai`, đổi `base_url`). Không ghi cứng key, đọc từ biến môi trường | 2.1, 2.3 |
| 54 | Code minh họa ở `src/code/llm/<bài>/<tên>.vi.py` (kèm `.en.py`), hiện qua một component có nhãn "Chạy trên máy bạn" và dòng yêu cầu. Code không phải Python viết thẳng trong MDX. Kiểm chứng bằng key người dùng tự đặt và venv có torch CPU. VIZ chỉ có `SamplingViz`, cùng 9 hình tĩnh. Nhịp duyệt: khuôn code trên trang demo → `text-api` → `build-first-llm` → đợt tối đa 4 bài (nhịp duyệt này đã được quyết định 60 thay). Các mặc định phiên chính tự chọn | toàn bộ |
| 56 | Chạy hết 23 bài rồi người dùng duyệt một lần ở cuối, thay cho nhịp duyệt của quyết định 54. Ký hiệu chung của phần LLM: độ dài chuỗi $L$, nhiệt độ $T$ | 2.7, 2.8, 6 |

## 1. Mục tiêu và phạm vi

### Làm

- Component **`LocalCode`**: hiện một file code chạy trên máy người đọc, có nhãn "Chạy trên máy bạn", dòng yêu cầu (gói pip, biến môi trường, lệnh chạy, phần cứng) và khối "Kết quả mẫu" tùy chọn. 0 KB JS. Song ngữ, sáng/tối, 375px.
- Quy ước file code của phần LLM: chỗ đặt, biến môi trường, khuôn gọi API, khi nào dùng `PythonRunner`, khi nào dùng `LocalCode`, khi nào viết khối code trong MDX.
- Test mới: quét key ghi cứng, kiểm cú pháp Python, quy ước code LLM, phạm vi kiểm chứng; mở rộng `code-pairs`; e2e cho `LocalCode`.
- Quy trình kiểm chứng code (venv `.venv-llm/`, bốn mức kiểm chứng, nơi ghi kết quả).
- Chính sách cho thông tin dễ lỗi thời: tên model, nhà cung cấp, phiên bản thư viện, giá.
- Biến thể template cho bài LLM và cách sửa `docs/lesson-template.mdx`.
- Quy trình viết song song theo đợt.
- Danh sách VIZ/FIG và đặc tả `SamplingViz` đủ để `viz-builder` làm.
- Kế hoạch giữ thời gian e2e trong CI dưới 20 phút.
- Hợp đồng với `lesson-writer` (mục 4.8).

### Không làm

- Chạy code gọi API hay PyTorch trên trình duyệt. Không có server, không có proxy API.
- Bản en của 23 bài (sau MVP, quyết định 43). Tài liệu chỉ chừa sẵn chỗ cho bản en (mục 2.4).
- Notebook Colab/Kaggle (ngoài phạm vi dự án).
- Thiết kế 9 hình tĩnh chi tiết. Mỗi hình theo [viz/figures.md](viz/figures.md) mục 8; mục 2.9 ở đây chỉ ghi tên, bài dùng và ý chính.
- Sửa `docs/mvp.md`, `src/data/roadmap.ts`, `docs/glossary.md` (agent khác đang sửa). Các việc phiên chính phải làm ở những file này ghi trong mục 6.

## 2. Phương án đã chọn

### 2.1. Ba chỗ của code trong bài LLM

| Code | Chỗ đặt | Hiển thị | Ví dụ |
|---|---|---|---|
| Chạy được trên Pyodide: chỉ dùng `numpy`, `pandas`, `matplotlib`, `scipy`, `scikit-learn` hoặc Python thuần, không gọi mạng | `src/code/llm/<bài>/<tên>.vi.py` | `PythonRunner` | softmax với temperature, top-k/top-p trên vài logit; điểm attention; tách từ BPE đồ chơi; độ tương tự cosine; truy xuất TF-IDF bằng scikit-learn; đếm tham số LoRA; lượng tử hóa int8 bằng NumPy; phép quay RoPE; hàm mất mát DPO trên vài con số |
| Cần mạng, PyTorch, GPU, hay thư viện ngoài danh sách trên | `src/code/llm/<bài>/<tên>.vi.py` | **`LocalCode`** | gọi `client.chat.completions.create`; GPT nhỏ bằng PyTorch; ứng dụng Gradio/Streamlit; RAG với LangChain; crawl bằng `requests` |
| Không phải Python: Dockerfile, YAML, shell, Cypher, JSON mẫu | Viết thẳng trong MDX | Khối code của Starlight (` ```dockerfile `, ` ```yaml `, ` ```sh `, ` ```cypher `, ` ```json `) | `Dockerfile` của bài `docker-cloud`, truy vấn Cypher của `graph-rag`, lệnh `pip install` |

Quy tắc chọn:

- **Phần lõi toán đủ nhỏ thì cho chạy trên trang.** Bài phần `build` có một ô `PythonRunner` khi ý chính của bài làm lại được bằng NumPy trong khoảng 40 dòng và chạy dưới 2 giây trên Pyodide (quyết định 54). Bài phần `apps` không bắt buộc có ô chạy được. Có thì tốt, ví dụ ô truy xuất TF-IDF của `rag-chatbot`.
- **Mọi file `.py` là một chương trình hoàn chỉnh.** Chạy được bằng `python <file>` (cộng biến môi trường), tự import, tự tạo dữ liệu. Không có file "đoạn trích".
- **Trích một phần code để giải thích** thì dùng khối ` ```python ` trong MDX, tối đa khoảng 8 dòng, chép đúng từ file. Đoạn trích phải là các câu lệnh Python đầy đủ cú pháp, vì test `python-syntax` kiểm cả các khối này (mục 4.5).
- **Shiki có sẵn các ngôn ngữ cần dùng** (đã kiểm chứng trong `node_modules/@shikijs/langs/dist/`, Shiki 4.5.0): `python`, `sh`/`bash`, `dockerfile`, `yaml`, `json`, `toml`, `cypher`, `dotenv`, `http`, `sql`. Khối `sh`/`bash` có khung kiểu cửa sổ dòng lệnh, và nút sao chép tự bỏ các dòng comment `#` (đã đọc `plugin-frames`, Expressive Code 0.44.3).

### 2.2. Component `LocalCode`

**Tên: `LocalCode`.** Lý do: đặt cạnh `PythonRunner` thì rõ ngay cặp "chạy trên trang" và "chạy trên máy". Tên `CodeExample` dễ nhầm với mục "Ví dụ code" của template, vốn chứa cả hai loại.

| Phương án | Ưu | Nhược |
|---|---|---|
| A. Khối ` ```python ` trong MDX, cộng một hộp `:::note` ghi yêu cầu | Không cần code mới | Code nằm trong MDX nên không chạy thẳng bằng `python`, không quét key được theo file, không có `.en.py`. Hộp yêu cầu viết tay ở mỗi bài, dễ lệch với code |
| B. Thêm prop `runnable={false}` cho `PythonRunner` | Một component | Wrapper `PythonRunner` luôn gắn island React (nút Chạy, Pyodide). Tách nhánh làm component phức tạp hơn, và dễ để lọt island lên trang |
| **C. Component Astro riêng `LocalCode`, 0 JS, bọc `<Code>` của Starlight (chọn)** | Khối code tô màu lúc build và có nút sao chép (Expressive Code), không có island. Biến môi trường **đọc thẳng từ code** nên dòng yêu cầu luôn khớp | Thêm một component và một file CSS nhỏ |

Điểm chính (chi tiết ở mục 4.1–4.4):

- Nhận code dạng chuỗi (`?raw`), như `PythonRunner`. File nằm ở `src/code/llm/...`, nên reviewer chạy thẳng được.
- **Biến môi trường không phải prop.** Wrapper đọc các tên trong `os.environ["X"]` (bắt buộc) và `os.environ.get("X")` (tùy chọn) ngay trong code, rồi hiện ra. Vì vậy code phải đọc biến môi trường tường minh (mục 2.3), và không có chỗ nào để dòng yêu cầu lệch với code.
- Gói pip là prop `packages`, vì tên gói pip khác tên import (`scikit-learn` và `sklearn`, `beautifulsoup4` và `bs4`).
- Khối "Kết quả mẫu" là **nội dung con** (slot) của component, thường là một khối ` ```text `. Nó là nội dung bài nên nằm trong MDX, và người dịch thấy để dịch.
- Không có JS. Không đổi số island trên trang demo (`ISLANDS = 7` trong `components.spec.ts` giữ nguyên).
- Chữ giao diện ở namespace `localCode` trong `ui.ts`, `vi.json`, `en.json`. Không viết cứng chữ.
- Màu chỉ qua biến `--sl-color-*`, không có cặp màu mới (mục 4.3).

**Bẫy đã kiểm chứng: Expressive Code tự lấy tên file từ comment.** Plugin `frames` (tùy chọn `extractFileNameFromCode`, mặc định `true`) xét 4 dòng đầu của code. Dòng comment nào trông như tên file, ví dụ `# app.py` hay `# File: rag.py`, bị **xóa khỏi khối code** và đưa lên làm tiêu đề khung. Khi đó code hiện ra ít hơn file một dòng. Đã đọc `node_modules/@expressive-code/plugin-frames/dist/index.js`: việc tìm chỉ chạy khi `props.title === undefined`. `LocalCode` luôn truyền `title={file ?? ''}`, nên không bao giờ bị cắt dòng. `PythonRunner` hiện không truyền `title` nên vẫn có bẫy này (mục 7, rủi ro 2).

### 2.3. Quy ước file code và biến môi trường

**Chỗ đặt:** `src/code/llm/<bài>/<tên>.vi.py` và `<tên>.en.py`. `<bài>` là phần sau `llm/` của id bài, `<tên>` kebab-case theo việc ô làm, ví dụ `src/code/llm/text-api/chat.vi.py`. Bài chưa dịch thì `.en.py` là **bản sao y nguyên** của `.vi.py`, giống mọi phần khác.

**Biến môi trường.** Ba biến cố định cho mọi bài:

| Biến | Đọc bằng | Ý nghĩa |
|---|---|---|
| `OPENAI_API_KEY` | `os.environ["OPENAI_API_KEY"]` | Key của nhà cung cấp. Với Ollama chạy trên máy, đặt một chuỗi bất kỳ, ví dụ `ollama` |
| `OPENAI_BASE_URL` | `os.environ.get("OPENAI_BASE_URL")` | Địa chỉ API kiểu OpenAI của nhà cung cấp. Bỏ trống thì SDK dùng OpenAI |
| `LLM_MODEL` | `os.environ["LLM_MODEL"]` | Tên model chat. **Không có giá trị mặc định trong code** (mục 2.6) |

- Bài cần thêm khả năng khác thì thêm biến `<KHẢ_NĂNG>_MODEL`, ví dụ `EMBEDDING_MODEL` (bài RAG), `IMAGE_MODEL` (bài `image-video-api`). Đặt tên theo khuôn này, ghi trong lời văn của bài.
- Chỉ đọc bằng `os.environ["X"]` hoặc `os.environ.get("X")`. **Không dùng `os.getenv`**, vì `LocalCode` chỉ nhận ra hai dạng trên (build báo lỗi khi gặp `os.getenv`).
- Không dùng `python-dotenv` hay file `.env` trong code của bài, để bớt một gói. Bài `text-api` hướng dẫn đặt biến môi trường cho bash và PowerShell bằng `<Tabs syncKey="os">` của Starlight.

**Khuôn gọi API** (đã kiểm chứng cú pháp và hành vi khi thiếu mạng, mục 2.5):

```python
# Gọi một mô hình chat qua API kiểu OpenAI (OpenAI-compatible).
import os

from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # bỏ trống: dùng OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]

response = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": "Bạn trả lời ngắn gọn bằng tiếng Việt."},
        {"role": "user", "content": "RAG là gì? Trả lời trong hai câu."},
    ],
)
print(response.choices[0].message.content)
```

- Luôn tạo `client` tường minh với `base_url` và `api_key` như trên. Ba dòng này dạy người đọc code lấy địa chỉ và key từ đâu, và giúp `LocalCode` liệt kê đủ biến.
- Gọi `client.chat.completions.create` (quyết định 53). README của `openai-python` ghi Chat Completions là "previous standard (supported indefinitely)", còn API chính của OpenAI nay là Responses API. Ta vẫn chọn Chat Completions vì Gemini, Groq và Ollama đều cung cấp endpoint này theo kiểu OpenAI. Bài `text-api` nói rõ điều này trong một câu.
- Vai trò hệ thống dùng `"system"`, không dùng `"developer"` (tên mới của OpenAI). Trang tương thích OpenAI của Gemini có ví dụ dùng `system`, còn `developer` thì không thấy nhắc tới.
- Chỉ dùng **tham số chung**: `model`, `messages`, `temperature`, `top_p`, `stream`, `tools`. Tham số có chỗ không nhận thì phải nói rõ trong bài. Ví dụ: Groq trả lỗi 400 với `logprobs`, `logit_bias`, `top_logprobs`, `messages[].name`, và đổi `temperature = 0` thành `1e-8` (trang OpenAI compatibility của Groq, đọc ngày 24/10/2026). `top_k` không có trong API của OpenAI.
- Không bao giờ in key hay in cả `os.environ`.

**Không ghi cứng key, ở đâu cũng vậy:** trong `.py`, trong khối code MDX, trong kết quả mẫu, trong `docs/`. Lệnh mẫu đặt biến môi trường dùng chỗ giữ chỗ trong ngoặc nhọn:

```sh
export OPENAI_API_KEY="<key-của-bạn>"
export OPENAI_BASE_URL="<địa chỉ API của nhà cung cấp>"
export LLM_MODEL="<tên model>"
```

Test `code-secrets` (mục 4.5) bắt các vi phạm.

**Giới hạn kích thước.** Gợi ý vẫn là khoảng 40 dòng. Code LLM có phần dựng `client` và ứng dụng Gradio, nên giới hạn cứng là **60 dòng**, mỗi dòng ≤ 79 ký tự. Chương trình dài hơn thì tách thành hai file, mỗi file tự chạy được.

**PyTorch:** chạy trên CPU, quy mô nhỏ: vài trăm bước, dưới khoảng 3 phút trên máy phát triển. Đặt `torch.manual_seed(0)`. Model tải từ Hugging Face chỉ dùng bản nhỏ, và ghi kích thước tải về trong lời văn.

### 2.4. Chuỗi trong code: prompt theo ngôn ngữ của bài

Code LLM có chuỗi là lời văn: prompt, câu hỏi mẫu, tài liệu mẫu cho RAG. Test `code-pairs` hiện đòi `.vi.py` và `.en.py` giống hệt nhau sau khi bỏ comment, nên chuỗi phải giống nhau.

| Phương án | Đánh giá |
|---|---|
| **A. Prompt tiếng Việt ở `.vi.py`, tiếng Anh ở `.en.py`. Riêng `src/code/llm/`, `code-pairs` bỏ qua nội dung của chuỗi (đề xuất)** | Người đọc tiếng Việt thấy prompt tiếng Việt, và kết quả mẫu cũng tiếng Việt. Vẫn giữ được: cùng số dòng, cùng cấu trúc code, chỉ khác comment và chữ trong chuỗi |
| B. Prompt tiếng Anh ở cả hai bản, giữ test như cũ | Không phải sửa test. Nhưng bài tiếng Việt dạy gọi LLM bằng prompt tiếng Anh, và kết quả mẫu là tiếng Anh giữa bài tiếng Việt |
| C. Prompt tiếng Việt ở cả hai bản | Không phải sửa test. Bản en sẽ có prompt tiếng Việt |

Chọn **A** nếu người dùng đồng ý (câu hỏi 1). Cách so của A, chỉ áp dụng cho file dưới `src/code/llm/`:

- Bỏ comment như hiện nay, rồi thay **nội dung** của mọi chuỗi bằng rỗng: `"Bạn là trợ lý"` và `"You are an assistant"` đều thành `""`. Chuỗi f-string cũng vậy, kể cả phần `{...}` bên trong.
- Hai bản phải giống nhau từng dòng sau bước này.
- Tên biến môi trường cũng nằm trong chuỗi, nên bước này không bắt được khi hai bản đọc biến khác nhau. Test `llm-code` (mục 4.5) kiểm riêng điều đó trên **từng** file.
- Chữ in ra bằng `print(f"...")` ở bản vi được viết tiếng Việt. Ô `PythonRunner` của phần LLM vẫn nên in tiếng Anh ngắn hoặc chỉ in số, như các phần khác.

Bản sao `.en.py` của bài chưa dịch qua được cả cách so cũ lẫn cách so mới. Để bản sao không lọt khi bài **đã** dịch, `code-pairs` thêm một luật cho mọi phần: bài có `status.en = 'published'` thì mọi `.en.py` của bài không được chứa chữ tiếng Việt có dấu (mục 4.5).

### 2.5. Kiểm chứng code

**Venv `.venv-llm/`** ở gốc dự án. Đã có trong `.gitignore` (dòng `.venv-llm/`), và venv tự có `.gitignore` với `*`.

| Gói | Trong venv (`pip list`, 24/10/2026) | Ghi chú |
|---|---|---|
| Python | 3.14.5 (`pyvenv.cfg`) | Code phải chạy được trên Python 3.10+ (mức tối thiểu của `openai`). Test cú pháp ép điều này |
| `torch` | 2.14.1+cpu | Cài từ `https://download.pytorch.org/whl/cpu` |
| `openai` | 3.37.0 | Bản mới nhất trên PyPI, phát hành 22/10/2026. Cần Python ≥ 3.10 |
| `numpy` | 2.5.4 | **Khác** Pyodide 314.0.7 (2.4.6). Chỉ dùng cho code của `LocalCode` |
| `scikit-learn` | 1.9.1 | **Khác** Pyodide 314.0.7 (1.8.0). Chỉ dùng cho code của `LocalCode` |

- Danh sách ghim nằm trong **`scripts/requirements-llm.txt`** (file mới, có commit). Như vậy venv dựng lại được trên máy khác. Bài cần thêm gói (`gradio`, `streamlit`, `langchain`, `llama-index`, `pymongo`, `requests`, `beautifulsoup4`, `transformers`, `peft`…) thì báo trong báo cáo, **phiên chính** thêm vào file này với bản đã chạy thử. Không agent nào khác sửa file này trong lúc chạy song song.
- Ô `PythonRunner` của bài LLM **bắt buộc** chạy thử bằng venv Pyodide `C:/Users/Dell/.venvs/ai-atlas-py314` như các phần khác ([viz/README.md](viz/README.md) mục 2.5), vì NumPy và scikit-learn trong `.venv-llm/` mới hơn bản của Pyodide. `.venv-llm/` chỉ dành cho code của `LocalCode`.
- Máy phát triển có Docker CLI 29.8.1. Chưa có Ollama, chưa có MongoDB; MongoDB chạy được trong container nếu Docker daemon đang chạy (kiểm bằng `docker info`).

**Bốn mức kiểm chứng.** Mỗi file `.vi.py` của `LocalCode` và mỗi khối code không phải Python được ghi một mức:

| Mức | Nghĩa | Khi nào đủ |
|---|---|---|
| `cú pháp` | `ast.parse` qua, với `feature_version=(3, 10)` | Chỉ là mức sàn. CI chạy cho mọi file |
| `chạy khô` | Chạy tới lời gọi mạng đầu tiên, dừng đúng ở `openai.APIConnectionError` vì `OPENAI_BASE_URL` trỏ vào cổng đóng | Khi chưa có key. Bài vẫn xuất bản được, nhưng **không có kết quả mẫu** và không trích số từ output |
| `chạy thật` | Chạy hết, không lỗi; output khớp lời văn | Bắt buộc cho file có kết quả mẫu hoặc số được trích trong bài, và cho mọi file PyTorch chạy được trên CPU |
| `đối chiếu` | Máy không chạy được (cần GPU, tài khoản cloud, dịch vụ ngoài). Reviewer đọc từng dòng, đối chiếu tài liệu chính thức của đúng phiên bản, ghi link | Code của `llm-deployment`, phần cloud của `docker-cloud`, lệnh cần GPU |

**Cách reviewer chạy.** Luôn đặt thư mục làm việc ở scratchpad, để file sinh ra (model tải về, `chroma/`, ảnh…) không lọt vào repo. Gọi Python bằng `-I`: `-I` bỏ qua biến `PYTHON*` và thư mục của script, nhưng vẫn thấy biến `OPENAI_*`.

```sh
REPO="C:/Users/Dell/Documents/NhaCongDong/Road Map/ai-atlas"
PY="$REPO/.venv-llm/Scripts/python.exe"
FILE="$REPO/src/code/llm/text-api/chat.vi.py"
cd "<scratchpad>"

# cú pháp
"$PY" -I -c "import ast,sys; ast.parse(open(sys.argv[1],encoding='utf-8').read(), feature_version=(3,10))" "$FILE"

# có key không? Chỉ in True/False, không bao giờ in giá trị
( set -a; [ -f "$REPO/.env.llm" ] && . "$REPO/.env.llm"; set +a
  "$PY" -I -c "import os; print(all(os.environ.get(k) for k in ('OPENAI_API_KEY', 'LLM_MODEL')))" )

# chạy thật (có key)
( set -a; . "$REPO/.env.llm"; set +a; timeout 180 "$PY" -I "$FILE" )

# chạy khô (không có key): phải kết thúc bằng openai.APIConnectionError, không lỗi nào khác
OPENAI_API_KEY=dummy OPENAI_BASE_URL=http://127.0.0.1:9/v1 LLM_MODEL=dummy timeout 120 "$PY" -I "$FILE"
```

- **Key nằm ở `.env.llm`** ở gốc dự án, mỗi dòng `TÊN=giá trị`, gồm `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `LLM_MODEL` (và `EMBEDDING_MODEL` khi cần). File này đã bị `.gitignore` chặn qua mẫu `.env.*` (đã kiểm). Người dùng tự tạo. Agent **không bao giờ** `cat`, `Read` hay in file này, chỉ nạp nó vào môi trường của đúng một lệnh như trên (câu hỏi 3).
- Gói miễn phí có giới hạn số lần gọi mỗi phút. Mỗi file chạy một lần. Gặp lỗi 429 thì chờ khoảng một phút, thử lại một lần, rồi ghi lại.
- Kết quả mẫu trong bài **chỉ được lấy từ một lần chạy thật**, chép nguyên văn (cắt bớt thì ghi `…`). Không viết kết quả "trông giống thật".

**Ghi kết quả kiểm chứng.** Mỗi bài LLM có file `docs/research/<bài>.md` (do `summarizer` tạo, như các bài khác). Cuối file có mục `## Kiểm chứng code`:

```markdown
## Kiểm chứng code

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `chat.vi.py` | chạy thật | 2026-10-25 | Python 3.14.5, openai 3.37.0, nhà cung cấp và model đã dùng | Chạy xong sau 2.1 s. Kết quả mẫu trong bài lấy từ lần này |
| `tiny-gpt.vi.py` | chạy thật | 2026-10-25 | Python 3.14.5, torch 2.14.1+cpu | 38 s; loss 4.17 → 2.03 sau 500 bước, khớp lời văn |
| khối `dockerfile` trong bài | đối chiếu | 2026-10-25 | Docker 29.8.1 | Build image thành công; chưa đẩy lên cloud. Đối chiếu tài liệu Docker |
```

- `content-reviewer` không sửa file, nên nó trả các dòng này trong báo cáo. **Phiên chính** chép vào `docs/research/<bài>.md`. Mỗi bài một file riêng, nên các đợt song song không ghi đè nhau.
- Tên model chỉ xuất hiện ở đây và ở bảng nhà cung cấp của `text-api`, không xuất hiện trong code (mục 2.6).
- Test `llm-code` (mục 4.5) đòi mọi `.vi.py` của bài đã xuất bản có một dòng trong bảng này. Nhờ vậy không bài nào được commit mà chưa kiểm chứng.

**Đã kiểm chứng ngày 24/10/2026** trên khuôn gọi API ở mục 2.3, trong một venv tạm ở scratchpad có `openai` 3.37.0: `ast.parse(..., feature_version=(3, 10))` qua; chạy khô dừng ở `openai.APIConnectionError` sau khoảng 14 giây (SDK tự thử lại 2 lần trước khi báo lỗi); thiếu `OPENAI_API_KEY` thì báo `KeyError: 'OPENAI_API_KEY'`, một thông báo dễ hiểu cho người đọc.

### 2.6. Thông tin dễ lỗi thời

| Loại | Quy tắc |
|---|---|
| **Tên model** | Không có trong code (đọc từ `LLM_MODEL`, không có giá trị mặc định). Trong lời văn: được nhắc model **như một sự kiện có năm**, kèm paper hoặc báo cáo kỹ thuật, ví dụ "GPT-2 (Radford và cộng sự, 2019)", "DeepSeek-V3 (2024)". Không viết "mạnh nhất", "mới nhất", "hiện nay" về một model. Thật sự cần thì viết "tại thời điểm viết (10/2026)" |
| **Nhà cung cấp** | Chỉ bài `text-api` có bảng nhà cung cấp (tên, `OPENAI_BASE_URL`, có gói miễn phí không, link tới trang tài liệu và trang giá). Dưới bảng ghi "Kiểm tra lần cuối: 10/2026". Bài khác link tới bảng đó, không chép lại. Không chọn nhà cung cấp mặc định (quyết định 54) |
| **Giá và hạn mức** | Không ghi con số giá hay hạn mức miễn phí. Link tới trang giá chính thức. Khi cần dạy cách ước chi phí, dùng một giá **giả định** và ghi rõ là giả định |
| **Phiên bản thư viện** | Dòng `pip install` trong `LocalCode` không ghim bản. Ngoại lệ: thư viện thay API thường xuyên (LangChain, LlamaIndex) ghim đúng bản đã chạy thử (`langchain==X.Y.Z`); thư viện vừa đổi API giữa hai bản major thì ghi mức tối thiểu (`gradio>=5`). Bản đã chạy thử luôn có trong bảng kiểm chứng |
| **Dòng phiên bản trong bài** | Mục "Ví dụ code" của mọi bài LLM mở bằng một câu ngắn: "Code trong bài chạy thử lần cuối tháng 10/2026, với Python 3.14 và `openai` 3.37." (theo gói thật của bài). Reviewer so câu này với bảng kiểm chứng |
| **Số liệu benchmark** | Ghi kèm paper và năm. Không viết bảng xếp hạng "hiện tại" |

**Cần kiểm chứng khi viết `text-api`** (chưa kiểm, ghi ở đây để không quên):

- Model suy luận (reasoning) của OpenAI có từ chối `temperature`, `top_p` không, và có đòi `max_completion_tokens` thay cho `max_tokens` không. Tránh tham số độ dài trong code chung nếu bài không cần.
- Groq có endpoint embeddings kiểu OpenAI không. Nếu không, bài RAG cần cách khác cho phần embedding (ô TF-IDF chạy trên trang, hoặc model embedding chạy trên máy).
- Thứ tự áp temperature, top-k, top-p ở các thư viện khác nhau (mục 4.6.2).

### 2.7. Biến thể template cho bài LLM

Bài LLM giữ **đúng 9 mục, đúng tên heading** của template. Các chỗ khác biệt:

1. **"Nhắc nhanh" được dài tới khoảng một đoạn** (4–6 câu) ở ba bài có bài cần biết trước chưa xuất bản và nặng kiến thức (quyết định 54):

   | Bài | Bài cần biết trước chưa có | Phần cần nhắc |
   |---|---|---|
   | `build-first-llm` | `dl/transformers`, `nlp/tokenization` | self-attention, khối Transformer chỉ có decoder, token và bộ tách từ |
   | `rag-chatbot` | `nlp/information-retrieval` | truy xuất, embedding, độ tương tự cosine |
   | `multimodal` | `cv/llava` (và `llama-family` nếu chưa có) | bộ mã hóa ảnh, nối embedding ảnh vào chuỗi token |

   Các bài khác giữ 2–3 câu như template.
2. **Mục "Minh họa" không bao giờ bị bỏ ở bài LLM.** Template chung cho phép bỏ mục khi không có hình nào giúp hiểu. Ở phần LLM, bài không có VIZ hay FIG thì mục này dùng một trong ba thứ:
   - bảng so sánh (ví dụ các kiểu prompt, các cách lượng tử hóa);
   - **hội thoại mẫu**: bảng hai cột "Vai trò" và "Nội dung", mỗi lượt một dòng (đọc được trên điện thoại và bằng trình đọc màn hình);
   - kết quả mẫu: `LocalCode` có khối "Kết quả mẫu", đặt ở mục này thay vì ở "Ví dụ code".

   Mở mục bằng một câu nói người đọc nên nhìn vào đâu, như với hình tĩnh.
3. **Mục "Ví dụ code"** mở bằng câu phiên bản (mục 2.6), rồi một câu nói ô nào chạy trên trang, ô nào chạy trên máy. Mỗi ô `LocalCode` đi kèm một đoạn giải thích output, như `PythonRunner`.
4. **Lỗi hay gặp** nên có ít nhất một hộp về chuyện thực hành với API khi hợp: lộ key, quên đặt biến môi trường, vượt giới hạn số lần gọi, tin output mà không kiểm.
5. **Đọc thêm**: tài liệu chính thức của thư viện link tới **đúng phiên bản** đã chạy thử khi trang tài liệu có phiên bản.

**Cách sửa `docs/lesson-template.mdx`** (nhiệm vụ L6, `developer`):

- Header, mục "CÁCH DÙNG": thêm một dòng "Bài phần LLM: đọc thêm `docs/architecture/llm-lessons.md` mục 2.7 và 4.8."
- Header, mục "KÝ HIỆU": thêm dòng "phần LLM (quyết định 60): độ dài chuỗi $L$, nhiệt độ $T$".
- Khối hướng dẫn "Ví dụ code": thêm câu phiên bản "Code trong bài chạy thử lần cuối…" (mục 2.6) và câu nói ô nào chạy trên trang, ô nào chạy trên máy (ý 3 ở trên).
- Import: thêm dòng `import LocalCode from '@components/LocalCode.astro';` và một import code mẫu `@code/<phần>/<bài>/<tên-3>.vi.py?raw`. Hướng dẫn import ghi: chỉ giữ khi bài có code chạy trên máy.
- Khối hướng dẫn "Nhắc nhanh": thêm câu "Phần LLM: ba bài `build-first-llm`, `rag-chatbot`, `multimodal` được dài tới khoảng một đoạn."
- Khối hướng dẫn "Minh họa": đổi gạch đầu dòng "Nếu không có hình nào thật sự giúp hiểu thì bỏ cả mục" thành "... thì bỏ cả mục, **trừ phần LLM**: giữ mục với bảng, hội thoại mẫu hoặc kết quả mẫu (llm-lessons.md mục 2.7)".
- Khối hướng dẫn "Ví dụ code": thay dòng cuối "Phần DL, NLP, CV, LLM có code cần PyTorch hoặc GPU: dùng khối code python thường, không dùng PythonRunner" bằng: "Code cần mạng, PyTorch, GPU hoặc thư viện ngoài Pyodide: file `.py` như trên, hiện bằng `LocalCode` (llm-lessons.md mục 2.1–2.3). Code không phải Python viết thẳng trong MDX." Thêm một mẫu:

  ````mdx
  <LocalCode code={chatCode} title="Tên ngắn của ô" packages={['openai']}>

  ```text
  Kết quả của một lần chạy thật, chép nguyên văn.
  ```

  </LocalCode>
  ````

- Sau khi sửa, `lesson-pairs.test.ts` và `roadmap-files.test.ts` không bị ảnh hưởng (template không nằm trong `src/content/docs/`).

### 2.8. Quy trình đợt song song

**Nhịp duyệt** (quyết định 60, thay cho nhịp ở quyết định 54): người dùng chọn **chạy hết 23 bài rồi duyệt một lần ở cuối**. Không còn các điểm duyệt giữa chừng (`LocalCode` trên trang demo, bài `text-api`, bài `build-first-llm`, từng đợt). Mỗi bài vẫn qua `content-reviewer` và được sửa; mỗi đợt vẫn qua check, test, build và có báo cáo.

**Thứ tự viết** (quyết định 54): bài `text-api` → bài `build-first-llm` → các đợt, mỗi đợt tối đa 4 bài. Đề xuất chia đợt theo quan hệ "cần biết trước", để bài nào cũng link được tới bài cần biết trước đã xuất bản ở đợt trước:

| Đợt | Bài | Bài cần biết trước (trong phần LLM) đã có từ |
|---|---|---|
| 0 | `text-api` (viết riêng) | |
| 1 | `build-first-llm` (viết riêng) | |
| 2 | `gradio-streamlit`, `prompt-engineering`, `image-video-api`, `web-crawling-mongodb` | đợt 0 |
| 3 | `docker-cloud`, `rag-chatbot`, `gpt-family-finetuning`, `pretraining-data` | đợt 1, 2 |
| 4 | `deploy-custom-model`, `langchain-llamaindex`, `graph-rag`, `llama-family` | đợt 1, 3 |
| 5 | `agents`, `rlhf`, `evaluation-peft`, `debugging-language-models` | đợt 1, 3, 4 |
| 6 | `dpo`, `deepseek-family`, `multimodal`, `llm-deployment` | đợt 4, 5 |
| 7 | `seq2seq` | (chỉ cần bài phần DL) |

`team-lead` có thể đổi thứ tự trong cùng một đợt. Không đưa một bài vào cùng đợt với bài cần biết trước của nó.

**Luật cho `lesson-writer` khi chạy song song:**

- Chỉ tạo và sửa file của bài mình: `src/content/docs/vi/llm/<bài>.mdx`, `src/code/llm/<bài>/*`. Hình và VIZ chỉ là comment giữ chỗ.
- **Không sửa** `src/data/roadmap.ts`, `docs/glossary.md`, `scripts/requirements-llm.txt`, `src/i18n/ui.ts`, `src/content/i18n/*`, `docs/lesson-template.mdx`, component dùng chung, `astro.config.ts`, file của bài khác.
- **Không chạy** `npm run build`, `npm test`, `npm run check`, `npm run test:e2e`, `npm run dev`. Các lệnh này cùng ghi `dist/`, `.astro/` và `node_modules/.vite`. Hai lệnh chạy cùng lúc ghi đè nhau và báo lỗi ngẫu nhiên.
- Chỉ kiểm bằng Python, thư mục làm việc ở scratchpad: `ast.parse` (lệnh ở mục 2.5) và chạy thử. Không dùng `python -m py_compile`, vì lệnh này ghi `__pycache__` vào `src/code/`.
- Chỉ link tới bài **đã xuất bản trước đợt này**. Bài cùng đợt chỉ ghi tên, không gắn link. Sau khi gộp, phiên chính có thể thêm link.
- Báo cáo có ba mục bắt buộc, để phiên chính gộp:
  1. dòng cần đổi trong `roadmap.ts` (`status.vi` thành `'published'`);
  2. thuật ngữ mới: tiếng Việt, tiếng Anh, ghi chú, theo cột của `docs/glossary.md`;
  3. gói Python cần thêm vào `scripts/requirements-llm.txt`, kèm bản đã chạy thử.

**Việc của phiên chính sau mỗi lượt viết song song:**

1. Đổi `status.vi` của cả đợt trong **một** lần sửa `roadmap.ts`.
2. Gộp thuật ngữ vào glossary, bỏ trùng; thống nhất khi hai bài đề xuất hai cách dịch.
3. Cập nhật `scripts/requirements-llm.txt`, cài vào `.venv-llm/`.
4. Chạy **một lần, lần lượt**: `npm run check`, `npm test`, `npm run build`. Không chạy hai build cùng lúc. `npm run dev` đang mở (`.claude/launch.json`) thì không sao, nhưng không mở thêm.
5. Gọi `content-reviewer` cho từng bài, song song được: reviewer chỉ đọc file và chạy Python trong scratchpad. Reviewer trong đợt song song **cũng không chạy** `npm run build`/`npm test`.
6. Chép bảng kiểm chứng của reviewer vào `docs/research/<bài>.md`.
7. `lesson-writer` sửa theo review, song song được (mỗi agent một bài).
8. `viz-builder` cho hình của đợt: các hình khác bài nhưng cùng sửa `src/data/figures/index.ts`, nên **chạy lần lượt**.
9. Chạy `npm test`, `npm run build`, `npm run test:e2e` một lần, viết báo cáo đợt, rồi sang đợt kế tiếp. Không chờ người dùng duyệt (quyết định 60); người dùng duyệt cả 23 bài ở cuối.

### 2.9. VIZ và FIG của phần LLM

Theo quyết định 54: **một VIZ tương tác** và **9 hình tĩnh**.

| Tên | Loại | Bài dùng | Ý chính (một câu) |
|---|---|---|---|
| `SamplingViz` | VIZ | `text-api`, `build-first-llm` | Mô hình cho một phân phối xác suất trên token kế tiếp; temperature làm phân phối nhọn hay phẳng, top-k và top-p cắt phần đuôi, rồi mới lấy mẫu |
| `RagPipelineFigure` | FIG | `rag-chatbot` (dùng lại được ở `langchain-llamaindex`, `graph-rag`) | Câu hỏi được dùng để truy xuất đoạn văn liên quan, rồi đoạn văn được ghép vào prompt trước khi gọi mô hình |
| `AgentLoopFigure` | FIG | `agents` | Agent lặp: mô hình chọn công cụ, chương trình chạy công cụ, kết quả quay lại mô hình, cho tới khi có câu trả lời |
| `RlhfStagesFigure` | FIG | `rlhf` (dùng lại được ở `dpo` để so sánh) | RLHF có ba bước: fine-tune có giám sát, học mô hình phần thưởng, tối ưu chính sách bằng RL |
| `LoraFigure` | FIG | `evaluation-peft` | LoRA giữ nguyên ma trận trọng số gốc, chỉ học hai ma trận nhỏ có tích cộng vào nó |
| `MoeFigure` | FIG | `deepseek-family` | Mỗi token chỉ đi qua vài expert do router chọn, nên phần tính toán nhỏ hơn nhiều so với tổng số tham số |
| `EncoderDecoderFigure` | FIG | `seq2seq` | Encoder đọc cả câu nguồn; decoder sinh từng token đích và nhìn lại encoder qua cross-attention |
| `MultimodalFigure` | FIG | `multimodal` | Ảnh đi qua bộ mã hóa ảnh và lớp chiếu thành các token ảnh, nằm chung chuỗi với token chữ của LLM |
| `ParallelismFigure` | FIG | `llama-family` (dùng lại được ở `llm-deployment`) | Data, tensor và pipeline parallelism chia ba thứ khác nhau: dữ liệu, ma trận của một lớp, các lớp |
| `ContainerImageFigure` | FIG | `docker-cloud` (dùng lại được ở `deploy-custom-model`) | Image là bản đóng gói cố định gồm nhiều lớp; container là một lần chạy image đó |

- Chữ của hình ở `src/data/figures/<tên-kebab>.ts` (bỏ đuôi `Figure`), ví dụ `rag-pipeline.ts`. Theo đủ quy ước [viz/figures.md](viz/figures.md) mục 8: bố cục hẹp bắt buộc, ≤ 10 000 ký tự HTML, chữ ≥ 12px ở 375px, 0 JS.
- Hình dùng lại ở bài khác: import cùng component, không vẽ lại. Mỗi trang chỉ dùng một hình một lần (id phần tử suy từ id hình).
- `ParallelismFigure` và `RlhfStagesFigure` là chuỗi ngang dài. Viz-builder thử bố cục rộng trước khi bỏ (bố cục rộng chưa được kiểm trên trang thật, viz/figures.md mục 8.7 rủi ro 6).
- Đặc tả `SamplingViz` ở mục 4.6.

#### 2.9.1. Lô FIG A (24/10/2026): `RagPipelineFigure`, `AgentLoopFigure`, `RlhfStagesFigure`

**File:**

- Hình: `src/components/figures/{RagPipeline,AgentLoop,RlhfStages}Figure.astro`; chữ vi/en: `src/data/figures/{rag-pipeline,agent-loop,rlhf-stages}.ts`; đăng ký trong `FIGURES`.
- Bài đã thay comment FIG: `rag-chatbot`, `langchain-llamaindex`, `graph-rag` (cùng `RagPipelineFigure`), `agents`, `rlhf`, `dpo` (cùng `RlhfStagesFigure`). Theo mẫu bài ML: một dòng import, comment một dòng `{/* FIG: … */}` và thẻ.
- Kit (dùng lại cho lô B và C):
  - `src/lib/figures/layout.ts`: `Box` (rải thẳng vào `<FigNode {...box} />`), `anchor(box, side, at = 0.5)` (điểm đầu/cuối mũi tên trên một cạnh), `centre(box)`, `spread(from, to, count, gap)` (chia đều một hàng hay một cột khối), `mainAndSmall(label)` (dòng đầu là chữ chính, các dòng sau là chữ phụ, cho file chữ viết khối dạng `[main, small…]`). Test: `tests/unit/viz/figure-layout.test.ts`.
  - `FigArrow`: thêm `tone="alt"` (nét đứt xanh, đầu mũi tên xanh, cùng nghĩa "nhóm thứ hai" với `FigNode tone="alt"`: bản đóng băng, "cùng một mô hình") và `head={false}` (đường nối không hướng). CSS mới trong `figures.css`: `.atlas-fig-arrow[data-tone='alt']`, `.atlas-fig-arrow-head[data-tone='alt']`. Màu `--atlas-fig-alt` trên nền trang đã đo (9,24 / 11,68), không có cặp màu mới. E2E `figureContrast` đo được vì vẫn là `.atlas-fig-arrow` / `.atlas-fig-arrow-head`.
  - **Lưu ý cho lô sau:** `figureContrast` trong `lessons.spec.ts` báo "unmeasured" mọi `line`, `circle`, `rect`, `path`… không thuộc lớp đã biết. Vì vậy không vẽ khung nhóm bằng `rect` rời, không vẽ hình thoi quyết định hay biểu tượng (ổ khóa) bằng `path`: dùng `FigNode` (có thể `tone`), `FigArrow`, `FigText`. Muốn thêm loại nét mới thì phải nhờ `tester` thêm vào danh sách đo.

**Quyết định tự chọn (đổi lại được khi người dùng duyệt):**

- Cả ba hình chỉ có bố cục hẹp. Cột nội dung ở 1280px rộng 632px, dưới ngưỡng 640, nên bố cục rộng chỉ hiện từ khoảng 1440px. `RlhfStagesFigure` (chuỗi ngang dài) đã thử ước tính: SVG hẹp 6 210 ký tự (đo trong `dist`), thêm một SVG rộng cùng các khối thì cả hình khoảng 13 000, vượt ngân sách 10 000 ký tự (viz/figures.md 8.2 g). Bỏ, như `MlWorkflowFigure`.
- `RagPipelineFigure`: hai hàng của đặc tả xoay thành hai cột (lập chỉ mục bên trái, viền đứt; truy vấn bên phải). Cột truy vấn bắt đầu thấp hơn một hàng để hai khối "Embedding" nằm ngang nhau (nối nét đứt "cùng một mô hình") và "Kho vectơ" nằm cạnh "Tìm top-k". Trọng tâm (`accent`) chỉ ở hai khối mang ý chính: "Tìm top-k" và "Ghép prompt", không tô cả cột.
- `graph-rag`: không thêm biến thể hình. Biến thể phải đổi 4 nhãn cùng chú thích và mô tả (chú thích có công thức cosine), nặng hơn. Thay vào đó, một câu dẫn trước hình: đọc "Kho vectơ" thành đồ thị, "Tìm top-k (cosine)" thành duyệt đồ thị. `langchain-llamaindex`: thêm câu dẫn mà comment FIG yêu cầu (mỗi khối ứng với một hàng của bảng đối chiếu).
- `AgentLoopFigure`: vòng lặp vẽ thành hình vuông đọc từ "Mô hình" (`accent`). Kiểm tra trần số bước đặt **sau** khi chạy công cụ (mũi tên từ "Kết quả": "còn lượt" về mô hình, "chạm trần số bước" lên "Dừng"), khớp vòng `for step in range(MAX_STEPS)` của code. "Có gọi công cụ?" là khối chữ nhật, không phải hình thoi (lý do ở lưu ý trên). "Hỏi người dùng" là khối viền đứt nối với khối chạy công cụ bằng nét đứt.
- `RlhfStagesFigure`: ba cột của đặc tả không vừa 360 đơn vị với chữ ≥ 12px. Bước 1 và 2 đứng cạnh nhau ở trên, bước 3 (trọng tâm) trải hết chiều rộng ở dưới. Hai mũi tên đứt chạy theo lề ngoài từ "Mô hình SFT" xuống "Mô hình tham chiếu" và từ "RM" xuống "RM chấm điểm"; hai khối đích có viền đứt và dòng "đóng băng". Nhãn "phạt KL" đặt trên mũi tên từ mô hình tham chiếu vào chính sách, "PPO" trên mũi tên từ điểm RM về chính sách. Không có khối "Prompt" riêng ở bước 2 và 3, số prompt ghi dưới tên mỗi bước. Không vẽ ổ khóa.

**Số đo (24/10/2026, bản build, sau `document.fonts.ready`):**

| Hình | `viewBox` hẹp | HTML (không tính KaTeX) | Phần tử | Chữ nhỏ nhất ở 375px / 1280px |
|---|---|---|---|---|
| `RagPipelineFigure` | 360 × 524 | 5 845 (vi), 5 935 (en) ký tự | 80 | 12,39 / 14,44px |
| `AgentLoopFigure` | 360 × 352 | 5 316 (vi), 5 353 (en) ký tự | 72 | 12,39 / 14,44px |
| `RlhfStagesFigure` | 360 × 496 | 7 054 (vi), 7 154 (en) ký tự | 91 | 12,39 / 14,44px |

- Không chữ nào tràn khối hay ra ngoài `viewBox`, mọi chữ trong khối cách viền ≥ 6 đơn vị, không chữ rời nào đè lên khối; trang không cuộn ngang ở 375px.
- `figures.css` (bỏ comment, gzip): **673 byte** (66% của 1 024), trước lô này 643.

#### 2.9.2. Lô FIG B (24/10/2026): `LoraFigure`, `MoeFigure`, `EncoderDecoderFigure`

**File:**

- Hình: `src/components/figures/{Lora,Moe,EncoderDecoder}Figure.astro`; chữ vi/en: `src/data/figures/{lora,moe,encoder-decoder}.ts`; đăng ký trong `FIGURES`. `moe.ts` xuất thêm `MOE_PICKED = [2, 6]` và `MOE_ROUTED = 8`.
- Bài đã thay comment FIG (chỉ bản vi, chưa có bản en): `evaluation-peft`, `deepseek-family`, `seq2seq`. Theo mẫu bài ML: một dòng import, comment một dòng `{/* FIG: … */}` và thẻ.
- Kit, mở rộng cho lô này (dùng lại được cho lô C):
  - `FigMath`: thêm `bold` (ký hiệu đứng, đậm 600, tức `\mathbf` của site cho vectơ và ma trận: $\mathbf{x}$, $\mathbf{W}_0$; Barlow 600 đứng đã nạp) và `before` (ký tự toán đứng trước ký hiệu, ví dụ "×" của "× N", cách `dx = 3`). `checkMathLabel(symbol, sub?, after?, before?)` kiểm cả `before`; tập ký tự của `after`/`before` thêm "×" (U+00D7, có trong tập con latin của Barlow). Kiểu chung `MathLabel` ở `src/lib/figures/geometry.ts`. CSS mới: `.atlas-fig-math-bold { font-weight: 600 }`.
  - `FigNode`: thêm `math?: MathLabel`, một dòng ký hiệu (15 đơn vị) **trên** các dòng chính, vẽ bằng `FigMath` bên trong `g.atlas-fig-node`, nên e2e kiểm nó nằm trong khối và đo tương phản với nền khối. Có `math` thì `lines` được bỏ (ví dụ khối ma trận chỉ ghi $\mathbf{A}$). Vẫn tối đa 3 dòng tính cả dòng ký hiệu. Vị trí dòng tính bằng hàm thuần mới `nodeRows(y, height, sizes)` trong `geometry.ts` (cùng kết quả với cách tính cũ, ba hình ML và lô A không đổi).
  - `FigNode tone="off"`: viền chấm (`stroke-dasharray: 3 3`) màu `muted`, nền bằng màu trang (`--atlas-fig-bg`), chữ `muted`. Dùng cho phần **không chạy** (expert router không chọn). Cặp màu đã đo ở viz/figures.md 8.2 f: viền và chữ `muted` trên `bg` 6,28 / 6,89. E2E đo được vì vẫn là `.atlas-fig-node > rect`.
  - `src/lib/figures/layout.ts`: `spreadByWeight(from, to, weights, gap)`, chia một hàng khối theo tỉ lệ (hàng token có từ dài ngắn khác nhau).
  - Test: `tests/unit/viz/figure-kit-llm.test.ts` (`spreadByWeight`, `nodeRows`, `checkMathLabel` với `before` và "×").
  - Khung "× N lớp" của `EncoderDecoderFigure` là `FigArrow head={false}` khép kín (điểm đầu bằng điểm cuối), không phải `rect` rời, nên `figureContrast` đo được.

**Quyết định tự chọn (đổi lại được khi người dùng duyệt):**

- Cả ba hình chỉ có bố cục hẹp (cùng lý do 2.9.1: cột nội dung 632px ở 1280px).
- **Ký hiệu toán nằm trong khối** (dòng `math`), chữ giải thích nằm ngoài khi khối hẹp. Ký hiệu khớp bài: $\mathbf{x}$, $\mathbf{h}$, $\mathbf{W}_0$, $\mathbf{A}$, $\mathbf{B}$, $r$ (LoRA); $\mathbf{u}$, $\mathbf{h}$ (MoE); $\mathbf{Q}$, $\mathbf{K}$, $\mathbf{V}$, $N$ (seq2seq). Hệ số $\frac{\alpha}{r}$ không vẽ trong hình (FigMath không có phân số): khối ghi "Nhân hệ số", công thức đầy đủ ở chú thích.
- `LoraFigure`: cạnh của $\mathbf{W}_0$ (112) bằng chiều rộng của $\mathbf{A}$ và chiều cao của $\mathbf{B}$, nên kích thước khối tự nói $d_{\text{in}}$, $d_{\text{out}}$ và $r$ là cạnh mỏng ($\mathbf{A}$ cao 36, $\mathbf{B}$ rộng 40, vẽ to hơn tỉ lệ thật để đọc được chữ). $\mathbf{W}_0$ viền đứt xanh (`alt`, "bản đóng băng" như 2.9.1), $\mathbf{A}$ và $\mathbf{B}$ là trọng tâm (`accent`). Không vẽ ổ khóa (2.9.1). "Cộng" là khối nhỏ, không phải vòng tròn ⊕ (U+2295 không có trong tập con Barlow, và `circle` rời không được đo). "r chiều" tách thành `FigMath` $r$ và chữ "chiều" (viz/static-plots.md 11.3).
- `MoeFigure`: `accent` nghĩa là "chạy cho token này": hai expert được chọn, expert dùng chung, ô chú giải "Được chọn". **Router để thường** (comment FIG ghi router là trọng tâm), để mắt đi tới chỗ expert sáng lên, đúng câu dẫn của bài "nhóm dùng chung luôn sáng, còn nhóm định tuyến chỉ vài ô được router tô sáng". Expert đánh số 0–7 như code; token 0 của ô code thứ nhất chọn expert 2 (cổng 0.454) và 6 (0.546), đã chạy lại `moe-routing.vi.py` ngày 24/10/2026. Kết nối tắt chạy theo lề phải. Ô chú giải là hai khối mang đúng kiểu viền của chúng ("Được chọn" `accent`, "Không chạy" `off`).
- `EncoderDecoderFigure`: hai cột đọc từ dưới lên như Vaswani và cộng sự (2017). "Đầu ra encoder" đặt ngang hàng "Cross-attention" để hai mũi tên $\mathbf{K}$, $\mathbf{V}$ đi thẳng ngang; vì vậy cột encoder thấp hơn và có khoảng trống phía trên trái. Hàng token hai cột cùng đáy. Nhóm thứ hai là khung đứt xanh của encoder và khối "Đầu ra encoder"; trong decoder chỉ "Cross-attention" là `accent`. Mũi tên "nối vào khi sinh" đứt (`alt`, chỉ ở lúc sinh) chạy theo lề phải về cuối hàng đầu vào. Mỗi hàng token có một mũi tên từ ô giữa lên khối attention, không phải ba. "× N lớp" ở góc trên phải trong khung; vị trí của "× N" dựa trên ước lượng rộng của chữ (6 đơn vị một chữ cái ở cỡ 13, Barlow khoảng 5).

**Số đo (24/10/2026, bản build, sau `document.fonts.ready`):**

| Hình | `viewBox` hẹp | HTML (không tính KaTeX) | Phần tử | Chữ nhỏ nhất ở 375px / 1280px | Lề chữ trong khối nhỏ nhất |
|---|---|---|---|---|---|
| `LoraFigure` | 360 × 500 | 5 055 (vi), 5 156 (en) ký tự | 67 | 12,39 / 14,44px | 8,1 |
| `MoeFigure` | 360 × 508 | 7 442 (vi), 7 499 (en) ký tự | 103 | 12,39 / 14,44px | 7,6 |
| `EncoderDecoderFigure` | 360 × 442 | 7 803 (vi), 7 970 (en) ký tự | 105–106 | 12,39 / 14,44px | 6,1 |

- Không chữ nào tràn khối hay ra ngoài `viewBox`, không chữ rời nào đè lên khối hay bị đường nối cắt qua; trang không cuộn ngang ở 375px.
- `figures.css` (bỏ comment, gzip): **706 byte** (69% của 1 024), trước lô này 673.
- E2E `lessons.spec.ts` và `lessons-meta.spec.ts` trên 11 bài có hình (`ml-overview`, `regularization`, 6 bài lô A, 3 bài lô B; vi và trang fallback en; `desktop` và `mobile`): 294 qua, 36 bỏ qua (điều kiện có sẵn của test), 0 lỗi.

#### 2.9.3. Lô FIG C (24/10/2026): `MultimodalFigure`, `ParallelismFigure`, `ContainerImageFigure`

**File:**

- Hình: `src/components/figures/{Multimodal,Parallelism,ContainerImage}Figure.astro`; chữ vi/en: `src/data/figures/{multimodal,parallelism,container-image}.ts`; đăng ký trong `FIGURES`. `container-image.ts` xuất thêm `CONTAINER_IMAGE_API` (mô tả `sr-only` của biến thể `stack="api"`, xem dưới).
- Bài đã thay comment FIG (chỉ bản vi): `multimodal`; `llama-family` và `llm-deployment` (cùng `ParallelismFigure`, không đổi gì); `docker-cloud` và `deploy-custom-model` (cùng `ContainerImageFigure`, bài sau dùng `stack="api"`). Theo mẫu bài ML: một dòng import, comment một dòng `{/* FIG: … */}` và thẻ. Sau lô này không còn comment FIG giữ chỗ nào trong `src/content/docs/vi/llm/`: 14 bài, 16 chỗ đặt hình, chỗ nào cũng có thẻ.
- Kit, mở rộng cho lô này:
  - `FigNode bare`: khối không chữ (thanh lớp, ô), tên đặt bằng chữ xung quanh. Luật "khối chứa gì" chuyển thành hàm thuần `nodeContentError(main, small, hasMath, bare)` trong `geometry.ts` (cùng các luật cũ; khối `bare` không được có dòng nào). E2E vẫn đo được vì vẫn là `.atlas-fig-node > rect`.
  - `FigText xs`: các dòng đứng **cạnh nhau** trên cùng một `y`, dòng thứ i ở `xs[i]`, trong **một** `<text>` (tên các cột: "Lớp 1" … "Lớp 4"), tối đa `MAX_ROW_LABELS = 8`. Vị trí dòng tính bằng hàm thuần `textLinePositions` (chế độ xếp chồng cũ cho cùng kết quả với `lineOffsets`).
  - `FigArrow`: phần tính điểm và đầu mũi tên chuyển thành hàm thuần `arrowParts(points, head)`, kết quả không đổi.
  - **Thu gọn HTML của mọi hình** (để `ParallelismFigure` vừa ngân sách, mục dưới): `dominant-baseline="central"` không còn ghi trên từng `<text>` mà nằm ở `figures.css` (`.atlas-fig-svg text`); `text-anchor` chỉ ghi khi là `start`/`end`, còn `middle` lấy từ `.atlas-fig-svg text:not([text-anchor])`, nên thuộc tính vẫn thắng ở chỗ có ghi; `FigNode` thường (`plain`) không ghi `data-tone`. Hình hiển thị y như cũ (đã soi lại `RegularizationGeometryFigure`, `EncoderDecoderFigure`, `MoeFigure`), mỗi hình cũ nhẹ đi khoảng 15%: `EncoderDecoderFigure` 7 803 → 6 506 ký tự (vi), `MoeFigure` 7 442 → 6 257.
  - Test: `tests/unit/viz/figure-kit-llm-c.test.ts` (`nodeContentError`, `arrowParts`, `textLinePositions`, hai luật CSS mới, mô tả của biến thể `api`).
  - Lô này **không** thêm loại nét nào: khung GPU, khung chuỗi token, lưới ảnh, ngoặc dưới chuỗi và khung container đều là `FigArrow head={false}` (khép kín khi cần), như 2.9.2.

**Quyết định tự chọn (đổi lại được khi người dùng duyệt):**

- Cả ba hình chỉ có bố cục hẹp (cùng lý do 2.9.1). `ParallelismFigure` là chuỗi ba ô dài nhưng bản hẹp đã gần chạm ngân sách (dưới), nên không thử bản rộng.
- `MultimodalFigure`: hai cột đọc từ trên xuống gặp nhau ở một hàng. Lưới 4 × 4 vẽ bằng đường (khung và hai đường zigzag), đánh số 1–5 và 16 theo thứ tự đọc, có ghi chú "ảnh thật có 16 × 16 ô". **Màu A/B của đặc tả:** phía ảnh (bộ mã hóa ảnh, đặc trưng ảnh, token ảnh) dùng viền đứt xanh (`alt`), phía chữ dùng khối thường; "đóng băng" và "học" ghi bằng chữ; chỉ projector là `accent`. Chuỗi là **một hàng 7 ô bằng nhau trong một khung**: 3 ô ảnh (1, …, 256) rồi 4 ô chữ ("Ảnh", "có", "gì", …), ngoặc dưới ghi "256 token ảnh" và "10 token chữ". Ô đặc trưng hẹp hơn ô token (38 so với 47 đơn vị) để nói projector đổi $D_v$ thành $D$. "Bảng embedding" đặt ngang projector vì cả hai đổi đầu vào thành hàng $D$ số. $L = 266$ là `FigMath` cạnh mũi tên vào LLM. Câu hỏi bản en nháp là "What is in it?".
- `ParallelismFigure`: ba ô (dữ liệu, tensor, pipeline), mỗi ô hai dải GPU xếp trên dưới; mỗi lớp là một **cột** (thanh `bare`), tên cột ghi một hàng trên mỗi ô; đầu vào đứng bên trái. `accent` là thứ bị chia: hai nửa lô; nửa lớp mỗi GPU giữ (nửa kia viền chấm `off`); các lớp mỗi GPU giữ (phần không giữ để trống). **Khung GPU để thường** (comment FIG ghi khung GPU là nhóm thứ hai): khung đứt xanh trùng kiểu với đường trao đổi đứt xanh, nhìn như một khối liền; vì vậy nhóm thứ hai chỉ còn những gì di chuyển (cả lô, micro-batch, trao đổi). **Cộng gộp (all-reduce) là đường nối không đầu**, một đường cho "cộng gradient", một đường mỗi lớp cho "cộng kết quả": phép cộng gộp đối xứng, và hai đầu mũi tên mỗi đường làm hình vượt ngân sách. Kích hoạt và gradient giữa lớp 2 và lớp 3 là hai mũi tên xiên song song. 4 micro-batch xếp hàng bên trái GPU 1, số 1 sát GPU. Chú thích bỏ cụm "xem mục Lý thuyết" của đặc tả để đọc đúng ở cả `llm-deployment`. Bản en nháp: "Half A", "Half B", "Full batch".
- `ContainerImageFigure`: image ở trên (ba lớp `accent`, từ dưới lên: base image, gói pip, code), hai mũi tên "docker run" thẳng xuống hai container. Mỗi container: lớp ghi tạm (`alt`, dòng phụ "mất khi xóa container") trên ba thanh `bare` thường là ba lớp của image vẽ lại mờ hơn, dưới có chữ "lớp image dùng chung". **`deploy-custom-model` dùng prop `stack="api"`** thay vì một câu dẫn: chỉ ba nhãn lớp (`apiBase`, `apiPip`, `apiCode`) và mô tả đổi, khớp Dockerfile của bài đó (`python:3.14-slim`; fastapi, uvicorn, scikit-learn; `app.py`, `model.joblib`). Câu dẫn sẽ để hình ghi `python:3.12-slim`, openai, gradio ngay cạnh một Dockerfile khác. Container trong hình không ghi uvicorn và cổng 8000 như comment của bài đó tả: hai container giống nhau ở cả hai bài.

**Số đo (24/10/2026, bản build, sau `document.fonts.ready`):**

| Hình | `viewBox` hẹp | HTML (không tính KaTeX) | Phần tử | Chữ nhỏ nhất ở 375px / 1280px | Lề chữ trong khối nhỏ nhất |
|---|---|---|---|---|---|
| `MultimodalFigure` | 360 × 498 | 7 523 (vi), 7 734 (en) ký tự | 127 | 12,39 / 14,44px | 6,5 (vi), 5,5 (en, "What") |
| `ParallelismFigure` | 360 × 492 | 9 362 (vi), 9 521 (en) ký tự | 155–156 | 12,39 / 14,44px | 5,0 |
| `ContainerImageFigure` | 360 × 398 | 3 958 / 4 088 (`chat`, vi/en); 4 035 / 4 167 (`api`) | 64 | 12,39 / 14,44px | 8,9 |

- `ParallelismFigure` bản đầu nặng 12 931 ký tự. Đã thu xuống bằng phần "thu gọn HTML" của kit, `FigText xs`, bỏ ô chấm ở dải pipeline và dùng đường nối không đầu cho phép cộng gộp. Còn khoảng 480 ký tự dư ở bản en: dịch dài thêm nhiều (nhất là mô tả) thì e2e sẽ báo.
- Không chữ nào tràn khối hay ra ngoài `viewBox`, không chữ rời nào đè lên khối hay bị đường nối cắt qua; trang không cuộn ngang ở 375px.
- `figures.css` (bỏ comment, gzip): **752 byte** (73% của 1 024), trước lô này 706.
- E2E `lessons.spec.ts` và `lessons-meta.spec.ts` trên 16 bài có hình (`ml-overview`, `regularization`, 14 bài LLM; vi và trang fallback en; `desktop` và `mobile`): 480 test, 424 qua, 56 bỏ qua (điều kiện có sẵn của test), 0 lỗi.

### 2.10. Thời gian e2e trong CI

**Số đo hiện tại** (log CI ngày 23/10/2026, lần chạy `40015551773`, 4 bài đã xuất bản):

| Mục | Số |
|---|---|
| Bước "E2E tests" (gồm `npm run build` khoảng 1,5 phút) | **15 phút 52 giây**; job e2e 16 phút 38 giây. Giới hạn `timeout-minutes: 20` |
| Số test | 528 (487 qua, 41 bỏ qua), **1 worker** |
| Vì sao 1 worker | Runner `ubuntu-latest` của repo private có 2 vCPU; Playwright mặc định dùng một nửa số lõi |
| `lessons.spec.ts`, mỗi bài (vi + en, desktop + mobile) | 28 s (bài không có VIZ, có 2 hình) tới 60 s (bài có VIZ và hình) |
| `viz.spec.ts` | khoảng 2 s mỗi test, khoảng 88 s cho mỗi bài có VIZ |

**Ước tính khi đủ 23 bài LLM**, vẫn 1 worker:

| Thêm | Ước tính |
|---|---|
| Bài Gradient Descent (đang làm, có VIZ) | +2 phút |
| 23 bài × 11 test × 2 ngôn ngữ × 2 project ≈ 1 012 test, khoảng 30 s mỗi bài | +12 phút |
| `SamplingViz` trên 2 bài, qua `viz.spec.ts` | +3 phút |
| `LocalCode` trên trang demo | dưới 1 phút |
| **Tổng** | **khoảng 33 phút**, gấp 1,6 lần giới hạn |

Riêng bài Gradient Descent đã đưa job lên khoảng 19 phút, sát giới hạn 20 phút. **Phải giảm trước bài `text-api`**, không đợi tới cuối phần LLM.

**Các cách giảm, xếp theo lợi trên công:**

| # | Cách | Ước lợi | Chi phí |
|---|---|---|---|
| E1 | **Tách test không phụ thuộc màn hình ra khỏi project `mobile`.** Chuyển các test meta (title, `hreflang`, canonical, `noindex`, Pagefind), sidebar và Trước/Sau, KaTeX, tên công thức, `Prerequisites`, số component, nút đổi ngôn ngữ từ `lessons.spec.ts` sang `lessons-meta.spec.ts`. Trong `playwright.config.ts`, project `mobile` có `testIgnore: /lessons-meta\.spec\.ts/`. Làm tương tự với test ngân sách JS và props trong `viz.spec.ts` | khoảng 25% thời gian test bài | Sửa test, không thêm phút CI |
| E2 | **Bớt test lặp trên trang fallback** `/en/<bài>/` của bài chưa dịch. Trang này hiện đúng file vi, nên các test về nội dung (KaTeX, tên công thức, số component, công thức tràn ở 375px) lặp y hệt trang vi. Giữ các test riêng của fallback: meta và `noindex`, sidebar tiếng Anh, `Prerequisites` link `/en/`, nút đổi ngôn ngữ, hình tĩnh (chữ tiếng Anh của hình chỉ hiện ở đây), VIZ (chuỗi tiếng Anh), không cuộn ngang | khoảng 20% thời gian test bài | Sửa test. Khi bài có bản en, các test tự chạy lại đủ, vì điều kiện đọc từ `roadmap.ts` |
| E3 | **Chia shard**: ma trận 2 job e2e, `--shard=1/2` và `--shard=2/2`, cùng `fullyParallel: true` để chia theo từng test (không có cờ này thì chia theo file, mà `lessons.spec.ts` là một file lớn). **Build một lần** ở job `verify`, tải `dist/` lên làm artifact; job e2e tải về và chỉ chạy `astro preview`. `playwright.config.ts` đọc biến `E2E_PREBUILT` để bỏ bước build | thời gian chờ chia khoảng 2 | Thêm khoảng 1,5 phút phút-runner cho mỗi shard thêm (cài gói, cài Chromium) |
| E4 | `workers: 2` khi chạy trong CI | 1,3–1,6 lần, cần đo | Hai trình duyệt và server preview chung 2 vCPU, có thể chậm từng test và dễ chập chờn |

Đề xuất: làm **E1 + E3 ngay** (nhiệm vụ L0, trước bài `text-api`), đo lại, rồi làm E2 khi bài thứ 10 của phần LLM được xuất bản hoặc khi job vượt 15 phút. E4 chỉ thử sau E3, đo trên CI thật (câu hỏi 2).

- Báo cáo khi shard bị lỗi: mỗi shard tự tải `playwright-report/` khi lỗi, như bước hiện có. Chưa cần gộp báo cáo bằng `merge-reports`.
- Mục tiêu sau L0: job e2e dài nhất **≤ 12 phút**, để còn chỗ cho 23 bài LLM.

**Quy ước sau L0 (đã làm):**

- File tên `*-meta.spec.ts` (hiện có `lessons-meta.spec.ts`, `viz-meta.spec.ts`) chỉ chạy ở project `desktop`: project `mobile` bỏ qua chúng bằng `testIgnore: /-meta\.spec\.ts$/` trong `playwright.config.ts`. Test mới chỉ đọc DOM, HTML hay `dist/` mà không phụ thuộc bố cục thì đặt vào file `*-meta.spec.ts`; test về bố cục (375px, cuộn ngang, tràn) giữ ở file thường để chạy cả hai project.
- Số test (không tính `@network`): **desktop 264, mobile 174**. Trước L0: desktop 264, mobile 264.
- CI: job `verify` build một lần và tải `dist/` lên làm artifact (`retention-days: 1`); hai job `e2e` (shard 1/2 và 2/2, `fail-fast: false`) tải `dist/` về và chạy với `E2E_PREBUILT=1`. Báo cáo khi lỗi: artifact `playwright-report-1`, `playwright-report-2`.

## 3. Cấu trúc file

```
src/
├─ components/
│  └─ LocalCode.astro                    # NEW: wraps Starlight <Code>, requirement list, sample-output slot. 0 JS
├─ lib/
│  └─ local-code.ts                      # NEW pure: readEnvVars(code), pipCommand(packages)
├─ styles/
│  └─ local-code.css                     # NEW: in customCss, before figures.css (decision 13)
├─ i18n/ui.ts                            # + namespace localCode, + vizSampling
├─ content/i18n/{vi,en}.json             # + atlas.localCode.*, atlas.vizSampling.*
├─ code/
│  ├─ dev/local-chat.{vi,en}.py          # NEW demo: OpenAI-compatible call (English prompt, strict pair rule)
│  ├─ dev/local-app.{vi,en}.py           # NEW demo: tiny Streamlit app (file, command, hardware props)
│  └─ llm/<lesson>/<name>.{vi,en}.py     # lesson code (section 2.3)
├─ content/docs/{vi,en}/dev/components.mdx   # + section "Code chạy trên máy bạn" / "Code that runs on your machine"
├─ components/viz/SamplingViz.astro      # later (task L8): wrapper
├─ components/viz/sampling-viz/SamplingVizIsland.tsx
├─ lib/viz/sampling.ts                   # pure: softmax with temperature, top-k, top-p, seeded sampling
├─ data/datasets/next-token.ts           # TokenDistribution: context, tokens (vi/en), logits
└─ components/figures/<Name>Figure.astro + data/figures/<name>.ts   # 9 figures, one per batch as needed
scripts/
└─ requirements-llm.txt                  # NEW: pinned packages of .venv-llm/
docs/
├─ architecture/llm-lessons.md           # this file
└─ research/<lesson>.md                  # + "## Kiểm chứng code" table per LLM lesson
tests/unit/
├─ local-code.test.ts                    # NEW: readEnvVars, pipCommand
├─ code-secrets.test.ts                  # NEW: no hard-coded keys in src/ and docs/
├─ python-syntax.test.ts                 # NEW: ast.parse every .py under src/code and ```python fences of llm lessons
├─ llm-code.test.ts                      # NEW: conventions of src/code/llm + verification coverage
├─ code-pairs.test.ts                    # + llm string rule, + "published en has no Vietnamese"
├─ lesson-pairs.test.ts                  # demo control: imports 10 -> 13
├─ sampling.test.ts                      # later (L8)
└─ fixtures/sampling-python.ts           # later (L8)
tests/e2e/
├─ components.spec.ts                    # + LocalCode on the demo page
├─ lessons.spec.ts                       # split for E1: viewport-dependent lesson tests
└─ lessons-meta.spec.ts                  # NEW (E1): viewport-independent lesson tests, desktop only; + .atlas-local count and lang
.github/workflows/ci.yml                 # E3: dist artifact, 2 e2e shards
playwright.config.ts                     # E1 testIgnore for mobile, E3 fullyParallel + E2E_PREBUILT
```

- `LocalCode.astro` nằm ở gốc `src/components/` như `PythonRunner.astro`, vì nó là component bài học dùng chung, không gắn với một bài.
- `src/lib/local-code.ts` chỉ dùng import tương đối, như các file `src/lib/` khác mà test e2e import.

## 4. Giao diện

### 4.1. `LocalCode`

```ts
// src/components/LocalCode.astro
interface Props {
  /** Program text, imported with ?raw from src/code/<part>/<lesson>/<name>.<locale>.py. Must not be empty. */
  code: string;
  /** Caption above the block (content, per locale), like PythonRunner. */
  title?: string;
  /** File name in the frame tab, e.g. 'app.py'. Always passed to <Code> as title={file ?? ''} (section 2.2). */
  file?: string;
  /** Only 'python' for now; non-Python code goes in an MDX fence (section 2.1). */
  lang?: 'python';
  /** pip names, shown as one "pip install …" line. May carry a version spec ('gradio>=6'), quoted for the shell. */
  packages?: string[];
  /** Command to run the file when it is not plain "python <file>", e.g. 'streamlit run app.py'. */
  command?: string;
  /** Content, per locale: hardware the code needs, e.g. 'GPU NVIDIA, 16 GB VRAM'. */
  hardware?: string;
  /** false when the sample output is the same on every run (parsed HTML, a parameter count…). Default true. */
  sampleVaries?: boolean;
}
// Default slot (optional): the sample output, usually one ```text fence. Rendered under "Kết quả mẫu".
```

```ts
// src/lib/local-code.ts — pure, relative imports only
export interface EnvVar {
  name: string;      // 'OPENAI_API_KEY'
  optional: boolean; // true when the code only reads it with os.environ.get(...)
}
/**
 * Environment variables read by the code, in order of first appearance, each name once.
 * os.environ["X"] -> required; os.environ.get("X") -> optional (required wins when both appear).
 * Throws when the code calls os.getenv (LocalCode would miss it).
 */
export function readEnvVars(code: string): EnvVar[];
/**
 * 'pip install openai numpy'; '' for an empty list. A name with any character outside letters, digits,
 * '.', '_' and '-' is wrapped in single quotes, which paste the same into bash and PowerShell:
 * "pip install openai 'gradio>=6'". Throws on an empty or blank name, and on a single quote, tab or line break.
 */
export function pipCommand(packages: readonly string[]): string;
```

- **Nháy đơn cho tên gói có ký tự của shell.** `>` và `<` là chuyển hướng ở cả bash lẫn PowerShell (`pip install gradio>=6` ghi ra file `=6`), `[` `]` là glob của bash, `;` tách lệnh, `,` tạo mảng trong PowerShell. Tên trơn (chữ, số, `.`, `_`, `-`) giữ nguyên, không nháy. Nháy đơn được chọn vì bash và PowerShell đều hiểu nó là chuỗi nguyên văn. Tên chứa chính dấu `'` thì báo lỗi, vì hai shell thoát dấu này khác nhau (bash cần `'\''`, PowerShell cần `''`). `cmd.exe` không bỏ nháy đơn, nên không phải đích của dòng này (bài `text-api` hướng dẫn bash và PowerShell).

Lỗi build (thông báo nói rõ trang và prop, như `PythonRunner`): `code` rỗng; `lang` khác `'python'`; `packages` có phần tử rỗng hoặc chứa `'`, tab, xuống dòng; code có `os.getenv`.

**HTML ra** (phác thảo, mọi chữ lấy từ `getStrings(Astro.locals.t, 'localCode')`):

```html
<div class="atlas-local not-content" lang="{locale}" data-local-code>
  <div class="atlas-local-head">
    <p class="atlas-local-badge" data-pagefind-ignore><span class="atlas-local-icon" aria-hidden="true"></span>{badge}</p>
    <p class="atlas-local-title" lang="{contentLang}">{title}</p>               <!-- when title -->
  </div>
  <dl class="atlas-local-reqs">                                                 <!-- when any row -->
    <div><dt>{install}</dt><dd><code>pip install openai</code></dd></div>
    <div><dt>{env}</dt><dd><code>OPENAI_BASE_URL</code> ({optional}), <code>OPENAI_API_KEY</code>, <code>LLM_MODEL</code></dd></div>
    <div><dt>{command}</dt><dd><code>streamlit run app.py</code></dd></div>
    <div><dt>{hardware}</dt><dd lang="{contentLang}">GPU NVIDIA, 16 GB VRAM</dd></div>
  </dl>
  <div class="atlas-local-code" lang="{contentLang}"><!-- <Code code lang title={file ?? ''} /> --></div>
  <div class="atlas-local-output">                                              <!-- when the slot has content -->
    <p class="atlas-local-output-label">{sampleOutput}</p>
    <p class="atlas-local-output-note">{sampleVaries ? sampleNote : sampleNoteFixed}</p>
    <div lang="{contentLang}"><slot /></div>
  </div>
</div>
```

- `lang`: gốc có `lang={locale}` (chữ giao diện theo trang). Phần lấy từ file bài (tiêu đề, code, phần cứng, kết quả mẫu) có `lang={getContentLang(route)}`, như `PythonRunner` ([components.md](components.md) mục 4.1). Trên trang fallback `/en/…`, nhãn là tiếng Anh, code và kết quả mẫu là tiếng Việt.
- Thứ tự đọc: nhãn → tiêu đề → yêu cầu → code → kết quả mẫu. Người đọc biết phải cài gì trước khi đọc code.
- `<dl>` có các nhóm `<div>` (HTML cho phép). Trình đọc màn hình đọc "Cần cài: pip install openai".
- Thứ tự biến môi trường theo lần xuất hiện đầu tiên trong code. Với khuôn ở mục 2.3: `OPENAI_BASE_URL (tùy chọn), OPENAI_API_KEY, LLM_MODEL`.
- Không có `role`, không có landmark: nhiều ô trên một trang sẽ làm danh sách landmark dài vô ích. Giống `PythonRunner`.
- Nút sao chép của Expressive Code sao chép đúng code. Dòng `pip install` là `<code>` thường: chọn bằng chuột hay bàn phím đều được.
- `data-pagefind-ignore` chỉ đặt trên nhãn "Chạy trên máy bạn", để chữ lặp lại này không chiếm đoạn trích tìm kiếm.

### 4.2. Chuỗi giao diện `localCode`

```ts
// src/i18n/ui.ts (excerpt)
localCode: [
  'badge', 'install', 'env', 'optional', 'command', 'hardware', 'sampleOutput', 'sampleNote', 'sampleNoteFixed',
],
```

| Key | vi | en |
|---|---|---|
| `badge` | Chạy trên máy bạn | Run on your machine |
| `install` | Cần cài | Install |
| `env` | Biến môi trường | Environment variables |
| `optional` | tùy chọn | optional |
| `command` | Lệnh chạy | Run with |
| `hardware` | Phần cứng | Hardware |
| `sampleOutput` | Kết quả mẫu | Sample output |
| `sampleNote` | Lấy từ một lần chạy thật. Câu trả lời của mô hình mỗi lần một khác. | From one real run. A model gives a different answer each time. |
| `sampleNoteFixed` | Lấy từ một lần chạy thật. | From one real run. |

`sampleNoteFixed` dùng khi `sampleVaries={false}`: output tất định (bóc HTML, đếm tham số, tách token) mà ghi "mỗi lần một khác" là sai. Chọn một chuỗi ngắn thay vì bỏ hẳn ghi chú, vì câu "lấy từ một lần chạy thật" vẫn đúng và có ích (output không bịa, khớp mức `chạy thật` ở mục 4.5), và mọi khối "Kết quả mẫu" giữ cùng bố cục nhãn + ghi chú.

Không có placeholder. `i18n.test.ts` và schema i18n tự kiểm đủ key ở hai file.

### 4.3. Hình thức

Mọi màu là token Starlight; mọi cặp đã đo ở [components.md](components.md) mục 4.9.7. **Không có cặp màu mới.**

| Phần | Kiểu | Cặp màu (tối / sáng) |
|---|---|---|
| Khung `.atlas-local` | Khoảng cách trên dưới như `.atlas-runner`. Không có nền riêng | |
| Nhãn | `inline-flex`, `gap: 6px`, cỡ `--sl-text-xs`, đậm 600, `padding: 2px 8px`, nền `--sl-color-gray-6`, viền 1px `--sl-color-gray-5`, bo 4px. Biểu tượng cửa sổ dòng lệnh 12px vẽ bằng `mask-image` (SVG nhỏ trong CSS), màu `currentColor`, như `.atlas-check` | chữ `text` / `gray-6`: 8,68 / 8,90. Viền chỉ trang trí |
| Tiêu đề | Như `.atlas-runner-title`: cỡ sm, đậm 600, `--sl-color-gray-3` | `gray-3` / `bg`: 6,28 / 6,89 |
| Danh sách yêu cầu | Lưới `max-content minmax(0, 1fr)`, `gap: 4px 12px`, cỡ sm. `dt` đậm 600, `--sl-color-gray-3`. `dd` chữ thường; `code` dùng kiểu code trong dòng của Starlight, có `overflow-wrap: anywhere` để dòng `pip install` dài xuống dòng ở 375px | `gray-3` / `bg`: 6,28 / 6,89; `text` / `bg`: 10,10 / 11,11 |
| Khối code | Expressive Code nguyên bản | |
| Kết quả mẫu | Như khung kết quả của `PythonRunner`: nền `--sl-color-gray-6`, `padding: 12px 16px`. Nhãn cỡ sm đậm 600 `--sl-color-white`; ghi chú cỡ sm `--sl-color-gray-3`, không nghiêng | `white` / `gray-6`: 12,04 / 12,50; `gray-3` / `gray-6`: 5,40 / 5,52 |

- Phân biệt với `PythonRunner` không chỉ bằng màu: `LocalCode` có nhãn chữ và biểu tượng, và không có nút Chạy.
- 375px: không cuộn ngang. Khối code tự cuộn trong khung của nó (Expressive Code).
- `local-code.css` nằm trong `customCss`, sau `python-runner.css` và trước `figures.css` (`viz.css` vẫn cuối). Ngân sách **≤ 600 byte gzip** sau khi bỏ comment. Lớp đều có tiền tố `atlas-local-`.

### 4.4. Trang demo

Thêm vào cuối `src/content/docs/vi/dev/components.mdx` và bản `en` (cùng cấu trúc), một mục H2 "Code chạy trên máy bạn" / "Code that runs on your machine", gồm hai ô:

1. `local-chat`: khuôn gọi API ở mục 2.3 (prompt tiếng Anh **ở cả hai bản** `.vi.py` và `.en.py`, vì `src/code/dev/` giữ luật so cặp chặt; phiên chính tự chọn, dễ đổi), `title`, `packages={['openai']}`, có khối "Kết quả mẫu" lấy từ một lần chạy thật. Chưa có key thì để trống slot và ghi trong báo cáo.
2. `local-app`: một ứng dụng Streamlit khoảng 10 dòng, có `file="app.py"`, `command="streamlit run app.py"`, `packages={['streamlit']}`, `hardware` (một câu ví dụ). Không có kết quả mẫu. **Dòng đầu file là comment `# app.py`**, để kiểm rằng Expressive Code không cắt dòng này (mục 2.2).

Hệ quả cho test hiện có:

- `lesson-pairs.test.ts`, test đối chứng `dev/components`: `imports` từ 10 lên **13** (`LocalCode` cộng hai file code).
- `components.spec.ts`: `ISLANDS = 7` giữ nguyên.
- Người dùng duyệt `LocalCode` trên trang demo trong lần duyệt cuối, cùng 23 bài (quyết định 60, mục 2.8), không còn duyệt riêng trước `text-api`.

### 4.5. Test

**Unit, `tests/unit/lib/local-code.test.ts`** (môi trường node): `readEnvVars` với khuôn ở mục 2.3 ra đúng `[OPENAI_BASE_URL optional, OPENAI_API_KEY, LLM_MODEL]`; một tên vừa `[...]` vừa `.get(...)` thì là bắt buộc; nháy đơn và nháy kép; khoảng trắng trong ngoặc; `os.getenv` thì ném lỗi; code không đọc biến nào thì ra `[]`. `pipCommand` ghép đúng; tên trơn không nháy, tên có `>=`, `[extra]`, `;`, `,` hay dấu cách được bọc nháy đơn; ném lỗi với tên rỗng, chỉ có khoảng trắng, hoặc chứa `'`, tab, xuống dòng.

**Unit, `tests/unit/content/code-secrets.test.ts`:** quét mọi file văn bản dưới `src/` và `docs/` (`.py`, `.md`, `.mdx`, `.ts`, `.tsx`, `.astro`, `.json`, `.txt`), cộng `scripts/`.

- Mẫu key đã biết (biểu thức chính quy; con số là độ dài tối thiểu phần sau tiền tố): tiền tố `sk-` (OpenAI, Anthropic) + 16 ký tự `[A-Za-z0-9_-]`; `AIza` (Google) + 30; `gsk_` (Groq) + 20; `hf_` (Hugging Face) + 20; `xai-` + 20; `r8_` (Replicate) + 20; `ghp_` hoặc `github_pat_` + 20; `AKIA` + 16 chữ hoa hoặc số (AWS). Chuỗi kết nối `mongodb://` hay `mongodb+srv://` có cả tên người dùng và mật khẩu trước `@`.
- Gán giá trị cứng: `api_key`, `apikey`, `token`, `secret`, `password` theo sau là `=` hoặc `:` rồi một chuỗi nháy dài ≥ 12 ký tự không chứa `<`, `>`, `{`, `}`, khoảng trắng.
- Trong khối code shell của MDX: `export X=` hoặc `$env:X =` với `X` là tên biến chứa `KEY` thì giá trị phải là chỗ giữ chỗ `"<...>"` hoặc một từ chữ thường ≤ 12 ký tự (cho `ollama`).
- Chi tiết khi làm (L2): chuỗi kết nối MongoDB có tên người dùng hoặc mật khẩu là chỗ giữ chỗ `<...>` thì không bị bắt; comment shell cuối dòng (`export OPENAI_API_KEY="ollama"   # …`) được bỏ trước khi xét giá trị; khối shell nằm trong comment MDX không bị xét. Luật khối shell áp cho cả `.md` lẫn `.mdx`.
- Fixture của test **ghép chuỗi lúc chạy** (`'sk-' + 'x'.repeat(30)`), để chính file test không chứa thứ trông như key (tránh cả GitHub secret scanning).
- Báo lỗi dạng `<file>:<dòng>: <loại>`, không in lại giá trị.

**Unit, `tests/unit/content/python-syntax.test.ts`:**

- Gom mọi file `.py` dưới `src/code/` (cả phần ML: thêm một lớp an toàn rẻ), và mọi khối ` ```python ` trong `src/content/docs/*/llm/**/*.mdx` (bỏ các khối nằm trong comment MDX, dùng cách tách của `lesson-shape.ts`).
- Gọi Python **một lần** (`spawnSync`) với `-I`, đưa danh sách qua stdin dạng JSON. Script nhỏ trong test chạy `ast.parse(source, filename, feature_version=(3, 10))` cho từng mục và trả lỗi dạng JSON.
- Trình thông dịch: biến môi trường `PYTHON` nếu có, rồi `python3`, rồi `python`. Không tìm thấy thì test **fail** với thông báo rõ. CI `ubuntu-latest` có sẵn `python3`; máy phát triển có `C:\Python314`. Không cần gói nào ngoài thư viện chuẩn.
- `feature_version` của `ast` chỉ là "best-effort" theo tài liệu Python. Đủ để bắt cú pháp quá mới phổ biến, không bảo đảm tuyệt đối. Ví dụ đã thử (Python 3.14.5): `type X = int`, `except*`, `def f[T]()` bị bắt; f-string dùng lại chính dấu nháy của nó trong `{...}` (`f"{d["a"]}"`, chỉ hợp lệ từ 3.12) thì **không**. Vì vậy script của test (L2) kiểm thêm trường hợp này bằng `tokenize` (khi Python có `FSTRING_START`). Bộ tách chuỗi của `code-pairs` cũng dựa vào điều này.

**Unit, `tests/unit/content/llm-code.test.ts`**, cho mọi `.py` dưới `src/code/llm/`, cả `.vi.py` lẫn `.en.py`:

1. File có `OpenAI(` thì có `api_key=os.environ["OPENAI_API_KEY"]`, `base_url=os.environ.get("OPENAI_BASE_URL")` và `os.environ["LLM_MODEL"]` (cho phép khoảng trắng và nháy đơn). Theo mục 2.3, file chỉ dùng khả năng khác được đọc `os.environ["<KHẢ_NĂNG>_MODEL"]` thay cho `LLM_MODEL` (ví dụ `generate-image` chỉ đọc `IMAGE_MODEL`). Biến `*_MODEL` không được đọc bằng `.get(...)`, vì `.get` mở đường cho tên model mặc định (mục 2.6). Xét trên code đã bỏ comment.
2. File import `openai` thì không có `model=` (hay `MODEL = `, `{"model": …}`, không phân biệt hoa thường) theo sau là một chuỗi viết sẵn.
3. Không có `os.getenv`, không có `print(os.environ`.
4. ≤ 60 dòng, mỗi dòng ≤ 79 ký tự.
5. `.vi.py` và `.en.py` cùng tập tên biến môi trường (`readEnvVars` trên cả hai).
6. **Phạm vi kiểm chứng:** với mỗi bài `llm/*` có `status.vi = 'published'`, mọi `.vi.py` trong `src/code/llm/<bài>/` có một dòng trong bảng `## Kiểm chứng code` của `docs/research/<bài>.md`, cột "Mức" là một trong `cú pháp`, `chạy khô`, `chạy thật`, `đối chiếu`, cột "Ngày" dạng `YYYY-MM-DD`. File được `LocalCode` dùng có khối kết quả mẫu thì mức phải là `chạy thật` (đọc MDX bằng `lesson-shape.ts`: tên biến import → file; thẻ `<LocalCode code={x}>` có nội dung con).

**Unit, mở rộng `tests/unit/content/code-pairs.test.ts`:**

- File dưới `llm/`: so sau khi bỏ comment **và** làm rỗng nội dung chuỗi (mục 2.4, nếu người dùng chọn phương án A). Hàm làm rỗng chuỗi dùng lại bộ tách chuỗi của `stripComments`, có test riêng: chuỗi nháy đơn, nháy kép, ba nháy nhiều dòng, f-string có `{...}`, dấu `\"` bên trong.
- Mọi phần: bài có `status.en = 'published'` thì `.en.py` của bài (thư mục `src/code/<id bài>/`) không chứa chữ tiếng Việt có dấu (các chữ `ăâđêôơư` hoa và thường, cùng khoảng Unicode U+1EA0–U+1EF9, xét trên văn bản đã chuẩn hóa NFC). Luật xét comment, chuỗi và code. Bắt lỗi quên dịch bản sao.
- **Ngoại lệ cho chuỗi dữ liệu tiếng Việt** (L2): chuỗi là dữ liệu chứ không phải lời văn (24 câu Truyện Kiều của `build-first-llm`, một khóa tra như `"hoa cười"`) được giữ tiếng Việt trong `.en.py` nếu được đánh dấu bằng comment chứa `data: vi`:
  - comment cuối dòng (`cut = text.index("hoa cười")  # data: vi; lines 1-20 to train`): miễn mọi chuỗi **bắt đầu** trên dòng đó;
  - comment đứng riêng một dòng (`# data: vi (the poem stays in Vietnamese)`): miễn mọi chuỗi bắt đầu trên dòng code kế tiếp (bỏ qua dòng trống và dòng chỉ có comment), kể cả chuỗi ba nháy kéo dài nhiều dòng.
  - Chỉ chuỗi được miễn; chữ của chính comment vẫn phải là tiếng Anh. `data: video`, `metadata: vi` không phải dấu.
  - Comment bị bỏ khi so cặp, và dòng chỉ có comment so bằng dòng trống, nên `.en.py` thêm được dòng `# data: vi` ở chỗ `.vi.py` có dòng trống (hoặc comment). Ví dụ: `bigram.en.py` khi bài được dịch cần dấu này trước `POEM = """…` và ở dòng `text.index("hoa cười")`.
  - Hàm `vietnameseOutsideData` ở `tests/unit/fixtures/python-source.ts`, có test riêng trong `code-pairs.test.ts`.
- Bản sao `.en.py` của bài chưa dịch: qua mọi luật, không cần ngoại lệ.

**E2E, `tests/e2e/components.spec.ts`** (trang demo, vi và en, `desktop` và `mobile`):

1. Có đúng 2 `.atlas-local`. Không có `astro-island`, `script` bên trong. Nhãn đúng `localCode.badge` của ngôn ngữ trang.
2. Chữ trong khối code (`.atlas-local-code pre`, đọc từng dòng) **bằng đúng nội dung file** đọc từ đĩa, cùng số dòng. Bắt được việc Expressive Code cắt dòng `# app.py`.
3. Danh sách biến môi trường bằng `readEnvVars(file)`, kèm chữ `localCode.optional` đúng chỗ. Dòng `pip install` khớp prop `packages` đọc từ MDX.
4. Khối "Kết quả mẫu" có ở ô thứ nhất (nếu slot có nội dung), không có ở ô thứ hai.
5. Mỗi khối code có nút sao chép của Expressive Code.
6. Sáng và tối: tương phản của nhãn, `dt`, ghi chú kết quả mẫu đạt ≥ 4,5 (dùng `installContrast` trong `helpers.ts`).
7. 375px: `.atlas-local` không rộng hơn cột (`scrollWidth <= clientWidth + 1`). Test "không cuộn ngang" của trang demo đã có, tự áp dụng.

**E2E, `tests/e2e/lessons-meta.spec.ts`** (từ L0, test này không còn ở `lessons.spec.ts`; chỉ chạy ở project `desktop`), test "every lesson component written in the file is on the page": thêm `.atlas-local` bằng `shape.components.LocalCode ?? 0`. Trên trang fallback, `.atlas-local` có `lang="en"` và `.atlas-local-code` có `lang="vi"`. **Không** thêm `LocalCode` vào `LESSON_COMPONENTS` của `lesson-shape.ts`; `sequence` đã đếm nó, và thêm vào sẽ làm đổi các fixture `toEqual` hiện có.

### 4.6. `SamplingViz`

Đủ để `viz-builder` làm ở nhiệm vụ L8, theo mọi quy ước của [viz/README.md](viz/README.md) mục 2 và checklist mục 2.12.

#### 4.6.1. Dữ liệu: `src/data/datasets/next-token.ts`

Không phải dữ liệu `x`/`y` nên **không** vào registry `DATASETS` (vốn dành cho `DatasetTable`). Kiểu mới đặt trong `types.ts`:

```ts
// src/data/datasets/types.ts (addition)
export interface TokenDistribution {
  id: 'next-token';
  lessons: readonly LessonId[];          // ['llm/text-api', 'llm/build-first-llm']
  context: Localized;                    // the text before the next token, e.g. { vi: 'Hôm nay trời rất', en: 'The weather today is very' }
  tokens: Readonly<Record<Locale, readonly string[]>>; // same length as logits, most likely first
  logits: readonly number[];             // fixed, shared by both locales, so numbers match the Python cell
  description: Localized;                // 1–2 sentences for screen readers
}
```

Logit đề xuất (10 token, giảm dần): `[3.0, 2.6, 2.0, 1.5, 1.1, 0.6, 0.1, -0.4, -1.0, -1.6]`. Đã tính bằng NumPy 2.4.6 ngày 24/10/2026:

| Temperature | Xác suất 3 token đầu | Top-p 0.9 giữ |
|---|---|---|
| 0.5 | 0.599, 0.269, 0.081 | 3 token |
| 1.0 | 0.382, 0.256, 0.140 | 5 token |
| 1.5 | 0.286, 0.219, 0.147 | 7 token |

Bảng cho thấy cùng một ngưỡng top-p giữ số token khác nhau tùy temperature. Đây là chỗ đáng cho người đọc thử. `viz-builder` và `lesson-writer` chốt token và logit cuối cùng; token tiếng Việt phải hợp ngữ cảnh, và nên là những từ trọn nghĩa.

Ô `PythonRunner` (nếu bài có) chép logit trên một dòng ngay dưới comment `# logits: next-token`. Thêm luật so số vào `datasets.test.ts`, cùng kiểu dấu `# dataset:`.

#### 4.6.2. Toán: `src/lib/viz/sampling.ts`

```ts
export interface SamplingSettings { temperature: number; topK: number; topP: number }
export interface SamplingResult {
  probs: number[];   // after temperature, top-k, top-p and renormalising; 0 for removed tokens
  kept: boolean[];
  base: number[];    // softmax at the current temperature, before cutting (shown as the faint bar)
}
/** temperature 0 -> one-hot on the largest logit (ties: lowest index). */
export function softmaxT(logits: readonly number[], temperature: number): number[];
export function samplingDistribution(logits: readonly number[], s: SamplingSettings): SamplingResult;
/** mulberry32: deterministic, same sequence at build and in every browser. */
export function createRng(seed: number): () => number;
/** Inverse CDF on probs with u in [0, 1). */
export function sampleIndex(probs: readonly number[], u: number): number;
```

- Thứ tự: temperature → top-k → top-p → chuẩn hóa lại. Top-p giữ **tập nhỏ nhất** (theo xác suất giảm dần) có tổng ≥ p, tức giữ cả token làm tổng vượt ngưỡng. Luôn giữ ít nhất 1 token.
- Thứ tự này là của `transformers` (Hugging Face) theo hiểu biết hiện tại. Một số engine khác, ví dụ llama.cpp, áp temperature sau cùng. **Cần kiểm chứng khi viết `text-api`**; bài ghi rõ VIZ dùng thứ tự nào.
- Unit `tests/unit/viz/sampling.test.ts`: ví dụ tính tay (2–3 token); so với fixture NumPy `tests/unit/fixtures/sampling-python.ts` ở các bộ (T, k, p) = (1, 10, 1), (0.5, 10, 0.9), (1.5, 3, 1), (1, 10, 0.5), (0, 10, 1), sai số 1e-9; `createRng(1)` cho cùng dãy hai lần; 10 000 lần lấy mẫu có tần suất mỗi token lệch xác suất ≤ 0.02.

#### 4.6.3. Điều khiển và hành vi

| Điều khiển | Kiểu | Miền | Mặc định |
|---|---|---|---|
| Temperature $T$ | `VizSlider` (kit) | 0–2, bước 0.1 | 1 |
| Top-k | `VizSlider` | 1–10, bước 1. 10 nghĩa là tắt | 10 |
| Top-p | `VizSlider` | 0.05–1, bước 0.05. 1 nghĩa là tắt | 1 |
| "Lấy 1 mẫu" | `button` | | |
| "Lấy 100 mẫu" | `button` | | |
| "Đặt lại" | `button` | đưa ba thanh trượt về mặc định, xóa mẫu, đặt lại hạt giống | |

- Mỗi lần kéo, bảng xác suất vẽ lại ngay ($O(10)$ phép tính).
- "Lấy 1 mẫu": lấy theo `probs` hiện tại, hiện câu ngữ cảnh kèm token vừa lấy (in đậm), và tăng bộ đếm của token đó.
- "Lấy 100 mẫu": lấy 100 lần, cột "Số lần" hiện số lần mỗi token được chọn trong các mẫu từ lần đặt lại gần nhất. Đổi thanh trượt thì **xóa** bộ đếm (bộ đếm chỉ đúng với một phân phối).
- Hạt giống cố định (ví dụ 2026), nên cùng thao tác cho cùng kết quả: test lặp lại được.
- $T = 0$: một token có xác suất 1, mọi token khác bị loại; dòng trạng thái hiện `greedyNote`.
- SSR và trước khi hydrate: bảng ở trạng thái mặc định, điều khiển `disabled`, câu ngữ cảnh chưa có token, cột "Số lần" có trong DOM nhưng `visibility: hidden` (giữ chỗ, chống CLS, viz/README.md mục 2.8).

#### 4.6.4. Bố cục

Từ trên xuống: chú thích (`figcaption`) → câu ngữ cảnh và token vừa lấy → **bảng xác suất** → ba thanh trượt → hàng nút → dòng trạng thái.

- **Bảng xác suất là `<table>` HTML thật**, không phải SVG: cột Token, Xác suất (thanh ngang và số), Số lần. Trình đọc màn hình đọc được từng số, nên không cần mô tả SVG riêng. Thanh là `<span>` với `width` tính bằng `%` (inline, hình học), màu qua lớp vai trò của `viz.css`.
- Token bị loại: thanh rỗng có viền đứt, số hiện "—", và chữ "đã loại" ở cột xác suất (chữ thật, không chỉ màu). Thanh mờ `base` (trước khi cắt) nằm dưới thanh chính để thấy phần bị cắt đi.
- Số dùng `formatNumber(value, 2)` (viz/README.md mục 2.6).
- 375px: 10 hàng khoảng 32px, bảng khoảng 340px chiều cao; cả VIZ khoảng 700px. Cột "Token" không xuống dòng (token ngắn).
- Lớp thêm vào `viz.css` đặt tên theo vai trò (`.atlas-viz-bar`, `.atlas-viz-bar-base`, `[data-removed]`), không theo tên VIZ. `viz.css` hiện **1 732 byte gzip** sau khi bỏ comment (đo ngày 24/10/2026), còn khoảng 830 byte trong ngân sách 2 560, và VIZ bài Gradient Descent cũng đang thêm vào đây (mục 7, rủi ro 6).

#### 4.6.5. Trợ năng

- Ba thanh trượt có `aria-valuetext`: "T = 0.7"; "top-k = 3, giữ 3 token"; "top-k tắt, giữ cả 10 token"; "top-p = 0.90"; "top-p tắt".
- Vùng `aria-live="polite"` đọc một câu sau khi dừng kéo 600 ms (`useSettled`): "Còn 5 trên 10 token. Token cao nhất: đẹp, 0.38." Bấm "Lấy 1 mẫu" thì đọc ngay: "Lấy được: đẹp." Bấm "Lấy 100 mẫu" thì đọc: "Đã lấy 100 mẫu. Nhiều nhất: đẹp, 41 lần."
- Bảng có `<caption>` (ẩn bằng `sr-only` nếu `figcaption` đã nói đủ) và `<th scope="col">`.

#### 4.6.6. Chuỗi `vizSampling`

```ts
vizSampling: [
  'caption', 'contextLabel', 'tableLabel', 'tokenCol', 'probCol', 'countCol', 'removed', 'controls',
  'temperatureLabel', 'temperatureValueText', 'topKLabel', 'topKValueText', 'topKOff',
  'topPLabel', 'topPValueText', 'topPOff', 'sampleOne', 'sampleMany', 'reset',
  'kept', 'greedyNote', 'announce', 'announceSample', 'announceMany',
],
```

Câu ngữ cảnh, token và mô tả là **nội dung**, nằm ở `next-token.ts` (vi/en), không ở i18n. Ký hiệu $T$ trong nhãn render bằng KaTeX lúc build như các VIZ khác.

#### 4.6.7. Ngân sách và test

- JS riêng ≤ 10 KB gzip; `props` trong HTML ≤ 8 KB (24 chuỗi ngắn và 10 token, dự kiến khoảng 3 KB).
- Test chung `viz.spec.ts` tự áp dụng cho hai bài dùng VIZ. `tests/unit/components/sampling-viz-island.test.tsx` (`tester`): kéo $T$ về 0 thì một hàng xác suất 1; top-k = 3 thì đúng 7 hàng "đã loại"; "Lấy 100 mẫu" rồi đổi thanh trượt thì cột "Số lần" ẩn; vùng live chỉ đọc sau khi dừng kéo; SSR rồi hydrate không lỗi; không viết cứng chữ. Không viết spec e2e riêng (quyết định 39).

#### 4.6.8. Đã làm (L8, 24/10/2026)

**File.**

| File | Việc |
|---|---|
| `src/components/viz/SamplingViz.astro` | Wrapper, không prop. Lấy chuỗi `vizSampling`, ngữ cảnh, token và mô tả theo ngôn ngữ trang, render KaTeX ba nhãn thanh trượt, gắn `client:visible={{ rootMargin: '200px' }}` |
| `src/components/viz/sampling-viz/SamplingVizIsland.tsx` | Island: bảng `<table>`, ba `VizSlider`, ba nút, dòng trạng thái, vùng live |
| `src/lib/viz/sampling.ts` | `softmaxT`, `samplingDistribution`, `createRng` (mulberry32), `sampleIndex`, kiểu `SamplingConfig` |
| `src/data/datasets/next-token.ts` | `NEXT_TOKEN` (`lessons`: `llm/text-api`, `llm/build-first-llm`), `NEXT_TOKEN_SAMPLING` (thanh trượt, `seed: 2026`, `many: 100`, số chữ số), registry `TOKEN_DISTRIBUTIONS` cho dấu `# logits:` |
| `src/data/datasets/types.ts` | Thêm `TokenDistribution` (như mục 4.6.1; `id` là `string`, `tokens` là `Localized<readonly string[]>`) |
| `tests/unit/viz/sampling.test.ts`, `tests/unit/fixtures/sampling-python.ts` | Ví dụ tính tay; 11 bộ $(T, k, p)$ so với NumPy 2.4.6, sai số 1e-9; quét đủ 21 × 10 × 20 vị trí thanh trượt; `createRng`; 10 000 lần lấy mẫu lệch ≤ 0.02; mọi số "Hãy thử" của hai bài |
| `tests/unit/components/sampling-viz-island.test.tsx` | Đủ các ý của mục 4.6.7, thêm: hạt giống cố định cho cùng kết quả, "Đặt lại" đặt lại hạt giống, bản en |
| `tests/unit/content/datasets.test.ts` | Luật `# logits: <id>`: dòng code kế tiếp là một mảng `np.array([...])`, từng số `===` logit. Ít nhất một bài đã xuất bản trong `lessons` có `.vi.py` mang dấu (`build-first-llm` chỉ có VIZ, không có ô code dùng logit này) |

**Quyết định khi làm.**

- **Top-p xét phân phối sau top-k, đã chuẩn hóa lại**, như `transformers` (bộ lọc top-p lấy softmax của logit mà top-k đã che). Ví dụ $T = 1$, $k = 3$, $p = 0.7$: giữ 2 token; làm top-p trước top-k thì giữ 3. Fixture có hai bộ $(1, 3, 0.7)$ và $(2, 5, 0.8)$ phân biệt được hai thứ tự; đã thử đảo thứ tự trong `sampling.ts` thì 3 test fail.
- `kept[i]` là `false` cả khi xác suất trước khi cắt bằng 0 (mọi token trừ token đầu ở $T = 0$), nên ở $T = 0$ chín hàng hiện "đã loại" dù top-k và top-p đang tắt.
- Thêm key **`off`** ("tắt"/"off"): số hiện cạnh nhãn khi $k = 10$ hay $p = 1$. Namespace có 25 key. `sampleMany` có biến `{{n}}` lấy từ `many`.
- Bảng có 4 cột: Token (`th scope="row"`), thanh (cột co giãn, `width: 100%`), số, Số lần. Tiêu đề "Xác suất" `colspan=2`. Hàng còn giữ cũng chứa chữ "đã loại" nhưng ẩn (`data-off`), nên cột số không đổi rộng khi có hàng bị loại. Số của hàng bị loại là "—" (`aria-hidden`), trình đọc màn hình chỉ đọc "đã loại".
- Thanh chính là `span.atlas-viz-bar` (dùng chung lớp vai trò với cột hệ số của `RegularizationViz`, thêm `background`). Thanh mờ `span.atlas-viz-bar-base` nằm dưới; hàng bị loại: thanh mờ thành khung rỗng viền đứt. Thang 0–1 cố định cho mọi hàng.
- Câu ngữ cảnh: nhãn `contextLabel` rồi câu, ô trống gạch chân (`.atlas-viz-slot`) ở cuối. Trước khi lấy mẫu ô chứa một dấu cách không ngắt, để dòng không đổi cao khi có token.
- Đổi thanh trượt thì xóa cả bộ đếm lẫn token vừa lấy. "Đặt lại" xóa vùng live; nếu thanh trượt đã đổi, vùng live đọc câu `announce` sau 600 ms như khi kéo.

**Số đo** (`dist/` lúc 17:24 ngày 24/10/2026):

| Mục | Đo được | Giới hạn |
|---|---|---|
| `SamplingVizIsland.*.js` | 5,7 KB, **2,2 KB gzip** (chunk `VizSlider`, `format` dùng chung với VIZ khác, không tính) | 10 KB gzip |
| Thuộc tính `props` | **5 084** ký tự (vi), **5 181** (en) | 8 KB |
| `viz.css` bỏ comment, gzip | 1 752 → **1 964 byte** (+212), 77% ngân sách | 2 560 byte |
| Chiều cao VIZ | khoảng 1 005px ở 375px, 933px ở 1280px | |

**Còn lại cho `tester`.** Test chung `viz.spec.ts` (4) đo tương phản của dấu **trong `.atlas-viz-plot`** và đòi `marks.length > 0`; bài kiểm "control" đòi phá được ít nhất một dấu trong vùng vẽ. `SamplingViz` không có `.atlas-viz-plot` (bảng HTML), nên hai test này sẽ fail trên `/vi|en/llm/text-api/` và `/vi|en/llm/build-first-llm/` cho tới khi `tester` thêm nhánh cho thanh HTML: nền `span.atlas-viz-bar` và viền `[data-removed] .atlas-viz-bar-base` so với nền `.atlas-viz-meter` (≥ 3:1).

### 4.7. Kiểu dữ liệu của bảng kiểm chứng

Bảng ở `docs/research/<bài>.md` (mục 2.5) là Markdown cho người đọc, nhưng `llm-code.test.ts` đọc nó. Luật đọc:

- Tìm heading đúng `## Kiểm chứng code`, lấy bảng Markdown đầu tiên sau nó.
- Cột 1 là tên file trong backtick, chỉ tên file (`chat.vi.py`), không có đường dẫn. Được ghi nhiều tên cách nhau bằng dấu phẩy (`` `chat.vi.py`, `chat.en.py` ``, hay `` `chat.vi.py`, `.en.py` ``): mỗi tên tính là một dòng cùng mức và ngày. Ô có chữ khác ngoài các tên trong backtick (`khối <ngôn ngữ> trong bài`, `Cả ba cặp`) không bị test đọc.
- Cột 2 là mức, **đúng nguyên văn** một trong bốn mức của mục 2.5, không thêm chữ. Ghi chú như "+ server giả", "(server cục bộ)" đặt ở cột "Kết quả". Cột 3 là ngày ISO. Các cột sau tự do.

### 4.8. Hợp đồng với `lesson-writer` (bài phần LLM)

Checklist, ngoài những gì `CLAUDE.md`, template và `.claude/agents/lesson-writer.md` đã đòi:

1. **Phạm vi file.** Chỉ tạo và sửa `src/content/docs/vi/llm/<bài>.mdx` và `src/code/llm/<bài>/*`. Không sửa `roadmap.ts`, glossary, `scripts/requirements-llm.txt`, i18n, template, component. Không chạy lệnh `npm` nào khi đang ở đợt song song (mục 2.8).
2. **Chọn chỗ cho code** theo mục 2.1. Bài phần `build`: có một ô `PythonRunner` NumPy khi lõi toán đủ nhỏ.
3. **Mỗi ô một cặp file** `<tên>.vi.py` và `<tên>.en.py`. `.en.py` là bản sao y nguyên. Mỗi file là chương trình hoàn chỉnh, ≤ 60 dòng (gợi ý 40), dòng ≤ 79 ký tự, chạy được trên Python 3.10+.
4. **Gọi API đúng khuôn mục 2.3:** `client` tường minh với `base_url` và `api_key` từ môi trường, `MODEL = os.environ["LLM_MODEL"]`, `client.chat.completions.create`, vai trò `"system"`. Biến thêm đặt tên `<KHẢ_NĂNG>_MODEL`. Không `os.getenv`, không tên model, không key, không in biến môi trường.
5. **Prompt và chữ in ra** viết tiếng Việt trong `.vi.py` (nếu người dùng chọn phương án A ở mục 2.4). Comment tiếng Việt.
6. **Dùng `LocalCode`** cho mọi file không chạy trên trang: `code`, `title`, `packages` (tên pip). Thêm `file` và `command` khi chạy bằng lệnh khác `python` (Streamlit, Gradio CLI, uvicorn). Thêm `hardware` khi cần GPU. Không tự liệt kê biến môi trường: component đọc từ code.
7. **Kết quả mẫu** chỉ khi đã chạy thật được; chép nguyên văn vào khối ` ```text ` bên trong `LocalCode`. Chưa có key thì không có kết quả mẫu, và lời văn không trích số từ output. Output giống nhau mọi lần chạy (không gọi mô hình, không ngẫu nhiên: bóc HTML, đếm tham số) thì thêm `sampleVaries={false}`.
8. **Tự kiểm trước khi báo xong:** `ast.parse` từng file (lệnh ở mục 2.5); chạy thật nếu có key, không thì chạy khô; PyTorch chạy hết trên CPU. Thư mục làm việc ở scratchpad. Báo mức đã đạt cho từng file.
9. **Code không phải Python** viết thẳng trong MDX, đúng tên ngôn ngữ của Shiki (mục 2.1). Lệnh đặt biến môi trường có cả bash và PowerShell (dùng `<Tabs syncKey="os">` ở `text-api`; bài sau link về đó). Giá trị key luôn là chỗ giữ chỗ `"<...>"`.
10. **Thông tin dễ lỗi thời** theo mục 2.6: không "mới nhất", không giá, không tên model trong code; mục "Ví dụ code" mở bằng câu phiên bản; nhà cung cấp chỉ ở bảng của `text-api`.
11. **Template:** đủ 9 mục, đúng tên heading. "Nhắc nhanh" nới tới một đoạn chỉ ở `build-first-llm`, `rag-chatbot`, `multimodal`. Mục "Minh họa" không bỏ: hình, VIZ, bảng, hội thoại mẫu (bảng "Vai trò" – "Nội dung") hoặc kết quả mẫu.
12. **Hình:** chỉ các hình ở mục 2.9, viết comment giữ chỗ `{/* FIG: ... */}` hoặc `{/* VIZ: SamplingViz ... */}` theo template. Hình đã có (dùng lại từ bài trước) thì import thẳng.
13. **Link** chỉ tới bài đã xuất bản trước đợt; bài cùng đợt ghi tên, không link.
14. **Báo cáo** có: đường dẫn file; mức kiểm chứng từng file; dòng cần đổi trong `roadmap.ts`; thuật ngữ mới; gói Python cần thêm vào `scripts/requirements-llm.txt` kèm bản đã chạy; chỗ FIG/VIZ; điểm chưa chắc, nhất là chỗ phụ thuộc nhà cung cấp.

## 5. Phụ thuộc

**npm: không thêm gói nào.** `LocalCode` dùng `<Code>` của `@astrojs/starlight` 0.42.6 (Expressive Code 0.44.3), `SamplingViz` dùng React và kit VIZ có sẵn. Test dùng `node:child_process`, `node:fs`, `node:zlib`.

**Python (`scripts/requirements-llm.txt`, chỉ cho `.venv-llm/`, không ảnh hưởng site):**

```text
# Pinned packages of .venv-llm/ (docs/architecture/llm-lessons.md, section 2.5).
# torch: pip install -r scripts/requirements-llm.txt --extra-index-url https://download.pytorch.org/whl/cpu
torch==2.14.1+cpu
openai==3.37.0
numpy==2.5.4
scikit-learn==1.9.1
```

- Ghim đúng các bản đang có trong `.venv-llm/` (đọc bằng `pip list` ngày 24/10/2026), không phải cài lại.
- `openai` 3.37.0: bản mới nhất trên PyPI (phát hành 22/10/2026), `requires_python >= 3.10`.
- `numpy`, `scikit-learn` ở đây mới hơn bản của Pyodide 314.0.7. Không sao, vì ô `PythonRunner` chạy thử bằng venv Pyodide (mục 2.5).
- Gói thêm theo bài do phiên chính ghi vào sau khi chạy thử (mục 2.8).
- CI không cài file này. CI chỉ cần `python3` của runner cho test cú pháp.

## 6. Các bước thực hiện

Mỗi nhiệm vụ của `developer` và `tester` kết thúc bằng `npm run check` (0 lỗi 0 cảnh báo), `npm test`, `npm run build` (không `[WARN]`), chạy lần lượt, không song song với nhiệm vụ khác.

| # | Agent | Việc | Tiêu chí hoàn thành |
|---|---|---|---|
| L0 | `tester` (sửa test, cấu hình Playwright) rồi `developer` (sửa `ci.yml`) | **Giảm thời gian e2e** theo E1 và E3 ở mục 2.10. Chỉ chuyển test, không đổi điều test kiểm | Số test thật sự chạy ở `desktop` không đổi; `mobile` giảm đúng các test đã chuyển. CI: hai shard đều qua, job e2e dài nhất ≤ 12 phút, `dist/` chỉ build một lần (log có đúng một lần `astro build`). Báo cáo thời gian trước và sau |
| L1 | `developer` | **`LocalCode`** theo mục 4.1–4.3: `LocalCode.astro`, `src/lib/local-code.ts`, `src/styles/local-code.css` (thêm vào `customCss`), namespace `localCode` trong `ui.ts`, `vi.json`, `en.json`. Code demo `src/code/dev/local-chat` và `local-app` (cặp vi/en). Mục mới trên trang demo vi và en (mục 4.4). Sửa số `imports` của test đối chứng trong `lesson-pairs.test.ts` | Build qua. `dist/vi/dev/components/index.html` có 2 `.atlas-local`, không thêm `astro-island`. Ô `local-app` hiện đủ các dòng, kể cả dòng `# app.py`. Biến môi trường của ô `local-chat` hiện `OPENAI_BASE_URL (tùy chọn), OPENAI_API_KEY, LLM_MODEL`. `local-code.css` ≤ 600 byte gzip. Xem tay ở 375px, sáng và tối |
| L2 | `tester` | Unit: `local-code.test.ts`, `code-secrets.test.ts`, `python-syntax.test.ts`, `llm-code.test.ts`, mở rộng `code-pairs.test.ts` (mục 4.5). E2E: phần `LocalCode` trong `components.spec.ts`, `.atlas-local` trong `lessons-meta.spec.ts` | `npm test` và `npm run test:e2e` qua. Thử phá từng luật rồi trả lại: thêm một key giả ghép chuỗi vào một file `.py` tạm → `code-secrets` fail đúng file và dòng; cú pháp sai → `python-syntax` fail; `os.getenv` → build và `llm-code` fail; xóa dòng `# app.py` khỏi phép so → e2e ý 2 fail |
| L3 | `analyst` | Review L0–L2: trợ năng, tương phản đo thật, kích thước CSS, không có JS mới trên trang demo, CI | Báo cáo có số đo |
| L4 | **người dùng** | Trả lời câu hỏi mục 7 nếu chưa trả lời. Tạo `.env.llm`. Việc duyệt `LocalCode` trên trang demo dời về lần duyệt cuối (quyết định 60) | `.env.llm` có, câu hỏi đã trả lời |
| L5 | phiên chính | Tạo `scripts/requirements-llm.txt` theo mục 5. Cập nhật `.claude/agents/lesson-writer.md` và `content-reviewer.md` (mục "Việc của phiên chính" bên dưới) | `.venv-llm/Scripts/python.exe -I -c "import openai, torch, numpy, sklearn"` chạy không lỗi |
| L6 | `developer` | Sửa `docs/lesson-template.mdx` theo mục 2.7 | Template có đủ các dòng ở mục 2.7; không đổi phần chung của các phần khác |
| L7 | quy trình bài học | **`text-api`** (đợt 0): `summarizer` → `lesson-writer` → `content-reviewer` (kiểm chứng mức `chạy thật`) → sửa → `viz-builder` (L8). Không chờ duyệt (quyết định 60) | Bài qua review, không còn lỗi "Nghiêm trọng" hay "Nên sửa"; bảng kiểm chứng đủ; `npm test`, build, e2e qua |
| L8 | `viz-builder` | **`SamplingViz`** theo mục 4.6, cùng `next-token.ts`, `sampling.ts`, fixture NumPy, `sampling.test.ts`. Đặt vào `text-api`, sau đó dùng lại ở `build-first-llm` | Checklist [viz/README.md](viz/README.md) mục 2.12 đạt. `viz.css` vẫn ≤ 2 560 byte gzip |
| L9 | `tester` | `sampling-viz-island.test.tsx` (mục 4.6.7) | Qua; thử phá thứ tự top-k/top-p thì test fail |
| L10 | quy trình bài học | **`build-first-llm`** (đợt 1), như L7, có một ô `PythonRunner` NumPy | Như L7 |
| L11+ | quy trình bài học | Đợt 2–7 theo mục 2.8, mỗi đợt tối đa 4 bài; hình của đợt do `viz-builder` làm lần lượt | Mỗi đợt: build, test, e2e qua; có báo cáo đợt |
| L12 | **người dùng** | **Duyệt cuối** cả 23 bài và `LocalCode` trên trang demo, máy tính và điện thoại thật (quyết định 60) | Đồng ý, hoặc danh sách chỗ sửa |

**Việc của phiên chính** (ngoài tài liệu này):

- `.claude/agents/lesson-writer.md`, mục "Code ví dụ": thêm "Phần LLM: theo `docs/architecture/llm-lessons.md` mục 4.8". Mục "Sau khi viết": "Khi chạy song song theo đợt: không sửa `roadmap.ts`, glossary; không chạy lệnh `npm`; báo lại dòng cần đổi và thuật ngữ mới."
- `.claude/agents/content-reviewer.md`, mục "Code": thêm bốn mức kiểm chứng và lệnh chạy ở mục 2.5, yêu cầu trả bảng kiểm chứng trong báo cáo, và "khi review song song theo đợt thì không chạy `npm run build`/`npm test`".
- `CLAUDE.md`: thêm `LocalCode` vào danh sách component, `.venv-llm/` và `scripts/requirements-llm.txt` vào phần lệnh hoặc cấu trúc thư mục, mục "Trạng thái hiện tại" khi bắt đầu phần LLM.
- `docs/decisions.md`: ghi các câu trả lời của người dùng cho mục 7 bên dưới.

## 7. Rủi ro và điểm chưa chắc

| # | Rủi ro | Ảnh hưởng | Cách xử lý |
|---|---|---|---|
| 1 | **CI e2e đã 15,9 phút trên giới hạn 20**, chỉ với 4 bài. Bài Gradient Descent có thể đẩy sát hoặc vượt giới hạn | CI fail vì hết giờ, chưa tới phần LLM | Nhiệm vụ L0 trước bài `text-api`; nếu bài Gradient Descent làm CI quá giờ thì làm L0 ngay. Đề xuất ở mục 2.10 |
| 2 | `PythonRunner` không truyền `title` cho `<Code>`, nên một file `.py` có comment trông như tên file ở 4 dòng đầu sẽ bị mất dòng đó trên khối tĩnh (mục 2.2). Số dòng trong "Lỗi ở dòng N" khi đó lệch với code nhìn thấy | Chưa xảy ra với code hiện có | Ngoài phạm vi. Đề xuất `developer` thêm `title=""` vào `PythonRunner.astro` cùng lúc với L1 (một dòng) |
| 3 | Nhà cung cấp đổi API kiểu OpenAI, đổi gói miễn phí, bỏ model | Code của bài hỏng, bảng của `text-api` sai | Code không có tên model; chỉ một bảng nhà cung cấp có ngày kiểm tra; bảng kiểm chứng có ngày. Rà lại khoảng 6 tháng một lần |
| 4 | Thư viện đổi nhanh (LangChain, LlamaIndex, Gradio) hỏng code sau vài tháng | Code của 3–4 bài | Ghim bản trong `packages` (mục 2.6) |
| 5 | Một số gói chưa có wheel cho Python 3.14 | Không chạy thử được trong `.venv-llm/` | Khi gặp, dựng thêm venv Python 3.12 cho bài đó, ghi vào bảng kiểm chứng. Code vẫn phải chạy trên 3.10+ |
| 6 | Ngân sách `viz.css` (còn khoảng 830 byte) bị VIZ Gradient Descent và `SamplingViz` dùng hết | `viz-conventions.test.ts` fail | Đo lại trước L8. Thiếu chỗ thì gọi `architect` (tách phần hiếm dùng, viz/README.md mục 2.3) |
| 7 | Không có key, hoặc gói miễn phí bị giới hạn | Bài không có kết quả mẫu; mức chỉ đạt `chạy khô` | Bài vẫn xuất bản được (mục 2.5). Test `llm-code` chỉ đòi `chạy thật` khi có kết quả mẫu |
| 8 | Groq có thể không có embeddings; tham số `temperature`/`max_tokens` có thể bị một số model từ chối | Code của `rag-chatbot`, `text-api` không chạy với mọi nhà cung cấp | Kiểm chứng khi viết `text-api` (mục 2.6); bài ghi rõ yêu cầu |
| 9 | Test cú pháp gọi Python từ Vitest: máy không có Python thì `npm test` fail | Người đóng góp mới bị chặn | Thông báo lỗi nói cách cài hoặc đặt biến `PYTHON`. `CLAUDE.md` đã đòi có Python |
| 10 | `fullyParallel: true` (E3) làm lộ các test vô tình phụ thuộc thứ tự trong một file | Test chập chờn | L0 chạy toàn bộ e2e ba lần liền trước khi bật trên CI |
| 11 | Lượt e2e bị shard chia không đều (một shard có nhiều trang có VIZ) | Lợi ít hơn ước tính | Đo sau L0; có thể lên 3 shard |
| 12 | Câu "Code trong bài chạy thử lần cuối…" mất đúng khi gói đổi bản | Thông tin sai nhẹ | Reviewer so với bảng kiểm chứng ở mỗi lần review |

### Câu hỏi cho người dùng

1. **Prompt trong code minh họa viết bằng ngôn ngữ nào?** (mục 2.4)
   - (Recommended) Prompt tiếng Việt trong `.vi.py`, tiếng Anh trong `.en.py`; test `code-pairs` bỏ qua nội dung chuỗi, chỉ cho `src/code/llm/`.
   - Prompt tiếng Anh ở cả hai bản, giữ test như cũ.
   - Prompt tiếng Việt ở cả hai bản.
2. **Giảm thời gian CI e2e thế nào, và khi nào?** (mục 2.10)
   - (Recommended) Làm ngay trước `text-api`: tách test không phụ thuộc màn hình khỏi project mobile, và chia 2 shard dùng chung một bản build. Mỗi lần CI tốn thêm khoảng 1,5–3 phút-runner.
   - Chỉ tách test và bớt test trùng trên trang fallback, không shard. Không tốn thêm phút-runner, lợi ít hơn.
   - Đợi đo lại sau bài `text-api` rồi mới quyết.
3. **Bạn đặt key cho reviewer ở đâu?** (mục 2.5)
   - (Recommended) File `.env.llm` ở gốc dự án (đã bị `.gitignore` chặn). Agent chỉ nạp file vào môi trường của từng lệnh, không đọc nội dung.
   - Biến môi trường người dùng của Windows (`setx`). Mọi chương trình trên máy đều thấy key.
4. **Có đưa "Kết quả mẫu" dưới code gọi API không?** (mục 2.2, 2.5)
   - (Recommended) Có, chỉ lấy từ một lần chạy thật, kèm ghi chú "mỗi lần một khác".
   - Không, chỉ mô tả output bằng lời.

**Phiên chính có thể tự chọn (dễ đổi lại):**

- Tên `LocalCode` và tiền tố lớp `atlas-local-`.
- Biến môi trường đọc từ code, không có prop `env`.
- Giới hạn cứng 60 dòng cho file code LLM.
- Tên biến `EMBEDDING_MODEL`, `IMAGE_MODEL`.
- Bảng kiểm chứng nằm trong `docs/research/<bài>.md`.
- Chia đợt ở mục 2.8.
- Bảng xác suất của `SamplingViz` là `<table>` HTML; temperature 0–2; logit đề xuất ở mục 4.6.1.
