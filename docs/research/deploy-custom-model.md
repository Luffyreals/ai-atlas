# Deploy mô hình riêng (Deploy Your Own Model)

Bài: `llm/deploy-custom-model` (chỉ bản vi, khoảng 12 phút). Cần biết trước: `llm/docker-cloud`. Bài sau: `llm/llm-deployment` (nhiều GPU, phân tán). Quyết định liên quan trong `docs/decisions.md`: 53 (code minh họa, SDK OpenAI-compatible), 54 (không chọn nhà cung cấp mặc định, tên model không ghi cứng), 55 (kết quả mẫu chỉ lấy từ lần chạy thật). Ngày tra: **24/10/2026**.

Phạm vi: phục vụ một model nhỏ trên **một máy**. (a) Tự viết API bằng FastAPI quanh model scikit-learn hoặc PyTorch nhỏ. (b) Dùng server OpenAI-compatible có sẵn cho LLM mở, để code `text-api` chạy lại bằng cách đổi `base_url`. Giáo án gốc: "Buổi 5, Deploy riêng mô hình với Docker + Cloud" (dòng 76); buổi 23 (dòng 94, nhiều GPU) thuộc `llm-deployment`.

## Nguồn

- **[PYPI]** Bản mới nhất lúc tra (JSON API của PyPI, `https://pypi.org/pypi/<gói>/json`): [`fastapi`](https://pypi.org/project/fastapi/) **0.162.0** (23/10/2026), [`uvicorn`](https://pypi.org/project/uvicorn/) **0.54.0** (25/9/2026), [`pydantic`](https://pypi.org/project/pydantic/) **2.14.1** (11/10/2026), [`scikit-learn`](https://pypi.org/project/scikit-learn/) 1.9.1 (10/9/2026). Cả ba đều yêu cầu Python `>=3.10`; scikit-learn cần `>=3.11`.
- **[FA-DOCKER]** FastAPI. [*FastAPI in Containers - Docker*](https://fastapi.tiangolo.com/deployment/docker/). Đã đọc: Dockerfile mẫu, dạng `CMD`, số worker.
- **[FA-TEST]** FastAPI. [*Testing Events: lifespan*](https://fastapi.tiangolo.com/advanced/testing-events/). `TestClient` chỉ chạy lifespan khi dùng trong khối `with`.
- **[FA-HOME]** FastAPI. [*Tài liệu chính thức*](https://fastapi.tiangolo.com/) (trang chủ, hướng dẫn, lifespan). Chỉ dùng trang đã đọc ở trên; chưa đọc kỹ phần còn lại.
- **[LCPP]** ggml-org. [*llama.cpp server README*](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md). Đã đọc: lệnh `llama-server -m ... ` hoặc `-hf ...`, `--n-gpu-layers`, `--port` (README ghi mặc định **9931**, đã đối chiếu bằng `curl` vào bảng tham số), `--host 0.0.0.0`, `GET /health` (503 khi đang tải model, 200 `{"status":"ok"}` khi sẵn sàng, không cần API key), `--n-gpu-layers` nhận số, `auto` (mặc định) hoặc `all`. Có API chat kiểu OpenAI và hẳn một mục `GET /v1/models` (OpenAI-compatible Model Info API).
- **[VLLM]** vLLM. [*Online serving (OpenAI-compatible server)*](https://docs.vllm.ai/en/stable/serving/online_serving/). Đã đọc: lệnh `vllm serve <model>`, endpoint Chat Completions `/v1/chat/completions`, chỉ cho model sinh văn bản có chat template. Mục "Basic APIs" liệt kê `/health` (health check). Trang **không** nêu cổng mặc định hay ví dụ `base_url`. Trang cũ `serving/openai_compatible_server/` chỉ là chuyển hướng.
- **[OLL-OAI]** Ollama. [*OpenAI compatibility*](https://docs.ollama.com/api/openai-compatibility): `base_url` là `http://localhost:11434/v1/`, khóa bị bỏ qua, không hỗ trợ `tool_choice` (đã ghi ở `docs/research/text-api.md`).
- **[OLL-GPU]** Ollama. [*Hardware support*](https://docs.ollama.com/gpu). Nvidia (compute capability 5.0+, driver 550+), AMD (ROCm v7 trên Linux), Apple (Metal), GPU khác qua Vulkan; có thể chạy bằng CPU (trang nhắc ví dụ rơi về CPU khi không nhận GPU).
- Tái dùng: [*text-api*](text-api.md) (khuôn gọi `OpenAI(base_url=..., api_key=...)`, bảng nhà cung cấp, Ollama).

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Cổng mặc định của `vllm serve` (hay nhớ là 8000) | Trang [VLLM] không nêu. | Bài ghi `--port` rõ ràng trong lệnh, hoặc nói "xem tài liệu". Không khẳng định mặc định. |
| Đặt `base_url` cho vLLM | Không có ví dụ trên trang đã đọc. | Chỉ nói đúng hình dạng `http://<host>:<port>/v1`; reviewer thử nếu có máy. |
| vLLM chạy được trên CPU / yêu cầu GPU cụ thể | Chưa đọc trang cài đặt. | Chỉ nêu vLLM là server cho GPU, link tài liệu; đẩy chi tiết sang `llm-deployment`. |
| Số `--n-gpu-layers` khuyến nghị cho llama.cpp | README: nhận số, `auto` (mặc định), `all`. Không có khuyến nghị theo model. | Chỉ dùng ví dụ, không nói con số "đúng". |
| `GET /health` của Ollama | Chưa thấy trong trang đã đọc. | Không viết. Bảng của bài ghi "Gửi một yêu cầu nhỏ để thử". (vLLM: đã xác minh `/health`, xem [VLLM].) |
| Dockerfile chạy thật | Docker daemon chưa kiểm trong phiên này; chỉ có Dockerfile đối chiếu từ [FA-DOCKER]. | Mức `đối chiếu` (llm-lessons.md mục 2.5). |
| Thư viện `httpx2` | `TestClient` in cảnh báo (xem "Kiểm chứng"). Chưa tra lịch loại bỏ `httpx`. | Nêu như điều quan sát ở Starlette 1.9.0; không đoán ngày. |
| Bản `torch` + FastAPI trong container (kích thước image) | Chưa đo. | Không ghi số. |

## Ý chính

- **Hai con đường [suy ra từ phạm vi]:** (1) model của bạn (scikit-learn, PyTorch nhỏ) không có sẵn giao diện, nên bạn tự bọc nó bằng một web API. (2) LLM mở (Llama, Qwen...) đã có server dựng sẵn nói "tiếng OpenAI"; bạn chỉ khởi động nó rồi đổi `base_url`.
- **Vì sao bọc model bằng API:** chương trình khác (web, app, bài RAG) gọi qua HTTP mà không cần Python hay file model. Mô hình được tải **một lần** lúc server khởi động, không tải mỗi yêu cầu (dùng `lifespan`) [FA-HOME, FA-TEST].
- **FastAPI + Pydantic [FA-HOME]:** khai báo kiểu của đầu vào bằng lớp `BaseModel`; dữ liệu sai bị từ chối với mã **422** và thông báo lỗi chi tiết (đã thử thật: `features` quá ngắn cho `type: too_short`). Pydantic tự sinh tài liệu `/docs` (suy ra từ FastAPI; chưa kiểm lại trang).
- **`/health` và `/predict`:** `/health` cho bên ngoài (Docker, load balancer, người vận hành) hỏi "server sống chưa, model đã tải xong chưa". llama.cpp làm đúng như vậy: 503 khi đang tải, 200 khi sẵn sàng [LCPP]. Nên tách "sống" (process còn chạy) và "sẵn sàng" (model đã nạp).
- **uvicorn [FA-DOCKER]:** server chạy ứng dụng FastAPI. Trong container nên dùng dạng `CMD` mảng JSON (exec form) để tắt máy êm và chạy được sự kiện lifespan. Mặc định một tiến trình mỗi container; nhân bản ở tầng cluster. `--workers` chỉ khi một máy, không có cluster (và nhớ mỗi worker tải một bản model, tốn RAM).
- **Server OpenAI-compatible có sẵn:**
  - Ollama (dễ nhất cho máy cá nhân, CPU hoặc GPU) [OLL-OAI, OLL-GPU].
  - llama.cpp `llama-server` (model GGUF, chạy tốt trên CPU, có thể đẩy một phần lớp lên GPU bằng `--n-gpu-layers`) [LCPP].
  - vLLM (`vllm serve <model>`, hướng GPU, phục vụ nhiều yêu cầu đồng thời; bài chỉ nêu, chi tiết ở `llm-deployment`) [VLLM].
  - Ưu điểm chung: client không đổi; chỉ đổi `OPENAI_BASE_URL`, `OPENAI_API_KEY` (giá trị bất kỳ), `LLM_MODEL` (ba biến của llm-lessons.md mục 2.3).
- **CPU và GPU:** CPU đủ cho model nhỏ và ít người dùng; GPU giúp khi model lớn hoặc nhiều yêu cầu. Ollama và llama.cpp tự dùng GPU nếu nhận được (Ollama có thể rơi về CPU), vLLM nhắm tới GPU [OLL-GPU, LCPP, VLLM]. Quy tắc dùng chung (suy ra): model phải vừa bộ nhớ (RAM hoặc VRAM) trước, rồi mới tới tốc độ.
- **Đo độ trễ:** ghi thời gian mỗi yêu cầu, sắp xếp, lấy p50 (trung vị) và p95 (95% yêu cầu nhanh hơn mức này). Trung bình giấu đuôi chậm, nên người vận hành xem p95. Thông lượng (throughput) = số yêu cầu xong chia thời gian. Với LLM còn đo thời gian tới token đầu và token/giây (khái niệm chung; chưa tra nguồn).
- **Phân biệt với `llm-deployment`:** bài này một máy, một bản model, một tiến trình. Nhiều GPU, chia model, phân tán thuộc `llm-deployment`. Phần cloud (đẩy image lên dịch vụ) thuộc `docker-cloud`; bài này chỉ nối: đóng gói app thành image rồi chạy bằng lệnh `docker run`.

## Công thức quan trọng

Không có công thức mới. Chỉ có định nghĩa phân vị, ký hiệu theo site ($m$ là số yêu cầu đo):

Sắp xếp độ trễ $t_{(1)}\le\dots\le t_{(m)}$. Khi đó p95 là $t_{(\lceil 0.95\,m\rceil)}$ (có nhiều cách nội suy; code của bài dùng cách chọn thứ hạng đơn giản này), và thông lượng $R = m/\Delta t$ với $\Delta t$ là tổng thời gian chạy xong cả đợt. Client gửi lần lượt: $\Delta t \approx m\,\bar{t}$ nên $R \approx 1/\bar{t}$. Bài dùng $\Delta t$ vì $T$ là ký hiệu nhiệt độ của phần LLM (quyết định 60).

## Ví dụ hoặc trực giác hay

- **Quán ăn (gợi ý):** `/health` giống tấm biển "Đang mở cửa". Bếp (model) phải nấu xong nước dùng (tải model) thì biển mới đổi sang "Sẵn sàng"; khách (yêu cầu) tới sớm sẽ nhận 503.
- **p50 và p95 (gợi ý):** 100 khách, người thứ 50 chờ 3 phút (p50), người thứ 95 chờ 6 phút (p95). Trung bình 3,5 phút nghe ổn, nhưng 5 người cuối đã chờ rất lâu.
- **Đổi `base_url` như đổi ổ cắm (gợi ý):** phích cắm (code client) không đổi, chỉ nối sang ổ khác: OpenAI, Gemini, Ollama trên laptop, hay `llama-server` trên máy chủ nhà.
- **Bọc model sklearn:** mô hình hoa diên vĩ (iris) là ví dụ nhỏ, ai cũng chạy được; điểm cần dạy là **quy trình**, không phải độ chính xác.

### Code đề xuất (đã được thay bằng code của bài)

> Mục này là đề xuất ban đầu của summarizer, giữ lại để tham khảo. Bài dùng code khác: `src/code/llm/deploy-custom-model/train.vi.py` (huấn luyện, lưu `model.joblib`), `app.vi.py` (bốn trường số đo có `Field(gt=0)`, nạp `joblib` trong `lifespan`, `/health` trả 503 khi chưa nạp, `/predict` trả tên loài), `bench.vi.py` (p50, p95, thông lượng); Dockerfile dùng `python:3.14-slim`, cổng 8000. Xem bảng "Kiểm chứng code".

Cấu trúc `app.py` (đã chạy; dùng ở bài sẽ cần dịch comment sang tiếng Việt có dấu, chuỗi giữ nguyên): `lifespan` huấn luyện `LogisticRegression` trên iris và lưu vào dict `state`; `class Flower(BaseModel)` có `features: list[float] = Field(min_length=4, max_length=4)`; `GET /health` trả `{"status": "ok", "model_loaded": "model" in state}`; `POST /predict` trả `{"label": int(...), "proba": [...]}`. Bản đầy đủ để reviewer dùng nằm ở scratchpad: `C:\Users\Dell\AppData\Local\Temp\claude\C--Users-Dell--claude-spares-spare-oouS1w\79a7891d-1d77-4416-b0df-a18c7072fd07\scratchpad\dcm\app.py` (và `run_test.py` cùng thư mục). Lưu ý: file scratchpad có thể mất; nếu cần, `lesson-writer` viết lại theo mô tả này.

Chạy server (người đọc làm trên máy):

```sh
pip install fastapi uvicorn scikit-learn
uvicorn app:app --host 127.0.0.1 --port 8000
```

Dockerfile (đối chiếu [FA-DOCKER], dạng exec; chưa build): `FROM python:3.14`, `WORKDIR /code`, `COPY requirements.txt`, `RUN pip install --no-cache-dir -r requirements.txt`, `COPY app.py .`, `CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "80"]`. Cần `--host 0.0.0.0` để truy cập được từ ngoài container (kiến thức chung; trang [FA-DOCKER] dùng `fastapi run`, không nêu `--host`).

Dùng lại code `text-api` với server có sẵn (chỉ đổi biến môi trường, khớp mục 2.3):

```sh
export OPENAI_BASE_URL="http://localhost:11434/v1/"   # Ollama [OLL-OAI]
export OPENAI_API_KEY="ollama"                         # bị bỏ qua
export LLM_MODEL="<tên model đã pull>"
```

llama.cpp: `llama-server -m <file.gguf> --port 8080` rồi `OPENAI_BASE_URL=http://localhost:8080/v1` (dạng `/v1` là kiến thức chung về API kiểu OpenAI; README đã đọc không có ví dụ đầy đủ, nên reviewer thử nếu cài được).

## Kiểm chứng code

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `train.vi.py`, `train.en.py` | chạy thật | 2026-10-24 | `.venv-llm`: Python 3.14.5, scikit-learn 1.9.1, joblib 1.6.0 | In `0.978`, `scikit-learn 1.9.1`, ba lớp; ghi `model.joblib` (1071 byte). Kết quả mẫu trong bài lấy từ lần này (`sampleVaries={false}`) |
| `app.vi.py`, `app.en.py` | chạy thật | 2026-10-24 | `.venv-llm`: fastapi 0.162.0, starlette 1.9.0, pydantic 2.14.1, uvicorn 0.54.0, httpx 0.28.1 | `TestClient` trong `with`: `/health` 200 `{'status': 'ok'}`; `/predict` (5.9, 3.0, 5.1, 1.8) trả virginica 0.653, versicolor 0.345, setosa 0.001; `petal_width: -1` trả 422 `greater_than`; chỉ `sepal_length` trả 422, ba lỗi `missing`; `"abc"` trả 422 `float_parsing`; `"1.8"` được nhận (200); `GET /predict` 405; `/docs` 200. Không `with`: `/health` 503, `/predict` `KeyError: 'model'`. uvicorn thật trên 127.0.0.1, cổng ngẫu nhiên, dừng đúng PID: log `Waiting for application startup.` → `Application startup complete.` → `Uvicorn running on ...`. Bản có `time.sleep(4)` trong `lifespan`: client không kết nối được cho tới khi nạp xong, không nhận 503 |
| `bench.vi.py`, `bench.en.py` | chạy thật | 2026-10-24 | như trên, server uvicorn thật trên 127.0.0.1 (máy phát triển Windows, client và server cùng máy) | p50 4.96 ms, p95 5.90 ms, trung bình 4.95 ms, 202 yêu cầu/giây. Kết quả mẫu trong bài lấy từ lần này. Số đo chỉ có giá trị trên máy phát triển. Qua `TestClient` (trong tiến trình, không TCP): p50 5.23 ms, p95 8.20 ms, không dùng trong bài. Qua container ở dòng Dockerfile: p50 5.11 ms, p95 7.08 ms |
| khối `dockerfile` và `requirements.txt` trong bài | chạy thật | 2026-10-24 | Docker 29.8.1 (Docker Desktop), `python:3.14-slim` | Build thành công (image khoảng 579 MB theo `docker images`), `docker run -p 127.0.0.1::8000`, `bench.py` chạy qua container. `docker stop` với `CMD` dạng mảng: log có `Shutting down` và `Application shutdown complete.` (uvicorn là PID 1, nhận SIGTERM). Thử `CMD` dạng chuỗi: log không có hai dòng đó (uvicorn chạy dưới `/bin/sh -c`, không nhận SIGTERM, lifespan không chạy phần tắt). Câu quiz 3 của bài dựa trên lần chạy này. Đã xóa container và image thử |
| lệnh `ollama`, `llama-server`, `vllm serve`, địa chỉ `/v1/models` | đối chiếu | 2026-10-24 | tài liệu [OLL-OAI], [LCPP], [VLLM] | Chưa chạy (máy không có Ollama, llama.cpp, GPU). Ollama và vLLM liệt kê `/v1/models`; README llama.cpp có hẳn mục `GET /v1/models`. vLLM có `/health` (mục Basic APIs). README llama.cpp ghi 503 cho `/health` lúc nạp, cổng mặc định 9931 (bài luôn ghi `--port 8080`), `--n-gpu-layers all`. Ollama: chưa thấy `/health` trong trang đã đọc, bài ghi "gửi một yêu cầu nhỏ để thử" |

Ghi chú: trong `.venv-llm` có sẵn `httpx2` 2.16.0, nên `TestClient` không in cảnh báo `StarletteDeprecationWarning` như ở venv riêng của summarizer.

Gói cần thêm vào `scripts/requirements-llm.txt` (phiên chính làm): `fastapi==0.162.0`, `uvicorn==0.54.0`, `pydantic==2.14.1`, `httpx==0.28.1` (đã có sẵn trong `.venv-llm` và đã chạy; `scikit-learn`, `joblib`, `numpy` đã có).

## Điểm dễ hiểu nhầm

1. **Tải model trong mỗi yêu cầu.** Chậm và tốn RAM; tải một lần ở `lifespan`.
2. **Quên `--host 0.0.0.0` trong container.** Server chỉ nghe `127.0.0.1` trong container nên bên ngoài không vào được (kiến thức chung, nên reviewer kiểm khi build thật).
3. **`TestClient` không có `with`:** lifespan không chạy, model chưa tải [FA-TEST].
4. **`CMD` dạng chuỗi (shell form):** tắt máy không êm, lifespan có thể không chạy [FA-DOCKER].
5. **Nhiều `--workers` mà RAM nhỏ:** mỗi worker giữ một bản model [FA-DOCKER nhắc bộ nhớ].
6. **Đo độ trễ bằng trung bình,** bỏ qua p95. Và đo lần đầu (khởi động lạnh) lẫn với lần sau.
7. **Số đo qua `TestClient` không phải số của mạng thật.** Nó gọi thẳng ứng dụng trong tiến trình, không có TCP.
8. **Tưởng "OpenAI-compatible" nghĩa là đủ mọi tính năng.** Ollama không có `tool_choice`, `logprobs`, `n` [OLL-OAI]; kiểm từng server.
9. **Để server chạy trên `0.0.0.0` không khóa.** Ai cùng mạng cũng gọi được model của bạn. Nói người đọc: giữ `127.0.0.1` khi thử; ra Internet cần xác thực và HTTPS (kiến thức chung, chưa tra nguồn).
10. **Nhầm bài này với `llm-deployment`:** một máy khác nhiều GPU và phân tán.

## Liên quan tới bài nào

Slug đã đối chiếu `src/data/roadmap.ts`.

- **Cần biết trước:** `llm/docker-cloud` (image, container; nối bằng Dockerfile). Chuỗi cần biết trước: `llm/gradio-streamlit` → `llm/docker-cloud` → bài này.
- **Bài sau:** `llm/llm-deployment` (cần `llm/deploy-custom-model` và `llm/evaluation-peft`): nhiều GPU, phân tán; bài này chỉ hẹn.
- **Dùng lại:** `llm/text-api` (khuôn `OpenAI(base_url=...)`, bảng nhà cung cấp, Ollama), `llm/gradio-streamlit` (giao diện gọi API). `llm/rag-chatbot` hưởng lợi từ việc đổi `base_url` sang server riêng.
- Đợt 4 theo llm-lessons.md mục 2.8, cùng đợt với `langchain-llamaindex`, `graph-rag`, `llama-family`. Bài cùng đợt chỉ ghi tên, không gắn link.

## Thuật ngữ đề xuất

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Phục vụ model / suy luận qua API | Model serving | Gloss lần đầu, giữ "serving" |
| Kiểm tra sức khỏe | Health check | Giữ "health check" |
| Độ trễ | Latency | Dịch; p50, p95 giữ nguyên |
| Thông lượng | Throughput | Dịch |
| Điểm cuối (API) | Endpoint | Giữ "endpoint" |
| Kiểm tra dữ liệu vào | Validation | Gloss khi nói Pydantic |
| Khởi động lạnh | Cold start | Gloss một lần |

## Đọc thêm đề xuất

1. [FastAPI in Containers - Docker](https://fastapi.tiangolo.com/deployment/docker/) (đã đọc).
2. [FastAPI, Testing Events (lifespan)](https://fastapi.tiangolo.com/advanced/testing-events/) (đã đọc).
3. [llama.cpp server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md) (đã đọc tham số).
4. [vLLM online serving](https://docs.vllm.ai/en/stable/serving/online_serving/) (đã đọc phần Chat Completions).
5. [Ollama OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility) và [Ollama hardware](https://docs.ollama.com/gpu).
