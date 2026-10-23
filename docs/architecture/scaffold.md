# Thiết kế bộ khung (scaffold): mốc M0

> Phạm vi: mốc **M0. Bộ khung** trong [docs/mvp.md](../mvp.md) mục 5.
> Tài liệu liên quan: [roadmap-data.md](roadmap-data.md) (dữ liệu lộ trình), [components.md](components.md) (component mốc M1).
>
> **Đã chạy thử (spike) ngày 2026-10-22** trong một thư mục tạm, với đúng các phiên bản ở mục 5. Những chỗ ghi "đã kiểm chứng" là kết quả build/check thật, không phải suy đoán.

## 1. Mục tiêu và phạm vi

### M0 làm

- Khởi tạo Astro + Starlight trong `ai-atlas/` **mà không ghi đè file có sẵn**.
- Song ngữ: `vi` (mặc định) và `en`, URL `/vi/...` và `/en/...`. Trang gốc `/` chuyển sang `/vi/`.
- KaTeX (remark-math + rehype-katex), React integration, alias đường dẫn trong `tsconfig.json`.
- Hệ thống chuỗi giao diện song ngữ cho component tự viết (mở rộng schema i18n của Starlight).
- `src/data/roadmap.ts` đủ 78 bài, tất cả ở trạng thái `planned` (chi tiết: [roadmap-data.md](roadmap-data.md)).
- Sidebar sinh từ `roadmap.ts`: chỉ hiện bài đã có trang.
- Trang chủ tạm (vi/en), trang 404 song ngữ, một trang dev ẩn để thử KaTeX.
- Kiểm tra link nội bộ lúc build (`starlight-links-validator`).
- Vitest + Playwright, kèm các test M0.
- Cấu hình cho Cloudflare Pages (`.node-version`, `public/_redirects`) và hướng dẫn kết nối.

### M0 không làm

- Không viết bài học. Không làm component M1 (`Prerequisites`, `Quiz`, `LessonProgress`, `PythonRunner`, `RoadmapMap`). Xem [components.md](components.md).
- Không thiết kế giao diện chi tiết. **Trang chủ và các component sẽ được thiết kế bằng skill `design-taste-frontend` (`.agents/skills/design-taste-frontend/SKILL.md`) sau khi M0 xong.** M0 chỉ dùng giao diện mặc định của Starlight, cộng vài biến CSS tối thiểu.
- Không gắn tên miền riêng (M4). Không SEO nâng cao (M4).
- Không đụng vào git: không commit, không đổi `.gitignore` ngoài việc **thêm dòng** (mục 3.4).

## 2. Phương án đã chọn

### 2.1. Khởi tạo: tự viết file, không dùng `npm create astro`

`ai-atlas/` đã có `CLAUDE.md`, `PLAN.md`, `README*.md`, `CHANGELOG.md`, `docs/`, `.claude/`, `.agents/`, `.gitignore`, `skills-lock.json`. `npm create astro` đòi thư mục trống hoặc sẽ ghi đè `README.md`, `.gitignore`.

| Phương án | Ưu | Nhược |
|---|---|---|
| A. `npm create astro` vào thư mục tạm rồi chép sang | Có đúng template chính thức | Phải lọc file, dễ chép nhầm `README.md`, `.gitignore`; template có file mẫu thừa |
| **B. Tự viết các file cấu hình theo tài liệu này rồi `npm install` (chọn)** | Kiểm soát từng file, không ghi đè gì; cấu hình đã kiểm chứng trong spike | Phải gõ tay khoảng 20 file nhỏ |

Chọn **B**. Bộ file Astro + Starlight rất nhỏ (package.json, astro.config, tsconfig, content.config, vài trang). Mọi nội dung cần thiết đã ở mục 4.

### 2.2. Markdown: dùng processor `unified()` thay cho Sätteri

**Điểm mới quan trọng của Astro 7:** processor Markdown mặc định là **Sätteri** (viết bằng Rust). Sätteri **không chạy plugin remark/rehype**. Nếu cứ thêm `remark-math`/`rehype-katex` theo cách cũ thì build vẫn thành công nhưng công thức không hiện.

| Phương án | Ưu | Nhược |
|---|---|---|
| **A. `unified()` từ `@astrojs/markdown-remark` + `remark-math` + `rehype-katex` (chọn)** | Cách chính thức Astro ghi trong docs; hệ sinh thái remark/rehype trưởng thành; Starlight hỗ trợ đầy đủ (asides, heading anchor) với unified. **Đã kiểm chứng:** công thức inline và display render ra `.katex` + MathML, `:::note` vẫn chạy | Build chậm hơn Sätteri một chút (không đáng kể với 78 bài) |
| B. Sätteri + `features.math` + gói cộng đồng `satteri-katex` (0.1.1) | Nhanh hơn | Gói của một tác giả, mới ra; có lỗi đã biết (math display bị highlighter "ăn" nếu đặt plugin sai chỗ) |
| C. Sätteri + tự viết plugin KaTeX | Không phụ thuộc gói lạ | Tự bảo trì plugin, trái nguyên tắc "ít tự viết" |

Chọn **A**. Có thể chuyển sang Sätteri sau khi hệ sinh thái ổn định.

### 2.3. Định tuyến song ngữ

