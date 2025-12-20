-- =====================================================
-- THÊM DỮ LIỆU BÁC SĨ MỚI (20+ bác sĩ)
-- Chạy sau khi đã có multi_branch_schema.sql
-- =====================================================

-- 1. Thêm Users cho bác sĩ mới
INSERT INTO users (email, password_hash, role) VALUES
('doctor7@test.com', 'password7', 'doctor'),
('doctor8@test.com', 'password8', 'doctor'),
('doctor9@test.com', 'password9', 'doctor'),
('doctor10@test.com', 'password10', 'doctor'),
('doctor11@test.com', 'password11', 'doctor'),
('doctor12@test.com', 'password12', 'doctor'),
('doctor13@test.com', 'password13', 'doctor'),
('doctor14@test.com', 'password14', 'doctor'),
('doctor15@test.com', 'password15', 'doctor'),
('doctor16@test.com', 'password16', 'doctor'),
('doctor17@test.com', 'password17', 'doctor'),
('doctor18@test.com', 'password18', 'doctor'),
('doctor19@test.com', 'password19', 'doctor'),
('doctor20@test.com', 'password20', 'doctor'),
('doctor21@test.com', 'password21', 'doctor'),
('doctor22@test.com', 'password22', 'doctor'),
('doctor23@test.com', 'password23', 'doctor'),
('doctor24@test.com', 'password24', 'doctor'),
('doctor25@test.com', 'password25', 'doctor'),
('doctor26@test.com', 'password26', 'doctor');

-- 2. Thêm Doctors với thông tin chi tiết
INSERT INTO doctors (user_id, full_name, specialty, phone, description, branch_id, years_of_experience, rating, total_reviews) VALUES
-- Chi nhánh Quận 1 (branch_id = 1)
((SELECT user_id FROM users WHERE email = 'doctor7@test.com'), 'BS. Trần Thị Mai', 'Da liễu', '0901234567', 'Bác sĩ da liễu 12 năm kinh nghiệm, chuyên điều trị mụn và lão hóa da', 1, 12, 4.9, 68),
((SELECT user_id FROM users WHERE email = 'doctor8@test.com'), 'BS. Nguyễn Văn Bình', 'Tai Mũi Họng', '0902234567', 'Chuyên gia TMH, điều trị viêm xoang và amidan', 1, 15, 4.8, 72),
((SELECT user_id FROM users WHERE email = 'doctor9@test.com'), 'BS. Lê Thị Hương', 'Tiêu hóa', '0903234567', 'Bác sĩ tiêu hóa, chuyên điều trị đau dạ dày và viêm đại tràng', 1, 10, 4.7, 55),
((SELECT user_id FROM users WHERE email = 'doctor10@test.com'), 'BS. Phạm Văn Khoa', 'Thần kinh', '0904234567', 'Bác sĩ thần kinh, chuyên điều trị đau đầu và đột quỵ', 1, 18, 5.0, 89),

-- Chi nhánh Quận 3 (branch_id = 2)
((SELECT user_id FROM users WHERE email = 'doctor11@test.com'), 'BS. Hoàng Thị Lan', 'Nội tổng quát', '0905234567', 'Bác sĩ nội khoa tổng quát, khám sức khỏe định kỳ', 2, 8, 4.6, 42),
((SELECT user_id FROM users WHERE email = 'doctor12@test.com'), 'BS. Đặng Văn Nam', 'Tim mạch', '0906234567', 'Chuyên gia tim mạch, điều trị tăng huyết áp và suy tim', 2, 20, 4.9, 95),
((SELECT user_id FROM users WHERE email = 'doctor13@test.com'), 'BS. Vũ Thị Oanh', 'Phụ sản', '0907234567', 'Bác sĩ phụ khoa, chuyên chăm sóc thai sản', 2, 11, 4.8, 63),
((SELECT user_id FROM users WHERE email = 'doctor14@test.com'), 'BS. Bùi Văn Phong', 'Nhi khoa', '0908234567', 'Bác sĩ nhi khoa, chuyên về bệnh nhiễm trùng trẻ em', 2, 9, 4.7, 51),

