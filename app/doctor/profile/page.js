'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import DashboardHeader from '@/components/ui/DashboardHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function DoctorProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    specialty: '',
    phone: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

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

      if (doctorData) {
        setFormData({
          full_name: doctorData.full_name || '',
          specialty: doctorData.specialty || '',
          phone: doctorData.phone || '',
          description: doctorData.description || '',
        });
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setError('Không thể tải thông tin. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setErrors({});
    setSaving(true);

    try {
      const newErrors = {};
      
      // Validation
      if (!formData.full_name?.trim()) {
        newErrors.full_name = 'Họ tên là bắt buộc';
      }
      
      if (!formData.specialty?.trim()) {
        newErrors.specialty = 'Chuyên khoa là bắt buộc';
      }
      
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Số điện thoại là bắt buộc';
      } else {
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(formData.phone)) {
          newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setSaving(false);
        return;
      }

      // Update doctor data
      const { error: updateError } = await supabase
        .from('doctors')
        .update({
          full_name: formData.full_name,
          specialty: formData.specialty,
          phone: formData.phone,
          description: formData.description,
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
        router.push('/doctor/dashboard');
      }, 1500);
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setSaving(false);
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
    return <LoadingSpinner fullScreen message="Đang tải thông tin..." />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader
          title="Cập Nhật Thông Tin"
          subtitle="Quản lý thông tin cá nhân và chuyên môn"
          userName={formData.full_name || user?.email}
          gradientFrom="from-green-600"
          gradientTo="to-emerald-600"
          onLogout={handleLogout}
          onBack={handleBack}
        />

        <Card className="animate-fade-in">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Thông tin bác sĩ
            </h2>
            <p className="text-gray-600 text-sm mt-1">Cập nhật thông tin cá nhân và chuyên môn của bạn</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg mb-6 flex items-start gap-3 animate-slide-down">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Họ và tên"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              error={errors.full_name}
              placeholder="Nhập họ và tên đầy đủ"
              required
            />

            <Input
              label="Chuyên khoa"
              type="text"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              error={errors.specialty}
              placeholder="VD: Tim mạch, Nhi khoa, Da liễu..."
              required
            />

            <Input
              label="Số điện thoại"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="0123456789"
              required
            />

            <Input
              label="Mô tả / Kinh nghiệm"
              type="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Giới thiệu về bản thân, kinh nghiệm làm việc, bằng cấp..."
              rows={5}
            />

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                variant="success"
                loading={saving}
                className="flex-1"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="flex-1"
                disabled={saving}
              >
                Hủy
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
