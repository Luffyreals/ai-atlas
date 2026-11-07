# Ra mắt MVP: mốc M4

> Thiết kế ngày 25/10/2026, theo [quyết định 64](../decisions.md) (phạm vi M4 do người dùng chọn). Nhánh `m4-launch`.
> Liên quan: [scaffold.md](scaffold.md) mục 4.11 (Cloudflare Pages), [homepage.md](homepage.md) (nhận diện, font), [components.md](components.md) (PythonRunner), [README.md](README.md) mục 3.1 (SEO trang fallback), mục 4 (KaTeX).
> Các quyết định cũ phải giữ: 13 (CSS component gộp vào `customCss`), 14 và 17 (LCP trang chủ và Performance để lại cho M4), 29 (thử KaTeX MathML, phải kiểm tra Chrome, Firefox, Safari trước khi đổi), 30 và 33 (trang fallback), 34 (trang không phải bài học có đủ vi và en), 62 (CLS do font làm thành việc riêng).

## 1. Mục tiêu và phạm vi

**M4 làm**, theo bảy việc a–g:

| | Việc | Mục |
|---|---|---|
| a | Trang Giới thiệu `/vi/about/`, `/en/about/` | 3.1 |
| b | Chân trang ghi giấy phép và link Giới thiệu trên mọi trang | 3.2 |
| c | SEO: `site` từ một nguồn, ảnh chia sẻ, `og:locale`, `robots.txt`, 404 `noindex` | 3.3 |
| d | Sửa CLS do font | 3.4 |
| e | Performance bài học trên điện thoại ≥ 90 (Accessibility ≥ 95, SEO ≥ 95), sửa lỗi axe nghiêm trọng | 3.5, 3.6 |
| f | Chuẩn bị Cloudflare Pages: `_headers`, `_redirects`, hướng dẫn kết nối | 3.7 |
| g | Danh sách test | 8 |

**M4 không làm:**

- Kết nối Cloudflare Pages và mua tên miền. Người dùng tự làm sau theo mục 3.7.3.
- Content Security Policy đầy đủ (quyết định 64).
- Thống kê truy cập (Cloudflare Web Analytics, `PLAN.md` Giai đoạn 4). Nếu bật sau này thì sửa câu về quyền riêng tư trên trang Giới thiệu.
- Bản en của các bài M3 và bài LLM (quyết định 43, 53).
- Ảnh chia sẻ riêng cho từng bài. Thiết kế ở mục 3.3.2 vẫn cho phép thêm sau mà không phải sửa lại.

**Tiêu chí đo Lighthouse** (quyết định 64): Lighthouse 13.5.0, cấu hình mobile, trung vị 3 lần đo, trên bản `npm run preview`. Hai trang tính điểm là `/vi/ml/linear-regression/` và `/en/ml/linear-regression/`. Các trang khác chỉ để tham khảo.

## 2. Hiện trạng

### 2.1. Số đo mốc của analyst

Lighthouse 13.5.0 mobile, trung vị 3 lần. Máy bận nên số dao động mạnh.

| Trang | Perf | LCP | CLS | TBT (ms) | DOM |
|---|---|---|---|---|---|
| vi/ml/linear-regression | 79 | 4,0 s | 0,011 | 215 | 12 031 |
| en/ml/linear-regression | 75 | 3,5 s | 0,010 | 616 | 12 041 |
| vi/ml/gradient-descent | 67 | 4,0 s | 0,164 | 260 | 11 672 |
| vi/llm/llama-family | 59 | 3,6 s | 0,144 | 886 | 9 799 |
| vi/llm/deepseek-family | 72 | 3,9 s | 0,185 | 125 | 10 147 |
| vi/llm/text-api | 90 | 3,5 s | 0 | 0 | 5 678 |
| vi/ (trang chủ) | 75 | 5,4 s | 0,012 | 0 | 1 271 |

A11y, Best Practices và SEO đều 100.

Analyst đã thử trên bản sao của `dist/` (trung vị 3 lần). Chưa đo khi kết hợp các thay đổi:

| Thử | Kết quả |
|---|---|
| Bỏ hẳn Barlow | LR 87, deepseek 93, CLS 0 |
| Barlow `font-display: optional`, có hoặc không preload | CLS 0, Perf +4–5 |
| Bỏ Barlow 400-italic và 600 | LR 91, LCP giảm 0,5–0,7 s |
| Mô phỏng KaTeX MathML (bỏ `.katex-html`) | LR 92, deepseek 89, DOM khoảng 5 520, HTML giảm 49% |

### 2.2. Nguyên nhân chính

- **Font Barlow.** Nạp qua 4 import `@fontsource` trong `customCss` (`astro.config.ts`), `font-display: swap` cố định, không preload. Một bài vi tải 12 file, tổng 181 KB: 4 kiểu (400, 400-italic, 600, Condensed 700) nhân 3 subset (latin, latin-ext, vietnamese).
  - Toàn bộ CLS do font. Barlow hẹp hơn font hệ thống, nên khi đổi sang Barlow, đoạn văn ít dòng hơn và các phần tử bên dưới dịch lên khoảng 27px.
  - `llama-family` dịch hai lần vì các subset về nhiều đợt.
  - LCP của bài học là `li` đầu tiên của mục "Mục tiêu", chữ Barlow.
- **KaTeX HTML.** Chiếm 55–65% HTML. Bài mẫu: 572 KB thô, 52,6 KB gzip, 236 công thức. DOM 10–12 nghìn phần tử. Mỗi bài tải 6–9 font KaTeX, 66–135 KB.
- **CSS chặn render.** Một file 28 KB gzip, khoảng 170 ms. Trong đó 32 `@font-face` khoảng 6 KB, `.katex` khoảng 3 KB. JS ban đầu khoảng 11 KB, không phải vấn đề.
- **Trang chủ.** LCP là ảnh hero `plate-taberd`: AVIF 960w, 244 KB. Ảnh gốc 1400×2444 (dọc) bị cắt thành khung ngang khi hiển thị trên điện thoại. Lighthouse ước tiết kiệm được 401 KiB.

### 2.3. Lỗi axe

Analyst quét ở chế độ sáng và tối, rộng 412px và 1280px:

| Mức | Rule | Chỗ | Xử lý |
|---|---|---|---|
| Nghiêm trọng | `scrollable-region-focusable` | `.katex-display` và bảng cuộn ngang không focus được bằng bàn phím | Mục 3.6.1 |
| Nghiêm trọng | `label-content-name-mismatch` | Nút Tìm kiếm của Starlight | Lỗi của Starlight, ghi lại, không sửa (mục 3.6.4) |
| Vừa | `landmark-unique` | `pre role="region"` không nhãn của Expressive Code | Mục 3.6.3 |
| Vừa | `region` | Skip link ở trang chủ | Mục 3.6.2 |
| Nhẹ | `empty-table-header` | Ô tiêu đề bảng chỉ có công thức | Có thể báo nhầm, kiểm lại sau mục 3.6.1 |
| Nhẹ | `image-redundant-alt` | Logo có `alt="AI Atlas"` nằm cạnh chữ "AI Atlas" | Mục 3.6.2 |

Không có lỗi tương phản.

### 2.4. Architect kiểm thêm trên `dist/` hiện tại

- **`dist/404.html` không có `noindex`.** Trang có canonical `/404/` và `hreflang` trỏ tới `/vi/404/`, `/en/404/`, hai trang không tồn tại.
- **`og:locale` là `vi`/`en`.** Starlight đặt bằng mã ngôn ngữ trần. Open Graph cần dạng `vi_VN`/`en_US`.
- **Không có `og:image`.** `twitter:card` đã là `summary_large_image` (Starlight đặt sẵn) nhưng chưa có ảnh nào.
- **`site` viết cứng** trong `astro.config.ts`.
- **Skip link của trang chủ trỏ vào khoảng không.** Starlight trỏ skip link tới `#_top`. Trang chủ dùng nhánh `hero` nên không render `h1#_top`. `h1` của trang chủ có `id="home-title"`. Đây là nguyên nhân rule `region` ở trang chủ.
- **Expressive Code tự gắn `role="region"`.** Script của EC gắn `tabindex="0"` và `role="region"` (không có nhãn) cho `pre` tràn ngang, theo dõi bằng `ResizeObserver`. Hệ quả là lỗi `landmark-unique`. Cách làm này cũng là mẫu cho mục 3.6.1.
- **KaTeX MathML trong Chrome mất chữ đậm.** Với `output: 'mathml'`, KaTeX 0.16.47 xuất `\mathbf{w}` thành `<mi mathvariant="bold">w</mi>`, và `\mathcal{L}` thành `mathvariant="script"`. MathML Core chỉ còn giữ `mathvariant="normal"`, Chromium không vẽ các giá trị khác. Trong Chrome, vectơ $\mathbf{w}$ sẽ hiện giống vô hướng $w$, ngược quy ước ký hiệu của site. Xem mục 3.5.3.
- **Weight 600 dùng ở nhiều nơi:** quiz, PythonRunner, VIZ, hình tĩnh (`.atlas-fig-math-bold`), `strong`. `figures.css` còn dựa vào việc Barlow 400 italic đã được nạp.

## 3. Phương án đã chọn

### 3.1. (a) Trang Giới thiệu

**File:** `src/content/docs/vi/about.mdx` và `src/content/docs/en/about.mdx`, template mặc định `doc`. Theo quyết định 34, hai file vào cùng một commit. `roadmap-files.test.ts` đã có `about` trong `NON_LESSON_PAGES`.

**Không vào sidebar.** Đây là lựa chọn mặc định của quyết định 64. Link đặt ở chân trang mọi trang (mục 3.2) và ở `HomeFooter`. Vì trang không có trong sidebar, Starlight không sinh nút Trước/Tiếp (`getPrevNextLinks` trả `undefined` khi không tìm thấy trang). Frontmatter vẫn ghi `prev: false`, `next: false` cho rõ.

**Frontmatter (vi):**

```yaml
---
title: Giới thiệu
description: AI Atlas là gì, ai làm, cách dùng trang, và giấy phép của nội dung và mã nguồn.
prev: false
next: false
---
```

