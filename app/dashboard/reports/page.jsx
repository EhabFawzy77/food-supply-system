'use client';
import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, DollarSign, Calendar,
  Download, FileText, Users, Package, PieChart
} from 'lucide-react';
 // import { jsPDF } from 'jspdf';
// import html2canvas from 'html2canvas'; // Uncomment after installing: npm install html2canvas
import { exportUtils } from '../../../lib/utils/export';

export default function ReportsPage() {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [salesStats, setSalesStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [purchaseStats, setPurchaseStats] = useState(null);
  const [customerDebts, setCustomerDebts] = useState(0);

  const periods = [
    { value: 'today', label: 'اليوم' },
    { value: 'yesterday', label: 'أمس' },
    { value: 'week', label: 'هذا الأسبوع' },
    { value: 'month', label: 'هذا الشهر' },
    { value: 'year', label: 'هذا العام' }
  ];

  const getDateRange = (period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = today;
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1);
        endDate = today;
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        break;
      default:
        return {};
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  };

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

      // جلب إحصائيات المشتريات مع فلترة الفترة
      const dateRange = getDateRange(period);
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const token = localStorage.getItem('authToken');
      const purchasesRes = await fetch(`/api/purchases?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const purchasesData = await purchasesRes.json();
      if (purchasesData.success) {
        const purchases = purchasesData.data || [];
        const totalPurchases = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
        setPurchaseStats({ totalPurchases });
      }

      // جلب إجمالي ديون العملاء
      const customersRes = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const customersData = await customersRes.json();
      if (customersData.success) {
        const customers = customersData.data || [];
        const totalDebts = customers.reduce((sum, c) => sum + (c.currentDebt || 0), 0);
        setCustomerDebts(totalDebts);
      }
    } catch (error) {
      console.error('خطأ في جلب التقارير:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, percentage, trend }) => (
    <div className={`bg-white rounded-lg shadow-lg p-4 border-r-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color.replace('border', 'bg').replace('600', '100')}`}>
          <Icon className={`w-5 h-5 ${color.replace('border', 'text')}`} />
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
      <div className="text-xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-gray-600 font-semibold text-sm">{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/20 p-8 text-center animate-fadeIn">
          <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  const profitMargin = salesStats?.profitMargin || 0;

  const handleExport = () => {
    // Uncomment the following after installing html2canvas
    /*
    import('html2canvas').then(({ default: html2canvas }) => {
      const reportDiv = document.createElement('div');
      reportDiv.innerHTML = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: white; color: black; width: 800px;">
          <h1 style="text-align: center;">تقرير الإحصائيات الشامل</h1>
          <p>الفترة: ${periods.find(p => p.value === period)?.label}</p>
          <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</p>
          <h2>المبيعات:</h2>
          <p>إجمالي المبيعات: ${(salesStats?.totalSales || 0).toLocaleString()} جنيه</p>
          <p>صافي الربح: ${(salesStats?.totalProfit || 0).toLocaleString()} جنيه</p>
          <p>عدد المعاملات: ${salesStats?.transactions || 0}</p>
          <p>مبيعات كاش: ${(salesStats?.cashSales || 0).toLocaleString()} جنيه</p>
          <p>مبيعات آجلة: ${(salesStats?.creditSales || 0).toLocaleString()} جنيه</p>
          <p>تكلفة البضاعة: ${(salesStats?.totalCost || 0).toLocaleString()} جنيه</p>
          <p>هامش الربح: ${profitMargin.toFixed(1)}%</p>
          <h2>المدفوعات:</h2>
          <p>مدفوعات معلقة: ${(paymentStats?.pendingPayments || 0).toLocaleString()} جنيه</p>
          <h2>المشتريات:</h2>
          <p>إجمالي المشتريات: ${(purchaseStats?.totalPurchases || 0).toLocaleString()} جنيه</p>
        </div>
      `;
      reportDiv.style.position = 'absolute';
      reportDiv.style.left = '-9999px';
      document.body.appendChild(reportDiv);

      html2canvas(reportDiv).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF();
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        doc.save('تقرير-الإحصائيات.pdf');
        document.body.removeChild(reportDiv);
      });
    });
    */

    // Fallback to CSV
    const exportData = [
      {
        'الفئة': 'المبيعات',
        'إجمالي المبيعات': salesStats?.totalSales || 0,
        'صافي الربح': salesStats?.totalProfit || 0,
        'عدد المعاملات': salesStats?.transactions || 0,
        'مبيعات كاش': salesStats?.cashSales || 0,
        'مبيعات آجلة': salesStats?.creditSales || 0,
        'تكلفة البضاعة': salesStats?.totalCost || 0,
        'هامش الربح': `${profitMargin.toFixed(1)}%`
      },
      {
        'الفئة': 'المدفوعات',
        'مدفوعات معلقة': paymentStats?.pendingPayments || 0
      },
      {
        'الفئة': 'المشتريات',
        'إجمالي المشتريات': purchaseStats?.totalPurchases || 0
      }
    ];

    exportUtils.toCSV(exportData, 'تقرير-الإحصائيات');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl border border-white/20 p-6 mb-8 animate-fadeIn">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  التقارير والإحصائيات
                </h1>
                <p className="text-gray-600 mt-1">تحليل شامل لأداء الأعمال</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm font-semibold"
              >
                {periods.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>

            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl p-6 border border-green-200/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-green-600">{(salesStats?.totalSales || 0).toLocaleString()}</span>
            </div>
            <div className="text-sm font-semibold text-gray-700">إجمالي المبيعات</div>
            <div className="text-xs text-gray-500 mt-1">جنيه</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-200/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{(salesStats?.totalProfit || 0).toLocaleString()}</span>
            </div>
            <div className="text-sm font-semibold text-gray-700">صافي الربح</div>
            <div className="text-xs text-gray-500 mt-1">جنيه</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl p-6 border border-purple-200/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-purple-600">{salesStats?.transactions || 0}</span>
            </div>
            <div className="text-sm font-semibold text-gray-700">عدد المعاملات</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl p-6 border border-orange-200/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-orange-600">{(purchaseStats?.totalPurchases || 0).toLocaleString()}</span>
            </div>
            <div className="text-sm font-semibold text-gray-700">إجمالي المشتريات</div>
            <div className="text-xs text-gray-500 mt-1">جنيه</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 rounded-2xl p-6 border border-indigo-200/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-indigo-600">{profitMargin.toFixed(1)}%</span>
            </div>
            <div className="text-sm font-semibold text-gray-700">هامش الربح</div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Breakdown */}
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl border border-white/20 p-6 animate-fadeIn">
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              تفاصيل المبيعات
            </h3>
            <div className="space-y-4">
              <div className="backdrop-blur-xl bg-gradient-to-r from-green-50/80 to-green-100/80 rounded-2xl p-6 border border-green-200/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">إجمالي المبيعات</div>
                    <div className="text-2xl font-bold text-green-700">
                      {(salesStats?.totalSales || 0).toLocaleString()} جنيه
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-gradient-to-r from-red-50/80 to-red-100/80 rounded-2xl p-6 border border-red-200/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">تكلفة البضاعة</div>
                    <div className="text-2xl font-bold text-red-700">
                      {(salesStats?.totalCost || 0).toLocaleString()} جنيه
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-gradient-to-r from-blue-50/80 to-blue-100/80 rounded-2xl p-6 border border-blue-200/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">صافي الربح</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {(salesStats?.totalProfit || 0).toLocaleString()} جنيه
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Overview */}
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl border border-white/20 p-6 animate-fadeIn">
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              حالة المدفوعات
            </h3>
            <div className="space-y-4">
              <div className="backdrop-blur-xl bg-gradient-to-r from-green-50/80 to-green-100/80 rounded-2xl p-6 border border-green-200/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700 font-semibold">مبيعات كاش</span>
                  <span className="text-green-700 font-bold text-lg">{(salesStats?.cashSales || 0).toLocaleString()} جنيه</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((salesStats?.cashSales || 0) / (salesStats?.totalSales || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {(((salesStats?.cashSales || 0) / (salesStats?.totalSales || 1)) * 100).toFixed(1)}% من إجمالي المبيعات
                </div>
              </div>

              <div className="backdrop-blur-xl bg-gradient-to-r from-orange-50/80 to-orange-100/80 rounded-2xl p-6 border border-orange-200/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700 font-semibold">مبيعات آجلة</span>
                  <span className="text-orange-700 font-bold text-lg">{(salesStats?.creditSales || 0).toLocaleString()} جنيه</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((salesStats?.creditSales || 0) / (salesStats?.totalSales || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {(((salesStats?.creditSales || 0) / (salesStats?.totalSales || 1)) * 100).toFixed(1)}% من إجمالي المبيعات
                </div>
              </div>

              <div className="backdrop-blur-xl bg-gradient-to-r from-red-50/80 to-red-100/80 rounded-2xl p-6 border border-red-200/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700 font-semibold">إجمالي الديون المعلقة</span>
                  <span className="text-red-700 font-bold text-lg">{customerDebts.toLocaleString()} جنيه</span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(customerDebts / (salesStats?.totalSales || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {((customerDebts / (salesStats?.totalSales || 1)) * 100).toFixed(1)}% من إجمالي المبيعات
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
