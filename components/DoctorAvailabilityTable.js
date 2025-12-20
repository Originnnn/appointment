'use client';
import { useState, useEffect } from 'react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import LoadingSpinner from './ui/LoadingSpinner';
import { supabase } from '@/utils/supabase';
import { formatDate } from '@/utils/formatters';

/**
 * Component: Doctor Availability Table
 * Hiển thị lịch làm việc của bác sĩ theo chi nhánh dạng bảng
 */
export default function DoctorAvailabilityTable({ 
  selectedBranch = null,
  selectedSpecialty = null,
  onDoctorTimeSelect 
}) {
  const [branches, setBranches] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState(selectedBranch);
  const [selectedSpec, setSelectedSpec] = useState(selectedSpecialty);
  const [dateRange, setDateRange] = useState([]);
  const [timeFilter, setTimeFilter] = useState('week'); // 'today', 'week', 'custom'

  // Generate date range based on filter
  useEffect(() => {
    const dates = [];
    let days = 7;
    
    if (timeFilter === 'today') {
      days = 1;
    } else if (timeFilter === 'week') {
      days = 7;
    } else if (timeFilter === 'twoweeks') {
      days = 14;
    }
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    setDateRange(dates);
  }, [timeFilter]);

  // Fetch branches
  useEffect(() => {
    fetchBranches();
  }, []);

  // Fetch doctors when branch/specialty changes
  useEffect(() => {
    if (branches.length > 0) {
      fetchDoctors();
    }
  }, [selectedBranchId, selectedSpec, branches]);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('city, branch_name');
      
      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('doctors')
        .select(`
          *,
          branches (
            branch_id,
            branch_name,
            city,
            district,
            address
          )
        `)
        .order('full_name');

      if (selectedBranchId) {
        query = query.eq('branch_id', selectedBranchId);
      }

      if (selectedSpec) {
        query = query.eq('specialty', selectedSpec);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setDoctors(data || []);
      
      // Fetch availability for each doctor
      if (data && data.length > 0) {
        await fetchAvailability(data.map(d => d.doctor_id));
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (doctorIds) => {
    try {
      const { data, error } = await supabase
        .from('doctor_availability')
        .select('*')
        .in('doctor_id', doctorIds)
        .gte('date', dateRange[0])
        .lte('date', dateRange[dateRange.length - 1]);

      if (error) throw error;

      // Organize by doctor_id -> date -> time
      const organized = {};
      data?.forEach(item => {
        if (!organized[item.doctor_id]) {
          organized[item.doctor_id] = {};
        }
        if (!organized[item.doctor_id][item.date]) {
          organized[item.doctor_id][item.date] = [];
        }
        organized[item.doctor_id][item.date].push(item);
      });

      setAvailability(organized);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const getTimeSlots = () => {
    return [
      '08:00:00', '09:00:00', '10:00:00', '11:00:00',
      '14:00:00', '15:00:00', '16:00:00', '17:00:00'
    ];
  };

  const isSlotAvailable = (doctorId, date, time) => {
    const slots = availability[doctorId]?.[date];
    if (!slots) return null; // Không có data
    
    const slot = slots.find(s => s.time_slot === time);
    return slot ? slot.is_available : null;
  };

  const handleSlotClick = (doctor, date, time, isAvailable) => {
    if (onDoctorTimeSelect) {
      onDoctorTimeSelect({
        doctor,
        date,
        time,
        isAvailable
      });
    }
  };

  // Get unique specialties from doctors
  const specialties = [...new Set(doctors.map(d => d.specialty))].filter(Boolean);

  // Group branches by city
  const branchesByCity = branches.reduce((acc, branch) => {
    if (!acc[branch.city]) {
      acc[branch.city] = [];
    }
    acc[branch.city].push(branch);
    return acc;
  }, {});

  if (loading && doctors.length === 0) {
    return (
      <Card className="p-8">
        <LoadingSpinner message="Đang tải lịch làm việc..." />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Bộ lọc
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Time Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Khoảng thời gian
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày tới</option>
              <option value="twoweeks">14 ngày tới</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chi nhánh bệnh viện
            </label>
            <select
              value={selectedBranchId || ''}
              onChange={(e) => setSelectedBranchId(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả chi nhánh ({branches.length})</option>
              {Object.keys(branchesByCity).map(city => (
                <optgroup key={city} label={city}>
                  {branchesByCity[city].map(branch => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name} - {branch.district}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Specialty Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chuyên khoa
            </label>
            <select
              value={selectedSpec || ''}
              onChange={(e) => setSelectedSpec(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả chuyên khoa</option>
              {specialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters display */}
        {(selectedBranchId || selectedSpec) && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Đang lọc:</span>
            {selectedBranchId && (
              <Badge variant="info" className="flex items-center space-x-1">
                <span>{branches.find(b => b.branch_id == selectedBranchId)?.branch_name}</span>
                <button
                  onClick={() => setSelectedBranchId(null)}
                  className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Badge>
            )}
            {selectedSpec && (
              <Badge variant="success" className="flex items-center space-x-1">
                <span>{selectedSpec}</span>
                <button
                  onClick={() => setSelectedSpec(null)}
                  className="ml-1 hover:bg-green-700 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">
          Tìm thấy <span className="text-blue-600">{doctors.length}</span> bác sĩ
        </h3>
        <button
          onClick={fetchDoctors}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Làm mới</span>
        </button>
      </div>

      {/* Availability Table */}
      {doctors.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">Không tìm thấy bác sĩ phù hợp</p>
          <p className="text-gray-500 text-sm mt-2">Thử thay đổi bộ lọc</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {doctors.map((doctor) => (
            <Card key={doctor.doctor_id} className="overflow-hidden">
              {/* Doctor Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                      {doctor.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{doctor.full_name}</h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <Badge variant="info">{doctor.specialty}</Badge>
                        {doctor.rating > 0 && (
                          <Badge variant="warning">
                            ⭐ {doctor.rating.toFixed(1)} ({doctor.total_reviews})
                          </Badge>
                        )}
                        {doctor.years_of_experience > 0 && (
                          <span className="text-sm text-gray-600">
                            {doctor.years_of_experience} năm KN
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="font-semibold">{doctor.branches?.branch_name}</span>
                        <span>•</span>
                        <span>{doctor.branches?.city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability Grid */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 sticky left-0 bg-gray-50">
                        Giờ
                      </th>
                      {dateRange.map(date => {
                        const dateObj = new Date(date);
                        const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'short' });
                        const dayMonth = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                        return (
                          <th key={date} className="px-2 py-3 text-center text-xs font-semibold text-gray-700 min-w-[100px]">
                            <div>{dayName}</div>
                            <div className="text-gray-500">{dayMonth}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {getTimeSlots().map((time) => (
                      <tr key={time} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                          {time.substring(0, 5)}
                        </td>
                        {dateRange.map(date => {
                          const isAvailable = isSlotAvailable(doctor.doctor_id, date, time);
                          
                          return (
                            <td key={`${date}-${time}`} className="px-2 py-2 text-center">
                              {isAvailable === null ? (
                                <div className="text-gray-300 text-xs">-</div>
                              ) : (
                                <button
                                  onClick={() => handleSlotClick(doctor, date, time, isAvailable)}
                                  disabled={!isAvailable}
                                  className={`
                                    w-full px-2 py-1 rounded text-xs font-medium transition-all
                                    ${isAvailable 
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer' 
                                      : 'bg-red-100 text-red-700 cursor-not-allowed'}
                                  `}
                                  title={isAvailable ? 'Click để đặt lịch' : 'Đã có lịch hẹn'}
                                >
                                  {isAvailable ? '✓ Rảnh' : '✗ Bận'}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 rounded"></div>
                    <span className="text-gray-600">Rảnh - Click để đặt lịch</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-100 rounded"></div>
                    <span className="text-gray-600">Bận - Tìm bác sĩ thay thế</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span className="text-gray-600">Chưa có lịch</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
