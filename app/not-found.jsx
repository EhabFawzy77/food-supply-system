// app/not-found.jsx
import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4" dir="rtl">
      <div className="text-center text-white max-w-2xl">
        <div className="mb-8">
          <h1 className="text-9xl font-bold mb-4">404</h1>
          <h2 className="text-4xl font-bold mb-4">الصفحة غير موجودة</h2>
          <p className="text-xl text-indigo-200 mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-white text-indigo-900 px-8 py-4 rounded-lg font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            العودة للوحة التحكم
          </Link>
          <Link
            href="/"
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            الصفحة الرئيسية
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="mt-12 text-indigo-300">
          <p className="text-sm">
            إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بالدعم الفني
          </p>
        </div>
      </div>
    </div>
  );
}
