# 🏥 Hệ Thống Quản Lý Lịch Hẹn Y Tế

Ứng dụng web quản lý lịch hẹn giữa bệnh nhân và bác sĩ với đầy đủ tính năng từ đặt lịch, xác nhận, khám bệnh đến ghi hồ sơ bệnh án. Xây dựng bằng Next.js 15 và Supabase PostgreSQL.

## ✨ Điểm nổi bật

- 🎨 **Giao diện hiện đại** với Tailwind CSS, gradient, animations
- 📱 **Responsive design** hoạt động mượt trên mọi thiết bị
- ⚡ **Real-time data** từ Supabase PostgreSQL
- 🔐 **Phân quyền rõ ràng** giữa bệnh nhân và bác sĩ
- 📋 **Quản lý đầy đủ** từ đặt lịch đến hồ sơ bệnh án
- 🎯 **UX tối ưu** với loading states, validations, animations
- 🤖 **AI Medical Assistant** - Trợ lý y tế thông minh với Google Gemini
- 💬 **Real-time Chat** - Tin nhắn trực tiếp giữa bệnh nhân và bác sĩ

## 🚀 Công nghệ sử dụng

- **Next.js 15** - React Framework với App Router
- **JavaScript** - ES6+, không dùng TypeScript
- **Tailwind CSS v4** - Utility-first CSS với custom animations
- **Supabase** - PostgreSQL database, REST API, Realtime
- **Google Gemini AI** - AI Assistant thông minh
- **localStorage** - Quản lý authentication state (học tập)

## 📋 Các bước cài đặt

### 1. Clone và cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình Supabase & Google Gemini AI