- Starlight `locales: { vi, en }`, `defaultLocale: 'vi'`, **không dùng root locale**. Bài nằm ở `src/content/docs/vi/...` và `src/content/docs/en/...`, URL `/vi/...`, `/en/...`.
- Trang gốc `/`: hai lớp, cả hai đã kiểm chứng hoặc có trong docs chính thức:
  1. Astro `redirects: { '/': '/vi/' }` → build sinh `dist/index.html` dạng meta refresh + `rel="canonical"` + `noindex`. Dùng được khi chạy `npm run preview` và mọi host tĩnh.
  2. `public/_redirects` với dòng `/  /vi/  302` → trên Cloudflare Pages là chuyển hướng HTTP thật. Cloudflare ghi rõ: rule trong `_redirects` luôn được áp dụng trước file tĩnh trùng đường dẫn.
  - Dùng **302** (không phải 301) để sau này còn đổi được, ví dụ tự chọn ngôn ngữ theo trình duyệt.
- `trailingSlash: 'always'` (khớp `build.format: 'directory'` mặc định và cách Cloudflare Pages phục vụ `/x/index.html` tại `/x/`). Mọi link nội bộ viết dạng `/vi/ml/linear-regression/`.

### 2.4. Sidebar sinh từ `roadmap.ts`

| Phương án | Ưu | Nhược |
|---|---|---|
| A. `autogenerate` theo thư mục | Không cần code | Thứ tự phụ thuộc `sidebar.order` trong frontmatter, lặp với `roadmap.ts`; nhãn bài chưa dịch hiện tiếng Việt ở bản en |
| **B. Hàm `buildSidebar()` đọc `roadmap.ts` (chọn)** | Một nguồn sự thật cho thứ tự và tiêu đề; nhãn en luôn tiếng Anh; nút Trước/Sau của Starlight theo đúng lộ trình | Thêm một hàm nhỏ (có unit test) |

Quy tắc: chỉ đưa vào sidebar bài có `status.vi === 'published'` (có trang). Phần chưa có bài nào thì **ẩn** khỏi sidebar. Đã kiểm chứng: Starlight 0.42 hiện nhóm rỗng thành một nhóm trống, nên phải lọc; `sidebar: []` cho sidebar rỗng, không tự chuyển sang autogenerate. Ở M0 mọi bài là `planned` nên sidebar rỗng, đúng ý.

Lưu ý: Starlight từ 0.39 **bỏ** cú pháp `{ label, autogenerate }`. Nhóm phải có `items`. Đã kiểm chứng: dùng cú pháp cũ thì build lỗi.

`astro.config.ts` (TypeScript) import trực tiếp `src/lib/sidebar.ts`. Đã kiểm chứng chạy được. **Ràng buộc:** `src/lib/sidebar.ts`, `src/data/roadmap.ts` và mọi file chúng import chỉ dùng **import tương đối**, không dùng alias `@data/...` và không import module ảo `astro:*`, vì chúng chạy lúc nạp config.

### 2.5. Bài chưa dịch và bài chưa viết

- **Bài chưa dịch** (có `vi/`, chưa có `en/`): dùng fallback có sẵn của Starlight. Đã kiểm chứng: `/en/ml/linear-regression/` vẫn được build, hiện nội dung tiếng Việt kèm thông báo có sẵn "This content is not available in your language yet." `starlightRoute.isFallback === true`. Không cần tự viết gì để có trang. Từ M2 (quyết định 30), trang này có `noindex`, không vào sitemap và không được trang nào khai trong `hreflang`: xem [README.md](README.md) mục 3.1.
- **Bài chưa viết** (`status.vi === 'planned'`): **không tạo file, không có trang**. Bài vẫn có trong `roadmap.ts` để `RoadmapMap` và `Prerequisites` (M1) hiện nhãn "Sắp có" không kèm link. Test M0 bắt buộc: bài `planned` không được có file MDX; bài `published` phải có file (xem [roadmap-data.md](roadmap-data.md) mục 6).

### 2.6. Chuỗi giao diện song ngữ

| Phương án | Ưu | Nhược |
|---|---|---|
| **A. Mở rộng schema i18n của Starlight; component Astro gọi `Astro.locals.t()`; component React nhận chuỗi qua props từ một Astro wrapper (chọn)** | Một hệ thống dịch duy nhất (Starlight dùng i18next); **thiếu key ở `vi.json` hoặc `en.json` thì build lỗi** (đã kiểm chứng); không đưa từ điển xuống trình duyệt | Mỗi component React cần một file `.astro` bọc ngoài |
| B. Từ điển TypeScript riêng, React tự đọc `document.documentElement.lang` | React tự lập | Hai hệ thống dịch song song; tải cả hai ngôn ngữ xuống client; dễ lệch khi SSR |

Chọn **A**. Chi tiết ở mục 4.5.

### 2.7. Trang 404

Starlight chỉ sinh một `/404.html` theo ngôn ngữ mặc định. Đã thử ba cách trong spike:

| Cách | Kết quả |
|---|---|
| Không làm gì | Build có cảnh báo `Entry docs → 404 was not found` (vi phạm tiêu chí "build không cảnh báo") |
| `src/content/docs/404.mdx` | Cảnh báo `Could not render /404 ... conflicts with higher priority route` |
| **`disable404Route: true` + `src/pages/404.astro` dùng `<StarlightPage>` (chọn)** | Không cảnh báo, giữ header/tìm kiếm/sáng-tối của Starlight |

Trang 404 là **một trang song ngữ** (tiếng Việt trước, tiếng Anh sau), chữ lấy từ i18n bằng `t(key)` và `t(key, { lng: 'en' })` (đã kiểm chứng). Lý do không làm hai trang riêng: Astro build `src/pages/en/404.astro` thành `/en/404/index.html`, không phải `/en/404.html` nên Cloudflare không dùng nó làm trang 404 cho `/en/*`.

