'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function PatientMedicalRecords() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
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
  }, [router]);

  const fetchPatientData = async (userId) => {
    try {
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      setPatient(patientData);
      fetchMedicalRecords(patientData.patient_id);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setLoading(false);
    }
  };

  const fetchMedicalRecords = async (patientId) => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors (
            full_name,
            specialty
          ),
          medical_records (
            record_id,
            diagnosis,
            treatment,
            created_at
          )
        `)
        .eq('patient_id', patientId)
        .eq('status', 'completed')
        .not('medical_records', 'is', null)
        .order('appointment_date', { ascending: false });

      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
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
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hồ Sơ Bệnh Án</h1>
              <p className="text-sm text-blue-100">Lịch sử khám bệnh của bạn</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/patient/dashboard')}
            className="bg-gray-500 px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Quay lại</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {records.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-lg text-center animate-fadeIn">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có hồ sơ bệnh án</h3>
            <p className="text-gray-500">Bạn chưa có lịch sử khám bệnh nào.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Danh sách hồ sơ */}
            <div className="bg-white p-6 rounded-xl shadow-lg animate-fadeIn">
              <h2 className="text-xl font-bold mb-4 text-blue-600 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Lịch sử khám bệnh
                <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {records.length} bản ghi
                </span>
              </h2>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {records.map((record, index) => (
                  <div
                    key={record.appointment_id}
                    onClick={() => handleSelectRecord(record)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedRecord?.appointment_id === record.appointment_id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                    style={{animation: `fadeIn 0.3s ease-out ${index * 0.05}s backwards`}}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-lg text-blue-800">
                          Bác sĩ {record.doctors?.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {record.doctors?.specialty}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                        Hoàn thành
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {record.appointment_date} • ⏰ {record.appointment_time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chi tiết hồ sơ */}
            <div className="bg-white p-6 rounded-xl shadow-lg animate-fadeIn" style={{animationDelay: '0.1s'}}>
              <h2 className="text-xl font-bold mb-4 text-blue-600 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Chi tiết khám bệnh
              </h2>

              {!selectedRecord ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">Chọn một bản ghi để xem chi tiết</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Thông tin khám */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2 text-blue-800">
                      Bác sĩ {selectedRecord.doctors?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedRecord.doctors?.specialty}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      📅 {selectedRecord.appointment_date} • ⏰ {selectedRecord.appointment_time}
                    </p>
                  </div>

                  {/* Chẩn đoán */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="font-semibold text-gray-800">Chẩn đoán</h4>
                    </div>
                    <div className="pl-7 text-gray-700 whitespace-pre-wrap">
                      {selectedRecord.medical_records?.[0]?.diagnosis || 'Không có thông tin'}
                    </div>
                  </div>

                  {/* Điều trị */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <h4 className="font-semibold text-gray-800">Điều trị</h4>
                    </div>
                    <div className="pl-7 text-gray-700 whitespace-pre-wrap">
                      {selectedRecord.medical_records?.[0]?.treatment || 'Không có thông tin'}
                    </div>
                  </div>

                  {/* Ghi chú (nếu có) */}
                  {selectedRecord.note && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <h4 className="font-semibold text-gray-800">Ghi chú lúc đặt lịch</h4>
                      </div>
                      <div className="pl-7 text-gray-700">
                        {selectedRecord.note}
                      </div>
                    </div>
                  )}

                  {/* Thời gian tạo */}
                  {selectedRecord.medical_records?.[0]?.created_at && (
                    <div className="text-xs text-gray-500 text-center pt-2 border-t">
                      Ghi nhận lúc: {new Date(selectedRecord.medical_records[0].created_at).toLocaleString('vi-VN')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
