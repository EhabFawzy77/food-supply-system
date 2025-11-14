'use client';
import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Calendar, 
  Download, FileText, Users, Package, PieChart
} from 'lucide-react';

export default function ReportsPage() {
  const [period, setPeriod] = useState('today');
  const [reportData, setReportData] = useState({
    sales: {
      totalSales: 0,
      totalProfit: 0,
      totalCost: 0,
      transactions: 0,
      averageTransaction: 0
    },
    purchases: {
      totalPurchases: 0,
      transactions: 0
    },
    payments: {
      cashSales: 0,
      creditSales: 0,
      receivedPayments: 0,
      pendingPayments: 0
    },
    topProducts: [],
    topCustomers: []
  });

  useEffect(() => {
    // محاكاة بيانات التقارير
    setReportData({
      sales: {
        totalSales: 45230,
        totalProfit: 12450,
        totalCost: 32780,
        transactions: 38,
        averageTransaction: 1190
      },
      purchases: {
        totalPurchases: 28500,
        transactions: 12
      },
      payments: {
        cashSales: 28500,
        creditSales: 16730,
        receivedPayments: 8500,
        pendingPayments: 8230
      },
      topProducts: [
        { name: 'أرز أبيض', quantity: 250, revenue: 6250 },
        { name: 'زيت عباد الشمس', quantity: 180, revenue: 8100 },
        { name: 'سكر أبيض', quantity: 200, revenue: 6000 },
        { name: 'مكرونة', quantity: 320, revenue: 5760 },
        { name: 'ملح', quantity: 150, revenue: 1200 }
      ],
      topCustomers: [
        { name: 'سوبر ماركت النور', transactions: 12, total: 18500 },
        { name: 'محل الأمل', transactions: 8, total: 9800 },
        { name: 'مطعم الفردوس', transactions: 6, total: 7200 },
        { name: 'بقالة السلام', transactions: 5, total: 5600 },
        { name: 'كافتيريا المدينة', transactions: 4, total: 4130 }
      ]
    });
  }, [period]);

  const periods = [
    { value: 'today', label: 'اليوم' },
    { value: 'yesterday', label: 'أمس' },
    { value: 'week', label: 'هذا الأسبوع' },
    { value: 'month', label: 'هذا الشهر' },
    { value: 'year', label: 'هذا العام' }
  ];

  const profitMargin = ((reportData.sales.totalProfit / reportData.sales.totalSales) * 100).toFixed(1);

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
            value={`${reportData.sales.totalSales.toLocaleString()} جنيه`}
            color="border-green-600"
            percentage="12.5"
            trend="up"
          />
          <StatCard
            icon={TrendingUp}
            label="صافي الربح"
            value={`${reportData.sales.totalProfit.toLocaleString()} جنيه`}
            color="border-blue-600"
            percentage="8.3"
            trend="up"
          />
          <StatCard
            icon={Package}
            label="عدد المعاملات"
            value={reportData.sales.transactions}
            color="border-purple-600"
            percentage="5.7"
            trend="up"
          />
          <StatCard
            icon={FileText}
            label="متوسط الفاتورة"
            value={`${reportData.sales.averageTransaction.toLocaleString()} جنيه`}
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
                    {reportData.sales.totalSales.toLocaleString()} جنيه
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
                    {reportData.sales.totalCost.toLocaleString()} جنيه
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
                    {reportData.sales.totalProfit.toLocaleString()} جنيه
                  </div>
                </div>
                <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-blue-700" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">هامش الربح:</span>
                  <span className="text-2xl font-bold text-indigo-600">{profitMargin}%</span>
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
                  <span className="text-green-700 font-bold">{reportData.payments.cashSales.toLocaleString()} جنيه</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(reportData.payments.cashSales / reportData.sales.totalSales) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border-r-4 border-orange-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-semibold">مبيعات آجلة</span>
                  <span className="text-orange-700 font-bold">{reportData.payments.creditSales.toLocaleString()} جنيه</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${(reportData.payments.creditSales / reportData.sales.totalSales) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-r-4 border-blue-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-semibold">مدفوعات مستلمة</span>
                  <span className="text-blue-700 font-bold">{reportData.payments.receivedPayments.toLocaleString()} جنيه</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(reportData.payments.receivedPayments / reportData.payments.creditSales) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border-r-4 border-red-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-semibold">مدفوعات معلقة</span>
                  <span className="text-red-700 font-bold">{reportData.payments.pendingPayments.toLocaleString()} جنيه</span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${(reportData.payments.pendingPayments / reportData.payments.creditSales) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products & Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-600" />
              أكثر المنتجات مبيعاً
            </h3>
            <div className="space-y-3">
              {reportData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.quantity} وحدة</div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-green-600">{product.revenue.toLocaleString()} جنيه</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              أفضل العملاء
            </h3>
            <div className="space-y-3">
              {reportData.topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{customer.name}</div>
                    <div className="text-sm text-gray-600">{customer.transactions} عملية</div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-green-600">{customer.total.toLocaleString()} جنيه</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}