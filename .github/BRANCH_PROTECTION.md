# Hướng dẫn Bảo vệ Nhánh `main` (Branch Protection)

Tài liệu này hướng dẫn thiết lập các quy tắc bảo vệ nhánh `main` cho repository **`Luffyreals/ai-atlas`** nhằm đảm bảo mã nguồn trên nhánh chính luôn ổn định, không bị ghi đè, và luôn vượt qua toàn bộ quy trình kiểm thử tự động (CI).

---

## 🎯 Mục tiêu bảo vệ

1. **Ngăn chặn push trực tiếp hoặc vô tình xóa nhánh `main`:** Mọi thay đổi phải đi qua Pull Request (PR) hoặc qua quy trình kiểm duyệt an toàn.
2. **Chặn hoàn toàn Force Push (`git push --force`):** Tránh ghi đè hoặc làm mất lịch sử commit.
3. **Bắt buộc toàn bộ CI Checks phải Pass (Xanh) trước khi merge:** Chỉ những PR vượt qua kiểm tra cú pháp TypeScript, 2.222+ Unit Tests, Build tĩnh không cảnh báo, và kiểm thử E2E mới được phép tích hợp.
4. **Bảo vệ cục bộ qua Git Hooks:** Tự động kích hoạt kiểm tra trước khi push trên máy lập trình viên.

---

## ⚙️ Thiết lập trên GitHub (Repository Settings)

Để kích hoạt bảo vệ trên GitHub, truy cập:
👉 `https://github.com/Luffyreals/ai-atlas/settings/rules` (hoặc `Settings` → `Branches` / `Rulesets`).

### Cách 1: Thiết lập qua GitHub Rulesets (Khuyến nghị - Hiện đại nhất)

1. Vào **Settings** → **Rules** → **Rulesets** → Chọn **New ruleset** → **New branch ruleset**.
2. Đặt tên: `Protect main branch`.
3. Trong mục **Enforcement status**: Chọn **Active**.
4. Trong mục **Target branches**:
   - Chọn **Add target** → **Include default branch** (tự động áp dụng cho `main`).
5. Cấu hình các quy tắc (**Rules**):
   - [x] **Restrict deletions**: Không cho phép xóa nhánh `main`.
   - [x] **Block force pushes**: Chặn push ép buộc (force push).
   - [x] **Require linear history**: Yêu cầu lịch sử thẳng (khuyến khích Squash hoặc Rebase merge).
   - [x] **Require a pull request before merging**:
     - *Required approvals*: Đặt `1` (hoặc `0` nếu là dự án cá nhân một người duy trì).
     - [x] *Dismiss stale pull request approvals when new commits are pushed*.
   - [x] **Require status checks to pass**:
     - Thêm các status check từ workflow CI:
       - `Check, unit tests, build` (Job `verify`)
       - `E2E (Playwright, shard 1/3)`
       - `E2E (Playwright, shard 2/3)`
       - `E2E (Playwright, shard 3/3)`
     - [x] *Require branches to be up to date before merging*.
6. Bấm **Save changes**.

---

### Cách 2: Thiết lập qua Classic Branch Protection Rules

Nếu dùng giao diện cổ điển tại **Settings** → **Branches** → **Add branch protection rule**:

1. **Branch name pattern:** Điền `main`.
2. Tích chọn các mục:
   - [x] **Require a pull request before merging**
   - [x] **Require status checks to pass before merging**
     - [x] *Require branches to be up to date before merging*
     - Chọn các checks: `Check, unit tests, build`, và 3 shard E2E Playwright.
   - [x] **Require linear history**
   - [x] **Do not allow force pushes**
   - [x] **Do not allow deletions**
3. Bấm **Save changes**.

---

## 🛡️ Bảo vệ Cục bộ (Local Git Hook)

Dự án đã tích hợp sẵn Git hook tại [`.githooks/pre-push`](../.githooks/pre-push).

### Cách hoạt động:
Mỗi khi bạn thực hiện `git push` tới nhánh `main`:
1. Hook tự động kiểm tra xem có phải là thao tác *force-push* trái phép không.
2. Tự động chạy `npm run check` (TypeScript kiểm tra 0 lỗi, 0 cảnh báo).
3. Tự động chạy `npm test` (2.222+ unit tests).
4. Nếu bất kỳ bước nào thất bại, lệnh push sẽ bị hủy ngay lập tức và đưa ra cảnh báo.

### Kích hoạt hook:
Hook được tự động kích hoạt khi bạn chạy `npm install` (thông qua lệnh `prepare` trong `package.json`). Bạn cũng có thể kích hoạt thủ công bất kỳ lúc nào bằng lệnh:

```sh
git config core.hooksPath .githooks
```
