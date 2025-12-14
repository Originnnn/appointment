-- =====================================================
-- DATABASE: appointment_app
-- Hệ thống quản lý lịch hẹn y tế
-- =====================================================

-- Drop tables if exists (để tránh lỗi khi chạy lại)
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS working_schedules CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types if exists
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('patient', 'doctor');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- 1. Bảng users - Quản lý tài khoản người dùng
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng patients - Thông tin bệnh nhân
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10),
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT
);

-- 3. Bảng doctors - Thông tin bác sĩ
CREATE TABLE doctors (
    doctor_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100),
    phone VARCHAR(20),
    description TEXT
);

-- 4. Bảng working_schedules - Lịch làm việc của bác sĩ
CREATE TABLE working_schedules (
    schedule_id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- 5. Bảng appointments - Lịch hẹn
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status appointment_status DEFAULT 'pending',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng medical_records - Hồ sơ bệnh án
CREATE TABLE medical_records (
    record_id SERIAL PRIMARY KEY,
    appointment_id INTEGER UNIQUE NOT NULL REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    diagnosis TEXT,
    treatment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo indexes để tăng tốc độ truy vấn
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_working_schedules_doctor_id ON working_schedules(doctor_id);
CREATE INDEX idx_working_schedules_date ON working_schedules(work_date);

-- Thêm dữ liệu mẫu để test

-- Users (2 bệnh nhân, 2 bác sĩ)
INSERT INTO users (email, password_hash, role) VALUES
('patient1@test.com', 'password1', 'patient'),
('patient2@test.com', 'password2', 'patient'),
('doctor1@test.com', 'password1', 'doctor'),
('doctor2@test.com', 'password2', 'doctor');

-- Patients
INSERT INTO patients (user_id, full_name, gender, date_of_birth, phone, address) VALUES
(1, 'Nguyễn Văn A', 'Nam', '1990-05-15', '0123456789', '123 Đường ABC, TP.HCM'),
(2, 'Trần Thị B', 'Nữ', '1985-08-20', '0987654321', '456 Đường XYZ, Hà Nội');

-- Doctors
INSERT INTO doctors (user_id, full_name, specialty, phone, description) VALUES
(3, 'BS. Lê Văn C', 'Tim mạch', '0111222333', 'Bác sĩ chuyên khoa tim mạch với 10 năm kinh nghiệm'),
(4, 'BS. Phạm Thị D', 'Nhi khoa', '0444555666', 'Bác sĩ nhi khoa, chuyên điều trị trẻ em');

-- Working Schedules
INSERT INTO working_schedules (doctor_id, work_date, start_time, end_time) VALUES
(1, '2025-12-16', '08:00:00', '12:00:00'),
(1, '2025-12-16', '14:00:00', '17:00:00'),
(1, '2025-12-17', '08:00:00', '12:00:00'),
(2, '2025-12-16', '08:00:00', '12:00:00'),
(2, '2025-12-18', '14:00:00', '18:00:00');

-- Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, note) VALUES
(1, 1, '2025-12-16', '09:00:00', 'confirmed', 'Khám định kỳ'),
(2, 2, '2025-12-16', '10:00:00', 'pending', 'Khám cho con');

-- Medical Records
INSERT INTO medical_records (appointment_id, diagnosis, treatment) VALUES
(1, 'Huyết áp cao', 'Uống thuốc hạ huyết áp, tái khám sau 1 tháng');
