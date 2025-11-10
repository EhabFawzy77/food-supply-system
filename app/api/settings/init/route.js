// app/api/settings/init/route.js
// إنشاء الإعدادات الافتراضية
export async function POST(request) {
  try {
    await connectDB();
    
    const defaultSettings = [
      // إعدادات الشركة
      { key: 'company_name', value: 'شركة التوريدات الغذائية', category: 'company' },
      { key: 'company_address', value: 'القاهرة، مصر', category: 'company' },
      { key: 'company_phone', value: '01012345678', category: 'company' },
      { key: 'company_email', value: 'info@company.com', category: 'company' },
      { key: 'tax_number', value: '123-456-789', category: 'company' },
      
      // إعدادات الفواتير
      { key: 'invoice_prefix', value: 'INV', category: 'invoice' },
      { key: 'tax_rate', value: 14, category: 'invoice' },
      { key: 'currency', value: 'EGP', category: 'invoice' },
      { key: 'currency_symbol', value: 'جنيه', category: 'invoice' },
      
      // إعدادات المخزون
      { key: 'low_stock_threshold', value: 50, category: 'inventory' },
      { key: 'expiry_warning_days', value: 30, category: 'inventory' },
      { key: 'enable_batch_tracking', value: true, category: 'inventory' },
      
      // إعدادات التنبيهات
      { key: 'enable_notifications', value: true, category: 'notifications' },
      { key: 'enable_email', value: false, category: 'notifications' },
      { key: 'enable_sms', value: false, category: 'notifications' },
      
      // إعدادات النسخ الاحتياطي
      { key: 'backup_enabled', value: true, category: 'backup' },
      { key: 'backup_frequency', value: 'daily', category: 'backup' },
      { key: 'backup_retention_days', value: 30, category: 'backup' }
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
