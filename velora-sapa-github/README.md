# Velora Hotel Sa Pa – website cho khách (phần D, nhóm 6)

Khách sạn **giả lập** phục vụ bài tập Chuyên đề thực tế. Dữ liệu lấy theo tài liệu "Thông tin", thẻ Tổng (giờ giấc lấy từ thẻ FQA).

| Mục | Đường dẫn |
|---|---|
| D1 Trang chủ | `/vi`, `/en` |
| D2 Danh sách phòng và giá, chi tiết từng phòng | `/vi/rooms`, `/vi/rooms/<id>` |
| D3 + D4 Đặt phòng 5 bước: ngày ở → chọn hạng và số phòng → số khách từng phòng (trẻ em, giường phụ) → liên hệ → thanh toán cọc | `/vi/book` (nhận sẵn `?in=YYYY-MM-DD&out=…&room=<id>`) |
| D5 Tra cứu, đổi, hủy đơn | `/vi/booking` |
| D6 Khung chat AI Concierge (Coze) | nút góc phải mọi trang |
| Thêm | Ẩm thực và dịch vụ `/vi/services`, Thông tin và chính sách `/vi/info` |

Song ngữ Việt / Anh. Truy cập `/` tự chuyển theo ngôn ngữ trình duyệt.

## Chạy trên máy

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm run start   # bản production
```

## Biến môi trường

Chép `.env.example` thành `.env.local` (không đưa lên GitHub). Trên Vercel khai báo ở Settings → Environment Variables.

| Biến | Ý nghĩa |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | API đặt phòng của nhóm (phần C). **Bỏ trống thì website dùng dữ liệu giả lưu trong trình duyệt** để demo được ngay. |
| `NEXT_PUBLIC_COZE_BOT_ID`, `NEXT_PUBLIC_COZE_TOKEN` | AI Concierge trên Coze. Bỏ trống thì nút chat chỉ hiện hotline và email. Token này lộ ra trình duyệt, chỉ dùng token giới hạn quyền chat của đúng bot. |
| `NEXT_PUBLIC_COZE_SDK_URL` | (Tùy chọn) script Coze Web SDK lấy từ trang Publish → Web SDK. Mặc định dùng bản coze.com. |
| `NEXT_PUBLIC_SITE_URL` | Địa chỉ website sau khi deploy. |

## Hợp đồng API website gọi (cho phần C)

JSON vào và ra. Lỗi trả HTTP 4xx kèm `{ "error": "<MÃ_LỖI>", "message": "…" }`. Kiểu dữ liệu đầy đủ ở `src/lib/booking-api.ts`.

Một đơn có nhiều phòng; mỗi phòng là một dòng `RoomLine = { roomTypeId, guests: { adults, children, extraBed } }` (khớp bảng `ChiTietDon`). `adults` gồm cả trẻ từ 12 tuổi.

| Việc | Gọi | Body | Trả về |
|---|---|---|---|
| Phòng trống theo ngày | `GET /availability?checkIn=&checkOut=` | | `{ checkIn, checkOut, peak, rooms: [{ roomTypeId, available, pricePerNight }] }` |
| Tạo đơn | `POST /bookings` | `{ checkIn, checkOut, rooms: RoomLine[], extras, fullName, phone, email, note?, paymentMethod }` | `Booking` |
| Tra đơn | `POST /bookings/lookup` | `{ code, phone }` | `Booking` |
| Hủy đơn | `POST /bookings/{code}/cancel` | `{ phone }` | `Booking` |
| Đổi đơn | `POST /bookings/{code}/change` | `{ phone, checkIn, checkOut, roomTypeIds: string[] }` (một mã cho mỗi phòng, theo thứ tự) | `Booking` |

- `paymentMethod`: `BANK_TRANSFER`, `E_WALLET` (cọc ngay, mô phỏng, đơn ở `DA_COC`) hoặc `PAY_LATER` (đơn ở `CHO_XAC_NHAN`, nhân viên gửi hướng dẫn). Website không xử lý tiền thật và không nhận thông tin thẻ.
- Mã đơn dạng `DD000123` (cột `MaDonHienThi`). Trạng thái dùng đúng giá trị bảng `DonDatPhong`.
- Mã lỗi: `INVALID_INPUT`, `NOT_FOUND` (sai mã **hoặc** sai số điện thoại đều trả mã này), `SOLD_OUT`, `OVER_CAPACITY`, `CANCEL_NOT_ALLOWED`, `CHANGE_TOO_LATE`, `DOWNGRADE_NOT_ALLOWED`, `NOT_CHANGEABLE`.

## Luật nghiệp vụ (`src/lib/pricing.ts`)

- Mỗi phòng: (giá phòng/đêm + 100.000đ × số trẻ vượt sức chứa tiêu chuẩn + 200.000đ nếu có giường phụ) × số đêm. Trẻ trong sức chứa tiêu chuẩn miễn phí, không hỏi tuổi; trẻ từ 12 tuổi nhập như người lớn. Cọc 50% tổng tiền phòng.
- Sức chứa: người lớn theo bảng phòng, thêm 1 người lớn nếu có giường phụ (tối đa 1 giường/phòng); trẻ em theo bảng phòng, được thêm tối đa 1 trẻ có phụ thu. Website khóa nút tăng khi đủ chỗ; muốn thêm khách phải thêm phòng.
- `extras = { services: [{ id, qty }], early, late }`: dịch vụ đặt kèm (spa, xe đưa đón, tour; mã trong `SERVICE_ITEMS` ở `src/lib/hotel.ts`) và nhận sớm/trả muộn (`none | before6 | after6`, `none | before18 | after18`, tính 50%/100% tiền phòng 1 đêm). Dịch vụ thanh toán tại khách sạn, không tính vào cọc và phí hủy.
- Hủy: từ 10 ngày trở lên miễn phí, 4–9 ngày 50%, 1–3 ngày 100%; hủy trong ngày nhận phòng chuyển lễ tân.
- Đổi ngày hoặc hạng phòng: báo trước ít nhất 3 ngày, chỉ đổi lên hạng bằng hoặc cao hơn. Đổi xong đơn về "Chờ xác nhận".

**Giả định nhóm cần chốt** (sửa trong `pricing.ts` và `hotel.ts`):
- Dịp lễ, Tết, cao điểm chỉ báo giá tham khảo: 30/4–1/5, 2/9, 24–25/12, 31/12–1/1, Tết âm lịch, mùa hoa đào (tháng 1–2), mùa lúa chín (tháng 9–10).
- Số phòng mỗi loại: Superior 30, Deluxe 28, Family 14, Executive Suite 8 (tổng 80).

## Thiết kế

- Màu theo tài liệu ("tông xanh và gỗ"): nền `#eff1ea`, chữ xanh rừng `#1d2620`, pistachio `#5d6f3f` / `#b7c68c`, gỗ óc chó `#7a4b2d` cho nút đặt phòng. Biến màu ở `src/app/globals.css`.
- Chữ: Cormorant Garamond (tiêu đề, serif cổ điển) và Be Vietnam Pro (nội dung, do người Việt thiết kế), đều đủ dấu tiếng Việt.
- Chuyển động: hero "sương tan" khi mở trang chủ, cuộn mượt (Lenis), ảnh hiện dần khi cuộn tới, parallax nhẹ, menu toàn màn hình. Tự tắt khi máy bật "giảm chuyển động".
- Ảnh tạo bằng AI theo phong cách ảnh chụp thật (Figma AI), đã nén vào `src/assets/img`.
