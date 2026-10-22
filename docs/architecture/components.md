# Thiết kế component mốc M1

> Phạm vi: giao diện (props, kiểu, chữ ký hàm) của 5 component mốc **M1. Công cụ trình bày** trong [docs/mvp.md](../mvp.md): `Prerequisites`, `Quiz`, `LessonProgress`, `PythonRunner`, `RoadmapMap` (bản đơn giản).
> Liên quan: [scaffold.md](scaffold.md) (i18n, alias, cấu hình), [roadmap-data.md](roadmap-data.md) (dữ liệu lộ trình).
>
> Tài liệu này chỉ định **hành vi và giao diện lập trình**. Hình thức (bố cục, màu, khoảng cách, chữ) sẽ được thiết kế bằng skill `design-taste-frontend` (`.agents/skills/design-taste-frontend/SKILL.md`) sau khi M0 xong, và chỉ được dùng biến `--sl-color-*` của Starlight.

## 1. Mục tiêu và phạm vi

### Làm

- 5 component dùng được trong MDX, song ngữ, sáng/tối, dùng tốt ở 375px, dùng được bằng bàn phím.
- Thư viện dùng chung: tiến độ học (localStorage), chạy Python (Pyodide trong Web Worker), render công thức trong chuỗi.
- Trang demo `/vi/dev/components/` và `/en/dev/components/` dùng đủ 5 component.
- Test cho từng component.

### Không làm

- Sơ đồ lộ trình dạng đồ thị có mũi tên (ngoài MVP).
- Trình soạn code có tô màu khi gõ (CodeMirror…). M1 dùng `<textarea>`; xem mục 2.4.
- Quiz nhiều đáp án đúng, quiz điền số. Chỉ trắc nghiệm một đáp án.
- Đồng bộ tiến độ giữa các máy.

## 2. Phương án đã chọn

### 2.1. Astro hay React cho từng component

Nguyên tắc: **phần nào chỉ hiển thị thì render sẵn bằng Astro (0 KB JS)**. Chỉ dùng React khi có trạng thái phức tạp. Trạng thái đơn giản (một nút bật/tắt, đánh dấu ✓) dùng `<script>` nhỏ của Astro, vì đưa React (khoảng 60 KB nén) vào trang chủ chỉ để hiện dấu ✓ là quá đắt.

| Component | Chọn | Lý do |
|---|---|---|
| `Prerequisites` | **Astro** + script nhỏ đánh ✓ | Danh sách tĩnh lấy từ `roadmap.ts` lúc build. Chỉ có dấu "đã học" là cần JS |
| `Quiz` | **Astro wrapper + React island** | Nhiều trạng thái: chọn đáp án, chấm, giải thích, điểm, làm lại |
| `LessonProgress` | **Astro** + custom element | Chỉ một nút bật/tắt. Không cần React |
| `PythonRunner` | **Astro wrapper + React island** | Nhiều trạng thái: tải runtime, chạy, output dạng luồng, lỗi, biểu đồ, chế độ sửa |
| `RoadmapMap` | **Astro** + script nhỏ đánh ✓ | Nằm ở trang chủ, cần Lighthouse cao. 78 bài render sẵn thành HTML |

**Mọi component mà tác giả dùng trong MDX đều là file `.astro`.** Wrapper Astro tự:

- lấy chuỗi giao diện bằng `Astro.locals.t` rồi truyền xuống React (theo [scaffold.md](scaffold.md) mục 4.5);
- tự gắn `client:visible` cho island React.

Vì vậy tác giả **không** viết `client:*` trong MDX. (Astro không cho đặt `client:*` lên component `.astro`.)

### 2.2. Nội dung quiz: để trong frontmatter YAML

