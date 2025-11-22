'use client';
import { useState, useEffect } from 'react';
import { 
  Settings, Save, Database, Bell, Printer, Globe,
  DollarSign, FileText, Shield, Download, Upload, RefreshCw
} from 'lucide-react';

const SETTINGS_KEY_MAP = {
  companyName: 'company_name',
  companyAddress: 'company_address',
  companyPhone: 'company_phone',
  companyEmail: 'company_email',
  taxNumber: 'tax_number',
  taxRate: 'tax_rate',
  currency: 'currency',
  currencySymbol: 'currency_symbol',
  invoicePrefix: 'invoice_prefix',
  lowStockThreshold: 'low_stock_threshold',
  enableNotifications: 'enable_notifications',
  enableEmail: 'enable_email',
  emailHost: 'email_host',
  emailPort: 'email_port',
  emailUser: 'email_user',
  backupEnabled: 'backup_enabled',
  backupFrequency: 'backup_frequency'
};

const INITIAL_SETTINGS_STATE = {
  companyName: '',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  taxNumber: '',
  taxRate: 0,
  currency: '',
  currencySymbol: '',
  invoicePrefix: '',
  lowStockThreshold: 0,
  enableNotifications: false,
  enableEmail: false,
  emailHost: '',
  emailPort: '',
  emailUser: '',
  backupEnabled: false,
  backupFrequency: ''
};

const BOOLEAN_SETTINGS_KEYS = new Set(['enableNotifications', 'enableEmail', 'backupEnabled']);
const NUMERIC_SETTINGS_KEYS = new Set(['taxRate', 'lowStockThreshold']);

