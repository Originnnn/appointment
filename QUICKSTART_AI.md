# 🚀 HƯỚNG DẪN NHANH - Kích hoạt AI Medical Assistant

## ⚡ Chỉ 3 bước để bắt đầu!

### Bước 1️⃣: Lấy API Key (2 phút)

Truy cập: **https://makersuite.google.com/app/apikey**

1. Đăng nhập Google
2. Nhấn "Create API Key" 
3. Copy key (dạng: `AIzaSy...`)

### Bước 2️⃣: Cấu hình (30 giây)

Tạo file `.env.local` tại thư mục root:

```bash
GEMINI_API_KEY=AIzaSy_paste_your_key_here
```

### Bước 3️⃣: Khởi động (1 phút)

```bash
npm run dev
```

## ✅ Kiểm tra hoạt động

1. Truy cập: http://localhost:3001
2. Đăng nhập tài khoản bệnh nhân
3. Thấy **nút tím floating** góc phải dưới? ✨
4. Nhấn vào và chat thử!

## 💬 Thử ngay với câu hỏi mẫu:

- "Tôi bị sốt và ho"
- "Gợi ý bác sĩ phù hợp"
- "Phân tích hồ sơ của tôi"

## 🔧 Gặp lỗi?

### Lỗi: "Failed to generate AI response"
**→ Kiểm tra:** API key trong `.env.local` có đúng không?

### Không thấy nút AI
**→ Kiểm tra:** Console có lỗi? Refresh lại trang

### AI trả lời lạ
**→ Thử:** Hỏi rõ ràng hơn, mô tả chi tiết triệu chứng

---

📖 **Chi tiết đầy đủ:** Xem [AI_CHATBOT_README.md](./AI_CHATBOT_README.md)

🎉 **Chúc bạn trải nghiệm vui vẻ!**
