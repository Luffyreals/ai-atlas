# `BpeMergeViz` (bài Tách từ, `nlp/tokenization`)

> Mục lục và quy ước chung: [README.md](README.md). Mọi quy ước ở mục 2 (file, CSS, chuỗi, trợ năng, SSR, ngân sách, checklist 2.12) vẫn áp dụng. Mục này chỉ ghi phần mới hoặc phần khác. VIZ gần nhất về kiểu là `SamplingViz` ([llm-lessons.md](../llm-lessons.md) mục 4.6): bảng HTML có thanh, nút bấm, vùng live.
>
> Viết ngày 05/11/2026, phần NLP (5a). Bố trí hình của phần NLP: [nlp-lessons.md](../nlp-lessons.md) mục 4.

## 13. `BpeMergeViz`

### 13.1. Ý và phạm vi

**Ý một câu:** BPE gộp dần cặp ký hiệu kề nhau có số đếm lớn nhất; mảnh hay gặp (`ng`, `ường_`, `người_`) thành token, âm tiết hiếm như "thương" vẫn rời.

**Làm:** bấm từng bước 12 phép gộp trên bộ 7 âm tiết của bài; mỗi bước hiện bảng đếm cặp, cách chia từng âm tiết, danh sách phép gộp đã học, cỡ từ vựng $|V| = |V_0| + k$.

**Không làm:**

- Ô nhập âm tiết mới để tách thử (comment VIZ cho phép, không bắt buộc). Ô code BPE của bài đã tách `nhường`, `nghiêng`; ô nhập cần thêm CSS cho `input[type=text]` mà `viz.css` chỉ còn khoảng 400 byte ngân sách.
- Đổi tần số, đổi bộ từ, chạy quá 12 bước, hoạt ảnh.
- BPE mức byte, WordPiece, Unigram (bài nói bằng lời).

### 13.2. Dữ liệu: `src/data/datasets/bpe-syllables.ts`

`BPE_SYLLABLES`: `words` (7 cặp `{ word, freq }`, NFC, đúng thứ tự dict `WORDS` của ô code), `end: '_'`, `merges: 12`, `description` vi/en cho trình đọc màn hình. Kiểu `BpeDataset` khai báo ngay trong file (không vào `types.ts`, không vào registry `DATASETS`, vì không phải dữ liệu x/y). Bản en của bài giữ nguyên âm tiết tiếng Việt, nên `words` dùng chung hai ngôn ngữ.

Ô code `src/code/nlp/tokenization/bpe.{vi,en}.py` chép dữ liệu thành `WORDS = {...}`. Không dùng dấu `# dataset:` (khuôn đó dành cho mảng số `np.array`). Thay vào đó `tests/unit/viz/bpe.test.ts` đọc từng file `.py` có mặt, so `WORDS` (từ, số, thứ tự), `END` và `range(1, K + 1)` với `BPE_SYLLABLES`.

### 13.3. Toán: `src/lib/viz/bpe.ts`

| Hàm | Việc | Khớp Python |
|---|---|---|
| `splitWord(w, end)` | `Array.from(w)` rồi thêm `end` | `list(w) + [END]` (cả hai tách theo code point; dữ liệu NFC nên "ườ" là một ký tự) |
| `countPairs(splits, freqs)` | $\operatorname{count}(a, b) = \sum_w f(w)\, n_{ab}(w)$, theo thứ tự gặp lần đầu (âm tiết theo thứ tự, mỗi âm tiết trái sang phải) | thứ tự chèn của `Counter` |
| `rankPairs(counts)` | Sắp giảm dần theo số đếm; sort ổn định nên hòa giữ thứ tự gặp lần đầu. Phần tử đầu là cặp thắng | `max(pairs, key=pairs.get)` trả phần tử lớn nhất gặp đầu tiên |
| `mergePair(symbols, a, b)` | Quét trái sang phải, không chồng lấn | `merge()` |
| `runBpe(words, end, K)` | `initial`, `vocab0` ($|V_0|$), `steps[k]` = `{ counts, pair, symbol, splits }`; dừng sớm nếu hết cặp | vòng `for step in range(1, 13)` |
| `applyMerges(w, end, pairs)` | Tách từ mới bằng các phép gộp theo đúng thứ tự | vòng cuối của ô |

