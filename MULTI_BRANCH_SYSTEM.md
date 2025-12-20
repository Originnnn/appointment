# 🏥 Multi-Branch Doctor Availability System

## Tổng quan

Hệ thống tìm kiếm và gợi ý bác sĩ thay thế thông minh khi bác sĩ được chọn đã có lịch hẹn.

## Kiến trúc Microservice

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  - AlternativeDoctorSuggestions Component               │
│  - Book Appointment Page                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  API Gateway Layer                       │
│  - /api/doctor-availability (POST/GET)                  │
│  - Input validation                                     │
│  - Rate limiting                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Business Logic Layer                        │
│  - Check doctor availability                            │
│  - Find alternative doctors                             │
│  - Calculate distance priority                          │
│  - Sort by rating & experience                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Database Layer                          │
│  - branches, doctors, appointments                       │
│  - doctor_availability, appointment_conflicts           │
│  - PostgreSQL Functions & Triggers                      │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### 1. **branches** - Quản lý chi nhánh
- branch_id, branch_name, address
- city, district (để tìm bác sĩ cùng khu vực)
- latitude, longitude (để tính khoảng cách GPS)
- opening_time, closing_time

### 2. **doctors** (extended)
- **branch_id** ← Chi nhánh làm việc
- **years_of_experience** ← Ưu tiên bác sĩ giàu kinh nghiệm
- **rating** ← Đánh giá từ bệnh nhân
- **total_reviews** ← Số lượng đánh giá

### 3. **doctor_specialties** - Bác sĩ có nhiều chuyên khoa
- doctor_id, specialty
- is_primary (chuyên khoa chính)
- years_in_specialty

### 4. **doctor_availability** - Lịch trình chi tiết
- doctor_id, date, time_slot
- is_available, reason
- duration_minutes

### 5. **appointment_conflicts** - Log conflicts
- patient_id, requested_doctor_id
- requested_date, requested_time
- specialty, branch_id
- alternative_suggested

## API Endpoints

### POST `/api/doctor-availability`

**Request:**
```json
{
  "specialty": "Tim mạch",
  "date": "2025-12-21",
  "time": "09:00:00",
  "currentBranchId": 1,
  "currentDoctorId": 1
}
```

**Response:**
```json
{
  "success": true,
  "original_doctor_busy": true,
  "total_alternatives": 5,
  "statistics": {
    "same_branch": 2,
    "same_city": 2,
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
        "address": "456 Nam Kỳ Khởi Nghĩa",
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

### GET `/api/doctor-availability`

**Query params:** `?doctorId=1&date=2025-12-21&time=09:00:00`

**Response:**
```json
{
  "success": true,
  "doctor_id": 1,
  "is_available": false,
  "is_busy": true,
  "appointments_count": 1
}
```

## Quy trình hoạt động

### 1. **User chọn bác sĩ & giờ khám**
```javascript
// Patient dashboard - book appointment
selectedDoctor = "BS. Lê Văn C"
selectedDate = "2025-12-21"
selectedTime = "09:00:00"
```

### 2. **Check availability**
```javascript
// Gọi API kiểm tra
const response = await fetch('/api/doctor-availability', {
  method: 'GET',
  params: { doctorId, date, time }
});
```

### 3. **Nếu bác sĩ bận → Show alternatives**
```javascript
if (response.is_busy) {
  // Hiển thị component AlternativeDoctorSuggestions
  showAlternatives({
    specialty: doctor.specialty,
    date,
    time,
    currentBranch: doctor.branch_id
  });
}
```

### 4. **Tìm kiếm & sắp xếp**

**Priority algorithm:**
```
1. Distance Priority:
   - 0: Same branch (Cùng chi nhánh) 
   - 1: Same city (Cùng thành phố)
   - 2: Other city (Chi nhánh khác)

