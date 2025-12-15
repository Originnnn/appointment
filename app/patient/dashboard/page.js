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
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-blue-100">Bệnh nhân</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm text-blue-100">Xin chào,</p>
              <p className="font-semibold">{patient?.full_name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Thông tin cá nhân */}
          <div className="bg-white p-6 rounded-xl shadow-lg card-hover animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 gradient-text">Thông tin cá nhân</h2>
            </div>
            <div className="space-y-2">
              <p><strong>Họ tên:</strong> {patient?.full_name}</p>
              <p><strong>Giới tính:</strong> {patient?.gender || 'Chưa cập nhật'}</p>
              <p><strong>Ngày sinh:</strong> {patient?.date_of_birth || 'Chưa cập nhật'}</p>
              <p><strong>Số điện thoại:</strong> {patient?.phone}</p>
              <p><strong>Địa chỉ:</strong> {patient?.address || 'Chưa cập nhật'}</p>
            </div>
            <div className="space-y-2 mt-4">
              <button 
                onClick={() => router.push('/patient/profile')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Cập nhật thông tin</span>
              </button>
              <button 
                onClick={() => router.push('/patient/medical-records')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Xem hồ sơ bệnh án</span>
              </button>
            </div>
          </div>

          {/* Đặt lịch hẹn mới */}
          <div className="bg-white p-6 rounded-xl shadow-lg card-hover animate-fadeIn" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-green-600">Đặt lịch hẹn mới</h2>
            </div>
            <button
              onClick={() => router.push('/patient/book-appointment')}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-4 rounded-lg hover:from-green-700 hover:to-emerald-700 text-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Đặt lịch khám</span>
            </button>
            <div className="mt-4">
              <h3 className="font-semibold mb-3 text-gray-700">Danh sách bác sĩ:</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {doctors.map((doctor, index) => (
                  <div 
                    key={doctor.doctor_id} 
                    className="p-3 border border-gray-200 rounded-lg hover:border-green-500 transition-all duration-200 hover:shadow-md cursor-pointer"
                    style={{animation: `slideIn 0.3s ease-out ${index * 0.05}s backwards`}}
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-full">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-semibold text-gray-800">{doctor.full_name}</p>
                        <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách lịch hẹn */}
        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-bold ml-3 text-purple-600">Lịch hẹn của tôi</h2>
          </div>
          {appointments.length === 0 ? (
            <p className="text-gray-500">Bạn chưa có lịch hẹn nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-700">Ngày</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Giờ</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Bác sĩ</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Chuyên khoa</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Trạng thái</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Ghi chú</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt, index) => (
                    <tr key={apt.appointment_id} className="border-t table-row-hover" style={{animation: `fadeIn 0.3s ease-out ${index * 0.05}s backwards`}}>
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
                      <td className="p-4">
                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                          <button
                            onClick={() =>
                              handleCancelAppointment(apt.appointment_id, apt.status)
                            }
                            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Hủy lịch</span>
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
