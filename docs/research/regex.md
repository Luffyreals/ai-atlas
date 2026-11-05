# Biểu thức chính quy (Regex)

Bài: `nlp/regex` (chỉ bản vi, bài đầu của phần NLP). Bài cần biết trước trong roadmap: `python/functions-strings-files` (chưa xuất bản, nên có "Nhắc nhanh" về chuỗi và chuỗi thô). Hai ô `PythonRunner` (chỉ `re`, `unicodedata`), không có `LocalCode`, không có VIZ/FIG mới; mục Minh họa là hai bảng tách mẫu.

Ngày tra: **05/11/2026**. Cách tra: WebFetch trang tài liệu Python 3.14, trang mục lục SLP3, bài của Russ Cox; tải PDF chương 2 SLP3 rồi trích chữ bằng `pdftotext`; tìm kiếm web cho bản ghi nhớ RAND của Kleene. Ý không có thẻ nguồn là kiến thức chung hoặc tự chạy.

## Nguồn

- **[JM]** Jurafsky, D., Martin, J. H. *Speech and Language Processing*, bản nháp lần 3, **ngày 19/8/2026** ([trang sách](https://web.stanford.edu/~jurafsky/slp3/), chương 2 là [2.pdf](https://web.stanford.edu/~jurafsky/slp3/2.pdf)). Ở bản này chương 2 tên là **"Words and Tokens"** (không còn tên "Regular Expressions, Text Normalization, Edit Distance" như các bản cũ); regex ở **mục 2.6** (2.6.1–2.6.9). Đã đọc cả mục 2.6 và phần ghi chú lịch sử cuối chương.
- **[PY]** Python Software Foundation. [*re — Regular expression operations*](https://docs.python.org/3.14/library/re.html), Python 3.14. Đã đọc mục `\w`, `\d`, `\b`, lượng từ lười, cờ `ASCII`, lookbehind, chuỗi thô, `findall`, lượng từ sở hữu.
- **[HOWTO]** Kuchling, A. M. [*Regular Expression HOWTO*](https://docs.python.org/3.14/howto/regex.html), Python 3.14. Chỉ dùng làm "Đọc thêm"; chưa trích ý riêng.
- **[COX]** Cox, R. (01/2007). [*Regular Expression Matching Can Be Simple And Fast (but is slow in Java, Perl, PHP, Python, Ruby, ...)*](https://swtch.com/~rsc/regexp/regexp1.html). Đã đọc phần về quay lui hàm mũ và cách mô phỏng NFA của Thompson.
- **[TH]** Thompson, K. (1968). *Regular expression search algorithm*. *Communications of the ACM* 11(6): 419–422. [doi:10.1145/363347.363387](https://doi.org/10.1145/363347.363387). Trang ACM trả 403 khi WebFetch; thông tin thư mục lấy từ danh mục tham khảo của [JM] (khớp DOI). **Chưa đọc bài gốc.**
- **[KL]** Kleene, S. C. (15/12/1951). *Representation of Events in Nerve Nets and Finite Automata*. RAND RM-704 ([trang RAND](https://www.rand.org/pubs/research_memoranda/RM704.html); WebFetch bị 403, có trong kết quả tìm kiếm cùng bản quét DTIC). In lại trong *Automata Studies* (Annals of Mathematics Studies 34, Princeton, 1956), tr. 3–42 theo mục lục JSTOR. **Chưa đọc bài gốc**; ý "Kleene 1951; 1956 first defined regular expressions and the finite automaton" lấy từ ghi chú lịch sử của [JM].

## Ý chính dùng trong bài

- **Regex là ký hiệu đại số mô tả một tập chuỗi** [JM 2.6]. [JM] dùng chuỗi thô `r"..."` của Python cho mọi ví dụ.
- **Kleene star, Kleene plus, `{n}`, `.`** [JM 2.6.2]. Lượng từ mặc định tham lam, `*?`, `+?` là lười [JM 2.6.4]; ví dụ `<.*>` trên `'<a> b <c>'` khớp cả chuỗi, `<.*?>` chỉ khớp `'<a>'` [PY]. Bài dùng ví dụ HTML tiếng Việt riêng.
- **Neo `^`, `$`, `\b`** [JM 2.6.3]. `\b` của Python là ranh giới giữa `\w` và `\W` hoặc đầu, cuối chuỗi [PY].
- **Nhóm, `|`, độ ưu tiên, nhóm không bắt `(?:...)`, thay thế bằng nhóm bắt** [JM 2.6.4, 2.6.7]; lookahead `(?=...)`, `(?!...)` có độ rộng 0 [JM 2.6.8].
- **Dương tính giả, âm tính giả; precision và recall đối nghịch nhau** [JM 2.6.5, ví dụ `the`]. Bài dùng ví dụ ngày 31/02 và số tài khoản thay cho `the`.
- **ELIZA (Weizenbaum, 1966)** là chuỗi phép thay regex; "I need X" → "What would it mean to you if you got X?" [JM mở đầu chương và 2.6.7].
- **Regex trong tiền tách từ (pre-tokenization) của BPE, ví dụ GPT-2** [JM 2.6.9]; dùng thư viện ngoài `regex` (có `\p{L}`), không phải `re`. Bài chỉ nhắc ý "tokenizer dùng regex để cắt trước", để bài `tokenization` dạy tiếp.
- **`\w` trong Python 3 với `str`:** "Matches Unicode word characters; this includes all Unicode alphanumeric characters (as defined by `str.isalnum()`), as well as the underscore"; với cờ ASCII thì là `[a-zA-Z0-9_]` [PY]. **Khác [JM] Hình 2.13**, nơi `\w` ghi là `[a-zA-Z0-9_]`. Bài nói rõ chỗ khác này.
- **`\d` trong Python 3** khớp mọi chữ số Unicode loại Nd [PY].
- **Lookbehind phải khớp chuỗi độ dài cố định** [PY]; tự chạy: `re.compile(r"(?<!\d+)")` báo `look-behind requires fixed-width pattern`.
- **`findall` đổi dạng theo số nhóm** (0 nhóm: chuỗi; 1 nhóm: nhóm; nhiều nhóm: tuple) [PY].
- **Lượng từ sở hữu và nhóm nguyên tử** có từ Python 3.11 [PY]. Bài không dạy, chỉ khuyên viết lại mẫu.
- **Quay lui hàm mũ** [COX]: bộ máy quay lui của Perl, PCRE, Python, Ruby có thể tốn $O(2^n)$; mô phỏng NFA của Thompson [TH] chạy tuyến tính theo độ dài đầu vào. Ví dụ của Cox là `a?^n a^n`; bài dùng `(a+)+$` (ví dụ ReDoS quen thuộc), số tự đo bên dưới.
- **Lịch sử:** Kleene 1951/1956 định nghĩa regex và ôtômat hữu hạn; Thompson (1968) đưa trình biên dịch regex vào trình soạn thảo; lệnh `g/regular expression/p` của `ed` về sau thành `grep` [JM, ghi chú lịch sử]. Trình soạn thảo của [TH] là QED (CTSS, IBM 7094); `ed` và `grep` không dùng thuật toán mô phỏng NFA mà dùng quay lui [COX]. Định nghĩa trong bài: viên gạch cơ sở gồm chữ cái đơn lẻ, $\varepsilon$, $\varnothing$ (định nghĩa sách giáo khoa chuẩn; ký hiệu của chính Kleene khác).
- **Đầu số di động Việt Nam:** sau đợt chuyển thuê bao 11 số về 10 số năm 2018, đầu số di động bắt đầu bằng 03, 05, 07, 08, 09. Kiến thức chung, **chưa đối chiếu văn bản của Bộ Thông tin và Truyền thông**; bài chỉ dùng như ví dụ, và hộp Lỗi hay gặp cuối ghi rõ mẫu không phủ số cố định.

## Số tự tính và tự đo

- Số cách chia $n$ chữ `a` thành các lượt khác rỗng: giữa mỗi cặp chữ kề nhau, cắt hoặc không, nên $2^{n-1}$.
- Đo `re.compile(r"(a+)+$").search("a" * n + "b")` trên CPython 3.14.5 (Windows, máy phát triển), 05/11/2026: $n$ = 16: 0.006 s; 18: 0.023 s; 20: 0.092 s; 22: 0.410 s; 24: 1.731 s. Mỗi +2 chữ `a` khoảng ×4, tức ×2 mỗi chữ. `a+$` trên cùng chuỗi: dưới 10 µs. Bài và quiz 5 dùng "24 chữ `a` khoảng 1.7 giây"; $1.7 \times 2^6 \approx 109$ giây cho 30 chữ `a`. Không chạy trên Pyodide (có thể treo trang).
- Các ví dụ ngắn trong lời văn và quiz, chạy bằng CPython 3.14.5:
  - `re.findall(r"\d{2}/\d{2}/\d{4}", "Hạn 5/11/2026 và 15/11/2026")` → `['15/11/2026']`
  - `re.findall(r'".*"', 'Anh nói "chào" rồi "tạm biệt"')` → `['"chào" rồi "tạm biệt"']`; bản `".*?"` → `['"chào"', '"tạm biệt"']`
  - `re.findall(r"[a-zA-Z]+", "Đà Lạt")` → `['L', 't']`
  - `re.findall("\bHà\b", "Hà Nội")` → `[]`; bản chuỗi thô → `['Hà']`; `len("\b")` = 1
  - `"\d"` trong chuỗi thường: `SyntaxWarning: "\d" is an invalid escape sequence. Such sequences will not work in the future.`
  - `re.match(r"\d+", "Giá 12 triệu")` → `None`; `re.search(...)` → `'12'`
  - mẫu `DATE` trên `"31/02/2026 99/99/2026"` → `[('31', '02', '2026'), ('99', '99', '2026')]`
  - `re.findall(r"[^\W\d_]+", "Phở12_bò")` → `['Phở', 'bò']`
  - `re.findall(r"\b\+84", "gọi +84987")` → `[]`
  - `re.search(r"Wave", "Bán xe Wave 2019").span()` → `(7, 11)`
  - `re.findall(r"(\w+) \1", "rất rất vui")` → `['rất']`
  - tách bằng `split()` rồi giữ mảnh `isdigit()` trên tin rao vặt → `['12', '0912', '345', '678', '1903456789123']` (không có '2019' vì dính dấu phẩy)
  - mẫu `PHONE` trên "+84 912 345 678", "0912-345-678", "091 234 5678", "84912345678" → `[]` cả bốn (âm tính giả)
  - `re.findall(r"ha+", "haaa hahaha")` → `['haaa', 'ha', 'ha', 'ha']`; `(?:ha)+` trên "hahaha" → `['hahaha']`
  - `re.findall(r"\d+", "३४ 12")` → `['३४', '12']` (chữ số Devanagari; bài thay ví dụ `٣٤` bằng ví dụ này)
  - `datetime.date(2026, 2, 31)` → `ValueError: day 31 must be in range 1..28 for month 2 in year 2026`

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Nội dung [TH], [KL] | Trang ACM và RAND trả 403 cho WebFetch; chưa đọc bài gốc | Chỉ dùng ý lịch sử theo [JM]; link DOI và trang RAND để người đọc tự tra |
| ~~Trình soạn thảo trong [TH]~~ | **Đã xác minh** (review 05/11/2026): [COX] viết "Thompson's regular expression implementation was for his QED editor running on the CTSS operating system on the IBM 7094", và "Thompson chose not to use his algorithm when implementing the text editor ed"; `ed` và `grep` (Fourth Edition, 1973) dùng quay lui đệ quy | Bài ghi QED, rồi nói `ed`, `grep` và `re` của Python tìm khớp bằng quay lui, nối sang mục Giới hạn |
| Đầu số di động 2018 | Kiến thức chung | Ghi là ví dụ; hộp Lỗi hay gặp nói mẫu chỉ đúng với đầu số di động |

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc ở scratchpad. Cả bốn file qua `ast.parse(..., feature_version=(3, 10))`; mỗi `.en.py` là bản sao y nguyên của `.vi.py` (chưa dịch comment). Dòng dài nhất 73 ký tự.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `extract.vi.py`, `extract.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2) | 33 dòng, 9 ms. `phones: ['0912 345 678', '+84987654321']`; `emails: ['nam.nguyen@gmail.com']`; `dates:  [('05', '11', '2026'), ('15', '11', '2026')]`; `no guard: ['0912 345 678', '+84987654321', '0345678912']`; dòng cuối: hai số thành `<PHONE>`, hai ngày thành `2026-11-05`, `2026-11-15`. Khớp lời văn |
| `pitfalls.vi.py`, `pitfalls.en.py` | chạy thật | 2026-11-05 | như trên | 25 dòng, 11 ms. `['Ph', 'H', 'N', 'i', 'ngon', 'qu']`; `['Phở', 'Hà', 'Nội', 'ngon', 'quá']`; cờ ASCII như dòng đầu; `3 4 2`; `['<b>Phở</b> và <i>bún chả</i>']`; `['<b>', '</b>', '<i>', '</i>']`; `Phở và bún chả`; `['Giá', '12', '.', '000đ', ',', 'rẻ', 'quá', '!']`; `['Giá', '12.000', 'đ', ',', 'rẻ', 'quá', '!']`. Khớp lời văn |
| thời gian `(a+)+$` | chạy thật | 2026-11-05 | CPython 3.14.5, Windows | Số ở mục "Số tự tính và tự đo". Không phải file của bài |