Bản en: `title: About`, mô tả tương ứng. Trang vào Pagefind và sitemap như trang thường. Không cần sửa `seo.ts`, vì `isUntranslated()` chỉ xét bài học.

**Các phần**, mỗi phần một `h2`. Chữ do `lesson-writer` viết (giọng văn của site, xưng "bạn", câu ngắn), `lesson-translator` dịch:

1. **AI Atlas là gì.** Wiki song ngữ, lộ trình từ Python đến LLM, trọng tâm là lý thuyết dễ hiểu. Miễn phí, không cần tài khoản. Giai đoạn hiện tại: bài nào đã mở, bài nào "Sắp có". Không ghi số bài, vì số thay đổi theo `roadmap.ts`.
2. **Ai làm AI Atlas.** Tên GitHub "Luffyreals". Dự án cá nhân của một người tự học AI. Mục tiêu là sắp lại những gì mình học thành một tấm bản đồ. MVP không có kênh liên hệ. Không link tới hồ sơ GitHub (phiên chính tự chọn, dễ đổi). Không nhắc việc dùng công cụ AI khi soạn bài (người dùng chọn, quyết định 65).
3. **Cách dùng trang.** Mỗi ý một `h3` ngắn:
   - **Lộ trình:** bản đồ ở trang chủ, mục "Cần biết trước" ở đầu mỗi bài. Link tới `/vi/`, không thêm `#map`, vì `starlight-links-validator` không biết các id do component sinh ra.
   - **Chạy code Python ngay trên trang:** chỉ khi bấm "Chạy", trình duyệt mới tải Python khoảng 10 MB từ jsDelivr. Có phím tắt Ctrl+Enter. Có thể sửa code rồi khôi phục bản gốc. Bài LLM dùng khối "Chạy trên máy bạn": code không chạy trên trang, khóa API đọc từ biến môi trường.
   - **Kiểm tra nhanh:** quiz cuối bài, chấm ngay, không lưu điểm.
   - **Đánh dấu đã học:** lưu trong `localStorage` của trình duyệt, không gửi đi đâu. Xóa dữ liệu trình duyệt thì mất. Dấu ✓ hiện trên bản đồ.
   - **Đổi ngôn ngữ, sáng/tối:** hai ô chọn ở đầu trang. Bài chưa dịch thì trang tiếng Anh hiện bản tiếng Việt kèm thông báo.
   - **Quyền riêng tư** (một đoạn, không cần `h3` riêng): không tài khoản, không cookie theo dõi, hiện chưa có công cụ thống kê truy cập.
4. **Giấy phép.** Theo `docs/LICENSE-CONTENT.md`, nhưng **không link tới file trong repo**, vì repo là private:
   - Nội dung (bài viết, hình minh họa tự vẽ): CC BY-NC-SA 4.0. Link `CC_LICENCE_URL[locale]` (cùng URL chuẩn cho vi và en, quyết định 66), có `rel="license"`. Tóm tắt ba điều kiện BY, NC, SA trong 3 gạch đầu dòng.
   - Code (mã nguồn website, code ví dụ trong bài): MIT, "Copyright (c) 2026 Luffyreals". Link tới `https://opensource.org/license/mit`.
   - Không thuộc hai giấy phép trên: ảnh và tài liệu bên ngoài, theo giấy phép ghi tại chỗ (trỏ xuống phần "Nguồn ảnh").
5. **Nguồn ảnh.** Danh sách ảnh trang chủ, sinh từ `src/data/home-pictures.ts` qua component mới `PictureCredits`, dùng chung với `HomeFooter`. Ghi rõ ảnh của David Rumsey Map Collection theo CC BY-NC-SA 3.0, không theo giấy phép của site.
6. **Phần mềm** (tùy chọn, một câu): Astro, Starlight, KaTeX, Pyodide, Pagefind, font Barlow (SIL OFL), mỗi tên một link trang chính thức.

**Không có trong trang:** form liên hệ, email, mạng xã hội, số bài cụ thể, ngày cập nhật.

### 3.2. (b) Chân trang

**Cách làm:** ghi đè component `Footer` của Starlight bằng `src/components/starlight/Footer.astro`.

- Bên trong render lại `<Default />` (Footer gốc). Phần sửa trang (EditLink), ngày cập nhật (LastUpdated), nút Trước/Tiếp (Pagination) và kudos giữ nguyên.
- Sau đó thêm một khối ghi chú, chỉ khi trang không phải trang chủ.
- Starlight render `Footer` bên trong `<main>`, ở cả nhánh `hero` lẫn nhánh thường, và cả trên 404 (`StarlightPage`). Một override phủ được mọi trang.

| Trang | Ghi chú dưới Footer gốc |
|---|---|
| Bài học, About, `dev/` | Một dòng theo ngôn ngữ giao diện (`route.lang`) |
| Trang fallback (`/en/<bài chưa dịch>/`) | Dòng tiếng Anh, có `lang="en"`. `<main>` của trang này có `lang="vi"`, nên phải ghi `lang` trên khối ghi chú, nếu không trình đọc màn hình sẽ đọc chữ Anh bằng giọng Việt |
| 404 (`route.id === '404'`) | Hai dòng: vi rồi en (`lang="en"`), giống thân trang 404 |
| Trang chủ (`entry.data.hero`) | Không có. `HomeFooter` đã có dòng giấy phép. Thêm link "Giới thiệu" vào danh sách link của `HomeFooter` |

**Nội dung một dòng** (vi): "Nội dung theo giấy phép **CC BY-NC-SA 4.0**. Mã nguồn theo giấy phép MIT." và link "**Giới thiệu**" ở cuối dòng.

- "CC BY-NC-SA 4.0" là link `CC_LICENCE_URL[locale]` (đã có trong `src/data/home.ts`, cùng URL chuẩn cho vi và en, quyết định 66), có `rel="license"`.
- "Giới thiệu" là link `/<locale>/about/`.
- MIT không có link, vì repo private. Trang Giới thiệu giải thích thêm.

**Hình thức** (đọc `SKILL.md` của `design-taste-frontend`; quy ước dự án được ưu tiên):

- Không kẻ đường mảnh, không viền, không bóng. Tách khỏi phần trên bằng khoảng trống (`margin-top: 2rem`). Footer gốc của Starlight đã có viền của nút Trước/Tiếp, nên không thêm đường kẻ nào nữa.
- `font-size: var(--sl-text-sm)`.
- Màu chữ `var(--sl-color-gray-3)`: đạt AA ở cả hai chế độ (sáng: `#5b4f3f` trên `#f2eee6`; tối: `#ada392` trên `#2b2216`). Không dùng `gray-4` (homepage.md: chỉ 3,72:1 ở chế độ sáng).
- Link màu `var(--sl-color-text-accent)`, gạch chân.
- `display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem 1.5rem`. Ở 375px, "Giới thiệu" xuống dòng riêng, không cuộn ngang.
- Link nằm trong câu nên được miễn yêu cầu vùng chạm 24px (WCAG 2.5.8). Link "Giới thiệu" đứng riêng thì có `padding-block` để vùng chạm cao ít nhất 24px.
- Sau khi làm, chạy `lint.mjs` của skill trên file mới.

**Chuỗi i18n:** namespace mới `footer` trong `UI_KEYS` (`src/i18n/ui.ts`), có trong cả `vi.json` và `en.json`:

| Key | vi | en |
|---|---|---|
| `atlas.footer.contentLicence` | Nội dung theo giấy phép | Content licensed under |
| `atlas.footer.codeLicence` | Mã nguồn theo giấy phép MIT. | Code under the MIT license. |
| `atlas.footer.about` | Giới thiệu | About |

Tên "CC BY-NC-SA 4.0" giống nhau ở mọi ngôn ngữ, nên là hằng `CC_LICENCE_NAME` trong `src/data/home.ts`, cạnh `CC_LICENCE_URL`. Link Giới thiệu của trang chủ: `HOME.footer.linkAbout` (vi "Giới thiệu", en "About") trong `src/data/home.ts`, cùng chỗ với các link khác của `HomeFooter`.

### 3.3. (c) SEO

#### 3.3.1. `site`: một nguồn duy nhất

```ts
// astro.config.ts
import { resolveSite } from './src/lib/site';
export default defineConfig({ site: resolveSite(process.env.SITE_URL), /* … */ });
```

- `src/lib/site.ts` là hàm thuần, chỉ dùng import tương đối (ràng buộc của file mà `astro.config.ts` nạp, README.md mục 3.3).
- Hàm cắt khoảng trắng và dấu `/` cuối.
- Hàm báo lỗi (build dừng) khi giá trị không phải URL tuyệt đối `https:`, có đường dẫn khác `/`, có query hoặc hash. `http://localhost` và `http://127.0.0.1` được phép, để thử trên máy.
- Biến rỗng hoặc không có: trả `DEFAULT_SITE = 'https://ai-atlas.pages.dev'`.
- Mọi nơi khác lấy `site` từ Astro: `context.site` trong route middleware và endpoint, `Astro.site` trong component. Không file nào được viết lại URL này.
- `process.env` đọc biến môi trường thật lúc build (Cloudflare Pages, CI). Astro không nạp file `.env` vào `process.env` của file cấu hình. Dự án không cần `.env` cho việc này.

#### 3.3.2. Thẻ chia sẻ: thêm vào route middleware

Starlight không có tùy chọn `og:image` theo ngôn ngữ. Tùy chọn `head` toàn cục chỉ cho một giá trị. Vì vậy, thêm vào `src/routeData.ts` (đang chạy `fallbackSeoHead`) hai bước nữa, viết thành hàm thuần trong `src/lib/seo.ts` để unit test:

```ts
// src/routeData.ts
export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  route.head = fallbackSeoHead(route.head, route);
  route.head = socialHead(route.head, { site: context.site!, lang: contentLang(route), isHome: Boolean(route.entry.data.hero) });
  route.head = notFoundHead(route.head, route);
  route.entry = fallbackSearchEntry(route.entry, route);
});
```

Hành vi của `socialHead`:

