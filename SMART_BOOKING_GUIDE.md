# 🎯 HƯỚNG DẪN SỬ DỤNG: HỆ THỐNG ĐẶT LỊCH THÔNG MINH

## 📋 Tổng quan

Hệ thống **Smart Booking** cho phép:
- ✅ Xem lịch làm việc của bác sĩ dạng bảng (7 ngày tới)
- ✅ Lọc theo chi nhánh bệnh viện và chuyên khoa
- ✅ Tự động gợi ý bác sĩ thay thế khi bác sĩ bận
- ✅ Tìm kiếm trong toàn hệ thống chi nhánh

---

## 🚀 CÀI ĐẶT

### Bước 1: Chạy database migration

Vào **Supabase SQL Editor** và chạy file `multi_branch_schema.sql`:

```sql
-- File này đã tạo sẵn, copy toàn bộ nội dung vào SQL Editor và Execute
```

### Bước 2: Kiểm tra dữ liệu

```sql
-- Kiểm tra chi nhánh
SELECT * FROM branches;

-- Kiểm tra bác sĩ
SELECT d.*, b.branch_name 
FROM doctors d
LEFT JOIN branches b ON d.branch_id = b.branch_id;

-- Kiểm tra lịch làm việc
SELECT 
    d.full_name,
    da.date,
    da.time_slot,
    da.is_available,
    b.branch_name
FROM doctor_availability da
JOIN doctors d ON da.doctor_id = d.doctor_id
JOIN branches b ON d.branch_id = b.branch_id
ORDER BY da.date, da.time_slot;
```

---

## 📊 COMPONENTS ĐÃ TẠO

### 1. **DoctorAvailabilityTable.js**

Component hiển thị lịch làm việc dạng bảng:

**Props:**
- `selectedBranch` (optional): ID chi nhánh mặc định
- `selectedSpecialty` (optional): Chuyên khoa mặc định
- `onDoctorTimeSelect`: Callback khi user click vào time slot

**Features:**
- 📅 Hiển thị lịch 7 ngày tới (horizontal scroll)
- 🏥 Filter chi nhánh (group theo thành phố)
- 🩺 Filter chuyên khoa
- ✅ Status: Rảnh (green), Bận (red), Chưa có lịch (gray)
- 🔄 Realtime update từ Supabase

**Usage:**
```jsx
<DoctorAvailabilityTable 
  onDoctorTimeSelect={(slotData) => {
    // slotData = { doctor, date, time, isAvailable }
    console.log('Selected:', slotData);
  }}
/>
```

### 2. **SmartBookingAssistant.js**

Component xử lý logic đặt lịch thông minh:

**Props:**
- `selectedSlot`: Object chứa { doctor, date, time, isAvailable }
- `onConfirmBooking`: Callback khi confirm đặt lịch
- `onClose`: Callback đóng modal

**Features:**
- 🔍 Double-check availability với API
- 🤖 Tự động show alternatives nếu bác sĩ bận
- ⚡ Loading states
- 🎨 Beautiful UI với gradient

**Workflow:**
1. User click vào slot → SmartBookingAssistant hiện lên
2. Nếu slot màu đỏ (bận) → Tự động show alternatives
3. Nếu slot màu xanh (rảnh) → Double-check với API:
   - Còn rảnh → Confirm đặt lịch
   - Bận rồi → Show alternatives

**Usage:**
```jsx
{selectedSlot && (
  <SmartBookingAssistant
    selectedSlot={selectedSlot}
    onConfirmBooking={(doctor, date, time) => {
      // Xử lý đặt lịch
    }}
    onClose={() => setSelectedSlot(null)}
  />
)}
```

### 3. **AlternativeDoctorSuggestions.js**

Component hiển thị danh sách bác sĩ thay thế:

**Props:**
- `originalDoctor`: Bác sĩ ban đầu (đã bận)
- `specialty`: Chuyên khoa cần tìm
- `selectedDate`: Ngày khám
- `selectedTime`: Giờ khám
- `onSelectDoctor`: Callback khi chọn bác sĩ thay thế

**Features:**
- 📊 Statistics dashboard (same branch, same city, other cities)
- 🏆 Priority badges
- ⭐ Rating & experience display
- 🗺️ Branch location info

---

## 🎯 TRANG SMART BOOKING (/patient/smart-booking)

Trang hoàn chỉnh đã tích hợp tất cả components:

**URL:** `http://localhost:3001/patient/smart-booking`

**Features:**
- Header với role "patient"
- Feature cards giới thiệu
- DoctorAvailabilityTable component
- SmartBookingAssistant popup
- Loading overlay khi đang đặt lịch
- Auto redirect to dashboard sau khi đặt lịch thành công

**Flow hoàn chỉnh:**

