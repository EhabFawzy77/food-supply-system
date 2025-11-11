'use client';

import { useState, useEffect } from 'react';
import { Lock, User, LogIn, ShoppingCart } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { LogoWithText } from '../../../components/Logo';

export default function LoginPage() {
  const { login, user, loading, success, error: showError } = useApp();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // إذا كان المستخدم مسجل دخول، نوجهه للوحة التحكم
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    if (token && userData) {
      window.location.href = '/dashboard';
    }
  }, []);

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      console.log('بدء عملية تسجيل الدخول...');
      const result = await login(formData.username, formData.password);
      console.log('نتيجة تسجيل الدخول:', result);
      
      if (!result.success) {
        const errorMsg = result.error || 'حدث خطأ غير معروف';
        setError(errorMsg);
        showError(errorMsg, '❌ فشل تسجيل الدخول');
      } else {
        success('تم تسجيل الدخول بنجاح!', '✓ مرحباً');
      }
    } catch (err) {
      console.error('خطأ في تسجيل الدخول:', err);
      const errorMsg = 'حدث خطأ في الاتصال';
      setError(errorMsg);
      showError(errorMsg, '❌ خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // إظهار شاشة التحميل أثناء التحقق من حالة المصادقة
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="text-center text-white">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fadeIn">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoWithText />
          </div>
          <p className="text-gray-600 mt-4">شركة التوريدات الغذائية</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                onKeyPress={handleKeyPress}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="أدخل اسم المستخدم"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onKeyPress={handleKeyPress}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="أدخل كلمة المرور"
                dir="rtl"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || !formData.username || !formData.password}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري تسجيل الدخول...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                تسجيل الدخول
              </>
            )}
          </button>
        </div>



        {/* Clear Storage Button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            مسح بيانات التخزين المحلي
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>© 2024 جميع الحقوق محفوظة</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}