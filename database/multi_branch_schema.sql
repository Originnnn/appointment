-- =====================================================
-- MULTI-BRANCH & SMART BOOKING SYSTEM
-- Extension for appointment_app database
-- =====================================================

-- 1. Bảng branches (Chi nhánh)
CREATE TABLE IF NOT EXISTS branches (
    branch_id SERIAL PRIMARY KEY,
    branch_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    latitude DECIMAL(10, 8),  -- Để tính khoảng cách
    longitude DECIMAL(11, 8),
    opening_time TIME DEFAULT '08:00:00',
    closing_time TIME DEFAULT '18:00:00',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cập nhật bảng doctors - thêm branch_id
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(branch_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- 3. Bảng doctor_specialties (Bác sĩ có thể có nhiều chuyên khoa)
CREATE TABLE IF NOT EXISTS doctor_specialties (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT false,  -- Chuyên khoa chính
    certification VARCHAR(255),
    years_in_specialty INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, specialty)
);

-- 4. Bảng appointment_conflicts (Theo dõi conflict khi đặt lịch)
CREATE TABLE IF NOT EXISTS appointment_conflicts (
    conflict_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    requested_doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id),
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    branch_id INTEGER REFERENCES branches(branch_id),
    resolved BOOLEAN DEFAULT false,
    alternative_suggested BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng doctor_availability (Trạng thái available của bác sĩ)
CREATE TABLE IF NOT EXISTS doctor_availability (
    availability_id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    is_available BOOLEAN DEFAULT true,
    reason VARCHAR(255),  -- Lý do không available (nghỉ phép, họp, etc)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, date, time_slot)
);

-- 6. View để xem tất cả bác sĩ có sẵn theo chuyên khoa và thời gian
CREATE OR REPLACE VIEW available_doctors_view AS
SELECT 
    d.doctor_id,
    d.full_name,
    d.specialty,
    d.phone,
    d.description,
    d.years_of_experience,
    d.rating,
    d.branch_id,
    b.branch_name,
    b.address AS branch_address,
    b.city,
    b.district,
    b.latitude,
    b.longitude,
    da.date AS available_date,
    da.time_slot AS available_time,
    da.duration_minutes,
    -- Tính số lượng lịch hẹn trong ngày
    (
        SELECT COUNT(*) 
        FROM appointments a 
        WHERE a.doctor_id = d.doctor_id 
        AND a.appointment_date = da.date
        AND a.status IN ('confirmed', 'pending')
    ) AS appointments_count
FROM doctors d
LEFT JOIN branches b ON d.branch_id = b.branch_id
LEFT JOIN doctor_availability da ON d.doctor_id = da.doctor_id
WHERE da.is_available = true
AND b.is_active = true;

-- Indexes để tăng performance
CREATE INDEX IF NOT EXISTS idx_doctors_branch_specialty ON doctors(branch_id, specialty);
CREATE INDEX IF NOT EXISTS idx_doctor_specialties_specialty ON doctor_specialties(specialty);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_date_time ON doctor_availability(date, time_slot);
CREATE INDEX IF NOT EXISTS idx_appointment_conflicts_date ON appointment_conflicts(requested_date, requested_time);
CREATE INDEX IF NOT EXISTS idx_branches_city_district ON branches(city, district);

-- Thêm dữ liệu mẫu

-- Branches
INSERT INTO branches (branch_name, address, city, district, phone, latitude, longitude) VALUES
('Chi nhánh Quận 1', '123 Lê Lợi, Bến Nghé', 'TP.HCM', 'Quận 1', '0281234567', 10.7769, 106.7009),
('Chi nhánh Quận 3', '456 Nam Kỳ Khởi Nghĩa', 'TP.HCM', 'Quận 3', '0281234568', 10.7827, 106.6908),
('Chi nhánh Thủ Đức', '789 Võ Văn Ngân, Linh Chiểu', 'TP.HCM', 'Thủ Đức', '0281234569', 10.8502, 106.7717),
('Chi nhánh Hà Nội - Đống Đa', '321 Láng Hạ, Đống Đa', 'Hà Nội', 'Đống Đa', '0241234567', 21.0168, 105.8132),
('Chi nhánh Hà Nội - Cầu Giấy', '654 Xuân Thủy, Dịch Vọng', 'Hà Nội', 'Cầu Giấy', '0241234568', 21.0380, 105.7820);

