'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function DoctorSchedule() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  const [formData, setFormData] = useState({
    work_date: '',
    start_time: '',
    end_time: '',
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
      fetchSchedules(doctorData.doctor_id);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setError('Không thể tải thông tin. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  const fetchSchedules = async (doctorId) => {
    try {
      const { data } = await supabase
        .from('working_schedules')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('work_date', { ascending: true })
        .order('start_time', { ascending: true });

      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.work_date || !formData.start_time || !formData.end_time) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Kiểm tra giờ kết thúc phải sau giờ bắt đầu
    if (formData.end_time <= formData.start_time) {
      setError('Giờ kết thúc phải sau giờ bắt đầu!');
      return;
    }

    // Kiểm tra ngày không được trong quá khứ (chỉ khi thêm mới)
    if (!editingSchedule) {
      const today = new Date().toISOString().split('T')[0];
      if (formData.work_date < today) {
        setError('Không thể thêm lịch làm việc trong quá khứ!');
        return;
      }
    }

    try {
      if (editingSchedule) {
        // Update schedule
        const { error: updateError } = await supabase
          .from('working_schedules')
          .update({
            work_date: formData.work_date,
            start_time: formData.start_time,
            end_time: formData.end_time,
          })
          .eq('schedule_id', editingSchedule.schedule_id);

        if (updateError) {
          setError('Không thể cập nhật lịch làm việc!');
          console.error(updateError);
          return;
        }

        setSuccess('Cập nhật lịch làm việc thành công!');
      } else {
        // Add new schedule
        const { error: insertError } = await supabase
          .from('working_schedules')
          .insert([
            {
              doctor_id: doctor.doctor_id,
              work_date: formData.work_date,
              start_time: formData.start_time,
              end_time: formData.end_time,
            },
          ]);

        if (insertError) {
          setError('Không thể thêm lịch làm việc!');
          console.error(insertError);
          return;
        }

        setSuccess('Thêm lịch làm việc thành công!');
      }

      // Reset form và reload
      setFormData({ work_date: '', start_time: '', end_time: '' });
      setShowForm(false);
      setEditingSchedule(null);
      fetchSchedules(doctor.doctor_id);
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại!');
      console.error(err);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      work_date: schedule.work_date,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm('Bạn có chắc muốn xóa lịch làm việc này?')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('working_schedules')
        .delete()
        .eq('schedule_id', scheduleId);

      if (deleteError) {
        setError('Không thể xóa lịch làm việc!');
        console.error(deleteError);
        return;
      }

      setSuccess('Xóa lịch làm việc thành công!');
      fetchSchedules(doctor.doctor_id);
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại!');
      console.error(err);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
    setFormData({ work_date: '', start_time: '', end_time: '' });
    setError('');
    setSuccess('');
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
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản Lý Lịch Làm Việc</h1>
          <button
            onClick={() => router.push('/doctor/dashboard')}
            className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-600"
          >
            ← Quay lại
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Thông báo */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Button thêm mới */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingSchedule(null);
                setFormData({ work_date: '', start_time: '', end_time: '' });
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              + Thêm lịch làm việc mới
            </button>
          </div>
        )}

        {/* Form thêm/sửa */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4 text-green-600">
              {editingSchedule ? 'Chỉnh sửa lịch làm việc' : 'Thêm lịch làm việc mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Ngày làm việc */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Ngày làm việc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="work_date"
                    value={formData.work_date}
                    onChange={handleChange}
                    min={editingSchedule ? undefined : new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                {/* Giờ bắt đầu */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Giờ bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                {/* Giờ kết thúc */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Giờ kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
                >
                  {editingSchedule ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Danh sách lịch làm việc */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-green-600">Danh sách lịch làm việc</h2>
          
          {schedules.length === 0 ? (
            <p className="text-gray-500">Chưa có lịch làm việc nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">STT</th>
                    <th className="p-3 text-left">Ngày làm việc</th>
                    <th className="p-3 text-left">Giờ bắt đầu</th>
                    <th className="p-3 text-left">Giờ kết thúc</th>
                    <th className="p-3 text-left">Thời gian</th>
                    <th className="p-3 text-left">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule, index) => {
                    // Tính thời gian làm việc
                    const start = new Date(`2000-01-01T${schedule.start_time}`);
                    const end = new Date(`2000-01-01T${schedule.end_time}`);
                    const diffHours = (end - start) / (1000 * 60 * 60);
                    
                    return (
                      <tr key={schedule.schedule_id} className="border-t">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">
                          {new Date(schedule.work_date + 'T00:00:00').toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })}
                        </td>
                        <td className="p-3">{schedule.start_time}</td>
                        <td className="p-3">{schedule.end_time}</td>
                        <td className="p-3">{diffHours} giờ</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(schedule)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(schedule.schedule_id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