- `og:locale` đổi thành `OG_LOCALE[lang]`: `vi_VN` hoặc `en_US`. `lang` là **ngôn ngữ nội dung** (`route.entryMeta.lang`): trang fallback `/en/…` hiện chữ Việt nên là `vi_VN`.
- Thêm `og:locale:alternate` cho mỗi ngôn ngữ còn `<link rel="alternate" hreflang>` trong head (đọc sau `fallbackSeoHead`). Nhờ vậy, bài chưa dịch không quảng cáo bản en.
- Thêm `og:image` (URL tuyệt đối `new URL(OG_IMAGE.path[lang], site)`), `og:image:type` (`image/png`), `og:image:width` (1200), `og:image:height` (630), `og:image:alt`.
- Thêm `twitter:image` (cùng URL) và `twitter:image:alt`. `twitter:card` giữ `summary_large_image` của Starlight.
- Trang có `og:image` riêng trong frontmatter `head` thì giữ nguyên. Đây là chỗ để thêm ảnh riêng cho từng bài sau này.
- Trang chủ (`isHome`): `og:type` đổi từ `article` thành `website`.

Hành vi của `notFoundHead`, chỉ khi `route.id === '404'`:

- Thêm `<meta name="robots" content="noindex">`.
- Bỏ `link rel="canonical"`, `og:url` và mọi `link rel="alternate" hreflang`.

**Trả lời "404 có cần `noindex` không":** Cloudflare Pages trả `dist/404.html` với mã 404 cho đường dẫn không tồn tại, nên máy tìm kiếm vốn không lập chỉ mục trang này. Nhưng `/404.html` (hoặc `/404/`) mở trực tiếp thì trả 200. Hơn nữa, canonical và `hreflang` hiện trỏ tới trang không có. Thêm `noindex` và bỏ các link đó tốn ít công, và gỡ được tín hiệu sai. 404 vốn đã ngoài sitemap (`@astrojs/sitemap` bỏ trang 404).

**Dữ liệu ảnh:** `src/data/og.ts` (mới) là một nguồn cho cả middleware lẫn script tạo ảnh.

```ts
// src/data/og.ts — no runtime imports: scripts/make-og-images.mjs loads this file through Node's type stripping.
import type { Localized } from './roadmap';

export const OG_IMAGE = {
  width: 1200,
  height: 630,
  type: 'image/png',
  /** Rename the file (…-v2.png) when the picture changes: social sites cache by URL. */
  path: { vi: '/og/ai-atlas-vi.png', en: '/og/ai-atlas-en.png' } satisfies Localized,
  alt: {
    vi: 'AI Atlas: Học AI theo một tấm bản đồ. Lộ trình song ngữ Việt – Anh, miễn phí.',
    en: 'AI Atlas: Learn AI from a single map. A free Vietnamese–English route.',
  } satisfies Localized,
} as const;

/** Words on the card. tagline must equal HOME.hero.title (og.test.ts). */
export const OG_CARD = {
  tagline: { vi: 'Học AI theo một tấm bản đồ', en: 'Learn AI from a single map' } satisfies Localized,
  subline: { vi: 'Song ngữ Việt – Anh · Miễn phí', en: 'Vietnamese and English · Free' } satisfies Localized,
} as const;

export const OG_LOCALE = { vi: 'vi_VN', en: 'en_US' } as const;
```

Chữ của ảnh là nội dung, không phải chữ giao diện, nên nằm trong `src/data/` (như `home.ts`), không nằm trong `src/content/i18n/`.

#### 3.3.3. Ảnh Open Graph: tạo bằng Playwright có sẵn

**Phương án chọn:** script `scripts/make-og-images.mjs`, chạy tay bằng `npm run og:images`. Script dựng một trang HTML tĩnh, dùng Chromium của Playwright chụp ở 1200×630 (`deviceScaleFactor: 1`), rồi ghi `public/og/ai-atlas-vi.png` và `public/og/ai-atlas-en.png`. PNG được commit vào repo. Build và CI không chạy script này.

| Phương án | Ưu | Nhược |
|---|---|---|
| **Script + Playwright (chọn)** | Không thêm gói (Playwright 1.64.1 đã có). Dùng đúng font Barlow trong `node_modules/@fontsource/*`. Chữ lấy từ `og.ts` | Phải nhớ chạy lại khi đổi khẩu hiệu hay logo. `og.test.ts` nhắc khi `HOME.hero.title` đổi |
| Trang Astro ẩn (`/dev/og/…`) rồi chụp từ bản preview | Dùng thẳng CSS của site | Thêm một route được deploy. Phải build trước khi chụp |
| Sinh lúc build (`satori`, `@vercel/og`) | Tự cập nhật | Thêm gói npm và thời gian build. Trái nguyên tắc ít phụ thuộc |

**Script làm gì:**

1. `import { chromium } from '@playwright/test'`. Import `OG_CARD`, `OG_IMAGE` từ `../src/data/og.ts` (Node 24.15 bỏ kiểu TypeScript sẵn, không cần gói).
2. Đọc `src/assets/logo-light.svg` (nét walnut, ba điểm rẽ màu nâu) để đặt trên nền tan.
3. Ghi một file HTML tạm vào `os.tmpdir()`. `@font-face` trỏ `file://` tới:
   - `node_modules/@fontsource/barlow-condensed/files/barlow-condensed-{latin,latin-ext,vietnamese}-700-normal.woff2`
   - `node_modules/@fontsource/barlow/files/barlow-{…}-400-normal.woff2`
   - kèm `unicode-range` chép từ CSS của fontsource.
4. `page.goto(file://…)`, chờ `document.fonts.ready`. Kiểm `document.fonts.check('700 100px "Barlow Condensed"')` và `document.fonts.check('400 40px Barlow')`. Font chưa nạp thì **báo lỗi và dừng**, để không ra ảnh dùng font dự phòng.
5. `page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } })`. Kiểm kích thước và dung lượng (< 300 KB).

**Bố cục ảnh** (theo luật của skill: màu phẳng, không gradient, không bóng, không kẻ mảnh, không eyebrow, tối đa hai họ chữ):

```
1200 × 630
┌───────────────────────────────────────────┬──────────────────┐
│ nền --atlas-ground #2b2216                │ nền --atlas-field│
│                                           │ #c4a98f          │
│                                           │                  │
│  AI Atlas          Barlow Condensed 700,  │   logo (route    │
│                    ~168px, #e4e2da        │   mark) ~300px   │
│  Học AI theo một tấm bản đồ               │   nét #2b2216,   │
│                    Barlow 400, ~52px      │   rẽ #6e4f32     │
│  Song ngữ Việt – Anh · Miễn phí           │                  │
│                    Barlow 400, ~30px,     │                  │
│                    #b9ae9c                │                  │
└───────────────────────────────────────────┴──────────────────┘
  x 80 … 760, căn lề trái, khối chữ đặt ở 2/3 dưới       x 820 … 1200
```

- Mã màu chép từ `src/styles/custom.css`, mỗi màu ghi tên token trong comment (`--atlas-ground`, `--atlas-ground-ink`, `--atlas-ground-muted`, `--atlas-field`, logo sáng). Đây là ảnh tĩnh, không theo sáng/tối.
- Mọi chữ nằm trong vùng an toàn x 80–1120, y 64–566. Khẩu hiệu tối đa 2 dòng (`max-width: 640px`).
- Nếu hợp mắt, có thể thêm dải sọc của `Stripe.astro` ở mép trên của nền tối, giống thẻ bìa ở hero. Developer tự quyết khi làm.

#### 3.3.4. `robots.txt` sinh lúc build

```ts
// src/pages/robots.txt.ts — static endpoint, built to dist/robots.txt
import type { APIRoute } from 'astro';
import { robotsTxt } from '@lib/seo';
export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt(site!), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
```

```ts
// src/lib/seo.ts
export function robotsTxt(site: URL): string; // "User-agent: *\nAllow: /\n\nSitemap: <site>/sitemap-index.xml\n"
```

- Không `Disallow` gì. Trang `dev/`, trang fallback và 404 đã có `noindex`. Nếu chặn bằng `robots.txt`, máy tìm kiếm sẽ không đọc được thẻ `noindex` đó.
- URL sitemap ghép từ `site`, nên đổi tên miền thì tự đổi theo.

#### 3.3.5. Sitemap

`/vi/about/` và `/en/about/` tự vào sitemap, có `xhtml:link hreflang` cho cả hai. `isInSitemap()` chỉ bỏ `dev/` và bài chưa dịch. Không phải sửa gì, chỉ cần test (mục 8).

### 3.4. (d) CLS và font

#### 3.4.1. So sánh

| Phương án | CLS | Perf | Đổi giao diện | Công | Ghi chú |
|---|---|---|---|---|---|
| A. Tự viết `@font-face` với `font-display: optional` + preload | 0 (đã đo) | +4–5 (đã đo) | Lần đầu vào trên mạng chậm, cả trang có thể hiện font hệ thống. Từ trang thứ hai (font đã có trong cache) thì là Barlow | Vừa: phải tự lấy URL có hash để preload | Bỏ 4 import fontsource |
| B. Tự viết font dự phòng chỉnh số đo (`size-adjust`, `ascent-override`…) trên `local('Arial')` | Gần 0 (chưa đo) | Chưa đo | Không | Vừa: tự tính số, tự giữ cho khớp | `local('Arial')` không có trên Android. Ở đó vẫn nhảy sang Roboto không chỉnh, tức là người đọc thật trên điện thoại vẫn bị CLS |
| **C. Fonts API của Astro** (chọn) | Gần 0 với `swap`, bằng 0 với `optional` | Chưa đo. Kỳ vọng ≥ A, vì có thêm preload và CSS chặn render nhỏ đi | Không (với `swap`) | Thấp: cấu hình + override `Head` | Ổn định từ Astro 6.0.0, dự án dùng Astro 7.4.2 |
| D. Bớt kiểu chữ (bỏ 400-italic, 600) | Không tự sửa CLS | LR 91 (đã đo) | Có: chữ đậm và chữ nghiêng do trình duyệt tự giả lập, trong quiz, PythonRunner, VIZ, hình tĩnh, `strong` | Thấp | Là bước của mục 3.5, không phải cách sửa CLS |
| E. Bỏ Barlow cho chữ thân bài | 0 | LR 87, deepseek 93 (đã đo) | Có: mất nhận diện | Thấp | Không đề xuất |

