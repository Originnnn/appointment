'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function PatientProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    date_of_birth: '',
    phone: '',
    address: '',
  });

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

      if (patientData) {
        setFormData({
          full_name: patientData.full_name || '',
          gender: patientData.gender || '',
          date_of_birth: patientData.date_of_birth || '',
          phone: patientData.phone || '',
          address: patientData.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setError('Không thể tải thông tin. Vui lòng thử lại!');
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
    setSaving(true);

    try {
      // Validation
      if (!formData.full_name || !formData.phone) {
        setError('Họ tên và số điện thoại là bắt buộc!');
        setSaving(false);
        return;
      }

      // Kiểm tra số điện thoại hợp lệ (10-11 số)
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('Số điện thoại không hợp lệ! (10-11 số)');
        setSaving(false);
        return;
      }

      // Update patient data
      const { error: updateError } = await supabase
        .from('patients')
        .update({
          full_name: formData.full_name,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth || null,
          phone: formData.phone,
          address: formData.address,
        })
        .eq('user_id', user.user_id);

      if (updateError) {
        setError('Không thể cập nhật thông tin. Vui lòng thử lại!');
        console.error(updateError);
        setSaving(false);
        return;
      }

      setSuccess('Cập nhật thông tin thành công!');
      setTimeout(() => {
        router.push('/patient/dashboard');
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
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Cập Nhật Thông Tin</h1>
          <button
            onClick={() => router.push('/patient/dashboard')}
            className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-600"
          >
            ← Quay lại
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">Thông tin cá nhân</h2>

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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Họ và tên */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Giới tính
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Ngày sinh
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0123456789"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Địa chỉ
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Nhập địa chỉ của bạn"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-semibold"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/patient/dashboard')}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