### 2.8. Kiểm tra link: `starlight-links-validator`

Plugin chính thức của cộng đồng Starlight (0.27.0, peer `@astrojs/starlight >=0.42.0`). Build **lỗi** khi Markdown có link nội bộ hỏng (đã kiểm chứng với `/vi/ml/nope/`). Cấu hình:

- `errorOnRelativeLinks` giữ mặc định `true`: **bắt buộc viết link tuyệt đối** `/vi/...`. Link tương đối không được kiểm tra nên dễ hỏng ngầm.
- `errorOnFallbackPages: false`: bản en được phép link tới bài en đang dùng fallback.
- `errorOnInconsistentLocale: true`: bài en link nhầm sang `/vi/...` sẽ bị báo.

Hệ quả cho nội dung: template hiện dùng link tương đối `../../math/calculus/` ở mục "Cần biết trước". Cần đổi khi chốt template ở M1/M2 (khi đó component `Prerequisites` thay thế danh sách này).

## 3. Cấu trúc file sau M0

### 3.1. Cây thư mục

```
ai-atlas/
├─ .agents/ .claude/ docs/            # CÓ SẴN, không đụng (trừ docs/architecture/ do architect)
├─ CLAUDE.md                          # CÓ SẴN, developer chỉ cập nhật mục "Trạng thái" và "Lệnh"
├─ PLAN.md README.md README.en.md CHANGELOG.md giáo án ai.md skills-lock.json   # CÓ SẴN, không đụng
├─ .gitignore                         # CÓ SẴN, chỉ THÊM dòng (mục 3.4)
├─ .node-version                      # MỚI: "24.15.0", Cloudflare đọc để chọn Node
├─ package.json                       # MỚI
├─ package-lock.json                  # MỚI (npm sinh)
├─ astro.config.ts                    # MỚI: Astro + Starlight + React + KaTeX + links validator
├─ tsconfig.json                      # MỚI: strict + alias
├─ vitest.config.ts                   # MỚI
├─ playwright.config.ts               # MỚI
├─ public/
│  ├─ _redirects                      # MỚI: "/  /vi/  302" cho Cloudflare Pages
│  └─ favicon.svg                     # MỚI: favicon tạm tự vẽ (Starlight mặc định trỏ /favicon.svg)
├─ src/
│  ├─ content.config.ts               # MỚI: collection docs + i18n (schema mở rộng)
│  ├─ content/
│  │  ├─ docs/
│  │  │  ├─ vi/index.mdx              # MỚI: trang chủ tạm tiếng Việt (template splash)
│  │  │  ├─ vi/dev/components.mdx     # MỚI: trang dev ẩn, thử KaTeX và aside; M1 thêm demo component
│  │  │  ├─ en/index.mdx              # MỚI: trang chủ tạm tiếng Anh
│  │  │  └─ en/dev/components.mdx     # MỚI: bản en của trang dev
│  │  └─ i18n/
│  │     ├─ vi.json                   # MỚI: chuỗi giao diện tự định nghĩa (key "atlas.*")
│  │     └─ en.json                   # MỚI
│  ├─ i18n/
│  │  └─ ui.ts                        # MỚI: danh sách key UI (nguồn sự thật), kiểu, getStrings()
│  ├─ data/
│  │  └─ roadmap.ts                   # MỚI: 7 phần, 78 bài (roadmap-data.md)
│  ├─ lib/
│  │  ├─ roadmap.ts                   # MỚI: hàm tiện ích + validateRoadmap() (roadmap-data.md)
│  │  └─ sidebar.ts                   # MỚI: buildSidebar() từ roadmap
│  ├─ pages/
│  │  └─ 404.astro                    # MỚI: 404 song ngữ dùng <StarlightPage>
│  ├─ components/                     # MỚI: thư mục rỗng (giữ bằng .gitkeep), component ở M1
│  └─ styles/
│     └─ custom.css                   # MỚI: vài biến --sl-color-* tối thiểu, không thiết kế chi tiết
└─ tests/
   ├─ unit/
   │  ├─ roadmap.test.ts              # MỚI: validateRoadmap, số bài, slug, vòng lặp
   │  ├─ roadmap-files.test.ts        # MỚI: trạng thái khớp file thật vi/en, title khớp
   │  ├─ sidebar.test.ts              # MỚI: buildSidebar
   │  ├─ i18n.test.ts                 # MỚI: vi.json và en.json cùng bộ key, khớp ui.ts
   │  └─ deps.test.ts                 # MỚI: phiên bản ghim chính xác, katex 0.16.x
   └─ e2e/
      └─ smoke.spec.ts                # MỚI: /, /vi/, /en/, 404, chuyển ngôn ngữ, 375px, KaTeX
```

Tên trang dev: `dev/components` không thuộc lộ trình. Test file khớp roadmap có danh sách ngoại lệ `NON_LESSON_PAGES = ['index', 'about', 'dev/components']` (`about` dành cho M4).

### 3.2. Vai trò các file chính

