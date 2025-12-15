'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function DoctorMedicalRecords() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
  });

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
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single();

      setDoctor(doctorData);
      fetchAppointments(doctorData.doctor_id);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setError('Không thể tải thông tin!');
      setLoading(false);
    }
  };

  const fetchAppointments = async (doctorId) => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            full_name,
            gender,
            date_of_birth,
            phone
          ),
          medical_records (
            record_id,
            diagnosis,
            treatment
          )
        `)
        .eq('doctor_id', doctorId)
        .in('status', ['confirmed', 'completed'])
        .order('appointment_date', { ascending: false });

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    
    // Nếu đã có medical record, load data
    if (appointment.medical_records && appointment.medical_records.length > 0) {
      const record = appointment.medical_records[0];
      setFormData({
        diagnosis: record.diagnosis || '',
        treatment: record.treatment || '',
      });
    } else {
      setFormData({ diagnosis: '', treatment: '' });
    }
    
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    // Validation
    if (!formData.diagnosis || !formData.treatment) {
      setError('Vui lòng điền đầy đủ chẩn đoán và điều trị!');
      setSaving(false);
      return;
    }

    try {
      const existingRecord = selectedAppointment.medical_records?.[0];

      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('medical_records')
          .update({
            diagnosis: formData.diagnosis,
            treatment: formData.treatment,
          })
          .eq('record_id', existingRecord.record_id);

        if (updateError) {
          setError('Không thể cập nhật hồ sơ bệnh án!');
          console.error(updateError);
          setSaving(false);
          return;
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('medical_records')
          .insert([
            {
              appointment_id: selectedAppointment.appointment_id,
              diagnosis: formData.diagnosis,
              treatment: formData.treatment,
            },
          ]);

        if (insertError) {
          setError('Không thể tạo hồ sơ bệnh án!');
          console.error(insertError);
          setSaving(false);
          return;
        }
      }

      // Update appointment status to completed
      const { error: statusError } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('appointment_id', selectedAppointment.appointment_id);

      if (statusError) {
        console.error('Error updating status:', statusError);
      }

      setSuccess('Lưu hồ sơ bệnh án thành công!');
      
      // Reload data
      fetchAppointments(doctor.doctor_id);
      
      setTimeout(() => {
        setSelectedAppointment(null);
        setFormData({ diagnosis: '', treatment: '' });
      }, 1500);
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setSaving(false);
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
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hồ Sơ Bệnh Án</h1>
              <p className="text-sm text-green-100">Ghi chẩn đoán và điều trị</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/doctor/dashboard')}
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
        <div className="grid md:grid-cols-2 gap-6">
          {/* Danh sách lịch hẹn */}
          <div className="bg-white p-6 rounded-xl shadow-lg animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-green-600 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Danh sách lịch hẹn
            </h2>
            
            {appointments.length === 0 ? (
              <p className="text-gray-500">Chưa có lịch hẹn nào.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {appointments.map((apt, index) => (
                  <div
                    key={apt.appointment_id}
                    onClick={() => handleSelectAppointment(apt)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedAppointment?.appointment_id === apt.appointment_id
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                    }`}
                    style={{animation: `fadeIn 0.3s ease-out ${index * 0.05}s backwards`}}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-lg">{apt.patients?.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {apt.patients?.gender} • {apt.patients?.date_of_birth}
                        </p>
                      </div>
                      {apt.medical_records && apt.medical_records.length > 0 ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                          Đã ghi
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                          Chưa ghi
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📅 {apt.appointment_date} • ⏰ {apt.appointment_time}</p>
                      <p>📞 {apt.patients?.phone}</p>
                      {apt.note && <p className="text-gray-500">💬 {apt.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form ghi hồ sơ */}
          <div className="bg-white p-6 rounded-xl shadow-lg animate-fadeIn" style={{animationDelay: '0.1s'}}>
            <h2 className="text-xl font-bold mb-4 text-green-600 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Ghi hồ sơ bệnh án
            </h2>

            {!selectedAppointment ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">Chọn lịch hẹn để ghi hồ sơ bệnh án</p>
              </div>
            ) : (
              <>
                {/* Thông tin bệnh nhân */}
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-lg mb-1">{selectedAppointment.patients?.full_name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedAppointment.appointment_date} • {selectedAppointment.appointment_time}
                  </p>
                </div>

                {/* Thông báo */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r mb-4">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-r mb-4">
                    {success}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Chẩn đoán <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Nhập chẩn đoán bệnh..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Điều trị <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Nhập phương pháp điều trị, đơn thuốc..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
                    >
                      {saving ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang lưu...
                        </span>
                      ) : 'Lưu hồ sơ'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAppointment(null);
                        setFormData({ diagnosis: '', treatment: '' });
                      }}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 font-semibold"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