**Fonts API làm được gì cho dự án này** (đã kiểm trong `node_modules/astro` 7.4.2 và `unifont` 1.0.3):

- **Font dự phòng chỉnh số đo, tự sinh.** Astro tính `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` từ số đo thật của Barlow (`@capsizecss/unpack`, `fontace` có sẵn trong Astro). Nó sinh một `@font-face` dự phòng cho mỗi font hệ thống, theo họ chữ chung cuối cùng trong `fallbacks`.
  - Với `fallbacks: ['system-ui']`, danh sách là BlinkMacSystemFont, Segoe UI, **Roboto**, Helvetica Neue, Arial. Có Roboto, nên khắc phục được điểm yếu Android của phương án B.
  - Với `sans-serif` thì chỉ có Arial.
- **Preload có chọn lọc:** `<Font preload={[{ weight: '400', style: 'normal', subset: 'vietnamese' }]} />`.
- **`@font-face` chuyển ra khỏi CSS chặn render.** `<Font>` in `<style>` vào `<head>` của từng trang. File CSS 28 KB gzip nhẹ đi khoảng 6 KB.
- **Không tải mạng lúc build.** Provider `fontProviders.npm({ remote: false })` đọc thẳng `@fontsource/barlow` và `@fontsource/barlow-condensed` đã cài, nên giữ đúng phiên bản đã ghim. Với gói `@fontsource/*`, `unifont` ánh xạ `weights` × `styles` sang các file `400.css`, `400-italic.css`, `600.css`…
- **Tương thích Starlight.** Starlight không có hướng dẫn riêng cho Fonts API. Cách nối là ghi đè component `Head`: render `<Default />` của Starlight rồi thêm `<Font>`. Starlight khuyên chỉ ghi đè `Head` khi cần, nhưng ở đây không thay gì của bản gốc.

**Phải kiểm trong spike** (nhiệm vụ M4-1, trước khi làm tiếp):

- `subsets` phải ghi rõ cả ba (`latin`, `latin-ext`, `vietnamese`). Mặc định chỉ có `latin`, và tài liệu mô tả mục này là "subset để preload", nên cần xem file nào thật sự được phát hành.
- Số `@font-face` dự phòng sinh ra với `system-ui` (dự kiến 12 kiểu × 5 font). Nếu khối `<style>` inline vượt 4 KB gzip mỗi trang thì chuyển sang `sans-serif` và chấp nhận Android không được chỉnh.
- `<Font>` có in preload `crossorigin` đúng, và file font nằm dưới `/_astro/` (có hash, để cache `immutable` ở mục 3.7).

#### 3.4.2. Đề xuất

1. Chuyển sang Fonts API (phương án C), giữ cả 4 kiểu chữ, `fallbacks: ['system-ui']`, `display: 'swap'`.
2. Preload theo **ngôn ngữ nội dung** (`entryMeta.lang`). Chỉ preload Barlow 400 thường, vì LCP là chữ thân bài:
   - Trang vi: 3 subset latin, latin-ext, vietnamese (22 + 14 + 8 KB = 44 KB).
   - Trang en: chỉ latin (22 KB).
   - Không preload Barlow Condensed 700 ở bước đầu. Nếu `h1` vẫn gây CLS thì thêm subset của trang đó.
3. Đo CLS trên LR vi, gradient-descent, llama-family, deepseek-family. Nếu cả bốn trang < 0,05 thì dừng.
4. Nếu còn trang ≥ 0,05: chuyển Barlow (chữ thân) sang `display: 'optional'`, theo câu trả lời của người dùng cho câu hỏi 1. Barlow Condensed giữ `swap`, vì tiêu đề ngắn và là nhận diện của site.

### 3.5. (e) Performance ≥ 90

Làm theo thứ tự dưới đây. Sau mỗi bước, analyst đo LR vi và en (trung vị 3 lần, trên máy rảnh), kèm ba bài tham khảo. **Dừng ngay khi cả LR vi và LR en đạt ≥ 90.** Bước 1–4 không đổi giao diện. Bước 6–7 đổi giao diện nên phải theo câu trả lời của người dùng.

| Bước | Việc | Đổi giao diện | Kỳ vọng, căn cứ |
|---|---|---|---|
| E1 | Font theo mục 3.4.2 | Không | CLS về khoảng 0 (+4–5 điểm theo số đo `optional`). CSS chặn render nhẹ đi khoảng 6 KB. Preload kéo LCP sớm hơn |
| E2 | Sửa a11y ở mục 3.6 (script vùng cuộn, alt logo, skip link) | Không | Không nhằm điểm Perf. Script khoảng 1 KB, nạp sau (module) |
| E3 | Ảnh hero trang chủ theo khung hiển thị (3.5.1) | Không | Trang chủ: Lighthouse ước bớt 401 KiB. Không tính vào mốc 90 nhưng là việc còn nợ từ quyết định 14 |
| E4 | **Đo lại.** Analyst đo đủ bảng ở mục 2.1 | | Nếu LR ≥ 90 thì xong mục e |
| E5 | Thử các cách không đổi giao diện (3.5.2), chỉ giữ cách nào tăng ≥ 3 điểm trung vị mà không tăng CLS | Không | Chưa đo |
| E6 | Bỏ Barlow 400-italic (chữ nghiêng do trình duyệt giả lập). Giữ 600 | Có, câu hỏi 2 | Chưa đo riêng. Bỏ cả italic lẫn 600 đo được LR 91 |
| E7 | KaTeX MathML (3.5.3) | Có, câu hỏi 3 | LR 92, DOM −54%, HTML −49% (mô phỏng). Rủi ro hiển thị cao |

#### 3.5.1. Ảnh hero trang chủ (E3)

**Vấn đề:** trên điện thoại, khung ảnh rộng 100vw, cao 30svh (khung ngang, khoảng 1,5:1 đến 1,9:1). Nhưng `srcset` vẫn là ảnh dọc 1400×2444 thu nhỏ, nên bản 960w nặng 244 KB mà phần lớn bị `object-fit: cover` cắt bỏ.

**Cách sửa** (`src/components/home/HomeHero.astro`, `src/data/home-pictures.ts`, ảnh mới `src/assets/home/plate-taberd-wide.jpg`; [quyết định 66](../decisions.md)): chọn ảnh theo bố cục (art direction) cho **ảnh đầu tiên**, ảnh là LCP.

- **Không cắt bằng `getImage({ position })`.** Astro 7.4.2 chuyển `position` thẳng cho sharp 0.35.5, mà sharp chỉ nhận từ khóa (`top`, `centre`, `entropy`, `attention`…), không nhận `'50% 30%'`. Với ảnh Taberd, cắt theo từ khóa đều làm hỏng ảnh: `top` để tên bản đồ bị chú thích che, `centre` cắt mất dòng chữ Hán, `attention` ra vùng Nam Bộ.
- **Ảnh cắt tạo sẵn một lần**, có commit: `plate-taberd-wide.jpg` 1400×933 (3:2), đúng vùng mà `object-position: 50% 30%` cho thấy trên ảnh gốc 1400×2444: `top = round(0.3 × (2444 − 933)) = 453`. Cùng tác phẩm, cùng dòng ghi nguồn. Tạo lại (chạy ở gốc repo, sharp có sẵn vì Astro dùng):

  ```sh
  node -e "const sharp = require('module').createRequire(process.cwd() + '/package.json')('sharp'); const src = 'src/assets/home/plate-taberd.jpg'; sharp(src).metadata().then(({ width, height }) => { const h = Math.round(width / 1.5); return sharp(src).extract({ left: 0, top: Math.round(0.3 * (height - h)), width, height: h }).jpeg({ quality: 90, mozjpeg: true }).toFile('src/assets/home/plate-taberd-wide.jpg'); })"
  ```

- `Picture` (trong `home-pictures.ts`) có trường tùy chọn `narrow?: ImageMetadata`; chỉ `HERO_PLATES[0]` có.
- Màn hẹp (dưới `64rem`): `getImage()` trên `plate.narrow`, rộng 480, 720, 960, định dạng AVIF và WebP, `quality` 60, `sizes="100vw"`. `<img>` dự phòng là JPEG của bản cắt. Bản 960w AVIF nặng 93 KB (ảnh dọc 960w: 244 KB).
- Màn rộng (từ `64rem`): giữ `srcset` dọc hiện có (cùng URL với `<Picture>` cũ, `sizes="50vw"`).
- `object-position` giữ `plate.focus`: trên ảnh cắt, `50% 30%` cho đúng vùng như trên ảnh gốc ở mọi tỉ lệ khung.
- Viết `<picture>` bằng tay, vì `<Picture>` của Astro không có thẻ `<source media>` theo bố cục: `<source media="(min-width: 64rem)" …>` cho ảnh dọc, các `<source>` còn lại cho ảnh cắt.
- `<img>` giữ `fetchpriority="high"`, `loading="eager"`, `width`/`height` của bản cắt. CSS `object-fit: cover` giữ nguyên (khung vẫn đổi theo chiều cao màn hình).
- Các ảnh sau (crossfade, chỉ màn rộng) không đổi.
- Sai lệch nhỏ giữa 3:2 và khung thật vẫn do `object-fit` xử lý. Không đổi CSS bố cục, nên không có CLS mới.

#### 3.5.2. Cách không đổi giao diện để thử ở E5

Chỉ thử khi E4 chưa đạt. Analyst đo từng cách trên bản sao `dist/` trước, rồi mới giao developer:

- `build.inlineStylesheets: 'always'`: bớt một request chặn render, đổi lại mỗi trang nặng thêm khoảng 22 KB gzip và không cache được giữa các trang. Có hại cho người đọc nhiều bài liền nhau. Chỉ giữ nếu tăng ≥ 3 điểm.
- `content-visibility: auto` + `contain-intrinsic-size: auto <h>` cho các khối lớn ở dưới màn đầu (`.expressive-code`, `.atlas-viz`, `figure.atlas-figure`). Giảm việc dựng layout cho DOM lớn. Phải đo CLS khi cuộn, và kiểm tìm trong trang, link `#` tới heading.
- Xem phần TBT (en 616 ms so với vi 215 ms) bằng trace của Lighthouse. Nếu do hydrate island thì xem lại `client:visible` của island nào nằm ngay trong màn đầu.