-- Cập nhật doctors hiện tại với branch_id
UPDATE doctors SET branch_id = 1, years_of_experience = 10, rating = 4.8, total_reviews = 45 WHERE doctor_id = 1;
UPDATE doctors SET branch_id = 1, years_of_experience = 8, rating = 4.9, total_reviews = 38 WHERE doctor_id = 2;

-- Thêm thêm bác sĩ cho các chi nhánh khác
INSERT INTO users (email, password_hash, role) VALUES
('doctor3@test.com', 'password3', 'doctor'),
('doctor4@test.com', 'password4', 'doctor'),
('doctor5@test.com', 'password5', 'doctor'),
('doctor6@test.com', 'password6', 'doctor');

INSERT INTO doctors (user_id, full_name, specialty, phone, description, branch_id, years_of_experience, rating, total_reviews) VALUES
((SELECT user_id FROM users WHERE email = 'doctor3@test.com'), 'BS. Nguyễn Thị E', 'Tim mạch', '0222333444', 'Bác sĩ tim mạch - Chi nhánh Q3', 2, 12, 4.9, 52),
((SELECT user_id FROM users WHERE email = 'doctor4@test.com'), 'BS. Trần Văn F', 'Nhi khoa', '0333444555', 'Bác sĩ nhi khoa - Chi nhánh Thủ Đức', 3, 9, 4.7, 41),
((SELECT user_id FROM users WHERE email = 'doctor5@test.com'), 'BS. Lê Thị G', 'Tim mạch', '0444555666', 'Bác sĩ tim mạch - Chi nhánh Hà Nội Đống Đa', 4, 15, 5.0, 67),
((SELECT user_id FROM users WHERE email = 'doctor6@test.com'), 'BS. Phạm Văn H', 'Nhi khoa', '0555666777', 'Bác sĩ nhi khoa - Chi nhánh Hà Nội Cầu Giấy', 5, 7, 4.6, 33);

-- Doctor Specialties (Bác sĩ có nhiều chuyên môn)
INSERT INTO doctor_specialties (doctor_id, specialty, is_primary, years_in_specialty) VALUES
(1, 'Tim mạch', true, 10),
(1, 'Nội tổng quát', false, 5),
(2, 'Nhi khoa', true, 8),
(2, 'Dinh dưỡng trẻ em', false, 4),
(3, 'Tim mạch', true, 12),
(3, 'Huyết áp', false, 8),
(4, 'Nhi khoa', true, 9),
(5, 'Tim mạch', true, 15),
(6, 'Nhi khoa', true, 7);