| File | Vai trò |
|---|---|
| `astro.config.ts` | Nơi duy nhất cấu hình site, locale, processor Markdown, integration, plugin Starlight |
| `src/content.config.ts` | Khai báo collection `docs` (bài) và `i18n` (chuỗi UI). Mở rộng schema i18n từ `ALL_UI_KEYS`. M1 sẽ mở rộng `docsSchema` thêm trường `quiz` |
| `src/i18n/ui.ts` | Danh sách key UI theo namespace. Thêm chuỗi mới = thêm key ở đây + `vi.json` + `en.json` |
| `src/data/roadmap.ts` | Chỉ có dữ liệu và kiểu, không có logic |
| `src/lib/roadmap.ts` | Hàm truy vấn và kiểm tra dữ liệu lộ trình (thuần, test được) |
| `src/lib/sidebar.ts` | `buildSidebar()`: biến roadmap thành cấu hình sidebar Starlight |
| `src/pages/404.astro` | Trang 404 song ngữ |
| `public/_redirects` | Chuyển `/` → `/vi/` ở mức HTTP trên Cloudflare |
| `.node-version` | Ghim Node cho Cloudflare Pages |

### 3.3. Quy ước đặt file (áp dụng từ M0 về sau)

- `src/components/`: component dùng trong MDX, tên PascalCase. React island đặt trong thư mục con cùng tên kebab-case, ví dụ `src/components/quiz/QuizIsland.tsx`.
- `src/lib/`: code TypeScript thuần, không JSX, có unit test.
- `src/code/<phần>/<bài>/*.py`: file Python ví dụ (từ M1, xem [components.md](components.md) mục PythonRunner).

### 3.4. Đề xuất thêm vào `.gitignore` (chỉ thêm, không ghi đè)

`.gitignore` hiện đã có `node_modules/`, `dist/`, `.astro/` và dòng bỏ qua junction `.claude/skills/design-taste-frontend`. **Giữ nguyên toàn bộ**, chỉ thêm ở cuối:

```gitignore
# Playwright
test-results/
playwright-report/
blob-report/
playwright/.cache/
```

## 4. Giao diện và cấu hình

### 4.1. `package.json`

```json
{
  "name": "ai-atlas",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "engines": { "node": ">=22.23.4" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "astro": "astro"
  }
}
```

Dependencies cài bằng lệnh ở mục 6 (bước 2), **luôn có cờ `-E`** (`--save-exact`) để ghim phiên bản.

`npm run test:e2e` tự build rồi chạy preview (qua `webServer` của Playwright), nên không cần build trước.

### 4.2. `astro.config.ts` (đã kiểm chứng trong spike)

```ts
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import starlightLinksValidator from 'starlight-links-validator';
import { buildSidebar } from './src/lib/sidebar';

export default defineConfig({
  // Placeholder until the Cloudflare project name / custom domain is final (see section 7).
  site: 'https://ai-atlas.pages.dev',
  trailingSlash: 'always',
  redirects: { '/': '/vi/' },
  markdown: {
    // Astro 7 defaults to Sätteri, which does not run remark/rehype plugins.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
  integrations: [
    starlight({
      title: { vi: 'AI Atlas', en: 'AI Atlas' },
      description: 'Bản đồ kiến thức AI song ngữ Việt – Anh.',
      defaultLocale: 'vi',
      locales: {
        vi: { label: 'Tiếng Việt', lang: 'vi' },
        en: { label: 'English', lang: 'en' },
      },
      sidebar: buildSidebar(),
      customCss: ['katex/dist/katex.min.css', './src/styles/custom.css'],
      disable404Route: true,
      lastUpdated: false,
      plugins: [
        starlightLinksValidator({
          errorOnFallbackPages: false,
          errorOnInconsistentLocale: true,
        }),
      ],
    }),
    react(),
  ],
});
```

Ghi chú:

- `description` của Starlight là chuỗi chung; mô tả từng trang lấy từ frontmatter `description` của trang đó.
- KaTeX CSS nạp toàn site qua `customCss` (khoảng 23 KB, font KaTeX chỉ tải khi trang có công thức). Đã kiểm chứng: CSS vào bundle chung `common.*.css`.
- Starlight tự sinh `hreflang` vi/en/x-default và `sitemap-index.xml` khi có `site` (đã kiểm chứng). Từ M2, bài chưa dịch không có `hreflang="en"` (quyết định 30, [README.md](README.md) mục 3.1). Đây là một phần tiêu chí M4.
- Từ M1, `integrations` có thêm `sitemap({ i18n, filter })` của `@astrojs/sitemap` để bỏ trang `/dev/`. Starlight thấy đã có integration này nên không thêm bản của nó. Xem [components.md](components.md) mục 2.10.
- Không bật `editLink` vì repo private.

### 4.3. `tsconfig.json` (đã kiểm chứng với TypeScript 6.0.3)

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules", ".agents", ".claude"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "paths": {
      "@components/*": ["./src/components/*"],
      "@data/*": ["./src/data/*"],
      "@lib/*": ["./src/lib/*"],
      "@i18n/*": ["./src/i18n/*"],
      "@code/*": ["./src/code/*"]
    }
  }
}
```

**Không dùng `baseUrl`.** TypeScript 6 báo lỗi `TS5101: Option 'baseUrl' is deprecated` (đã kiểm chứng). `paths` với `./` hoạt động không cần `baseUrl`. Alias dùng được trong `.astro`, `.ts`, `.tsx`, `.mdx` và trong Vitest (đã kiểm chứng).

### 4.4. `src/content.config.ts`

```ts
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { ALL_UI_KEYS, type UiKey } from './i18n/ui';

