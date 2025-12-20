# 🔧 KHẮC PHỤC LỖI AI CHATBOT

## ✅ Đã sửa xong!

### Thay đổi:
1. ✅ Xóa dấu ngoặc kép thừa trong `.env.local`
2. ✅ Thêm error handling chi tiết trong API route
3. ✅ Cải thiện error messages trong component
4. ✅ Tạo script kiểm tra cấu hình

### 🚨 BẠN PHẢI LÀM NGAY:

**RESTART SERVER** để Next.js load lại biến môi trường!

```bash
# Dừng server hiện tại (Ctrl + C)
# Rồi chạy lại:
npm run dev
```

### 📝 Kiểm tra lại:

1. **Test API endpoint trước:**
   ```
   http://localhost:3001/api/ai-chat
   ```
   Phải thấy: `"apiKeyConfigured": true`

2. **Login và thử chat:**
   - Login vào patient/doctor dashboard
   - Click floating button tím
   - Gửi tin nhắn test

3. **Nếu vẫn lỗi:**
   - Mở Console browser (F12)
   - Xem lỗi cụ thể
   - Kiểm tra Terminal server logs

### 🔍 Debug Commands:

```bash
# Kiểm tra cấu hình
node check-ai-config.js

# Test API
curl http://localhost:3001/api/ai-chat

# Hoặc mở browser:
http://localhost:3001/api/ai-chat
```

### ⚠️ Lưu ý quan trọng:

1. **Luôn restart server** sau khi sửa `.env.local`
2. **API key không có dấu ngoặc kép**
3. **Clear browser cache** nếu cần
4. **Kiểm tra Console** để thấy error messages chi tiết

### 🎯 Lỗi thường gặp & Cách sửa:

| Lỗi | Nguyên nhân | Giải pháp |
|------|-------------|-----------|
| "API key not configured" | Chưa restart server | Restart server (Ctrl+C → npm run dev) |
| "Failed to fetch" | Server chưa chạy | Chạy npm run dev |
| "Invalid API key" | Key sai | Lấy key mới tại Google AI Studio |
| "Quota exceeded" | Hết quota free | Đợi reset hoặc upgrade plan |

---

**Giờ hãy RESTART SERVER và thử lại! 🚀**