#### 3.5.3. KaTeX MathML (E7): rủi ro, chỉ làm sau khi người dùng đồng ý

Đổi `rehype-katex` sang `{ output: 'mathml' }` thì HTML giảm một nửa và không còn font KaTeX. Nhưng:

- **Chrome bỏ qua `mathvariant` khác `normal`** (mục 2.4). Phải thêm một bước rehype đổi `<mi mathvariant="bold|bold-italic|script|double-struck…">` sang ký tự Unicode Mathematical Alphanumeric Symbols (ví dụ `𝐰` U+1D430), kèm bảng các ngoại lệ (ℒ U+2112, ℝ U+211D…). Ký hiệu $\mathbf{w}$, $\mathbf{X}$, $\boldsymbol{\theta}$, $\mathcal{L}$ có trong mọi bài.
- **Font toán phụ thuộc máy.** Windows có Cambria Math, Apple có STIX Two Math. Android có thể thiếu font toán, nên căn, phân số và dấu mũ trông khác hẳn bản KaTeX. Self-host một font toán (Latin Modern Math, STIX Two Math) thì nặng 300–500 KB, mất phần lợi.
- **Phải đổi theo:** bỏ hoặc thay `katex.min.css` (luật `.katex { font: … KaTeX_Main }` vẫn kéo font KaTeX về), CSS mới cho `math[display="block"]` (cuộn ngang, như `.katex-display` hiện nay).
  - `rehype-katex-a11y` vẫn đọc được `<annotation>`, nhưng `aria-label` trên khối đã có MathML thật có thể bị đọc hai lần.
  - Quiz và VIZ (`renderInlineMarkup`, `output: 'htmlAndMathml'`) phải đổi cùng lúc, để công thức trong bài và trong quiz trông giống nhau.
  - `FigMath` không dùng KaTeX (là `<text>` SVG), không bị ảnh hưởng. Test e2e đang tìm `.katex-html`, `.katex-display` phải sửa.
- **Quyết định 29** đòi kiểm tra hiển thị trên Chrome, Firefox, Safari trước khi đổi. Thiết kế thêm: kiểm cả Chrome Android thật.

Đề xuất: **không đổi ở M4**, trừ khi E1–E6 vẫn chưa đạt và người dùng chọn đổi. Nếu đổi, làm spike riêng (M4-9), chụp màn hình các công thức đại diện trên 4 trình duyệt cho người dùng xem trước.

### 3.6. Sửa lỗi axe

#### 3.6.1. Vùng cuộn ngang dùng được bằng bàn phím (nghiêm trọng)

Chrome từ bản 130 và Firefox đã tự cho Tab dừng ở vùng cuộn. Axe vẫn báo lỗi, và Safari thì không tự làm.

| Cách | Ưu | Nhược |
|---|---|---|
| Rehype gắn `tabindex="0"` cho mọi `.katex-display` và bảng lúc build | Không JS | Bài mẫu có 22 công thức riêng dòng: thêm 22 điểm dừng Tab, đa số không cuộn. Phiền cho người dùng bàn phím |
| **Script nhỏ, chỉ gắn khi phần tử thật sự tràn** (chọn) | Đúng như Expressive Code đang làm cho `pre`. Chỉ phần tử tràn mới thành điểm dừng Tab | Thêm khoảng 1 KB JS. Không có JS thì quay về hành vi gốc của trình duyệt (Chrome, Firefox vẫn ổn) |

`src/scripts/scroll-regions.ts`, nạp từ override `Head` bằng `<script>` (Astro đóng gói thành module, chạy sau khi parse):

- Chọn `.sl-markdown-content .katex-display` và `.sl-markdown-content table` (Starlight cho `table` `display: block; overflow: auto`).
- Một `ResizeObserver` cho tất cả. Gom lại, chạy lúc rảnh, giống EC. Khi `scrollWidth > clientWidth + 1` thì gắn `tabindex="0"`, nếu không thì bỏ `tabindex` (chỉ bỏ cái do script gắn, đánh dấu bằng `data-atlas-scroll`).
- Tên truy cập:
  - `.katex-display` đã có `role="group"` + `aria-label` (quyết định 25).
  - `table` có vai trò bảng, tên lấy từ `<caption>` nếu có (`DatasetTable` có). Bảng Markdown không có caption thì vẫn được đọc là "bảng", không cần thêm nhãn.
- Một `MutationObserver` trên `.sl-markdown-content` để bắt phần tử thêm sau. Test công thức tràn (`lessons.spec.ts`) chèn HTML lúc chạy.
- Không thêm `role="region"`, để không sinh thêm lỗi `landmark-unique`.

#### 3.6.2. Lỗi nhỏ sửa luôn

- **`image-redundant-alt`:** đặt `logo.alt: ''` trong `astro.config.ts`. Logo thành ảnh trang trí. Tên của link về trang chủ lấy từ chữ "AI Atlas" ngay cạnh (`replacesTitle` vẫn là `false`).
- **`region` ở trang chủ:** đổi `id` của `h1` trong `HomeHero.astro` từ `home-title` thành `_top` (giá trị `PAGE_TITLE_ID` của Starlight), sửa `aria-labelledby` theo. Skip link khi đó trỏ vào đúng tiêu đề trang chủ.

#### 3.6.3. `landmark-unique` của Expressive Code (vừa)

EC gắn `role="region"` không nhãn cho `pre` tràn ngang. Có thể mở rộng script ở 3.6.1: khi thấy `.expressive-code pre[role="region"]` chưa có `aria-label`, gắn nhãn "Khối code {{n}}" (key mới `atlas.common.codeBlock`). Việc này chạy đua với script của EC (EC gắn sau `requestIdleCallback`), phải theo dõi thuộc tính `role` bằng `MutationObserver`. **Làm nếu gọn (dưới 20 dòng), không thì ghi là lỗi của thư viện.** Đây là mức vừa, không chặn mốc A11y ≥ 95.

#### 3.6.4. Không sửa

- `label-content-name-mismatch` ở nút Tìm kiếm: component `Search` của Starlight. Ghi vào bảng lỗi đã biết. Không ghi đè `Search` chỉ vì lỗi này.
- `empty-table-header`: quét lại sau 3.6.1. Nếu vẫn báo ở ô chỉ có công thức (KaTeX để `.katex-html` là `aria-hidden`, axe có thể không tính MathML là chữ) thì ghi là báo nhầm.

### 3.7. (f) Cloudflare Pages

