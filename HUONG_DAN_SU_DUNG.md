# 📘 HƯỚNG DẪN SỬ DỤNG - Multi-Branch Doctor Availability System

## 🎯 Mục đích
Khi bệnh nhân đặt lịch với bác sĩ nhưng bác sĩ đã bận, hệ thống tự động tìm và gợi ý các bác sĩ thay thế cùng chuyên khoa ở các chi nhánh khác.

---

## 📋 PHẦN 1: SETUP DATABASE

### Bước 1: Truy cập Supabase Dashboard

1. Mở trình duyệt, vào: https://supabase.com
2. Đăng nhập vào project của bạn
3. Chọn project **appointment_app**

### Bước 2: Chạy SQL Schema

1. Click vào **SQL Editor** ở sidebar trái
2. Click nút **New query**
3. Mở file `database/multi_branch_schema.sql` trong VS Code
4. **Copy TOÀN BỘ nội dung** (289 dòng)
5. **Paste** vào SQL Editor của Supabase
6. Click nút **Run** (hoặc Ctrl+Enter)

### Bước 3: Kiểm tra kết quả

Sau khi chạy SQL, kiểm tra:

```sql
-- Xem danh sách chi nhánh
SELECT * FROM branches;

-- Xem bác sĩ với chi nhánh
SELECT d.full_name, d.specialty, b.branch_name, b.city 
FROM doctors d 
LEFT JOIN branches b ON d.branch_id = b.branch_id;

-- Xem doctor availability
SELECT * FROM doctor_availability;
```

Bạn sẽ thấy:
- ✅ 5 chi nhánh (Q1, Q3, Thủ Đức, HN Đống Đa, HN Cầu Giấy)
- ✅ 6 bác sĩ (2 cũ + 4 mới)
- ✅ Lịch availability cho 3 ngày tới

---

## 📋 PHẦN 2: TEST API

### Bước 1: Khởi động server

```bash
npm run dev
```

Server chạy tại: http://localhost:3001

### Bước 2: Test Health Check

Mở browser hoặc dùng PowerShell:

```powershell
# PowerShell
curl http://localhost:3001/api/doctor-availability
```

Kết quả mong đợi:
```json
{
  "success": true,
  "message": "Doctor Availability Service"
}
```

### Bước 3: Test GET - Kiểm tra 1 bác sĩ có rảnh không

```powershell
# Kiểm tra BS. Lê Văn C (doctor_id=1) vào ngày mai 9h
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
curl "http://localhost:3001/api/doctor-availability?doctorId=1&date=$tomorrow&time=09:00:00"
```

Kết quả:
```json
{
  "success": true,
  "doctor_id": 1,
  "is_available": true,
  "is_busy": false,
  "appointments_count": 0
}
```

### Bước 4: Test POST - Tìm bác sĩ thay thế