-- Doctor Availability mẫu (3 ngày tới)
-- Bác sĩ 1 - Rảnh sáng
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(1, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(1, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true),
(1, CURRENT_DATE + INTERVAL '1 day', '11:00:00', true),
(1, CURRENT_DATE + INTERVAL '1 day', '14:00:00', false),  -- Busy
(1, CURRENT_DATE + INTERVAL '1 day', '15:00:00', false);  -- Busy

-- Bác sĩ 3 (cùng chuyên khoa Tim mạch) - Rảnh chiều
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(3, CURRENT_DATE + INTERVAL '1 day', '09:00:00', false),  -- Busy
(3, CURRENT_DATE + INTERVAL '1 day', '10:00:00', false),  -- Busy
(3, CURRENT_DATE + INTERVAL '1 day', '14:00:00', true),
(3, CURRENT_DATE + INTERVAL '1 day', '15:00:00', true),
(3, CURRENT_DATE + INTERVAL '1 day', '16:00:00', true);

-- Bác sĩ 5 (Tim mạch - Hà Nội) - Rảnh cả ngày
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(5, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(5, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true),
(5, CURRENT_DATE + INTERVAL '1 day', '14:00:00', true),
(5, CURRENT_DATE + INTERVAL '1 day', '15:00:00', true);

-- Function: Tìm bác sĩ thay thế khi conflict
CREATE OR REPLACE FUNCTION find_alternative_doctors(
    p_specialty VARCHAR,
    p_date DATE,
    p_time TIME,
    p_branch_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    doctor_id INTEGER,
    full_name VARCHAR,
    specialty VARCHAR,
    branch_id INTEGER,
    branch_name VARCHAR,
    branch_address TEXT,
    city VARCHAR,
    rating DECIMAL,
    years_of_experience INTEGER,
    distance_priority INTEGER  -- 0 = same branch, 1 = same city, 2 = other city
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.doctor_id,
        d.full_name,
        d.specialty,
        d.branch_id,
        b.branch_name,
        b.address AS branch_address,
        b.city,
        d.rating,
        d.years_of_experience,
        CASE 
            WHEN d.branch_id = p_branch_id THEN 0
            WHEN b.city = (SELECT city FROM branches WHERE branch_id = p_branch_id) THEN 1
            ELSE 2
        END AS distance_priority
    FROM doctors d
    JOIN branches b ON d.branch_id = b.branch_id
    LEFT JOIN doctor_availability da ON d.doctor_id = da.doctor_id 
        AND da.date = p_date 
        AND da.time_slot = p_time
    WHERE d.specialty = p_specialty
    AND b.is_active = true
    AND (da.is_available = true OR da.availability_id IS NULL)  -- Available or no record (assume available)
    AND NOT EXISTS (
        -- Check không có appointment conflict
        SELECT 1 FROM appointments a 
        WHERE a.doctor_id = d.doctor_id 
        AND a.appointment_date = p_date 
        AND a.appointment_time = p_time
        AND a.status IN ('confirmed', 'pending')
    )
    ORDER BY distance_priority, d.rating DESC, d.years_of_experience DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function: Log appointment conflict
CREATE OR REPLACE FUNCTION log_appointment_conflict()
RETURNS TRIGGER AS $$
BEGIN
    -- Kiểm tra xem bác sĩ có rảnh không
    IF EXISTS (
        SELECT 1 FROM appointments 
        WHERE doctor_id = NEW.doctor_id 
        AND appointment_date = NEW.appointment_date 
        AND appointment_time = NEW.appointment_time
        AND status IN ('confirmed', 'pending')
        AND appointment_id != NEW.appointment_id
    ) THEN
        -- Log conflict
        INSERT INTO appointment_conflicts (
            patient_id, 
            requested_doctor_id, 
            requested_date, 
            requested_time, 
            specialty,
            branch_id
        )
        SELECT 
            NEW.patient_id,
            NEW.doctor_id,
            NEW.appointment_date,
            NEW.appointment_time,
            d.specialty,
            d.branch_id
        FROM doctors d
        WHERE d.doctor_id = NEW.doctor_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger để tự động log conflict
CREATE TRIGGER check_appointment_conflict
    BEFORE INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION log_appointment_conflict();

-- View: Dashboard statistics cho admin
CREATE OR REPLACE VIEW branch_statistics AS
SELECT 
    b.branch_id,
    b.branch_name,
    b.city,
    COUNT(DISTINCT d.doctor_id) AS total_doctors,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.appointment_id END) AS completed_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.appointment_id END) AS pending_appointments,
    AVG(d.rating) AS avg_doctor_rating,
    COUNT(DISTINCT ac.conflict_id) AS total_conflicts
FROM branches b
LEFT JOIN doctors d ON b.branch_id = d.branch_id
LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
LEFT JOIN appointment_conflicts ac ON d.doctor_id = ac.requested_doctor_id
GROUP BY b.branch_id, b.branch_name, b.city;
