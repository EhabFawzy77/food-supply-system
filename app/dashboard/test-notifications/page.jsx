// ملف اختبار الإشعارات - Testing Notifications
// المسار: pages/test-notifications.jsx (اختياري - للاختبار فقط)

'use client';

import { useApp } from '../../contexts/AppContext';
import { useState } from 'react';

export default function TestNotificationsPage() {
  const { success, error, warning, info, addNotification } = useApp();
  const [testNumber, setTestNumber] = useState(0);

  const runAllTests = async () => {
    // اختبار 1: نجاح بسيط
    success('تم البيع بنجاح! الإجمالي: 5,000 جنيه');
    await sleep(2000);

    // اختبار 2: خطأ
    error('فشل الاتصال بقاعدة البيانات', '❌ خطأ في الاتصال');
    await sleep(2000);

    // اختبار 3: تحذير
    warning('هذا الإجراء لا يمكن التراجع عنه', '⚠ تنبيه هام');
    await sleep(2000);

    // اختبار 4: معلومة
    info('تم تحديث النظام إلى الإصدار 2.0', 'ℹ معلومة');
    await sleep(2000);

    // اختبار 5: مدة مخصصة قصيرة
    success('إشعار سريع', 'نجح', { duration: 2000 });
    await sleep(2500);

    // اختبار 6: مدة مخصصة طويلة
    info('إشعار طويل الأمد', 'معلومة', { duration: 8000 });

    setTestNumber(prev => prev + 1);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔔 اختبار نظام الإشعارات
          </h1>
          <p className="text-gray-600">
            استخدم الأزرار أدناه لاختبار جميع أنواع الإشعارات
          </p>
        </div>

        {/* عدد الاختبارات */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800">
            <span className="font-bold">عدد الاختبارات المكتملة:</span> {testNumber}
          </p>
        </div>

        {/* الأزرار */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* النجاح */}
          <button
            onClick={() => success('تم البيع بنجاح!', '✓ نجح')}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-bold transition"
          >
            ✓ اختبر النجاح
          </button>

          {/* الخطأ */}
          <button
            onClick={() => error('فشل الاتصال بالخادم', '❌ خطأ')}
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-bold transition"
          >
            ✗ اختبر الخطأ
          </button>

          {/* التحذير */}
          <button
            onClick={() => warning('هذا الإجراء لا يمكن التراجع عنه', '⚠ تحذير')}
            className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-bold transition"
          >
            ⚠ اختبر التحذير
          </button>

          {/* المعلومة */}
          <button
            onClick={() => info('تم تحديث النظام', 'ℹ معلومة')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-bold transition"
          >
            ℹ اختبر المعلومة
          </button>

          {/* مدة قصيرة */}
          <button
            onClick={() => success('إشعار سريع (ثانيتان)', 'سريع', { duration: 2000 })}
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-bold transition"
          >
            ⚡ اختبر المدة القصيرة
          </button>

          {/* مدة طويلة */}
          <button
            onClick={() => info('إشعار طويل (8 ثواني)', 'طويل', { duration: 8000 })}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-bold transition"
          >
            🕐 اختبر المدة الطويلة
          </button>

          {/* إشعارات متعددة */}
          <button
            onClick={() => {
              success('الأول');
              setTimeout(() => error('الثاني'), 1000);
              setTimeout(() => warning('الثالث'), 2000);
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg font-bold transition md:col-span-2"
          >
            🎪 اختبر الإشعارات المتعددة
          </button>

          {/* اختبار كامل */}
          <button
            onClick={runAllTests}
            className="bg-gray-800 hover:bg-gray-900 text-white py-3 px-6 rounded-lg font-bold transition md:col-span-2 text-lg"
          >
            🚀 تشغيل اختبار كامل (6 إشعارات)
          </button>
        </div>

        {/* المعلومات */}
        <div className="mt-8 space-y-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <h3 className="font-bold text-green-800">✅ كيفية الاستخدام:</h3>
            <code className="block bg-white p-2 rounded mt-2 text-sm overflow-x-auto">
              const &#123; success, error, warning, info &#125; = useApp();<br/>
              success('الرسالة', 'العنوان', &#123; duration: 5000 &#125;);
            </code>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h3 className="font-bold text-blue-800">📚 الأنواع المتاحة:</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 mt-2">
              <li><span className="font-bold">success:</span> نجح العملية - أخضر</li>
              <li><span className="font-bold">error:</span> فشلت العملية - أحمر</li>
              <li><span className="font-bold">warning:</span> تنبيه للمستخدم - برتقالي</li>
              <li><span className="font-bold">info:</span> معلومة عامة - أزرق</li>
            </ul>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
            <h3 className="font-bold text-purple-800">⚙️ الخيارات:</h3>
            <ul className="list-disc list-inside text-sm text-purple-700 mt-2">
              <li><span className="font-bold">duration:</span> مدة الإشعار بالميلي ثانية (افتراضي: 5000)</li>
              <li><span className="font-bold">title:</span> عنوان الإشعار (اختياري)</li>
              <li><span className="font-bold">message:</span> نص الإشعار (إلزامي)</li>
            </ul>
          </div>
        </div>

        {/* ملاحظات */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800">💡 ملاحظات:</h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
            <li>الإشعارات تظهر من الأعلى يسار الشاشة</li>
            <li>يمكنك إغلاق أي إشعار بضغط زر X</li>
            <li>شريط التقدم يدل على الوقت المتبقي</li>
            <li>الإشعارات تختفي تلقائياً بعد انتهاء المدة</li>
            <li>يمكنك عرض عدة إشعارات في نفس الوقت</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