2. Rating (cao → thấp)
3. Experience (nhiều → ít)
```

### 5. **User chọn bác sĩ thay thế**
```javascript
onSelectDoctor(alternativeDoctor);
// → Proceed to booking
```

## Features

### ✅ Đã implement:
- [x] Multi-branch database schema
- [x] Doctor availability checking
- [x] Alternative doctor search API
- [x] Distance priority calculation
- [x] Rating & experience sorting
- [x] Conflict logging
- [x] UI component với statistics
- [x] Real-time availability check

### 🚀 Có thể mở rộng:

#### 1. **GPS Distance Calculation**
```sql
-- Calculate real distance using lat/lng
CREATE FUNCTION calculate_distance(
  lat1 DECIMAL, lng1 DECIMAL,
  lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  -- Haversine formula
  RETURN ...;
END;
$$ LANGUAGE plpgsql;
```

#### 2. **Smart Scheduling**
```javascript
// Suggest best time slots
POST /api/smart-schedule
{
  "specialty": "Tim mạch",
  "preferredBranch": 1,
  "dateRange": ["2025-12-21", "2025-12-25"]
}
// → Returns: Best available slots sorted by convenience
```

#### 3. **Notification Service**
```javascript
// Notify patient when slot becomes available
POST /api/waitlist
{
  "patientId": 1,
  "doctorId": 1,
  "preferredDate": "2025-12-21",
  "preferredTime": "09:00:00"
}
// → Auto-notify via email/SMS when slot opens
```

#### 4. **Load Balancing**
```javascript
// Distribute appointments evenly
const leastBusyDoctor = await findLeastBusyDoctor({
  specialty,
  branch,
  date
});
```

#### 5. **Analytics Dashboard**
```sql
-- Branch performance metrics
SELECT * FROM branch_statistics;

-- Most popular time slots
SELECT 
  time_slot,
  COUNT(*) as bookings,
  AVG(rating) as avg_rating
FROM appointments
GROUP BY time_slot
ORDER BY bookings DESC;
```

## Integration với existing code

### Book Appointment Page:

```javascript
// app/patient/book-appointment/page.js

const [showAlternatives, setShowAlternatives] = useState(false);
const [selectedDoctor, setSelectedDoctor] = useState(null);

const handleDoctorTimeSelect = async (doctor, date, time) => {
  // Check if doctor is available
  const response = await fetch(
    `/api/doctor-availability?doctorId=${doctor.doctor_id}&date=${date}&time=${time}`
  );
  
  const data = await response.json();
  
  if (data.is_busy) {
    // Show alternatives
    setSelectedDoctor(doctor);
    setShowAlternatives(true);
  } else {
    // Proceed to booking
    proceedToBooking(doctor, date, time);
  }
};

return (
  <>
    {/* ... existing booking form ... */}
    
    {showAlternatives && (
      <Modal>
        <AlternativeDoctorSuggestions
          originalDoctor={selectedDoctor}
          specialty={selectedDoctor.specialty}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSelectDoctor={(altDoctor) => {
            proceedToBooking(altDoctor, selectedDate, selectedTime);
            setShowAlternatives(false);
          }}
          onClose={() => setShowAlternatives(false)}
        />
      </Modal>
    )}
  </>
);
```

## Setup Instructions

### 1. Database Migration
```bash
# Chạy script SQL
psql -U postgres -d appointment_app -f database/multi_branch_schema.sql

# Hoặc trong Supabase Dashboard → SQL Editor:
# Copy & paste nội dung multi_branch_schema.sql
```

### 2. Test API
```bash
# Test GET
curl "http://localhost:3001/api/doctor-availability?doctorId=1&date=2025-12-21&time=09:00:00"

# Test POST
curl -X POST http://localhost:3001/api/doctor-availability \
  -H "Content-Type: application/json" \
  -d '{
    "specialty": "Tim mạch",
    "date": "2025-12-21",
    "time": "09:00:00",
    "currentBranchId": 1,
    "currentDoctorId": 1
  }'
```

### 3. Import Component
```javascript
import AlternativeDoctorSuggestions from '@/components/AlternativeDoctorSuggestions';
```

## Performance Optimization

### Caching Strategy:
```javascript
// Cache doctor availability for 5 minutes
const cacheKey = `availability:${doctorId}:${date}:${time}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// ... fetch from DB ...

await redis.setex(cacheKey, 300, JSON.stringify(result));
```

### Index Strategy:
```sql
-- Đã có trong schema
CREATE INDEX idx_doctors_branch_specialty ON doctors(branch_id, specialty);
CREATE INDEX idx_doctor_availability_date_time ON doctor_availability(date, time_slot);
```

## Security Considerations

- ✅ Input validation
- ✅ SQL injection prevention (Supabase RLS)
- ✅ Rate limiting (recommended)
- ✅ CORS configuration
- ✅ Error handling

## Monitoring & Logging

```javascript
// Log mỗi lần tìm kiếm alternatives
console.log('🔍 Finding alternatives:', { 
  specialty, 
  date, 
  time, 
  resultsCount 
});

// Track success rate
analytics.track('alternative_doctor_found', {
  originalDoctor: doctorId,
  alternativesCount,
  userSelected: true/false
});
```

---

**Status:** ✅ Ready to implement
**Estimated time:** 2-3 hours
**Dependencies:** Supabase, Next.js 15
