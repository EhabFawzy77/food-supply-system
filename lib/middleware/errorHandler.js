
// lib/middleware/errorHandler.js
// معالجة الأخطاء - تصحيح: تصدير دالة افتراضية متوافقة مع الاستخدام في المسارات
import { NextResponse } from 'next/server';

export default function errorHandler(error, status = 500) {
  console.error('API Error:', error);

  // أخطاء Mongoose/التحقق
  if (error && error.name === 'ValidationError') {
    return NextResponse.json(
      {
        success: false,
        error: 'بيانات غير صالحة',
        details: error.message
      },
      { status: 400 }
    );
  }

  if (error && (error.code === 11000 || error.code === '11000')) {
    return NextResponse.json(
      {
        success: false,
        error: 'البيانات موجودة بالفعل'
      },
      { status: 409 }
    );
  }

  const payload = {
    success: false,
    // في طور التطوير أظهر رسالة الخطأ التفصيلية لمساعدة المطور
    error: process.env.NODE_ENV === 'development' ? error?.message || 'خطأ غير معروف' : 'حدث خطأ في الخادم'
  };

  return NextResponse.json(payload, { status });
}

// للمطابقة مع أنماط ممكنة لاحقة - يمكن استدعاء هذا الملف كـ named import إذا لزم
export { errorHandler as defaultErrorHandler };