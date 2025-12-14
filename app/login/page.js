'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient',
    full_name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Kiểm tra user trong database
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', formData.email)
        .eq('password_hash', formData.password)
        .single();

      if (queryError || !users) {
        setError('Email hoặc mật khẩu không đúng!');
        setLoading(false);
        return;
      }

      // Lưu thông tin user vào localStorage
      localStorage.setItem('user', JSON.stringify(users));

      // Chuyển hướng theo role
      if (users.role === 'patient') {
        router.push('/patient/dashboard');
      } else if (users.role === 'doctor') {
        router.push('/doctor/dashboard');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Kiểm tra email đã tồn tại chưa
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        setError('Email này đã được sử dụng!');
        setLoading(false);
        return;
      }

      // Tạo user mới
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([
          {
            email: formData.email,
            password_hash: formData.password,
            role: formData.role,
          },
        ])
        .select()
        .single();

      if (userError) {
        setError('Không thể tạo tài khoản. Vui lòng thử lại!');
        setLoading(false);
        return;
      }

      // Tạo profile tương ứng
      if (formData.role === 'patient') {
        await supabase.from('patients').insert([
          {
            user_id: newUser.user_id,
            full_name: formData.full_name,
            phone: formData.phone,
          },
        ]);
      } else if (formData.role === 'doctor') {
        await supabase.from('doctors').insert([
          {
            user_id: newUser.user_id,
            full_name: formData.full_name,
            phone: formData.phone,
          },
        ]);
      }

      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      setIsLogin(true);
      setFormData({
        email: '',
        password: '',
        role: 'patient',
        full_name: '',
        phone: '',
      });
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email (Username)</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Vai trò</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="patient">Bệnh nhân</option>
                  <option value="doctor">Bác sĩ</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
