# Chính sách bảo mật

**Tiếng Việt** · [English](#english)

## AI Atlas xử lý dữ liệu gì

AI Atlas là website **hoàn toàn tĩnh**. Mọi trang được build sẵn thành HTML và phục vụ qua Cloudflare Pages.

- Không có server ứng dụng, không có cơ sở dữ liệu, không có API riêng.
- Không có tài khoản, không đăng nhập, không có form gửi dữ liệu.
- Website chỉ lưu dữ liệu trong trình duyệt của bạn: chế độ sáng/tối (`localStorage`) và trạng thái sidebar (`sessionStorage`) do Starlight lưu, và từ mốc M1 thêm **tiến độ học** (`localStorage`). Dữ liệu này không rời khỏi máy bạn.
- Code Python ví dụ chạy **ngay trong trình duyệt** bằng Pyodide, trong một Web Worker (từ mốc M1). Pyodide chỉ được tải từ CDN jsDelivr khi bạn bấm "Chạy".

## Phiên bản được hỗ trợ

| Phiên bản | Hỗ trợ |
|---|---|
| Nhánh `main` (bản đang chạy online) | Có |
| Commit cũ, bản fork | Không |

Dự án chưa phát hành theo số phiên bản. Bản sửa lỗi bảo mật luôn đi vào `main`.

## Phạm vi

**Thuộc phạm vi**, ví dụ:

- **XSS qua nội dung:** HTML hoặc script lọt vào trang qua bài học MDX, chuỗi quiz trong frontmatter, chuỗi giao diện trong `src/content/i18n/`, hoặc kết quả hiển thị của trình chạy Python.
- **Chuỗi cung ứng:** gói npm có lỗ hổng hoặc bị chèn mã độc, tài nguyên tải từ CDN bên ngoài (Pyodide trên jsDelivr).
- **Cấu hình triển khai:** chuyển hướng mở (open redirect) qua `public/_redirects`, lộ file không nên công khai trong `dist/`.
- **Rò rỉ dữ liệu bí mật** trong repo hoặc bản build (token, khóa API).

**Ngoài phạm vi:**

- Lỗ hổng của nền tảng bên thứ ba (Cloudflare, GitHub, jsDelivr). Bạn báo trực tiếp cho họ.
- Tấn công từ chối dịch vụ (DoS), spam, lừa đảo qua mạng xã hội.
- Code Python bạn tự nhập vào trình chạy rồi tự chạy trên máy mình.
- Kết quả quét tự động không kèm cách tái hiện hay ảnh hưởng cụ thể.

## Cách báo lỗi bảo mật

**Không mở issue hay pull request công khai mô tả lỗ hổng.**

Bạn báo qua tính năng **Private vulnerability reporting** của GitHub: vào tab **Security** của repo, chọn **Report a vulnerability**. Chỉ người duy trì thấy báo cáo này.

GitHub chỉ cho bật tính năng này ở repo công khai. Repo AI Atlas hiện còn private, nên **chưa có kênh báo cáo riêng**. Người duy trì sẽ bật tính năng này ngay khi repo công khai.

Báo cáo nên có:

- Trang hoặc file bị ảnh hưởng (URL, đường dẫn trong repo).
- Các bước tái hiện, kèm trình duyệt và thiết bị.
- Ảnh hưởng thực tế bạn quan sát được.
- Cách sửa đề xuất, nếu có.

Dự án do một người duy trì, nên thời gian phản hồi không cố định. Bạn sẽ được phản hồi sớm nhất có thể. Sau khi lỗi được sửa, bạn có thể được ghi nhận trong [CHANGELOG.md](../docs/CHANGELOG.md) nếu muốn.

---

## English

AI Atlas is a **fully static** website served by Cloudflare Pages. It has no application server, no database, no accounts and no forms. It only stores data in your browser: Starlight keeps your light/dark theme choice in `localStorage` and the sidebar state in `sessionStorage`, and from milestone M1 your **learning progress** is kept in `localStorage`. This data never leaves your device. Python examples run **in your browser** with Pyodide inside a Web Worker; Pyodide is fetched from the jsDelivr CDN only when you click "Run".

**Supported version:** the `main` branch (the live site). Old commits and forks are not supported.

**In scope:** XSS through content rendering (MDX lessons, quiz strings, UI strings, Python runner output), supply-chain issues (npm dependencies, Pyodide from jsDelivr), deployment configuration (open redirects via `public/_redirects`, files exposed in `dist/`), and secrets leaked in the repo or the build.

**Out of scope:** vulnerabilities in third-party platforms (Cloudflare, GitHub, jsDelivr), denial of service, social engineering, Python code you type and run yourself, and automated scan results without a reproduction or concrete impact.

**How to report:** do **not** open a public issue or pull request describing the vulnerability. Use GitHub's **Private vulnerability reporting**: open the repository's **Security** tab and choose **Report a vulnerability**. Only the maintainer can see the report.

GitHub only offers this feature on public repositories. AI Atlas is still private, so **there is no private reporting channel yet**. The maintainer will turn the feature on as soon as the repository becomes public.

Please include the affected page or file, steps to reproduce (browser and device), the impact you observed, and a suggested fix if you have one. This is a single-maintainer project, so there is no fixed response time; you will get a reply as soon as possible. Once the issue is fixed, you can be credited in [CHANGELOG.md](../docs/CHANGELOG.md) if you wish.
