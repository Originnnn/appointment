'use client';
import { useState } from 'react';
import DoctorAvailabilityTable from '@/components/DoctorAvailabilityTable';
import SmartBookingAssistant from '@/components/SmartBookingAssistant';
import DashboardHeader from '@/components/ui/DashboardHeader';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';

export default function SmartBookingPage() {
  const { user, loading: authLoading } = useAuth('patient');
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const handleSlotSelect = (slotData) => {
    setSelectedSlot(slotData);
  };

  const handleConfirmBooking = async (doctor, date, time) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt lịch');
      return;
    }

    setBookingInProgress(true);

    try {
      // Get patient_id from user
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('user_id', user.user_id)
        .single();

      if (patientError) {
        console.error('Patient error:', patientError);
        throw new Error('Không tìm thấy thông tin bệnh nhân: ' + patientError.message);
      }

      if (!patientData) {
        throw new Error('Không tìm thấy thông tin bệnh nhân');
      }

      console.log('Creating appointment with:', {
        patient_id: patientData.patient_id,
        doctor_id: doctor.doctor_id,
        date,
        time
      });

      // Create appointment - use 'note' instead of 'reason'
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientData.patient_id,
          doctor_id: doctor.doctor_id,
          appointment_date: date,
          appointment_time: time,
          status: 'pending',
          note: 'Đặt lịch qua hệ thống thông minh'
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Appointment insert error:', appointmentError);
        throw new Error('Lỗi tạo lịch hẹn: ' + appointmentError.message);
      }

      console.log('Appointment created:', appointmentData);

      // Mark time slot as unavailable
      await supabase
        .from('doctor_availability')
        .upsert({
          doctor_id: doctor.doctor_id,
          date: date,
          time_slot: time,
          is_available: false,
          reason: 'Đã có lịch hẹn'
        }, {
          onConflict: 'doctor_id,date,time_slot'
        });

      toast.success('🎉 Đặt lịch thành công!');
      setSelectedSlot(null);
      
      // Redirect to appointments page
      setTimeout(() => {
        router.push('/patient/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi đặt lịch');
    } finally {
      setBookingInProgress(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <DashboardHeader role="patient" />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Đặt lịch khám thông minh
              </h1>
              <p className="text-gray-600 mt-1">
                Xem lịch làm việc và tìm bác sĩ thay thế từ tất cả chi nhánh
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Xem lịch 7 ngày</h3>
                <p className="text-sm text-gray-600">Theo dõi giờ rảnh của bác sĩ</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Lọc theo chi nhánh</h3>
                <p className="text-sm text-gray-600">Chọn chi nhánh gần bạn</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gợi ý thông minh</h3>
                <p className="text-sm text-gray-600">Tự động tìm bác sĩ thay thế</p>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Table */}
        <DoctorAvailabilityTable 
          onDoctorTimeSelect={handleSlotSelect}
        />

        {/* Smart Booking Modal */}
        {selectedSlot && (
          <SmartBookingAssistant
            selectedSlot={selectedSlot}
            onConfirmBooking={handleConfirmBooking}
            onClose={() => setSelectedSlot(null)}
          />
        )}

        {/* Loading Overlay */}
        {bookingInProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-700 font-medium">Đang đặt lịch...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
