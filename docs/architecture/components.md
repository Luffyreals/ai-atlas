# Thiết kế component mốc M1

> Phạm vi: 5 component của mốc **M1. Công cụ trình bày** trong [docs/mvp.md](../mvp.md): `Prerequisites`, `Quiz`, `LessonProgress`, `PythonRunner`, và phần đánh dấu tiến độ của `RoadmapMap`.
> Liên quan: [scaffold.md](scaffold.md) (i18n, alias, cấu hình), [roadmap-data.md](roadmap-data.md) (dữ liệu lộ trình), [homepage.md](homepage.md) (nhận diện, `RoadmapMap`).
>
> Tài liệu này ghi **hành vi, giao diện lập trình và hình thức** (mục 4.9). Cập nhật lần cuối 23/10/2026. Các chỗ ghi "đã kiểm chứng" là kết quả chạy thật trong ngày, không phải suy đoán.

**Quyết định của người dùng ngày 23/10/2026** (cũng ghi ở [mvp.md](../mvp.md) mục 7, quyết định 8–17):

| # | Quyết định | Áp dụng ở |
|---|---|---|
| 8 | Giao diện component được duyệt **trên trang demo** `/vi/dev/components/` sau khi làm xong, không duyệt bản mô tả trước. Mục 4.9 đủ cụ thể để developer làm ngay | 4.9, 6 |
| 9 | E2E tải Pyodide thật gắn tag `@network`, chạy bằng script riêng `test:e2e:network`, **không chạy trong CI**. Test "mở trang không tải Pyodide" vẫn chạy trong CI | 2.11, 6 |
| 10 | Code chạy lâu **không tự ngắt**. Có nút Dừng. Sau khoảng 10 giây hiện gợi ý bấm Dừng | 2.6, 4.6 |
| 11 | Trang demo giữ trên bản deploy, giữ `noindex`, **lọc khỏi `sitemap.xml`** | 2.10 |
| 12 | Câu hỏi và đáp án quiz có công thức: **tự sinh `aria-label`** từ chữ thường cộng mã TeX. Tác giả không viết lời đọc | 4.4 |
| 13 | CSS của component bài học (và của `RoadmapMap`) **gộp vào `customCss`** của Starlight. Bài học không còn file CSS chặn render riêng | 3 |
| 14 | Lighthouse trang chủ: "không thấp hơn bản trước M1, đo cùng lúc trên cùng máy" | [mvp.md](../mvp.md) |
| 15 | Code Python lỗi: vùng trạng thái có thêm một dòng `sr-only` (key `errorTitle`). Giao diện nhìn thấy không đổi | 4.6, 4.9.5 |
| 16 | Sửa ngay ở M1 điểm dừng Tab thừa khi radio có focus trước lúc quiz hydrate | 4.4, 7 |
| 17 | Performance trang demo 87–90: chấp nhận ở M1, tối ưu ở M4 | [mvp.md](../mvp.md) |

## 1. Mục tiêu và phạm vi

### Làm

- 4 component mới dùng được trong MDX, cộng dấu ✓ và dòng "Đã học x/y" cho `RoadmapMap` đã có. Tất cả song ngữ, sáng/tối, dùng tốt ở 375px, dùng được chỉ bằng bàn phím.
- Thư viện dùng chung: tiến độ học (localStorage), trạng thái link của bài, chạy Python (Pyodide trong Web Worker).
- Lọc trang demo khỏi sitemap.
- Trang demo `/vi/dev/components/` và `/en/dev/components/` dùng đủ component.
- Test cho từng phần: unit (Vitest), component (Testing Library + jsdom), e2e (Playwright).

### Không làm

- Sơ đồ lộ trình dạng đồ thị có mũi tên (ngoài MVP).
- Trình soạn code có tô màu khi gõ (CodeMirror…). M1 dùng `<textarea>`, xem mục 2.4.
- Quiz nhiều đáp án đúng, quiz điền số. Chỉ trắc nghiệm một đáp án.
- Đồng bộ tiến độ giữa các máy. Lưu kết quả quiz.
- Tự ngắt code chạy lâu (quyết định 10).
- **Không làm lại** `src/lib/inline-markup.ts` và `src/i18n/format.ts`: hai file này đã có từ M0 (trang chủ dùng), có test `inline-markup.test.ts`, `format.test.ts`.

## 2. Phương án đã chọn

### 2.1. Astro hay React cho từng component

Nguyên tắc: **phần nào chỉ hiển thị thì render sẵn bằng Astro (0 KB JS)**. Chỉ dùng React khi có trạng thái phức tạp. Trạng thái đơn giản (một nút bật/tắt, đánh dấu ✓) dùng `<script>` nhỏ của Astro. Đưa React (khoảng 60 KB nén) vào trang chủ chỉ để hiện dấu ✓ là quá đắt.

| Component | Chọn | Lý do |
|---|---|---|
| `Prerequisites` | **Astro** + script nhỏ đánh ✓ | Danh sách tĩnh lấy từ `roadmap.ts` lúc build. Chỉ dấu "đã học" cần JS |
| `Quiz` | **Astro wrapper + React island** | Nhiều trạng thái: chọn đáp án, chấm, giải thích, điểm, làm lại |
| `LessonProgress` | **Astro** + custom element | Chỉ một nút bật/tắt |
| `PythonRunner` | **Astro wrapper + React island** | Nhiều trạng thái: tải runtime, hàng đợi, chạy, output dạng luồng, lỗi, biểu đồ, chế độ sửa |
| `RoadmapMap` | **Astro** + script (đã có) | Nằm ở trang chủ. Script chỉ được import module thuần, **không React** |

**Mọi component tác giả dùng trong MDX đều là file `.astro`.** Wrapper Astro tự:

- lấy chuỗi giao diện bằng `getStrings(Astro.locals.t, ns)` rồi truyền xuống React (theo [scaffold.md](scaffold.md) mục 4.5);
- tự gắn `client:visible` cho island React.

Vì vậy tác giả **không** viết `client:*` trong MDX. (Astro không cho đặt `client:*` lên component `.astro`.)

### 2.2. Nội dung quiz: để trong frontmatter YAML