// Every custom UI key is required: a key missing from vi.json or en.json fails the build.
const uiShape = Object.fromEntries(
  ALL_UI_KEYS.map((key) => [key, z.string().min(1)]),
) as Record<UiKey, z.ZodString>;

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  i18n: defineCollection({
    loader: i18nLoader(),
    schema: i18nSchema({ extend: z.object(uiShape) }),
  }),
};
```

Ép kiểu `as Record<UiKey, z.ZodString>` là **bắt buộc**. Thiếu nó, `Astro.locals.t('atlas.…')` báo lỗi kiểu vì Starlight suy ra danh sách key hợp lệ từ schema (đã kiểm chứng: `astro check` lỗi ts(2345) khi key không phải literal).

### 4.5. Chuỗi giao diện: `src/i18n/ui.ts`

Key trong JSON là chuỗi phẳng dạng `atlas.<namespace>.<key>`. Tiền tố `atlas.` tránh trùng key có sẵn của Starlight.

```ts
// src/i18n/ui.ts — single source of truth for custom UI string keys.
export const UI_KEYS = {
  home: ['buildingTitle', 'buildingText'],
  notFound: ['title', 'text', 'homeLink'],
  // M1 adds: prereq, quiz, progress, runner, roadmap (see components.md)
} as const satisfies Record<string, readonly string[]>;

export type UiNamespace = keyof typeof UI_KEYS;
export type UiStrings<N extends UiNamespace> = Record<(typeof UI_KEYS)[N][number], string>;
export type UiKey = {
  [N in UiNamespace]: `atlas.${N}.${(typeof UI_KEYS)[N][number]}`;
}[UiNamespace];

export const ALL_UI_KEYS: UiKey[];

/** Returns every string of one namespace, e.g. getStrings(Astro.locals.t, 'quiz'). */
export function getStrings<N extends UiNamespace>(
  t: App.Locals['t'],
  ns: N,
  options?: { lng?: 'vi' | 'en' },
): UiStrings<N>;
```

```json
// src/content/i18n/vi.json (excerpt)
{
  "atlas.notFound.title": "Không tìm thấy trang",
  "atlas.notFound.text": "Trang bạn tìm không tồn tại hoặc đã được chuyển đi.",
  "atlas.notFound.homeLink": "Về trang chủ"
}
```

Cách dùng:

- **Component Astro:** `Astro.locals.t('atlas.notFound.title')` hoặc `getStrings(Astro.locals.t, 'notFound')`. Ngôn ngữ tự theo trang.
- **Nội suy:** dùng cú pháp i18next `{{name}}`, ví dụ `"atlas.quiz.score": "Đúng {{correct}}/{{total}} câu"` rồi gọi `t('atlas.quiz.score', { correct: 2, total: 3 })` (đã kiểm chứng ra "Đúng 2/3").
- **Component React:** không tự dịch. Astro wrapper gọi `getStrings(Astro.locals.t, 'quiz')` rồi truyền object `strings` qua props. Chuỗi có biến thì `getStrings` trả nguyên mẫu `{{correct}}` (đã kiểm chứng: i18next giữ nguyên placeholder khi không truyền biến). React thay biến bằng hàm nhỏ `formatString(template, vars)` (`src/i18n/format.ts`, đã có từ M0 vì trang chủ dùng).
- **Ngôn ngữ hiện tại:** `Astro.currentLocale` (`'vi' | 'en'`). Với trang Starlight còn có `Astro.locals.starlightRoute.locale`.
- **Tiêu đề phần/bài** không nằm trong i18n JSON. Chúng là nội dung, nằm trong `roadmap.ts` dạng `{ vi, en }`.
- Chữ giao diện có sẵn của Starlight (tìm kiếm, mục lục, thông báo chưa dịch…) đã có bản `vi` dựng sẵn, không cần dịch lại.

### 4.6. Trang chủ tạm

`src/content/docs/vi/index.mdx` (bản `en` cùng cấu trúc):

```mdx
---
title: AI Atlas
description: Bản đồ kiến thức AI song ngữ Việt – Anh, từ Python đến mô hình ngôn ngữ lớn. Giải thích dễ hiểu, miễn phí.
template: splash
hero:
  title: AI Atlas
  tagline: Tấm bản đồ kiến thức AI, từ Python đến mô hình ngôn ngữ lớn.
---

:::note[Đang xây dựng]
Lộ trình 78 bài đang được chuẩn bị. Bài đầu tiên sẽ là Hồi quy tuyến tính.
:::
```

- Chữ trong trang MDX là **nội dung** của từng ngôn ngữ, viết thẳng trong file vi/en (không qua i18n JSON).
- Chưa có nút "Bắt đầu học" vì chưa có bài (nút dẫn tới trang không tồn tại sẽ làm link validator báo lỗi). M1 thêm `RoadmapMap`, M2 thêm nút.
- Giao diện chi tiết của trang chủ thiết kế sau M0 bằng skill `design-taste-frontend`.

### 4.7. Trang 404: `src/pages/404.astro` (đã kiểm chứng)

```astro
---
import StarlightPage from '@astrojs/starlight/components/StarlightPage.astro';
import { getStrings } from '@i18n/ui';

const vi = getStrings(Astro.locals.t, 'notFound');
const en = getStrings(Astro.locals.t, 'notFound', { lng: 'en' });
---
<StarlightPage frontmatter={{ title: `${vi.title} · ${en.title}`, template: 'splash', pagefind: false, editUrl: false }}>
  <p>{vi.text} <a href="/vi/">{vi.homeLink}</a></p>
  <p lang="en">{en.text} <a href="/en/">{en.homeLink}</a></p>
