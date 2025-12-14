'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'doctor') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchDoctorData(parsedUser.user_id);
  }, [router]);

  const fetchDoctorData = async (userId) => {
    try {
      // Lấy thông tin doctor
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single();

      setDoctor(doctorData);

      // Lấy danh sách lịch hẹn
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            full_name,
            phone
          )
        `)
        .eq('doctor_id', doctorData.doctor_id)
        .order('appointment_date', { ascending: true });

      setAppointments(appointmentsData || []);

      // Lấy lịch làm việc
      const { data: schedulesData } = await supabase
        .from('working_schedules')
        .select('*')
        .eq('doctor_id', doctorData.doctor_id)
        .order('work_date', { ascending: true });

      setSchedules(schedulesData || []);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('appointment_id', appointmentId);

      if (!error) {
        // Refresh appointments
        const userData = localStorage.getItem('user');
        const parsedUser = JSON.parse(userData);
        fetchDoctorData(parsedUser.user_id);
        alert('Cập nhật trạng thái thành công!');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
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
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard - Bác Sĩ</h1>
          <div className="flex items-center gap-4">
            <span>Xin chào, {doctor?.full_name}</span>
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
            <h2 className="text-xl font-bold mb-4 text-green-600">Thông tin cá nhân</h2>
            <div className="space-y-2">
              <p><strong>Họ tên:</strong> {doctor?.full_name}</p>
              <p><strong>Chuyên khoa:</strong> {doctor?.specialty}</p>
              <p><strong>Số điện thoại:</strong> {doctor?.phone}</p>
              <p><strong>Mô tả:</strong> {doctor?.description || 'Chưa cập nhật'}</p>
            </div>
            <button 
              onClick={() => router.push('/doctor/profile')}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Cập nhật thông tin
            </button>
          </div>

          {/* Lịch làm việc */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-green-600">Lịch làm việc</h2>
            {schedules.length === 0 ? (
              <p className="text-gray-500">Chưa có lịch làm việc.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {schedules.map((schedule) => (
                  <div key={schedule.schedule_id} className="p-3 border rounded">
                    <p className="font-semibold">{schedule.work_date}</p>
                    <p className="text-sm text-gray-600">
                      {schedule.start_time} - {schedule.end_time}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <button 
              onClick={() => router.push('/doctor/schedule')}
              className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Quản lý lịch làm việc
            </button>
          </div>
        </div>

        {/* Danh sách lịch hẹn */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-green-600">Lịch hẹn</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500">Chưa có lịch hẹn nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Ngày</th>
                    <th className="p-3 text-left">Giờ</th>
                    <th className="p-3 text-left">Bệnh nhân</th>
                    <th className="p-3 text-left">SĐT</th>
                    <th className="p-3 text-left">Ghi chú</th>
                    <th className="p-3 text-left">Trạng thái</th>
                    <th className="p-3 text-left">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.appointment_id} className="border-t">
                      <td className="p-3">{apt.appointment_date}</td>
                      <td className="p-3">{apt.appointment_time}</td>
                      <td className="p-3">{apt.patients?.full_name}</td>
                      <td className="p-3">{apt.patients?.phone}</td>
                      <td className="p-3">{apt.note || '-'}</td>
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
                      <td className="p-3">
                        {apt.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleUpdateAppointmentStatus(apt.appointment_id, 'confirmed')
                              }
                              className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateAppointmentStatus(apt.appointment_id, 'cancelled')
                              }
                              className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Từ chối
                            </button>
                          </div>
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