```
1. User vào /patient/smart-booking
   ↓
2. Chọn filter (chi nhánh, chuyên khoa) hoặc xem tất cả
   ↓
3. Xem bảng lịch 7 ngày
   ↓
4. Click vào slot màu xanh (rảnh) hoặc đỏ (bận)
   ↓
5. SmartBookingAssistant popup hiện lên
   ↓
6a. Nếu slot xanh:
    - Double-check API
    - Nếu OK → Confirm → Success
    - Nếu bận rồi → Show alternatives
   ↓
6b. Nếu slot đỏ:
    - Tự động show alternatives ngay
   ↓
7. User chọn bác sĩ thay thế (nếu có)
   ↓
8. Confirm đặt lịch → Success toast → Redirect dashboard
```

---

## 🔗 TÍCH HỢP VÀO NAVIGATION

### Thêm link vào DashboardHeader:

Mở file [components/ui/DashboardHeader.js](components/ui/DashboardHeader.js#L1-L50) và thêm:

```jsx
// Trong navigation links cho patient
{
  name: 'Đặt lịch thông minh',
  href: '/patient/smart-booking',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}
```

### Thêm card vào Patient Dashboard:

Mở file [app/patient/dashboard/page.js](app/patient/dashboard/page.js#L1) và thêm:

```jsx
<Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/patient/smart-booking')}>
  <div className="flex items-start space-x-4">
    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-900">Đặt lịch thông minh</h3>
      <p className="text-gray-600 text-sm mt-1">Xem lịch bác sĩ, tìm thay thế tự động</p>
      <div className="mt-3 flex items-center space-x-2 text-purple-600 font-medium text-sm">
        <span>Khám phá ngay</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </div>
</Card>
```

---

## 🧪 TEST HỆ THỐNG

### Test Case 1: Xem lịch làm việc

1. Vào `http://localhost:3001/patient/smart-booking`
2. Không chọn filter → Thấy tất cả bác sĩ
3. Chọn filter chi nhánh → Chỉ thấy bác sĩ ở chi nhánh đó
4. Chọn filter chuyên khoa → Chỉ thấy bác sĩ chuyên khoa đó
5. Xem bảng 7 ngày, scroll ngang nếu mobile

**Expected:**
- ✅ Slot xanh: Bác sĩ rảnh
- ✅ Slot đỏ: Bác sĩ bận
- ✅ Slot gray: Chưa có lịch

### Test Case 2: Đặt lịch với bác sĩ rảnh

1. Click vào slot màu xanh
2. SmartBookingAssistant popup hiện lên
3. Xem thông tin bác sĩ, ngày, giờ
4. Click "Xác nhận đặt lịch"
5. Loading spinner → Success toast
6. Auto redirect to dashboard

**Expected:**
- ✅ Appointment tạo thành công
- ✅ Slot chuyển sang màu đỏ (bận)
- ✅ Hiện trong danh sách appointments

### Test Case 3: Đặt lịch với bác sĩ bận (alternatives)

1. Click vào slot màu đỏ
2. SmartBookingAssistant hiện warning "Bác sĩ đã có lịch hẹn"
3. Click "Tìm bác sĩ thay thế"
4. AlternativeDoctorSuggestions hiện lên
5. Xem statistics (same branch, same city, other)
6. Chọn bác sĩ thay thế
7. Confirm → Success

**Expected:**
- ✅ Tìm được bác sĩ thay thế cùng chuyên khoa
- ✅ Ưu tiên: cùng chi nhánh > cùng thành phố > tỉnh khác
- ✅ Sort theo rating & experience

### Test Case 4: Không có bác sĩ thay thế

1. Tạo scenario: Tất cả bác sĩ Tim mạch bận vào 09:00 ngày mai
2. Click vào slot → Tìm alternatives
3. Không thấy kết quả

**Expected:**
- ✅ Hiển thị message "Không tìm thấy bác sĩ thay thế"
- ✅ Gợi ý chọn giờ khác hoặc ngày khác

---

## 📊 QUẢN LÝ DỮ LIỆU

### Thêm chi nhánh mới:

```sql
INSERT INTO branches (branch_name, address, city, district, phone, latitude, longitude)
VALUES (
    'Chi nhánh Đà Nẵng',
    '123 Đường 2/9, Hải Châu',
    'Đà Nẵng',
    'Hải Châu',
    '0236123456',
    16.0544,
    108.2022
);
```

### Thêm bác sĩ mới:

```sql
-- 1. Tạo user
INSERT INTO users (email, password_hash, role)
VALUES ('doctor7@test.com', 'password7', 'doctor');

-- 2. Tạo doctor
INSERT INTO doctors (user_id, full_name, specialty, phone, branch_id, years_of_experience, rating, total_reviews)
VALUES (
    (SELECT user_id FROM users WHERE email = 'doctor7@test.com'),
    'BS. Nguyễn Văn I',
    'Da liễu',
    '0666777888',
    1,  -- branch_id
    6,
    4.8,
    29
);
```

### Thêm lịch làm việc:

```sql
-- Thêm lịch cho bác sĩ ID 1, ngày mai, 9:00-11:00
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available)
VALUES
(1, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(1, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true),
(1, CURRENT_DATE + INTERVAL '1 day', '11:00:00', true);
```

### Xem thống kê conflicts:

```sql
-- Xem các lần conflict
SELECT 
    ac.*,
    p.full_name AS patient_name,
    d.full_name AS doctor_name,
    b.branch_name
FROM appointment_conflicts ac
JOIN patients p ON ac.patient_id = p.patient_id
JOIN doctors d ON ac.requested_doctor_id = d.doctor_id
JOIN branches b ON ac.branch_id = b.branch_id
ORDER BY ac.created_at DESC;
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Không load được chi nhánh"

**Nguyên nhân:** Chưa chạy migration

**Giải pháp:**
```sql
-- Kiểm tra bảng branches
SELECT * FROM branches;

-- Nếu lỗi "table does not exist"
-- → Chạy lại file multi_branch_schema.sql
```

### Lỗi: "API /api/doctor-availability trả về 500"

**Nguyên nhân:** Supabase credentials sai

**Giải pháp:**
```bash
# Kiểm tra .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Restart server
npm run dev
```

### Lỗi: "Không thấy alternatives"

**Nguyên nhân:** Không có dữ liệu doctor_availability

**Giải pháp:**
```sql
-- Thêm dữ liệu mẫu
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available)
SELECT 
    d.doctor_id,
    CURRENT_DATE + INTERVAL '1 day',
    time_slot,
    true
FROM doctors d
CROSS JOIN (
    VALUES ('09:00:00'::TIME), ('10:00:00'::TIME), 
           ('14:00:00'::TIME), ('15:00:00'::TIME)
) AS times(time_slot);
```

### Lỗi: "Table quá rộng, không scroll được"

**Nguyên nhân:** Mobile responsive issue

**Giải pháp:** Đã có `overflow-x-auto` trong table wrapper. Clear browser cache.

---

## 🎨 CUSTOMIZATION

### Thay đổi số ngày hiển thị:

Trong [components/DoctorAvailabilityTable.js](components/DoctorAvailabilityTable.js#L23-L29):

```jsx
// Đổi từ 7 ngày sang 14 ngày
for (let i = 0; i < 14; i++) {  // Thay 7 → 14
  const date = new Date();
  date.setDate(date.getDate() + i);
  dates.push(date.toISOString().split('T')[0]);
}
```

### Thay đổi time slots:

Trong [components/DoctorAvailabilityTable.js](components/DoctorAvailabilityTable.js#L103-L108):

```jsx
const getTimeSlots = () => {
  return [
    '08:00:00', '08:30:00', '09:00:00', '09:30:00',  // Thêm 30 phút
    '10:00:00', '10:30:00', '11:00:00', '11:30:00',
    // ...
  ];
};
```

### Thay đổi màu sắc:

```jsx
// Slot available (xanh lá)
bg-green-100 text-green-700 → bg-blue-100 text-blue-700

// Slot busy (đỏ)
bg-red-100 text-red-700 → bg-orange-100 text-orange-700
```

---

## 📈 NEXT STEPS

### Tính năng nâng cao có thể thêm:

1. **📧 Email notifications** khi đặt lịch thành công
2. **🔔 SMS reminders** trước 1 ngày
3. **📊 Analytics dashboard** cho admin
4. **⭐ Rating system** sau khi khám
5. **💬 Chat trực tiếp** với bác sĩ
6. **🗺️ Map integration** xem đường đi đến chi nhánh
7. **📱 Mobile app** với React Native
8. **🔄 Auto-refresh** lịch làm việc mỗi 30s
9. **🎯 AI recommendations** bác sĩ phù hợp nhất
10. **📸 Upload medical images** trước khi khám

---

## ✅ CHECKLIST

- [x] Database schema với multi-branch
- [x] API endpoints (doctor-availability)
- [x] DoctorAvailabilityTable component
- [x] SmartBookingAssistant component
- [x] AlternativeDoctorSuggestions component
- [x] Smart Booking page (/patient/smart-booking)
- [x] Integration với existing system
- [x] Error handling & loading states
- [x] Mobile responsive
- [x] Documentation

---

## 🎉 KẾT LUẬN

Hệ thống **Smart Booking** giờ đã hoàn chỉnh với:

✅ Giao diện bảng xem lịch làm việc  
✅ Filter theo chi nhánh & chuyên khoa  
✅ Gợi ý bác sĩ thay thế thông minh  
✅ Tìm kiếm toàn hệ thống chi nhánh  
✅ UI/UX đẹp với gradient & animations  

**URL:** `http://localhost:3001/patient/smart-booking`

Chúc bạn thành công! 🚀