</StarlightPage>
```

Phần tiếng Anh có `lang="en"` để trình đọc màn hình đọc đúng.

### 4.8. Trang dev `dev/components.mdx`

Không nằm trong lộ trình, không có trong sidebar. Frontmatter:

```yaml
title: Kiểm tra component
description: Trang nội bộ để kiểm tra hiển thị. Không dành cho người đọc.
pagefind: false
head:
  - tag: meta
    attrs: { name: robots, content: noindex }
```

Nội dung M0: một công thức inline, một công thức display (`\mathcal{L}`, `\frac`, `\sum`, `\mathbf{w}`, `\hat{y}`), một `:::note`. Thêm một công thức có dấu `<` (`$a < b$`) để chắc MDX không hiểu nhầm là thẻ JSX. Playwright dùng trang này để kiểm tra KaTeX. M1 thêm demo đủ 5 component vào đây.

### 4.9. `vitest.config.ts` (đã kiểm chứng với Vitest 5.0.5)

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    environment: 'node', // component tests opt in with `// @vitest-environment jsdom` (M1)
  },
});
```

### 4.10. `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';

// 4322, not Astro's default 4321: `npm run dev` often runs there, and with reuseExistingServer the e2e
// tests would quietly run against the dev server. "localhost", since preview may listen on [::1] only.
const PORT = 4322;

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}/vi/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 800 } } },
  ],
});
```

Chỉ dùng Chromium để nhẹ máy (`npx playwright install chromium`).

E2E dùng **cổng 4322** (đổi ở mốc M1, ngày 23/10/2026). Cổng 4321 là cổng của `npm run dev`. Nếu e2e cũng dùng 4321 thì khi dev server đang chạy, `reuseExistingServer` sẽ cho test chạy âm thầm trên dev server thay vì bản build. Giữ `localhost` vì trên máy phát triển, `astro preview` chỉ nghe ở `[::1]`.

### 4.11. Cloudflare Pages

Gốc repo git là `ai-atlas/`, nên cấu hình là:

| Mục trên Cloudflare (Workers & Pages → Create → Pages → Connect to Git) | Giá trị |
|---|---|
| Repository | `Luffyreals/ai-atlas`, nhánh production `main` |
| Framework preset | `Astro` (hoặc `None`, kết quả như nhau) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | **để trống** (gốc repo) |
| Environment variable | `NODE_VERSION` = `24.15.0` (dự phòng, ngoài `.node-version`) |

- **Bắt buộc ghim Node.** Build image v3 của Cloudflare mặc định Node 22.16.0, **thấp hơn** mức Astro 7 yêu cầu (`>=22.23.4`). Nếu không ghim, build trên Cloudflare sẽ lỗi. Ghim bằng `.node-version` ở gốc repo (Cloudflare tự đọc) và thêm biến `NODE_VERSION` cho chắc.
- Chọn Node **24.15.0**: là Node 24 LTS đang dùng trên máy phát triển, nên local và Cloudflare chạy cùng một bản.
- Cloudflare tự chạy `npm clean-install` vì có `package-lock.json`. Playwright **không** tải trình duyệt khi cài gói, nên build trên Cloudflare không bị chậm vì nó.
- Preview deploy cho nhánh khác `main`: để mặc định (bật). Mỗi nhánh có URL xem trước riêng.
- Sau khi deploy xong lần đầu: sửa `site` trong `astro.config.ts` thành URL thật (`https://<tên-project>.pages.dev`), sau này đổi sang tên miền riêng ở M4.
- 404: Cloudflare dùng `dist/404.html` cho mọi đường dẫn không tồn tại. Vì có file này, Cloudflare **không** bật chế độ SPA (trả `index.html` cho mọi URL).

Việc kết nối Cloudflare cần đăng nhập tài khoản của người dùng, nên do **người dùng** làm theo bảng trên, không phải agent.

## 5. Phụ thuộc

Tra trên npm ngày 2026-10-22. Đã cài và build thử cùng nhau, không xung đột peer dependency.

### 5.1. Cài ở M0

| Gói | Phiên bản | Loại | Ghi chú |
|---|---|---|---|
| `astro` | 7.4.2 | dependencies | Yêu cầu Node `>=22.23.4`. `sharp` là optional dependency của astro, không cần cài riêng |
| `@astrojs/starlight` | 0.42.6 | dependencies | Peer `astro ^7.2.10` |
| `@astrojs/markdown-remark` | 7.3.4 | dependencies | Cung cấp `unified()`. Peer tùy chọn của Starlight |
| `@astrojs/react` | 7.1.1 | dependencies | |
| `react`, `react-dom` | 19.3.1 | dependencies | |
| `remark-math` | 6.0.0 | dependencies | |
| `rehype-katex` | 7.0.1 | dependencies | Phụ thuộc `katex ^0.16.0` |
| `katex` | **0.16.47** | dependencies | **Không dùng 0.19.0 (mới nhất).** `rehype-katex` render bằng katex 0.16.x; CSS phải cùng phiên bản với bản render. Ghim 0.16.47 để npm chỉ giữ một bản (đã kiểm chứng `deduped`) |
| `starlight-links-validator` | 0.27.0 | dependencies | Chạy trong build nên để ở dependencies |
| `typescript` | **6.0.3** | devDependencies | **Không dùng 7.0.2.** `@astrojs/check` 0.9.12 chỉ nhận peer `typescript ^5 \|\| ^6` |
| `@astrojs/check` | 0.9.12 | devDependencies | |
| `@types/react`, `@types/react-dom` | 19.3.0 | devDependencies | |
| `@types/node` | 24.19.2 | devDependencies | Khớp Node 24; cho `playwright.config.ts` và test đọc file |
| `vitest` | 5.0.5 | devDependencies | Dùng Vite 8 của Astro |
| `@playwright/test` | 1.64.1 | devDependencies | |

