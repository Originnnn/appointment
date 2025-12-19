'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import DashboardHeader from '@/components/ui/DashboardHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { formatDate, formatTime } from '@/utils/formatters';
import { APPOINTMENT_STATUS_VARIANTS } from '@/utils/constants';

export default function DoctorMedicalRecords() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    console.log('Parsed user:', parsedUser); // Debug log
    fetchDoctorAndAppointments(parsedUser.user_id || parsedUser.id);
  }, [router]);

  const fetchDoctorAndAppointments = async (userId) => {
    try {
      setLoading(true);

      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (doctorError) {
        console.error('Doctor Error:', doctorError);
        throw doctorError;
      }
      
      if (!doctorData) {
        throw new Error('Không tìm thấy thông tin bác sĩ');
      }
      
      setDoctor(doctorData);

      console.log('Doctor data:', doctorData); // Debug log

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            full_name,
            date_of_birth,
            phone,
            address
          )
        `)
        .eq('doctor_id', doctorData.doctor_id)
        .order('appointment_date', { ascending: false });

      if (appointmentsError) {
        console.error('Appointments Error:', appointmentsError);
        throw appointmentsError;
      }
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi khi tải dữ liệu: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (appointment) => {
    setSelectedAppointment(appointment);
    
    try {
      const { data: existingRecord } = await supabase
        .from('medical_records')
        .select('*')
        .eq('appointment_id', appointment.appointment_id)
        .single();

      if (existingRecord) {
        setFormData({
          diagnosis: existingRecord.diagnosis || '',
          treatment: existingRecord.treatment || ''
        });
      } else {
        setFormData({
          diagnosis: '',
          treatment: ''
        });
      }
    } catch (error) {
      console.error('Error fetching medical record:', error);
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
    setFormData({
      diagnosis: '',
      treatment: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.diagnosis?.trim()) {
      newErrors.diagnosis = 'Chẩn đoán là bắt buộc';
    } else if (formData.diagnosis.length > 1000) {
      newErrors.diagnosis = 'Chẩn đoán không được quá 1000 ký tự';
    }

    if (!formData.treatment?.trim()) {
      newErrors.treatment = 'Phương pháp điều trị là bắt buộc';
    } else if (formData.treatment.length > 1000) {
      newErrors.treatment = 'Phương pháp điều trị không được quá 1000 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const { data: existingRecord } = await supabase
        .from('medical_records')
        .select('record_id')
        .eq('appointment_id', selectedAppointment.appointment_id)
        .single();

      const recordData = {
        appointment_id: selectedAppointment.appointment_id,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment
      };

      let error;
      if (existingRecord) {
        ({ error } = await supabase
          .from('medical_records')
          .update(recordData)
          .eq('record_id', existingRecord.record_id));
      } else {
        ({ error } = await supabase
          .from('medical_records')
          .insert([recordData]));
      }

      if (error) throw error;

      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('appointment_id', selectedAppointment.appointment_id);

      await fetchDoctorAndAppointments(user.user_id || user.id);
      handleCloseModal();
    } catch (error) {
      console.error('Error saving medical record:', error);
      alert('Có lỗi xảy ra khi lưu hồ sơ bệnh án!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleBack = () => {
    router.push('/doctor/dashboard');
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader
          title="Hồ Sơ Bệnh Án"
          subtitle="Quản lý hồ sơ bệnh án của bệnh nhân"
          userName={doctor?.full_name}
          gradientFrom="from-green-600"
          gradientTo="to-emerald-600"
          onLogout={handleLogout}
          onBack={handleBack}
        />

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Danh sách lịch hẹn
              </h2>
              <p className="text-gray-600 text-sm mt-1">Nhấn vào lịch hẹn để xem/tạo hồ sơ bệnh án</p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
              {appointments.length} lịch hẹn
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bệnh nhân
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày khám
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Không có lịch hẹn nào
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment, index) => (
                    <tr 
                      key={appointment.appointment_id} 
                      className="hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all cursor-pointer animate-fade-in border-b border-gray-100"
                      style={{animationDelay: `${index * 50}ms`}}
                      onClick={() => handleOpenModal(appointment)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {appointment.patients?.full_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {appointment.patients?.full_name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {appointment.patients?.phone || 'Chưa có SĐT'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(appointment.appointment_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(appointment.appointment_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={APPOINTMENT_STATUS_VARIANTS[appointment.status]}>
                          {appointment.status === 'pending' && 'Chờ xác nhận'}
                          {appointment.status === 'confirmed' && 'Đã xác nhận'}
                          {appointment.status === 'completed' && 'Hoàn thành'}
                          {appointment.status === 'cancelled' && 'Đã hủy'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {appointment.status === 'completed' ? (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Đã có hồ sơ
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Chưa tạo
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={selectedAppointment?.status === 'completed' 
          ? 'Hồ Sơ Bệnh Án' 
          : 'Tạo Hồ Sơ Bệnh Án Mới'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {selectedAppointment && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200 space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Thông tin bệnh nhân
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-600 mb-1">Họ tên:</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedAppointment.patients?.full_name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-600 mb-1">Ngày sinh:</span>
                  <span className="text-sm text-gray-900">{selectedAppointment.patients?.date_of_birth ? formatDate(selectedAppointment.patients.date_of_birth) : 'Chưa có'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-600 mb-1">Số điện thoại:</span>
                  <span className="text-sm text-gray-900">{selectedAppointment.patients?.phone || 'Chưa có'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-600 mb-1">Địa chỉ:</span>
                  <span className="text-sm text-gray-900">{selectedAppointment.patients?.address || 'Chưa có'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-600 mb-1">Ngày khám:</span>
                  <span className="text-sm text-gray-900">{formatDate(selectedAppointment.appointment_date)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-600 mb-1">Thời gian:</span>
                  <span className="text-sm text-gray-900">{formatTime(selectedAppointment.appointment_time)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Hồ sơ bệnh án
            </h3>

            <div className="space-y-4">
              <Input
                label="Chẩn đoán"
                type="textarea"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                error={errors.diagnosis}
                placeholder="Nhập chẩn đoán bệnh của bệnh nhân..."
                rows={4}
                required
              />

              <Input
                label="Phương pháp điều trị"
                type="textarea"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                error={errors.treatment}
                placeholder="Nhập phương pháp điều trị, đơn thuốc, lưu ý..."
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="success"
              loading={submitting}
            >
              {submitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </div>
  );
}
