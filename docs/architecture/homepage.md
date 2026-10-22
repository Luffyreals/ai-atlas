# Trang chủ và nhận diện

> Thiết kế bằng skill `design-taste-frontend` ngày 22/10/2026. Tài liệu này ghi lại **quyết định** và **chỗ sửa**, để sau này đổi chữ, đổi ảnh hay thêm khối mới không phải đoán.

## 1. Ý tưởng

- **Hướng thiết kế:** "The page is the object" (seed 1155804607). Người dùng chọn hướng này trong 3 hướng skill rút ra.
- **Câu ý tưởng:** trên trang này, *lộ trình 78 bài với các con đường "cần biết trước"* trở thành *một tấm bản đồ trong sách atlas*: có viền khung sọc, bảng chú giải, tên địa danh hai thứ tiếng.
- **Thứ người đọc làm được:** chọn một điểm đến trên bản đồ, mọi bài trên đường tới đó được tô lên (route finder trong `RoadmapMap`).
- **Logo:** một con đường qua bốn chặng (Python, Toán, Học máy, Học sâu) rồi rẽ ba (NLP, CV, LLM). Đây là điều chỉ lộ trình này có.

## 2. Bộ nhận diện

| Thành phần | Giá trị | Ở đâu |
|---|---|---|
| Chữ hiển thị | Barlow Condensed 700 | `@fontsource/barlow-condensed`, `--atlas-font-display` |
| Chữ thường | Barlow 400/500/600, 400 italic | `@fontsource/barlow`, `--sl-font` |
| Bảng màu | "Walnut and tan": nền nâu óc chó, chữ màu xương, trường màu tan | `src/styles/custom.css` |
| Logo | `src/assets/logo-dark.svg`, `logo-light.svg` | `astro.config.ts` → `logo` |
| Favicon | `public/favicon.svg` | |
| Góc bo | Vuông (0) cho mọi khối và nút | |

Font tự host, có bộ ký tự tiếng Việt. `unicode-range` giúp trình duyệt chỉ tải bộ latin và vietnamese khi cần.

**Token màu.** Component chỉ dùng `var(--sl-color-*)` và `var(--atlas-*)`, không viết mã màu.

- `--sl-color-*`: đổi theo chế độ sáng/tối, dùng cho các khối theo theme (Lộ trình, Thuật ngữ, Thư).
- `--atlas-paper*`: giấy của tấm bản đồ. Giữ là giấy ở cả hai chế độ.
- `--atlas-ground*`: nền nâu óc chó cho hero, khối bài học và footer, giống màu in của một vật thể thật.
- `--atlas-field*`: trường màu tan, nền của khối bản đồ.

Mọi cặp chữ/nền đạt WCAG AA. Cặp thấp nhất là 5,28:1. `--sl-color-gray-4` ở chế độ sáng chỉ đạt 3,72:1 nên **không dùng cho chữ**.

**Năm cỡ chữ** (token trên `.atlas-home` trong `HomePage.astro`): `--step-small` 16px, `--step-body` 17–19px, `--step-lead` 22–30px, `--step-head` 38–64px, `--step-display` 56–132px. Không thêm cỡ thứ sáu.

## 3. Cấu trúc

```
src/content/docs/{vi,en}/index.mdx   # chỉ frontmatter; `hero:` bật trang chủ thiết kế
src/components/starlight/Hero.astro  # override component Hero của Starlight → HomePage
src/components/home/
  HomePage.astro      # ghép các khối, token, CSS gỡ khung Starlight (chỉ :root[data-has-hero]), hiệu ứng xuất hiện
  HomeHero.astro      # thẻ bìa atlas + bản đồ cổ chuyển cảnh: chỉ trên màn ≥64rem, ảnh phụ tải sau khi trang tải xong,
                      # một vòng 6,5 s/ảnh, dừng khi hover/focus/hero khuất, tắt khi reduced-motion
  HomeRoute.astro     # hàng cột kéo ngang: 7 phần + cột "ngã ba"
  HomeLesson.astro    # 6 mảnh giấy của một bài học trên nền atlas mở
  HomeTerms.astro     # thuật ngữ hai đầu: ngôn ngữ của trang ở đầu trái
  HomeLetter.astro    # thư ngỏ, mép lượn sóng, phần xé có giấy phép
  HomeFooter.astro    # mặt sau bưu thiếp + nguồn ảnh
  Stripe.astro, RouteMark.astro
src/components/RoadmapMap.astro      # tấm bản đồ 78 bài + route finder (dùng lại được ở trang khác)
src/data/home.ts                     # toàn bộ chữ của trang chủ, vi và en
src/data/home-pictures.ts            # ảnh, alt, chú thích, nguồn
src/assets/home/                     # ảnh gốc đã thu nhỏ (Astro sinh AVIF/WebP lúc build)
src/lib/route.ts                     # routeTo(), countParts(): dùng lúc build và trong trình duyệt
src/lib/inline-markup.ts             # renderInlineMarkup(): escape HTML + $toán$ + `code`
src/i18n/format.ts                   # formatString('{{count}} bài', { count })
```

