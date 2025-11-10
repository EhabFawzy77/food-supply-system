'use client';
import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Calendar, 
  Download, FileText, Users, Package, PieChart
} from 'lucide-react';

export default function ReportsPage() {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [salesStats, setSalesStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);

  const periods = [
    { value: 'today', label: 'اليوم' },
    { value: 'yesterday', label: 'أمس' },
    { value: 'week', label: 'هذا الأسبوع' },
    { value: 'month', label: 'هذا الشهر' },
    { value: 'year', label: 'هذا العام' }
  ];

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // جلب إحصائيات المبيعات
      const salesRes = await fetch(`/api/sales/stats?period=${period}`);
      const salesData = await salesRes.json();
      if (salesData.success) {
        setSalesStats(salesData.data);
      }

      // جلب إحصائيات المدفوعات
      const paymentsRes = await fetch(`/api/payments/stats?period=${period}`);
      const paymentsData = await paymentsRes.json();
      if (paymentsData.success) {
        setPaymentStats(paymentsData.data);
      }
    } catch (error) {
      console.error('خطأ في جلب التقارير:', error);
      alert('حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, percentage, trend }) => (
    <div className={`bg-white rounded-lg shadow-lg p-6 border-r-4 ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${color.replace('border', 'bg').replace('600', '100')}`}>
          <Icon className={`w-6 h-6 ${color.replace('border', 'text')}`} />
        </div>
        {percentage && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {percentage}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-gray-600 font-semibold">{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const profitMargin = salesStats?.profitMargin || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">التقارير والإحصائيات</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                {periods.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition font-semibold">
                <Download className="w-5 h-5" />
                تصدير PDF
              </button>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={DollarSign}
            label="إجمالي المبيعات"
            value={`${(salesStats?.totalSales || 0).toLocaleString()} جنيه`}
            color="border-green-600"
          />
          <StatCard
            icon={TrendingUp}
            label="صافي الربح"
            value={`${(salesStats?.totalProfit || 0).toLocaleString()} جنيه`}
            color="border-blue-600"
          />
          <StatCard
            icon={Package}
            label="عدد المعاملات"
            value={salesStats?.transactions || 0}
            color="border-purple-600"
          />
          <StatCard
            icon={FileText}
            label="متوسط الفاتورة"
            value={`${(salesStats?.averageTransaction || 0).toLocaleString()} جنيه`}
            color="border-orange-600"
          />
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sales Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-indigo-600" />
              تفاصيل المبيعات
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 mb-1">إجمالي المبيعات</div>
                  <div className="text-2xl font-bold text-green-700">
                    {(salesStats?.totalSales || 0).toLocaleString()} جنيه
                  </div>
                </div>
                <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-green-700" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 mb-1">تكلفة البضاعة</div>
                  <div className="text-2xl font-bold text-red-700">
                    {(salesStats?.totalCost || 0).toLocaleString()} جنيه
                  </div>
                </div>
                <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-red-700" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 mb-1">صافي الربح</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {(salesStats?.totalProfit || 0).toLocaleString()} جنيه
                  </div>
                </div>
                <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-blue-700" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">هامش الربح:</span>
                  <span className="text-2xl font-bold text-indigo-600">{profitMargin.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Overview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-indigo-600" />
              حالة المدفوعات
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-lg border-r-4 border-green-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-semibold">مبيعات كاش</span>
                  <span className="text-green-700 font-bold">{(salesStats?.cashSales || 0).toLocaleString()} جنيه</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${((salesStats?.cashSales || 0) / (salesStats?.totalSales || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border-r-4 border-orange-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-semibold">مبيعات آجلة</span>
                  <span className="text-orange-700 font-bold">{(salesStats?.creditSales || 0).toLocaleString()} جنيه</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${((salesStats?.creditSales || 0) / (salesStats?.totalSales || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border-r-4 border-red-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-semibold">مدفوعات معلقة</span>
                  <span className="text-red-700 font-bold">{(paymentStats?.pendingPayments || 0).toLocaleString()} جنيه</span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${((paymentStats?.pendingPayments || 0) / (salesStats?.totalSales || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-6">ملخص الأداء</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm opacity-80 mb-2">إجمالي المعاملات</div>
              <div className="text-3xl font-bold">{salesStats?.transactions || 0}</div>
            </div>
            <div>
              <div className="text-sm opacity-80 mb-2">متوسط الربح لكل معاملة</div>
              <div className="text-3xl font-bold">
                {salesStats?.transactions > 0 
                  ? ((salesStats?.totalProfit || 0) / salesStats.transactions).toLocaleString() 
                  : 0} جنيه
              </div>
            </div>
            <div>
              <div className="text-sm opacity-80 mb-2">معدل الربحية</div>
              <div className="text-3xl font-bold">{profitMargin.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}