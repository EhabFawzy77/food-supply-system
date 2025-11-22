// app/api/settings/init/route.js
// إنشاء الإعدادات الافتراضية
export async function POST(request) {
  try {
    await connectDB();
    
    const defaultSettings = [
      // ✅ يجب إنشاء الإعدادات يدوياً عبر صفحة الإعدادات في واجهة المستخدم
      // لا تضف بيانات مدرجة هنا - جميع البيانات يجب أن تأتي من MongoDB
    ];
    
    for (const setting of defaultSettings) {
      await Settings.findOneAndUpdate(
        { key: setting.key },
        setting,
        { upsert: true }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الإعدادات الافتراضية',
      count: defaultSettings.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
