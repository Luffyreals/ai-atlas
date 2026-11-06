# Tài liệu tham khảo: Chuẩn hóa văn bản (`nlp/text-normalization`)

Viết ngày 05/11/2026 bởi `lesson-writer`. Mọi link dưới đây đã mở được ngày viết, trừ chỗ ghi rõ.

## Nguồn

| Nguồn | Link | Dùng cho |
|---|---|---|
| Whistler, K. (ed.) (2026). *Unicode Standard Annex #15: Unicode Normalization Forms*, Unicode 18.0.0, revision 58 (12/08/2026) | https://unicode.org/reports/tr15/ | Bốn dạng NFD, NFC, NFKD, NFKC; tương đương chuẩn (canonical) và tương đương tương thích (compatibility) |
| Unicode Consortium. *Normalization FAQ* | https://www.unicode.org/faq/normalization.html | "NFC is the best form for general text"; "it is rare to have non-NFC text". UAX #15 (mục mở đầu) ghi W3C Character Model và XML 1.0 khuyên dùng NFC cho mọi nội dung web |
| Python Software Foundation. *`unicodedata` — Unicode Database*, Python 3.14 | https://docs.python.org/3.14/library/unicodedata.html | `normalize`, `name`, `category` |
| Jurafsky, D., Martin, J. H. *Speech and Language Processing*, 3rd ed. draft (bản 19/08/2026), chương 2 "Words and Tokens" | https://web.stanford.edu/~jurafsky/slp3/ (PDF chương: https://web.stanford.edu/~jurafsky/slp3/2.pdf) | 2.2 hình vị, biến tố và phái sinh (inflectional, derivational); 2.3 Unicode, code point; 2.7 gộp chữ hoa về chữ thường bằng `tr`; phần ghi chú lịch sử nhắc stemming (Lovins 1968). Bản nháp mới không còn mục riêng về stemming/lemmatization |
| Porter, M. F. (1980). An algorithm for suffix stripping. *Program*, 14(3), 130–137 | https://tartarus.org/martin/PorterStemmer/ (trang của tác giả, có trích dẫn và bản cài đặt) | Thuật toán Porter |
| Bird, S., Klein, E., Loper, E. (2009). *Natural Language Processing with Python*, chương 3, mục 3.6 "Normalizing Text" | https://www.nltk.org/book/ch03.html | Stemmer Porter, Lancaster; lemmatizer WordNet (`women` → `woman`) |
| Google Research. *BERT README* | https://github.com/google-research/bert/blob/master/README.md | "The `Uncased` model also strips out any accent markers"; uncased thường tốt hơn "unless you know that case information is important for your task (e.g., Named Entity Recognition or Part-of-Speech tagging)"; khuyên dùng Multilingual Cased |
| Google. *SentencePiece: normalization.md* | https://github.com/google/sentencepiece/blob/master/doc/normalization.md | Mặc định chuẩn hóa `nmt_nfkc` (NFKC + gộp khoảng trắng); có `nmt_nfkc_cf` (thêm case folding) |
| Wikipedia. *Vietnamese alphabet*, mục tone marks | https://en.wikipedia.org/wiki/Vietnamese_alphabet | "Old style" đặt dấu gần giữa từ (*hóa*, *hủy*); "new style" đặt dấu trên âm chính (*hoá*, *huỷ*), dùng trong sách giáo khoa của NXB Giáo dục. Nguyên âm có dấu phụ (ê, ơ…) thì dấu thanh luôn đặt trên nó ở cả hai kiểu. Unicode cho chọn ký tự dựng sẵn hoặc tổ hợp; Windows-1258 dùng ký tự tổ hợp |

Chưa mở được (không đưa vào "Đọc thêm"):

- Manning, Raghavan, Schütze (2008), *Introduction to Information Retrieval*, mục 2.2 (stop words, normalization, stemming and lemmatization): `nlp.stanford.edu` từ chối kết nối ngày viết.
- Quyết định 1989/QĐ-BGDĐT ngày 25/5/2018 (quy định chính tả trong sách giáo khoa): chỉ thấy bản trích qua kết quả tìm kiếm (ví dụ "hoà nhạc, quý hoá, thuỷ thủ, mạnh khoẻ"), hai trang chứa văn bản trả 403. Bài không trích văn bản này; chỉ dựa vào Wikipedia và mô tả là quy ước thực tế.

## Ý chính dùng trong bài