### 5.2. Cài ở M1 (để tham khảo, chi tiết ở [components.md](components.md) mục 5)

Kiểm tra lại ngày 23/10/2026.

| Gói | Phiên bản | Loại |
|---|---|---|
| `@astrojs/sitemap` | 3.7.4 | dependencies (sitemap tường minh có `filter`, bỏ trang `/dev/`) |
| `pyodide` | 314.0.7 | devDependencies (chỉ lấy kiểu TypeScript; runtime tải từ CDN) |
| `jsdom` | 30.1.3 | devDependencies |
| `@testing-library/react` | 16.3.3 | devDependencies |
| `@testing-library/dom` | 10.4.2 | devDependencies (peer bắt buộc, ghi tường minh để ghim) |
| `@testing-library/user-event` | 14.6.8 | devDependencies |

## 6. Các bước thực hiện

### Nhiệm vụ M0-1 đến M0-9: `developer`, làm trong **một lần gọi**

Làm trong thư mục `ai-atlas/`. Không chạy `npm create astro`. Không ghi đè file có sẵn. Không commit.

1. **Kiểm tra môi trường.** `node -v` phải `>=22.23.4` (máy hiện có 24.15.0).
   *Xong khi:* in ra phiên bản Node hợp lệ.

2. **Tạo `package.json` (mục 4.1) và cài gói.** Chạy đúng hai lệnh:
   ```sh
   npm install -E astro@7.4.2 @astrojs/starlight@0.42.6 @astrojs/markdown-remark@7.3.4 @astrojs/react@7.1.1 react@19.3.1 react-dom@19.3.1 remark-math@6.0.0 rehype-katex@7.0.1 katex@0.16.47 starlight-links-validator@0.27.0
   npm install -D -E typescript@6.0.3 @astrojs/check@0.9.12 @types/react@19.3.0 @types/react-dom@19.3.0 @types/node@24.19.2 vitest@5.0.5 @playwright/test@1.64.1
   npx playwright install chromium
   ```
   *Xong khi:* `package.json` có đúng các phiên bản trên, không có dấu `^`; `npm ls katex` chỉ có một bản 0.16.47.

3. **Tạo file cấu hình:** `.node-version` (nội dung `24.15.0`), `astro.config.ts` (4.2), `tsconfig.json` (4.3), `vitest.config.ts` (4.9), `playwright.config.ts` (4.10), `public/_redirects` (`/  /vi/  302`), `public/favicon.svg` (hình đơn giản tự vẽ), `src/styles/custom.css` (chỉ vài biến `--sl-color-accent*`, có cho cả sáng và tối), `src/components/.gitkeep`. Thêm các dòng Playwright vào cuối `.gitignore` (3.4), không xóa dòng nào.
   *Xong khi:* các file tồn tại; `git diff .gitignore` chỉ có dòng thêm.

4. **i18n:** `src/i18n/ui.ts` (4.5) với namespace `home`, `notFound`; `src/content/i18n/vi.json` và `en.json` đủ key; `src/content.config.ts` (4.4).
   *Xong khi:* xóa thử một key trong `en.json` thì `npm run build` lỗi `InvalidContentEntryDataError`; trả key lại thì build qua.

5. **Dữ liệu lộ trình:** `src/data/roadmap.ts` đủ 7 phần, 78 bài, theo bảng ở [roadmap-data.md](roadmap-data.md) mục 5, mọi bài `status: { vi: 'planned', en: 'planned' }`. `src/lib/roadmap.ts` (các hàm ở roadmap-data.md mục 4.2). `src/lib/sidebar.ts` (`buildSidebar()`, roadmap-data.md mục 4.3), chỉ dùng import tương đối.
   *Xong khi:* `validateRoadmap()` trả mảng rỗng.

6. **Trang:** `src/content/docs/vi/index.mdx`, `en/index.mdx` (4.6); `vi/dev/components.mdx`, `en/dev/components.mdx` (4.8); `src/pages/404.astro` (4.7).
   *Xong khi:* `npm run build` sinh `dist/index.html` (redirect), `dist/vi/index.html`, `dist/en/index.html`, `dist/404.html`, `dist/vi/dev/components/index.html`, `dist/_redirects`.

7. **Unit test** trong `tests/unit/` (danh sách test bắt buộc ở [roadmap-data.md](roadmap-data.md) mục 6), cộng:
   - `i18n.test.ts`: `vi.json` và `en.json` có cùng tập key, mỗi key `atlas.*` có trong `ALL_UI_KEYS` và ngược lại, không có giá trị rỗng, placeholder `{{...}}` giống nhau giữa vi và en.
   - `deps.test.ts`: mọi phiên bản trong `package.json` không có `^`/`~`; `katex` bắt đầu bằng `0.16.`.
   *Xong khi:* `npm test` qua hết. Thử đổi một prerequisite thành id không tồn tại thì test lỗi.