| Phương án | Ưu | Nhược |
|---|---|---|
| A. Prop mảng JS trong MDX: `<Quiz questions={[{ question: '$\frac{a}{b}$' }]} />` | Gần chỗ hiển thị | **Bẫy dấu `\`:** trong chuỗi JS, `\f`, `\t`, `\n`, `\b`, `\v`, `\r` thành ký tự điều khiển. `\frac`, `\theta`, `\nabla`, `\beta`, `\vec`, `\right` hỏng ngầm |
| **B. Trường `quiz` trong frontmatter YAML, `<Quiz />` không cần prop (chọn)** | Trong YAML nháy đơn, `\` giữ nguyên (đã kiểm chứng); có schema zod kiểm tra lúc build; người dịch thấy rõ phần cần dịch | Nội dung quiz nằm ở đầu file, xa vị trí hiển thị |
| C. Component lồng nhau (`<QuizQuestion>`, `<QuizOption>`) | Viết Markdown tự nhiên | Dài dòng; truyền cây con vào React island rất rối |

Chọn **B** (người dùng đồng ý 22/10/2026). Trong chuỗi quiz chỉ hỗ trợ **công thức `$...$`** và **code `` `...` ``**. Wrapper render sẵn lúc build bằng `renderInlineMarkup()` có từ M0 (không đưa KaTeX xuống trình duyệt).

### 2.3. Code của `PythonRunner`: file `.py` riêng, import bằng `?raw`

| Phương án | Ưu | Nhược |
|---|---|---|
| A. Template literal: ``code={`print("a\nb")`}`` | Code nằm ngay trong bài | **Cùng bẫy dấu `\`:** `"\n"` thành xuống dòng thật, Python báo `SyntaxError`. `${` cũng bị hiểu nhầm |
| B. ``code={String.raw`...`}`` | Giữ `\` | Vẫn vỡ khi code có backtick; dễ quên `String.raw` |
| **C. File `src/code/<phần>/<bài>/<tên>.<locale>.py`, import `?raw` (chọn)** | Không phải escape gì (đã kiểm chứng); `content-reviewer` chạy thẳng `python src/code/...py` | Code nằm ở file khác |

```mdx
import PythonRunner from '@components/PythonRunner.astro';
import fitCode from '@code/ml/linear-regression/fit.vi.py?raw';

<PythonRunner code={fitCode} />
```

**Comment trong code theo ngôn ngữ của bài** (quyết định 22/10/2026). Mỗi ví dụ có hai file cùng thư mục: `<tên>.vi.py` và `<tên>.en.py`. Test `tests/unit/code-pairs.test.ts`:

- Mỗi `.vi.py` phải có `.en.py` cùng tên, và ngược lại.
- Sau khi bỏ comment (`#` đến cuối dòng, không tính `#` nằm trong chuỗi) và dòng trống, hai file phải giống hệt nhau. Chuỗi in ra (`print("...")`) là code, nên **viết tiếng Anh hoặc chỉ in số**.

Python máy phát triển là 3.14, cùng bản với Pyodide 314.0.7 (Python 3.14.2), nên chạy thử local đáng tin. Thư viện vẫn có thể khác bản (ví dụ pandas).

### 2.4. Trình soạn code: khối code tĩnh + nút "Sửa code"

- Mặc định hiện code bằng `<Code>` của Starlight (Expressive Code: tô màu lúc build, có nút copy, 0 KB JS thêm). Không có JS thì vẫn đọc được code.
- Bấm **"Sửa code"** → khối tĩnh bị ẩn, hiện `<textarea>` chứa code. Từ lúc này ô ở **chế độ sửa** cho tới khi bấm **"Khôi phục code gốc"**. Nút này bỏ mọi chỗ sửa và hiện lại khối tĩnh.
- **Bỏ nút "Xem code"** của bản thiết kế cũ. Lý do: khối tĩnh luôn hiện code gốc. Nếu cho quay về khối tĩnh khi code đã sửa, người đọc sẽ thấy code khác với code đang chạy.
- Không dùng CodeMirror ở M1 (thêm khoảng 150 KB). Xét lại khi có phản hồi của người đọc.

**Giữ HTML tĩnh của `<Code>` khi bật/tắt chế độ sửa (điểm b5).**

> **Đã đổi ở M1-5 (rủi ro 6 xảy ra).** Khi `<Code>` là `children` của island, build làm mất thẻ `<link rel="stylesheet" href="/_astro/ec.*.css">` của Expressive Code. Hậu quả: khối code không có style, trang 375px bị cuộn ngang. Cách đang dùng là phương án dự phòng:
>
> - `PythonRunner.astro` render `<Code>` trong `<div class="atlas-runner-static" data-runner-static>`, đặt **ngoài** island, ngay trước nó.
> - Island không nhận `children`. Nó tìm khối tĩnh bằng `closest('.atlas-runner')` → `[data-runner-static]`, rồi đặt `hidden = editing`. Không cần sinh id cho khối.
> - Điều kiện chống lỗi hydrate bên dưới vẫn giữ nguyên.
>
> Phần còn lại của mục này là phương án ban đầu, giữ lại để biết vì sao không dùng.

- Wrapper truyền `<Code>` làm `children` của island. `@astrojs/react` biến `children` thành một phần tử `<astro-slot>` chứa HTML có sẵn (`StaticHtml`, bọc `memo(() => true)`, `suppressHydrationWarning`). Đã đọc mã nguồn `@astrojs/react` 7.1.1.
- **Chọn: luôn render `children`, chỉ ẩn bằng thuộc tính `hidden`**, không gỡ khỏi DOM:

  ```tsx
  <div className="atlas-runner-static" hidden={editing}>{children}</div>
  {editing && <textarea … />}
  ```

- Vì sao không gỡ:
  - Gỡ ra rồi gắn lại thì React tạo lại `<astro-slot>` từ chuỗi HTML. Cách này chạy được, nhưng nút copy của Expressive Code phải gắn sự kiện lại qua `MutationObserver`.
  - Giữ nguyên node là cách ít bất ngờ nhất.
- **Điều kiện để không lỗi hydrate:** lần render đầu ở trình duyệt phải giống hệt lúc build.
  - `editing = false`, trạng thái `idle`.
  - Không đọc `window`, `localStorage` hay `navigator` trong lúc render. Mọi thứ phụ thuộc trình duyệt đặt trong `useEffect` hoặc handler.
  - `<textarea>` chỉ xuất hiện sau khi bấm "Sửa code", tức là sau khi hydrate xong.

### 2.5. Pyodide

**Phiên bản 314.0.7. Kiểm tra lại ngày 23/10/2026:**

- `npm view pyodide dist-tags`: `latest = 314.0.7`. `next = 315.0.0-alpha.2` là bản thử, không dùng.
- `0.29.5` và `0.27.8` ra sau (16/09/2026) nhưng là bản vá của dòng cũ (`stable-0.29`, `stable-0.27`).
- GitHub releases khớp: 314.0.7 phát hành 14/09/2026, không phải prerelease.

Gói có sẵn (đọc `pyodide-lock.json` của 314.0.7): Python 3.14.2, numpy 2.4.6, pandas 3.0.2, matplotlib 3.10.8, scipy 1.18.0, scikit-learn 1.8.0, micropip 0.11.1. **Không có seaborn.**

**URL CDN:** `https://cdn.jsdelivr.net/pyodide/v314.0.7/full/`. Đã kiểm tra `pyodide.mjs` ngày 23/10/2026: `200`, `access-control-allow-origin: *`, `Cache-Control: public, max-age=31536000`.

**Gói npm `pyodide@314.0.7`: có cài, ở `devDependencies`, chỉ để lấy kiểu TypeScript.**

- Code chỉ dùng `import type { PyodideAPI } from 'pyodide'` và `typeof import('pyodide').loadPyodide`. Không có import runtime nào tới gói này, nên Vite không đóng gói nó và nó không lên trình duyệt.
- Runtime luôn tải từ CDN cùng phiên bản. `deps.test.ts` kiểm tra hai số này bằng nhau.
- Không tự viết kiểu thay cho gói, vì kiểu tự viết dễ lệch khi nâng phiên bản. Gói nặng khoảng 13 MB trong `node_modules`, chấp nhận được.

**Cách chạy:**

- **Module Web Worker** (`new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })`). Tài liệu Pyodide yêu cầu worker kiểu module vì `pyodide.asm.mjs` là ES module.
- Worker tải runtime bằng `import(/* @vite-ignore */ PYODIDE_INDEX_URL + 'pyodide.mjs')`. Đã kiểm chứng trong spike M0: Vite tách worker thành `/_astro/worker-*.js`, URL CDN giữ nguyên.
- **Chỉ tải khi bấm "Chạy" lần đầu.** Island React tải khi cuộn tới (`client:visible`). Module `client.ts` (tạo worker) chỉ được `import()` động bên trong handler của nút Chạy.
- **Một worker dùng chung cho cả trang.** Nhiều `PythonRunner` chỉ tải Pyodide một lần. Các lần chạy xếp hàng, chạy lần lượt.
- **Mỗi lần chạy có namespace riêng:** `globals` là một `dict` mới, có sẵn `__name__ = '__main__'` để `if __name__ == "__main__":` chạy đúng (đã kiểm chứng). Biến của ô này không lọt sang ô khác.
- Gói Python tự tải theo `import` trong code (`loadPackagesFromImports`).
- **Không dùng `setInterruptBuffer`.** Cách này cần `SharedArrayBuffer`, tức phải bật COOP/COEP cho cả site, và các header này dễ chặn tài nguyên từ CDN. Dừng bằng `worker.terminate()` (mục 2.6).
- **matplotlib:** worker đặt `MPLBACKEND=AGG` trước lần chạy đầu. `plt.show()` không làm gì và không báo lỗi. Cách xuất hình ở mục 2.8.
- **`input()`:** worker không hỏi người dùng đồng bộ được. Prop `stdin` cung cấp sẵn dữ liệu nhập (cần cho bài `python/basic-syntax`). Hết dữ liệu thì `input()` báo `EOFError` (đã kiểm chứng: `EOFError: EOF when reading a line`). Giao diện đổi lỗi này thành lời giải thích dễ hiểu (mục 4.6).

### 2.6. Nút Dừng và hàng đợi (điểm b2, b3)

**Bấm Dừng khi có ô khác đang xếp hàng.** Có hai cách:

| Phương án | Hành vi | Đánh giá |
|---|---|---|
| A. Dừng tất cả | Hủy worker. Ô đang chạy và mọi ô đang chờ đều kết thúc "Đã dừng" | Đơn giản, nhưng người đọc bấm Dừng ở ô 1 lại làm mất lượt của ô 2 mà họ vừa bấm Chạy. Khó hiểu |
| **B. Dừng ô của mình (chọn)** | Ô đang chạy: hủy worker, ô đó "Đã dừng"; ô đang chờ **vẫn giữ chỗ** và chạy trên worker mới. Ô đang chờ: bấm Dừng thì rút khỏi hàng, không động tới worker | Đúng với quyết định "mỗi ô chạy độc lập". Cái giá: ô kế tiếp phải tải lại Pyodide (vài giây, file đã nằm trong cache trình duyệt) |

Chọn **B**. Nút Dừng thuộc về một ô, nên chỉ được ảnh hưởng tới ô đó. Ô đang chờ khi chuyển sang worker mới sẽ hiện lại bước "Đang tải Python…", nên người đọc hiểu vì sao phải chờ.

**Ngoại lệ: tải Pyodide thất bại.** Khi đó mọi ô đang chờ cũng kết thúc `load-failed` ngay, để trang không thử lại CDN nhiều lần liên tiếp. Mỗi ô có nút "Thử lại" riêng.

**Gợi ý bấm Dừng sau 10 giây.**

- Island bật một bộ đếm `LONG_RUN_HINT_MS = 10_000` khi nhận trạng thái `running`.
  - Không đếm lúc `queued` hay lúc đang tải, vì tải gói trên mạng chậm có thể lâu hơn 10 giây mà không có gì sai.
  - Hết giờ mà vẫn `running` thì hiện chuỗi `runner.longRunning` trong vùng trạng thái (`aria-live="polite"`, đọc một lần).
  - Bộ đếm bị xóa khi chạy xong, khi bấm Dừng, hoặc khi island bị gỡ.
- Không tự ngắt (quyết định 10).

### 2.7. Giới hạn output và gom stdout (điểm b1)

Code như `while True: print(i)` có thể đẩy hàng triệu dòng. Nếu gửi từng dòng sang luồng chính rồi render từng dòng, trang sẽ treo.

- **Cắt ở worker.** Lý do: dữ liệu thừa không bao giờ đi qua `postMessage` (mỗi tin nhắn phải sao chép dữ liệu), và luồng chính không phải đếm. Luồng chính không cắt lần hai.
- **Ngưỡng:**
  - `OUTPUT_LIMIT_CHARS = 100_000` ký tự cho mỗi lần chạy, tính chung stdout và stderr. Khoảng 2.000 dòng, đủ cho mọi ví dụ trong bài và vẫn nhẹ cho DOM.
  - Traceback lỗi không tính vào ngưỡng.
  - Vượt ngưỡng thì worker gửi nốt phần vừa đủ ngưỡng, đặt `outputTruncated = true` và bỏ phần sau. **Code vẫn chạy tiếp.** Người đọc thấy gợi ý bấm Dừng sau 10 giây nếu code không tự dừng.
- **Gom theo nhịp ở worker.**
  - `setStdout({ batched })` gọi handler mỗi dòng. Chuỗi nhận được không kèm `\n`, nên worker tự thêm `\n`.
  - Worker gom các dòng vào bộ đệm và gửi một tin `output` khi đã qua `FLUSH_INTERVAL_MS = 50` ms kể từ lần gửi trước, hoặc khi bộ đệm đạt `FLUSH_MAX_CHARS = 16_384` ký tự. Chạy xong thì gửi nốt phần còn lại trước tin `done`.
  - Việc kiểm tra thời gian làm **ngay trong handler** (`performance.now()`), không dùng `setTimeout`. Lý do: khi Python chạy đồng bộ, vòng sự kiện của worker bị chặn, nên `setTimeout` không chạy cho tới khi code xong.
- **Gom ở luồng chính.** Island đẩy chunk vào một `ref`, rồi cập nhật state tối đa một lần mỗi khung hình (`requestAnimationFrame`). Các chunk liền nhau cùng luồng (stdout/stderr) được nối lại thành một `<span>`.
- Logic bộ đệm nằm trong module thuần `src/lib/pyodide/output-buffer.ts` (đồng hồ truyền vào được), để test bằng Vitest mà không cần Pyodide.
- Vượt ngưỡng thì dưới output hiện `runner.outputTruncated`.
- **Hạn chế đã biết:** Pyodide không cho biết chuỗi nhận được là cả dòng hay nửa dòng được `flush()`. Vì vậy `print("a", end="")` rồi `flush()` vẫn bị xuống dòng. Chấp nhận được với ví dụ trong bài.

### 2.8. Lỗi và biểu đồ (điểm b4)

**Code lỗi vẫn trả về các figure đã vẽ trước lúc lỗi.** Người học thường vẽ xong rồi mới sai ở dòng sau. Thấy hình giúp họ biết phần nào đã chạy đúng.

- Worker xuất hình trong khối `finally`, chạy cả khi thành công lẫn khi lỗi:
  1. `sys.stdout.flush()`, `sys.stderr.flush()` để lấy nốt nửa dòng cuối.
  2. Nếu `'matplotlib.pyplot' in sys.modules`: với mỗi figure (tối đa `MAX_FIGURES = 10`), `savefig(BytesIO, format='png', dpi=100, bbox_inches='tight')` rồi mã hóa base64.
     - Mỗi figure bọc `try/except` riêng: figure vẽ dở mà lỗi khi lưu thì bỏ qua figure đó.
     - Số figure bị bỏ vì vượt 10 ghi vào `figuresDropped`.
  3. `plt.close('all')`.
- Hàm xuất hình là Python của worker, chạy trong namespace riêng của worker, **không** nằm trong `globals` của người dùng.
- Mỗi lần chạy cũng gọi `plt.close('all')` trước khi chạy, phòng hình còn sót.
- Giao diện xếp theo thứ tự: output chữ → khung lỗi → biểu đồ. Nếu có lỗi và có hình, trên các hình có dòng `runner.figuresBeforeError`.

**Đọc lỗi.** Worker bắt `PythonError` và gửi `errorType = err.type` (Pyodide có sẵn tên lớp lỗi) cùng `traceback = err.message`. Luồng chính gọi `parsePythonError()`:

- **Dòng lỗi** = số dòng trong `File "<exec>", line N` **cuối cùng** (frame sâu nhất thuộc code người dùng). Ví dụ lỗi trong hàm `f` gọi từ dòng 4: lấy dòng 2, nơi lỗi thật sự xảy ra.
- **Traceback hiển thị** = dòng `Traceback (most recent call last):` + các dòng từ frame `File "<exec>"` đầu tiên trở đi. Các frame nội bộ `/lib/python314.zip/_pyodide/...` bị bỏ.
- **Thông báo** = phần sau `Loại lỗi: ` ở dòng cuối.
- Vì tên file `<exec>`, traceback không in dòng code. Giao diện tự lấy dòng N từ code đang chạy và hiện ngay dưới "Lỗi ở dòng N".
- Traceback thật của Pyodide 314.0.7 (chạy trong Node ngày 23/10/2026) ở [Phụ lục A](#phụ-lục-a-traceback-thật-của-pyodide-31407), dùng làm fixture cho test.

### 2.9. Id duy nhất khi một trang có nhiều Quiz hoặc PythonRunner (điểm b6)

**Chọn: dùng `useId()` của React trong island. Bỏ prop `idPrefix`.**

- `@astrojs/react` 7.1.1 gán cho mỗi island một thuộc tính `prefix` (`r0`, `r1`, … tăng dần trong một trang).
  - Lúc build, giá trị này được truyền làm `identifierPrefix` cho `renderToString`.
  - Lúc hydrate, nó được truyền làm `identifierPrefix` cho `hydrateRoot`.
  - Đã đọc mã nguồn `server.js`, `client.js`, `context.js`.
- Vì vậy `useId()` cho chuỗi **khác nhau giữa các island** và **giống nhau giữa build và trình duyệt**. Không lỗi hydrate, không cần wrapper sinh id.
- **Cách dùng:**
  - `const uid = useId();` rồi ghép: `${uid}-q${i}` (tên nhóm radio), `${uid}-q${i}-o${j}` (id đáp án), `${uid}-code`, `${uid}-stdin`, `${uid}-output`.
  - Chỉ dùng cho `id`, `for`/`htmlFor`, `name`, `aria-*`. **Không** dùng làm selector CSS hay `querySelector`, vì chuỗi `useId` có thể chứa ký tự cần escape. Test tìm phần tử theo role và nhãn.
- Phần Astro (Prerequisites, LessonProgress) không cần id. `RoadmapMap` đã có prop `id`.
- Kiểm chứng bằng e2e: trang demo có **hai** quiz và **hai** PythonRunner. Chọn đáp án ở quiz 1 không đổi lựa chọn ở quiz 2. Không có `id` nào trùng (mục 6, M1-7 ý d).

### 2.10. Lọc trang demo khỏi sitemap (quyết định 11)

**Cách đã chọn: khai báo `@astrojs/sitemap` tường minh, có `filter`. Đã kiểm tra hợp với Starlight 0.42.6 / Astro 7.4.2.**

- Starlight tự thêm sitemap trong `astro:config:setup` (`dist/index.js`), nhưng **chỉ khi chưa có integration tên `@astrojs/sitemap`**:

  ```js
  if (!allIntegrations.find(({ name }) => name === "@astrojs/sitemap")) integrations.push(starlightSitemap(starlightConfig));
  ```

  Tự khai báo thì Starlight không thêm bản thứ hai.
- Bản của Starlight chỉ đặt tùy chọn `i18n` (`dist/integrations/sitemap.js`). Ta phải chép lại tùy chọn này, nếu không sitemap mất các dòng `hreflang` (`sitemap-0.xml` hiện có `xhtml:link hreflang="vi|en"`).
- `@astrojs/sitemap` 3.7.4 đã có trong `node_modules` (Starlight phụ thuộc `^3.7.3`). Ta cài tường minh cùng bản để import được và ghim chính xác.

```ts
// astro.config.ts (excerpt)
import sitemap from '@astrojs/sitemap';

integrations: [
  starlight({ /* unchanged */ }),
  // Declared explicitly so Starlight skips its own copy. Same i18n option as Starlight's
  // (node_modules/@astrojs/starlight/dist/integrations/sitemap.js), plus a filter.
  sitemap({
    i18n: { defaultLocale: 'vi', locales: { vi: 'vi', en: 'en' } },
    // Internal pages (/vi/dev/…, /en/dev/…) stay deployed and noindex, but out of the sitemap.
    filter: (page) => !/^\/(vi|en)\/dev\//.test(new URL(page).pathname),
  }),
  react(),
],
```

- Từ M2, `filter` chuyển thành `isInSitemap` trong `src/lib/seo.ts`, bỏ thêm trang fallback của bài chưa dịch (quyết định 30, [README.md](README.md) mục 3.1).
- Trang demo vẫn giữ `noindex` và `pagefind: false` trong frontmatter.
- Kiểm tra (e2e, chạy trong CI):
  - `GET /sitemap-0.xml` không chứa `/dev/`.
  - Vẫn chứa `/vi/` và `/en/`, kèm `hreflang="vi"` và `hreflang="en"`.
- Phương án dự phòng nếu bản nâng cấp sau của Starlight đổi cách phát hiện: dùng hook `astro:build:done` sửa file XML. Hiện chưa cần.

### 2.11. Chiến lược test

**Test khi chưa có bài published (điểm b7).** Cả 78 bài đang `planned`, nên trên trang thật không có link nào để kiểm tra. Cách xử lý:

- Quy tắc "bài này hiện link hay chữ, có nhãn gì" tách thành hàm thuần `lessonLinkView()` trong `src/lib/lesson-link.ts`. Hàm nhận **đối tượng `Lesson`** (không nhận id), nên test truyền được fixture có `status: { vi: 'published', en: 'planned' }`.
- `Prerequisites.astro` và `RoadmapMap.astro` đều gọi hàm này. RoadmapMap bỏ logic `hasPage`/`isTranslated` viết riêng. Hai nơi cùng một quy tắc.
- Phép đếm "Đã học x/y" là hàm thuần `countDone()` trong `progress.ts`.
- Phần gắn `data-done` (`applyProgressMarks`) test bằng jsdom với Storage giả.

**Pyodide.**

| Test | Chạy ở | Cách |
|---|---|---|
| `parsePythonError`, `hintKeyFor` | CI | Fixture traceback thật (Phụ lục A) |
| `output-buffer.ts` | CI | Đồng hồ giả: gom theo 50 ms, cắt ở ngưỡng, `truncated` |
| `client.ts` (hàng đợi, Dừng, tải lỗi) | CI | `createPythonClient(fakeWorkerFactory)`: worker giả, không cần Pyodide |
| `PythonRunnerIsland` | CI | Testing Library, `vi.mock('@lib/pyodide/client')` |
| E2E không mạng | CI | Mở trang demo: **không có request nào tới `cdn.jsdelivr.net/pyodide`**. Bấm Chạy với `page.route('**/pyodide/**', r => r.abort())`: có request bị chặn, hiện "Không tải được Python" và nút Thử lại |
| E2E `@network` | Chạy tay | Tải Pyodide thật: output đúng, có `<img>` biểu đồ, lỗi có tên và số dòng, Dừng, hai ô xếp hàng |

**Script.**

```json
"test:e2e": "playwright test --grep-invert @network",
"test:e2e:network": "playwright test --grep @network --project=desktop"
```

- Dùng cờ dòng lệnh thay vì biến môi trường, để chạy được cả trên Windows (`cmd`) lẫn CI.
- CI vẫn gọi `npm run test:e2e -- --forbid-only …`, nên tự loại test `@network`.
- Test mạng gắn tag theo cú pháp Playwright: `test('…', { tag: '@network' }, async ({ page }) => …)`, kèm `test.setTimeout(120_000)`.
- Chỉ chạy project `desktop`, vì mỗi project là một trình duyệt mới và phải tải lại khoảng 10 MB. Phần kiểm tra 375px trong test mạng đổi viewport bằng `page.setViewportSize({ width: 375, height: 800 })`.
- Chạy `npx playwright test` trực tiếp thì có cả test mạng. Đây là chủ đích, để chạy hết khi cần.
- E2E chạy preview ở **cổng 4322**, không phải 4321 (cổng của `npm run dev`). Với `reuseExistingServer`, nếu dùng chung 4321 thì test sẽ âm thầm chạy trên dev server. Xem [scaffold.md](scaffold.md) mục 4.10.

## 3. Cấu trúc file

```
src/
├─ components/
│  ├─ Prerequisites.astro             # list from roadmap.ts + ✓ script
│  ├─ Quiz.astro                      # wrapper: frontmatter quiz → renderInlineMarkup → island
│  ├─ quiz/
│  │  ├─ QuizIsland.tsx               # React
│  │  └─ quiz.css                     # in Starlight's customCss (decision 13)
│  ├─ LessonProgress.astro            # button + custom element <atlas-lesson-progress>
│  ├─ PythonRunner.astro              # wrapper: <Code> static + strings + island
│  ├─ python-runner/
│  │  ├─ PythonRunnerIsland.tsx       # React: buttons, state, editor, status
│  │  ├─ OutputPanel.tsx              # React: text output, error, figures
│  │  ├─ python-ready.ts              # tiny shared store: "Pyodide loaded once on this page"
│  │  └─ python-runner.css            # in Starlight's customCss (decision 13)
│  └─ RoadmapMap.astro                # existing; adds ✓, "Đã học x/y", uses lessonLinkView, toScriptJson
├─ lib/
│  ├─ inline-markup.ts                # existing (M0), reused; + inlineMarkupLabel() (decision 12)
│  ├─ script-json.ts                  # NEW pure: toScriptJson() for <script type="application/json">
│  ├─ lesson-link.ts                  # NEW pure: lessonLinkView()
│  ├─ progress.ts                     # NEW: storage-safe progress store, countDone()
│  ├─ progress-marks.ts               # NEW: applyProgressMarks() for [data-lesson-id]
│  ├─ quiz-schema.ts                  # NEW: zod schema for frontmatter `quiz`
│  └─ pyodide/
│     ├─ config.ts                    # version, CDN URL, limits
│     ├─ protocol.ts                  # message types main <-> worker
│     ├─ output-buffer.ts             # pure: batching + limit (used by worker.ts)
│     ├─ client.ts                    # main thread: worker, queue, run/stop
│     ├─ worker.ts                    # module worker: load Pyodide, run, figures
│     └─ errors.ts                    # pure: parsePythonError(), hintKeyFor()
├─ i18n/
│  ├─ ui.ts                           # + namespaces prereq, quiz, progress, runner; + keys in common, roadmap
│  └─ format.ts                       # existing (M0), reused
├─ styles/
│  ├─ custom.css                      # + .atlas-check / .atlas-cross icon masks (section 4.9.1)
│  ├─ roadmap-map.css                 # RoadmapMap + Stripe + RouteMark, moved out of <style> (decision 13)
│  ├─ prerequisites.css               # moved out of Prerequisites.astro <style>
│  └─ lesson-progress.css             # moved out of LessonProgress.astro <style>
├─ code/dev/                          # demo code: hello, plot, error, slow, input (.vi.py + .en.py)
└─ content/docs/{vi,en}/dev/components.mdx   # demo page (exists; M1 adds components + frontmatter quiz)
tests/unit/
├─ lesson-link.test.ts  progress.test.ts  progress-marks.test.ts      # progress-marks: jsdom
├─ quiz-schema.test.ts  python-errors.test.ts  output-buffer.test.ts  python-client.test.ts  script-json.test.ts
├─ code-pairs.test.ts   deps.test.ts (extended)
├─ quiz-island.test.tsx  python-runner-island.test.tsx               # jsdom + Testing Library
└─ fixtures/pyodide-tracebacks.ts                                     # Appendix A, verbatim
tests/e2e/
├─ components.spec.ts        # CI: no Pyodide on load, load-failed path, quiz, progress, 375px, themes, sitemap
└─ python-network.spec.ts    # @network only
```

**CSS nằm trong `customCss` của Starlight** (quyết định 13, sửa ngày 23/10/2026). Trước đó CSS được import ở frontmatter của wrapper `.astro` và trong khối `<style>`. Cách đó sinh ra file CSS riêng của trang (`_astro/Quiz.*.css`) và một file dùng chung giữa trang chủ và trang có `RoadmapMap` (`_astro/inline-markup.*.css`). Cả hai đều chặn render. File dùng chung còn nạp sau CSS của trang chủ, nên `.route-mark { height: 1em }` đè lên `.fork-mark { height: 96px }` và `.hero-mark`.

- `astro.config.ts` liệt kê, sau `custom.css`: `src/styles/roadmap-map.css`, `src/styles/prerequisites.css`, `src/styles/lesson-progress.css`, `src/components/quiz/quiz.css`, `src/components/python-runner/python-runner.css`. Không file `.astro`/`.tsx` nào của các component này còn import CSS hay có `<style>`.
- Mọi trang tải thêm khoảng 2,3 KB gzip. Đổi lại, trang bài học chỉ còn CSS chung của Starlight (cộng `ec.*.css` của Expressive Code khi trang có khối code). CSS vẫn có ngay cả trước khi island hydrate.
- **Giữ phạm vi bằng tiền tố.** Lớp của component bài học đều có tiền tố `atlas-quiz-`, `atlas-runner-`, `atlas-prereq-`, `atlas-progress-`, nên chép nguyên. Lớp của `RoadmapMap` không có tiền tố riêng (`.part-head`, `.is-soon`, `.sr-only`…), nên mỗi selector có `:where(.roadmap)` đứng trước. `:where()` không cộng độ ưu tiên, nên độ ưu tiên giữ đúng như `:where(.astro-…)` của Astro trước đây.
- `Stripe` và `RouteMark` (dùng cả ở trang chủ) viết bằng `:where(.stripe)`, `:where(.route-mark)` (độ ưu tiên 0). Lớp mà component cha truyền vào luôn thắng, bất kể thứ tự CSS.
- Test e2e "homepage CSS does not leak" vẫn qua. Kiểm tra trong `dist`: không còn `Quiz.*.css` và `inline-markup.*.css`.

Gốc của mỗi component có lớp **`not-content`**. Starlight dùng lớp này để bỏ style Markdown (margin, gạch đầu dòng của `ul`) cho phần bên trong. Đã kiểm tra trong `markdown.css` của Starlight 0.42.6.

## 4. Giao diện

### 4.1. Phần dùng chung

```ts
// src/lib/progress.ts — no DOM imports except Storage/window access inside functions
export const PROGRESS_STORAGE_KEY = 'ai-atlas:progress:v1';
export const PROGRESS_EVENT = 'atlas:progress-change'; // CustomEvent on window, same-tab sync

export interface ProgressData {
  version: 1;
  lessons: Partial<Record<LessonId, { doneAt: string }>>; // ISO date; keyed by lesson id, shared by vi/en
}

export interface ProgressStore {
  available: boolean;                      // false when storage is missing or throws
  get(): ProgressData;                     // corrupt/missing data -> empty, never throws
  isDone(id: string): boolean;
  setDone(id: string, done: boolean): void; // falls back to memory when storage is blocked
  subscribe(listener: (data: ProgressData) => void): () => void; // 'storage' event + PROGRESS_EVENT
}

/** For tests: pass a fake Storage, one whose methods throw, or null. */
export function createProgressStore(storage: Storage | null, target?: EventTarget): ProgressStore;
/** The page-wide store over window.localStorage (created lazily, safe when access throws). */
export function getProgressStore(): ProgressStore;

/** Pure: how many of `ids` are done. */
export function countDone(ids: readonly string[], isDone: (id: string) => boolean): number;
```

```ts
// src/lib/progress-marks.ts — used by <script> in Prerequisites and RoadmapMap. No React.
/**
 * Sets data-done="true|false" on every [data-lesson-id] inside root.
 * Fills every [data-progress-summary] (template in data-template, {{done}} and {{total}}):
 * ids are the [data-lesson-id] inside its closest [data-progress-scope]; hidden while done === 0.
 * Re-applies on store changes. Returns an unsubscribe function.
 */
export function applyProgressMarks(root?: ParentNode, store?: ProgressStore): () => void;
```

```ts
// src/lib/lesson-link.ts — pure; relative imports only
import type { Lesson, LessonId, Locale } from '../data/roadmap';

export type LessonLinkState = 'open' | 'untranslated' | 'soon';
export interface LessonLinkView {
  id: LessonId;
  title: string;          // title[locale], or shortTitle[locale] when opts.short
  state: LessonLinkState; // soon: no vi page; untranslated: vi page only, viewing en
  href?: string;          // only when state !== 'soon', e.g. '/en/ml/linear-regression/'
}
export function lessonLinkView(lesson: Lesson, locale: Locale, opts?: { short?: boolean }): LessonLinkView;
```

Bảng quy tắc (fixture trong `lesson-link.test.ts` phải phủ đủ 5 dòng):

| `status.vi` | `status.en` | Trang `vi` | Trang `en` |
|---|---|---|---|
| planned | planned | `soon`, không `href` | `soon`, không `href` |
| published | planned | `open`, `/vi/<id>/` | `untranslated`, `/en/<id>/` (trang fallback của Starlight) |
| published | published | `open`, `/vi/<id>/` | `open`, `/en/<id>/` |

Thêm hai dòng: `opts.short` dùng `shortTitle` khi có, và quay về `title` khi không có.

**Thuộc tính `lang` (WCAG 3.1.2, thêm ở M2).**

- Phần tử gốc của mỗi component bài học (`Prerequisites`, `LessonProgress`, `Quiz`, `PythonRunner`, `DatasetTable`, mọi VIZ) có `lang={locale}`, đặt ở wrapper `.astro`, ngoài island.
- Lý do: trang fallback `/en/<bài>/` có `<main lang="vi">` vì hiện file vi, còn chữ giao diện của component là tiếng Anh. Không khai báo lại thì trình đọc màn hình đọc chữ tiếng Anh bằng giọng Việt.
- Phần lấy từ file bài giữ ngôn ngữ của file. Khi `starlightRoute.isFallback`, các phần này có `lang={starlightRoute.entryMeta.lang}`:
  - `Quiz`: câu hỏi, đáp án (cả radio) và giải thích. Island nhận giá trị qua prop `contentLang`, nên HTML lúc build và lúc hydrate giống nhau.
  - `PythonRunner`: tiêu đề và khối code tĩnh. Nút sao chép của Expressive Code nằm trong khối code nên theo ngôn ngữ của file, giống mọi khối code khác trên trang.
- Chưa đánh dấu: code đang sửa và output của `PythonRunner` (trong island), tên nhóm của câu hỏi quiz (`aria-label` ghép "Question n of N" với câu hỏi). Hết khi bài có bản en.
- Trang thường (không fallback) không có `lang` nào bên trong component.

### 4.2. Bảng chuỗi giao diện của M1 (cuối cùng)

So với `src/i18n/ui.ts` hiện có (`common`, `home`, `notFound`, `roadmap`), M1:

- thêm 3 key vào `common` và 3 key vào `roadmap`;
- thêm namespace `prereq` (1 key), `quiz` (10), `progress` (3), `runner` (39).

`home` và `notFound` giữ nguyên.

Mọi key dưới đây có trong cả `vi.json` và `en.json` (schema i18n bắt build lỗi nếu thiếu). Placeholder theo kiểu `{{name}}` của `formatString`, và **giống nhau giữa vi và en** (`i18n.test.ts` đã kiểm tra).

```ts
// src/i18n/ui.ts — final M1 shape (home, notFound unchanged)
export const UI_KEYS = {
  common: ['comingSoon', 'notTranslated', 'learned', 'needsScript', 'lessonsOn'],
  home: [/* unchanged */],
  notFound: [/* unchanged */],
  roadmap: ['lessons', 'branchNote', 'routeLabel', 'routeResult', 'showOnMap', 'legendOpen', 'legendSoon',
            'legendNone', 'progressSummary', 'progressTotal', 'legendDone'],
  prereq: ['none'],
  quiz: ['question', 'check', 'retry', 'chooseOne', 'correct', 'incorrect', 'correctAnswer', 'yourAnswer',
         'explanation', 'score'],
  progress: ['markDone', 'doneStatus', 'storageBlocked'],
  runner: ['run', 'stop', 'edit', 'reset', 'retry', 'editorLabel', 'editorHint', 'input',
           'firstRunNote', 'queued', 'loadingPython', 'loadingPackages', 'running', 'longRunning',
           'done', 'stopped', 'loadFailed',
           'output', 'noOutput', 'outputTruncated', 'figure', 'figuresTruncated', 'figuresBeforeError',
           'errorTitle', 'errorLine', 'showTraceback', 'stdinMissing',
           'hintNameError', 'hintSyntaxError', 'hintIndentationError', 'hintTypeError', 'hintValueError',
           'hintIndexError', 'hintKeyError', 'hintAttributeError', 'hintZeroDivisionError',
           'hintModuleNotFoundError', 'hintEOFError', 'hintGeneric'],
} as const satisfies Record<string, readonly string[]>;
```

Key đầy đủ có dạng `atlas.<namespace>.<key>`. **Mới** = thêm ở M1. **Có** = đã có từ M0, ghi lại để đủ bảng.

**`common`**

| Key | vi | en | |
|---|---|---|---|
| `comingSoon` | Sắp có | Coming soon | Có |
| `notTranslated` | Chưa dịch | Not translated yet | Có |
| `learned` | Đã học | Learned | Mới. Chữ ẩn đi kèm dấu ✓ |
| `needsScript` | Cần bật JavaScript để dùng phần này. | Turn on JavaScript to use this part. | Mới. Trong `<noscript>` của Quiz, LessonProgress, PythonRunner |
| `lessonsOn` | thuộc phần {{part}} | in {{part}} | Mới. Chữ ẩn sau tên bài ở Prerequisites, đọc "Hồi quy tuyến tính, thuộc phần Học máy" |

**`roadmap`**

| Key | vi | en | |
|---|---|---|---|
| `lessons` | {{count}} bài | {{count}} lessons | Có |
| `branchNote` | Sau Học sâu, chọn một nhánh | After Deep Learning, pick a branch | Có |
| `routeLabel` | Điểm đến | Destination | Có |
| `routeResult` | Đường tới {{lesson}}: {{count}} bài, qua {{parts}} phần. | Route to {{lesson}}. Lessons on the way: {{count}}. Parts: {{parts}}. | Có |
| `showOnMap` | Xem trên bản đồ | Show on the map | Có |
| `legendOpen` | Chữ đậm: bài đã mở | Bold: open now | Có |
| `legendSoon` | Chữ nhạt: sắp có | Faded: coming soon | Có |
| `legendNone` | Chưa bài nào được mở. Bài mở sẽ in đậm và có link. | No lesson is open yet. Open lessons appear in bold, with a link. | Có |
| `progressSummary` | Đã học {{done}}/{{total}} | Learned {{done}}/{{total}} | Mới. Mỗi phần |
| `progressTotal` | Bạn đã học {{done}}/{{total}} bài. | You have learned {{done}} of {{total}} lessons. | Mới. Cả bản đồ, ở chú giải |
| `legendDone` | Dấu ✓: bài bạn đã học | Tick: lessons you have learned | Mới. Chú giải, chỉ hiện khi đã học ít nhất 1 bài |

**`prereq`**

| Key | vi | en |
|---|---|---|
| `none` | Bài này không cần kiến thức trước. Bạn bắt đầu ngay được. | This lesson needs nothing before it. You can start right away. |

**`quiz`**

| Key | vi | en | Ghi chú |
|---|---|---|---|
| `question` | Câu {{n}}/{{total}} | Question {{n}} of {{total}} | Dòng nhỏ trong `<legend>` |
| `check` | Kiểm tra | Check | |
| `retry` | Làm lại | Try again | |
| `chooseOne` | Bạn chọn một đáp án trước nhé. | Pick an answer first. | Khi bấm Kiểm tra mà chưa chọn |
| `correct` | Đúng rồi. | Correct. | |
| `incorrect` | Chưa đúng. | Not quite. | |
| `correctAnswer` | Đáp án đúng | Correct answer | Nhãn cạnh đáp án đúng sau khi chấm |
| `yourAnswer` | Bạn chọn | Your answer | Nhãn cạnh đáp án sai mà người đọc chọn |
| `explanation` | Giải thích | Explanation | |
| `score` | Bạn đúng {{correct}}/{{total}} câu. | You got {{correct}} of {{total}} right. | Khi đã chấm hết các câu |

**`progress`**

| Key | vi | en | Ghi chú |
|---|---|---|---|
| `markDone` | Tôi đã học xong bài này | I have finished this lesson | Nhãn **cố định** của nút bật/tắt (mục 4.5) |
| `doneStatus` | Đã lưu. Bấm lần nữa nếu muốn bỏ đánh dấu. | Saved. Press again to unmark it. | Hiện khi đang bật |
| `storageBlocked` | Trình duyệt đang chặn lưu dữ liệu. Tiến độ sẽ mất khi bạn tải lại trang. | Your browser is blocking storage. Your progress will be lost when you reload the page. | |

**`runner`**

| Key | vi | en |
|---|---|---|
| `run` | Chạy | Run |
| `stop` | Dừng | Stop |
| `edit` | Sửa code | Edit code |
| `reset` | Khôi phục code gốc | Restore original code |
| `retry` | Thử lại | Try again |
| `editorLabel` | Code Python | Python code |
| `editorHint` | Tab chèn 4 dấu cách. Bấm Esc rồi Tab để rời ô. Ctrl+Enter để chạy. | Tab inserts 4 spaces. Press Esc, then Tab, to leave. Ctrl+Enter runs the code. |
| `input` | Dữ liệu nhập cho input(), mỗi dòng một lần đọc | Input for input(), one line per read |
| `firstRunNote` | Lần chạy đầu cần tải Python, khoảng 10 MB. | The first run downloads Python, about 10 MB. |
| `queued` | Đang chờ ô code khác chạy xong… | Waiting for another code block to finish… |
| `loadingPython` | Đang tải Python… | Loading Python… |
| `loadingPackages` | Đang tải thư viện: {{packages}}… | Loading libraries: {{packages}}… |
| `running` | Đang chạy… | Running… |
| `longRunning` | Code đã chạy hơn {{seconds}} giây. Nếu nó bị kẹt, bạn bấm Dừng. | This code has run for over {{seconds}} seconds. If it is stuck, press Stop. |
| `done` | Chạy xong sau {{seconds}} giây. | Finished in {{seconds}} seconds. |
| `stopped` | Đã dừng. Bạn có thể sửa code rồi chạy lại. | Stopped. You can edit the code and run it again. |
| `loadFailed` | Không tải được Python. Bạn kiểm tra kết nối mạng rồi thử lại. | Could not load Python. Check your connection and try again. |
| `output` | Kết quả | Output |
| `noOutput` | Chương trình chạy xong, không in gì. | The program finished without printing anything. |
| `outputTruncated` | Kết quả in ra quá dài, nên chỉ hiện phần đầu. | The output is too long, so only the beginning is shown. |
| `figure` | Biểu đồ {{n}} | Figure {{n}} |
| `figuresTruncated` | Chỉ hiện {{count}} biểu đồ đầu tiên. | Only the first {{count}} figures are shown. |
| `figuresBeforeError` | Biểu đồ đã vẽ được trước khi gặp lỗi: | Figures drawn before the error: |
| `errorTitle` | Code có lỗi | The code has an error |
| `errorLine` | Lỗi ở dòng {{line}}: | Error on line {{line}}: |
| `showTraceback` | Xem toàn bộ thông báo lỗi | Show the full error message |
| `stdinMissing` | Code gọi input(), nhưng ô này không có dữ liệu nhập. Trên trang, input() không hỏi bạn được. | The code calls input(), but this block has no input data. On this page, input() cannot ask you. |
| `hintNameError` | Python không biết tên này. Bạn kiểm tra chính tả, hoặc xem biến đã được gán ở dòng trên chưa. | Python does not know this name. Check the spelling, or check that the variable is set on an earlier line. |
| `hintSyntaxError` | Câu lệnh viết sai cú pháp. Bạn xem dấu ngoặc, dấu hai chấm và dấu nháy ở dòng này hoặc dòng ngay trên. | The statement breaks Python's grammar. Check brackets, colons and quotes on this line or the line above. |
| `hintIndentationError` | Thụt lề chưa đúng. Các dòng trong cùng một khối phải thụt lề bằng nhau, thường là 4 dấu cách. | The indentation is off. Lines in one block need the same indent, usually 4 spaces. |
| `hintTypeError` | Phép toán hoặc hàm nhận sai kiểu dữ liệu, ví dụ cộng số với chuỗi. | An operation or function got the wrong type, for example a number plus a string. |
| `hintValueError` | Kiểu dữ liệu đúng nhưng giá trị không hợp lệ, ví dụ kích thước mảng không khớp. | The type is right but the value is not, for example array sizes that do not match. |
| `hintIndexError` | Chỉ số vượt quá độ dài danh sách hoặc mảng. Chỉ số trong Python bắt đầu từ 0. | The index is past the end of the list or array. Python counts from 0. |
| `hintKeyError` | Khóa này không có trong dict, hoặc tên cột không có trong bảng. | This key is not in the dict, or this column is not in the table. |
| `hintAttributeError` | Đối tượng này không có thuộc tính hay phương thức đó. Bạn kiểm tra chính tả và kiểu của đối tượng. | This object has no such attribute or method. Check the spelling and the object's type. |
| `hintZeroDivisionError` | Có một phép chia cho 0. | Something is divided by zero. |
| `hintModuleNotFoundError` | Thư viện này không có trên trang. Ở đây chỉ có numpy, pandas, matplotlib, scipy và scikit-learn. | This library is not available on the page. Only numpy, pandas, matplotlib, scipy and scikit-learn are. |
| `hintEOFError` | Code đọc input() nhiều lần hơn số dòng trong ô dữ liệu nhập. | The code reads input() more times than there are lines in the input box. |
| `hintGeneric` | Bạn đọc dòng cuối của thông báo lỗi: nó cho biết loại lỗi và lý do. | Read the last line of the error message: it names the error and the reason. |

Chuỗi `runner.done` và `runner.longRunning` nhận `{{seconds}}` đã định dạng theo ngôn ngữ trang: `new Intl.NumberFormat(lang, { maximumFractionDigits: 1 })`, ra "1,2" ở vi và "1.2" ở en. `{{packages}}` là tên gói nối bằng `, `.

### 4.3. `Prerequisites` (Astro)

```ts
// src/components/Prerequisites.astro
interface Props {
  /** Override. Default: prerequisites of the current lesson from roadmap.ts. */
  ids?: LessonId[];
}
```

```mdx
<Prerequisites />
```

Hành vi:

- Không có `ids`: lấy bài hiện tại bằng `getRouteLessonId(Astro.locals.starlightRoute.id)`, rồi lấy `getPrerequisites()`. Trang không phải bài học mà không truyền `ids` → **build lỗi**, thông báo rõ.
- `ids` chứa id không có trong roadmap → build lỗi (`requireLesson`).
- Mỗi mục lấy từ `lessonLinkView(lesson, locale)` (tiêu đề đầy đủ, không dùng `shortTitle`), kèm tên phần (`getPart(getPartIdOf(id)).title[locale]`).
  - Tên phần hiện ra có `aria-hidden="true"`. Ngay sau tên bài có chữ ẩn `sr-only` dạng `, ` + `formatString(common.lessonsOn, { part })`, để trình đọc màn hình đọc "Hồi quy tuyến tính, thuộc phần Học máy" thay vì hai cụm rời.
  - `open`: link.
  - `untranslated`: link + nhãn "Chưa dịch".
  - `soon`: chữ thường + nhãn "Sắp có", **không có link**.
- Danh sách rỗng: hiện `atlas.prereq.none`.
- Mỗi `<li>` có `data-lesson-id`. Script nhỏ gọi `applyProgressMarks(rootElement)`.
- HTML: `<ul>` thường, không cần ARIA đặc biệt.

### 4.4. `Quiz` (Astro wrapper + React island)

Schema frontmatter, thêm vào `docsSchema({ extend })` trong `src/content.config.ts`:

```ts
// src/lib/quiz-schema.ts (imported by content.config.ts; use `z` from 'astro/zod')
export const quizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  answer: z.number().int().min(0),            // 0-based index into options
  explanation: z.string().min(1),             // required: the template asks to explain answers
}).refine((q) => q.answer < q.options.length, { message: 'answer is out of range' });

export const quizSchema = z.array(quizQuestionSchema).min(1).max(10);
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
// content.config.ts: docsSchema({ extend: z.object({ quiz: quizSchema.optional() }) })
```

```yaml
quiz:
  - question: 'Nếu $\eta$ quá lớn, gradient descent có thể làm gì?'
    options:
      - 'Hội tụ nhanh hơn và luôn tới cực tiểu'
      - 'Dao động hoặc phân kỳ'
    answer: 1
    explanation: 'Bước nhảy quá dài làm $\mathcal{L}$ tăng thay vì giảm.'
```

Quy tắc viết: **luôn dùng nháy đơn `'...'`** cho chuỗi có `$` hoặc `\`. Trong nháy đơn YAML, `\` giữ nguyên. Muốn có dấu `'` thì gõ `''`.

```ts
// src/components/Quiz.astro
interface Props {
  /** Demo page and a rare second quiz on one page. Strings must not contain "\" (JS escapes). */
  questions?: QuizQuestion[];
}
// Uses props.questions ?? starlightRoute.entry.data.quiz; build error if neither exists.
// Renders <div class="atlas-quiz not-content" lang={locale}><QuizIsland client:visible questions={rendered}
//   strings={getStrings(t, 'quiz')} contentLang={…} /><noscript>…common.needsScript…</noscript></div>
//   (contentLang: section 4.1, attribute lang)
```

```ts
// src/components/quiz/QuizIsland.tsx
export interface RenderedQuizQuestion {
  questionHtml: string;     // renderInlineMarkup output (trusted: build time, repo content)
  optionsHtml: string[];
  answer: number;
  explanationHtml: string;
  questionLabel: string;    // inlineMarkupLabel output: plain text, TeX source (decision 12)
  optionLabels: string[];
}
export interface QuizIslandProps {
  questions: RenderedQuizQuestion[];
  strings: UiStrings<'quiz'>;
}
export default function QuizIsland(props: QuizIslandProps): React.JSX.Element;
// ids: const uid = useId(); radio name `${uid}-q${i}`, option id `${uid}-q${i}-o${j}` (section 2.9)
```

Hành vi:

- Mỗi câu là một `<fieldset>` có `<legend>`. Đáp án là `<input type="radio">` thật bọc trong `<label>`. Nhờ vậy dùng được bằng bàn phím (Tab vào nhóm, mũi tên đổi lựa chọn) mà không tự viết. Đã kiểm chứng với `user-event` 14.6.8 trong spike: `{ArrowDown}` chọn đáp án kế tiếp.
- Nút **Kiểm tra** của từng câu **luôn bấm được**. Chưa chọn mà bấm thì hiện `quiz.chooseOne` trong vùng kết quả. Không dùng nút `disabled`: nút bị tắt không nhận focus, và người đọc không biết vì sao không bấm được.
- Sau khi kiểm tra:
  - Hiện Đúng/Sai **bằng biểu tượng và chữ**, không chỉ bằng màu.
  - Hiện giải thích.
  - Khóa lựa chọn: radio `disabled`, nhưng chữ giữ nguyên màu, không làm mờ.
  - Nút "Kiểm tra" đổi thành "Làm lại". Bấm "Làm lại" thì bỏ chọn, mở khóa và đưa focus về đáp án đầu tiên.
- Kết quả từng câu đặt trong vùng `aria-live="polite"` của câu đó.
- Tổng điểm `quiz.score` hiện ở cuối khi đã chấm hết các câu, trong vùng `aria-live="polite"`. Làm lại một câu thì ẩn điểm cho tới khi chấm lại.
- Không lưu kết quả.
- SSR: câu hỏi và đáp án render sẵn lúc build. Chưa hydrate xong thì vẫn đọc được.
- `dangerouslySetInnerHTML` chỉ dùng cho HTML do `renderInlineMarkup` tạo lúc build từ nội dung trong repo. Ghi rõ điều này thành comment trong code.
- **Tên truy cập khi có công thức** (quyết định 12, thêm ngày 23/10/2026). KaTeX xuất `.katex-html` có `aria-hidden` cộng MathML. Chrome không lấy MathML khi tính tên, nên radio của đáp án chỉ có công thức (ví dụ `$2$`) có tên rỗng, và tên nhóm mất công thức của câu hỏi. Cách sửa:
  - `inlineMarkupLabel(text)` trong `inline-markup.ts` sinh chuỗi đọc được lúc build: chữ thường giữ nguyên, `$...$` thay bằng mã TeX bên trong, `` `code` `` giữ chữ, khoảng trắng gộp lại. `Quiz.astro` truyền kết quả qua `questionLabel`, `optionLabels`.
  - Radio có `aria-label` = chuỗi của đáp án. Sau khi chấm, cộng thêm `, ` + `quiz.correctAnswer` hoặc `quiz.yourAnswer`, giống nhãn nhìn thấy.
  - `fieldset` có `aria-label` = "Câu n/total" + khoảng trắng + chuỗi của câu hỏi. `legend` giữ nguyên HTML của KaTeX để đọc ở chế độ duyệt. Giữa hai `span` trong `legend` có một khoảng trắng, để chữ của `legend` không dính ("Câu 1/3First…").
  - Kiểm tra: unit test (`quiz-island.test.tsx`, `inline-markup.test.ts`) và e2e đọc cây trợ năng thật của Chrome qua CDP (`Accessibility.getFullAXTree`): mọi radio có tên khác rỗng, đáp án `$\frac{1}{2}$` có tên `\frac{1}{2}`.
- **Focus có trước khi hydrate** (quyết định 16): sau khi hydrate, nếu focus đang ở một radio của quiz thì island `blur()` rồi `focus()` lại radio đó một lần. Không làm vậy thì Chrome cho Tab dừng thêm ở radio thứ hai (rủi ro 13, mục 7).
  - Dùng `useEffect`. Đã thử `useLayoutEffect` ở M2 và không được gì. Lúc hydrate, React chạy effect ngay sau commit (đo được 0–0,3 ms sau layout effect). Khoảng 4–6 ms từ lúc Astro bỏ `ssr` tới lúc focus lại là thời gian render hydrate, đổi loại effect không rút ngắn được.
- **Bấm Kiểm tra lần nữa khi vẫn chưa chọn** (thêm ngày 23/10/2026): vùng live chỉ đọc khi nội dung đổi. Vì vậy island xóa dòng `chooseOne`, rồi đặt lại sau `REANNOUNCE_MS` (100 ms) bằng một node mới. Chọn đáp án trong lúc chờ thì không đặt lại. Timer được hủy khi unmount.

### 4.5. `LessonProgress` (Astro + custom element)

```ts
// src/components/LessonProgress.astro
interface Props {
  /** Override. Default: current lesson from the route. Build error on a non-lesson page without id. */
  id?: LessonId;
}
```

```html
<atlas-lesson-progress class="atlas-progress not-content" lang="vi" data-lesson-id="ml/linear-regression">
  <button type="button" class="atlas-progress-toggle" aria-pressed="false" disabled>
    <span class="atlas-progress-box" aria-hidden="true"></span>
    <span>Tôi đã học xong bài này</span>
  </button>
  <p class="atlas-progress-status" aria-live="polite" data-status-done="Đã lưu. Bấm lần nữa…"></p>
  <p class="atlas-progress-warning" data-storage-warning hidden>…progress.storageBlocked…</p>
  <noscript><p>…common.needsScript…</p></noscript>
</atlas-lesson-progress>
```

Hành vi:

- **Nhãn nút cố định** (`progress.markDone`). Trạng thái nằm ở `aria-pressed` và ô vuông có ✓. Đây là cách ARIA APG khuyên cho nút bật/tắt: nếu đổi nhãn theo trạng thái, trình đọc màn hình sẽ đọc lẫn lộn ("Đã học, đã nhấn"). Bản thiết kế cũ có hai key `markDone`/`markUndone`. Đã bỏ `markUndone`.
- Mọi chuỗi render sẵn từ i18n. Script không chứa chữ.
- Custom element (`customElements.define('atlas-lesson-progress', …)`):
  - Đọc `getProgressStore().isDone(id)`, đặt `aria-pressed`, rồi bỏ `disabled`.
  - Bấm thì gọi `setDone()`. Khi bật, `status` hiện `data-status-done`; khi tắt, `status` rỗng.
  - Lắng nghe `subscribe()` để đồng bộ giữa nhiều tab.
- localStorage bị chặn (`store.available === false`): nút vẫn bật/tắt trong phiên hiện tại và hiện cảnh báo. **Không throw lỗi.**
- Chưa có JS: nút hiện nhưng `disabled`, kèm `<noscript>`.

### 4.6. `PythonRunner` (Astro wrapper + React island)

```ts
// src/components/PythonRunner.astro
interface Props {
  code: string;            // usually imported with `?raw` from src/code/...
  stdin?: string;          // lines fed to input(); shows an editable "Input" box when set
  title?: string;          // optional caption above the block (content, per locale)
  figureAlt?: string[];    // alt text per figure; default: runner.figure "Biểu đồ {{n}}"
}
// Renders:
// <div class="atlas-runner not-content" lang={locale}>
//   {title && <p class="atlas-runner-title" lang={contentLang}>{title}</p>}   <!-- contentLang: section 4.1 -->
//   <div class="atlas-runner-static" lang={contentLang} data-runner-static>
//     <Code code={code} lang="python" />      <!-- static, highlighted, outside the island (section 2.4) -->
//   </div>
//   <PythonRunnerIsland client:visible code={code} stdin={stdin} figureAlt={figureAlt}
//                       lang={locale} strings={getStrings(t, 'runner')} />
//   <noscript>…common.needsScript…</noscript>
// </div>
```

```ts
// src/components/python-runner/PythonRunnerIsland.tsx
export interface PythonRunnerIslandProps {
  code: string;
  stdin?: string;
  figureAlt?: string[];
  lang: 'vi' | 'en';            // number formatting of {{seconds}}
  strings: UiStrings<'runner'>;
}
type RunnerUiState =
  | { kind: 'idle' }
  | { kind: 'queued'; runId: number }
  | { kind: 'loading'; runId: number; step: 'python' | 'packages'; packages?: string[] }
  | { kind: 'running'; runId: number; longRunning: boolean }
  | { kind: 'finished'; result: RunResult };   // result.status: ok | error | stopped | load-failed
```

```ts
// src/components/python-runner/python-ready.ts — module scope is shared by all islands on a page
export function markPythonReady(): void;
export function usePythonReady(): boolean;   // useSyncExternalStore; server snapshot = false
// Hides runner.firstRunNote in every runner once Pyodide has loaded on this page.
```

**Cấu hình, giao thức, client:**

```ts
// src/lib/pyodide/config.ts
export const PYODIDE_VERSION = '314.0.7';
export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
export const OUTPUT_LIMIT_CHARS = 100_000;  // per run, stdout + stderr (section 2.7)
export const FLUSH_INTERVAL_MS = 50;
export const FLUSH_MAX_CHARS = 16_384;
export const MAX_FIGURES = 10;
export const FIGURE_DPI = 100;
export const LONG_RUN_HINT_MS = 10_000;     // section 2.6
```

```ts
// src/lib/pyodide/protocol.ts
export type WorkerRequest = { type: 'run'; id: number; code: string; stdin?: string };

export interface OutputChunk { stream: 'stdout' | 'stderr'; text: string } // text ends with '\n'

export type WorkerMessage =
  | { type: 'status'; id: number; status: 'loading-python' | 'loading-packages' | 'running'; packages?: string[] }
  | { type: 'output'; id: number; chunks: OutputChunk[] }            // batched (section 2.7)
  | { type: 'done'; id: number; outcome: WorkerOutcome };

export interface WorkerOutcome {
  phase: 'ok' | 'python-error' | 'load-error';   // load-error: Pyodide or a package failed to load
  errorType?: string;      // PythonError.type, e.g. 'NameError'
  traceback?: string;      // PythonError.message (raw, with Pyodide frames)
  figures: string[];       // base64 PNG without the data: prefix
  figuresDropped: number;  // figures beyond MAX_FIGURES
  outputTruncated: boolean;
  durationMs: number;      // time inside runPythonAsync only
}

export interface PythonErrorInfo {
  type: string;            // 'NameError', 'SyntaxError', ...
  message: string;         // "name 'y' is not defined"
  line?: number;           // last File "<exec>", line N (section 2.8)
  traceback: string;       // header + frames from the first "<exec>" frame on
}

export interface RunResult {
  status: 'ok' | 'error' | 'stopped' | 'load-failed';
  figures: string[];       // 'data:image/png;base64,...'
  figuresDropped: number;
  outputTruncated: boolean;
  error?: PythonErrorInfo; // only when status === 'error'
  durationMs: number;
}
```

```ts
// src/lib/pyodide/client.ts  (imported dynamically on the first click of Run)
export type RunStatus = 'queued' | 'loading-python' | 'loading-packages' | 'running';
export interface RunOptions {
  stdin?: string;
  onStatus: (status: RunStatus, packages?: string[]) => void;
  onOutput: (chunks: OutputChunk[]) => void;
}
export interface RunHandle { id: number; result: Promise<RunResult> } // never rejects

export interface WorkerLike {
  postMessage(message: WorkerRequest): void;
  terminate(): void;
  onmessage: ((event: MessageEvent<WorkerMessage>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
}
export interface PythonClient {
  runPython(code: string, options: RunOptions): RunHandle;
  /** Current run: terminate the worker, resolve 'stopped', start the next queued run on a new worker.
   *  Queued run: remove it from the queue, resolve 'stopped'. Unknown or finished id: no-op. */
  stopPython(id: number): void;
}
/** For tests: inject a fake worker factory. */
export function createPythonClient(createWorker: () => WorkerLike): PythonClient;

// The page-wide client. The worker is created lazily on the first run, never at import time.
export const { runPython, stopPython } = createPythonClient(
  () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
);
```

- Client đổi `WorkerOutcome` thành `RunResult`:
  - `python-error` → `status: 'error'` + `parsePythonError(traceback, errorType)`;
  - `load-error`, `worker.onerror` → `load-failed`;
  - thêm tiền tố `data:image/png;base64,` cho figure.
- Khi `load-failed`, client hủy worker hỏng và cho mọi lần chạy đang chờ kết thúc `load-failed` (mục 2.6). Lần bấm sau tạo worker mới.
- Tin nhắn có `id` không khớp lần chạy hiện tại (từ worker đã hủy) bị bỏ qua.

```ts
// src/lib/pyodide/errors.ts  (pure, unit-tested with Appendix A)
export function parsePythonError(traceback: string, type?: string): PythonErrorInfo;
export type HintKey =
  | 'hintNameError' | 'hintSyntaxError' | 'hintIndentationError' | 'hintTypeError' | 'hintValueError'
  | 'hintIndexError' | 'hintKeyError' | 'hintAttributeError' | 'hintZeroDivisionError'
  | 'hintModuleNotFoundError' | 'hintEOFError' | 'hintGeneric';
/** TabError -> IndentationError hint; ImportError -> ModuleNotFoundError hint; unknown -> hintGeneric. */
export function hintKeyFor(type: string): HintKey;
// EOFError with no `stdin` prop: the island shows runner.stdinMissing instead of hintEOFError.
```

```ts
// src/lib/pyodide/output-buffer.ts  (pure; used by worker.ts)
export function createOutputBuffer(options: {
  send: (chunks: OutputChunk[]) => void;
  now?: () => number;            // default performance.now
  limit?: number;                // default OUTPUT_LIMIT_CHARS
  intervalMs?: number;           // default FLUSH_INTERVAL_MS
  maxChars?: number;             // default FLUSH_MAX_CHARS
}): {
  write(stream: 'stdout' | 'stderr', line: string): void; // appends '\n'; flushes by time/size; drops past limit
  flush(): void;
  readonly truncated: boolean;
};
```

**Worker (`worker.ts`), các bước cho mỗi tin `run`:**

1. Lần đầu: gửi `status: loading-python`.
   - `import(/* @vite-ignore */ PYODIDE_INDEX_URL + 'pyodide.mjs')` → `loadPyodide({ indexURL: PYODIDE_INDEX_URL })`.
   - Chạy `import os; os.environ['MPLBACKEND'] = 'AGG'`.
   - Định nghĩa hàm xuất hình trong một `dict` riêng của worker.
   - Lỗi ở bước này → `done` với `phase: 'load-error'`.
2. `loadPackagesFromImports(code, { messageCallback, errorCallback })`. Nếu có gói chưa tải thì trước đó gửi `status: loading-packages` kèm tên gói. Tên gói lấy bằng `pyodide.code.find_imports` hoặc từ `messageCallback`. Gói tải lỗi → `load-error`.
3. Tạo bộ đệm `createOutputBuffer({ send })`, rồi `setStdout({ batched: (s) => buf.write('stdout', s) })` và `setStderr(...)`.
   - Có `stdin`: `setStdin({ stdin })`, trả lần lượt từng dòng, hết thì trả `undefined` (EOF).
   - Không có `stdin`: trả `undefined` ngay.
4. Gửi `status: running`. Tạo `globals = pyodide.globals.get('dict')()`, `globals.set('__name__', '__main__')`, đo giờ, `await runPythonAsync(code, { globals })`.
5. `finally`: flush stdout/stderr của Python → `buf.flush()` → xuất hình (mục 2.8) → `globals.destroy()` → gửi `done`.
6. Lỗi Python: `phase: 'python-error'`, `errorType`, `traceback`. Không gửi stack JS của worker.

**Hành vi giao diện:**

- Nút chính "Chạy". Trạng thái hiện ở một dòng chữ dưới thanh nút (`aria-live="polite"`):
  - `queued`: "Đang chờ ô code khác chạy xong…"
  - `loading` (python): "Đang tải Python…"
  - `loading` (packages): "Đang tải thư viện: numpy, scikit-learn…"
  - `running`: "Đang chạy…". Sau 10 giây có thêm `longRunning`.
  - `finished`: "Chạy xong sau 1,2 giây." / "Đã dừng…" / "Không tải được Python…" (kèm nút Thử lại).
  - Lỗi Python: giao diện nhìn thấy không có dòng trạng thái riêng, vì khung lỗi đã nói. Vùng trạng thái chỉ có `<p class="sr-only">` với `runner.errorTitle`, để trình đọc màn hình báo code có lỗi (quyết định 15).
- Trong lúc `queued`/`loading`/`running`:
  - Nút Chạy có `aria-disabled="true"` và bấm không có tác dụng. Dùng `aria-disabled` chứ không dùng `disabled`, để nút không mất focus.
  - Nút **Dừng** hiện ngay bên phải. Bấm Dừng thì focus về nút Chạy.
- `idle` và Pyodide chưa tải trên trang này: dưới thanh nút hiện `firstRunNote`.
- **Output** (chỉ hiện sau lần chạy đầu): tiêu đề nhỏ "Kết quả", rồi `<pre>`. stderr nằm chung `<pre>` nhưng khác màu (mục 4.9.5). Không có chữ nào thì hiện `noOutput`. Vượt ngưỡng thì có `outputTruncated`. `<pre>` có `tabindex="0"`, `role="region"` và `aria-label` = "Kết quả" (`role` để `aria-label` được đọc khi focus).
- **Lỗi:** khung riêng gồm:
  - biểu tượng ✕ + "Code có lỗi";
  - `NameError: name 'y' is not defined` (mono);
  - "Lỗi ở dòng 3:" + chính dòng code đó (mono);
  - gợi ý theo loại lỗi;
  - `<details>` "Xem toàn bộ thông báo lỗi" chứa traceback đã lọc.
- **Biểu đồ:** `<img src="data:…" alt=…>`, `max-width: 100%`, `height: auto`. Vượt 10 hình thì có `figuresTruncated`. `figureAlt` chỉ dùng khi code đã chạy đúng là code gốc. Code đã sửa thì mọi hình dùng `runner.figure` ("Biểu đồ {{n}}"), vì lời mô tả của tác giả không còn đúng.
- **Bấm Chạy lần nữa** khi đã `finished`: xóa output cũ rồi chạy lại.
- **Sửa code:** theo mục 2.4. Code đã sửa không lưu.
- **Bàn phím** trong `<textarea>`:
  - `Tab` chèn 4 dấu cách.
  - `Esc` bật cờ "thoát": phím `Tab` kế tiếp di chuyển focus như bình thường.
  - `Ctrl+Enter` (Mac: `Cmd+Enter`) chạy code.
  - Mọi nút là `<button type="button">`.
- Ô `stdin` (khi có prop): `<textarea>` nhỏ có nhãn `runner.input`, giá trị ban đầu là `stdin`, sửa được.

### 4.7. `RoadmapMap`: dấu ✓ và "Đã học x/y"

Component đã có (xem [homepage.md](homepage.md)). M1 thêm:

```ts
interface Props {
  // existing: id, parts, routeFinder, destination
  /** Show ✓ and "Learned x/y" (adds progress-marks to the map's script). Default true. */
  showProgress?: boolean;
}
```

- Mỗi `<li data-lesson-id>` thêm, ngay sau tên bài:

  ```html
  <span class="done-mark" aria-hidden="true"></span><span class="done-text sr-only">(Đã học)</span>
  ```

  Cả hai chỉ hiện khi `li[data-done="true"]` (CSS).
  - 78 mục × khoảng 70 byte, khoảng 5 KB trước nén. Chấp nhận được.
  - Chọn span tĩnh thay vì để script chèn, để `applyProgressMarks` chỉ đổi thuộc tính và dễ test.
- Mỗi `section.roadmap-part` có `data-progress-scope`. Trong `.part-head`, sau `.part-count`, thêm `<p class="part-progress" data-progress-summary data-template="Đã học {{done}}/{{total}}" hidden>`.
- Gốc `[data-roadmap]` có `data-progress-scope`. Trong `.roadmap-legend` thêm `progressTotal` (tóm tắt) và `legendDone` (cũng là `[data-progress-summary]`, cùng quy tắc ẩn khi 0).
- **Ẩn khi đã học 0 bài.** Lần đầu vào trang không thấy 7 dòng "Đã học 0/…" và trang chủ giữ nguyên như đã duyệt.
- Script hiện có import thêm `../lib/progress-marks` (chỉ module thuần: `progress.ts`, `format.ts`). **Không import gì từ React.** Test e2e `/vi/ loads no React and no Pyodide` giữ nguyên và phải qua.
- Phần quyết định link hay chữ dùng `lessonLinkView(lesson, locale, { short: true })`. HTML ra giống hệt hiện tại (test `home.spec.ts` không đổi).

### 4.8. Thay đổi `docs/lesson-template.mdx` (làm ở M1)

Template đổi như sau. `developer` sửa ở M1, chốt lại ở M2 khi duyệt bài mẫu:

```mdx
---
title: Tên bài học            # phải trùng title trong roadmap.ts
description: ...
quiz:
  - question: '...'
    options: ['...', '...']
    answer: 0
    explanation: '...'
---
import Prerequisites from '@components/Prerequisites.astro';
import PythonRunner from '@components/PythonRunner.astro';
import Quiz from '@components/Quiz.astro';
import LessonProgress from '@components/LessonProgress.astro';
import exampleCode from '@code/<phần>/<bài>/example.vi.py?raw';

## Cần biết trước
<Prerequisites />

## Ví dụ code
<PythonRunner code={exampleCode} />

## Kiểm tra nhanh
<Quiz />

<LessonProgress />
```

- Bỏ `sidebar.order` (sidebar sinh từ `roadmap.ts`).
- Bỏ mọi `client:*` ở 4 component trên (wrapper tự gắn).
- Bỏ danh sách link tay ở "Cần biết trước". Component thay thế; quy tắc link tuyệt đối ở [scaffold.md](scaffold.md) mục 2.8.
- Bản en import `example.en.py`.
- Phần DL, NLP, CV, LLM có code cần PyTorch/GPU: dùng khối ` ```python ` thường, không dùng `PythonRunner`.

### 4.9. Hình thức

Giao diện được duyệt **trên trang demo sau khi làm xong** (quyết định 8). Developer làm theo mục này, không chờ duyệt trước.

**Nguồn quy tắc:**

- Phần "A component or a single section" của skill `design-taste-frontend`: khớp với thiết kế xung quanh, theo house rules.
- [homepage.md](homepage.md) mục 2.
- Khi skill và `CLAUDE.md` khác nhau, theo `CLAUDE.md`: chỉ dùng `--sl-color-*` / `--atlas-*`, song ngữ, nhẹ trang.

#### 4.9.1. Quy tắc chung

**Nơi đặt.** Bốn component nằm trong nội dung bài (`.sl-markdown-content`), trên nền theme. Chúng dùng `--sl-color-*`. Chỉ `RoadmapMap` dùng `--atlas-paper*` (giấy của bản đồ).

**Token theo vai trò** (đã có trong `custom.css` hoặc mặc định của Starlight, không thêm mã màu nào):

| Vai trò | Token | Ghi chú |
|---|---|---|
| Nền trang | `--sl-color-bg` (= `--sl-color-black`) | |
| Khối nổi một bậc (thẻ câu hỏi, khung output, khung tiến độ) | `--sl-color-gray-6` | Tách bằng bậc tông màu, **không** viền, **không** bóng |
| Bậc thứ hai (đáp án trong thẻ, hover) | nền `--sl-color-bg`; hover `--sl-color-gray-5` | |
| Chữ thường | `--sl-color-text` (sáng hơn: `--sl-color-white`) | |
| Chữ phụ (tên phần, ghi chú) | `--sl-color-gray-3` | **Không** dùng `--sl-color-gray-4` cho chữ (chỉ 3,37:1 và 3,72:1) |
| Nút chính | nền `--sl-color-accent`, chữ `--sl-color-black` | |
| Nút phụ | nền `--sl-color-gray-5`, chữ `--sl-color-white` | |
| Đã chọn | nền `--sl-color-accent-low`, chữ `--sl-color-white`, thanh 4px `--sl-color-accent` | |
| Đúng | nền `--sl-color-green-low`, chữ và thanh `--sl-color-green-high` | Token mặc định của Starlight, cùng họ màu với aside |
| Sai / lỗi | nền `--sl-color-red-low`, chữ và thanh `--sl-color-red-high` | |
| stderr, cảnh báo | `--sl-color-orange-high` | |
| Focus | `outline: 2px solid var(--sl-color-accent); outline-offset: 2px` | Viền nằm ngoài phần tử, trên nền trang hoặc nền khối |

**Không dùng** `--sl-color-green`, `--sl-color-red`, `--sl-color-orange` (bản giữa) cho chữ hay cho dấu hiệu duy nhất. Ở chế độ sáng, chúng chỉ đạt 1,53:1 (xanh), 3,10:1 (đỏ) trên nền.

**Hình khối:**

- Góc vuông (`border-radius: 0`) cho mọi khối và nút, như trang chủ.
- Không gradient, không bóng, không viền 1px quanh khối.
- Thanh màu 4px ở cạnh đầu dòng (`border-inline-start: 4px solid`) là khối đặc, được dùng để đánh dấu trạng thái.
- Ô nhập (`textarea`) là trường form nên được có viền: `2px solid var(--sl-color-gray-4)` (3,37:1 và 3,72:1 so với nền trang, đạt mức 3:1 cho thành phần không phải chữ).

**Chữ:**

- Font của site (`--sl-font`). Code, output, traceback dùng `var(--__sl-font-mono)` cỡ `var(--sl-text-code)`, giống khối code của Starlight. Ngoài các chỗ đó không dùng mono.
- Cỡ chữ chỉ dùng `--sl-text-base` (16px, chữ thường) và `--sl-text-sm` (14px, chỉ cho dòng phụ như "Câu 1/3", tên phần). Không thêm cỡ.
- Không viết hoa toàn bộ, không giãn chữ, không đánh số kiểu 01/02.

**Nút:**

- `min-height: 44px` (vùng chạm tối thiểu), `padding: 0 20px`, chữ đậm 600.
- `transition: transform .15s ease`. Hover nâng `translateY(-1px)`, nhấn `translateY(0)`. Không đổi màu khi hover. Với `prefers-reduced-motion: reduce` thì bỏ chuyển động.
- `aria-disabled="true"`: nền `--sl-color-gray-5`, chữ `--sl-color-gray-3`, `cursor: not-allowed`.

**Biểu tượng:**

- Hai lớp toàn cục trong `custom.css`: `.atlas-check` (dấu ✓) và `.atlas-cross` (dấu ✕).
- Cùng cách vẽ: `display:inline-block; width:1em; height:1em; background: currentColor; mask: url("data:image/svg+xml,…") center / contain no-repeat`.
- Màu của SVG bên trong mask không hiện ra, nên không vi phạm quy tắc "không mã màu".
- Không dùng emoji. Mọi biểu tượng có `aria-hidden="true"` và đi kèm chữ (hiện hoặc `sr-only`).
- `sr-only` dùng lớp có sẵn của Starlight.

**375px:**

- Không cuộn ngang.
- Khối nổi `padding: 16px` (từ 50rem: `20px`).
- Thanh nút `display:flex; flex-wrap:wrap; gap:8px`.
- Phần tử dài (`pre`, traceback) tự cuộn ngang **bên trong** khung (`overflow-x: auto`), không đẩy trang.

**Sáng/tối:** chỉ dùng token, nên tự đổi theo theme. Mọi cặp ở bảng 4.9.7 đã đo cả hai chế độ.

**Chuyển động:** chỉ `transform` và `opacity`. Mọi chuyển động có nhánh `prefers-reduced-motion: reduce`. Không có hiệu ứng chờ quay vòng (spinner).

#### 4.9.2. `Prerequisites`

- **Bố cục:** `<ul class="atlas-prereq not-content">`, không gạch đầu dòng, `display:grid; gap:4px`.
- **Mỗi mục:** một dòng, `padding: 8px 12px`, nền `--sl-color-gray-6`.
  - Đầu dòng: tên bài cỡ base, đậm 600, chữ `--sl-color-white`.
  - Cuối dòng, đẩy sang phải bằng `margin-inline-start:auto`: tên phần cỡ sm, `--sl-color-gray-3`.
  - Ở 375px, mục xuống thành hai dòng (`flex-wrap: wrap`): tên phần nằm dưới tên bài.
- **Link:** tên bài là link màu `--sl-color-text-accent`, gạch chân `text-underline-offset: 3px`. Hover: gạch chân dày 2px. Focus: viền focus chung.
- **Nhãn "Sắp có", "Chưa dịch":** chữ cỡ sm, `--sl-color-gray-3`, đặt trong ngoặc ngay sau tên bài, ví dụ "(Sắp có)". **Không dùng pill badge.** Bài `soon` có tên bài màu `--sl-color-text`, không gạch chân.
- **Đã học:** `.atlas-check` màu `--sl-color-green-high` ngay sau tên bài, cách 6px, kèm chữ ẩn `(Đã học)`. Chưa học thì không chừa chỗ.
- **Danh sách rỗng:** một đoạn `<p>` chữ thường, không có nền.

#### 4.9.3. `Quiz`

- **Câu hỏi:** mỗi câu là `fieldset.atlas-quiz-question`, nền `--sl-color-gray-6`, `padding: 20px` (16px ở 375), không viền. Các câu cách nhau 16px.
- **`legend`:** dòng 1 là "Câu 1/3", cỡ sm, `--sl-color-gray-3`. Dòng 2 là câu hỏi, cỡ base, đậm 600, `--sl-color-white`. `legend` đặt `float:left; width:100%` để nằm trong khối (cách thường dùng cho `fieldset`).
- **Đáp án:** danh sách dọc, `gap: 4px`. Mỗi đáp án là một `label` chiếm hết chiều ngang:
  - `display:flex; gap:12px; align-items:flex-start`;
  - `min-height:48px; padding:12px 16px`;
  - nền `--sl-color-bg`, chữ `--sl-color-text`;
  - radio thật cỡ `1.25rem`, `accent-color: var(--sl-color-accent)`.

**Trạng thái của đáp án:**

| Trạng thái | Nền | Chữ | Dấu hiệu không dựa vào màu |
|---|---|---|---|
| Thường | `--sl-color-bg` | `--sl-color-text` | |
| Hover (chưa chấm) | `--sl-color-gray-5` | `--sl-color-white` | con trỏ tay |
| Focus (`label:has(:focus-visible)`) | giữ nguyên | giữ nguyên | viền focus chung |
| Đã chọn, chưa chấm | `--sl-color-accent-low` | `--sl-color-white` | radio được chọn + thanh 4px `--sl-color-accent` |
| Đúng (đáp án đúng, sau khi chấm) | `--sl-color-green-low` | `--sl-color-green-high` | thanh 4px + `.atlas-check` + chữ "Đáp án đúng" cỡ sm ở cuối dòng |
| Sai (đáp án người đọc chọn) | `--sl-color-red-low` | `--sl-color-red-high` | thanh 4px + `.atlas-cross` + chữ "Bạn chọn" cỡ sm ở cuối dòng |
| Các đáp án còn lại sau khi chấm | `--sl-color-bg` | `--sl-color-text` | không làm mờ |

**Sau đáp án:**

- **Thanh nút:** "Kiểm tra" là nút chính. Sau khi chấm, nó đổi thành "Làm lại" (nút phụ).
- **Vùng kết quả** (`aria-live`), ngay dưới thanh nút:
  - Đúng: `.atlas-check` + **"Đúng rồi."** đậm, màu `--sl-color-green-high`.
  - Sai: `.atlas-cross` + **"Chưa đúng."** đậm, màu `--sl-color-red-high`.
  - Sau đó là đoạn "Giải thích:" (đậm) + nội dung, chữ `--sl-color-text`.
  - Chưa chọn mà bấm Kiểm tra: `chooseOne`, màu `--sl-color-orange-high`.
- **Điểm:** khi đã chấm hết các câu, cuối quiz có một đoạn trên nền `--sl-color-accent-low`, chữ `--sl-color-white`, đậm 600, ví dụ "Bạn đúng 2/3 câu."
- **375px:** đáp án vẫn chiếm hết chiều ngang. Nhãn "Đáp án đúng" và "Bạn chọn" xuống dòng dưới chữ đáp án khi không đủ chỗ.
- **Công thức KaTeX trong đáp án:** chiều cao dòng tự giãn. Đặt `overflow-x:auto` trên phần chữ để công thức dài không đẩy trang.
  - Phải kèm `overflow-y: hidden` (sửa ngày 23/10/2026). Chỉ đặt `overflow-x: auto` thì `overflow-y` tự thành `auto`. Phân số KaTeX cao hơn dòng chữ khoảng 5px, nên khối cuộn được theo chiều dọc và Chrome cho Tab dừng vào nó.
  - Áp dụng cho `.atlas-quiz-option-text`, `.atlas-quiz-prompt` và phần giải thích. Mỗi khối có `padding-block: 6px` để phân số không bị cắt. Đáp án và câu hỏi bù lại bằng `margin-block: -6px`, phần giải thích bớt 6px ở lề trên, nên bố cục không đổi.
  - Test e2e `(c) … no extra tab stops` kiểm tra cả ba: Tab từ đáp án đầu tới thẳng nút Kiểm tra; Shift+Tab không dừng ở câu hỏi; Tab từ nút Làm lại ra khỏi câu, không dừng ở phần giải thích.

#### 4.9.4. `LessonProgress`

- **Bố cục:** khối `--sl-color-gray-6`, `padding: 20px`, đặt cuối bài. Trong khối là nút, rồi dòng trạng thái ngay dưới.
- **Nút bật/tắt:** cao 48px.
  - Đầu nút là ô vuông 20px: nền `--sl-color-bg`, viền 2px `--sl-color-gray-3`. Đây là phần của nút, đóng vai ô chọn.
  - Sau ô vuông là nhãn cố định "Tôi đã học xong bài này".

| Trạng thái | Nút | Ô vuông |
|---|---|---|
| Chưa có JS (`disabled`) | nền `--sl-color-gray-5`, chữ `--sl-color-gray-3` | trống |
| Tắt (`aria-pressed="false"`) | nền `--sl-color-accent`, chữ `--sl-color-black` | trống |
| Bật (`aria-pressed="true"`) | nền `--sl-color-green-low`, chữ `--sl-color-green-high` | nền `--sl-color-green-high`, có `.atlas-check` màu `--sl-color-green-low` |
| Hover / focus | nâng 1px / viền focus chung | |

- **Dòng trạng thái:** khi bật hiện `doneStatus`, chữ `--sl-color-text`.
- **Cảnh báo bị chặn lưu** (`storageBlocked`): đoạn riêng dưới dòng trạng thái, chữ `--sl-color-text`, có thanh 4px `--sl-color-orange-high` ở cạnh đầu dòng, `padding-inline-start: 12px`.
- **375px:** nút rộng hết khối (`width:100%`), chữ căn trái.

#### 4.9.5. `PythonRunner`

Thứ tự từ trên xuống:

1. **Tiêu đề** (khi có prop `title`): một dòng chữ cỡ sm, đậm 600, `--sl-color-gray-3`, cách khối code 8px.
2. **Khối code:**
   - Chế độ xem: khối Expressive Code nguyên bản (nền và nút copy của nó).
   - Chế độ sửa: `<textarea>` với
     - font mono cỡ `--sl-text-code`, `line-height: 1.6`;
     - nền `--sl-color-gray-6`, chữ `--sl-color-white`, viền 2px `--sl-color-gray-4`;
     - `padding: 12px 16px`, `rows` = số dòng code (tối thiểu 4, tối đa 30), `resize: vertical`, `width: 100%`, `tab-size: 4`, `white-space: pre`, `overflow-x: auto`.
   - Dưới textarea là `editorHint`, cỡ sm, `--sl-color-gray-3`.
3. **Ô dữ liệu nhập** (khi có `stdin`): nhãn cỡ sm, đậm 600, rồi textarea 3 dòng cùng kiểu trên.
4. **Thanh nút** (cách khối trên 8px), từ trái sang phải:
   - "Chạy": nút chính, có tam giác ▶ vẽ bằng CSS `clip-path` trước chữ;
   - "Dừng": nút phụ, chỉ hiện khi `queued`/`loading`/`running`;
   - đẩy sang phải bằng `margin-inline-start:auto`: "Sửa code" ở chế độ xem, hoặc "Khôi phục code gốc" ở chế độ sửa (nút phụ).
   - Ở 375px, nút phải xuống dòng khi thiếu chỗ (`flex-wrap`).
5. **Dòng trạng thái** (`aria-live="polite"`, `min-height: 1.5em` để không nhảy bố cục), cỡ sm:
   - `queued`, `loading`, `running`: chữ `--sl-color-text`, kèm một vạch 24×4px màu `--sl-color-accent`, chạy qua lại bằng `transform: translateX` trong 1,2 s. Với `reduced-motion` thì vạch đứng yên.
   - `longRunning`: dòng thứ hai, thanh 4px `--sl-color-orange-high` ở cạnh đầu dòng.
   - `done`: `--sl-color-gray-3`.
   - `stopped`: `--sl-color-text`.
   - `load-failed`: `.atlas-cross` + chữ `--sl-color-red-high`, rồi nút phụ "Thử lại".
   - `idle` khi Pyodide chưa tải: `firstRunNote`, `--sl-color-gray-3`.
   - Lỗi Python: không có chữ nhìn thấy; chỉ có dòng `sr-only` `errorTitle` (quyết định 15).
6. **Khung kết quả** (chỉ có sau lần chạy đầu): nền `--sl-color-gray-6`, `padding: 16px`.
   - Tiêu đề "Kết quả" cỡ sm, đậm 600.
   - `<pre>` mono, `white-space: pre`, `overflow: auto`, `max-height: 28rem`, `tabindex="0"` (để cuộn bằng bàn phím), `role="region"`, có `aria-label` = "Kết quả". stdout màu `--sl-color-white`; stderr màu `--sl-color-orange-high`.
   - `noOutput`, `outputTruncated`, `figuresTruncated`: chữ cỡ sm `--sl-color-gray-3`, không nghiêng.
7. **Khung lỗi** (trong khung kết quả, sau `<pre>`):
   - nền `--sl-color-red-low`, thanh 4px `--sl-color-red-high`, `padding: 12px 16px`;
   - dòng 1: `.atlas-cross` + "Code có lỗi", đậm, `--sl-color-red-high`;
   - dòng 2: `NameError: name 'y' is not defined`, mono, `--sl-color-white`;
   - dòng 3: "Lỗi ở dòng 3:" + dòng code đó (mono, `overflow-x:auto`);
   - dòng 4: gợi ý, chữ `--sl-color-text`;
   - `<details>`: `summary` gạch chân, mở ra là traceback mono, `overflow-x:auto`.
8. **Biểu đồ:**
   - Mỗi hình là một `<img>`, `display:block`, `max-width:100%`, `height:auto`, cách nhau 12px.
   - Nền hình là nền trắng mặc định của matplotlib. Không đổi theo theme: trong chế độ tối, hình trắng là một khối sáng rõ ràng, như ảnh trong bài.
   - Có lỗi thì trên hình có `figuresBeforeError`, cỡ sm.

#### 4.9.6. `RoadmapMap`: dấu ✓ và "Đã học x/y"

- **Dấu ✓:**
  - `.done-mark` là `.atlas-check` cỡ `0.9em`, `margin-inline-start: 6px`, `vertical-align: -0.1em`, màu `currentColor`.
  - Nhờ `currentColor`, dấu tự theo màu chữ của dòng: mực giấy `--atlas-paper-ink` khi thường, `--atlas-field-ink` khi dòng nằm trên đường đi, `--atlas-paper` khi dòng là điểm đến.
  - Không đổi màu hay độ đậm của tên bài.
  - Không có ✓ thì không chừa chỗ, nên bố cục y như hiện tại.
- **"Đã học x/y" của phần:**
  - `.part-progress` nằm trong `.part-head`, ngay sau "14 bài", cách bằng `gap` sẵn có;
  - cỡ `--step-small`, đậm 600, màu `--atlas-paper-ink`;
  - đứng trước nó là một ô vuông 8px đặc màu `--atlas-paper-ink`, đóng vai dấu chấm phân cách bằng khối, không dùng ký tự "·".
- **Tổng ở chú giải:** `progressTotal` đậm 600 và `legendDone` (có `.atlas-check` đứng trước) thêm vào cuối `.roadmap-legend`, cùng cỡ chữ chú giải.
- **Ẩn khi 0**, như mục 4.7.
- **375px:** `.part-head` đã `flex-wrap`, nên "Đã học x/y" xuống dòng khi thiếu chỗ.
- **Sáng/tối:** giấy giữ là giấy ở cả hai chế độ (homepage.md), nên không cần nhánh riêng.

#### 4.9.7. Tương phản (đo theo công thức WCAG 2.x ngày 23/10/2026)

Đo bằng giá trị trong `custom.css` và giá trị mặc định của Starlight 0.42.6 (`props.css`). Chữ cần ≥ 4,5:1. Viền, thanh, biểu tượng cần ≥ 3:1. Ngày 23/10/2026 sửa hai dòng ghi sai nền (✓ của Prerequisites, "Không tải được") và bổ sung các cặp còn thiếu theo số đo của analyst.

| Cặp | Tối | Sáng | Dùng cho |
|---|---|---|---|
| `text` / `bg` | 10,10 | 11,11 | chữ thường |
| `text` / `gray-6` | 8,68 | 8,90 | chữ trong khối nổi |
| `white` / `gray-6` | 12,04 | 12,50 | câu hỏi, stdout |
| `gray-3` / `bg` | 6,28 | 6,89 | chữ phụ |
| `gray-3` / `gray-6` | 5,40 | 5,52 | chữ phụ trong khối |
| `white` / `gray-5` | 8,75 | 9,21 | hover, nút phụ |
| `black` / `accent` | 7,42 | 6,42 | nút chính |
| `white` / `accent-low` | 9,14 | 12,27 | đã chọn, điểm |
| `accent` / `accent-low` | 4,84 | 5,05 | thanh "đã chọn", focus trên nền đã chọn |
| `accent` / `gray-6` | 6,37 | 5,14 | focus trong khối |
| `green-high` / `green-low` | 7,54 | 6,36 | đúng, đã học |
| `red-high` / `red-low` | 8,63 | 6,90 | sai, lỗi |
| `white` / `red-low` | 11,76 | 13,12 | chữ lỗi |
| `text` / `red-low` | 8,48 | 9,34 | gợi ý lỗi |
| `green-high` / `gray-6` | 10,80 | 4,92 | ✓ ở Prerequisites (mục nằm trên `gray-6`); "Đúng rồi." |
| `green-high` / `bg` | 12,56 | 6,14 | ✓ trên nền trang |
| `red-high` / `bg` | 10,28 | 8,21 | "Không tải được" (dòng trạng thái nằm trên nền trang) |
| `red-high` / `gray-6` | 8,84 | 6,58 | "Chưa đúng." trong thẻ câu hỏi |
| `orange-high` / `gray-6` | 11,11 | 4,94 | stderr, `chooseOne` |
| `accent` / `bg` | 7,42 | 6,42 | focus trên nền trang, thanh "đã chọn" |
| `green-low` / `green-high` | 7,54 | 6,36 | ✓ trong ô vuông của LessonProgress khi bật |
| `gray-3` / `gray-5` | 3,92 | 4,06 | nút `aria-disabled` (được miễn theo WCAG 1.4.3: thành phần không dùng được) |
| `gray-4` / `bg` | 3,37 | 3,72 | viền textarea (không phải chữ) |
| `paper-ink` / `paper` | 13,34 | 15,44 | ✓ và "Đã học x/y" trên bản đồ |
| `field-ink` / `field` | 8,10 | 8,10 | ✓ trên dòng thuộc đường đi |

Cặp **không được dùng**: `gray-3` trên `green-low` ở chế độ tối (3,77). Trên nền xanh, chữ luôn dùng `green-high`.

## 5. Phụ thuộc (cài ở M1)

Kiểm tra bằng `npm view` ngày 23/10/2026. Đã chạy `npm install --package-lock-only` trên bản sao `package.json` + `package-lock.json`: không có xung đột peer, `react-dom` giữ 19.3.1. Đã chạy một test Testing Library mẫu (jsdom, `useId`, radio bằng phím mũi tên) với đúng các bản dưới, cùng React 19.3.1 và Vitest 5.0.5: qua.

| Gói | Phiên bản | Loại | Dùng cho | Ghi chú tương thích |
|---|---|---|---|---|
| `@astrojs/sitemap` | 3.7.4 | dependencies | Sitemap có `filter` (mục 2.10) | Đúng bản Starlight 0.42.6 đang dùng (`^3.7.3`). Chạy trong build nên để ở dependencies |
| `pyodide` | 314.0.7 | devDependencies | Chỉ kiểu TypeScript | Bản `latest` |
| `jsdom` | 30.1.3 | devDependencies | DOM cho test component (`// @vitest-environment jsdom`) | `engines: ^22.22.2 \|\| ^24.15.0 \|\| >=26`: khớp Node 24.15.0. Vitest 5 nhận peer `jsdom: *`. Peer `canvas` là tùy chọn, không cài |
| `@testing-library/react` | 16.3.3 | devDependencies | Test `QuizIsland`, `PythonRunnerIsland` | Peer `react ^18 \|\| ^19`, `@testing-library/dom ^10` |
| `@testing-library/dom` | 10.4.2 | devDependencies | Peer bắt buộc của hai gói trên | Phải ghi tường minh: npm tự cài peer nhưng không ghi vào `package.json`, và `deps.test.ts` đòi mọi bản đều ghim |
| `@testing-library/user-event` | 14.6.8 | devDependencies | Giả lập bàn phím, chuột | Peer `@testing-library/dom >=7.21.4` |

```sh
npm install -E @astrojs/sitemap@3.7.4
npm install -D -E pyodide@314.0.7 jsdom@30.1.3 @testing-library/react@16.3.3 @testing-library/dom@10.4.2 @testing-library/user-event@14.6.8
```

- **Không thêm** `@testing-library/jest-dom`. Test dùng `expect` của Vitest với thuộc tính DOM (`button.getAttribute('aria-pressed')`, `input.checked`), bớt một gói.
- `katex` 0.16.47 đã có từ M0, dùng lại qua `renderInlineMarkup`. Không thêm gói nào chạy trên trình duyệt.
- `npm audit` sau khi thêm vẫn chỉ có 4 cảnh báo mức thấp quanh `katex` 0.16.x, đã có từ M0 (đã biết, xem [scaffold.md](scaffold.md) mục 5.1). Không có cảnh báo mới.
- `deps.test.ts` bổ sung: `pyodide` trong `package.json` bằng `PYODIDE_VERSION` trong `src/lib/pyodide/config.ts`.

## 6. Các bước thực hiện

Mỗi nhiệm vụ của `developer` kết thúc bằng `npm run build` (không `[WARN]`), `npm run check` (0 lỗi 0 cảnh báo), `npm test`. Riêng nhiệm vụ đụng tới trang chủ còn chạy `npm run test:e2e` (test trang chủ phải qua).

Thứ tự: M1-1 → M1-2 → … → M1-10, đúng theo số.

- M1-2 và M1-3 sửa khác file, nhưng cùng sửa trang demo. Chạy lần lượt cho đơn giản.
- M1-1 thêm sẵn **toàn bộ** key i18n, nên các nhiệm vụ sau không phải sửa `ui.ts`/`vi.json`/`en.json` nữa.

| # | Agent | Việc | Tiêu chí hoàn thành |
|---|---|---|---|
| M1-1 | `developer` | **Nền chung.** Cài gói (mục 5). Viết `src/lib/progress.ts`, `src/lib/progress-marks.ts`, `src/lib/lesson-link.ts`, `src/lib/pyodide/config.ts`. Thêm **toàn bộ** key mục 4.2 vào `ui.ts`, `vi.json`, `en.json`. Khai báo sitemap (mục 2.10). Đổi script `test:e2e`, thêm `test:e2e:network` (mục 2.11). Thêm `.atlas-check`/`.atlas-cross` vào `custom.css`. Viết unit test: `progress.test.ts`, `progress-marks.test.ts` (jsdom), `lesson-link.test.ts`, mở rộng `deps.test.ts` | `package.json` có đúng 6 gói mới, không `^`. Unit: `createProgressStore(null)` và Storage ném lỗi đều không throw, `available === false`; JSON hỏng → rỗng; `countDone` đúng; `applyProgressMarks` đặt `data-done` và ẩn tóm tắt khi 0; `lessonLinkView` phủ đủ bảng 4.1. `npm run build` qua và sinh đủ key. `dist/sitemap-0.xml` không chứa `/dev/`, vẫn có `hreflang="en"`. `npm run test:e2e` vẫn qua (trang chủ không đổi) |
| M1-2 | `developer` | **Prerequisites + LessonProgress + ✓ RoadmapMap.** `Prerequisites.astro`, `LessonProgress.astro` (mục 4.3, 4.5, 4.9.2, 4.9.4). Sửa `RoadmapMap.astro` theo mục 4.7, 4.9.6, dùng `lessonLinkView`. Thêm vào trang demo vi/en: `<Prerequisites ids={['ml/linear-regression', 'math/calculus']} />`, `<Prerequisites ids={[]} />`, `<LessonProgress id="ml/linear-regression" />`, `<RoadmapMap id="demo-map" parts={['ml']} />` | Build qua. `dist/vi/dev/components/index.html`: các bài planned không có `<a>` và có "(Sắp có)". `dist/vi/index.html` vẫn không có `astro-island`, và script của bản đồ không chứa React (test `home.spec.ts` qua nguyên vẹn). Tự kiểm tra tay trên `npm run preview`: bấm LessonProgress → tải lại → vẫn bật; ✓ hiện ở bản đồ demo và ở trang chủ; dòng "Đã học 1/14" hiện ở phần Học máy |
| M1-3 | `developer` | **Quiz.** `quiz-schema.ts`, mở rộng `docsSchema` trong `content.config.ts`, `Quiz.astro`, `quiz/QuizIsland.tsx`, `quiz/quiz.css` (mục 4.4, 4.9.3). Trang demo: thêm `quiz:` 3 câu vào frontmatter (có `$\frac{1}{2}$`, `$\mathcal{L}$`, `` `np.mean` ``), dùng `<Quiz />`, cộng thêm một `<Quiz questions={…} />` thứ hai (chữ thường, không `\`). Viết `quiz-schema.test.ts` | Unit: `answer` ngoài phạm vi → lỗi; 1 đáp án → lỗi; thiếu `explanation` → lỗi. Build qua. HTML demo có `class="katex"` trong câu hỏi quiz. `npm run check` 0 lỗi. Quiz không có `id` trùng giữa hai quiz (kiểm tra `dist`) |
| M1-4 | `developer` | **Lõi PythonRunner.** `pyodide/protocol.ts`, `output-buffer.ts`, `errors.ts`, `client.ts` (có `createPythonClient`), `worker.ts` (mục 2.5–2.8, 4.6). Viết `tests/unit/fixtures/pyodide-tracebacks.ts` (chép nguyên Phụ lục A), `python-errors.test.ts`, `output-buffer.test.ts`, `python-client.test.ts` | Unit: `parsePythonError` ra đúng `type`, `message`, `line` cho 5 traceback ở Phụ lục A (ZeroDivisionError → dòng 2); traceback lọc bỏ hết frame `_pyodide`. `output-buffer`: gửi gộp khi qua 50 ms, cắt đúng ở 100.000 ký tự và `truncated = true`. `client` với worker giả: hai lần chạy xếp hàng; Dừng lần đang chạy → nó `stopped`, worker cũ `terminate()`, lần chờ chạy trên worker **mới**; Dừng lần đang chờ → không `terminate()`; tải lỗi → mọi lần chờ `load-failed`. `npm run build` sinh `/_astro/worker-*.js` và file đó chứa nguyên chuỗi `cdn.jsdelivr.net/pyodide/v314.0.7/full/` |
| M1-5 | `developer` | **Giao diện PythonRunner + code mẫu + template.** `PythonRunner.astro`, `PythonRunnerIsland.tsx`, `OutputPanel.tsx`, `python-ready.ts`, `python-runner.css` (mục 2.4, 4.6, 4.9.5). Code demo trong `src/code/dev/` (mỗi file có `.vi.py` và `.en.py`): `hello` (in vài dòng), `plot` (một biểu đồ matplotlib, `np.random.seed(0)`), `error` (vẽ một hình rồi `NameError` ở dòng 6), `slow` (vòng lặp in mãi), `input` (đọc 2 dòng `input()`). Trang demo dùng cả 5 file, trong đó có hai runner đặt liền nhau để thử hàng đợi. Viết `code-pairs.test.ts`. Sửa `docs/lesson-template.mdx` theo mục 4.8. Chạy thử từng file `.py` bằng `python` | Build qua, không `[WARN]`. Mở trang demo bằng `npm run preview`: chưa bấm thì tab Network không có request `pyodide`. Bấm Chạy (có mạng): output đúng; biểu đồ hiện; ô `error` hiện "Lỗi ở dòng 6" **và** hình vẽ trước lỗi; ô `slow` sau 10 giây hiện gợi ý, bấm Dừng thì dừng, chạy lại được. Sửa code → Khôi phục → khối tĩnh hiện lại, nút copy vẫn chạy. Console không có lỗi hydrate. `code-pairs.test.ts` qua |
| M1-6 | `tester` | **Test component (jsdom).** `quiz-island.test.tsx`, `python-runner-island.test.tsx` (mock `@lib/pyodide/client`) | Quiz: chọn đúng → "Đúng rồi." + giải thích; chọn sai → "Chưa đúng." + nhãn "Bạn chọn" và "Đáp án đúng"; bấm Kiểm tra khi chưa chọn → `chooseOne`; điểm cuối đúng; làm hết chỉ bằng bàn phím. Runner: lần lượt hiện đúng chuỗi `queued` → `loadingPython` → `loadingPackages` → `running` → `done`; `longRunning` hiện sau 10 s (dùng `vi.useFakeTimers`) và mất khi xong; `outputTruncated`, `figuresBeforeError`, `stdinMissing` hiện đúng lúc; Dừng gọi `stopPython(id)` đúng id |
| M1-7 | `tester` | **E2E chạy trong CI.** `tests/e2e/components.spec.ts` | (a) Mở và cuộn hết trang demo vi/en: **0 request** tới `cdn.jsdelivr.net/pyodide`. (b) `page.route('**/pyodide/**', abort)`, bấm Chạy: có request bị chặn, hiện "Không tải được Python", có nút Thử lại. (c) Quiz và LessonProgress dùng được chỉ bằng bàn phím; LessonProgress còn sau khi tải lại; `addInitScript` làm `localStorage` ném lỗi → bấm không lỗi console, hiện cảnh báo. (d) Hai quiz không ảnh hưởng nhau; không `id` trùng trên trang. (e) Ở 375px, `scrollWidth <= 375` trên trang demo, sáng và tối. (f) `/sitemap-0.xml` không có `/dev/`, có `/vi/`, `/en/`, `hreflang`. (g) Test trang chủ cũ vẫn qua. Thêm: đánh dấu một bài trong demo → `/vi/` có đúng một ✓ và "Đã học 1/14" |
| M1-8 | `tester` | **E2E `@network`.** `tests/e2e/python-network.spec.ts`, mọi test có `{ tag: '@network' }`, timeout 120 s | `npm run test:e2e:network` qua: `hello` in đúng; `plot` có `<img>` và ở 375px `img.clientWidth <= 375`; `error` có "NameError", "dòng 6" và một `<img>`; `slow` hiện gợi ý sau 10 s, Dừng → "Đã dừng"; hai ô bấm liền nhau → ô 2 hiện "Đang chờ…" rồi chạy xong; Dừng ô 1 khi ô 2 đang chờ → ô 2 vẫn chạy xong. `npm run test:e2e` **không** chạy file này |
| M1-9 | `analyst` | Review M1: code, trợ năng, hiệu năng, kích thước JS mỗi trang | Báo cáo có số đo. Lighthouse mobile: trang demo Performance ≥ 90 trước khi bấm Chạy; trang chủ không giảm so với homepage.md (91); Accessibility ≥ 95. Trang chủ không có React. Bảng tương phản 4.9.7 khớp màu đo thật |
| M1-10 | **người dùng** | Duyệt giao diện trên trang demo, cả máy tính lẫn điện thoại thật (quyết định 8) | Người dùng đồng ý, hoặc có danh sách chỗ sửa cho `developer` |

Việc ngoài phạm vi tài liệu này, phiên chính lo:

- Thêm `npm run test:e2e:network` vào bảng "Lệnh" của `CLAUDE.md`.
- Cập nhật mục "Trạng thái hiện tại" sau M1.

## 7. Rủi ro và điểm chưa chắc

| # | Rủi ro | Ảnh hưởng | Cách xử lý |
|---|---|---|---|
| 1 | Pyodide + scikit-learn + scipy tải nặng (runtime khoảng 10 MB, cộng vài chục MB gói) trên mạng di động | Chờ lâu ở lần bấm đầu | `firstRunNote` báo trước; hiện từng bước và tên gói; cache trình duyệt một năm |
| 2 | Phụ thuộc jsDelivr | CDN lỗi thì không chạy được code | `load-failed` + Thử lại. Dự phòng sau MVP: tự host trên Cloudflare Pages (giới hạn 25 MiB mỗi file) |
| 3 | **Không có seaborn trong Pyodide 314.0.7** | Bài `python/data-visualization` | Seaborn là gói Python thuần, có thể cài bằng `micropip.install('seaborn')` lúc chạy. Chưa kiểm chứng. Quyết định khi viết bài đó |
| 4 | Dừng ô đang chạy làm ô kế tiếp tải lại Pyodide | Vài giây chờ thêm | Chấp nhận (mục 2.6). File đã nằm trong cache |
| 5 | Mỗi lần chạy dùng namespace riêng | Không chia code thành nhiều ô nối tiếp được | Chấp nhận ở MVP; sau này có thể thêm prop `session="tên"` |
| 6 | `<Code>` của Starlight truyền làm `children` của island: chưa chạy thử thật (spike M0 chỉ kiểm chứng `?raw`) | Có thể thiếu style hoặc nút copy không chạy trong island | **Đã xảy ra ở M1-5:** mất `<link>` CSS của Expressive Code. Đã dùng phương án dự phòng: `<Code>` nằm ngoài island, island tìm khối bằng `closest('.atlas-runner')` và ẩn/hiện qua `hidden` (mục 2.4) |
| 7 | Vitest dùng `getViteConfig` của Astro. Spike Testing Library chạy trong project riêng, chưa chạy trong repo | JSX trong `.test.tsx` có thể cần cấu hình thêm | `tsconfig` đã có `jsx: react-jsx`. Nếu lỗi, thêm `oxc: { jsx: { runtime: 'automatic' } }` vào `vitest.config.ts` (cách đã chạy được trong spike) |
| 8 | Màu xanh/đỏ mặc định của Starlight (hue 101 và 339) có thể lệch với bảng màu walnut | Thẩm mỹ | Duyệt trên trang demo. Muốn đổi thì chỉnh `--sl-hue-green`/`--sl-hue-red` trong `custom.css` rồi đo lại tương phản (mục 4.9.7) |
| 9 | Starlight bản sau có thể đổi cách phát hiện `@astrojs/sitemap` | Trang demo quay lại sitemap, hoặc có hai sitemap | Test e2e (f) bắt được. Dự phòng: hook `astro:build:done` |
| 10 | `print(..., end="")` rồi `flush()` vẫn bị xuống dòng (mục 2.7) | Hiển thị lệch một chút | Chấp nhận; ví dụ trong bài không dùng |
| 11 | Gõ code trong `<textarea>` không tô màu | Trải nghiệm sửa code kém hơn | Đủ cho MVP; xét CodeMirror sau |
| 12 | Quiz trong frontmatter xa vị trí hiển thị | Người viết có thể quên | Template có khối `quiz:` mẫu; `<Quiz />` báo lỗi build nếu thiếu |
| 13 | Radio đã có focus từ trước khi island của nó hydrate (ví dụ Tab vào quiz vừa cuộn tới) | Trong Chrome, Tab kế tiếp dừng thêm một lần ở radio thứ hai của nhóm, rồi mới tới nút Kiểm tra | **Đã sửa** ngày 23/10/2026 (quyết định 16). `QuizIsland` có một effect chạy một lần sau khi hydrate: nếu `document.activeElement` là radio của chính quiz đó thì `blur()` rồi `focus()` lại. Focus ở chỗ khác thì không đụng tới. Test: e2e `(c) a radio focused before its quiz hydrates…` (focus radio của quiz thứ hai khi còn `ssr`, rồi Tab phải tới thẳng nút Kiểm tra) và unit test hydrate trong `quiz-island.test.tsx`. Bỏ phần sửa thì cả hai test đều fail |

### Câu hỏi cho người dùng

Không có câu hỏi nào chặn việc. Các lựa chọn kiến trúc tự quyết trong lượt này (đổi được sau khi duyệt trên trang demo):

1. Dừng chỉ dừng ô của mình; ô đang chờ chạy tiếp trên worker mới (mục 2.6).
2. Ngưỡng output 100.000 ký tự, cắt ở worker, gom 50 ms (mục 2.7).
3. Code lỗi vẫn hiện biểu đồ đã vẽ (mục 2.8).
4. Bỏ nút "Xem code"; "Khôi phục code gốc" là đường duy nhất quay về khối tĩnh (mục 2.4).
5. Nút LessonProgress có nhãn cố định; Kiểm tra của Quiz không bao giờ bị tắt (mục 4.4, 4.5).
6. Dòng "Đã học x/y" ẩn khi chưa học bài nào (mục 4.7).
7. Dùng màu xanh/đỏ mặc định của Starlight cho Đúng/Sai (mục 4.9.1).

Đã trả lời trước đây:

1. ~~Comment trong code ví dụ~~ → theo ngôn ngữ của bài, hai file `.vi.py`/`.en.py` (22/10/2026).
2. ~~Quiz trong frontmatter~~ → đồng ý (22/10/2026).
3. ~~Mỗi ô code chạy độc lập~~ → đồng ý cho MVP (22/10/2026).
4. ~~Duyệt giao diện, e2e mạng, code chạy lâu, trang demo~~ → quyết định 8–11 (23/10/2026).

## Phụ lục A. Traceback thật của Pyodide 314.0.7

Chạy `pyodide@314.0.7` trong Node 24.15.0 ngày 23/10/2026, `runPythonAsync(code, { globals })` với `globals` mới có `__name__ = '__main__'`. `err.type` là tên lớp lỗi. Chép **nguyên văn** vào `tests/unit/fixtures/pyodide-tracebacks.ts`.

**NameError** (code: `x = 1` / `print(x)` / `print(y)`). Kết quả mong đợi: `type = NameError`, `line = 3`, `message = "name 'y' is not defined"`.

```text
Traceback (most recent call last):
  File "/lib/python314.zip/_pyodide/_base.py", line 619, in eval_code_async
    await CodeRunner(
    ...<10 lines>...
    .run_async(globals, locals)
  File "/lib/python314.zip/_pyodide/_base.py", line 420, in run_async
    coroutine = eval(self.code, globals, locals)
  File "<exec>", line 3, in <module>
NameError: name 'y' is not defined
```

**SyntaxError** (code: `a = 1` / `if a > 0` / `    print(a)`). Kết quả mong đợi: `line = 2`, `message = "expected ':'"`.

```text
Traceback (most recent call last):
  File "/lib/python314.zip/_pyodide/_base.py", line 619, in eval_code_async
    await CodeRunner(
          ~~~~~~~~~~^
        source,
        ^^^^^^^
    ...<6 lines>...
        dedent=dedent,
        ^^^^^^^^^^^^^^
    )
    ^
  File "/lib/python314.zip/_pyodide/_base.py", line 294, in __init__
    self.ast = next(self._gen)
               ~~~~^^^^^^^^^^^
  File "/lib/python314.zip/_pyodide/_base.py", line 151, in _parse_and_compile_gen
    mod = compile(source, filename, mode, flags | ast.PyCF_ONLY_AST)
  File "<exec>", line 2
    if a > 0
            ^
SyntaxError: expected ':'
```

**IndentationError** (code: `def f():` / `return 1`). Kết quả mong đợi: `line = 2`, `message = "expected an indented block after function definition on line 1"`. Phần frame `_pyodide` giống hệt SyntaxError. Đoạn từ frame `<exec>`:

```text
  File "<exec>", line 2
    return 1
    ^^^^^^
IndentationError: expected an indented block after function definition on line 1
```

**ZeroDivisionError trong hàm** (code: `def f(n):` / `    return 1 / n` / dòng trống / `print(f(0))`). Kết quả mong đợi: `line = 2` (frame `<exec>` cuối), `message = "division by zero"`. Phần đầu giống NameError. Đoạn từ frame `<exec>`:

```text
  File "<exec>", line 4, in <module>
  File "<exec>", line 2, in f
ZeroDivisionError: division by zero
```

**EOFError** (code: `name = input()`, không có `stdin`). Kết quả mong đợi: `line = 1`, `message = "EOF when reading a line"`. Giao diện hiện `stdinMissing`. Đoạn từ frame `<exec>`:

```text
  File "<exec>", line 1, in <module>
EOFError: EOF when reading a line
```