-- Chi nhánh Thủ Đức (branch_id = 3)
((SELECT user_id FROM users WHERE email = 'doctor15@test.com'), 'BS. Ngô Thị Quỳnh', 'Mắt', '0909234567', 'Bác sĩ nhãn khoa, điều trị cận thị và đục thủy tinh thể', 3, 14, 4.9, 77),
((SELECT user_id FROM users WHERE email = 'doctor16@test.com'), 'BS. Dương Văn Rạng', 'Răng Hàm Mặt', '0910234567', 'Bác sĩ nha khoa, chuyên implant và niềng răng', 3, 13, 4.8, 69),
((SELECT user_id FROM users WHERE email = 'doctor17@test.com'), 'BS. Trịnh Thị Sương', 'Tim mạch', '0911234567', 'Bác sĩ tim mạch, chuyên siêu âm tim và điện tâm đồ', 3, 16, 4.9, 81),
((SELECT user_id FROM users WHERE email = 'doctor18@test.com'), 'BS. Cao Văn Tài', 'Da liễu', '0912234567', 'Chuyên gia da liễu, điều trị bệnh vẩy nến và viêm da', 3, 11, 4.7, 58),

-- Chi nhánh Hà Nội - Đống Đa (branch_id = 4)
((SELECT user_id FROM users WHERE email = 'doctor19@test.com'), 'BS. Lý Thị Uyên', 'Nội tiết', '0913234567', 'Bác sĩ nội tiết, chuyên điều trị tiểu đường và tuyến giáp', 4, 17, 5.0, 92),
((SELECT user_id FROM users WHERE email = 'doctor20@test.com'), 'BS. Phan Văn Vũ', 'Cơ Xương Khớp', '0914234567', 'Bác sĩ chuyên khớp, điều trị viêm khớp và thoái hóa', 4, 19, 4.8, 88),
((SELECT user_id FROM users WHERE email = 'doctor21@test.com'), 'BS. Đỗ Thị Xuân', 'Nhi khoa', '0915234567', 'Bác sĩ nhi khoa, chuyên dinh dưỡng và phát triển', 4, 10, 4.7, 60),
((SELECT user_id FROM users WHERE email = 'doctor22@test.com'), 'BS. Mai Văn Yên', 'Tai Mũi Họng', '0916234567', 'Chuyên gia TMH, phẫu thuật amidan và polyp mũi', 4, 15, 4.9, 75),

-- Chi nhánh Hà Nội - Cầu Giấy (branch_id = 5)
((SELECT user_id FROM users WHERE email = 'doctor23@test.com'), 'BS. Hồ Thị Ánh', 'Thần kinh', '0917234567', 'Bác sĩ thần kinh, chuyên Parkinson và sa sút trí tuệ', 5, 21, 5.0, 104),
((SELECT user_id FROM users WHERE email = 'doctor24@test.com'), 'BS. Lâm Văn Bách', 'Tiêu hóa', '0918234567', 'Bác sĩ tiêu hóa, chuyên nội soi và điều trị viêm gan', 5, 14, 4.8, 71),
((SELECT user_id FROM users WHERE email = 'doctor25@test.com'), 'BS. Tô Thị Cẩm', 'Phụ sản', '0919234567', 'Bác sĩ phụ khoa, chuyên u xơ tử cung và buồng trứng', 5, 12, 4.7, 64),
((SELECT user_id FROM users WHERE email = 'doctor26@test.com'), 'BS. Đinh Văn Đạt', 'Mắt', '0920234567', 'Bác sĩ nhãn khoa, chuyên phẫu thuật Lasik và glaucoma', 5, 16, 4.9, 83);

-- 3. Thêm Doctor Specialties (bác sĩ có nhiều chuyên môn)
INSERT INTO doctor_specialties (doctor_id, specialty, is_primary, years_in_specialty) VALUES
-- Bác sĩ 7 (Da liễu)
(7, 'Da liễu', true, 12),
(7, 'Thẩm mỹ da', false, 8),
-- Bác sĩ 8 (TMH)
(8, 'Tai Mũi Họng', true, 15),
(8, 'Phẫu thuật TMH', false, 10),
-- Bác sĩ 9 (Tiêu hóa)
(9, 'Tiêu hóa', true, 10),
(9, 'Nội soi', false, 6),
-- Bác sĩ 10 (Thần kinh)
(10, 'Thần kinh', true, 18),
(10, 'Đột quỵ', false, 12),
-- Bác sĩ 11 (Nội tổng quát)
(11, 'Nội tổng quát', true, 8),
-- Bác sĩ 12 (Tim mạch)
(12, 'Tim mạch', true, 20),
(12, 'Tăng huyết áp', false, 15),
-- Bác sĩ 13 (Phụ sản)
(13, 'Phụ sản', true, 11),
(13, 'Sản khoa', false, 9),
-- Bác sĩ 14 (Nhi khoa)
(14, 'Nhi khoa', true, 9),
(14, 'Nhiễm trùng nhi', false, 6),
-- Bác sĩ 15 (Mắt)
(15, 'Mắt', true, 14),
(15, 'Phẫu thuật mắt', false, 10),
-- Bác sĩ 16 (RHM)
(16, 'Răng Hàm Mặt', true, 13),
(16, 'Implant nha khoa', false, 8),
-- Bác sĩ 17 (Tim mạch)
(17, 'Tim mạch', true, 16),
(17, 'Siêu âm tim', false, 12),
-- Bác sĩ 18 (Da liễu)
(18, 'Da liễu', true, 11),
-- Bác sĩ 19 (Nội tiết)
(19, 'Nội tiết', true, 17),
(19, 'Tiểu đường', false, 14),
-- Bác sĩ 20 (Cơ Xương Khớp)
(20, 'Cơ Xương Khớp', true, 19),
(20, 'Viêm khớp', false, 15),
-- Bác sĩ 21 (Nhi khoa)
(21, 'Nhi khoa', true, 10),
(21, 'Dinh dưỡng trẻ em', false, 7),
-- Bác sĩ 22 (TMH)
(22, 'Tai Mũi Họng', true, 15),
-- Bác sĩ 23 (Thần kinh)
(23, 'Thần kinh', true, 21),
(23, 'Parkinson', false, 16),
-- Bác sĩ 24 (Tiêu hóa)
(24, 'Tiêu hóa', true, 14),
(24, 'Viêm gan', false, 10),
-- Bác sĩ 25 (Phụ sản)
(25, 'Phụ sản', true, 12),
-- Bác sĩ 26 (Mắt)
(26, 'Mắt', true, 16),
(26, 'Phẫu thuật Lasik', false, 11);

