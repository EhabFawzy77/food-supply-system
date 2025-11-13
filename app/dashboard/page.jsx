'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  DollarSign, TrendingUp, ShoppingCart, Package, Users, 
  AlertTriangle, Calendar, ArrowRight, Warehouse, CreditCard,
  Activity, BarChart3, Zap, Clock
} from 'lucide-react';

export default function DashboardHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sales: null,
    payments: null,
    lowStock: 0,
    customersWithDebt: 0
  });
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // جلب إحصائيات المبيعات
      const salesRes = await fetch('/api/sales/stats?period=today');
      const salesData = await salesRes.json();
      if (salesData.success) {
        setStats(prev => ({ ...prev, sales: salesData.data }));
      }

      // جلب إحصائيات المدفوعات
      const paymentsRes = await fetch('/api/payments/stats?period=today');
      const paymentsData = await paymentsRes.json();
      if (paymentsData.success) {
        setStats(prev => ({ ...prev, payments: paymentsData.data }));
      }

      // جلب آخر المبيعات
      const recentSalesRes = await fetch('/api/sales');
      const recentSalesData = await recentSalesRes.json();
      if (recentSalesData.success) {
        setRecentSales(recentSalesData.data.slice(0, 5) || []);
      }

      // جلب المخزون المنخفض
      const inventoryRes = await fetch('/api/inventory?lowStock=true');
      const inventoryData = await inventoryRes.json();
      if (inventoryData.success) {
        setStats(prev => ({ ...prev, lowStock: inventoryData.data?.length || 0 }));
      }

      // جلب العملاء الذين لديهم ديون
      const customersRes = await fetch('/api/customers');
      const customersData = await customersRes.json();
      if (customersData.success) {
        const withDebt = customersData.data.filter(c => (c.currentDebt || 0) > 0).length;
        setStats(prev => ({ ...prev, customersWithDebt: withDebt }));
      }

    } catch (error) {
      console.error('خطأ في جلب بيانات لوحة التحكم:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, link }) => (
    <Link href={link}>
      <div className={`group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 border-l-4 ${color} hover:translate-y-[-2px]`}>
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${color.replace('border', 'bg').replace('600', '100')}`}>
            <Icon className={`w-5 h-5 ${color.replace('border', 'text')}`} />
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-gray-600 font-medium text-xs">{label}</div>
      </div>
    </Link>
  );

  const QuickAction = ({ icon: Icon, label, link, color }) => (
    <Link href={link}>
      <div className={`p-4 ${color} rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-3 group`}>
        <div className="p-2 bg-white bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-semibold text-sm">{label}</span>
      </div>
    </Link>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 md:p-8 mb-8 text-white overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-white opacity-5 rounded-full"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">مرحباً بك في لوحة التحكم</h1>
              <p className="text-indigo-100 text-lg">نظام إدارة التوريدات الغذائية المتكامل</p>
              <div className="flex items-center gap-2 mt-3 text-indigo-200">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {new Date().toLocaleDateString('ar-EG', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            <Activity className="w-24 h-24 opacity-20 hidden md:block" />
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatCard
            icon={DollarSign}
            label="مبيعات اليوم"
            value={`${(stats.sales?.totalSales || 0).toLocaleString()} جنيه`}
            color="border-l-green-600"
            link="/dashboard/sales/create"
          />
          <StatCard
            icon={TrendingUp}
            label="الأرباح اليوم"
            value={`${(stats.sales?.totalProfit || 0).toLocaleString()} جنيه`}
            color="border-l-blue-600"
            link="/dashboard/reports"
          />
          <StatCard
            icon={ShoppingCart}
            label="عدد الفواتير"
            value={stats.sales?.transactions || 0}
            color="border-l-purple-600"
            link="/dashboard/invoices"
          />
          <StatCard
            icon={CreditCard}
            label="مدفوعات معلقة"
            value={`${(stats.payments?.pendingPayments || 0).toLocaleString()} جنيه`}
            color="border-l-orange-600"
            link="/dashboard/payments"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-5 md:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">إجراءات سريعة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickAction
              icon={ShoppingCart}
              label="إضافة فاتورة بيع"
              link="/dashboard/sales/create"
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <QuickAction
              icon={Package}
              label="إضافة منتج"
              link="/dashboard/products"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <QuickAction
              icon={Users}
              label="إضافة عميل"
              link="/dashboard/customers"
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <QuickAction
              icon={Warehouse}
              label="عرض المخزون"
              link="/dashboard/inventory"
              color="bg-gradient-to-br from-orange-500 to-orange-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Sales */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">آخر المبيعات</h2>
              </div>
              <Link href="/dashboard/sales/create" className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1 group">
                عرض الكل
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
              </Link>
            </div>
            
            {recentSales.length > 0 ? (
              <div className="space-y-2">
                {recentSales.map((sale) => (
                  <div key={sale._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-transparent rounded-lg hover:bg-indigo-50 transition border border-gray-100 hover:border-indigo-200">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-sm">{sale.invoiceNumber}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {sale.customer?.name || 'عميل محذوف'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-sm">{(sale.total || 0).toLocaleString()} جنيه</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(sale.saleDate).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500 font-medium text-sm">لا توجد مبيعات اليوم</p>
              </div>
            )}
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl shadow-md p-5">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-gray-900">التنبيهات</h2>
            </div>
            
            <div className="space-y-2">
              {stats.lowStock > 0 && (
                <Link href="/dashboard/inventory">
                  <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg hover:shadow-md transition cursor-pointer group">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-bold text-red-900 text-sm">مخزون منخفض</div>
                        <div className="text-xs text-red-700 mt-0.5">
                          {stats.lowStock} منتج يحتاج إلى إعادة تعبئة
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {stats.customersWithDebt > 0 && (
                <Link href="/dashboard/customers">
                  <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg hover:shadow-md transition cursor-pointer group">
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-bold text-orange-900 text-sm">ديون معلقة</div>
                        <div className="text-xs text-orange-700 mt-0.5">
                          {stats.customersWithDebt} عميل لديهم مدفوعات معلقة
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {(stats.payments?.pendingPayments || 0) > 0 && (
                <Link href="/dashboard/payments">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-md transition cursor-pointer group">
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-bold text-blue-900 text-sm">مدفوعات معلقة</div>
                        <div className="text-xs text-blue-700 mt-0.5">
                          {(stats.payments?.pendingPayments || 0).toLocaleString()} جنيه مستحق
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {stats.lowStock === 0 && stats.customersWithDebt === 0 && (stats.payments?.pendingPayments || 0) === 0 && (
                <div className="text-center py-6 px-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-gray-600 font-medium text-sm">لا توجد تنبيهات</p>
                  <p className="text-xs text-gray-500 mt-1">كل شيء يعمل بسلاسة</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-5 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">الملخص المالي لليوم</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold text-xs">إجمالي المبيعات</span>
                <div className="p-1.5 bg-green-200 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-700" />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {(stats.sales?.totalSales || 0).toLocaleString()} جنيه
              </div>
              <div className="text-xs text-green-600 mt-1">مقارنة بالأمس ↗</div>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold text-xs">صافي الربح</span>
                <div className="p-1.5 bg-blue-200 rounded-lg">
                  <DollarSign className="w-4 h-4 text-blue-700" />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {(stats.sales?.totalProfit || 0).toLocaleString()} جنيه
              </div>
              <div className="text-xs text-blue-600 mt-1">ربح صافي يومي</div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold text-xs">هامش الربح</span>
                <div className="p-1.5 bg-purple-200 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-purple-700" />
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {(stats.sales?.profitMargin || 0).toFixed(1)}%
              </div>
              <div className="text-xs text-purple-600 mt-1">من إجمالي المبيعات</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}