Kết quả (đã khớp output của ô chạy trong Pyodide 314.0.7, Python 3.14.2): 1 `n+g` 29; 2 `ư+ờ` 19; 3 `ng+_` 14; 4 `ườ+ng_` 11; 5 `n+h` 10; 6 `ng+ườ` 8; 7 `ngườ+i` 8; 8 `người+_` 8; 9 `nh+à` 7; 10 `nhà+_` 7; 11 `t+r` 6; 12 `tr+ường_` 6. $|V_0| = 13$, $|V| = 25$. Bước 6, 7, 9, 11 có hòa ở số đếm cao nhất (3, 2, 2, 2 cặp). Số cặp khác nhau mỗi bước: 23 giảm dần tới 12.

### 13.4. Bố cục và hành vi

Từ trên xuống, mọi phần là con trực tiếp của `figure` (lưới, `gap` 16px):

1. `figcaption`.
2. Dòng số (`.atlas-viz-control-head`): "Bước k/12" bên trái, "Từ vựng $|V|$ = 13 + k = …" bên phải ($|V|$ render KaTeX lúc build).
3. Hàng nút (`.atlas-viz-choice`, `role="group"`): **Bước tiếp**, **Đặt lại**. Đặt ngay dưới dòng số, để mọi phần đổi theo bước đều nằm dưới nút vừa bấm (README.md mục 2.8).
4. Dòng trạng thái (`.atlas-viz-status-stack`): câu của bước hiện tại chồng lên câu của cả 13 bước (ẩn, `aria-hidden`), nên chiều cao cố định từ đầu như `GradientDescentViz`. Bước 0: `startNote`. Bước k: `mergedNote`, thêm `tieNote` nếu hòa, thêm `doneNote` ở bước 12.
5. **Bảng đếm cặp** (`<table class="atlas-viz-table">`, tiêu đề là `span.atlas-viz-axis-title` nối bằng `aria-labelledby`): cột Cặp (`th scope="row"`, dạng "ườ + ng_"), thanh (`.atlas-viz-meter` > `span.atlas-viz-bar`), số đếm. Thang thanh cố định 0–29 (số đếm lớn nhất của cả lượt chạy), nên thanh ngắn dần khi các cặp phổ biến bị gộp hết. Bước 0: số đếm ban đầu, không tô hàng nào. Bước k: số đếm dùng để chọn phép gộp k (tính trên cách chia trước phép gộp k); hàng thắng là hàng đầu, `data-pick` (đậm, màu mực) kèm chữ `picked` ẩn cho trình đọc màn hình.
   - Luôn hiện 8 hàng đầu (mọi bước có ít nhất 12 cặp, nên bảng cao như nhau ở mọi bước và mọi bề rộng). Nút `showAll` / `showFew` (`aria-expanded`, `aria-controls` trỏ `tbody`) hiện hoặc ẩn các hàng còn lại bằng thuộc tính `hidden`. Trạng thái này giữ nguyên khi bấm bước.
   - Comment VIZ cho phép "trên điện thoại chỉ hiện 8 dòng"; làm vậy ở mọi bề rộng để không phải đọc kích thước màn hình lúc render (README.md mục 2.8).
6. **Bảng 7 âm tiết**: cột Âm tiết, Cách chia, $f(w)$ (KaTeX). Cột Cách chia đứng thứ hai để nhận `width: 100%` của `.atlas-viz-table td:nth-child(2)`. Mỗi mảnh một chip (`.atlas-viz-chip`), xuống dòng khi hẹp. Mảnh bằng ký hiệu vừa tạo ở bước này có `data-new`: nền accent, chữ `--sl-color-black`, đậm (tương phản 7.42 tối / 6.42 sáng, như nút được chọn). Chip là `aria-hidden`; trình đọc màn hình đọc câu `splitText` ("4 mảnh: ng, ườ, i, _"), vì các `span` kề nhau sẽ bị đọc liền thành một từ.
7. **Danh sách phép gộp** (`<ol class="atlas-viz-merges">`, chia cột `columns: 15rem`): "ườ + ng_ → ường_ (11)", phép gộp mới nhất `data-pick`. Bước 0: câu `noMerges`. Danh sách đặt cuối để khi nó dài thêm, không phần nào của VIZ bị đẩy.
8. Mô tả `sr-only` (`description` của dataset, nối vào `figure` bằng `aria-describedby`) và vùng `aria-live="polite"`.

**Nút hết việc dùng `aria-disabled`, không dùng `disabled`.** "Bước tiếp" ở bước 12 và "Đặt lại" ở bước 0 có `aria-disabled="true"`:

