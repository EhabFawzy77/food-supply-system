'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  DollarSign, TrendingUp, ShoppingCart, Package, Users, 
  AlertTriangle, Calendar, ArrowRight, Warehouse, CreditCard
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
    if (!token) {
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
      const recentSalesRes = await fetch('/api/sales?limit=5');
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
      <div className={`bg-white rounded-lg shadow-lg p-6 border-r-4 ${color} hover:shadow-xl transition cursor-pointer`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-lg ${color.replace('border', 'bg').replace('600', '100')}`}>
            <Icon className={`w-6 h-6 ${color.replace('border', 'text')}`} />
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
        <div className="text-gray-600 font-semibold">{label}</div>
      </div>
    </Link>
  );

  const QuickAction = ({ icon: Icon, label, link, color }) => (
    <Link href={link}>
      <div className={`p-4 ${color} rounded-lg hover:opacity-90 transition cursor-pointer flex items-center gap-3`}>
        <Icon className="w-6 h-6 text-white" />
        <span className="text-white font-semibold">{label}</span>
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
    <>
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">مرحباً بك في لوحة التحكم</h1>
              <p className="text-indigo-100">نظام إدارة التوريدات الغذائية</p>
            </div>
            <Calendar className="w-16 h-16 opacity-50" />
          </div>
          <div className="mt-4 text-sm">
            {new Date().toLocaleDateString('ar-EG', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={DollarSign}
            label="مبيعات اليوم"
            value={`${(stats.sales?.totalSales || 0).toLocaleString()} جنيه`}
            color="border-green-600"
            link="/dashboard/sales"
          />
          <StatCard
            icon={TrendingUp}
            label="الأرباح اليوم"
            value={`${(stats.sales?.totalProfit || 0).toLocaleString()} جنيه`}
            color="border-blue-600"
            link="/dashboard/reports"
          />
          <StatCard
            icon={ShoppingCart}
            label="عدد الفواتير"
            value={stats.sales?.transactions || 0}
            color="border-purple-600"
            link="/dashboard/sales"
          />
          <StatCard
            icon={CreditCard}
            label="مدفوعات معلقة"
            value={`${(stats.payments?.pendingPayments || 0).toLocaleString()} جنيه`}
            color="border-orange-600"
            link="/dashboard/payments"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              icon={ShoppingCart}
              label="إضافة فاتورة بيع"
              link="/dashboard/sales/create"
              color="bg-gradient-to-r from-green-500 to-green-600"
            />
            <QuickAction
              icon={Package}
              label="إضافة منتج"
              link="/dashboard/products"
              color="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            <QuickAction
              icon={Users}
              label="إضافة عميل"
              link="/dashboard/customers"
              color="bg-gradient-to-r from-purple-500 to-purple-600"
            />
            <QuickAction
              icon={Warehouse}
              label="عرض المخزون"
              link="/dashboard/inventory"
              color="bg-gradient-to-r from-orange-500 to-orange-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">آخر المبيعات</h2>
              <Link href="/dashboard/sales" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
                عرض الكل
              </Link>
            </div>
            
            {recentSales.length > 0 ? (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <Link key={sale._id} href={`/dashboard/sales/${sale._id}`} className="w-full text-left flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{sale.invoiceNumber}</div>
                      <div className="text-sm text-gray-600">{sale.customer?.name || 'عميل محذوف'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{(sale.total || 0).toLocaleString()} جنيه</div>
                      <div className="text-xs text-gray-500">{new Date(sale.saleDate).toLocaleDateString('ar-EG')}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>لا توجد مبيعات اليوم</p>
              </div>
            )}
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">التنبيهات</h2>
            
            <div className="space-y-3">
              {stats.lowStock > 0 && (
                <Link href="/dashboard/inventory?filter=low">
                  <div className="p-4 bg-red-50 border-r-4 border-red-500 rounded-lg hover:bg-red-100 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold text-red-700">مخزون منخفض</div>
                        <div className="text-sm text-red-600">
                          {stats.lowStock} منتج يحتاج إلى إعادة تعبئة
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                </Link>
              )}

              {stats.customersWithDebt > 0 && (
                <Link href="/dashboard/customers">
                  <div className="p-4 bg-orange-50 border-r-4 border-orange-500 rounded-lg hover:bg-orange-100 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-orange-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold text-orange-700">ديون معلقة</div>
                        <div className="text-sm text-orange-600">
                          {stats.customersWithDebt} عميل لديهم مدفوعات معلقة
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-orange-400" />
                    </div>
                  </div>
                </Link>
              )}

              {(stats.payments?.pendingPayments || 0) > 0 && (
                <Link href="/dashboard/payments">
                  <div className="p-4 bg-blue-50 border-r-4 border-blue-500 rounded-lg hover:bg-blue-100 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold text-blue-700">مدفوعات معلقة</div>
                        <div className="text-sm text-blue-600">
                          {(stats.payments?.pendingPayments || 0).toLocaleString()} جنيه مستحق
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                </Link>
              )}

              {stats.lowStock === 0 && stats.customersWithDebt === 0 && (stats.payments?.pendingPayments || 0) === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>لا توجد تنبيهات</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">الملخص المالي لليوم</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">إجمالي المبيعات</span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {(stats.sales?.totalSales || 0).toLocaleString()} جنيه
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">صافي الربح</span>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {(stats.sales?.totalProfit || 0).toLocaleString()} جنيه
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">هامش الربح</span>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {(stats.sales?.profitMargin || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}