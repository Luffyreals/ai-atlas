# Docker và Cloud

Bài: `llm/docker-cloud` (chỉ bản vi, khoảng 12 phút đọc, đợt 3). Cần biết trước: `llm/gradio-streamlit`. Bài kế tiếp dùng lại hình `ContainerImageFigure`: `llm/deploy-custom-model`. Quyết định liên quan trong `docs/mvp.md` mục 7: 53 (key đọc từ biến môi trường), 54 (`Dockerfile` viết thẳng trong MDX bằng khối ` ```dockerfile `, mức kiểm chứng "đối chiếu"), 55, 56.

Ngày tra: **24/10/2026**, bằng WebFetch. Thẻ nguồn: [D-REF], [D-BP], [D-SEC], [D-RUN], [D-PY], [G-DOCK], [S-DOCK], [CR]. Ý không có thẻ là kiến thức chung hoặc suy ra.

## Nguồn

- **[D-REF]** Docker. [*Dockerfile reference*](https://docs.docker.com/reference/dockerfile/). Đã đọc phần lệnh `FROM`, `WORKDIR`, `COPY`, `RUN`, `ENV`, `ARG`, `EXPOSE`, `CMD`, `ENTRYPOINT`. Trang dài hơn 122 000 ký tự, mới đọc 100 000 ký tự đầu.
- **[D-BP]** Docker. [*Building best practices*](https://docs.docker.com/build/building/best-practices/). Đã đọc: multi-stage, chọn base image, ghim phiên bản, `.dockerignore`, `USER` không phải root, dạng exec của `CMD`.
- **[D-SEC]** Docker. [*Build secrets*](https://docs.docker.com/build/building/secrets/). Đã đọc: `docker build --secret`, `RUN --mount=type=secret`.
- **[D-RUN]** Docker. [*docker container run*](https://docs.docker.com/reference/cli/docker/container/run/). Đã đọc: `-p`, `-e`, `--env-file`, `--rm`, `-d`.
- **[D-PY]** Docker Hub. [*python (Docker Official Image)*](https://hub.docker.com/_/python). Có tag `3.12-slim`, `3.13-slim`, `3.14-slim`; bản Python mới nhất trên trang là 3.15.1 (tag `latest`).
- **[G-DOCK]** Gradio. [*Deploying Gradio with Docker*](https://www.gradio.app/guides/deploying-gradio-with-docker). Đã đọc: `GRADIO_SERVER_NAME="0.0.0.0"`, `EXPOSE 7860`, `CMD ["python", "app.py"]`. Ví dụ trên trang dùng Python 3.10 slim (cũ).
- **[S-DOCK]** Streamlit. [*Deploy Streamlit using Docker*](https://docs.streamlit.io/deploy/tutorials/docker). Đã đọc: `python:3.12-slim`, `EXPOSE 8501`, `--server.address=0.0.0.0`, `HEALTHCHECK` tới `/_stcore/health`.
- **[CR]** Google Cloud. [*Cloud Run container runtime contract*](https://docs.cloud.google.com/run/docs/container-contract). Dùng làm **ví dụ** cho "hợp đồng" của dịch vụ chạy container, không phải khuyến nghị nhà cung cấp.
- **Phiên bản Docker:** máy phát triển có Docker CLI và daemon **29.8.1** (`docker version`, đã chạy ngày 24/10/2026). Chưa tra bản mới nhất trên trang phát hành.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Bản Docker "hiện hành" | Chỉ biết bản trên máy (29.8.1) | Bài nói "Docker 29 (10/2026)", không nói "mới nhất" |
| Cloud Run: giá, gói miễn phí, hạn mức | Không tra | Không ghi (quy ước 2.6). Link trang giá chính thức nếu cần |
| Dịch vụ cloud khác (AWS, Azure, Fly.io, Render, Hugging Face Spaces...) | Chỉ tra Cloud Run | Bài nói chung: "nhiều dịch vụ cho chạy container"; nêu Cloud Run như một ví dụ có link |
| Đẩy lên Docker Hub thật (`docker login`) | Chỉ đẩy/kéo qua registry cục bộ `registry:3`; cú pháp đối chiếu trang `docker image push`. Quyền riêng tư của repo mới theo mục "Default repository privacy" của tài khoản ([Docker Hub settings](https://docs.docker.com/docker-hub/settings/)); trang không nói giá trị mặc định | Bài nói "thường là công khai", dặn kiểm mục này trước khi đẩy |
| Registry cụ thể (Docker Hub, GHCR, ...) | Chưa tra giới hạn, giá | Chỉ nêu tên như ví dụ, không ghi giới hạn |
| Streamlit 1.66 bên trong container | Chỉ chạy Gradio 6.30 trong container (xem "Kiểm chứng") | Bài chỉ nhắc cờ `--server.address=0.0.0.0` của Streamlit theo [S-DOCK] |
| `HEALTHCHECK` | Chỉ thấy trong ví dụ Streamlit | Không đưa vào bài, hoặc nhắc một câu |
| Trang [D-REF] phần sau ký tự 100 000 | Chưa đọc | Không dùng lệnh nào ngoài danh sách trên |

## Ý chính

- **Vì sao cần Docker:** ứng dụng Gradio/Streamlit chạy tốt trên máy bạn nhưng người khác có Python, gói và hệ điều hành khác. Docker đóng gói chương trình cùng môi trường của nó thành một khối chạy giống nhau ở mọi nơi có Docker. Đây cũng là "đơn vị" mà hầu hết dịch vụ cloud nhận về để chạy.
- **Image và container (giáo án gốc, buổi 4):** image là bản đóng gói **chỉ đọc**, gồm nhiều lớp xếp chồng; mỗi lệnh `RUN`, `COPY` thêm một lớp [D-REF]. Container là **một lần chạy** từ image, có thêm một lớp ghi tạm; từ một image chạy được nhiều container. Hình `ContainerImageFigure` minh họa ý này. Ví von của bài: image như công thức đã in thành sách, container như bữa ăn nấu theo sách (gợi ý).
- **Dockerfile là công thức dựng image** [D-REF]: `FROM` chọn nền, `WORKDIR` đặt thư mục làm việc, `COPY` chép file vào, `RUN` chạy lệnh lúc **dựng** (ví dụ `pip install`), `EXPOSE` ghi chú cổng, `CMD` là lệnh mặc định lúc **chạy** (không chạy khi dựng).
- **Base image:** dùng `python:3.12-slim` hoặc `3.13-slim` [D-PY]. Bản `slim` bỏ bớt gói Debian nên nhỏ hơn; đổi lại thiếu công cụ biên dịch, gói pip nào phải biên dịch từ mã nguồn có thể lỗi, khi đó cài thêm gói Debian hoặc dùng image mặc định [D-PY]. Ví dụ chính thức của Streamlit dùng 3.12-slim [S-DOCK]. Tag có thể đổi theo thời gian; ghim digest chặt hơn nhưng mất cập nhật bảo mật tự động [D-BP]. Với bài nhập môn, ghim tag minor (`3.12-slim`) là đủ.
- **Thứ tự lệnh và bộ nhớ đệm (cache):** `COPY requirements.txt` và `pip install` **trước**, rồi mới `COPY` mã nguồn. Sửa code thì chỉ dựng lại lớp cuối, không cài lại gói. Docker xét từng lệnh theo thứ tự để dùng lại lớp cũ [D-BP]. (Trang best practices không nêu thẳng mẹo này; đây là kiến thức chung, đã thấy đúng khi chạy thử, xem dưới.)
- **`requirements.txt`:** liệt kê gói của ứng dụng (`openai`, `gradio` hoặc `streamlit`, bản theo `scripts/requirements-llm.txt`). `pip install --no-cache-dir` để image nhỏ hơn [G-DOCK].
- **`.dockerignore`:** liệt kê file không đưa vào ngữ cảnh dựng [D-BP]. Cú pháp gần giống `.gitignore`, nhưng mỗi mẫu tính từ gốc ngữ cảnh dựng, không khớp ở mọi cấp; `**` khớp số thư mục bất kỳ, kể cả không thư mục nào ([Build context](https://docs.docker.com/build/concepts/context/)). Vì vậy dùng `**/.env*`, `**/.venv*/`, `.git/`, `**/__pycache__/`. Đã thử: với `.env*`, file `pkg/.env.llm` vẫn lọt vào image. Nhờ đó key lỡ nằm trong thư mục (gốc hay thư mục con) không bị `COPY . .` đưa vào image.
- **Cổng (port):** `EXPOSE` **chỉ là ghi chú**, không mở cổng; muốn truy cập từ máy bạn phải `docker run -p <cổng máy>:<cổng container>` [D-REF, D-RUN]. Ứng dụng trong container phải nghe ở `0.0.0.0`, không phải `127.0.0.1`, nếu không bên ngoài không vào được: Gradio đặt `GRADIO_SERVER_NAME="0.0.0.0"` (cổng mặc định 7860) [G-DOCK]; Streamlit chạy với `--server.address=0.0.0.0` (cổng mặc định 8501) [S-DOCK].
- **Biến môi trường và secret:** `ENV` trong Dockerfile **nằm lại trong image** và xem được bằng `docker inspect` [D-REF]. `ARG` không nên dùng cho token, mật khẩu: có thể lộ qua `docker history` [D-REF]. Docker nói rõ biến môi trường và build arg "persist in the final image" khi dùng cho secret lúc dựng [D-SEC]. Vì vậy: **không bao giờ** ghi `OPENAI_API_KEY` vào Dockerfile hay `COPY` file `.env`; đưa key vào **lúc chạy** bằng `docker run -e OPENAI_API_KEY` hoặc `--env-file` [D-RUN]. Cùng khuôn với `text-api`: code đọc `os.environ`. Secret cần **lúc dựng** (ví dụ tải gói từ kho riêng) dùng `docker build --secret` và `RUN --mount=type=secret` [D-SEC]; ứng dụng của bài không cần nên chỉ nhắc một câu.
- **`--env-file` [D-RUN]:** mỗi dòng `TÊN=giá trị` hoặc chỉ `TÊN` (lấy giá trị từ shell hiện tại); dòng bắt đầu bằng `#` bị bỏ qua; `#` giữa dòng thuộc về giá trị. File `.env` này phải vào `.gitignore` và `.dockerignore`.
- **Lệnh hay dùng [D-RUN]:** `docker build -t <tên> .`; `docker run --rm -p 127.0.0.1:7860:7860 --env-file .env.llm <tên>`; `-d` chạy nền; `--rm` xóa container khi dừng; `docker ps`, `docker stop`, `docker logs` (ba lệnh này chưa tra riêng, kiến thức chung).
- **Registry:** nơi lưu và chia sẻ image (Docker Hub là registry mặc định của `docker pull`). Dựng một lần, gắn tên (`docker tag`), đẩy lên (`docker push`), nơi khác kéo về chạy. Image gắn tag (`tên:phiên-bản`). Đã đẩy/kéo thật qua registry cục bộ, xem "Kiểm chứng".
- **Dịch vụ chạy container trên cloud (mức chung):** bạn đưa image, dịch vụ chạy nó, cấp URL, đặt biến môi trường cho bạn. "Hợp đồng" điển hình, theo ví dụ Cloud Run [CR]: nghe ở `0.0.0.0` trên cổng do nền tảng báo qua biến `PORT` (mặc định 8080); hệ tệp trong container **mất khi instance dừng**, nên dữ liệu bền phải để chỗ khác; instance nhàn rỗi có thể bị tắt bất cứ lúc nào. Suy ra cho bài: ứng dụng nên đọc cổng từ biến môi trường (`PORT`) thay vì ghi cứng; key đặt qua phần biến môi trường/secret của dịch vụ, không đưa vào image; ứng dụng công khai dùng key của bạn thì ai cũng gọi được và tốn tiền, cần giới hạn.
- **Bản Docker và Python:** dùng `python:3.12-slim` (khớp ví dụ Streamlit) hoặc `3.13-slim`. Streamlit 1.66 cần Python >= 3.11, Gradio 6.30 cần >= 3.10 (`gradio-streamlit.md`), nên 3.12 dùng được cho cả hai. Python 3.15.1 đã có trên Docker Hub nhưng bài giữ bản đã kiểm chứng gói.

## Công thức quan trọng

Không có công thức toán. Khuôn Dockerfile (diễn đạt lại từ [G-DOCK], [S-DOCK], [D-BP]; đúng khối trong bài, đã dựng thật, xem "Kiểm chứng"). Cổng mặc định của Gradio là 7860:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV GRADIO_SERVER_NAME=0.0.0.0
ENV PYTHONUNBUFFERED=1
EXPOSE 7860
CMD ["python", "app.py"]
```

Với Streamlit: bỏ dòng `ENV GRADIO_SERVER_NAME`, `EXPOSE 8501`, `CMD ["streamlit", "run", "app.py", "--server.address=0.0.0.0", "--server.port=8501"]`. Ghi chú: `GRADIO_SERVER_NAME` và `PYTHONUNBUFFERED` không chứa secret nên được phép nằm trong image. `COPY . .` chỉ an toàn khi có `.dockerignore` dưới đây. Dùng dạng exec cho `CMD` [D-REF, D-BP].

Khuôn `.dockerignore` (mẫu tính từ gốc ngữ cảnh dựng, nên có `**/`): `**/.env*`, `**/.venv*/`, `.git/`, `**/__pycache__/`.

Lệnh (placeholder đúng quy ước, không ghi key thật):

```sh
docker build -t atlas-chat .
docker run --rm -p 127.0.0.1:7860:7860 --env-file .env.llm atlas-chat
```

`.env.llm` chứa `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `LLM_MODEL`, đúng ba biến của dự án. (Tên `.env.llm` trùng file kiểm chứng của dự án và đã bị `.gitignore` chặn qua mẫu `.env.*`.)

## Ví dụ hoặc trực giác hay

- **Công thức và bữa ăn (gợi ý):** image là công thức cố định, container là mỗi lần nấu. Xóa bếp (container) đi, công thức (image) vẫn còn, nên nấu lại ra đúng món.
- **Hộp cơm đóng sẵn (gợi ý):** đóng gói ứng dụng cùng Python và gói như một hộp cơm kín, bất kỳ đâu có Docker đều mở ra ăn như nhau. Key giống chìa khóa đưa riêng cho người nhận lúc mở hộp, không dán vào hộp.
- **Thí nghiệm "key không nằm trong image" (đã chạy thật, xem dưới):** dựng image, chạy với `--env-file` thì ứng dụng thấy key; chạy lại cùng image không có cờ đó thì biến trống. Cùng một image, hai hành vi, chứng tỏ key không bị "nướng" vào image. Dùng được cho mục Minh họa (bảng "lệnh / kết quả").
- **Thí nghiệm cache (đã chạy thật, xem dưới):** sửa `app.py`, dựng lại; `WORKDIR`, `COPY requirements.txt`, `pip install` hiển thị `CACHED`, chỉ `COPY . .` chạy lại (3.2 s).
- **Hình `ContainerImageFigure`:** các lớp xếp chồng (base `python:3.12-slim` > gói pip > code), bên cạnh vài container chạy từ cùng image, mỗi container thêm một lớp ghi tạm.

## Điểm dễ hiểu nhầm

Dùng cho "Lỗi hay gặp".

1. **Ứng dụng nghe ở `127.0.0.1` trong container.** Chạy được trong container nhưng trình duyệt trên máy không vào được. Phải nghe `0.0.0.0` (Gradio: `GRADIO_SERVER_NAME`; Streamlit: `--server.address`) [G-DOCK, S-DOCK].
2. **Tưởng `EXPOSE` mở cổng.** Không, phải `-p` khi `docker run` [D-REF].
3. **Ghi key vào Dockerfile (`ENV`, `ARG`) hoặc `COPY . .` kéo theo `.env`.** Key nằm lại trong image, lộ qua `docker inspect` hoặc `docker history`; push lên registry công khai là lộ cho cả thế giới [D-REF, D-SEC]. Thiếu `.dockerignore`, hoặc viết `.env*` thay vì `**/.env*` (file trong thư mục con vẫn lọt), là nguyên nhân hay gặp.
4. **Quên `-p` hoặc map sai cổng** (ứng dụng ở 7860 nhưng map 8501).
5. **Nhầm `RUN` với `CMD`.** `RUN` chạy lúc dựng; `CMD` chạy lúc khởi động container và chỉ `CMD` cuối cùng có hiệu lực [D-REF].
6. **Sửa code mà chạy lại container cũ.** Container chạy từ image đã dựng; sửa file trên máy không đổi gì cho tới khi dựng lại image.
7. **Lưu dữ liệu trong container.** Lớp ghi của container mất khi container bị xóa (và trên cloud, khi instance dừng) [CR]. Lịch sử chat, file tải lên cần chỗ lưu riêng (hẹn các bài sau).
8. **Dùng `slim` rồi `pip install` lỗi biên dịch** vì thiếu công cụ build [D-PY]. Gói của bài (`openai==3.37.0`, `gradio==6.30.0`) cài trên `python:3.12-slim` không gặp lỗi này (đã dựng thật, xem dưới); nếu gặp thì cài thêm gói Debian hoặc đổi image.
9. **Dùng tag `latest` cho base image.** Tag đổi theo thời gian, dựng hôm nay khác hôm sau; ghim tag phiên bản [D-BP]. Ghi ý này sau khi chọn `3.12-slim`.
10. **Công khai ứng dụng dùng key của bạn mà không giới hạn:** ai cũng dùng được, bạn trả tiền. Cần xác thực hoặc hạn mức (hẹn bài sau; ý chung).
11. **Container chạy bằng root theo mặc định.** Docker khuyên tạo người dùng riêng bằng `USER` khi dịch vụ không cần quyền đặc biệt [D-BP]. Có thể nhắc một câu, không bắt buộc trong ví dụ.
12. **Cổng cứng trên cloud:** nhiều dịch vụ báo cổng qua biến `PORT` (ví dụ Cloud Run [CR]); ghi cứng 7860 có thể không khớp.

## Liên quan tới bài nào

- **Cần biết trước:** `llm/gradio-streamlit` (ứng dụng một file để đóng gói) và, gián tiếp, `llm/text-api` (ba biến môi trường, nhà cung cấp OpenAI-compatible).
- **Bài kế tiếp:** `llm/deploy-custom-model` (cần `llm/docker-cloud`): dùng lại `ContainerImageFigure`, thêm model và hạ tầng suy luận.
- **Cùng đợt 3:** `llm/rag-chatbot`, `llm/gpt-family-finetuning`, `llm/pretraining-data` (không link, quyết định 2.8).
- **Giáo án gốc (`giáo án ai.md`, dòng 75):** Buổi 4 "Docker + Cloud": Docker là gì, phân biệt image và container, cài đặt Docker, dựng image và chạy container. Buổi 5 (`deploy-custom-model`) deploy riêng mô hình. Bài này phủ buổi 4; "cài đặt Docker" chỉ link trang cài chính thức, không hướng dẫn từng hệ điều hành (suy ra, chưa tra trang cài).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Image | Image | Giữ nguyên "image", gloss "bản đóng gói chỉ đọc" |
| Container | Container | Giữ nguyên, gloss "một lần chạy của image" |
| Dockerfile | Dockerfile | Giữ nguyên |
| Registry | Registry | Giữ nguyên, gloss "kho chứa image" |
| Lớp | Layer | Dịch "lớp (layer)" |
| Biến môi trường | Environment variable | Đã dùng ở `text-api` |
| Ngữ cảnh dựng | Build context | Dịch, gloss "các file được gửi cho Docker khi dựng" |
| Bộ nhớ đệm dựng | Build cache | Dịch "cache" hoặc "bộ nhớ đệm" |

## Đọc thêm đề xuất

1. [Docker, *Building best practices*](https://docs.docker.com/build/building/best-practices/) và [*Dockerfile reference*](https://docs.docker.com/reference/dockerfile/). Đã đọc.
2. [Docker, *Build secrets*](https://docs.docker.com/build/building/secrets/). Đã đọc.
3. [Gradio, *Deploying Gradio with Docker*](https://www.gradio.app/guides/deploying-gradio-with-docker) và [Streamlit, *Deploy using Docker*](https://docs.streamlit.io/deploy/tutorials/docker). Đã đọc.
4. [Docker Hub, *python*](https://hub.docker.com/_/python). Đã đọc.
5. [Cloud Run, *Container runtime contract*](https://docs.cloud.google.com/run/docs/container-contract) làm ví dụ về hợp đồng của dịch vụ cloud. Đã đọc. Link trang giá chính thức của dịch vụ người đọc chọn, không ghi con số.

## Kiểm chứng code

Daemon Docker **đang chạy** (client và server 29.8.1, Docker Desktop trên Windows). Ngày 24/10/2026, `lesson-writer` **dựng thật** Dockerfile của bài với ứng dụng Gradio thật (`app.vi.py` chép thành `app.py`, `requirements.txt` = `openai==3.37.0`, `gradio==6.30.0`) trong thư mục con của scratchpad, với tag riêng. Ngữ cảnh dựng có thêm file mồi (key giả) ở gốc và trong thư mục con để kiểm `.dockerignore`. Cổng trên máy chọn ngẫu nhiên, luôn nối vào `127.0.0.1`. Sau khi xong, chỉ dừng và xóa đúng container, image do mình tạo (theo tên); không chạy lệnh dọn dẹp toàn cục (`docker system/builder/image prune`). Lần thử trước (máy chủ HTTP đồ chơi) không còn dùng.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `app.vi.py` | chạy khô | 2026-10-24 | Trong container: Python 3.12.15, openai 3.37.0, gradio 6.30.0; `--env-file` key giả, `OPENAI_BASE_URL=http://127.0.0.1:9/v1` | `ast.parse(feature_version=(3,10))` qua. Server mở, `GET /` trả HTTP 200 sau 4–24 s. Một lượt chat gửi bằng `gradio_client` từ máy: log container kết thúc ở `openai.APIConnectionError: Connection error.` Không có key thật nên không có kết quả mẫu của mô hình. Comment dòng 8 đổi thành "không đặt biến: dùng OpenAI" (bản en "not set: use OpenAI"), `ast.parse` lại qua |
| `app.en.py` | cú pháp | 2026-10-24 | `.venv-llm` (Python 3.14.5) | `ast.parse(feature_version=(3,10))` qua; code giống `app.vi.py`, chỉ khác comment và hai chuỗi (`SYSTEM`, `title`) |
| khối `dockerfile` trong bài (cùng `requirements.txt`, `.dockerignore`, lệnh `docker build`/`docker run`) | chạy thật | 2026-10-24 | Docker 29.8.1, base `python:3.12-slim` (Python 3.12.15) | Dựng xong (72 s lần cuối; bước `pip install` 44.8 s và 83.6 s ở hai lần, cài 56 gói). Image 675 650 152 byte (`docker images`: 676 MB trên đĩa, 155 MB nén); lớp `pip install` 386 MB. `--env-file` + `-p`: HTTP 200, log `Running on local URL:  http://0.0.0.0:7860` (hai dấu cách). Không `--env-file`: thoát mã 1, `KeyError: 'OPENAI_API_KEY'`. `-e GRADIO_SERVER_NAME=127.0.0.1`: từ máy curl lỗi 52 (không có trả lời), trong container vẫn 200. `-e PORT=8080 -p ...:8080`: 200, log ghi cổng 8080. Không `-p`: `docker ps` chỉ ghi `7860/tcp`. `docker image inspect` và `docker history --no-trunc`: 0 lần xuất hiện key giả; `Env` chỉ có biến của base image, `GRADIO_SERVER_NAME`, `PYTHONUNBUFFERED`. Sửa `app.py` rồi dựng lại: `WORKDIR`, `COPY requirements.txt`, `pip install` đều `CACHED`, cả lần dựng 3.2 s. `docker stop`: container bị buộc tắt, mã thoát 137 (Python ở PID 1 bỏ qua SIGTERM); `docker kill -s INT`: thoát mã 0 sau khoảng 1 s |
| `.dockerignore` với `**/` | chạy thật | 2026-10-24 | như trên; mồi: `.env.llm`, `.git/`, `.venv-llm/`, `__pycache__/` ở gốc; `pkg/.env.llm`, `pkg/.venv/`, `pkg/.venv-x/`, `sub/deep/.env`, `sub/deep/__pycache__/`, `pkg/keep.py` | Mẫu `**/.env*`, `**/.venv*/`, `.git/`, `**/__pycache__/`: `/app` chỉ có `.dockerignore`, `Dockerfile`, `app.py`, `requirements.txt`, `pkg/keep.py` (và thư mục rỗng `sub/deep`); `grep` không thấy key giả. Đối chứng với mẫu cũ `.env*`, `.venv*/`, `.git/`, `__pycache__/`: file ở gốc bị loại, nhưng `pkg/.env.llm` (có key giả), `pkg/.venv/`, `pkg/.venv-x/`, `sub/deep/.env`, `sub/deep/__pycache__/` lọt vào image. Image mới vẫn trả HTTP 200 với `--env-file` |
| `.dockerignore` (bỏ đi, đối chứng) | chạy thật | 2026-10-24 | như trên | Không có `.dockerignore`: `ls -a /app` có `.env.llm`, `.venv`, `__pycache__`; `grep` thấy key giả trong `/app/.env.llm` |
| biến `PYTHONUNBUFFERED` | chạy thật | 2026-10-24 | như trên | Thiếu biến này: `docker logs` rỗng dù ứng dụng đã trả 200. Có biến: hiện hai dòng log của Gradio. Vì vậy Dockerfile của bài có `ENV PYTHONUNBUFFERED=1` |
| `--env-file`: dấu nháy, `#`, CRLF | chạy thật | 2026-10-24 | Docker 29.8.1, image có sẵn `postgres:17-alpine` (chỉ dùng `sh`) | `B="quoted"` cho giá trị `"quoted"` (giữ nháy); `C=x # y` cho `x # y`; dòng `#` bị bỏ; dòng chỉ có `D` lấy giá trị từ shell. File xuống dòng CRLF: `A=plain` cho đúng `plain` (5 byte, không dính ``), `B="quoted"` vẫn giữ nháy |
| khối `sh` đẩy registry (`docker tag`, `docker push`) | đối chiếu | 2026-10-24 | registry cục bộ `registry:3` ở `127.0.0.1:<cổng ngẫu nhiên>` | `docker tag` + `docker push localhost:<cổng>/atlas-chat:1.0` thành công; xóa tag rồi `docker pull` lại được; `/v2/_catalog` = `{"repositories":["atlas-chat"]}`. Chưa đẩy Docker Hub thật (`docker login` cần tài khoản); cú pháp đối chiếu trang [`docker image push`](https://docs.docker.com/reference/cli/docker/image/push/); quyền riêng tư repo mới đối chiếu [Docker Hub settings](https://docs.docker.com/docker-hub/settings/) |
| Phần cloud (triển khai lên dịch vụ) | đối chiếu | 2026-10-24 | | Chưa thử; chỉ đọc [CR]. Gradio 6.30.0 không đọc biến `PORT` (đã `grep` mã nguồn: chỉ đọc `GRADIO_SERVER_PORT`, `GRADIO_SERVER_NAME`), nên `app.vi.py` tự đọc `PORT` |