Trang chủ **không tải React**. Mỗi khối có một script nhỏ (crossfade, kéo hàng, route finder, hiệu ứng xuất hiện). Tất cả nội dung vẫn hiện khi tắt JavaScript.

## 4. Sửa thường gặp

- **Đổi chữ:** sửa `src/data/home.ts`, cả `vi` và `en`. Nhãn dùng lại (nút, chú giải bản đồ) nằm ở `src/content/i18n/*.json`, key khai báo trong `src/i18n/ui.ts`.
- **Đổi ảnh:**
  1. Thêm file vào `src/assets/home/`, rộng tối đa khoảng 1600px.
  2. Khai báo trong `home-pictures.ts` với alt, chú thích và nguồn có thật.
  3. Chỉ dùng ảnh phạm vi công cộng, CC0 hoặc CC BY/BY-SA, và ghi nguồn. Danh sách nguồn tự hiện ở footer, bằng ngôn ngữ của trang.
  4. Xem kỹ trang nguồn trên Commons: bản scan của David Rumsey Map Collection (ảnh atlas de Wit, trang bìa Mercator 1635) theo **CC BY-NC-SA 3.0**, phải ghi dòng nguồn của bộ sưu tập.
- **Điểm đến mặc định của bản đồ:** prop `destination` trong `HomePage.astro`. Hiện là `ml/linear-regression`, đường đi gồm 8 bài qua 3 phần.
- **Khi bài đầu tiên được mở:** thêm nút "Bắt đầu học" ở hero. Link validator sẽ báo lỗi nếu nút trỏ tới trang chưa có.

## 5. Kiểm tra

```bash
node .agents/skills/design-taste-frontend/scripts/lint.mjs src/components/home src/components/RoadmapMap.astro
node .agents/skills/design-taste-frontend/scripts/inspect.mjs http://127.0.0.1:4322/vi/
```

Chạy `inspect.mjs` trên bản `npm run preview`. Kết quả ngày 23/10/2026, sau vòng review độc lập: **0 FAIL** ở 1440/768/390 cho cả `/vi/` và `/en/`, lint 0 FAIL 0 WARN.

Lighthouse 13.5.0, cấu hình mobile:

| Trang | Performance | Accessibility | Best Practices | SEO | LCP |
|---|---|---|---|---|---|
| `/vi/` | 91 | 100 | 100 | 100 | 3,4 s |
| `/en/` | 91 | 100 | 100 | 100 | 3,5 s |

Các WARN còn lại có lý do:

| WARN | Lý do giữ |
|---|---|
| font-count | Monospace chỉ có trong khối code thật |
| font-fallback "math" | Phần MathML ẩn của KaTeX |
| no-footage | Giữ trang nhẹ. Chuyển động có từ bản đồ chuyển cảnh và ảnh atlas trôi chậm |
| side-scroll | Hàng cột kéo ngang là chủ đích của bố cục, có nút và thanh tiến độ |
| empty-middle | Khoảng trống so le phía trên ảnh trong hàng lộ trình là chủ đích |
| ragged-edges | Thẻ bìa căn giữa và tấm bản đồ có lề trong riêng, theo kiểu đồ vật in |
| off-centre | Cột thuật ngữ giới hạn 44rem để hai tên đứng gần nhau |
| size-count | Cỡ 11–14px đến từ header của Starlight và KaTeX; trang chủ chỉ dùng 5 bậc |
| mixed-font-headline | Một tiêu đề ở 390px; không tái hiện được phần tử cụ thể |

File làm việc của skill (`.taste-skill/`) không commit.
