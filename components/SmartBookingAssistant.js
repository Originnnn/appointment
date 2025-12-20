'use client';
import { useState } from 'react';
import Modal from './ui/Modal';
import AlternativeDoctorSuggestions from './AlternativeDoctorSuggestions';
import toast from 'react-hot-toast';

/**
 * Component: Smart Booking Assistant
 * Xử lý logic đặt lịch thông minh với gợi ý bác sĩ thay thế
 */
export default function SmartBookingAssistant({ 
  selectedSlot,  // { doctor, date, time, isAvailable }
  onConfirmBooking,
  onClose 
}) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleBooking = async () => {
    if (!selectedSlot) return;

    const { doctor, date, time, isAvailable } = selectedSlot;

    // Nếu slot đánh dấu không available từ table
    if (isAvailable === false) {
      setShowAlternatives(true);
      toast.error('Bác sĩ đã có lịch hẹn vào giờ này');
      return;
    }

    // Double-check với API
    setChecking(true);
    try {
      const response = await fetch(
        `/api/doctor-availability?doctorId=${doctor.doctor_id}&date=${date}&time=${time}`
      );
      
      const data = await response.json();

      if (data.is_busy) {
        // Bác sĩ bận - show alternatives
        setShowAlternatives(true);
        toast.error('Bác sĩ đã có lịch hẹn. Hãy chọn bác sĩ thay thế!');
      } else {
        // OK - proceed to booking
        onConfirmBooking(doctor, date, time);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      // Nếu lỗi API, vẫn cho đặt
      onConfirmBooking(doctor, date, time);
    } finally {
      setChecking(false);
    }
  };

  if (!selectedSlot) return null;

  const { doctor, date, time, isAvailable } = selectedSlot;

  return (
    <>
      {!showAlternatives ? (
        <Modal
          isOpen={true}
          onClose={onClose}
          title={isAvailable ? "Xác nhận đặt lịch" : "Bác sĩ đã có lịch hẹn"}
        >
          <div className="space-y-6">
            {/* Doctor Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {doctor.full_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{doctor.full_name}</h3>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  {doctor.branches && (
                    <div className="flex items-center space-x-1 mt-1 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{doctor.branches.branch_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày khám</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(date).toLocaleDateString('vi-VN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giờ khám</p>
                  <p className="font-semibold text-gray-900">{time.substring(0, 5)}</p>
                </div>
              </div>
            </div>

            {/* Warning if busy */}
            {isAvailable === false && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-orange-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-orange-900">Bác sĩ đã có lịch hẹn</p>
                    <p className="text-sm text-orange-700 mt-1">
                      Chúng tôi sẽ tìm kiếm bác sĩ thay thế cùng chuyên khoa từ tất cả chi nhánh
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleBooking}
                disabled={checking}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {checking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang kiểm tra...</span>
                  </>
                ) : isAvailable === false ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Tìm bác sĩ thay thế</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Xác nhận đặt lịch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      ) : (
        <Modal
          isOpen={true}
          onClose={onClose}
          title="Tìm bác sĩ thay thế"
        >
          <AlternativeDoctorSuggestions
            originalDoctor={doctor}
            specialty={doctor.specialty}
            selectedDate={date}
            selectedTime={time}
            onSelectDoctor={(altDoctor) => {
              onConfirmBooking(altDoctor, date, time);
              setShowAlternatives(false);
            }}
            onClose={onClose}
          />
        </Modal>
      )}
    </>
  );
}
