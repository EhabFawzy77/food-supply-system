'use client';
import { useState, useEffect } from 'react';
import { 
  Settings, Save, Database, Bell, Printer, Globe,
  DollarSign, FileText, Shield, Download, Upload, RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'شركة التوريدات الغذائية',
    companyAddress: 'القاهرة، مصر',
    companyPhone: '01012345678',
    companyEmail: 'info@company.com',
    taxNumber: '123-456-789',
    taxRate: 14,
    currency: 'EGP',
    currencySymbol: 'جنيه',
    invoicePrefix: 'INV',
    lowStockThreshold: 50,
    expiryWarningDays: 30,
    enableNotifications: true,
    enableEmail: false,
    emailHost: '',
    emailPort: '',
    emailUser: '',
    backupEnabled: true,
    backupFrequency: 'daily'
  });

  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        alert('✅ تم حفظ الإعدادات بنجاح');
      }
    } catch (error) {
      alert('❌ حدث خطأ في حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackup = async () => {
    if (!confirm('هل تريد عمل نسخة احتياطية من قاعدة البيانات؟')) return;

    try {
      const res = await fetch('/api/backup/create', { method: 'POST' });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${Date.now()}.json`;
        a.click();
        alert('✅ تم إنشاء النسخة الاحتياطية بنجاح');
      }
    } catch (error) {
      alert('❌ حدث خطأ في إنشاء النسخة الاحتياطية');
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm('⚠️ تحذير: سيتم استبدال البيانات الحالية. هل أنت متأكد؟')) return;

    const formData = new FormData();
    formData.append('backup', file);

    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert('✅ تم استعادة البيانات بنجاح');
        window.location.reload();
      }
    } catch (error) {
      alert('❌ حدث خطأ في استعادة البيانات');
    }
  };

  const tabs = [
    { id: 'company', label: 'معلومات الشركة', icon: Globe },
    { id: 'invoice', label: 'الفواتير', icon: FileText },
    { id: 'stock', label: 'المخزون', icon: Database },
    { id: 'notifications', label: 'التنبيهات', icon: Bell },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">الإعدادات</h1>
                <p className="text-gray-600 text-sm">إدارة إعدادات النظام</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {activeTab === 'company' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">معلومات الشركة</h2>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">اسم الشركة</label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">العنوان</label>
                    <input
                      type="text"
                      value={settings.companyAddress}
                      onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">رقم الهاتف</label>
                      <input
                        type="tel"
                        value={settings.companyPhone}
                        onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">الرقم الضريبي</label>
                    <input
                      type="text"
                      value={settings.taxNumber}
                      onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'invoice' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">إعدادات الفواتير</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">بادئة رقم الفاتورة</label>
                      <input
                        type="text"
                        value={settings.invoicePrefix}
                        onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">معدل الضريبة (%)</label>
                      <input
                        type="number"
                        value={settings.taxRate}
                        onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">العملة</label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="EGP">جنيه مصري (EGP)</option>
                        <option value="USD">دولار أمريكي (USD)</option>
                        <option value="SAR">ريال سعودي (SAR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">رمز العملة</label>
                      <input
                        type="text"
                        value={settings.currencySymbol}
                        onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stock' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">إعدادات المخزون</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">حد تنبيه المخزون المنخفض</label>
                      <input
                        type="number"
                        value={settings.lowStockThreshold}
                        onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">التنبيه عندما تقل الكمية عن هذا الحد</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">تنبيه انتهاء الصلاحية (بالأيام)</label>
                      <input
                        type="number"
                        value={settings.expiryWarningDays}
                        onChange={(e) => setSettings({ ...settings, expiryWarningDays: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">التنبيه قبل انتهاء الصلاحية بـ X يوم</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">إعدادات التنبيهات</h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      <input
                        type="checkbox"
                        checked={settings.enableNotifications}
                        onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                        className="w-5 h-5 text-indigo-600"
                      />
                      <div>
                        <div className="font-semibold text-gray-800">تفعيل التنبيهات</div>
                        <div className="text-sm text-gray-600">تلقي تنبيهات داخل النظام</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      <input
                        type="checkbox"
                        checked={settings.enableEmail}
                        onChange={(e) => setSettings({ ...settings, enableEmail: e.target.checked })}
                        className="w-5 h-5 text-indigo-600"
                      />
                      <div>
                        <div className="font-semibold text-gray-800">تفعيل البريد الإلكتروني</div>
                        <div className="text-sm text-gray-600">إرسال تنبيهات عبر البريد</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">النسخ الاحتياطي</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-indigo-500 transition">
                      <Download className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-800 mb-2">تحميل نسخة احتياطية</h3>
                      <p className="text-sm text-gray-600 mb-4">احفظ نسخة من قاعدة البيانات</p>
                      <button
                        onClick={handleBackup}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                      >
                        تحميل النسخة
                      </button>
                    </div>

                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-orange-500 transition">
                      <Upload className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-800 mb-2">استعادة من نسخة احتياطية</h3>
                      <p className="text-sm text-gray-600 mb-4">استرجع البيانات من ملف</p>
                      <label className="cursor-pointer bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition inline-block">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleRestore}
                          className="hidden"
                        />
                        رفع النسخة
                      </label>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-yellow-800 mb-1">تحذير مهم</h4>
                        <p className="text-sm text-yellow-700">
                          استعادة النسخة الاحتياطية ستؤدي إلى استبدال جميع البيانات الحالية. 
                          تأكد من حفظ نسخة احتياطية قبل الاستعادة.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}