export default function SettingsPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS_STATE);

  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();

      if (data.success && data.data) {
        // Convert database keys back to camelCase and merge with defaults
        const loadedSettings = { ...INITIAL_SETTINGS_STATE };
        for (const [dbKey, value] of Object.entries(data.data)) {
          // Find the camelCase key that maps to this db key
          const camelKey = Object.keys(SETTINGS_KEY_MAP).find(key => SETTINGS_KEY_MAP[key] === dbKey);
          if (camelKey) {
            // Convert value based on type
            if (BOOLEAN_SETTINGS_KEYS.has(camelKey)) {
              loadedSettings[camelKey] = Boolean(value);
            } else if (NUMERIC_SETTINGS_KEYS.has(camelKey)) {
              loadedSettings[camelKey] = Number(value) || 0;
            } else {
              loadedSettings[camelKey] = value || '';
            }
          }
        }
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('خطأ في جلب الإعدادات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // Convert camelCase keys to snake_case for API
      const settingsToSave = {};
      for (const [camelKey, value] of Object.entries(settings)) {
        const snakeKey = SETTINGS_KEY_MAP[camelKey];
        if (snakeKey) {
          settingsToSave[snakeKey] = value;
        }
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave)
      });

      const data = await res.json();

      if (data.success) {
        setSaveMessage('تم حفظ الإعدادات بنجاح!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('حدث خطأ في حفظ الإعدادات');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      setSaveMessage('حدث خطأ في حفظ الإعدادات');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      const res = await fetch('/api/backup/create', { method: 'POST' });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${Date.now()}.json`;
        a.click();
      }
    } catch (error) {
      console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('backup', file);

    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('خطأ في استعادة البيانات:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  إعدادات النظام
                </h1>
                <p className="text-gray-600 text-sm mt-1">تخصيص وإدارة إعدادات التطبيق</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saveMessage && (
                <div className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 ${
                  saveMessage.includes('نجاح')
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                    : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'
                }`}>
                  {saveMessage}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 space-y-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white/20'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-indigo-100 group-hover:to-purple-100'
                  }`}>
                    <tab.icon className={`w-5 h-5 transition-colors duration-300 ${
                      activeTab === tab.id ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'
                    }`} />
                  </div>
                  <span className="font-semibold text-right">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              {activeTab === 'company' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      معلومات الشركة
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          اسم الشركة
                        </span>
                      </label>
                      <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                        placeholder="أدخل اسم الشركة"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          الرقم الضريبي
                        </span>
                      </label>
                      <input
                        type="text"
                        value={settings.taxNumber}
                        onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                        placeholder="أدخل الرقم الضريبي"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        العنوان
                      </span>
                    </label>
                    <input
                      type="text"
                      value={settings.companyAddress}
                      onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                      placeholder="أدخل عنوان الشركة"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          رقم الهاتف
                        </span>
                      </label>
                      <input
                        type="tel"
                        value={settings.companyPhone}
                        onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                        placeholder="أدخل رقم الهاتف"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          البريد الإلكتروني
                        </span>
                      </label>
                      <input
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                        placeholder="أدخل البريد الإلكتروني"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'invoice' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      إعدادات الفواتير
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            بادئة رقم الفاتورة
                          </span>
                        </label>
                        <input
                          type="text"
                          value={settings.invoicePrefix}
                          onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                          className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 hover:bg-white"
                          placeholder="مثال: INV-"
                        />
                        <p className="text-xs text-gray-500 mt-1">سيتم إضافة هذا النص قبل رقم الفاتورة</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            معدل الضريبة (%)
                          </span>
                        </label>
                        <input
                          type="number"
                          value={settings.taxRate}
                          onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50 hover:bg-white"
                          placeholder="14"
                          min="0"
                          max="100"
                        />
                        <p className="text-xs text-gray-500 mt-1">نسبة الضريبة المضافة للفواتير</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            العملة
                          </span>
                        </label>
                        <select
                          value={settings.currency}
                          onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                          className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/50 hover:bg-white"
                        >
                          <option value="EGP">🇪🇬 جنيه مصري (EGP)</option>
                          <option value="USD">🇺🇸 دولار أمريكي (USD)</option>
                          <option value="SAR">🇸🇦 ريال سعودي (SAR)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">العملة المستخدمة في النظام</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            رمز العملة
                          </span>
                        </label>
                        <input
                          type="text"
                          value={settings.currencySymbol}
                          onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                          className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/50 hover:bg-white"
                          placeholder="جنيه"
                        />
                        <p className="text-xs text-gray-500 mt-1">الرمز المعروض مع الأرقام</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stock' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      إعدادات المخزون
                    </h2>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-lg font-semibold text-gray-800 mb-2">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                              حد تنبيه المخزون المنخفض
                            </span>
                          </label>
                          <input
                            type="number"
                            value={settings.lowStockThreshold}
                            onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white/50 hover:bg-white text-lg"
                            placeholder="10"
                            min="0"
                          />
                        </div>
                        <div className="bg-white/60 p-4 rounded-xl border border-amber-200">
                          <p className="text-sm text-gray-600 leading-relaxed">
                            <span className="font-semibold text-amber-700">كيف يعمل:</span> عندما يصل مخزون أي منتج إلى هذا الحد أو أقل، سيظهر تحذير في صفحة المخزون وفي لوحة التحكم الرئيسية.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      إعدادات التنبيهات
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 hover:shadow-lg transition-all duration-300">
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={settings.enableNotifications}
                            onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                            className="w-6 h-6 text-indigo-600 rounded-lg focus:ring-indigo-500 focus:ring-2 border-2 border-gray-300 checked:border-indigo-600 checked:bg-indigo-600 transition-all duration-200"
                          />
                          <div className="absolute inset-0 bg-indigo-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                              <Bell className="w-5 h-5 text-white" />
                            </div>
                            <div className="font-bold text-gray-800 text-lg">تفعيل التنبيهات الداخلية</div>
                          </div>
                          <p className="text-gray-600 leading-relaxed">
                            عرض التنبيهات والإشعارات داخل النظام للمخزون المنخفض والفواتير المتأخرة والأحداث المهمة
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300">
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={settings.enableEmail}
                            onChange={(e) => setSettings({ ...settings, enableEmail: e.target.checked })}
                            className="w-6 h-6 text-green-600 rounded-lg focus:ring-green-500 focus:ring-2 border-2 border-gray-300 checked:border-green-600 checked:bg-green-600 transition-all duration-200"
                          />
                          <div className="absolute inset-0 bg-green-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                              <Printer className="w-5 h-5 text-white" />
                            </div>
                            <div className="font-bold text-gray-800 text-lg">تفعيل إشعارات البريد الإلكتروني</div>
                          </div>
                          <p className="text-gray-600 leading-relaxed">
                            إرسال تقارير يومية وتنبيهات مهمة عبر البريد الإلكتروني للمدراء والمشرفين
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      النسخ الاحتياطي والأمان
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 text-center">
                      <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Download className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-3 text-lg">تحميل نسخة احتياطية</h3>
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        احفظ نسخة كاملة من قاعدة البيانات تحتوي على جميع المبيعات والمشتريات والعملاء
                      </p>
                      <button
                        onClick={handleBackup}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <span className="flex items-center gap-2">
                          <Download className="w-5 h-5" />
                          تحميل النسخة
                        </span>
                      </button>
                    </div>

                    <div className="group bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl border-2 border-dashed border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 text-center">
                      <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-3 text-lg">استعادة من نسخة احتياطية</h3>
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        استرجع البيانات من ملف نسخة احتياطية محفوظ سابقاً
                      </p>
                      <label className="cursor-pointer bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleRestore}
                          className="hidden"
                        />
                        <span className="flex items-center gap-2">
                          <Upload className="w-5 h-5" />
                          رفع النسخة
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6">
                    <div className="flex gap-4">
                      <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-yellow-800 mb-2 text-lg">تحذير أمني مهم</h4>
                        <p className="text-yellow-700 leading-relaxed">
                          استعادة النسخة الاحتياطية ستؤدي إلى استبدال جميع البيانات الحالية بالبيانات المحفوظة في الملف.
                          تأكد من حفظ نسخة احتياطية من البيانات الحالية قبل الاستعادة لتجنب فقدان أي بيانات مهمة.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-yellow-600">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>يُنصح بعمل نسخة احتياطية يومية</span>
                        </div>
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