- Chuẩn hóa là hàm $f$ trên chuỗi: gộp các cách viết cùng một thứ ($a \sim b \Rightarrow f(a) = f(b)$), không gộp nhầm thứ khác nhau; nên lũy đẳng; phải dùng cùng một $f$ khi huấn luyện và khi dùng.
- NFC/NFD là tương đương chuẩn, an toàn. NFKC/NFKD gộp thêm tương đương tương thích (ﬁ → fi, ² → 2, Ａ → A), có thể mất thông tin.
- Dấu thanh kiểu cũ/kiểu mới: chỉ khác ở vần oa, oe, uy không có âm cuối (hòa/hoà, khỏe/khoẻ, thủy/thuỷ). Có âm cuối (hoàng, khoảng, thuyền) hay có "qu" (quý) thì như nhau. Cả hai dạng đều là NFC, nên Unicode không gộp được; cần quy tắc riêng.
- Lưu ý tên gọi: theo Wikipedia, "kiểu cũ" là *hòa* (dấu gần giữa), "kiểu mới" là *hoà* (dấu trên âm chính). Brief của phiên chính gọi ngược lại; bài theo Wikipedia.
- Stemming (cắt hậu tố theo quy tắc) và lemmatization (về dạng từ điển, cần từ điển và từ loại). Tiếng Việt là ngôn ngữ đơn lập: từ không biến hình, thời và số dùng từ riêng ("đã", "đang", "sẽ", "những", "các"), nên gần như không cần.
- Stopword: bỏ được khi truy xuất theo chủ đề, nguy hiểm khi phân tích cảm xúc ("không", "chẳng", "chưa").
- Bỏ dấu: "ma, má, mà, mả, mã, mạ" đều thành "ma". Có ích cho tìm kiếm khi người dùng gõ không dấu (áp cho cả chỉ mục lẫn câu truy vấn, giữ bản gốc để hiển thị).

## Số tự tính

| Việc | Kết quả | Cách tính |
|---|---|---|
| `len` của "Hòa" NFC / NFD | 3 / 4 | ô `unicode` (Pyodide) |
| `len` của "Huế" NFC / NFD | 3 / 5 (e + U+0302 + U+0301) | CPython 3.14 `unicodedata` |
| NFD của "ệ" | e + U+0323 + U+0302 (dấu nặng trước dấu mũ: thứ tự chuẩn) | CPython 3.14 |
| "ß".lower() / "ß".casefold() | "ß" / "ss" | CPython 3.14 |
| NFKC("ﬁ ² Ａ") | "fi 2 A"; NFC giữ nguyên "ﬁ ²" | CPython 3.14 |
| Quy tắc dời dấu trên `hòa_bình hòa` (NFD) | `hòa_bình hoà`: chữ đã tách từ giữ nguyên vì `_` là `\w`, `\b` không khớp | CPython 3.14, sau review |
| `"\xa0".isspace()` / `"​".isspace()` | True / False (`str.split()` không tách ở U+200B) | CPython 3.14 |
| Porter (NLTK 3.10.4, cả `ORIGINAL_ALGORITHM` lẫn mặc định) | running→run, runs→run, ran→ran, runner→runner, studies→studi, studying→studi, university/universe/universal→univers, organization→organ, generous/generate→gener, was→wa, better→better, mice→mice | NLTK cài tạm vào scratchpad (`pip --target`), không thêm vào dự án |
| Pipeline (ô `pipeline`), câu 3 | `len` 44 → 43 sau NFC; kết quả cuối `shop của chị hòa không tệ giá <num> đ` (37) | Pyodide |
| Pipeline, tắt `nfc` | bước `punct` biến "hòa" (NFD) thành `ho a` | Pyodide, bản sửa tạm trong scratchpad |
| Pipeline, bật `strip_tone` | `sp ok lam <num> d xem tai <url>`; `giao hang cham qua goi <num> hoac <email>`; `shop cua chi hoa khong te gia <num> d` | Pyodide, bản sửa tạm |

## Kiểm chứng code

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `unicode.vi.py`, `unicode.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 (Python 3.14.2) trong Node, `runpyo.mjs` | 28 ms. `False`, `3 4`, `True True`; câu mẫu thành "Hoà thuận, khoẻ mạnh, thuỷ thủ, HOÁ ĐƠN, mùa hoàng hôn"; khớp lời văn. 39 dòng, dòng dài nhất 68 ký tự, `ast.parse(feature_version=(3, 10))` qua |
| `pipeline.vi.py`, `pipeline.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 (Python 3.14.2) trong Node, `runpyo.mjs` | 13 ms. Bảng ở mục Minh họa chép từ output này. Thử thêm hai cấu hình (tắt `nfc`, bật `strip_tone`) bằng bản sửa tạm. 50 dòng, dòng dài nhất 69 ký tự, `ast.parse` qua |