```powershell
# Tạo request body
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$body = @{
    specialty = "Tim mạch"
    date = $tomorrow
    time = "09:00:00"
    currentBranchId = 1
    currentDoctorId = 1
} | ConvertTo-Json

# Gửi request
Invoke-RestMethod -Uri "http://localhost:3001/api/doctor-availability" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

Kết quả mong đợi:
```json
{
  "success": true,
  "total_alternatives": 2,
  "statistics": {
    "same_branch": 0,
    "same_city": 1,
    "other_cities": 1
  },
  "recommendations": [
    {
      "doctor_id": 3,
      "full_name": "BS. Nguyễn Thị E",
      "specialty": "Tim mạch",
      "branch_id": 2,
      "branches": {
        "branch_name": "Chi nhánh Quận 3",
        "city": "TP.HCM"
      },
      "rating": 4.9,
      "years_of_experience": 12,
      "distance_priority": 1,
      "priority_label": "Cùng thành phố"
    }
  ]
}
```

---

## 📋 PHẦN 3: TÍCH HỢP VÀO UI

### Bước 1: Import Component

Mở file `app/patient/book-appointment/page.js`:

```javascript
import AlternativeDoctorSuggestions from '@/components/AlternativeDoctorSuggestions';
import Modal from '@/components/ui/Modal';
```

### Bước 2: Thêm State

```javascript
const [showAlternatives, setShowAlternatives] = useState(false);
const [conflictInfo, setConflictInfo] = useState(null);
```

### Bước 3: Thêm Function Check Availability

```javascript
const checkDoctorAvailability = async (doctor, date, time) => {
  try {
    // Kiểm tra bác sĩ có rảnh không
    const response = await fetch(
      `/api/doctor-availability?doctorId=${doctor.doctor_id}&date=${date}&time=${time}`
    );
    
    const data = await response.json();
    
    if (data.is_busy) {
      // Bác sĩ bận - hiển thị alternatives
      setConflictInfo({
        doctor: doctor,
        date: date,
        time: time
      });
      setShowAlternatives(true);
      return false; // Không cho đặt lịch
    }
    
    return true; // OK, cho đặt lịch
  } catch (error) {
    console.error('Error checking availability:', error);
    return true; // Nếu lỗi, vẫn cho đặt
  }
};
```

### Bước 4: Sửa Handle Book Appointment

```javascript
const handleBookAppointment = async (e) => {
  e.preventDefault();
  
  // Kiểm tra availability trước
  const isAvailable = await checkDoctorAvailability(
    selectedDoctor,
    appointmentDate,
    appointmentTime
  );
  
  if (!isAvailable) {
    // Dừng lại, show alternatives
    return;
  }
  
  // Tiếp tục đặt lịch như bình thường...
  // ... existing booking code ...
};
```

### Bước 5: Render Component

Thêm vào JSX return:

```javascript
return (
  <div>
    {/* ... existing booking form ... */}
    
    {/* Modal hiển thị alternatives */}
    {showAlternatives && conflictInfo && (
      <Modal 
        isOpen={showAlternatives}
        onClose={() => setShowAlternatives(false)}
        title="Bác sĩ đã có lịch hẹn"
      >
        <AlternativeDoctorSuggestions
          originalDoctor={conflictInfo.doctor}
          specialty={conflictInfo.doctor.specialty}
          selectedDate={conflictInfo.date}
          selectedTime={conflictInfo.time}
          onSelectDoctor={(altDoctor) => {
            // User chọn bác sĩ thay thế
            setSelectedDoctor(altDoctor);
            setShowAlternatives(false);
            // Có thể tự động submit form
          }}
          onClose={() => setShowAlternatives(false)}
        />
      </Modal>
    )}
  </div>
);
```

### Bước 6: Tạo Modal Component (nếu chưa có)

Tạo file `components/ui/Modal.js`:

```javascript
'use client';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## 📋 PHẦN 4: DEMO THỰC TẾ

### Scenario 1: Bác sĩ bận

1. **Login** vào tài khoản patient1@test.com
2. Vào **Đặt lịch khám**
3. Chọn:
   - Bác sĩ: **BS. Lê Văn C** (Tim mạch)
   - Ngày: **Ngày mai**
   - Giờ: **09:00**
4. Click **Đặt lịch**

**Kết quả:**
- ❌ Hệ thống phát hiện bác sĩ đã có lịch
- ✅ Hiện modal với **2 bác sĩ thay thế**:
  - BS. Nguyễn Thị E (Q3 - cùng TP.HCM)
  - BS. Lê Thị G (Hà Nội)

### Scenario 2: Chọn bác sĩ thay thế

1. Xem thông tin bác sĩ:
   - Rating: ⭐ 4.9
   - Kinh nghiệm: 12 năm
   - Chi nhánh: Quận 3
   - Badge: "Cùng thành phố"

2. Click **"Chọn bác sĩ này"**

**Kết quả:**
- ✅ Form tự động điền thông tin bác sĩ mới
- ✅ Có thể đặt lịch thành công

---

## 📋 PHẦN 5: QUẢN LÝ DỮ LIỆU

### Thêm Chi nhánh mới

```sql
INSERT INTO branches (branch_name, address, city, district, phone) 
VALUES ('Chi nhánh Quận 7', '123 Nguyễn Văn Linh', 'TP.HCM', 'Quận 7', '0281111111');
```

### Thêm Bác sĩ mới

```sql
-- 1. Tạo user
INSERT INTO users (email, password_hash, role) 
VALUES ('doctor7@test.com', 'password7', 'doctor');

-- 2. Tạo doctor
INSERT INTO doctors (user_id, full_name, specialty, phone, branch_id, years_of_experience, rating) 
VALUES (
  (SELECT user_id FROM users WHERE email = 'doctor7@test.com'),
  'BS. Nguyễn Văn I',
  'Da liễu',
  '0666777888',
  6,  -- branch_id vừa tạo
  8,
  4.7
);
```

### Cập nhật Availability

```sql
-- Bác sĩ 1 rảnh vào ngày mai 14:00
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available)
VALUES (1, CURRENT_DATE + INTERVAL '1 day', '14:00:00', true);

-- Bác sĩ 1 bận vào ngày mai 15:00
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available, reason)
VALUES (1, CURRENT_DATE + INTERVAL '1 day', '15:00:00', false, 'Nghỉ phép');
```

### Xem Conflicts Log

