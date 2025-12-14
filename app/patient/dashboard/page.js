'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Lấy thông tin patient
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      setPatient(patientData);

      // Lấy danh sách lịch hẹn
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors (
            full_name,
            specialty
          )
        `)
        .eq('patient_id', patientData.patient_id)
        .order('appointment_date', { ascending: true });

      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    const { data } = await supabase
      .from('doctors')
      .select('*')
      .order('full_name');
    setDoctors(data || []);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleCancelAppointment = async (appointmentId, status) => {
    if (status === 'cancelled' || status === 'completed') {
      alert('Không thể hủy lịch hẹn này!');
      return;
    }

    if (!confirm('Bạn có chắc muốn hủy lịch hẹn này?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('appointment_id', appointmentId);

      if (!error) {
        // Refresh appointments
        const userData = localStorage.getItem('user');
        const parsedUser = JSON.parse(userData);
        fetchPatientData(parsedUser.user_id);
        alert('Đã hủy lịch hẹn thành công!');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Không thể hủy lịch hẹn. Vui lòng thử lại!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard - Bệnh Nhân</h1>
          <div className="flex items-center gap-4">
            <span>Xin chào, {patient?.full_name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Thông tin cá nhân */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-blue-600">Thông tin cá nhân</h2>
            <div className="space-y-2">
              <p><strong>Họ tên:</strong> {patient?.full_name}</p>
              <p><strong>Giới tính:</strong> {patient?.gender || 'Chưa cập nhật'}</p>
              <p><strong>Ngày sinh:</strong> {patient?.date_of_birth || 'Chưa cập nhật'}</p>
              <p><strong>Số điện thoại:</strong> {patient?.phone}</p>
              <p><strong>Địa chỉ:</strong> {patient?.address || 'Chưa cập nhật'}</p>
            </div>
            <button 
              onClick={() => router.push('/patient/profile')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cập nhật thông tin
            </button>
          </div>

          {/* Đặt lịch hẹn mới */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-blue-600">Đặt lịch hẹn mới</h2>
            <button
              onClick={() => router.push('/patient/book-appointment')}
              className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 text-lg"
            >
              + Đặt lịch khám
            </button>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Danh sách bác sĩ:</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {doctors.map((doctor) => (
                  <div key={doctor.doctor_id} className="p-2 border rounded">
                    <p className="font-semibold">{doctor.full_name}</p>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách lịch hẹn */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-blue-600">Lịch hẹn của tôi</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500">Bạn chưa có lịch hẹn nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Ngày</th>
                    <th className="p-3 text-left">Giờ</th>
                    <th className="p-3 text-left">Bác sĩ</th>
                    <th className="p-3 text-left">Chuyên khoa</th>
                    <th className="p-3 text-left">Trạng thái</th>
                    <th className="p-3 text-left">Ghi chú</th>
                    <th className="p-3 text-left">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.appointment_id} className="border-t">
                      <td className="p-3">{apt.appointment_date}</td>
                      <td className="p-3">{apt.appointment_time}</td>
                      <td className="p-3">{apt.doctors?.full_name}</td>
                      <td className="p-3">{apt.doctors?.specialty}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            apt.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : apt.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : apt.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {apt.status === 'confirmed'
                            ? 'Đã xác nhận'
                            : apt.status === 'pending'
                            ? 'Chờ xác nhận'
                            : apt.status === 'cancelled'
                            ? 'Đã hủy'
                            : 'Hoàn thành'}
                        </span>
                      </td>
                      <td className="p-3">{apt.note || '-'}</td>
                      <td className="p-3">
                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                          <button
                            onClick={() =>
                              handleCancelAppointment(apt.appointment_id, apt.status)
                            }
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Hủy lịch
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
