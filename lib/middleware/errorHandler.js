
// lib/middleware/errorHandler.js
// معالجة الأخطاء
export function errorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);

      // أخطاء MongoDB
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'بيانات غير صالحة',
            details: error.message
          },
          { status: 400 }
        );
      }

      if (error.code === 11000) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'البيانات موجودة بالفعل'
          },
          { status: 409 }
        );
      }

      // خطأ عام
      return NextResponse.json(
        { 
          success: false, 
          error: 'حدث خطأ في الخادم',
          message: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
  };
}