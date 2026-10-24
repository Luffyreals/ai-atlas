# Crawl dữ liệu và MongoDB

Bài: `llm/web-crawling-mongodb` (chỉ bản vi, khoảng 10 phút đọc; đợt 2, cần biết trước `python/functions-strings-files`). Quyết định liên quan trong `docs/mvp.md` mục 7: số 53 (code cần mạng là code minh họa, không ghi cứng khóa), 54 (code ở `src/code/llm/web-crawling-mongodb/`, hiện bằng `LocalCode`), 55 (prompt và chuỗi theo ngôn ngữ của bài).

Ngày tra: **24/10/2026**, bằng WebFetch, WebSearch và `curl` tới PyPI. Thẻ nguồn: [PYPI], [RFC], [RP], [GOOG], [REQ], [BS4], [MDB-MODEL], [MDB-INS], [MDB-UPD], [MDB-IDX], [HIQ], [VN-PDPL]. Ý không có thẻ là kiến thức chung hoặc gợi ý của `summarizer`.

## Nguồn

**Phiên bản gói (tra bằng JSON API của PyPI, 24/10/2026) [PYPI]:**

| Gói | Bản mới nhất | Tải lên | Yêu cầu Python |
|---|---|---|---|
| [`requests`](https://pypi.org/project/requests/) | **2.34.2** | 14/05/2026 | `>=3.10` |
| [`beautifulsoup4`](https://pypi.org/project/beautifulsoup4/) | **4.15.0** | 07/06/2026 | `>=3.7.0` |
| [`pymongo`](https://pypi.org/project/pymongo/) | **4.19.0** | 14/10/2026 | `>=3.11` |

Theo chính sách mục 2.6 của `llm-lessons.md`: dòng `pip install` không ghim bản; bản đã chạy thử ghi ở bảng kiểm chứng. Cả ba cùng chạy được với Python 3.14.5 của `.venv-llm/` (chưa cài, chưa chạy). `import` là `bs4` còn tên gói là `beautifulsoup4`: ví dụ cho prop `packages`.

**Crawl và quy tắc:**

- **[RFC]** Koster, M., Illyes, G., Zeller, H., Sassman, L. (2022). [*RFC 9309: Robots Exclusion Protocol*](https://www.rfc-editor.org/rfc/rfc9309.html). IETF, Standards Track, tháng 9/2022. Đã đọc (qua WebFetch tóm tắt), đủ cho phần cần dùng.
- **[RP]** Python Software Foundation. [*urllib.robotparser: Parser for robots.txt*](https://docs.python.org/3/library/urllib.robotparser.html) (thư viện chuẩn).
- **[GOOG]** Google. [*Introduction to robots.txt*](https://developers.google.com/search/docs/crawling-indexing/robots/intro) (Google Search Central). Chỉ dùng cho ý "robots.txt không phải công cụ bảo mật". Đường dẫn con `/robots-txt` mà tôi thử đầu tiên trả 404; link ở trên là link đã đọc được.
- **[REQ]** Reitz, K. và cộng sự. [*Requests: Quickstart*](https://requests.readthedocs.io/en/latest/user/quickstart/).
- **[BS4]** Richardson, L. [*Beautiful Soup Documentation*](https://www.crummy.com/software/BeautifulSoup/bs4/doc/). Đọc 100 000 ký tự đầu của 144 906 (đủ cho cài đặt, parser, `find`, `select`, `get_text`).

**MongoDB và PyMongo:**

- **[MDB-MODEL]** MongoDB. [*Data Modeling Introduction*](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/).
- **[MDB-INS]** MongoDB. [*PyMongo: Insert Documents*](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/crud/insert/).
- **[MDB-UPD]** MongoDB. [*PyMongo: Update Documents*](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/crud/update/).
- **[MDB-IDX]** MongoDB. [*PyMongo: Indexes*](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/indexes/).
- Tài liệu cũ `pymongo.readthedocs.io/.../tutorial.html` chuyển hướng (301) sang trang `.../pymongo-driver/current/get-started/`. Trang `get-started` **chưa đọc**; trang `.../crud/query/retrieve/` (cho `find`) trả **404**. Vì vậy phần `find`/`find_one` chưa có nguồn đọc trực tiếp (xem "Chưa xác minh").

**Pháp lý (nguồn thứ cấp, chỉ để bài nêu "có chuyện này", không phải tư vấn pháp lý):**

- **[HIQ]** Fenwick (2022). [*hiQ Labs Scrapes By Again: The Ninth Circuit Reaffirms that Data-Scraping Does Not Violate the CFAA*](https://www.fenwick.com/insights/publications/hiq-labs-scrapes-by-again-the-ninth-circuit-reaffirms-that-data-scraping-does-not-violate-the-cfaa-1). Bài của hãng luật về vụ *hiQ Labs v. LinkedIn* (Tòa phúc thẩm vùng 9, Hoa Kỳ, 2022). **Chỉ đọc qua kết quả tìm kiếm, chưa mở bài.**
- **[VN-PDPL]** Tilleke & Gibbins. [*Vietnam's New Personal Data Protection Law: A Closer Look*](https://tilleke.com/insights/vietnams-new-personal-data-protection-law-a-closer-look). Về Luật 91/2025/QH15. **Chỉ đọc qua kết quả tìm kiếm, chưa mở bài.** Chưa có bản văn pháp luật chính thức (xem "Chưa xác minh").

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| `find()`, `find_one()` của PyMongo (cú pháp bộ lọc, trả về con trỏ) | Trang truy vấn trả 404; `get-started` chưa mở. | `reviewer` chạy thật với MongoDB trong Docker rồi mới ghi mức "chạy thật". Trước đó bài chỉ dùng cú pháp `collection.find({"field": value})` và `find_one` ở mức phổ biến, và dẫn link trang chủ driver. |
| `InsertOneResult.inserted_id`, `InsertManyResult.inserted_ids`, ngoại lệ `DuplicateKeyError` và `BulkWriteError` | [MDB-INS] không nêu. Trang [MDB-IDX] gọi lỗi trùng khóa là `DuplicateKeyException` (có vẻ tên theo ngôn ngữ khác); tên lớp trong PyMongo là `pymongo.errors.DuplicateKeyError` theo hiểu biết chung. | Chạy thử trước khi viết tên lớp ngoại lệ vào code. |
| `$setOnInsert` | [MDB-UPD] không nhắc. | Không dùng trong bài, hoặc kiểm riêng ở tài liệu MongoDB Manual. |
| Trường `_id` và `ObjectId` | [MDB-MODEL] không nói. [MDB-INS] nói driver tự sinh `ObjectId` nếu không đặt. | Đủ cho bài. |
| `RobotFileParser.read()` với 401/403 (cấm hết) và 4xx khác (cho phép hết) | [RP] không ghi; thông tin lấy từ mã nguồn CPython qua WebFetch. **Không** khớp hoàn toàn với RFC 9309 (RFC nói mọi 4xx là "unavailable", được truy cập tự do). | Chạy thử bằng `RobotFileParser.parse()` với dòng cho sẵn thì không cần mạng. Chỉ nói về 401/403 khi đã kiểm trên bản Python dùng để chạy thử. |
| `urllib.robotparser` có hiểu ký tự đại diện `*` và `$` của RFC 9309 hay không | Chưa tra. | Không khẳng định. Bài chỉ dùng quy tắc đơn giản (`Disallow: /path/`). Kiểm bằng thử nghiệm nếu muốn nói. |
| Kết cục dài hạn của *hiQ v. LinkedIn* sau 2022 | Kết quả tìm kiếm không có diễn biến sau 2022. | Chỉ nói "tòa phúc thẩm năm 2022 cho rằng việc lấy dữ liệu công khai không tự động vi phạm đạo luật CFAA, nhưng điều khoản dịch vụ và luật khác vẫn có thể áp dụng". Không nói "scraping hợp pháp". |
| Luật 91/2025/QH15: ngày hiệu lực chính xác, điều khoản cụ thể | Nguồn thứ cấp nêu: Quốc hội thông qua 26/06/2025; Nghị định 356/2025/NĐ-CP ban hành 31/12/2025, có hiệu lực 01/01/2026 (không rõ đoạn nào nói chính luật hiệu lực lúc nào). Chưa đọc văn bản gốc. | Bài chỉ nêu "Việt Nam có luật bảo vệ dữ liệu cá nhân mới (2025)" và khuyên đọc văn bản gốc; không trích điều khoản. Tìm bản gốc trên cổng thông tin chính thức của Quốc hội trước khi viết nhiều hơn. |
| Luật của EU về khai thác văn bản và dữ liệu (TDM, DSM Directive Điều 4) và luật bản quyền Việt Nam về dữ liệu crawl | Chưa tra. | Không viết. Bài chỉ nói "bản quyền nội dung và điều khoản dịch vụ là hai việc riêng; hỏi chuyên gia khi dùng thương mại". |
| Giới hạn tốc độ "đủ lịch sự" là bao nhiêu giây | Không có nguồn chính thức. [RP] có `crawl_delay`, `request_rate` (thêm ở Python 3.6) nhưng RFC 9309 **không** nói về `Crawl-delay`. | Bài nêu 1 giây giữa hai yêu cầu như **gợi ý của bài**, không phải chuẩn, và nói đọc `crawl_delay` của site nếu có. |
| Chạy code với MongoDB thật | Máy có Docker CLI 29.8.1, chưa có MongoDB (llm-lessons.md 2.5). Chưa chạy gì. | `reviewer` chạy bằng container (kiểm `docker info` trước); nếu không được, mức là `chạy khô` hoặc `đối chiếu`, và bài không có "Kết quả mẫu" cho phần MongoDB. |

## Ý chính

- **Mục tiêu của bài:** dữ liệu crawl là nguyên liệu cho RAG (bài `rag-chatbot`, đợt 3). Luồng: tải trang, bóc phần chữ có ích, lưu thành tài liệu có metadata (url, tiêu đề, thời gian lấy), rồi sau đó cắt đoạn và tạo embedding ở bài khác. Bài này dừng ở bước lưu trữ. Nhấn mạnh **đạo đức và pháp lý ngay từ đầu**, trước khi cho người đọc thấy dòng `requests.get` đầu tiên.
- **`requests` [REQ]:** `requests.get(url, headers=..., timeout=...)`. **Luôn đặt `timeout`**: không đặt thì yêu cầu không bao giờ hết giờ và chương trình có thể treo vô hạn; tài liệu viết rằng gần như mọi mã chạy thật nên có tham số này. `timeout` tính theo khoảng im lặng của socket, không phải tổng thời gian tải. `raise_for_status()` ném `HTTPError` với 4xx/5xx; lỗi mạng là `ConnectionError`, quá giờ là `Timeout`, đều kế thừa `RequestException`. `r.text` giải mã theo mã hóa `requests` đoán từ header; trang tiếng Việt sai dấu thường do đoán sai mã hóa, sửa bằng `r.encoding`.
- **`User-Agent` [REQ, suy ra]:** tự đặt header `User-Agent` mô tả bạn là ai và liên hệ ở đâu (ví dụ tên dự án và email hoặc URL), thay vì giả làm trình duyệt. Tài liệu `requests` chỉ nói cách đặt header; việc "nên khai báo trung thực" là khuyến nghị thực hành của bài, không phải nội dung của tài liệu.
- **BeautifulSoup [BS4]:** cài `beautifulsoup4` (đừng cài gói `BeautifulSoup`, đó là bản 3 cũ). Ba parser: `html.parser` (có sẵn trong Python, vừa đủ cho bài), `lxml` (nhanh, cần gói C ngoài), `html5lib` (rất khoan dung, rất chậm). `find()` trả thẻ đầu tiên hoặc `None`; `find_all()` trả danh sách; `select()` dùng bộ chọn CSS và trả danh sách, `select_one()` trả một. `get_text(strip=True)` lấy chữ; `thẻ.get("href")` lấy thuộc tính. Hệ quả: luôn kiểm tra `None` trước khi `.get_text()`. Bài chỉ dùng `html.parser` để không thêm gói C.
- **robots.txt [RFC]:** tệp tại `/robots.txt` ở gốc site, UTF-8, `text/plain`. Mỗi nhóm có `User-agent` và các dòng `Allow`/`Disallow`. Crawler chọn nhóm theo tên sản phẩm (không phân biệt hoa thường), không có thì dùng nhóm `*`, không có cả hai thì không có quy tắc. Quy tắc khớp theo **tiền tố đường dẫn, phân biệt hoa thường**, quy tắc **dài nhất** (cụ thể nhất) thắng; không quy tắc nào khớp thì được phép. Xử lý trạng thái HTTP: tải được thì theo quy tắc; **4xx** nghĩa là "không có tệp", crawler được truy cập tự do; **5xx** nghĩa là "không với tới", crawler phải coi như **cấm hết**. Có thể lưu đệm, không quá khoảng 24 giờ trừ khi tệp không với tới được. Crawler nên đọc ít nhất 500 KiB đầu của tệp.
- **robots.txt không phải là cấp quyền hay bảo mật [RFC, GOOG]:** RFC nói rõ đây không phải hình thức cho phép truy cập, và các đường dẫn trong tệp ai cũng đọc được. Với nội dung cần bảo vệ phải dùng xác thực. Google nói robots.txt chỉ để quản lý lưu lượng crawler, không phải cách gỡ trang khỏi tìm kiếm, và crawler tử tế mới tuân theo. Hai hệ quả cho bài: (1) tuân thủ robots.txt là cần nhưng chưa đủ; (2) **không phải mọi thứ robots.txt cho phép thì bạn được phép dùng** (điều khoản dịch vụ, bản quyền, dữ liệu cá nhân là các lớp khác).
- **`urllib.robotparser` [RP]:** `RobotFileParser`, `set_url(url)`, `read()` (tải và phân tích), `parse(lines)` (phân tích dòng cho sẵn, không cần mạng), `can_fetch(useragent, url)` trả `True/False`, `crawl_delay(useragent)` và `request_rate(useragent)` (từ Python 3.6), `site_maps()` (từ 3.8). Hàm `parse` rất hợp để đưa ví dụ chạy không cần mạng, nhờ vậy ô `PythonRunner` (nếu có) chạy được trên Pyodide.
- **Điều khoản dịch vụ và giới hạn tốc độ (kiến thức chung):** nhiều site cấm crawl trong điều khoản; đọc điều khoản trước khi chạy. Giãn cách giữa các yêu cầu (`time.sleep`), tải ít, dừng khi gặp 429 hoặc 503, không chạy song song nhiều luồng lên một site nhỏ. Ưu tiên nguồn cho phép dữ liệu một cách rõ ràng: API chính thức, dữ liệu mở có giấy phép, sitemap.
- **Pháp lý (nguồn thứ cấp, nói thận trọng):** pháp luật khác nhau theo nước. Ví dụ: ở Mỹ, vụ *hiQ v. LinkedIn* năm 2022 cho thấy tòa phúc thẩm vùng 9 đọc đạo luật CFAA theo nghĩa hẹp với dữ liệu công khai [HIQ]; nhưng điều đó **không** có nghĩa crawl luôn hợp pháp (điều khoản dịch vụ, bản quyền, luật khác). Ở Việt Nam, luật bảo vệ dữ liệu cá nhân mới (2025) siết việc xử lý dữ liệu cá nhân [VN-PDPL]. Thông điệp: tránh thu thập dữ liệu cá nhân (tên, email, số điện thoại, ảnh của người thật), và bài không đưa lời khuyên pháp lý.
- **Mô hình document của MongoDB [MDB-MODEL]:** dữ liệu là các **document** (cặp khóa–giá trị kiểu BSON, có thể lồng document và mảng), nhóm vào **collection**. Các document trong cùng collection không cần cùng tập trường (schema linh hoạt), nên một trang crawl lưu thẳng thành một document, dù trang này có thêm trường mà trang kia không có. Nguyên tắc thiết kế: dữ liệu hay được đọc cùng nhau thì lưu cùng nhau. Mỗi document có `_id` duy nhất; nếu bạn không đặt, driver tự sinh `ObjectId` [MDB-INS].
- **Ghi dữ liệu [MDB-INS]:** `insert_one(doc)` thêm một document; `insert_many([doc, ...])` thêm danh sách. Với `insert_many`, `ordered=True` mặc định: gặp lỗi là các lần chèn còn lại bị hủy.
- **Chỉ mục duy nhất [MDB-IDX]:** `collection.create_index("url", unique=True)` làm cho hai document không thể có cùng `url`; ghi trùng sẽ gây lỗi trùng khóa (server báo `E11000 duplicate key error`). MongoDB luôn tạo chỉ mục duy nhất trên `_id`. Ứng dụng cho crawl: không lưu cùng một trang hai lần.
- **Upsert [MDB-UPD]:** `update_one(bộ_lọc, {"$set": {...}}, upsert=True)`; mặc định `upsert=False`. Có thì tìm theo bộ lọc, **cập nhật nếu có, thêm mới nếu không**. Kết quả `UpdateResult` có `matched_count`, `modified_count`, `upserted_id` (khác `None` khi vừa thêm mới). Chạy lại crawler nhiều lần thì không sinh bản trùng (kết hợp lọc theo `url`). Bài nên đặt cạnh nhau hai cách chống trùng: chỉ mục duy nhất (bắt lỗi) và upsert (không gây lỗi).
- **Kết nối:** `MongoClient(uri)` với chuỗi kết nối đọc từ biến môi trường, ví dụ `MONGODB_URI` (đặt theo khuôn `<TÊN>` như `EMBEDDING_MODEL` ở llm-lessons.md 2.3; **thêm một biến mới, ghi trong lời văn**). Không ghi cứng chuỗi kết nối vì chuỗi này thường chứa mật khẩu (luật `code-secrets`). Máy cục bộ chạy bằng Docker; `docker-cloud` dạy Docker ở đợt 3 nên bài này chỉ cho **một dòng lệnh** `docker run` và không giải thích Docker (chưa có nguồn chính thức đã đọc cho dòng lệnh này; xem mục kiểm chứng).

## Công thức quan trọng

Không có công thức. Bài này không dùng KaTeX.

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; chỗ ghi "(gợi ý)" là của `summarizer`.

- **Crawler như khách vào cửa hàng (gợi ý):** robots.txt là biển "khu vực nhân viên" ở cửa, không phải ổ khóa. Biển không chặn được ai, nhưng người lịch sự đọc biển; và việc biển không cấm một khu vực không có nghĩa bạn được chụp ảnh hết hàng hóa mang về.
- **Giãn cách yêu cầu (gợi ý):** một người đọc nhanh vài trang là bình thường; một chương trình gửi hàng trăm yêu cầu mỗi giây giống đám đông chen vào cùng lúc, có thể làm sập site nhỏ. `time.sleep` và `timeout` là hai thói quen đầu tiên.
- **Document như tờ phiếu (gợi ý):** mỗi trang web là một tờ phiếu ghi tên trang, địa chỉ, nội dung, giờ lấy. Phiếu này có thêm ô "tác giả", phiếu kia không, cũng không sao; khác bảng SQL, nơi mọi dòng phải cùng cột.
- **Chỉ mục duy nhất như danh bạ không cho trùng số (gợi ý):** upsert như "nếu số đã có thì sửa dòng, chưa có thì thêm dòng".
- **Từ crawl tới RAG (gợi ý):** dữ liệu crawl chưa dùng được ngay. Phải làm sạch chữ, bỏ menu và quảng cáo, giữ url để trích nguồn khi chatbot trả lời. Lưu `url` và thời gian lấy từ đầu để sau này còn dẫn nguồn và biết dữ liệu cũ hay mới.
- **Ví dụ chạy không cần mạng (gợi ý, cho `PythonRunner`):** đưa sẵn một chuỗi robots.txt gồm vài dòng, gọi `RobotFileParser().parse(lines)` rồi `can_fetch("my-bot", "https://example.com/private/x")` và `can_fetch(..., "/public/")`. Sau đó đưa một đoạn HTML ngắn dạng chuỗi vào `BeautifulSoup(html, "html.parser")` để bóc tiêu đề và liên kết. (`beautifulsoup4` có trong danh sách gói Pyodide hay không **chưa xác minh**; dự án chỉ cho phép `numpy`, `pandas`, `matplotlib`, `scipy`, `scikit-learn`, nên phần BeautifulSoup có lẽ phải là `LocalCode`, còn phần `robotparser` (thư viện chuẩn) là ứng viên cho `PythonRunner`.)
- **Site thực hành:** nên thử trên site được thiết kế để cào thử và cho phép việc đó, hoặc trên HTML chuỗi sẵn. Tôi **chưa kiểm** site nào cụ thể là còn hoạt động và cho phép crawl, nên chưa gợi ý tên. `lesson-writer` hoặc `reviewer` kiểm điều khoản trước khi đưa URL vào bài; tránh crawl trang của người thật.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **"Công khai thì được lấy."** Không: dữ liệu công khai vẫn có thể bị bản quyền, điều khoản dịch vụ và luật dữ liệu cá nhân chi phối. Nhìn thấy được không đồng nghĩa với được dùng [RFC, HIQ].
2. **"robots.txt cho phép nghĩa là mọi thứ ổn."** Nó chỉ là một lớp quy ước về truy cập của crawler, không cấp quyền [RFC].
3. **"robots.txt là bảo mật."** Không: ai cũng đọc được tệp và crawler xấu bỏ qua nó. Nội dung nhạy cảm cần xác thực [RFC, GOOG].
4. **Quên `timeout`.** Chương trình treo vĩnh viễn khi server không trả lời [REQ].
5. **Không kiểm tra mã trạng thái.** Tải được trang lỗi 404 hay trang chặn bot rồi lưu như dữ liệu thật; dùng `raise_for_status()` hoặc kiểm `status_code` [REQ].
6. **Tin `r.text` luôn đúng mã hóa.** Chữ tiếng Việt vỡ dấu khi mã hóa đoán sai [REQ].
7. **`soup.find(...)` trả `None` mà vẫn gọi `.get_text()`.** `AttributeError`. Kiểm tra trước [BS4].
8. **Cài nhầm gói `BeautifulSoup`** thay vì `beautifulsoup4` [BS4].
9. **Giả làm trình duyệt để lách chặn.** Vừa không trung thực, vừa dễ vi phạm điều khoản. Khai báo `User-Agent` trung thực; nếu bị chặn thì dừng và hỏi chủ site hoặc dùng API.
10. **Chạy vòng lặp không giãn cách.** Đây là cách làm sập site và dễ bị cấm IP; thêm `time.sleep`, giới hạn số trang, dừng khi 429/503.
11. **Thu thập dữ liệu cá nhân "cho tiện".** Email, số điện thoại, ảnh người thật; tránh ngay từ đầu, và không đưa vào RAG [VN-PDPL, thứ cấp].
12. **Cho rằng MongoDB không cần suy nghĩ về cấu trúc vì "không có schema".** Schema linh hoạt không có nghĩa nên lưu lung tung; thống nhất tên trường (`url`, `title`, `text`, `fetched_at`) để truy vấn được [MDB-MODEL].
13. **Chèn trùng khi chạy lại crawler.** Không có chỉ mục duy nhất hay upsert thì chạy lại là trùng; có chỉ mục duy nhất thì `insert_one` ném lỗi, cần bắt hoặc dùng upsert [MDB-IDX, MDB-UPD].
14. **Nhầm `insert_many` ordered:** một document lỗi chặn các document sau [MDB-INS].
15. **Lộ chuỗi kết nối MongoDB.** Chuỗi có mật khẩu; đọc từ biến môi trường, không đưa vào Git (cùng nguyên tắc với API key).
16. **Quên rằng upsert cần bộ lọc đúng.** Lọc sai thì mỗi lần chạy sinh một document mới. Lọc theo trường có chỉ mục duy nhất (`url`).
17. **Crawl mà không lưu url và ngày lấy.** Về sau không dẫn nguồn được trong RAG và không biết dữ liệu đã cũ chưa.

## Liên quan tới bài nào

- **Cần biết trước:** `python/functions-strings-files` (theo `roadmap.ts`: hàm, chuỗi, tệp, dùng ở phần bóc chữ và lưu).
- **Hẹn bài sau:** `llm/rag-chatbot` (dùng dữ liệu đã lưu), `llm/pretraining-data` (làm sạch, khử trùng lặp; đợt 3 cùng đợt với `rag-chatbot`), `llm/docker-cloud` (chạy MongoDB trong container; bài này chỉ một dòng lệnh).
- **Cùng đợt (không gắn link):** `gradio-streamlit`, `prompt-engineering`, `image-video-api`.
- **Giáo án gốc:** buổi 7 của phần LLM là "MongoDB + Data Crawl" (dòng 78 của `giáo án ai.md`; chỉ tham khảo). Nội dung giáo án khớp phạm vi bài.
- **Có thể link:** `llm/text-api` (đợt 0) khi nhắc biến môi trường và nguyên tắc không ghi cứng khóa.

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Crawl dữ liệu (thu thập trang web) | Web crawling | Giữ "crawl", gloss một lần |
| Bóc tách dữ liệu từ trang web | Web scraping | Gloss; phân biệt: crawl là đi theo liên kết, scrape là lấy dữ liệu |
| Giao thức loại trừ robot | Robots Exclusion Protocol (robots.txt) | Giữ "robots.txt" |
| Điều khoản dịch vụ | Terms of Service (ToS) | Dịch |
| Giới hạn tốc độ | Rate limiting | Đã có "rate limit" ở `text-api`; thống nhất với glossary |
| Cơ sở dữ liệu tài liệu | Document database | Dịch, gloss |
| Collection (bộ sưu tập) | Collection | Giữ "collection" |
| Document (tài liệu) | Document | Giữ "document", nhưng nhắc không nhầm với tài liệu văn bản |
| Chỉ mục | Index | Dịch |
| Chèn hoặc cập nhật | Upsert | Giữ "upsert", gloss "update + insert" |
| Chuỗi kết nối | Connection string | Dịch |

## Kiểm chứng code

Lần đầu do `lesson-writer` chạy, `content-reviewer` chạy lại toàn bộ ngày 2026-10-24, rồi `lesson-writer` sửa theo review và chạy lại các file đã đổi cùng ngày. Thư mục làm việc ở scratchpad, Python gọi bằng `-I -X utf8` (`-X utf8` chỉ để cửa sổ dòng lệnh Windows in được chữ có dấu). Không crawl site thật.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `robots.vi.py`, `robots.en.py` | chạy thật | 2026-10-24 | **Pyodide 314.0.7 thật (Python 3.14.2)** qua `runpyo.mjs`; CPython 3.12.10, 3.13.14, 3.14.2, 3.14.5 | Cùng output ở mọi bản: `/`, `/blog/rag`, `/Admin/users` là `True`; `/admin/users`, `/search?q=ai`, `/searching-tips` là `False`; `crawl delay: 2`; BadBot `False`. Luật chọn quy tắc của `robotparser` đổi trong các bản vá 2026 (gh-138907, https://github.com/python/cpython/pull/149374): 3.13.14, 3.14.5 chọn quy tắc dài nhất và hiểu `*`, `$`; 3.12.10, 3.14.2 (bản của ô trên trang) xét theo thứ tự, khớp đầu tiên thắng. Ví dụ không có quy tắc chồng nhau nên không bị ảnh hưởng. Code không đổi trong lần sửa |
| `parse-html.vi.py`, `.en.py` | chạy thật | 2026-10-24 | `.venv-llm` Python 3.14.5, beautifulsoup4 4.15.0, soupsieve 3.0.4 | HTML nhúng sẵn. Lần sửa đổi dòng 32 sang `p.get_text(" ", strip=True)`; chạy lại, output không đổi (các `<p>` không có thẻ con). Kết quả mẫu trong bài khớp, `sampleVaries={false}` |
| `crawl.vi.py`, `.en.py` | chạy thật | 2026-10-24 | `.venv-llm` Python 3.14.5, requests 2.34.2, beautifulsoup4 4.15.0 | Chạy với server `http.server` cục bộ, không crawl site thật. Reviewer: harness `http.server` cục bộ, 7 kịch bản; phát hiện `BeautifulSoup(r.text)` vỡ dấu khi server không khai charset. Sau khi sửa (`BeautifulSoup(r.content)`, robots.txt giải mã `r.content.decode("utf-8", "replace")`, 429 khi tải robots.txt coi như cấm hết), chạy lại 9 kịch bản robots.txt: 200 có dòng comment tiếng Việt, gửi không kèm charset (đọc đúng, `/trang-khong-co/` bị cấm), `Crawl-delay: 2` (chờ 2 s), nhóm riêng cho `atlas-tutorial-bot` (cấm hết, chỉ 1 yêu cầu), 404 và 403 (cho phép hết; 1 trang lưu, trang 404 không lưu, giãn cách 1 s), 429, 500, 503 và cổng đóng (cấm hết, không tải trang nào). Trang `/` là HTML UTF-8 có `<meta charset>`, header không có charset: tiêu đề và chữ có dấu đúng; bản `r.text` cũ cho `Trang chá»§…`. Server nhận đúng `User-Agent`. Bản `.en.py` cho kết quả tương ứng. Không có kết quả mẫu (phụ thuộc site) |
| `save.vi.py`, `.en.py` | chạy thật | 2026-10-24 | `.venv-llm` Python 3.14.5, pymongo 4.19.0; **MongoDB 8.3.13** (`docker run -d --rm -p 127.0.0.1:<cổng>:27017 mongo:8`) | Reviewer chạy với server thật: `DuplicateKeyError` bắt được, upsert A khớp 1, upsert C thêm mới, 3 document, `find`/`find_one` đúng. Output tất định, chép vào Kết quả mẫu của bài (`sampleVaries={false}`). Chạy khô: thiếu biến thì `KeyError: 'MONGODB_URI'`; server không có thì `ServerSelectionTimeoutError` sau khoảng 5 s. Code không đổi trong lần sửa |
| khối `sh` (`docker run`) trong bài | chạy thật (reviewer) | 2026-10-24 | Docker, image `mongo:8` (8.3.13) | Cổng 27017, mặc định không bật xác thực; bài chỉ mở `127.0.0.1` |

Cặp `.vi.py`/`.en.py`: so bằng `tokenize` sau khi bỏ comment và nội dung chuỗi (luật mục 2.4 của `llm-lessons.md`): cả 4 cặp giống nhau, cùng số dòng. `ast.parse(..., feature_version=(3, 10))` qua cho cả 8 file; dài nhất 59 dòng (`crawl`), dòng dài nhất 77 ký tự.

Gói cần thêm vào `scripts/requirements-llm.txt` (phiên chính làm), bản đã chạy thử trong `.venv-llm`: `requests==2.34.2`, `beautifulsoup4==4.15.0`, `pymongo==4.19.0` (kéo theo `soupsieve` 3.0.4 cho `select`).

## Đọc thêm đề xuất

1. [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html) (Koster và cộng sự, 2022).
2. [`urllib.robotparser`](https://docs.python.org/3/library/urllib.robotparser.html), tài liệu Python.
3. [Requests: Quickstart](https://requests.readthedocs.io/en/latest/user/quickstart/) và [Beautiful Soup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/).
4. [PyMongo: Insert](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/crud/insert/), [Update](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/crud/update/), [Indexes](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/indexes/).
5. [Data Modeling Introduction](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/), tài liệu MongoDB.
