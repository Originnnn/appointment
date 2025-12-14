# Hệ Thống Quản Lý Lịch Hẹn Y Tế

Ứng dụng web đơn giản để quản lý lịch hẹn giữa bệnh nhân và bác sĩ, sử dụng Next.js và Supabase.

## 🚀 Công nghệ sử dụng

- **Next.js 15** (App Router)
- **JavaScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL)

## 📋 Các bước cài đặt

### 1. Clone và cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình Supabase

File `.env.local` đã được tạo sẵn với thông tin kết nối Supabase.

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

### Bác sĩ:
- Email: `doctor1@test.com` / Password: `password1`
- Email: `doctor2@test.com` / Password: `password2`

## 📱 Chức năng

### Bệnh nhân:
- ✅ Đăng ký/Đăng nhập
- ✅ Xem thông tin cá nhân
- ✅ Xem danh sách bác sĩ
- ✅ Xem lịch hẹn của mình
- 🔄 Đặt lịch hẹn mới (coming soon)
- 🔄 Hủy lịch hẹn (coming soon)

### Bác sĩ:
- ✅ Đăng ký/Đăng nhập
- ✅ Xem thông tin cá nhân
- ✅ Xem lịch làm việc
- ✅ Xem danh sách lịch hẹn
- ✅ Xác nhận/Từ chối lịch hẹn
- 🔄 Thêm lịch làm việc (coming soon)
- 🔄 Ghi hồ sơ bệnh án (coming soon)

## 🗂️ Cấu trúc thư mục

```
appointment/
├── app/
│   ├── login/
│   │   └── page.js          # Trang đăng nhập/đăng ký
│   ├── patient/
│   │   └── dashboard/
│   │       └── page.js      # Dashboard bệnh nhân
│   ├── doctor/
│   │   └── dashboard/
│   │       └── page.js      # Dashboard bác sĩ
│   └── page.js              # Trang chủ (redirect to login)
├── utils/
│   └── supabase.js          # Supabase client config
├── database/
│   └── schema.sql           # Database schema & sample data
└── .env.local               # Environment variables
```

## 📊 Database Schema

Xem sơ đồ database đầy đủ trong file `database/schema.sql`

## ⚠️ Lưu ý

- **CHỈ DÙNG CHO HỌC TẬP**: Mật khẩu lưu plain text, không hash
- **KHÔNG DEPLOY PRODUCTION**: Không bảo mật cho môi trường thực tế
- Dữ liệu mẫu đã được tạo sẵn để test

## 🔜 Tính năng sắp tới

- [ ] Trang đặt lịch hẹn cho bệnh nhân
- [ ] Chức năng hủy lịch hẹn
- [ ] Quản lý lịch làm việc cho bác sĩ
- [ ] Ghi hồ sơ bệnh án
- [ ] Cập nhật thông tin cá nhân
- [ ] Thống kê và báo cáo

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