- Bấm 12 lần bằng bàn phím thì focus vẫn ở nút, không rơi về `body`. Bấm "Bước tiếp" khi đã hết thì vùng live đọc `announceEnd`. Bấm "Đặt lại" ở bước 0 thì không làm gì.
- `disabled` thật chỉ có trước khi hydrate (README.md mục 2.8). `hydrate()` của e2e chờ không còn điều khiển `:disabled` nào, nên `disabled` sau hydrate sẽ làm e2e treo. `PythonRunner` cũng dùng `aria-disabled` cho nút Chạy.
- Hình thức: nền trong suốt, viền trong 1px và chữ màu `--atlas-viz-muted` trên nền khối (5.40 tối / 5.52 sáng, vẫn qua 4,5:1 mà test tương phản chung đòi). Màu `:disabled` cũ (gray-3 trên gray-5: 3.92 / 4.06) không đủ.

**Vùng live:** bấm Bước tiếp đọc `announceStep` ("Bước 4: gộp ườ + ng_ thành ường_, số đếm 11. Từ vựng có 17 token."); Đặt lại đọc `resetDone`; lúc tải trang không đọc gì.

**SSR:** island tự chạy `runBpe` (chỉ đếm và nối chuỗi, không có số thực), nên HTML lúc build giống hệt lần render đầu ở trình duyệt. Trước khi hydrate: bước 0, ba nút `disabled`.

### 13.5. Chuỗi `vizBpeMerge` (30 key)

`caption`, `controls`, `next`, `reset`, `stepOf`, `vocabLabel` ($|V|$), `vocabValue`, `pairsStart`, `pairsLabel`, `pairCol`, `countCol`, `pair` ("{{a}} + {{b}}"), `picked`, `showAll`, `showFew`, `syllablesLabel`, `syllableCol`, `splitCol`, `freqCol` ($f(w)$), `splitText`, `mergesLabel`, `mergeItem` ("{{a}} + {{b}} → {{ab}} ({{count}})"), `noMerges`, `startNote`, `mergedNote`, `tieNote`, `doneNote`, `announceStep`, `announceEnd`, `resetDone`.

Dấu `+` và `→` nằm trong chuỗi (`pair`, `mergeItem`), không viết cứng trong island. Âm tiết và ký hiệu là dữ liệu (`BPE_SYLLABLES`), không dịch.

### 13.6. `viz.css`: lớp thêm (đặt tên theo vai trò)

| Lớp | Việc |
|---|---|
| `.atlas-viz-part` | Thêm vào luật của `.atlas-viz-context`: lưới `gap` 4px cho một tiêu đề trên bảng hoặc danh sách |
| `.atlas-viz [data-pick]` | Hàng hay mục được chọn ở bước này: đậm, màu mực |
| `.atlas-viz-chips`, `.atlas-viz-chip`, `.atlas-viz-chip[data-new]` | Mảnh của một từ đã chia; mảnh vừa tạo tô accent |
| `.atlas-viz-merges` | Danh sách đánh số chia cột |
| `.atlas-viz-toggle[aria-disabled='true']` | Nút hết việc: rỗng, viền mảnh, chữ mờ (mục 13.4). Luật hover và `prefers-reduced-motion` thêm `[aria-disabled='true']` vào `:not()` |

`viz.css` bỏ comment, gzip: 2 048 → **2 175 byte** (85% ngân sách 2 560).

### 13.7. Test

- `tests/unit/viz/bpe.test.ts` (node): ví dụ tính tay cho `countPairs` (trọng số, thứ tự gặp, khóa "ab"+"c" khác "a"+"bc"), `rankPairs` (hòa), `mergePair` (không chồng lấn), dừng sớm; dữ liệu NFC và khớp `WORDS`/`END`/`range` của cả `bpe.vi.py` và `bpe.en.py`; 12 phép gộp và số đếm, $|V_0|$, $|V|$, cách tách 4 âm tiết khớp output Python; mọi số bài trích (mục Lý thuyết, 4 ý "Hãy thử", cách chia sau bước 12 trong comment VIZ).
- `tests/unit/fixtures/bpe-python.ts`: output nguyên văn của ô, chạy trong Pyodide 314.0.7 dưới Node.
- E2E: test chung `viz.spec.ts`, `viz-meta.spec.ts` tự áp dụng cho `/vi/nlp/tokenization/` và `/en/nlp/tokenization/` khi bài `published`. `viz.spec.ts` (4) nay chỉ đòi viền đứt của hàng bị loại ở VIZ bảng **có thanh trượt** (`cutsRows`): `BpeMergeViz` có thanh trong bảng nhưng không bao giờ loại hàng.
- Chưa có: test island jsdom (`tests/unit/components/bpe-merge-viz-island.test.tsx`, việc của `tester`).
