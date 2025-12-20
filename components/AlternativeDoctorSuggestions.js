'use client';
import { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import LoadingSpinner from './ui/LoadingSpinner';

/**
 * Component: Alternative Doctor Suggestions
 * Hiển thị gợi ý bác sĩ thay thế khi bác sĩ hiện tại đã bận
 */
export default function AlternativeDoctorSuggestions({ 
  originalDoctor,
  specialty,
  selectedDate,
  selectedTime,
  onSelectDoctor,
  onClose 
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);

  const fetchAlternatives = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/doctor-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty,
          date: selectedDate,
          time: selectedTime,
          currentBranchId: originalDoctor?.branch_id,
          currentDoctorId: originalDoctor?.doctor_id
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuggestions(data);
      } else {
        throw new Error(data.error || 'Failed to fetch alternatives');
      }
    } catch (err) {
      console.error('Error fetching alternatives:', err);
      setError('Không thể tải danh sách bác sĩ thay thế');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useState(() => {
    fetchAlternatives();
  }, []);

  if (loading) {
    return (
      <Card className="p-8">
        <LoadingSpinner message="Đang tìm kiếm bác sĩ có sẵn..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={fetchAlternatives} variant="primary">
            Thử lại
          </Button>
        </div>
      </Card>
    );
  }

  if (!suggestions || suggestions.total_alternatives === 0) {
    return (
      <Card className="p-6 border-yellow-200 bg-yellow-50">
        <div className="text-center">
          <div className="text-yellow-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Không tìm thấy bác sĩ thay thế
          </h3>
          <p className="text-gray-600 mb-4">
            Hiện tại không có bác sĩ chuyên khoa <strong>{specialty}</strong> rảnh vào <strong>{selectedTime}</strong> ngày <strong>{selectedDate}</strong>
          </p>
          <div className="space-y-2">
            <Button onClick={onClose} variant="secondary" fullWidth>
              Chọn giờ khác
            </Button>
            <Button onClick={fetchAlternatives} variant="primary" fullWidth>
              Tìm lại
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const { recommendations, statistics, original_doctor_busy } = suggestions;

  return (
    <div className="space-y-6">
      {/* Header with warning */}
      {original_doctor_busy && (
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <div className="flex items-start space-x-3">
            <div className="shrink-0">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-900 mb-1">
                Bác sĩ {originalDoctor?.full_name} đã có lịch hẹn
              </h3>
              <p className="text-sm text-orange-800">
                Vào <strong>{selectedTime}</strong> ngày <strong>{selectedDate}</strong>, bác sĩ này đã bận.
                <br />
                Chúng tôi tìm thấy <strong>{recommendations.length} bác sĩ thay thế</strong> cùng chuyên khoa.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="text-3xl font-bold text-green-600">{statistics.same_branch}</div>
          <div className="text-sm text-gray-600 mt-1">Cùng chi nhánh</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{statistics.same_city}</div>
          <div className="text-sm text-gray-600 mt-1">Cùng thành phố</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="text-3xl font-bold text-purple-600">{statistics.other_cities}</div>
          <div className="text-sm text-gray-600 mt-1">Chi nhánh khác</div>
        </Card>
      </div>

      {/* Doctor list */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Bác sĩ có sẵn ({recommendations.length})
        </h3>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {recommendations.map((doctor, index) => (
            <Card 
              key={doctor.doctor_id} 
              className="p-5 hover:shadow-lg transition-all animate-slide-up border-l-4 border-l-green-500"
              style={{ animationDelay: `${index * 50}ms` }}
              hover
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Doctor info */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {doctor.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{doctor.full_name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{doctor.specialty}</span>
                        {doctor.years_of_experience > 0 && (
                          <>
                            <span>•</span>
                            <span>{doctor.years_of_experience} năm KN</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Branch info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{doctor.branches?.branch_name}</p>
                        <p className="text-sm text-gray-600">{doctor.branches?.address}</p>
                        <p className="text-xs text-gray-500 mt-1">{doctor.branches?.city} - {doctor.branches?.district}</p>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge 
                      variant={
                        doctor.distance_priority === 0 ? 'success' :
                        doctor.distance_priority === 1 ? 'info' : 'default'
                      }
                    >
                      {doctor.priority_label}
                    </Badge>
                    {doctor.rating > 0 && (
                      <Badge variant="warning">
                        ⭐ {doctor.rating.toFixed(1)} ({doctor.total_reviews} đánh giá)
                      </Badge>
                    )}
                    {doctor.distance_priority === 0 && (
                      <Badge variant="success">✨ Gần nhất</Badge>
                    )}
                  </div>

                  {/* Description */}
                  {doctor.description && (
                    <p className="text-sm text-gray-600 mb-3">{doctor.description}</p>
                  )}
                </div>

                {/* Action button */}
                <div className="ml-4 shrink-0">
                  <Button
                    onClick={() => onSelectDoctor(doctor)}
                    variant="primary"
                    size="small"
                    className="whitespace-nowrap"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Chọn bác sĩ này
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex space-x-3">
        <Button onClick={onClose} variant="secondary" fullWidth>
          Chọn giờ khác
        </Button>
        <Button onClick={fetchAlternatives} variant="primary" fullWidth>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </Button>
      </div>
    </div>
  );
}
