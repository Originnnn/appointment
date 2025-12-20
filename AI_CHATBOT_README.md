# 🤖 AI Medical Assistant - Hướng dẫn sử dụng

## Tính năng

AI Medical Assistant là trợ lý y tế thông minh được tích hợp Google Gemini AI, giúp:

### 🏥 Cho Bệnh nhân:
- ✅ Tư vấn về triệu chứng sức khỏe
- ✅ Gợi ý bác sĩ phù hợp dựa trên triệu chứng
- ✅ Phân tích lịch sử khám bệnh cá nhân
- ✅ Hướng dẫn chuẩn bị trước khám
- ✅ Giải đáp thắc mắc về sức khỏe 24/7

### 👨‍⚕️ Cho Bác sĩ:
- ✅ Phân tích hồ sơ bệnh án
- ✅ Gợi ý chẩn đoán ban đầu
- ✅ Hỗ trợ tra cứu thông tin y khoa
- ✅ Tổng hợp lịch sử bệnh nhân

## Cài đặt

### Bước 1: Lấy Google Gemini API Key

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập bằng tài khoản Google
3. Nhấn nút **"Create API Key"**
4. Chọn project hoặc tạo project mới
5. Copy API key vừa tạo

### Bước 2: Cấu hình API Key

Tạo file `.env.local` trong thư mục root của project:

```bash
# .env.local
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

⚠️ **Lưu ý**: 
- Không commit file `.env.local` lên git
- Giữ API key bí mật
- File `.env.local` đã được thêm vào `.gitignore`

### Bước 3: Khởi động ứng dụng

```bash
npm run dev
```

## Cách sử dụng

### 🔵 Bệnh nhân

1. **Đăng nhập** vào tài khoản bệnh nhân
2. Vào **Dashboard**
3. Nhấn nút **floating button màu tím** ở góc dưới bên phải
4. Chat với AI Assistant

**Ví dụ câu hỏi:**
- "Tôi bị sốt và ho, nên khám chuyên khoa nào?"
- "Gợi ý bác sĩ phù hợp cho tôi"
- "Phân tích hồ sơ bệnh án của tôi"
- "Tôi nên chuẩn bị gì trước khi đi khám tim mạch?"

### 🟢 Bác sĩ

1. **Đăng nhập** vào tài khoản bác sĩ
2. Vào **Dashboard**
3. Nhấn nút **AI Assistant** ở góc dưới bên phải
4. Sử dụng AI để hỗ trợ công việc

**Ví dụ câu hỏi:**
- "Phân tích triệu chứng của bệnh nhân A"
- "Gợi ý các xét nghiệm cần làm cho bệnh nhân bị đau ngực"
- "Tư vấn về thuốc điều trị huyết áp cao"

## Tính năng nổi bật

### 💡 Context-Aware Intelligence

AI hiểu context của người dùng:
- Tên, tuổi, giới tính
- Lịch sử khám bệnh
- Lịch hẹn sắp tới
- Danh sách bác sĩ có sẵn

### 🎯 Gợi ý Bác sĩ Thông minh

Khi bạn mô tả triệu chứng, AI sẽ:
1. Phân tích mức độ nghiêm trọng
2. Xác định chuyên khoa phù hợp
3. Gợi ý bác sĩ cụ thể trong hệ thống
4. Khuyên đặt lịch nếu cần thiết

### 📊 Phân tích Hồ sơ Bệnh án

AI có thể:
- Tổng hợp lịch sử điều trị
- Phát hiện patterns trong bệnh án
- Đưa ra insights về sức khỏe
- Gợi ý theo dõi định kỳ

### 🚀 Giao diện Thân thiện

- Typing indicator khi AI đang suy nghĩ
- Quick questions để bắt đầu nhanh
- Responsive trên mọi thiết bị
- Gradient màu đẹp mắt
- Animation mượt mà

## Ví dụ Conversations

### Ví dụ 1: Tư vấn triệu chứng

**Bệnh nhân:** "Tôi bị đau đầu và chóng mặt 3 ngày nay"

**AI Assistant:** 
> 🏥 Dựa trên triệu chứng của bạn, tôi khuyên bạn nên:
> 
> **Mức độ:** Trung bình - Nên được khám sớm
> 
> **Chuyên khoa phù hợp:** Tim mạch hoặc Thần kinh
> 
> **Bác sĩ gợi ý:**
> - BS. Lê Văn C - Chuyên khoa Tim mạch
>   (Có kinh nghiệm điều trị chóng mặt liên quan tim mạch)
> 
> 💡 **Khuyến nghị:** Đặt lịch khám trong 1-2 ngày tới
> 
> ⚠️ Lưu ý: Thông tin chỉ mang tính tham khảo

### Ví dụ 2: Phân tích hồ sơ

**Bệnh nhân:** "Phân tích hồ sơ bệnh án của tôi"

**AI Assistant:**
> 📋 **Tổng hợp hồ sơ bệnh án của Nguyễn Văn A**
> 
> **Lịch sử khám gần đây:**
> - 16/12/2025: Chẩn đoán huyết áp cao
>   Điều trị: Thuốc hạ huyết áp, tái khám sau 1 tháng
> 
> **Insights:**
> ✅ Bạn đã tuân thủ điều trị tốt
> 💊 Cần theo dõi huyết áp định kỳ
> 📅 Lịch tái khám sắp tới: 16/01/2026
> 
> 🎯 **Khuyến nghị:**
> - Đo huyết áp hàng ngày
> - Chế độ ăn ít muối
> - Vận động nhẹ nhàng

## Giới hạn và Disclaimer

⚠️ **QUAN TRỌNG:**

- AI Assistant chỉ cung cấp thông tin tham khảo
- **KHÔNG** thay thế ý kiến bác sĩ
- **KHÔNG** tự ý chẩn đoán hoặc kê đơn thuốc
- Với triệu chứng nghiêm trọng, hãy đến bệnh viện ngay

## API Endpoints

### POST /api/ai-chat

Request body:
```json
{
  "message": "Câu hỏi của người dùng",
  "context": {
    "userName": "Nguyễn Văn A",
    "userAge": 35,
    "userGender": "Nam",
    "doctors": [...],
    "medicalHistory": [...],
    "upcomingAppointments": [...]
  }
}
```

Response:
```json
{
  "success": true,
  "response": "Câu trả lời từ AI",
  "timestamp": "2025-12-20T10:00:00.000Z"
}
```

## Troubleshooting

### Lỗi: "Failed to generate AI response"

**Nguyên nhân:** 
- API key không hợp lệ
- Hết quota miễn phí
- Network error

**Giải pháp:**
1. Kiểm tra API key trong `.env.local`
2. Xem quota tại [Google AI Studio](https://makersuite.google.com/)
3. Kiểm tra kết nối internet

### AI trả lời không chính xác

**Nguyên nhân:** 
- Câu hỏi không rõ ràng
- Thiếu context

**Giải pháp:**
- Mô tả triệu chứng chi tiết hơn
- Cung cấp thêm thông tin
- Hỏi câu hỏi cụ thể

### Chatbot không hiển thị

**Kiểm tra:**
1. Console browser có lỗi?
2. File AIChatbot.js đã import đúng?
3. Component đã được thêm vào dashboard?

## Nâng cấp trong tương lai

🚀 **Planned features:**
- [ ] Voice input (nhập bằng giọng nói)
- [ ] Multi-language support
- [ ] Image analysis (phân tích ảnh y tế)
- [ ] Export conversation history
- [ ] Personalized health tips
- [ ] Integration với wearable devices

## Đóng góp

Nếu bạn có ý tưởng cải thiện AI Assistant, hãy:
1. Fork repository
2. Tạo branch mới
3. Implement feature
4. Submit pull request

## License

MIT License - Tự do sử dụng và chỉnh sửa

---

💡 **Tips:** 
- Sử dụng câu hỏi gợi ý để bắt đầu
- Hỏi chi tiết để nhận câu trả lời chính xác hơn
- AI sẽ thông minh hơn khi có đầy đủ thông tin cá nhân

🎉 **Happy chatting with AI Medical Assistant!**