-- 4. Thêm Doctor Availability cho 7 ngày tới
-- Bác sĩ 7 - Da liễu (Chi nhánh 1)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(7, CURRENT_DATE, '08:00:00', true),
(7, CURRENT_DATE, '09:00:00', true),
(7, CURRENT_DATE, '10:00:00', true),
(7, CURRENT_DATE, '14:00:00', true),
(7, CURRENT_DATE, '15:00:00', true),
(7, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(7, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(7, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true),
(7, CURRENT_DATE + INTERVAL '1 day', '14:00:00', false),
(7, CURRENT_DATE + INTERVAL '1 day', '15:00:00', true),
(7, CURRENT_DATE + INTERVAL '2 day', '08:00:00', true),
(7, CURRENT_DATE + INTERVAL '2 day', '09:00:00', true),
(7, CURRENT_DATE + INTERVAL '2 day', '14:00:00', true),
(7, CURRENT_DATE + INTERVAL '2 day', '15:00:00', true);

-- Bác sĩ 8 - TMH (Chi nhánh 1)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(8, CURRENT_DATE, '08:00:00', true),
(8, CURRENT_DATE, '09:00:00', false),
(8, CURRENT_DATE, '10:00:00', true),
(8, CURRENT_DATE, '11:00:00', true),
(8, CURRENT_DATE, '14:00:00', true),
(8, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(8, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(8, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true),
(8, CURRENT_DATE + INTERVAL '1 day', '11:00:00', true);

-- Bác sĩ 9 - Tiêu hóa (Chi nhánh 1)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(9, CURRENT_DATE, '09:00:00', true),
(9, CURRENT_DATE, '10:00:00', true),
(9, CURRENT_DATE, '11:00:00', true),
(9, CURRENT_DATE, '14:00:00', true),
(9, CURRENT_DATE, '15:00:00', true),
(9, CURRENT_DATE, '16:00:00', true),
(9, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(9, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true),
(9, CURRENT_DATE + INTERVAL '1 day', '14:00:00', true),
(9, CURRENT_DATE + INTERVAL '1 day', '15:00:00', true);

-- Bác sĩ 10 - Thần kinh (Chi nhánh 1)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(10, CURRENT_DATE, '08:00:00', true),
(10, CURRENT_DATE, '09:00:00', true),
(10, CURRENT_DATE, '10:00:00', true),
(10, CURRENT_DATE, '14:00:00', true),
(10, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(10, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(10, CURRENT_DATE + INTERVAL '1 day', '10:00:00', false),
(10, CURRENT_DATE + INTERVAL '1 day', '14:00:00', true);

-- Bác sĩ 11 - Nội tổng quát (Chi nhánh 2)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(11, CURRENT_DATE, '08:00:00', true),
(11, CURRENT_DATE, '09:00:00', true),
(11, CURRENT_DATE, '10:00:00', true),
(11, CURRENT_DATE, '11:00:00', true),
(11, CURRENT_DATE, '14:00:00', true),
(11, CURRENT_DATE, '15:00:00', true),
(11, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(11, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(11, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true);

-- Bác sĩ 12 - Tim mạch (Chi nhánh 2)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(12, CURRENT_DATE, '08:00:00', true),
(12, CURRENT_DATE, '09:00:00', true),
(12, CURRENT_DATE, '10:00:00', true),
(12, CURRENT_DATE, '14:00:00', false),
(12, CURRENT_DATE, '15:00:00', true),
(12, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(12, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(12, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true),
(12, CURRENT_DATE + INTERVAL '1 day', '14:00:00', true);

-- Bác sĩ 13 - Phụ sản (Chi nhánh 2)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(13, CURRENT_DATE, '08:00:00', true),
(13, CURRENT_DATE, '09:00:00', true),
(13, CURRENT_DATE, '10:00:00', true),
(13, CURRENT_DATE, '14:00:00', true),
(13, CURRENT_DATE, '15:00:00', true),
(13, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(13, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true);

-- Bác sĩ 14 - Nhi khoa (Chi nhánh 2)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(14, CURRENT_DATE, '08:00:00', true),
(14, CURRENT_DATE, '09:00:00', true),
(14, CURRENT_DATE, '10:00:00', false),
(14, CURRENT_DATE, '11:00:00', true),
(14, CURRENT_DATE, '14:00:00', true),
(14, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(14, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(14, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true);

-- Bác sĩ 15 - Mắt (Chi nhánh 3)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(15, CURRENT_DATE, '08:00:00', true),
(15, CURRENT_DATE, '09:00:00', true),
(15, CURRENT_DATE, '10:00:00', true),
(15, CURRENT_DATE, '11:00:00', true),
(15, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(15, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(15, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true),
(15, CURRENT_DATE + INTERVAL '1 day', '14:00:00', true);

-- Bác sĩ 16 - Răng Hàm Mặt (Chi nhánh 3)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(16, CURRENT_DATE, '08:00:00', true),
(16, CURRENT_DATE, '09:00:00', true),
(16, CURRENT_DATE, '10:00:00', true),
(16, CURRENT_DATE, '14:00:00', true),
(16, CURRENT_DATE, '15:00:00', true),
(16, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(16, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true);

-- Bác sĩ 17 - Tim mạch (Chi nhánh 3)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(17, CURRENT_DATE, '08:00:00', true),
(17, CURRENT_DATE, '09:00:00', true),
(17, CURRENT_DATE, '10:00:00', true),
(17, CURRENT_DATE, '14:00:00', true),
(17, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(17, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(17, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true);

-- Bác sĩ 18 - Da liễu (Chi nhánh 3)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(18, CURRENT_DATE, '09:00:00', true),
(18, CURRENT_DATE, '10:00:00', true),
(18, CURRENT_DATE, '11:00:00', true),
(18, CURRENT_DATE, '14:00:00', true),
(18, CURRENT_DATE, '15:00:00', true),
(18, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(18, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true);

-- Bác sĩ 19 - Nội tiết (Chi nhánh 4)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(19, CURRENT_DATE, '08:00:00', true),
(19, CURRENT_DATE, '09:00:00', true),
(19, CURRENT_DATE, '10:00:00', true),
(19, CURRENT_DATE, '14:00:00', true),
(19, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(19, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(19, CURRENT_DATE + INTERVAL '1 day', '14:00:00', true);

-- Bác sĩ 20 - Cơ Xương Khớp (Chi nhánh 4)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(20, CURRENT_DATE, '08:00:00', true),
(20, CURRENT_DATE, '09:00:00', true),
(20, CURRENT_DATE, '10:00:00', true),
(20, CURRENT_DATE, '14:00:00', true),
(20, CURRENT_DATE, '15:00:00', true),
(20, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(20, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true);

-- Bác sĩ 21 - Nhi khoa (Chi nhánh 4)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(21, CURRENT_DATE, '08:00:00', true),
(21, CURRENT_DATE, '09:00:00', true),
(21, CURRENT_DATE, '10:00:00', true),
(21, CURRENT_DATE, '11:00:00', true),
(21, CURRENT_DATE, '14:00:00', true),
(21, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(21, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true);

-- Bác sĩ 22 - TMH (Chi nhánh 4)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(22, CURRENT_DATE, '08:00:00', true),
(22, CURRENT_DATE, '09:00:00', true),
(22, CURRENT_DATE, '10:00:00', false),
(22, CURRENT_DATE, '14:00:00', true),
(22, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(22, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(22, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true);

-- Bác sĩ 23 - Thần kinh (Chi nhánh 5)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(23, CURRENT_DATE, '08:00:00', true),
(23, CURRENT_DATE, '09:00:00', true),
(23, CURRENT_DATE, '10:00:00', true),
(23, CURRENT_DATE, '14:00:00', true),
(23, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(23, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true);

-- Bác sĩ 24 - Tiêu hóa (Chi nhánh 5)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(24, CURRENT_DATE, '08:00:00', true),
(24, CURRENT_DATE, '09:00:00', true),
(24, CURRENT_DATE, '10:00:00', true),
(24, CURRENT_DATE, '14:00:00', true),
(24, CURRENT_DATE, '15:00:00', true),
(24, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(24, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true);

-- Bác sĩ 25 - Phụ sản (Chi nhánh 5)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(25, CURRENT_DATE, '08:00:00', true),
(25, CURRENT_DATE, '09:00:00', true),
(25, CURRENT_DATE, '10:00:00', true),
(25, CURRENT_DATE, '14:00:00', true),
(25, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(25, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true);

-- Bác sĩ 26 - Mắt (Chi nhánh 5)
INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available) VALUES
(26, CURRENT_DATE, '08:00:00', true),
(26, CURRENT_DATE, '09:00:00', true),
(26, CURRENT_DATE, '10:00:00', true),
(26, CURRENT_DATE, '11:00:00', true),
(26, CURRENT_DATE, '14:00:00', true),
(26, CURRENT_DATE, '15:00:00', true),
(26, CURRENT_DATE + INTERVAL '1 day', '08:00:00', true),
(26, CURRENT_DATE + INTERVAL '1 day', '09:00:00', true),
(26, CURRENT_DATE + INTERVAL '1 day', '10:00:00', true);

-- 5. Thêm availability cho các ngày còn lại (ngày 3-7)
-- Script này tạo lịch cho tất cả bác sĩ mới trong 5 ngày tiếp theo
DO $$
DECLARE
    doc_id INT;
    day_offset INT;
BEGIN
    FOR doc_id IN 7..26 LOOP
        FOR day_offset IN 3..7 LOOP
            -- Morning slots (80% available)
            INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available)
            VALUES
                (doc_id, CURRENT_DATE + (day_offset || ' days')::INTERVAL, '08:00:00', (RANDOM() > 0.2)),
                (doc_id, CURRENT_DATE + (day_offset || ' days')::INTERVAL, '09:00:00', (RANDOM() > 0.2)),
                (doc_id, CURRENT_DATE + (day_offset || ' days')::INTERVAL, '10:00:00', (RANDOM() > 0.2)),
                (doc_id, CURRENT_DATE + (day_offset || ' days')::INTERVAL, '11:00:00', (RANDOM() > 0.3))
            ON CONFLICT DO NOTHING;
            
            -- Afternoon slots (75% available)
            INSERT INTO doctor_availability (doctor_id, date, time_slot, is_available)
            VALUES
                (doc_id, CURRENT_DATE + (day_offset || ' days')::INTERVAL, '14:00:00', (RANDOM() > 0.25)),
                (doc_id, CURRENT_DATE + (day_offset || ' days')::INTERVAL, '15:00:00', (RANDOM() > 0.25)),
                (doc_id, CURRENT_DATE + (day_offset || ' days')::INTERVAL, '16:00:00', (RANDOM() > 0.3)),
                (doc_id, CURRENT_DATE + (day_offset || ' days')::INTERVAL, '17:00:00', (RANDOM() > 0.4))
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 6. Thống kê sau khi thêm
SELECT 
    'Tổng số bác sĩ' AS metric,
    COUNT(*) AS value
FROM doctors
UNION ALL
SELECT 
    'Tổng số chuyên khoa',
    COUNT(DISTINCT specialty)
FROM doctors
UNION ALL
SELECT 
    'Tổng số chi nhánh',
    COUNT(*)
FROM branches
UNION ALL
SELECT 
    'Tổng số lịch làm việc',
    COUNT(*)
FROM doctor_availability;

-- 7. Thống kê bác sĩ theo chi nhánh
SELECT 
    b.branch_name,
    b.city,
    COUNT(d.doctor_id) AS total_doctors,
    AVG(d.rating)::NUMERIC(3,2) AS avg_rating
FROM branches b
LEFT JOIN doctors d ON b.branch_id = d.branch_id
GROUP BY b.branch_id, b.branch_name, b.city
ORDER BY b.city, b.branch_name;

-- 8. Thống kê bác sĩ theo chuyên khoa
SELECT 
    specialty,
    COUNT(*) AS total_doctors,
    AVG(rating)::NUMERIC(3,2) AS avg_rating,
    AVG(years_of_experience)::NUMERIC(4,1) AS avg_experience
FROM doctors
GROUP BY specialty
ORDER BY total_doctors DESC, avg_rating DESC;

COMMIT;