8. **E2E smoke** `tests/e2e/smoke.spec.ts`:
   - `/` chuyển tới `/vi/`.
   - `/vi/` có `<html lang="vi">`; `/en/` có `<html lang="en">`.
   - Nút chọn ngôn ngữ ở `/vi/` đưa tới `/en/`.
   - `/vi/khong-co-trang-nay/` trả mã 404 và trang có cả chữ vi và en (đã kiểm chứng: `astro preview` trả `dist/404.html` với mã 404).
   - Mọi URL trong test viết **có dấu `/` cuối**. Với `trailingSlash: 'always'`, `astro preview` trả 404 cho `/vi/ml/x` (không có `/`), còn Cloudflare thì tự chuyển hướng. Đây không phải lỗi.
   - `/vi/dev/components/` có ít nhất 2 phần tử `.katex` và 1 `.katex-display`.
   - Ở viewport 375px: `document.documentElement.scrollWidth <= 375` trên `/vi/`, `/en/`, `/vi/dev/components/`.
   - Chuyển chế độ tối (bộ chọn giao diện của Starlight) thì `<html data-theme="dark">`.
   *Xong khi:* `npm run test:e2e` qua trên cả project `desktop` và `mobile`.

9. **Kiểm tra cuối và cập nhật tài liệu.** Chạy `npm run build`, `npm run check`, `npm test`, `npm run test:e2e`. Trong `CLAUDE.md`, cập nhật mục "Trạng thái hiện tại" (đã khởi tạo Astro) và mục "Lệnh" (6 lệnh ở 4.1, kèm `npx playwright install chromium` cho máy mới). Không sửa phần khác của `CLAUDE.md`.
   *Xong khi:* build **không có dòng `[WARN]`**, `astro check` 0 lỗi 0 cảnh báo, mọi test qua. Báo lại nguyên văn kết quả.

### Nhiệm vụ M0-10: `tester`

Chạy lại toàn bộ kiểm tra của M0, thêm test cho trường hợp developer bỏ sót (ví dụ: `dist/_redirects` có đúng nội dung; `dist/index.html` có `noindex`; mọi trang có `hreflang` vi và en).
*Xong khi:* bảng kết quả qua/lỗi cho từng mục ở mục 6 bước 8 và các test bổ sung.

### Nhiệm vụ M0-11: `analyst`

Review cấu hình và code M0: `astro.config.ts`, `src/lib/*`, `src/i18n/ui.ts`, test. Đo kích thước `dist/` và JS trên trang chủ (mục tiêu: trang chủ không có JS của React).
*Xong khi:* báo cáo có danh sách vấn đề theo mức độ.

### Nhiệm vụ M0-12: **người dùng**

Kết nối Cloudflare Pages theo mục 4.11, push `main`, xác nhận URL `*.pages.dev` mở được trên điện thoại. Báo lại tên project để sửa `site`.
*Xong khi:* URL online trả `/vi/` và `/en/`, `/` chuyển hướng 302 sang `/vi/`.

### Nhiệm vụ M0-13: `developer` (nhỏ, sau M0-12)

Đổi `site` trong `astro.config.ts` thành URL thật.
*Xong khi:* `dist/sitemap-0.xml` chứa URL thật.

### Sau M0

Thiết kế giao diện trang chủ và component bằng skill `design-taste-frontend`, trước hoặc song song với M1. Không thuộc tài liệu này.

## 7. Rủi ro và điểm chưa chắc

| # | Rủi ro / điểm chưa chắc | Ảnh hưởng | Cách xử lý |
|---|---|---|---|
| 1 | Astro 7 mặc định Sätteri. Quên `processor: unified(...)` thì công thức hỏng **mà build vẫn qua** | Toàn bộ công thức hiện thô | E2E kiểm tra `.katex` trên trang dev (bước 8) |
| 2 | Node trên Cloudflare mặc định 22.16.0 < 22.23.4 | Build trên Cloudflare lỗi | `.node-version` + biến `NODE_VERSION` |
| 3 | Hệ sinh thái mới (Astro 7, Vite 8, TS 6, Vitest 5) đổi nhanh | Nâng cấp có thể vỡ | Ghim chính xác phiên bản (`-E`); nâng cấp có chủ đích, mỗi lần một nhóm gói |
| 4 | `katex` phải giữ 0.16.x chừng nào `rehype-katex` còn dùng 0.16 | Lệch CSS và HTML nếu ai đó nâng katex lên 0.19 | Unit test đọc `package.json`: `katex` phải bắt đầu bằng `0.16.` (thêm vào `tests/unit/deps.test.ts` ở bước 7) |
| 5 | Cấu hình `site` đang là placeholder | Canonical và sitemap sai cho tới M0-13 | M0-13 |
| 6 | Trang 404 song ngữ chung một trang | Người đọc tiếng Anh thấy tiếng Việt trước | Chấp nhận ở MVP; có thể làm `/en/404.html` riêng sau bằng file tĩnh |
| 7 | Trang `dev/components` vẫn có trong sitemap | Nhỏ | Có `noindex`. **Lọc ở M1** (quyết định 23/10/2026): khai báo `@astrojs/sitemap` tường minh có `filter`, xem [components.md](components.md) mục 2.10 |

### Câu hỏi cho người dùng

Người dùng đã trả lời ngày 22/10/2026:

1. ~~Tên project Cloudflare~~ → `ai-atlas` (URL tạm `ai-atlas.pages.dev`, nếu tên còn trống).
2. ~~Trang gốc `/`~~ → luôn chuyển sang `/vi/`. Tự chọn theo trình duyệt để sau MVP.
3. ~~Quy tắc link~~ → **bắt buộc link tuyệt đối** `/vi/...`, `/en/...`. Template đổi theo ở M1.
