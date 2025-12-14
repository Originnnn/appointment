'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function BookAppointment() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doctorSchedules, setDoctorSchedules] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'patient') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchPatientData(parsedUser.user_id);
    fetchDoctors();
  }, [router]);

  const fetchPatientData = async (userId) => {
    try {
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      setPatient(patientData);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await supabase
        .from('doctors')
        .select('*')
        .order('full_name');
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchDoctorSchedules = async (doctorId, date) => {
    try {
      const { data } = await supabase
        .from('working_schedules')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('work_date', date);
      
      setDoctorSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setDoctorSchedules([]);
    }
  };

  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      fetchDoctorSchedules(selectedDoctor, appointmentDate);
    }
  }, [selectedDoctor, appointmentDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      setError('Vui lòng điền đầy đủ thông tin!');
      setLoading(false);
      return;
    }

    // Kiểm tra ngày không được trong quá khứ
    const today = new Date().toISOString().split('T')[0];
    if (appointmentDate < today) {
      setError('Không thể đặt lịch hẹn trong quá khứ!');
      setLoading(false);
      return;
    }

    try {
      // Kiểm tra xem bác sĩ có lịch làm việc vào ngày này không
      if (doctorSchedules.length === 0) {
        setError('Bác sĩ không làm việc vào ngày này!');
        setLoading(false);
        return;
      }

      // Kiểm tra giờ khám có nằm trong lịch làm việc không
      const timeInSchedule = doctorSchedules.some(schedule => {
        return appointmentTime >= schedule.start_time && appointmentTime <= schedule.end_time;
      });

      if (!timeInSchedule) {
        setError('Giờ khám không nằm trong lịch làm việc của bác sĩ!');
        setLoading(false);
        return;
      }

      // Kiểm tra xem đã có lịch hẹn nào vào thời gian này chưa
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', selectedDoctor)
        .eq('appointment_date', appointmentDate)
        .eq('appointment_time', appointmentTime)
        .in('status', ['pending', 'confirmed']);

      if (existingAppointments && existingAppointments.length > 0) {
        setError('Lịch hẹn này đã có người đặt. Vui lòng chọn giờ khác!');
        setLoading(false);
        return;
      }

      // Tạo lịch hẹn mới
      const { error: insertError } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: patient.patient_id,
            doctor_id: selectedDoctor,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            status: 'pending',
            note: note,
          },
        ]);

      if (insertError) {
        setError('Không thể đặt lịch hẹn. Vui lòng thử lại!');
        console.error(insertError);
        setLoading(false);
        return;
      }

      alert('Đặt lịch hẹn thành công! Vui lòng chờ bác sĩ xác nhận.');
      router.push('/patient/dashboard');
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctorInfo = doctors.find(d => d.doctor_id == selectedDoctor);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Đặt Lịch Hẹn</h1>
          <button
            onClick={() => router.push('/patient/dashboard')}
            className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-600"
          >
            ← Quay lại
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">Thông tin đặt lịch</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chọn bác sĩ */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Chọn bác sĩ <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map((doctor) => (
                  <option key={doctor.doctor_id} value={doctor.doctor_id}>
                    {doctor.full_name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Thông tin bác sĩ */}
            {selectedDoctorInfo && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Thông tin bác sĩ:</h3>
                <p><strong>Họ tên:</strong> {selectedDoctorInfo.full_name}</p>
                <p><strong>Chuyên khoa:</strong> {selectedDoctorInfo.specialty}</p>
                <p><strong>Số điện thoại:</strong> {selectedDoctorInfo.phone}</p>
                <p><strong>Mô tả:</strong> {selectedDoctorInfo.description || 'Không có'}</p>
              </div>
            )}

            {/* Chọn ngày */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Ngày khám <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Hiển thị lịch làm việc */}
            {selectedDoctor && appointmentDate && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-700 mb-2">Lịch làm việc:</h3>
                {doctorSchedules.length === 0 ? (
                  <p className="text-red-600">⚠️ Bác sĩ không làm việc vào ngày này!</p>
                ) : (
                  <div className="space-y-1">
                    {doctorSchedules.map((schedule) => (
                      <p key={schedule.schedule_id}>
                        ✓ {schedule.start_time} - {schedule.end_time}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chọn giờ */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Giờ khám <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Vui lòng chọn giờ trong khung làm việc của bác sĩ
              </p>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Triệu chứng, lý do khám..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || doctorSchedules.length === 0}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-semibold"
              >
                {loading ? 'Đang xử lý...' : 'Đặt lịch hẹn'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/patient/dashboard')}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