| Phương án | Ưu | Nhược |
|---|---|---|
| A. Prop mảng JS trong MDX: `<Quiz questions={[{ question: '$\frac{a}{b}$' }]} />` | Gần chỗ hiển thị | **Bẫy dấu `\`:** trong chuỗi JS, `\f`, `\t`, `\n`, `\b`, `\v`, `\r` thành ký tự điều khiển. `\frac`, `\theta`, `\nabla`, `\beta`, `\vec`, `\right` hỏng ngầm. Tác giả phải gõ `\\frac` |
| **B. Trường `quiz` trong frontmatter YAML, `<Quiz />` không cần prop (chọn)** | Trong YAML nháy đơn, `\` giữ nguyên (đã kiểm chứng: `'$\frac{\partial \mathcal{L}}{\partial w}$'` đọc ra đúng); có schema zod kiểm tra lúc build; người dịch thấy rõ phần cần dịch | Nội dung quiz nằm ở đầu file, xa vị trí hiển thị |
| C. Component lồng nhau (`<QuizQuestion>`, `<QuizOption>`) với Markdown con | Viết Markdown tự nhiên | Dài dòng; truyền cây con phức tạp vào React island rất rối |

Chọn **B**. Trong chuỗi quiz chỉ hỗ trợ **công thức `$...$`** và **code `` `...` ``**. Wrapper render sẵn lúc build bằng `katex.renderToString` (không đưa KaTeX xuống trình duyệt).

### 2.3. Code của `PythonRunner`: file `.py` riêng, import bằng `?raw`

| Phương án | Ưu | Nhược |
|---|---|---|
| A. Template literal: ``code={`print("a\nb")`}`` | Code nằm ngay trong bài | **Cùng bẫy dấu `\`:** `"\n"` trong code Python thành xuống dòng thật, Python báo `SyntaxError`. `${` cũng bị hiểu nhầm |
| B. ``code={String.raw`...`}`` | Giữ `\` | Vẫn vỡ khi code có dấu backtick; tác giả dễ quên `String.raw` |
| **C. File `src/code/<phần>/<bài>/<tên>.py`, import `?raw` (chọn)** | Không phải escape gì (đã kiểm chứng: `print("a\nb")` giữ nguyên); `content-reviewer` chạy thẳng `python src/code/...py` để kiểm tra; vi và en **dùng chung một file**, nên code hai bản chắc chắn giống nhau | Code nằm ở file khác |

Chọn **C**. Cách dùng trong MDX (đã kiểm chứng import `?raw` qua alias `@code` trong MDX):

```mdx
import PythonRunner from '@components/PythonRunner.astro';
import fitCode from '@code/ml/linear-regression/fit.vi.py?raw';

<PythonRunner code={fitCode} />
```

**Quyết định của người dùng (22/10/2026): comment trong code theo ngôn ngữ của bài.** Vì vậy mỗi ví dụ có **hai file**: `<tên>.vi.py` (comment tiếng Việt) và `<tên>.en.py` (comment tiếng Anh), cùng thư mục. Bản vi import `.vi.py`, bản en import `.en.py`. `lesson-translator` tạo file `.en.py` khi dịch bài.

Để hai bản không lệch code, M1 thêm test `tests/unit/code-pairs.test.ts`:

- Mỗi `.vi.py` phải có `.en.py` cùng tên, và ngược lại.
- Sau khi bỏ comment (`# ...` đến cuối dòng, không tính `#` nằm trong chuỗi) và dòng trống, hai file phải giống hệt nhau. Chuỗi in ra (`print("...")`) được coi là code, nên **chuỗi in ra viết tiếng Anh hoặc chỉ in số**, không dịch.

Python trên máy phát triển là 3.14, cùng phiên bản với Pyodide 314.0.7 (Python 3.14.2), nên kết quả chạy thử local đáng tin. Thư viện vẫn có thể khác bản (ví dụ pandas).

### 2.4. Trình soạn code: khối code tĩnh + nút "Sửa"

- Mặc định hiện code bằng `<Code>` của Starlight (Expressive Code, tô màu lúc build, có nút copy, 0 KB JS thêm). Không có JS thì người đọc vẫn đọc được code.
- Bấm **"Sửa code"** → thay bằng `<textarea>` (font mono, `spellcheck=false`, Tab chèn 4 dấu cách, `Esc` rồi `Tab` để thoát ô). **"Khôi phục code gốc"** trả về code ban đầu.
- Không dùng CodeMirror ở M1 (thêm khoảng 150 KB). Xét lại khi có phản hồi của người đọc.

### 2.5. Pyodide

- **Phiên bản 314.0.7** (bản ổn định mới nhất, ra ngày 2026-09-14). Gói có sẵn trong bản này: numpy 2.4.6, pandas 3.0.2, matplotlib 3.10.8, scipy 1.18.0, scikit-learn 1.8.0, micropip 0.11.1 (đã đọc `pyodide-lock.json`). **Không có seaborn.**
- Tải từ jsDelivr: `https://cdn.jsdelivr.net/pyodide/v314.0.7/full/` (có `Access-Control-Allow-Origin: *` và `Cache-Control: max-age=31536000`, đã kiểm tra).
- Chạy trong **module Web Worker**. Tài liệu Pyodide ghi rõ: bắt buộc worker kiểu module vì `pyodide.asm.mjs` là ES module; không dùng `importScripts`.
- Worker tải `pyodide.mjs` bằng `import(/* @vite-ignore */ url)`. Gói npm `pyodide@314.0.7` chỉ để lấy **kiểu TypeScript** (`import type`). Đã kiểm chứng trong spike: Vite tách worker thành file riêng `/_astro/worker-*.js`, URL CDN giữ nguyên, `astro check` 0 lỗi.
- **Chỉ tải khi bấm "Chạy" lần đầu.** Island React tải lúc cuộn tới (`client:visible`), nhưng module `client.ts` (tạo worker) chỉ được `import()` động bên trong handler của nút Chạy.
- **Một worker dùng chung cho cả trang.** Nhiều `PythonRunner` trên một trang chỉ tải Pyodide một lần. Các lần chạy xếp hàng, chạy lần lượt.
- **Mỗi lần chạy có namespace riêng** (`globals` mới). Biến của ô này không lọt sang ô khác. Mô hình đơn giản, kết quả lặp lại được.
- Gói Python tự tải theo `import` trong code (`loadPackagesFromImports`).
- **Dừng:** nút "Dừng" gọi `worker.terminate()` rồi tạo worker mới ở lần chạy sau (lần sau tải nhanh vì trình duyệt đã cache). Không dùng `setInterruptBuffer` vì nó cần `SharedArrayBuffer`, tức phải bật header COOP/COEP cho cả site. Các header này dễ chặn tài nguyên từ CDN.
- **Biểu đồ matplotlib:** worker đặt `MPLBACKEND=AGG` trước khi import matplotlib. Sau khi chạy, worker xuất mọi figure đang mở thành PNG base64 rồi `plt.close('all')`. `plt.show()` không làm gì và không báo lỗi.
- **`input()`:** worker không thể hỏi người dùng một cách đồng bộ. Prop `stdin` cung cấp sẵn dữ liệu nhập (cần cho bài `python/basic-syntax`). Không có `stdin` mà code gọi `input()` thì báo lỗi dễ hiểu.

## 3. Cấu trúc file

```
src/
├─ components/
│  ├─ Prerequisites.astro
│  ├─ Quiz.astro                     # wrapper: đọc frontmatter quiz, render math, lấy chuỗi
│  ├─ quiz/QuizIsland.tsx            # React
│  ├─ LessonProgress.astro           # nút + custom element <atlas-lesson-progress>
│  ├─ PythonRunner.astro             # wrapper: <Code> tĩnh + chuỗi + island
│  ├─ python-runner/
│  │  ├─ PythonRunnerIsland.tsx      # React: nút, trạng thái, editor, output
│  │  └─ OutputPanel.tsx             # React: stdout/stderr, lỗi, hình
│  └─ RoadmapMap.astro
├─ lib/
│  ├─ progress.ts                    # đọc/ghi tiến độ, an toàn khi localStorage bị chặn
│  ├─ progress-marks.ts              # gắn data-done cho [data-lesson-id] trong trang
│  ├─ inline-markup.ts               # renderInlineMarkup(): escape HTML + $math$ + `code`
│  ├─ quiz-schema.ts                 # zod schema cho frontmatter `quiz`
│  └─ pyodide/
│     ├─ config.ts                   # PYODIDE_VERSION, PYODIDE_INDEX_URL
│     ├─ protocol.ts                 # kiểu message main <-> worker
│     ├─ client.ts                   # main thread: worker singleton, hàng đợi, runPython, stopPython
│     ├─ worker.ts                   # module worker: tải Pyodide, chạy code, thu figure
│     └─ errors.ts                   # parsePythonError(): traceback -> thông tin dễ hiểu
├─ i18n/
│  ├─ ui.ts                          # thêm namespace: prereq, quiz, progress, runner, roadmap
│  └─ format.ts                      # formatString('Câu {{n}}', { n: 2 })
├─ code/
│  └─ dev/demo.py, dev/plot.py, dev/error.py   # code cho trang demo
└─ content/docs/{vi,en}/dev/components.mdx    # trang demo (đã có từ M0)
tests/unit/
├─ progress.test.ts  inline-markup.test.ts  python-errors.test.ts  format.test.ts
├─ quiz-island.test.tsx  python-runner-island.test.tsx   # jsdom + Testing Library
└─ quiz-schema.test.ts
tests/e2e/
└─ components.spec.ts
```

## 4. Giao diện

### 4.1. Phần dùng chung

```ts
// src/lib/progress.ts
export const PROGRESS_STORAGE_KEY = 'ai-atlas:progress:v1';
export const PROGRESS_EVENT = 'atlas:progress-change'; // CustomEvent on window, same-tab sync

export interface ProgressData {
  version: 1;
  lessons: Partial<Record<LessonId, { doneAt: string }>>; // ISO date; keyed by lesson id, shared by vi/en
}

export function isStorageAvailable(): boolean;           // false when blocked (private mode, policy)
export function getProgress(): ProgressData;             // corrupt/missing data -> empty, never throws
export function isDone(id: LessonId): boolean;
export function setDone(id: LessonId, done: boolean): void; // falls back to in-memory when storage is blocked
export function subscribe(listener: (data: ProgressData) => void): () => void; // 'storage' + PROGRESS_EVENT

// For tests: inject a fake Storage (or one whose methods throw).
export function createProgressStore(storage: Storage | null): {
  get(): ProgressData; isDone(id: LessonId): boolean; setDone(id: LessonId, done: boolean): void;
};
```

```ts
// src/lib/progress-marks.ts — used by <script> in Prerequisites/RoadmapMap
/** Sets data-done="true|false" on every [data-lesson-id] inside root, and keeps it updated. */
export function applyProgressMarks(root?: ParentNode): () => void;
```

CSS dựa trên `[data-done="true"]` để hiện ✓. Mỗi ✓ đi kèm chữ ẩn cho trình đọc màn hình (chuỗi `atlas.common.learned`, render sẵn, ẩn bằng CSS, chỉ hiện khi `data-done="true"`).

```ts
// src/lib/inline-markup.ts
/** Escapes HTML, renders $...$ with KaTeX (throwOnError: false) and `code`. Build-time only. */
export function renderInlineMarkup(text: string): string;
```

```ts
// src/i18n/format.ts
export function formatString(template: string, vars: Record<string, string | number>): string; // '{{name}}'
```

Namespace chuỗi giao diện thêm ở M1, cùng ngữ nghĩa với `src/i18n/ui.ts` (mỗi key phải có trong cả `vi.json` và `en.json`):

```ts
common:   ['comingSoon', 'learned', 'notTranslated'],
prereq:   ['none'],
quiz:     ['title', 'question', 'check', 'retry', 'correct', 'incorrect', 'explanation', 'score', 'chooseOne'],
progress: ['markDone', 'markUndone', 'doneStatus', 'storageBlocked'],
runner:   ['run', 'running', 'loadingPython', 'loadingPackages', 'stop', 'stopped', 'edit', 'view', 'reset',
           'output', 'noOutput', 'figure', 'errorTitle', 'errorLine', 'showTraceback', 'queued',
           'loadFailed', 'stdinMissing', 'hintNameError', 'hintSyntaxError', 'hintIndentationError',
           'hintTypeError', 'hintModuleNotFoundError', 'hintGeneric'],
roadmap:  ['title', 'lessons', 'branchNote', 'progressSummary'],
```

Ví dụ chuỗi có biến: `"atlas.quiz.score": "Đúng {{correct}}/{{total}} câu"`, `"atlas.runner.errorLine": "Lỗi ở dòng {{line}}"`, `"atlas.quiz.question": "Câu {{n}}"`.

### 4.2. `Prerequisites` (Astro)

```ts
// src/components/Prerequisites.astro
interface Props {
  /** Override. Default: prerequisites of the current lesson from roadmap.ts. */
  ids?: LessonId[];
}
```

Dùng trong bài (mục "Cần biết trước"):

```mdx
<Prerequisites />
```

Hành vi:

- Không có `ids`: lấy bài hiện tại bằng `getRouteLessonId(Astro.locals.starlightRoute.id)`, rồi lấy `getPrerequisites()`. Trang không phải bài học mà không truyền `ids` → **build lỗi** kèm thông báo rõ (tránh khối rỗng âm thầm).
- `ids` chứa id không có trong roadmap → build lỗi (`requireLesson`).
- Mỗi mục: tiêu đề theo ngôn ngữ trang, tên phần.
  - Bài có trang: link `getLessonUrl(id, locale)`.
  - Bài chưa có trang: chữ thường + nhãn "Sắp có", **không có link**.
  - Bài có trang nhưng chưa dịch sang ngôn ngữ hiện tại: vẫn link, thêm nhãn "Chưa dịch".
- Danh sách rỗng: hiện `atlas.prereq.none` ("Bài này không cần kiến thức trước.").
- Đánh ✓ bài đã học qua `applyProgressMarks()` (script nhỏ, chạy khi trang tải).
- HTML: `<ul>` thường. Không cần ARIA đặc biệt.

### 4.3. `Quiz` (Astro wrapper + React island)

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
// docsSchema({ extend: z.object({ quiz: quizSchema.optional() }) })
```

Frontmatter trong bài:

```yaml
quiz:
  - question: 'Nếu $\eta$ quá lớn, gradient descent có thể làm gì?'
    options:
      - 'Hội tụ nhanh hơn và luôn tới cực tiểu'
      - 'Dao động hoặc phân kỳ'
    answer: 1
    explanation: 'Bước nhảy quá dài làm $\mathcal{L}$ tăng thay vì giảm.'
```

Quy tắc viết: **luôn dùng nháy đơn `'...'`** cho chuỗi có `$` hoặc `\`. Trong nháy đơn YAML, `\` giữ nguyên; muốn có dấu `'` thì gõ `''`.

```ts
// src/components/Quiz.astro
interface Props {
  /** Only for the demo page/tests. Lessons use frontmatter `quiz`. */
  questions?: QuizQuestion[];
}
// Renders <QuizIsland client:visible questions={rendered} strings={getStrings(t, 'quiz')} />
// Build error if neither `questions` nor frontmatter `quiz` exists.
```

```ts
// src/components/quiz/QuizIsland.tsx
export interface RenderedQuizQuestion {
  questionHtml: string;     // output of renderInlineMarkup (trusted, build-time)
  optionsHtml: string[];
  answer: number;
  explanationHtml: string;
}
export interface QuizIslandProps {
  questions: RenderedQuizQuestion[];
  strings: UiStrings<'quiz'>;
  idPrefix: string;         // unique per quiz on the page, for input names/ids
}
export default function QuizIsland(props: QuizIslandProps): JSX.Element;
```

Hành vi:

- Mỗi câu là một `<fieldset>` có `<legend>`, đáp án là `<input type="radio">` thật. Nhờ vậy dùng được bằng bàn phím (Tab, phím mũi tên, Space) mà không cần tự viết.
- Nút "Kiểm tra" từng câu (bị tắt khi chưa chọn). Sau khi kiểm tra: hiện Đúng/Sai **bằng chữ và biểu tượng**, không chỉ bằng màu; hiện giải thích; khóa lựa chọn; có "Làm lại".
- Kết quả đặt trong vùng `aria-live="polite"`.
- Tổng điểm `atlas.quiz.score` hiện khi đã kiểm tra hết các câu.
- Không lưu kết quả quiz.
- SSR: island render sẵn câu hỏi và đáp án lúc build. Chưa hydrate xong thì vẫn đọc được câu hỏi.
- `dangerouslySetInnerHTML` chỉ dùng cho HTML do `renderInlineMarkup` tạo lúc build từ nội dung trong repo. Ghi chú này đặt thành comment trong code.

### 4.4. `LessonProgress` (Astro + custom element)

```ts
// src/components/LessonProgress.astro
interface Props {
  /** Override. Default: current lesson from the route. */
  id?: LessonId;
}
```

```mdx
<LessonProgress />
```

Render:

```html
<atlas-lesson-progress data-lesson-id="ml/linear-regression">
  <button type="button" aria-pressed="false"
          data-label-todo="Đánh dấu đã học" data-label-done="Đã học ✓ (bấm để bỏ)">Đánh dấu đã học</button>
  <p data-storage-warning hidden>…atlas.progress.storageBlocked…</p>
</atlas-lesson-progress>
```

Hành vi:

- Mọi nhãn render sẵn từ i18n vào `data-*`. Script không chứa chữ.
- Custom element (`customElements.define('atlas-lesson-progress', …)`) đọc `isDone()`, đặt `aria-pressed` và nhãn. Bấm thì gọi `setDone()`. Lắng nghe `subscribe()` để đồng bộ khi có nhiều tab.
- localStorage bị chặn: nút vẫn bật/tắt trong phiên hiện tại; hiện cảnh báo "Trình duyệt đang chặn lưu dữ liệu, tiến độ sẽ mất khi tải lại trang". **Không throw lỗi.**
- Chưa có JS: nút hiện nhưng `disabled`. Script bỏ `disabled` khi chạy.

### 4.5. `PythonRunner` (Astro wrapper + React island)

```ts
// src/components/PythonRunner.astro
interface Props {
  code: string;            // usually imported with `?raw` from src/code/...
  stdin?: string;          // lines fed to input(); shows an editable "Input" box when set
  title?: string;          // optional caption above the block (content, per locale)
  figureAlt?: string[];    // alt text per figure; default: atlas.runner.figure "Biểu đồ {{n}}"
}
// Renders:
// <PythonRunnerIsland client:visible code={code} stdin={stdin} strings={...} figureAlt={...}>
//   <Code code={code} lang="python" />   <!-- static, highlighted, passed as children -->
// </PythonRunnerIsland>
```

```ts
// src/components/python-runner/PythonRunnerIsland.tsx
export interface PythonRunnerIslandProps {
  code: string;
  stdin?: string;
  figureAlt?: string[];
  strings: UiStrings<'runner'>;
  children?: React.ReactNode;   // static highlighted code from <Code>
}
type RunnerUiState =
  | { kind: 'idle' }
  | { kind: 'queued' }
  | { kind: 'loading'; step: 'python' | 'packages'; packages?: string[] }
  | { kind: 'running' }
  | { kind: 'done'; result: RunResult }
  | { kind: 'error'; result: RunResult }
  | { kind: 'load-failed' };
```

Giao thức và client:

```ts
// src/lib/pyodide/config.ts
export const PYODIDE_VERSION = '314.0.7';
export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// src/lib/pyodide/protocol.ts
export type WorkerRequest = { type: 'run'; id: number; code: string; stdin?: string };
export type WorkerMessage =
  | { type: 'status'; id: number; status: 'loading-python' | 'loading-packages' | 'running'; packages?: string[] }
  | { type: 'stdout' | 'stderr'; id: number; text: string }
  | { type: 'done'; id: number; result: RunResult };

export interface PythonErrorInfo {
  type: string;            // 'NameError', 'SyntaxError', ...
  message: string;         // last line without the type, e.g. "name 'x' is not defined"
  line?: number;           // line in the user's code (from File "<exec>", line N)
  traceback: string;       // full text, shown collapsed
}
export interface RunResult {
  ok: boolean;
  figures: string[];       // 'data:image/png;base64,...'
  error?: PythonErrorInfo;
  durationMs: number;
}

// src/lib/pyodide/client.ts  (imported dynamically on first click)
export type RunEvent = Exclude<WorkerMessage, { type: 'done' }>;
export function runPython(code: string, opts: { stdin?: string; onEvent: (e: RunEvent) => void }): Promise<RunResult>;
export function stopPython(): void;          // terminate worker; queued runs resolve with a 'stopped' error
export function isPythonReady(): boolean;
// Worker: new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

// src/lib/pyodide/errors.ts  (pure, unit-tested)
export function parsePythonError(traceback: string): PythonErrorInfo;
export function hintKeyFor(type: string): 'hintNameError' | 'hintSyntaxError' | 'hintIndentationError'
  | 'hintTypeError' | 'hintModuleNotFoundError' | 'hintGeneric';
```

Worker (`worker.ts`), các bước:

1. Lần đầu: `import(/* @vite-ignore */ PYODIDE_INDEX_URL + 'pyodide.mjs')` → `loadPyodide({ indexURL: PYODIDE_INDEX_URL })`; đặt `MPLBACKEND=AGG`; gửi `status: loading-python`.
2. `loadPackagesFromImports(code)`; nếu có gói phải tải thì gửi `status: loading-packages` kèm tên gói.
3. `setStdout`/`setStderr` dạng `batched` → gửi `stdout`/`stderr`. `setStdin` lấy từ `stdin` (hết dữ liệu thì `input()` báo `EOFError`, client đổi thành chuỗi `stdinMissing`).
4. `runPythonAsync(code, { globals: <dict mới> })`.
5. Nếu `matplotlib.pyplot` đã được import: mỗi figure → `savefig(BytesIO, format='png', dpi=100, bbox_inches='tight')` → base64; rồi `plt.close('all')`.
6. Lỗi Python: gửi `traceback` để main thread tự gọi `parsePythonError`. Không lộ stack của worker.

Hành vi giao diện:

- Nút chính: "Chạy" → "Đang tải Python…" (lần đầu, kèm ghi chú khoảng 10 MB) → "Đang tải thư viện: numpy, scikit-learn…" → "Đang chạy…". Trong lúc chạy có nút "Dừng".
- Output: `<pre>` trong vùng `aria-live="polite"`; không có output thì hiện "Chương trình chạy xong, không in gì."
- Lỗi: tiêu đề "Có lỗi" + `NameError: name 'x' is not defined` + "Lỗi ở dòng 3" + gợi ý theo loại lỗi; traceback đầy đủ nằm trong `<details>`.
- Biểu đồ: `<img src="data:..." alt=...>` co theo chiều rộng khung (`max-width: 100%`), không gây cuộn ngang ở 375px.
- Tải Pyodide thất bại (mất mạng, CDN lỗi): trạng thái `load-failed` với nút thử lại.
- "Sửa code" / "Xem code" / "Khôi phục code gốc" theo mục 2.4. Code đã sửa không lưu.
- Bàn phím: mọi nút là `<button>`; `Ctrl+Enter` trong textarea để chạy.

### 4.6. `RoadmapMap` (Astro, bản đơn giản)

```ts
// src/components/RoadmapMap.astro
interface Props {
  /** Show ✓ for learned lessons (needs a tiny script). Default true. */
  showProgress?: boolean;
  /** Limit to some parts, e.g. on a part overview page. Default: all parts. */
  parts?: PartId[];
}
```

Dùng ở trang chủ:

```mdx
import RoadmapMap from '@components/RoadmapMap.astro';

<RoadmapMap />
```

Hành vi:

- Lưới thẻ: mỗi phần một thẻ gồm số phần (`1`…`5c`), tiêu đề, mô tả một dòng, số bài, danh sách bài `<ol>` theo thứ tự lộ trình. Ở 375px: một cột. Màn rộng: 2–3 cột (CSS grid, `minmax`).
- Thứ tự hiển thị: bốn phần `core` theo thứ tự; tiếp theo là dòng `atlas.roadmap.branchNote` ("Sau phần Học sâu, chọn một nhánh"); cuối cùng là ba phần `branch`.
- `llm` chia hai mục con theo `sections`.
- Bài có trang: link. Bài chưa có trang: chữ + nhãn "Sắp có", **không link**. Bài chưa dịch (ở trang en): link + nhãn "Chưa dịch".
- ✓ bài đã học qua `applyProgressMarks()`. Mỗi thẻ có dòng "Đã học 2/14 bài" (`atlas.roadmap.progressSummary`), script cập nhật số. Không có JS thì dòng này ẩn.
- Không React. HTML thuần, nên trang chủ không tải JS của React.

> **Đã làm sớm cùng trang chủ (22/10/2026)**, ở `src/components/RoadmapMap.astro`. Chi tiết thiết kế ở [homepage.md](homepage.md). Chỗ khác so với spec trên:
>
> - **Props hiện có:** `id` (tiền tố id, để một trang có nhiều bản đồ), `parts`, `routeFinder` (ô "Điểm đến": chọn một bài, mọi bài trên đường tới đó được tô lên) và `destination` (điểm đến chọn sẵn, dựng ở server nên chạy được cả khi tắt JS). Đường đi tính bằng `routeTo()` trong `src/lib/route.ts`. Tiêu đề và lời dẫn truyền qua slot `title` và `intro`. Kết quả có thêm chặng theo từng phần ("Python 4 → Toán cho AI 2 → …") và nút "Xem trên bản đồ". Khi chỉ vẽ một số phần, toàn bộ đồ thị đi kèm dạng JSON để đường đi vẫn đúng.
> - **`showProgress` chưa làm.** Phần này cần `src/lib/progress.ts` của M1 và sẽ thêm cùng `LessonProgress`.
> - **Hình thức theo skill:**
>   - Không dùng lưới thẻ mà dùng một tấm bản đồ giấy có viền sọc.
>   - Không hiện số phần (`1`…`5c`), vì skill cấm đánh số.
>   - Bài chưa có trang hiện chữ nhạt, kèm nhãn "Sắp có" ẩn cho trình đọc màn hình, thay vì 78 nhãn hiện ra. Chú giải đặt ở cuối tấm bản đồ.

### 4.7. Thay đổi `docs/lesson-template.mdx` (làm ở M1)

Sau khi component xong, template đổi như sau. Việc sửa template do `developer` làm trong M1, rồi chốt lại ở M2 khi duyệt bài mẫu:

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
import exampleCode from '@code/<phần>/<bài>/example.py?raw';

## Cần biết trước
<Prerequisites />

## Ví dụ code
<PythonRunner code={exampleCode} />

## Kiểm tra nhanh
<Quiz />

<LessonProgress />
```

- Bỏ `sidebar.order` (sidebar sinh từ `roadmap.ts`).
- Bỏ mọi `client:*` (wrapper tự gắn).
- Bỏ danh sách link tương đối ở "Cần biết trước" (component thay thế; xem quy tắc link tuyệt đối ở [scaffold.md](scaffold.md) mục 2.8).
- Phần DL, NLP, CV, LLM có code cần PyTorch/GPU: dùng khối code Markdown thường ` ```python `, không dùng `PythonRunner`.

## 5. Phụ thuộc (cài ở M1)

| Gói | Phiên bản | Loại | Dùng cho |
|---|---|---|---|
| `pyodide` | 314.0.7 | devDependencies | Chỉ kiểu TypeScript (`import type { PyodideAPI, loadPyodide }`). Runtime tải từ CDN cùng phiên bản |
| `jsdom` | 30.1.3 | devDependencies | Môi trường DOM cho test component (`// @vitest-environment jsdom`) |
| `@testing-library/react` | 16.3.3 | devDependencies | Test `QuizIsland`, `PythonRunnerIsland` |
| `@testing-library/user-event` | 14.6.8 | devDependencies | Giả lập bàn phím, chuột |

```sh
npm install -D -E pyodide@314.0.7 jsdom@30.1.3 @testing-library/react@16.3.3 @testing-library/user-event@14.6.8
```

`katex` (0.16.47) đã có từ M0, dùng lại trong `renderInlineMarkup`. Không thêm gói runtime nào.

Test `deps.test.ts` (M0) bổ sung: `pyodide` trong `package.json` phải bằng `PYODIDE_VERSION` trong `src/lib/pyodide/config.ts`.

## 6. Các bước thực hiện

Mỗi nhiệm vụ của `developer` kết thúc bằng `npm run build` (không `[WARN]`), `npm run check` (0 lỗi), `npm test`.

| # | Agent | Việc | Tiêu chí hoàn thành |
|---|---|---|---|
| 0 | (phiên chính) | Thiết kế hình thức 5 component và trang chủ bằng skill `design-taste-frontend` | Có mô tả/thiết kế hình thức được người dùng đồng ý; chỉ dùng `--sl-color-*` |
| 1 | `developer` | Nền chung: `progress.ts`, `progress-marks.ts`, `inline-markup.ts`, `format.ts`, thêm namespace i18n (mục 4.1) vào `ui.ts`, `vi.json`, `en.json`; cài gói mục 5 | Unit test: `createProgressStore(null)` và Storage ném lỗi đều không throw; dữ liệu hỏng trả rỗng; `renderInlineMarkup('<b>$\\frac{1}{2}$</b>')` escape `<b>` và có `class="katex"` |
| 2 | `developer` | `Prerequisites.astro`, `RoadmapMap.astro` | Trên trang demo: bài planned không có `<a>`; bài published có link đúng `/vi/.../`; trang chủ dùng `RoadmapMap` và **không** tải file JS nào của React (kiểm tra trong `dist/vi/index.html`) |
| 3 | `developer` | `LessonProgress.astro` | E2E: bấm → tải lại trang → vẫn "Đã học"; dùng `page.addInitScript` làm `localStorage` ném lỗi → bấm không lỗi console, hiện cảnh báo |
| 4 | `developer` | `quiz-schema.ts`, mở rộng `docsSchema`, `Quiz.astro`, `QuizIsland.tsx` | Test schema: `answer` ngoài phạm vi → lỗi; RTL: chọn đúng → "Đúng" + giải thích; chọn sai → "Sai"; điểm cuối đúng; làm được chỉ bằng bàn phím |
| 5 | `developer` | `pyodide/*`, `PythonRunner.astro`, `PythonRunnerIsland.tsx`, `OutputPanel.tsx` | Test `parsePythonError` với traceback thật của `NameError`, `SyntaxError`, `IndentationError` (lấy dòng đúng); RTL với `client.ts` được mock: các trạng thái hiện đúng chuỗi |
| 6 | `developer` | Trang demo `vi/dev/components.mdx`, `en/dev/components.mdx` dùng đủ 5 component; code demo trong `src/code/dev/` (in ra, vẽ một biểu đồ, một lỗi cố ý); sửa `docs/lesson-template.mdx` theo mục 4.7 | Build qua; trang demo hiện đủ 5 component ở cả vi/en |
| 7 | `tester` | `tests/e2e/components.spec.ts` | (a) Mở trang demo: **không có request nào tới `cdn.jsdelivr.net/pyodide`** (`page.on('request')`). (b) Bấm Chạy: có output đúng và một `<img>` biểu đồ (test cần mạng, đánh dấu `@network`, timeout 120 s). (c) Code lỗi hiện tên lỗi và số dòng. (d) Quiz, LessonProgress dùng được bằng bàn phím. (e) 375px không cuộn ngang, sáng/tối đều kiểm tra |
| 8 | `analyst` | Review M1: hiệu năng (Lighthouse mobile trên trang demo và trang chủ), trợ năng, kích thước JS mỗi trang | Báo cáo có số đo; trang chủ không có React; trang demo Performance ≥ 90 trước khi bấm Chạy |

Thứ tự: 0 → 1 → (2, 3 song song được vì khác file) → 4 → 5 → 6 → 7 → 8. Nhiệm vụ 4 và 5 cùng sửa `ui.ts`/`vi.json`/`en.json` nếu thiếu key, nên **không** chạy song song; nhiệm vụ 1 đã thêm sẵn mọi key để tránh xung đột.

## 7. Rủi ro và điểm chưa chắc

| # | Rủi ro | Ảnh hưởng | Cách xử lý |
|---|---|---|---|
| 1 | Pyodide + scikit-learn + scipy tải nặng (runtime khoảng 10 MB, cộng vài chục MB gói) trên mạng di động | Chờ lâu ở lần bấm đầu | Hiện từng bước tải và tên gói; cache trình duyệt một năm; lần sau nhanh |
| 2 | Phụ thuộc jsDelivr | CDN lỗi thì không chạy được code | Trạng thái `load-failed` + thử lại. Phương án dự phòng sau MVP: tự host trên Cloudflare Pages (giới hạn 25 MiB mỗi file, cần kiểm tra tổng số file) |
| 3 | **Không có seaborn trong Pyodide 314.0.7** | Bài `python/data-visualization` | Seaborn là gói Python thuần, có thể cài bằng `micropip.install('seaborn')` lúc chạy (cần mạng tới PyPI). Chưa kiểm chứng. Quyết định khi viết bài đó; MVP không cần |
| 4 | E2E chạy Pyodide cần mạng, dễ chập chờn | Test không ổn định | Tách test có mạng (`@network`); test "không tải Pyodide khi mở trang" không cần mạng |
| 5 | Mỗi lần chạy dùng namespace riêng | Bài muốn chia code thành nhiều ô nối tiếp sẽ không dùng chung biến được | Chấp nhận ở MVP; sau này có thể thêm prop `session="ten"` để các ô chung namespace |
| 6 | Gõ code trong `<textarea>` không có tô màu | Trải nghiệm sửa code kém hơn | Đủ cho MVP; xét CodeMirror sau |
| 7 | Quiz trong frontmatter xa vị trí hiển thị | Người viết có thể quên | Template có sẵn khối `quiz:` mẫu; `<Quiz />` báo lỗi build nếu bài không có quiz |
| 8 | Comment trong code ví dụ | Đã quyết: theo ngôn ngữ của bài, hai file `.vi.py`/`.en.py` | Test `code-pairs.test.ts` bắt lệch code (mục 2.3) |

### Câu hỏi cho người dùng

1. ~~**Comment trong code ví dụ**~~ → theo ngôn ngữ của bài, hai file `.vi.py`/`.en.py` (mục 2.3).
2. ~~**Quiz trong frontmatter**~~ → đồng ý (22/10/2026).
3. ~~**Mỗi ô code chạy độc lập**~~ → đồng ý cho MVP (22/10/2026).
