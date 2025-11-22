'use client';

import { useState, useEffect } from 'react';

export default function TestAuthPage() {
  const [token, setToken] = useState('');
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const testAuth = async () => {
    if (!token) {
      setTestResult('❌ لا يوجد توكن في localStorage');
      return;
    }

    setLoading(true);
    setTestResult('جاري الاختبار...');

    try {
      const response = await fetch('/api/suppliers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTestResult(`✅ نجح! تم استرجاع ${data.data?.length || 0} موردين`);
      } else {
        setTestResult(`❌ فشل! الحالة: ${response.status}, الرسالة: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loginAndTest = async () => {
    setLoading(true);
    setTestResult('جاري تسجيل الدخول...');

    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      });

      const loginData = await loginResponse.json();

      if (loginData.success) {
        const newToken = loginData.data.token;
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('currentUser', JSON.stringify(loginData.data.user));
        setTestResult('✅ تم تسجيل الدخول بنجاح! جرب مرة أخرى.');
      } else {
        setTestResult(`❌ فشل تسجيل الدخول: ${loginData.error}`);
      }
    } catch (error) {
      setTestResult(`❌ خطأ في تسجيل الدخول: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🔐 اختبار المصادقة</h1>

          <div className="space-y-6">
            {/* Token Display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="font-semibold text-gray-800 mb-2">التوكن الحالي:</h2>
              {token ? (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm font-mono text-green-800 break-all">{token.substring(0, 50)}...</p>
                  <p className="text-xs text-green-600 mt-2">✅ توكن موجود</p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">❌ لا يوجد توكن</p>
                </div>
              )}
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`rounded-lg p-4 ${
                testResult.includes('✅') ? 'bg-green-50 border border-green-200' :
                testResult.includes('❌') ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm ${
                  testResult.includes('✅') ? 'text-green-800' :
                  testResult.includes('❌') ? 'text-red-800' :
                  'text-blue-800'
                }`}>{testResult}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={testAuth}
                disabled={loading || !token}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {loading ? 'جاري...' : 'اختبار التوكن الحالي'}
              </button>

              <button
                onClick={loginAndTest}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {loading ? 'جاري...' : 'تسجيل دخول جديد'}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 التعليمات:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>انقر على "تسجيل دخول جديد" للحصول على توكن صحيح</li>
                <li>ستظهر رسالة تأكيد بعد التسجيل</li>
                <li>بعدها جرب إضافة مشتريات جديدة</li>
              </ol>
            </div>

            {/* Debug Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600">
              <p>اسم المستخدم: admin</p>
              <p>كلمة المرور: admin123</p>
              <p>بيانات المتصفح: localStorage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