#### 3.7.1. `public/_headers` (mới)

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Cross-Origin-Opener-Policy: same-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
```

- `/_astro/*`: mọi file ở đây có hash trong tên (JS, CSS, ảnh, font của Fonts API, worker Pyodide), nên cache vĩnh viễn được. Mặc định Cloudflare Pages trả `max-age=0, must-revalidate` kèm ETag.
- HTML, `/pagefind/*` (`pagefind.js`, `pagefind-entry.json` không có hash), `/og/*`, `sitemap*.xml`, `robots.txt`: giữ mặc định.
- **Không đặt CSP, kể cả Report-Only.**
  - Site tĩnh không có chỗ nhận báo cáo vi phạm, nên Report-Only chỉ in lỗi ra console.
  - Lỗi trong console làm rớt điểm Best Practices ("Browser errors were logged to the console").
  - CSP thật cần cho phép jsDelivr (Pyodide trong worker), `style` inline (KaTeX, `<Font>`, Starlight) và `wasm-unsafe-eval`. Để sau MVP.
- **Không đặt HSTS** ở `_headers`. `.dev` (và vì thế `*.pages.dev`) đã nằm trong danh sách HSTS preload. Khi gắn tên miền riêng thì bật HSTS ở bảng điều khiển Cloudflare của tên miền đó.
- Không đặt `Cross-Origin-Embedder-Policy`, vì sẽ chặn Pyodide tải từ jsDelivr.
- Giới hạn của Cloudflare: 100 luật, mỗi dòng 2 000 ký tự. Còn rất xa.
- `_headers` không áp dụng cho Pages Functions. Dự án không dùng Functions.

#### 3.7.2. `public/_redirects`: giữ

Giữ dòng `/  /vi/  302`. Đây là chuyển hướng HTTP thật, nhanh hơn trang meta refresh `dist/index.html` mà `redirects` của Astro sinh ra. Trang meta refresh vẫn giữ cho `npm run preview` và host khác. Dùng 302 (không phải 301), để sau này đổi được, ví dụ chọn ngôn ngữ theo trình duyệt, mà trình duyệt không nhớ mãi chuyển hướng cũ.

#### 3.7.3. Hướng dẫn kết nối (người dùng tự làm)

Bảng ở [scaffold.md](scaffold.md) mục 4.11 vẫn đúng. Bổ sung cho M4:

1. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → chọn `Luffyreals/ai-atlas`, nhánh production `main`.
2. Build command `npm run build`, output `dist`, root directory để trống.
3. Biến môi trường, đặt cho **cả Production lẫn Preview**:
   - `NODE_VERSION` = `24.15.0` (khớp `.node-version`).
   - `SITE_URL` = URL production thật, ví dụ `https://ai-atlas.pages.dev`. Nếu tên `ai-atlas` đã có người dùng, Cloudflare thêm hậu tố (`ai-atlas-xyz.pages.dev`). Khi đó **bắt buộc** đặt biến này cho đúng.
   - Bản preview dùng cùng `SITE_URL`, nên canonical của bản preview trỏ về production. Cloudflare tự gắn `X-Robots-Tag: noindex` cho URL preview. Kiểm lại bằng `curl -I` sau lần deploy đầu.
4. Sau lần deploy đầu, kiểm: `/` chuyển sang `/vi/` (302); `/khong-co/` trả 404 song ngữ; `curl -I https://…/_astro/<file>` có `immutable`; `/robots.txt` có dòng `Sitemap` đúng tên miền; dán link vào công cụ xem trước chia sẻ (Facebook Sharing Debugger, hoặc gửi thử qua Zalo/Messenger) để thấy ảnh OG.
5. **Đổi sang tên miền riêng sau này:**
   - Pages → Custom domains → thêm tên miền, theo hướng dẫn DNS.
   - Đổi `SITE_URL` sang tên miền mới (cả Production và Preview), rồi Retry deployment. Canonical, `hreflang`, sitemap, `robots.txt`, `og:image` tự đổi theo. **Không sửa code.**
   - Tùy chọn: thêm một Bulk Redirect từ `*.pages.dev` sang tên miền mới (ở bảng điều khiển, không ở `_redirects`).
   - Bật HSTS cho tên miền mới.

Đoạn hướng dẫn này cũng được chép gọn vào [README.md](README.md) mục 6, thay câu "sửa `site` thành URL thật".

## 4. Cấu trúc file

```
astro.config.ts                          # SỬA (gói 1): site, fonts, bỏ 4 import fontsource, components Head/Footer, logo.alt
package.json                             # SỬA (gói 3): script "og:images"
public/_headers                          # MỚI (gói 4)
public/_redirects                        # giữ nguyên
public/og/ai-atlas-vi.png                # MỚI (gói 3), 1200×630, do script sinh, có commit
public/og/ai-atlas-en.png                # MỚI (gói 3)
scripts/make-og-images.mjs               # MỚI (gói 3): chụp ảnh OG bằng Playwright
src/lib/site.ts                          # MỚI (gói 1): resolveSite(), DEFAULT_SITE
src/lib/seo.ts                           # SỬA (gói 3): socialHead(), notFoundHead(), robotsTxt(), contentLang()
src/routeData.ts                         # SỬA (gói 3): gọi thêm hai hàm trên
src/data/og.ts                           # MỚI (gói 3): OG_IMAGE, OG_CARD, OG_LOCALE
src/data/home.ts                         # SỬA (gói 2): HOME.footer.linkAbout, CC_LICENCE_NAME
src/pages/robots.txt.ts                  # MỚI (gói 3)
src/scripts/scroll-regions.ts            # MỚI (gói 1): tabindex cho vùng cuộn ngang
src/styles/custom.css                    # SỬA (gói 1): --sl-font, --atlas-font-display trỏ vào biến của Fonts API
src/components/starlight/Head.astro      # MỚI (gói 1): <Default /> + <Font> + script vùng cuộn
src/components/starlight/Footer.astro    # MỚI (gói 1 tạo bản rỗng; gói 2 làm đầy đủ)
src/components/PictureCredits.astro      # MỚI (gói 2): danh sách nguồn ảnh, dùng ở HomeFooter và About
src/components/home/HomeFooter.astro     # SỬA (gói 2): dùng PictureCredits, thêm link Giới thiệu
src/components/home/HomeHero.astro       # SỬA (gói 5): art direction ảnh đầu, h1 id="_top"
src/data/home-pictures.ts                # SỬA (gói 5): trường narrow của HERO_PLATES[0] (quyết định 66)
src/assets/home/plate-taberd-wide.jpg    # MỚI (gói 5): ảnh cắt 3:2, tạo một lần (mục 3.5.1)
src/i18n/ui.ts                           # SỬA (gói 2): namespace footer (và common.codeBlock nếu làm 3.6.3)
src/content/i18n/vi.json, en.json        # SỬA (gói 2)
src/content/docs/vi/about.mdx            # MỚI (gói 2)
src/content/docs/en/about.mdx            # MỚI (gói 2)
docs/architecture/README.md              # SỬA (gói 4): mục 2 (site), mục 6 (deploy); mục 8 đã có dòng launch.md
docs/architecture/homepage.md            # SỬA (gói 1): dòng font trong bảng nhận diện (Fonts API, kiểu chữ thật sự nạp)
tests/…                                  # tester, mục 8
```

## 5. Giao diện

### 5.1. `astro.config.ts` (phần thay đổi)

```ts
import { defineConfig, fontProviders } from 'astro/config';
import { resolveSite } from './src/lib/site';

// Fonts come from the installed @fontsource packages (pinned versions, no network at build time).
const fontsource = fontProviders.npm({ remote: false });
const SUBSETS = ['latin', 'latin-ext', 'vietnamese'];
const barlow = { provider: fontsource, name: 'Barlow', cssVariable: '--font-barlow', subsets: SUBSETS, fallbacks: ['system-ui'], display: 'swap' } as const;

export default defineConfig({
  site: resolveSite(process.env.SITE_URL),
  fonts: [
    { ...barlow, weights: [400, 600], styles: ['normal'] },
    { ...barlow, weights: [400], styles: ['italic'] },
    { provider: fontsource, name: 'Barlow Condensed', cssVariable: '--font-barlow-condensed', weights: [700], styles: ['normal'], subsets: SUBSETS, fallbacks: ['system-ui'], display: 'swap' },
  ],
  integrations: [
    starlight({
      logo: { light: './src/assets/logo-light.svg', dark: './src/assets/logo-dark.svg', alt: '' },
      components: {
        Hero: './src/components/starlight/Hero.astro',
        Head: './src/components/starlight/Head.astro',
        Footer: './src/components/starlight/Footer.astro',
      },
      customCss: [
        // The four @fontsource/* imports are gone: fonts load through the Fonts API (<Font> in Head.astro).
        'katex/dist/katex.min.css',
        './src/styles/custom.css',
        // … unchanged
      ],
    }),
  ],
});
```

Hai mục cùng `cssVariable` `--font-barlow` được Astro gộp lại, chỉ tải đúng các tổ hợp kiểu chữ đã liệt kê (400, 600, 400 italic; không có 600 italic).

### 5.2. `src/lib/site.ts`

```ts
export const DEFAULT_SITE = 'https://ai-atlas.pages.dev';
/** SITE_URL → origin without a trailing slash. Throws on anything that is not an https origin (http://localhost allowed). */
export function resolveSite(raw: string | undefined): string;
```

### 5.3. `src/components/starlight/Head.astro`

```astro
---
// Starlight Head override: the default head, then the Fonts API faces with a preload chosen by content language.
import Default from '@astrojs/starlight/components/Head.astro';
import { Font } from 'astro:assets';

const BODY = { weight: '400', style: 'normal' } as const;
const PRELOAD = {
  vi: [{ ...BODY, subset: 'latin' }, { ...BODY, subset: 'latin-ext' }, { ...BODY, subset: 'vietnamese' }],
  en: [{ ...BODY, subset: 'latin' }],
};
const lang = Astro.locals.starlightRoute.entryMeta.lang === 'en' ? 'en' : 'vi';
---

<Default />
<Font cssVariable="--font-barlow" preload={PRELOAD[lang]} />
<Font cssVariable="--font-barlow-condensed" />
<script>
  import '../../scripts/scroll-regions';
</script>
```

`custom.css`:

```css
:root {
  --sl-font: var(--font-barlow);
  --atlas-font-display: var(--font-barlow-condensed);
}
```

### 5.4. `src/components/starlight/Footer.astro`

```astro
---
import Default from '@astrojs/starlight/components/Footer.astro';
import { CC_LICENCE_NAME, CC_LICENCE_URL } from '@data/home';
import type { Locale } from '@data/roadmap';
import { getStrings } from '@i18n/ui';

const route = Astro.locals.starlightRoute;
const isHome = Boolean(route.entry.data.hero); // HomeFooter already carries the licence
const locales: Locale[] = route.id === '404' ? ['vi', 'en'] : [route.lang === 'en' ? 'en' : 'vi'];
---

<Default />
{
  !isHome && (
    <div class="atlas-site-note">
      {locales.map((locale) => {
        const t = getStrings(Astro.locals.t, 'footer', { lng: locale });
        return (
          <p lang={locale}>
            <span>{t.contentLicence} <a href={CC_LICENCE_URL[locale]} rel="license">{CC_LICENCE_NAME}</a>. {t.codeLicence}</span>
            <a href={`/${locale}/about/`}>{t.about}</a>
          </p>
        );
      })}
    </div>
  )
}
```

CSS trong `<style>` của component, chỉ dùng `--sl-*`/`--atlas-*` (mục 3.2).

### 5.5. `src/lib/seo.ts` (thêm)

```ts
type Head = StarlightRouteData['head'];

/** The language of the text on the page: entryMeta.lang ('vi' on a fallback page under /en/). */
export function contentLang(route: Pick<StarlightRouteData, 'entryMeta'>): Locale;

/** og:locale (vi_VN/en_US) + og:locale:alternate, og:image* and twitter:image* (absolute), og:type website on the homepage. */
export function socialHead(head: Head, options: { site: URL; lang: Locale; isHome: boolean }): Head;

/** On the 404 page only: noindex, and no canonical, og:url or hreflang (they name pages that do not exist). */
export function notFoundHead(head: Head, route: Pick<StarlightRouteData, 'id'>): Head;

