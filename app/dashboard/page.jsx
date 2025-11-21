'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign, TrendingUp, ShoppingCart, Package, Users,
  AlertTriangle, Calendar, ArrowRight, Warehouse, CreditCard,
  Zap
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
        setRecentSales(recentSalesData.data.slice(0, 3) || []);
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

  const StatCard = ({ icon: Icon, label, value, color, link, gradient }) => (
    <Link href={link}>
      <div className={`group bg-gradient-to-br ${gradient} rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden p-4`}>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-2xl group-hover:text-yellow-100 transition-colors mb-2">{value}</div>
              <div className="text-white/80 text-sm group-hover:text-white/90 transition-colors">{label}</div>
            </div>
          </div>
          <div className="w-full h-1 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors"></div>
        </div>
      </div>
    </Link>
  );

  const QuickAction = ({ icon: Icon, label, link, color, description }) => (
    <Link href={link}>
      <div className={`group p-6 ${color} rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden h-32`}>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg group-hover:text-yellow-100 transition-colors">{label}</div>
              <div className="text-white/80 text-sm group-hover:text-white/90 transition-colors">{description}</div>
            </div>
          </div>
          <div className="w-full h-1 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors"></div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">



        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              إجراءات سريعة
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <QuickAction
              icon={ShoppingCart}
              label="إضافة فاتوره"
              link="/dashboard/sales/create"
              color="bg-gradient-to-br from-green-500 to-emerald-600"
            />
            <QuickAction
              icon={Package}
              label="إضافة منتج"
              link="/dashboard/products"
              color="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <QuickAction
              icon={Users}
              label="إضافة عميل"
              link="/dashboard/customers"
              color="bg-gradient-to-br from-purple-500 to-violet-600"
            />
            <QuickAction
              icon={Warehouse}
              label="عرض المخزون"
              link="/dashboard/inventory"
              color="bg-gradient-to-br from-orange-500 to-amber-600"
            />
            <QuickAction
              icon={DollarSign}
              label="إجمالي المبيعات"
              link="/dashboard/reports"
              color="bg-gradient-to-br from-green-500 to-emerald-600"
              description={`${(stats.sales?.totalSales || 0).toLocaleString()} جنيه`}
            />
            <QuickAction
              icon={TrendingUp}
              label="صافي الربح"
              link="/dashboard/reports"
              color="bg-gradient-to-br from-blue-500 to-indigo-600"
              description={`${(stats.sales?.totalProfit || 0).toLocaleString()} جنيه`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Sales */}
          <div className="xl:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  آخر المبيعات
                </h2>
              </div>
              <Link href="/dashboard/invoices" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm font-semibold flex items-center gap-2 group shadow-lg hover:shadow-xl">
                عرض الكل
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {recentSales.length > 0 ? (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale._id} className="group p-4 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-xl hover:from-indigo-50/50 hover:to-blue-50/50 transition-all duration-300 border border-gray-100 hover:border-indigo-200 hover:shadow-md cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                          <ShoppingCart className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base group-hover:text-indigo-900 transition-colors">{sale.invoiceNumber}</div>
                          <div className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                            {sale.customer?.name || 'عميل محذوف'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 text-lg group-hover:text-green-700 transition-colors">
                          {(sale.total || 0).toLocaleString()} جنيه
                        </div>
                        <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                          {new Date(sale.saleDate).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4 inline-block">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 font-semibold text-base">لا توجد مبيعات اليوم</p>
                <p className="text-gray-400 text-sm mt-1">ابدأ بإنشاء فاتورة بيع جديدة</p>
              </div>
            )}
          </div>

          {/* Alerts */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                التنبيهات
              </h2>
            </div>
            
            <div className="space-y-4">
              <Link href="/dashboard/inventory">
                <div className={`group p-5 border-2 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  stats.lowStock > 0
                    ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:border-red-300 hover:from-red-100 hover:to-rose-100'
                    : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300 hover:from-gray-100 hover:to-slate-100'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shadow-lg ${
                      stats.lowStock > 0
                        ? 'bg-gradient-to-br from-red-500 to-rose-600'
                        : 'bg-gradient-to-br from-gray-400 to-slate-500'
                    }`}>
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-base mb-1 ${
                        stats.lowStock > 0 ? 'text-red-900' : 'text-gray-900'
                      } group-hover:text-red-900 transition-colors`}>مخزون منخفض</div>
                      <div className={`text-sm leading-relaxed ${
                        stats.lowStock > 0 ? 'text-red-700' : 'text-gray-700'
                      } group-hover:text-red-800 transition-colors`}>
                        {stats.lowStock} منتج يحتاج إلى إعادة تعبئة
                      </div>
                      {stats.lowStock > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-semibold text-red-600">يتطلب انتباه فوري</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/customers?filter=debt">
                <div className={`group p-5 border-2 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  stats.customersWithDebt > 0
                    ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:border-orange-300 hover:from-orange-100 hover:to-amber-100'
                    : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300 hover:from-gray-100 hover:to-slate-100'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shadow-lg ${
                      stats.customersWithDebt > 0
                        ? 'bg-gradient-to-br from-orange-500 to-amber-600'
                        : 'bg-gradient-to-br from-gray-400 to-slate-500'
                    }`}>
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-base mb-1 ${
                        stats.customersWithDebt > 0 ? 'text-orange-900' : 'text-gray-900'
                      } group-hover:text-orange-900 transition-colors`}>ديون العملاء</div>
                      <div className={`text-sm leading-relaxed ${
                        stats.customersWithDebt > 0 ? 'text-orange-700' : 'text-gray-700'
                      } group-hover:text-orange-800 transition-colors`}>
                        {stats.customersWithDebt} عميل لديهم ديون مستحقة
                      </div>
                      {stats.customersWithDebt > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-semibold text-orange-600">يحتاج متابعة</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/payments">
                <div className={`group p-5 border-2 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  (stats.payments?.pendingPayments || 0) > 0
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100'
                    : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300 hover:from-gray-100 hover:to-slate-100'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shadow-lg ${
                      (stats.payments?.pendingPayments || 0) > 0
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-br from-gray-400 to-slate-500'
                    }`}>
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-base mb-1 ${
                        (stats.payments?.pendingPayments || 0) > 0 ? 'text-blue-900' : 'text-gray-900'
                      } group-hover:text-blue-900 transition-colors`}>مدفوعات معلقة</div>
                      <div className={`text-sm leading-relaxed ${
                        (stats.payments?.pendingPayments || 0) > 0 ? 'text-blue-700' : 'text-gray-700'
                      } group-hover:text-blue-800 transition-colors`}>
                        {(stats.payments?.pendingPayments || 0).toLocaleString()} جنيه مستحق
                      </div>
                      {(stats.payments?.pendingPayments || 0) > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-semibold text-blue-600">يحتاج دفع</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}