'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import DashboardHeader from '@/components/ui/DashboardHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { usePatient } from '@/hooks/usePatient';
import { formatDate, formatTime, formatDateTime } from '@/utils/formatters';

export default function PatientMedicalRecords() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth('patient');
  const { patient, isLoading: patientLoading } = usePatient(user?.user_id);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (patient?.patient_id) {
      fetchMedicalRecords(patient.patient_id);
    }
  }, [patient]);

  const fetchMedicalRecords = async (patientId) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          appointments!inner (
            appointment_date,
            appointment_time,
            note,
            patient_id,
            doctors (
              full_name,
              specialty
            )
          )
        `)
        .eq('appointments.patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loading = authLoading || patientLoading || isLoading;

  if (loading) {
    return <LoadingSpinner fullScreen message="Đang tải hồ sơ bệnh án..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <DashboardHeader
          title="Hồ Sơ Bệnh Án"
          subtitle="Lịch sử khám bệnh và điều trị của bạn"
          userName={patient?.full_name}
          userRole="patient"
          gradientFrom="from-blue-600"
          gradientTo="to-cyan-600"
          onLogout={logout}
        />

        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/patient/dashboard')}
            ariaLabel="Quay lại dashboard"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại Dashboard
          </Button>
        </div>

        {records.length === 0 ? (
          <Card className="p-12 text-center animate-fade-in">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có hồ sơ bệnh án</h3>
            <p className="text-gray-500 mb-6">Bạn chưa có lịch sử khám bệnh nào.</p>
            <Button onClick={() => router.push('/patient/book-appointment')} variant="primary">
              Đặt lịch khám ngay
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Danh sách hồ sơ */}
            <Card className="animate-fade-in">
              <h2 className="text-xl font-bold mb-4 text-blue-600 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Lịch sử khám bệnh
                <Badge variant="info" className="ml-auto">
                  {records.length} bản ghi
                </Badge>
              </h2>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {records.map((record, index) => (
                  <Card
                    key={record.record_id}
                    onClick={() => setSelectedRecord(record)}
                    hover
                    className={`cursor-pointer transition-all duration-200 animate-slide-up ${
                      selectedRecord?.record_id === record.record_id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : ''
                    }`}
                    style={{animationDelay: `${index * 50}ms`}}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-lg text-blue-800">
                          Bác sĩ {record.appointments?.doctors?.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {record.appointments?.doctors?.specialty}
                        </p>
                      </div>
                      <Badge variant="success">Hoàn thành</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(record.appointments?.appointment_date)} • {formatTime(record.appointments?.appointment_time)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Chi tiết hồ sơ */}
            <Card className="animate-fade-in animation-delay-100">
              <h2 className="text-xl font-bold mb-4 text-blue-600 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Chi tiết khám bệnh
              </h2>

              {!selectedRecord ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">Chọn một bản ghi để xem chi tiết</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Thông tin khám */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-lg mb-2 text-blue-800">
                      Bác sĩ {selectedRecord.appointments?.doctors?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedRecord.appointments?.doctors?.specialty}</p>
                    <p className="text-sm text-gray-600 mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(selectedRecord.appointments?.appointment_date)} • {formatTime(selectedRecord.appointments?.appointment_time)}
                    </p>
                  </div>

                  {/* Chẩn đoán */}
                  <div className="border-2 border-red-100 rounded-lg p-4 bg-red-50/50">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="font-semibold text-gray-800">Chẩn đoán</h4>
                    </div>
                    <div className="pl-7 text-gray-700 whitespace-pre-wrap">
                      {selectedRecord.diagnosis || 'Không có thông tin'}
                    </div>
                  </div>

                  {/* Điều trị */}
                  <div className="border-2 border-green-100 rounded-lg p-4 bg-green-50/50">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <h4 className="font-semibold text-gray-800">Điều trị</h4>
                    </div>
                    <div className="pl-7 text-gray-700 whitespace-pre-wrap">
                      {selectedRecord.treatment || 'Không có thông tin'}
                    </div>
                  </div>

                  {/* Đơn thuốc */}
                  {selectedRecord.prescription && (
                    <div className="border-2 border-purple-100 rounded-lg p-4 bg-purple-50/50">
                      <div className="flex items-center mb-3">
                        <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h4 className="font-semibold text-gray-800">Đơn thuốc</h4>
                      </div>
                      <div className="pl-7 text-gray-700 whitespace-pre-wrap">
                        {selectedRecord.prescription}
                      </div>
                    </div>
                  )}

                  {/* Ghi chú bác sĩ */}
                  {selectedRecord.notes && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <h4 className="font-semibold text-gray-800">Ghi chú của bác sĩ</h4>
                      </div>
                      <div className="pl-7 text-gray-700 whitespace-pre-wrap">
                        {selectedRecord.notes}
                      </div>
                    </div>
                  )}

                  {/* Ghi chú lúc đặt lịch */}
                  {selectedRecord.appointments?.note && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <h4 className="font-semibold text-gray-800">Ghi chú lúc đặt lịch</h4>
                      </div>
                      <div className="pl-7 text-gray-700">
                        {selectedRecord.appointments.note}
                      </div>
                    </div>
                  )}

                  {/* Thời gian tạo */}
                  {selectedRecord.created_at && (
                    <div className="text-xs text-gray-500 text-center pt-3 border-t">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ghi nhận lúc: {formatDateTime(selectedRecord.created_at)}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