export function robotsTxt(site: URL): string;
```

`seo.ts` import `../data/og` (tương đối), đúng ràng buộc của file mà `astro.config.ts` nạp.

### 5.6. `src/components/PictureCredits.astro`

```ts
interface Props { locale: Locale }
// Renders <ul> of the unique credits of ALL_PICTURES (same logic HomeFooter has today), title in lang="en".
```

`HomeFooter` bọc nó trong `<details>` như hiện nay. `about.mdx` gọi `<PictureCredits locale="vi" />` dưới `h2` "Nguồn ảnh". Component nhận `class` từ ngoài để mỗi nơi tự định màu: trang chủ dùng `--atlas-ground-*`, About dùng màu mặc định của Starlight.

### 5.7. Chuỗi i18n mới

| Key | vi | en |
|---|---|---|
| `atlas.footer.contentLicence` | Nội dung theo giấy phép | Content licensed under |
| `atlas.footer.codeLicence` | Mã nguồn theo giấy phép MIT. | Code under the MIT license. |
| `atlas.footer.about` | Giới thiệu | About |
| `atlas.common.codeBlock` (chỉ khi làm 3.6.3) | Khối code {{n}} | Code block {{n}} |

## 6. Phụ thuộc

**Không thêm gói npm nào.** Dùng các gói đã ghim:

| Gói | Phiên bản | Dùng cho |
|---|---|---|
| `astro` | 7.4.2 | Fonts API (`fonts`, `fontProviders.npm`, `<Font>`), `getImage` với `fit`/`position`, endpoint `robots.txt` |
| `@astrojs/starlight` | 0.42.6 | Override `Head`, `Footer` |
| `@fontsource/barlow`, `@fontsource/barlow-condensed` | 5.3.0 | Nguồn font cho Fonts API (provider `npm`, `remote: false`) và cho script ảnh OG. Không còn import trong `customCss` |
| `@playwright/test` | 1.64.1 (dev) | Script ảnh OG |
| Node | 24.15.0 | Script `.mjs` nạp `src/data/og.ts` bằng tính năng bỏ kiểu TypeScript có sẵn |

`deps.test.ts` không phải sửa. Nếu nó kiểm danh sách import của `customCss` thì tester cập nhật.

## 7. Các bước thực hiện

Gói 1 làm trước, một mình, vì là gói duy nhất sửa `astro.config.ts`. Sau đó gói 2–5 **không sửa chung file nào**, gọi song song được.

### M4-1. Gói 1: font, Head, Footer rỗng, `site` (`developer`)

**File:** `astro.config.ts`, `src/lib/site.ts`, `src/components/starlight/Head.astro`, `src/components/starlight/Footer.astro` (chỉ `<Default />`), `src/scripts/scroll-regions.ts`, `src/styles/custom.css`, `docs/architecture/homepage.md` (dòng font).

Làm spike Fonts API trước (mục 3.4.1, "phải kiểm"). Nếu provider `npm` không tải được đủ 400, 600, 400 italic, Condensed 700 cho 3 subset thì dùng `fontProviders.local()` trỏ tới các file `.woff2` trong `node_modules/@fontsource/*/files/`. Nếu cả hai cách đều không được thì dừng, báo lại.

**Hoàn thành khi:**

- `npm run build` 0 `[WARN]`, `npm run check` 0/0, `npm test` qua.
- `dist/_astro/*.css` không còn `@font-face` của Barlow. Mỗi trang có `<style>` chứa `@font-face` Barlow và các mặt `… fallback: …` có `size-adjust`.
- Trang vi có đúng 3 `link[rel=preload][as=font]`, trang en có 1. File font nằm dưới `/_astro/`.
- Chữ thân bài và tiêu đề hiện Barlow, Barlow Condensed (`document.fonts.check`). Chữ đậm 600 và nghiêng 400 không bị giả lập.
- Ở 375px, công thức tràn trong bài có `tabindex="0"`, công thức vừa khung thì không. Logo có `alt=""`.
- `SITE_URL=https://example.org npm run build` thì canonical và sitemap dùng `example.org`. `SITE_URL=ftp://x` thì build báo lỗi rõ ràng.
- Tự đo CLS trên LR vi bằng `PerformanceObserver` khi giả lập mạng chậm (DevTools), ghi số vào báo cáo.

### M4-2. Gói 2: chân trang và trang Giới thiệu (`developer`, `lesson-writer`, `lesson-translator`)

**File:** `src/components/starlight/Footer.astro`, `src/components/PictureCredits.astro`, `src/components/home/HomeFooter.astro`, `src/data/home.ts`, `src/i18n/ui.ts`, `src/content/i18n/vi.json`, `src/content/i18n/en.json`, `src/content/docs/vi/about.mdx`, `src/content/docs/en/about.mdx`.

Thứ tự:

1. `developer`: Footer, PictureCredits, HomeFooter, chuỗi i18n, và hai file `about.mdx` bản khung (frontmatter + các `h2` + `<PictureCredits>`).
2. `lesson-writer`: viết chữ bản vi theo mục 3.1.
3. `lesson-translator`: bản en.
4. `content-reviewer`: kiểm khớp vi/en, link, giọng văn.

**Hoàn thành khi:**

- Build 0 `[WARN]` (links validator qua).
- Chân trang hiện đúng theo bảng ở mục 3.2 trên: bài học, About, trang fallback, 404, trang chủ.
- Ở 375px, chân trang không cuộn ngang, ở cả sáng và tối.
- `lint.mjs` của skill 0 FAIL trên `Footer.astro`.
- Chữ About đủ 5 phần, không link file trong repo, không có số bài.

### M4-3. Gói 3: SEO và ảnh OG (`developer`)

**File:** `src/lib/seo.ts`, `src/routeData.ts`, `src/data/og.ts`, `src/pages/robots.txt.ts`, `scripts/make-og-images.mjs`, `public/og/ai-atlas-vi.png`, `public/og/ai-atlas-en.png`, `package.json`.

**Hoàn thành khi:**

- `npm run og:images` sinh 2 PNG 1200×630, mỗi file < 300 KB. Script dừng với lỗi nếu font chưa nạp.
- Mọi trang có `og:image` tuyệt đối theo `site`, có `og:image:width`, `height`, `alt`, `type`, `twitter:image`, `twitter:image:alt`, `og:locale` `vi_VN`/`en_US`.
- `dist/robots.txt` đúng.
- `dist/404.html` có `noindex`, không có canonical và `hreflang`.
- Ảnh được xem bằng mắt (đính ảnh vào báo cáo): đúng bố cục mục 3.3.3, chữ tiếng Việt đủ dấu.

### M4-4. Gói 4: Cloudflare và tài liệu (`developer`)

**File:** `public/_headers`, `docs/architecture/README.md` (mục 2, 6).

**Hoàn thành khi:** `dist/_headers` giống `public/_headers`. README mục 6 có hướng dẫn `SITE_URL` và đổi tên miền (mục 3.7.3).

### M4-5. Gói 5: ảnh hero và skip link trang chủ (`developer`)

**File:** `src/components/home/HomeHero.astro`, `src/data/home-pictures.ts`, `src/assets/home/plate-taberd-wide.jpg` (quyết định 66).

**Hoàn thành khi:**

- Ở 375px và 412px, ảnh hero tải về là bản cắt 3:2, rộng ≤ 960px.
- Ở 1280px, ảnh vẫn là bản dọc như cũ.
- Không có CLS mới, crossfade vẫn chạy.
- Skip link của trang chủ đưa focus tới `h1`. `inspect.mjs` của skill 0 FAIL ở 1440, 768, 390 (như homepage.md mục 5).

### M4-6. Test (`tester`)

Viết và chạy các test ở mục 8. Cập nhật test cũ nếu thay đổi làm chúng sai (ví dụ test tìm `@fontsource` hay `home-title`).

**Hoàn thành khi:** `npm test`, `npm run test:e2e` qua trên cả `desktop` và `mobile`, thời gian CI e2e mỗi shard vẫn dưới 30 phút.

### M4-7. Đo và review (`analyst`)

- Lighthouse theo tiêu chí mục 1, đủ bảng mục 2.1. Axe sáng/tối ở 412 và 1280px.
- Review code của gói 1–5.

**Hoàn thành khi:** có bảng trước/sau. LR vi và en đạt Perf ≥ 90, A11y ≥ 95, SEO ≥ 95, hoặc báo rõ còn thiếu bao nhiêu và đề xuất bước tiếp theo (E5, E6, E7).

### M4-8. Bước có điều kiện (`developer` → `tester` → `analyst`)

Chỉ làm khi M4-7 chưa đạt, theo đúng thứ tự E5 → E6 → E7 và theo câu trả lời của người dùng.

- **E5:** analyst thử trên bản sao `dist/` trước.
- **E6:** sửa mục `fonts` trong `astro.config.ts`, bỏ `styles: ['italic']`. Sửa comment trong `figures.css` dòng 153 (italic không còn được nạp). Developer chụp trước/sau một đoạn có chữ nghiêng và một hình tĩnh có `FigMath`.

### M4-9. Spike KaTeX MathML (`developer`, chỉ khi người dùng chọn)

Theo mục 3.5.3: bước rehype đổi `mathvariant` sang ký tự Unicode, đổi `renderInlineMarkup`, thay CSS KaTeX.

**Hoàn thành khi:** có ảnh chụp 20 công thức đại diện (có $\mathbf{w}$, $\boldsymbol{\theta}$, $\mathcal{L}$, $\hat{y}$, phân số, tổng, ma trận, căn) trên Chrome desktop, Firefox, Safari (hoặc WebKit của Playwright), Chrome Android, để người dùng duyệt trước khi giữ.

### M4-10. Kết thúc (`summarizer`, `team-lead`, phiên chính)

- Changelog, báo cáo tiến độ, `PLAN.md`.
- Ghi quyết định vào `docs/decisions.md`.
- Phiên chính cập nhật phần "Trạng thái hiện tại" trong `.claude/CLAUDE.md`.
- Commit, mở PR để người dùng duyệt (quyết định 64).

## 8. (g) Danh sách test cho tester

Test e2e chạy trên bản build với `site` mặc định (`https://ai-atlas.pages.dev`). Khi kiểm URL tuyệt đối thì so với giá trị này, rồi đổi origin sang `baseURL` của Playwright để tải file.

**Unit (`tests/unit/`)**

| File | Kiểm |
|---|---|
| `lib/site.test.ts` (mới) | `resolveSite`: `undefined`/rỗng → mặc định; bỏ `/` cuối; báo lỗi với `http://example.org`, `ftp:`, có đường dẫn, có query; cho phép `http://localhost:4321` |
| `lib/seo.test.ts` (thêm) | `socialHead`: `og:locale` đổi đúng; `og:locale:alternate` chỉ khi còn `hreflang` của ngôn ngữ kia; `og:image` tuyệt đối theo `site`, kèm width, height, alt, type; `twitter:image`; giữ `og:image` có sẵn từ frontmatter; `og:type` `website` chỉ ở trang chủ. `notFoundHead`: chỉ tác động khi `id === '404'`. `robotsTxt`: đúng dòng `Sitemap`. `contentLang` của trang fallback là `vi` |
| `content/og.test.ts` (mới) | Hai PNG trong `public/og/` tồn tại, đọc IHDR (24 byte đầu, không cần gói) ra 1200×630, mỗi file < 300 KB; đường dẫn trong `OG_IMAGE.path` trỏ đúng file; `OG_CARD.tagline` bằng `HOME.hero.title`; `src/data/og.ts` chỉ có `import type` |
| `content/headers.test.ts` (mới) | `public/_headers`: có `/_astro/*` với `immutable`; có `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`; **không** có `Content-Security-Policy` hay `-Report-Only`; ≤ 100 luật; mọi dòng < 2 000 ký tự. `public/_redirects` còn dòng `/  /vi/  302` |
| `content/i18n.test.ts` | Tự phủ namespace `footer` mới. Chỉ cần chạy lại |
| `content/roadmap-files.test.ts` | Đã có `about`. Chạy lại để chắc có đủ vi và en |

**E2E (`tests/e2e/`)**

1. **Trang Giới thiệu** (`about.spec.ts`, mới), cho `/vi/about/` và `/en/about/`:
   - Một `h1` đúng tiêu đề; `<title>` dạng "Giới thiệu | AI Atlas" / "About | AI Atlas"; `meta description` không rỗng; `html[lang]` đúng.
   - `hreflang` vi, en, x-default đều có; canonical đúng trang.
   - Có trong `sitemap-0.xml` kèm `xhtml:link` sang ngôn ngữ kia.
   - Không có trong sidebar; không có nút Trước/Tiếp.
   - Link giấy phép CC có `rel="license"` (URL chuẩn, quyết định 66), có link MIT, có danh sách nguồn ảnh đủ số nguồn khác nhau của `ALL_PICTURES`.
   - Không có link `github.com/Luffyreals/ai-atlas`.
   - Ở 375px, sáng và tối: không cuộn ngang, chữ đạt tương phản (helper `installContrast`).
2. **Chân trang** (`footer.spec.ts`, mới):
   - Trên `/vi/ml/linear-regression/`, `/en/ml/linear-regression/`, `/vi/about/`: đúng một `a[rel="license"]` trong `.atlas-site-note`, href đúng ngôn ngữ; link Giới thiệu tới `/<locale>/about/`; Footer gốc vẫn còn nút Trước/Tiếp trên bài học.
   - Trên một trang fallback (ví dụ `/en/ml/ml-overview/`): khối ghi chú có `lang="en"`, chữ tiếng Anh, link `/en/about/`.
   - Trên 404 (`/khong-co-trang-nay/`): hai dòng, vi và en (`lang="en"`).
   - Trên `/vi/`, `/en/`: không có `.atlas-site-note`; `HomeFooter` có link Giới thiệu; cả trang có đúng một `a[rel="license"]`.
   - Ở 375px (project `mobile`), sáng và tối: không cuộn ngang, tương phản đạt.
3. **SEO** (`seo.spec.ts`, mới, chỉ `desktop`):
   - Với trang chủ, LR, About, vi và en: `og:image` tuyệt đối, bắt đầu bằng `https://ai-atlas.pages.dev/og/`; tải về (đổi origin) được 200, `content-type: image/png`, `naturalWidth` 1200, `naturalHeight` 630; có `og:image:width`, `og:image:height`, `og:image:alt` không rỗng; `twitter:card` là `summary_large_image`; `twitter:image` bằng `og:image`; `og:locale` `vi_VN`/`en_US`.
   - Trang fallback: `og:locale` `vi_VN`, không có `og:locale:alternate` `en_US`.
   - `/robots.txt`: 200, `text/plain`, có `Sitemap: https://ai-atlas.pages.dev/sitemap-index.xml`, không có `Disallow: /`.
   - `/404.html`: có `meta[name=robots][content*=noindex]`, không có canonical, không có `hreflang`.
4. **Pyodide không tải khi mở trang, cho mọi bài có `PythonRunner`** (thêm vào `lessons-meta.spec.ts`): lặp `WITH_PAGE` có `<PythonRunner` trong nguồn (`readSource`), mở bản vi (và en nếu có file), cuộn hết trang (`scrollThrough`), kiểm không có request nào khớp `cdn.jsdelivr.net/pyodide` hay chunk worker (dùng lại `pyodideChunks()` của `components.spec.ts`, chuyển sang `helpers.ts`).
5. **Bấm Chạy bằng phím** (trên `/vi/ml/linear-regression/`, chặn `**/pyodide/**` như test (b) của `components.spec.ts`): Tab tới nút "Chạy" đầu tiên, nhấn Enter thì trạng thái chuyển sang "Đang tải Python…" rồi tới thông báo `runner.loadFailed`. Lặp lại với Space. Trong ô code ở chế độ sửa, Ctrl+Enter cũng chạy.
6. **Vùng cuộn có `tabindex`** (thêm vào `lessons.spec.ts`, project `mobile`):
   - Với mọi bài, mọi `.sl-markdown-content .katex-display` và `table`: tràn (`scrollWidth > clientWidth + 1`) thì có `tabindex="0"`; không tràn thì không có `tabindex`.
   - Một công thức tràn: Tab tới được, phím ArrowRight làm `scrollLeft` tăng.
   - Test công thức tràn chèn lúc chạy (fixture hiện có) cũng phải có `tabindex="0"` (kiểm `MutationObserver`).
7. **Font** (thêm vào `smoke.spec.ts` hoặc spec mới):
   - Trang vi có 3, trang en có 1 `link[rel=preload][as=font][crossorigin]`, `href` bắt đầu bằng `/_astro/`.
   - Sau `document.fonts.ready`: `document.fonts.check('16px Barlow')`, `check('600 16px Barlow')`, `check('italic 16px Barlow')`, `check('700 32px "Barlow Condensed"')` đều `true` (nếu làm E6 thì bỏ dòng italic).
   - Font của `p` đầu tiên trong bài bắt đầu bằng "Barlow".
   - Có `@font-face` với `size-adjust` trong `<style>` của `<head>`.
   - Không còn request nào tới file có `@fontsource` trong URL.
8. **Trang chủ:**
   - Ở 375px, `currentSrc` của ảnh hero đầu: tỉ lệ `naturalWidth/naturalHeight` khoảng 1,5 (± 0,05) và `naturalWidth` ≤ 960. Ở 1280px vẫn là ảnh dọc.
   - Skip link trỏ `#_top`, và `#_top` là `h1` của trang chủ. Nhấn Tab rồi Enter thì focus nằm trên `h1`.
9. **Logo:** `header img` có `alt=""`, link về trang chủ có tên "AI Atlas".
10. **Nếu làm E7 (MathML):** mọi bài có `.katex math`, không còn `.katex-html`; `mi[mathvariant]` chỉ còn `normal`; công thức chứa `\mathbf` render ra ký tự trong khoảng U+1D400–U+1D7FF; `aria-label` của khối riêng dòng vẫn đúng. Không có request tới font KaTeX.

**Kiểm bằng tay (analyst):** Lighthouse theo mục 1; axe ở sáng/tối, 412 và 1280px; xem ảnh OG bằng Facebook Sharing Debugger sau khi deploy (người dùng làm, vì cần URL công khai).

## 9. Rủi ro và điểm chưa chắc

### 9.1. Rủi ro

| Rủi ro | Ảnh hưởng | Cách giảm |
|---|---|---|
| Provider `npm` của Fonts API không đọc được đủ kiểu chữ hay subset từ `@fontsource` | Thiếu chữ tiếng Việt hoặc chữ đậm | Spike ở M4-1. Dự phòng: `fontProviders.local()` trỏ tới file `.woff2` |
| Mặt dự phòng với `system-ui` sinh quá nhiều `@font-face` inline | HTML mỗi trang nặng thêm | Ngưỡng 4 KB gzip, vượt thì dùng `sans-serif` |
| `swap` + font dự phòng chỉnh số đo vẫn còn CLS ≥ 0,05 (độ rộng trung bình không khớp từng dòng) | Chưa đạt mục d | Bước 4 của mục 3.4.2: `optional` (câu hỏi 1) |
| Số đo dao động mạnh khi máy bận | Không biết bước nào có ích | Đo trên máy rảnh, trung vị 3 lần, cùng một phiên |
| LR vẫn < 90 sau E1–E5 | Phải đổi giao diện (E6, E7) | Câu hỏi 2, 3. Người dùng có thể chấp nhận mốc thấp hơn |
| Ảnh OG cũ vẫn hiện trên mạng xã hội sau khi đổi | Ảnh lỗi thời | Đổi tên file (`-v2`) mỗi khi đổi ảnh |
| Ảnh OG bị cắt vuông ở một số ứng dụng chat | Mất một phần chữ | Chữ trong vùng an toàn. Chấp nhận |
| `SITE_URL` đặt sai trên Cloudflare | Canonical, sitemap sai tên miền | `resolveSite` báo lỗi khi sai định dạng. Danh sách kiểm sau deploy ở mục 3.7.3 |
| Node bỏ hoặc đổi tính năng bỏ kiểu TypeScript | Script ảnh OG lỗi | Chỉ ảnh hưởng script chạy tay. Đổi `og.ts` sang JSON nếu cần |

### 9.2. Câu hỏi cho người dùng (đã trả lời ngày 30/10/2026, quyết định 65)

1. **Font chữ thân bài khi mạng chậm:** thử `swap` + font dự phòng chỉnh số đo trước; chỉ chuyển Barlow chữ thân sang `optional` khi CLS còn ≥ 0,05.
2. **Bớt kiểu chữ:** chỉ khi các bước không đổi giao diện (E1–E5) chưa đưa LR lên 90 thì bỏ 400-italic; luôn giữ 600.
3. **KaTeX sang MathML:** giữ KaTeX HTML ở M4. Chỉ làm spike MathML nếu sau khi bỏ italic vẫn chưa đạt 90, và người dùng duyệt ảnh chụp 4 trình duyệt trước khi giữ.
4. **Trang Giới thiệu không nhắc việc dùng công cụ AI khi soạn bài.**

**Architect tự chọn trong thiết kế này** (không chặn việc, dễ đổi; phiên chính xác nhận rồi ghi vào `docs/decisions.md`, người dùng duyệt trên PR):

- About không có link hồ sơ GitHub.
- Ảnh OG dùng chữ "Học AI theo một tấm bản đồ" (giống tiêu đề hero) và "Song ngữ Việt – Anh · Miễn phí".
- Không đặt CSP, kể cả Report-Only.
- 404 thêm `noindex`.
- `_redirects` giữ 302.
