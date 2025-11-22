
// app/error.jsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-4" dir="rtl">
      <div className="text-center text-white max-w-2xl">
        <div className="mb-8">
          <AlertTriangle className="w-24 h-24 mx-auto mb-6 text-yellow-300" />
          <h1 className="text-5xl font-bold mb-4">حدث خطأ!</h1>
          <p className="text-xl text-orange-200 mb-4">
            عذراً، حدث خطأ غير متوقع أثناء معالجة طلبك.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-black/30 p-4 rounded-lg text-left mb-8">
              <pre className="text-sm text-red-300 overflow-auto">
                {error.message}
              </pre>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-white text-red-900 px-8 py-4 rounded-lg font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            حاول مرة أخرى
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            العودة للوحة التحكم
          </button>
        </div>

        <div className="mt-12 text-orange-300">
          <p className="text-sm">
            إذا استمرت المشكلة، يرجى الاتصال بالدعم الفني
          </p>
        </div>
      </div>
    </div>
  );
}
