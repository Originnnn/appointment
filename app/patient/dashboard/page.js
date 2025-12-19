'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import ChatButton from '@/components/ChatButton';
import DashboardHeader from '@/components/ui/DashboardHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { usePatient } from '@/hooks/usePatient';
import { useAppointments } from '@/hooks/useAppointments';
import { formatDate, formatTime } from '@/utils/formatters';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_VARIANTS } from '@/utils/constants';

export default function PatientDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth('patient');
  const { patient, isLoading: patientLoading } = usePatient(user?.user_id);
  const { appointments, isLoading: appointmentsLoading, updateStatus, refetch } = useAppointments({
    patientId: patient?.patient_id
  });
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDoctors();
    }
  }, [user]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      setDoctors(data || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Không thể tải danh sách bác sĩ');
    }
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
      const result = await updateStatus(appointmentId, 'cancelled');
      if (result.success) {
        alert('Đã hủy lịch hẹn thành công!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Không thể hủy lịch hẹn. Vui lòng thử lại!');
    }
  };

  const isLoading = authLoading || patientLoading || appointmentsLoading;

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Đang tải thông tin..." />;
  }

  // Prepare table columns for appointments
  const appointmentColumns = [
    {
      key: 'appointment_date',
      label: 'Ngày',
      render: (value) => formatDate(value)
    },
    {
      key: 'appointment_time',
      label: 'Giờ',
      render: (value) => formatTime(value)
    },
    {
      key: 'doctor',
      label: 'Bác sĩ',
      render: (value, row) => row.doctor?.full_name || '-'
    },
    {
      key: 'specialty',
      label: 'Chuyên khoa',
      render: (value, row) => row.doctor?.specialty || '-'
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <Badge variant={APPOINTMENT_STATUS_VARIANTS[value]}>
          {APPOINTMENT_STATUS_LABELS[value]}
        </Badge>
      )
    },
    {
      key: 'note',
      label: 'Ghi chú',
      render: (value) => value || '-'
    },
    {
      key: 'chat',
      label: 'Nhắn tin',
      render: (value, row) => (
        row.doctor_id && patient ? (
          <ChatButton
            conversationId={`patient_${patient.patient_id}_doctor_${row.doctor_id}`}
            currentUser={{
              id: patient.patient_id,
              name: patient.full_name,
              type: 'patient'
            }}
            otherUser={{
              id: row.doctor_id,
              name: row.doctor?.full_name,
              type: 'doctor'
            }}
            label="💬"
          />
        ) : null
      )
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (value, row) => (
        (row.status === 'pending' || row.status === 'confirmed') && (
          <Button
            variant="danger"
            size="small"
            onClick={() => handleCancelAppointment(row.appointment_id, row.status)}
            ariaLabel={`Hủy lịch hẹn ngày ${formatDate(row.appointment_date)}`}
          >
            Hủy lịch
          </Button>
        )
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <DashboardHeader
          title="Dashboard Bệnh Nhân"
          subtitle="Quản lý lịch hẹn và theo dõi sức khỏe"
          userName={patient?.full_name}
          userRole="patient"
          gradientFrom="from-blue-600"
          gradientTo="to-purple-600"
          onLogout={logout}
        />

        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={() => {
              setError(null);
              fetchDoctors();
            }} 
          />
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Thông tin cá nhân */}
          <Card className="animate-fade-in">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Thông tin cá nhân
              </h2>
            </div>
            <div className="space-y-2 text-gray-700">
              <p><strong>Họ tên:</strong> {patient?.full_name}</p>
              <p><strong>Giới tính:</strong> {patient?.gender || 'Chưa cập nhật'}</p>
              <p><strong>Ngày sinh:</strong> {patient?.date_of_birth ? formatDate(patient.date_of_birth) : 'Chưa cập nhật'}</p>
              <p><strong>Số điện thoại:</strong> {patient?.phone}</p>
              <p><strong>Địa chỉ:</strong> {patient?.address || 'Chưa cập nhật'}</p>
            </div>
            <div className="space-y-2 mt-6">
              <Button 
                onClick={() => router.push('/patient/profile')}
                variant="primary"
                fullWidth
                ariaLabel="Cập nhật thông tin cá nhân"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Cập nhật thông tin
              </Button>
              <Button 
                onClick={() => router.push('/patient/medical-records')}
                variant="secondary"
                fullWidth
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                ariaLabel="Xem hồ sơ bệnh án"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Xem hồ sơ bệnh án
              </Button>
            </div>
          </Card>

          {/* Đặt lịch hẹn mới */}
          <Card className="animate-fade-in animation-delay-100">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-green-600">Đặt lịch hẹn mới</h2>
            </div>
            <Button
              onClick={() => router.push('/patient/book-appointment')}
              variant="success"
              fullWidth
              size="large"
              ariaLabel="Đặt lịch khám bệnh"
            >
              <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Đặt lịch khám
            </Button>
            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-gray-700">Danh sách bác sĩ ({doctors.length}):</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {doctors.map((doctor, index) => (
                  <Card
                    key={doctor.doctor_id}
                    className="p-3 animate-slide-up"
                    style={{animationDelay: `${index * 50}ms`}}
                    hover
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-semibold text-gray-800">{doctor.full_name}</p>
                        <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Danh sách lịch hẹn */}
        <Card className="animate-fade-in animation-delay-200">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-bold ml-3 text-purple-600">Lịch hẹn của tôi ({appointments.length})</h2>
          </div>
          
          <Table
            columns={appointmentColumns}
            data={appointments}
            emptyMessage="Bạn chưa có lịch hẹn nào. Hãy đặt lịch khám ngay!"
            responsive={true}
            hoverable={true}
          />
        </Card>
      </div>
    </div>
  );
}
