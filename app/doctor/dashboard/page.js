'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import ChatButton from '@/components/ChatButton';
import AIChatbot from '@/components/AIChatbot';
import DashboardHeader from '@/components/ui/DashboardHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDate, formatTime } from '@/utils/formatters';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_VARIANTS } from '@/utils/constants';

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
    return <LoadingSpinner fullScreen message="Đang tải thông tin..." />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <DashboardHeader
          title="Dashboard Bác Sĩ"
          subtitle="Quản lý lịch hẹn và theo dõi bệnh nhân"
          userName={doctor?.full_name}
          gradientFrom="from-green-600"
          gradientTo="to-emerald-600"
          onLogout={handleLogout}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Tổng lịch hẹn</p>
                <p className="text-3xl font-bold mt-2">{appointments.length}</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-linear-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Đã xác nhận</p>
                <p className="text-3xl font-bold mt-2">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Chờ xác nhận</p>
                <p className="text-3xl font-bold mt-2">
                  {appointments.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Thông tin cá nhân */}
          <Card className="animate-fade-in">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-gray-800">Thông tin cá nhân</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Họ tên</p>
                  <p className="font-semibold text-gray-800">{doctor?.full_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Chuyên khoa</p>
                  <p className="font-semibold text-gray-800">{doctor?.specialty}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Số điện thoại</p>
                  <p className="font-semibold text-gray-800">{doctor?.phone}</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/doctor/profile')}
              variant="secondary"
              className="w-full mt-6"
            >
              Cập nhật thông tin
            </Button>
          </Card>

          {/* Lịch làm việc */}
          <Card className="animate-fade-in animation-delay-100">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-gray-800">Lịch làm việc</h2>
            </div>
            {schedules.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">Chưa có lịch làm việc</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {schedules.slice(0, 5).map((schedule) => (
                  <div key={schedule.schedule_id} className="p-3 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-blue-900">{formatDate(schedule.work_date)}</p>
                      <Badge variant="info" className="text-xs">Làm việc</Badge>
                    </div>
                    <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2 mt-6">
              <Button 
                onClick={() => router.push('/doctor/schedule')}
                variant="primary"
                className="w-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Quản lý lịch làm việc
              </Button>
              <Button 
                onClick={() => router.push('/doctor/medical-records')}
                variant="success"
                className="w-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Hồ sơ bệnh án
              </Button>
            </div>
          </Card>
        </div>

        {/* Danh sách lịch hẹn */}
        <Card className="mt-8 animate-fade-in animation-delay-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-gray-800">Danh sách lịch hẹn</h2>
            </div>
            <Badge variant="info">{appointments.length} lịch hẹn</Badge>
          </div>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg">Chưa có lịch hẹn nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Ngày khám</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Thời gian</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Bệnh nhân</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Liên hệ</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Ghi chú</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Chat</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt, index) => (
                    <tr 
                      key={apt.appointment_id} 
                      className="border-t border-gray-100 hover:bg-linear-to-r hover:from-gray-50 hover:to-transparent transition-all animate-fade-in" 
                      style={{animationDelay: `${index * 50}ms`}}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-gray-900">{formatDate(apt.appointment_date)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700">{formatTime(apt.appointment_time)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {apt.patients?.full_name?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{apt.patients?.full_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">{apt.patients?.phone}</td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">{apt.note || '-'}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={APPOINTMENT_STATUS_VARIANTS[apt.status] || 'default'}>
                          {APPOINTMENT_STATUS_LABELS[apt.status] || apt.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {apt.patient_id && doctor && (
                          <ChatButton
                            conversationId={`patient_${apt.patient_id}_doctor_${doctor.doctor_id}`}
                            currentUser={{
                              id: doctor.doctor_id,
                              name: doctor.full_name,
                              type: 'doctor'
                            }}
                            otherUser={{
                              id: apt.patient_id,
                              name: apt.patients?.full_name,
                              type: 'patient'
                            }}
                            label="💬"
                          />
                        )}
                      </td>
                      <td className="p-4">
                        {apt.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUpdateAppointmentStatus(apt.appointment_id, 'confirmed')}
                              variant="success"
                              size="sm"
                            >
                              Xác nhận
                            </Button>
                            <Button
                              onClick={() => handleUpdateAppointmentStatus(apt.appointment_id, 'cancelled')}
                              variant="danger"
                              size="sm"
                            >
                              Từ chối
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* AI Medical Assistant */}
      <AIChatbot
        user={user}
        patient={null}
        doctors={doctor ? [doctor] : []}
        appointments={appointments}
        medicalRecords={[]}
      />
    </div>
  );
}