Tạo file `.env.local` trong thư mục root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI (cho AI Medical Assistant)
GEMINI_API_KEY=your_gemini_api_key
```

**Lấy Gemini API Key:**
1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập và tạo API key
3. Copy key vào `.env.local`

📖 **Chi tiết cấu hình AI:** Xem file [AI_CHATBOT_README.md](./AI_CHATBOT_README.md)

### 3. Tạo database schema

Vào Supabase Dashboard → SQL Editor, copy toàn bộ nội dung file `database/schema.sql` và chạy.

File này sẽ tạo:
- 6 bảng: users, patients, doctors, appointments, working_schedules, medical_records
- Dữ liệu mẫu để test

### 4. Chạy ứng dụng

```bash
npm run dev
```

Truy cập: http://localhost:3000

## 👥 Tài khoản test

### Bệnh nhân:
- Email: `patient1@test.com` / Password: `password1`
- Email: `patient2@test.com` / Password: `password2`
- ✅ 💬 Chat trực tiếp với bác sĩ (real-time)
- ✅ 🤖 AI Medical Assistant - Tư vấn sức khỏe thông minh

### 👨‍⚕️ Bác sĩ (Doctor):
- ✅ Đăng ký/Đăng nhập
- ✅ Xem và cập nhật thông tin cá nhân
- ✅ Quản lý lịch làm việc (CRUD - Thêm/Sửa/Xóa)
- ✅ Xem danh sách lịch hẹn
- ✅ Xác nhận/Từ chối lịch hẹn
- ✅ Ghi hồ sơ bệnh án (chẩn đoán + điều trị)
- ✅ Chỉnh sửa hồ sơ bệnh án đã tạo
- ✅ Tự động chuyển trạng thái lịch hẹn thành "completed"
- ✅ 💬 Chat trực tiếp với bệnh nhân (real-time)
- ✅ 🤖 AI Assistant - Hỗ trợ phân tích hồ sơ bệnh án

### 🤖 AI Medical Assistant (MỚI!):
- ✅ Tư vấn về triệu chứng sức khỏe
- ✅ Gợi ý bác sĩ phù hợp dựa trên triệu chứng
- ✅ Phân tích lịch sử khám bệnh
- ✅ Context-aware (hiểu thông tin cá nhân)
- ✅ Hướng dẫn chuẩn bị trước khám
- ✅ Giải đáp thắc mắc 24/7
- ✅ Quick questions để bắt đầu nhanh
- ✅ Typing indicator chuyên nghiệp
- ✅ Xem danh sách bác sĩ theo chuyên khoa
- ✅ Đặt lịch hẹn mới với validation đầy đủ
- ✅ Xem danh sách lịch hẹn của mình
- ✅ Hủy lịch hẹn (chỉ lịch pending/confirmed)
- ✅ Xem hồ sơ bệnh án và lịch sử khám bệnh
- ✅ Xem chi tiết chẩn đoán và điều trị

### 👨‍⚕️ Bác sĩ (Doctor):
- ✅ Đăng ký/Đăng nhập
- ✅ Xem và cập nhật thông tin cá nhân
- ✅ Quản lý lịch làm việc (CRUD - Thêm/Sửa/Xóa)
- ✅ Xem danh sách lịch hẹn
- ✅ Xác nhận/Từ chối lịch hẹn
- ✅ Ghi hồ sơ bệnh án (chẩn đoán + điều trị)
- ✅ Chỉnh sửa hồ sơ bệnh án đã tạo
- ✅ Tự động chuyển trạng thái lịch hẹn thành "completed"

## 🗂️ Cấu trúc thư mục

```
appointment/
├── app/
│   ├── globals.css              # Custom CSS + Tailwind + Animations
│   ├── layout.js                # Root layout
│   ├── page.js                  # Home page (redirect to login)
│   ├── login/
│   │   └── page.js              # Đăng nhập/Đăng ký
│   ├── patient/
│   │   ├── dashboard/
│   │   │   └── page.js          # Dashboard bệnh nhân
│   │   ├── book-appointment/
│   │   │   └── page.js          # Đặt lịch hẹn
│   │   ├── medical-records/
│   │   │   └── page.js          # Xem hồ sơ bệnh án
│   │   └── profile/
│   │       └── page.js          # Cập nhật thông tin
│   └── doctor/
│       ├── dashboard/
│       │   └── page.js          # Dashboard bác sĩ
│       ├── schedule/
│       │   └── page.js          # Quản lý lịch làm việc
│       ├── medical-records/
│       │   └── page.js          # Ghi hồ sơ bệnh án
│       └── profile/
│           └── page.js          # Cập nhật thông tin
├── utils/
│   └── supabase.js              # Supabase client config
├── database/
│   └── schema.sql               # Database schema + sample data
├── .env.local                   # Environment variables
├── package.json
├── next.config.mjs
└── tailwind.config.js
```

## 📊 Database Schema

### Bảng dữ liệu (6 tables):

1. **users** - Tài khoản người dùng (email, password, role)
2. **patients** - Thông tin bệnh nhân (full_name, gender, DOB, phone, address)
3. **doctors** - Thông tin bác sĩ (full_name, specialty, phone, description)
4. **appointments** - Lịch hẹn (date, time, status, note)
5. **working_schedules** - Lịch làm việc bác sĩ (work_date, start_time, end_time)
6. **medical_records** - Hồ sơ bệnh án (diagnosis, treatment)

### ENUM Types:
- `user_role`: 'patient', 'doctor'
- `appointment_status`: 'pending', 'confirmed', 'cancelled', 'completed'

### Relationships:
- `users` 1:1 `patients`/`doctors`
- `doctors` 1:N `working_schedules`
- `patients` 1:N `appointments`
- `doctors` 1:N `appointments`
- `appointments` 1:1 `medical_records`

Xem chi tiết schema trong file [database/schema.sql](database/schema.sql)

## ⚠️ Lưu ý

- **⚠️ CHỈ DÙNG CHO HỌC TẬP**: 
  - Mật khẩu lưu **plain text**, không hash
  - Authentication đơn giản qua localStorage
  - Không có email verification
  
- **🚫 KHÔNG DEPLOY PRODUCTION**: 
  - Không bảo mật cho môi trường thực tế
  - Cần implement JWT, bcrypt, session management
  
- **✅ Dữ liệu mẫu**: 
  - Đã tạo sẵn 4 tài khoản test (2 patient, 2 doctor)
  - Có lịch hẹn và lịch làm việc mẫu

## 🎨 UI/UX Features

- ✨ **Custom animations**: fadeIn, slideIn, shake, pulse
- 🌈 **Gradient designs**: Buttons, headers, cards
- 🎯 **Interactive elements**: Hover effects, transforms
- 📱 **Responsive**: Mobile-first design
- ⚡ **Loading states**: Spinners cho async operations
- ✅ **Validation**: Form validation với error messages
- 🎭 **Status badges**: Color-coded appointment statuses

## 🔜 Tính năng nâng cao (Future roadmap)

- [ ] 🔐 JWT authentication + bcrypt password hashing
- [ ] 📧 Email notifications khi có lịch hẹn mới
- [ ] 📊 Dashboard với charts và thống kê
- [ ] 🔍 Search và filter lịch hẹn
- [ ] 📅 Calendar view cho lịch hẹn
- [ ] 💬 Real-time chat giữa bác sĩ và bệnh nhân
- [ ] 📄 Export PDF cho hồ sơ bệnh án
- [ ] 🌐 Multi-language support (EN/VI)
- [ ] 📸 Upload ảnh profile
- [ ] ⭐ Rating và review bác sĩ

## 📄 License

MIT License - Dự án học tập tại VKU (Đại học Công nghệ Vinh)

---

## 💡 Tips

### Chạy development mode:
```bash
npm run dev
```

### Build production (chỉ để test, không deploy):
```bash
npm run build
npm start
```

### Kiểm tra Supabase connection:
Vào http://localhost:3000/login và thử đăng nhập bằng tài khoản test

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