```sql
-- Xem tất cả conflicts
SELECT 
  ac.conflict_id,
  p.full_name AS patient_name,
  d.full_name AS doctor_name,
  ac.requested_date,
  ac.requested_time,
  ac.specialty,
  b.branch_name,
  ac.alternative_suggested,
  ac.created_at
FROM appointment_conflicts ac
JOIN patients p ON ac.patient_id = p.patient_id
JOIN doctors d ON ac.requested_doctor_id = d.doctor_id
LEFT JOIN branches b ON ac.branch_id = b.branch_id
ORDER BY ac.created_at DESC;
```

---

## 🐛 TROUBLESHOOTING

### Lỗi 1: "Cannot find alternative doctors"

**Nguyên nhân:** Không có bác sĩ cùng chuyên khoa rảnh

**Giải pháp:**
```sql
-- Kiểm tra xem có bác sĩ nào cùng chuyên khoa không
SELECT * FROM doctors WHERE specialty = 'Tim mạch';

-- Thêm availability cho bác sĩ
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available)
VALUES (3, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true);
```

### Lỗi 2: "API returns 500"

**Nguyên nhân:** Database schema chưa được tạo

**Giải pháp:**
1. Vào Supabase SQL Editor
2. Chạy lại `multi_branch_schema.sql`
3. Restart server Next.js

### Lỗi 3: "branches table not found"

**Nguyên nhân:** SQL chưa chạy xong hoặc bị lỗi

**Giải pháp:**
```sql
-- Kiểm tra table tồn tại
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('branches', 'doctor_availability', 'appointment_conflicts');
```

### Lỗi 4: Component không hiển thị

**Kiểm tra:**
1. File `AlternativeDoctorSuggestions.js` đã tồn tại?
2. Import đúng path?
3. Modal component đã tạo?
4. Console có lỗi gì?

---

## 📊 ANALYTICS & MONITORING

### Xem thống kê theo chi nhánh

```sql
SELECT * FROM branch_statistics;
```

### Top bác sĩ được gợi ý nhiều nhất

```sql
SELECT 
  d.full_name,
  d.specialty,
  b.branch_name,
  COUNT(ac.conflict_id) AS times_suggested
FROM doctors d
JOIN branches b ON d.branch_id = b.branch_id
LEFT JOIN appointment_conflicts ac ON d.doctor_id = ac.requested_doctor_id
WHERE ac.alternative_suggested = true
GROUP BY d.doctor_id, d.full_name, d.specialty, b.branch_name
ORDER BY times_suggested DESC;
```

### Giờ cao điểm conflict

```sql
SELECT 
  requested_time,
  COUNT(*) AS conflict_count
FROM appointment_conflicts
GROUP BY requested_time
ORDER BY conflict_count DESC;
```

---

## 🚀 NÂNG CAO

### 1. Tích hợp AI Assistant

Bạn có thể kết hợp với AI Chatbot để gợi ý:

```javascript
// Trong AIChatbot component, thêm context về alternatives
const context = {
  ...existingContext,
  alternativeDoctors: recommendations
};

// AI sẽ biết và có thể gợi ý:
// "Bác sĩ Lê Văn C đang bận. Tôi gợi ý bạn đặt lịch với BS. Nguyễn Thị E 
//  ở chi nhánh Quận 3, cách bạn 5km, rating 4.9/5"
```

### 2. Notification khi slot trống

```sql
-- Tạo bảng waitlist
CREATE TABLE waitlist (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(patient_id),
  doctor_id INTEGER REFERENCES doctors(doctor_id),
  preferred_date DATE,
  preferred_time TIME,
  notified BOOLEAN DEFAULT false
);

-- Khi có slot trống, gửi notification
```

### 3. Smart Routing (GPS-based)

```sql
-- Tính khoảng cách GPS
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lng1 DECIMAL,
  lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R DECIMAL := 6371; -- Earth radius in km
  dLat DECIMAL;
  dLng DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dLat := RADIANS(lat2 - lat1);
  dLng := RADIANS(lng2 - lng1);
  
  a := SIN(dLat/2) * SIN(dLat/2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dLng/2) * SIN(dLng/2);
  
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql;
```

---

## ✅ CHECKLIST TRIỂN KHAI

- [ ] Database schema đã chạy
- [ ] API endpoint hoạt động
- [ ] Component AlternativeDoctorSuggestions đã tạo
- [ ] Modal component đã tạo
- [ ] Tích hợp vào book appointment page
- [ ] Test với dữ liệu mẫu
- [ ] Check console không có lỗi
- [ ] UI hiển thị đúng trên mobile
- [ ] Performance OK (< 2s response time)

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:

1. Check console browser (F12)
2. Check terminal server logs
3. Test API với curl/PowerShell
4. Kiểm tra Supabase logs
5. Verify database tables tồn tại

**Good luck! 🎉**
