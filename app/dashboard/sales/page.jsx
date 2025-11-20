'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart, Plus, Search, Eye, FileText, Calendar,
  DollarSign, User, CreditCard, CheckCircle, Clock, XCircle
} from 'lucide-react';

export default function SalesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    paidInvoices: 0,
    pendingInvoices: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    loadSales();
  }, [router]);

  useEffect(() => {
    filterSales();
  }, [sales, searchTerm, statusFilter, dateFilter]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (data.success) {
        const salesData = data.data || [];
        setSales(salesData);

        // Calculate stats
        const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const paidInvoices = salesData.filter(sale => sale.paymentStatus === 'paid').length;
        const pendingInvoices = salesData.filter(sale => sale.paymentStatus === 'unpaid' || sale.paymentStatus === 'partial').length;

        setStats({
          totalSales: salesData.length,
          totalRevenue,
          paidInvoices,
          pendingInvoices
        });
      }
    } catch (error) {
      console.error('خطأ في جلب المبيعات:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSales = () => {
    let filtered = sales;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.paymentStatus === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        const saleDay = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());

        switch (dateFilter) {
          case 'today':
            return saleDay.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return saleDay >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return saleDay >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredSales(filtered);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          مدفوع
        </span>;
      case 'partial':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          جزئي
        </span>;
      case 'unpaid':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          غير مدفوع
        </span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">غير محدد</span>;
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-white rounded-xl shadow-md p-4 border-r-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color.replace('border', 'bg').replace('600', '100')}`}>
          <Icon className={`w-4 h-4 ${color.replace('border', 'text')}`} />
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-800">{value}</div>
        </div>
      </div>
      <div className="text-gray-600 font-medium text-sm">{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المبيعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/30 rounded-xl shadow-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">إدارة المبيعات</h1>
                <p className="text-sm text-gray-600">عرض وإدارة جميع المبيعات والفواتير</p>
              </div>
            </div>
            <Link href="/dashboard/sales/create">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
                <Plus className="w-4 h-4" />
                بيع جديد
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard
            icon={ShoppingCart}
            label="إجمالي المبيعات"
            value={stats.totalSales}
            color="border-blue-600"
          />
          <StatCard
            icon={DollarSign}
            label="إجمالي الإيرادات"
            value={`${stats.totalRevenue.toLocaleString()} ج`}
            color="border-green-600"
          />
          <StatCard
            icon={CheckCircle}
            label="الفواتير المدفوعة"
            value={stats.paidInvoices}
            color="border-green-600"
          />
          <StatCard
            icon={Clock}
            label="الفواتير المعلقة"
            value={stats.pendingInvoices}
            color="border-orange-600"
          />
        </div>

        {/* Filters */}
        <div className="bg-white/30 rounded-xl shadow-md p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في المبيعات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="all">جميع الحالات</option>
              <option value="paid">مدفوع</option>
              <option value="partial">مدفوع جزئياً</option>
              <option value="unpaid">غير مدفوع</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="all">جميع التواريخ</option>
              <option value="today">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              مسح المرشحات
            </button>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white/30 rounded-xl shadow-md overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">قائمة المبيعات ({filteredSales.length})</h3>
          </div>

          {filteredSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">رقم الفاتورة</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">العميل</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">التاريخ</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">الإجمالي</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">الحالة</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {sale.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {sale.customer?.name || 'عميل محذوف'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(sale.saleDate).toLocaleDateString('ar-EG')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">
                        {(sale.total || 0).toLocaleString()} جنيه
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(sale.paymentStatus)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/sales/${sale._id}`}>
                            <button className="p-1 text-indigo-600 hover:bg-indigo-100 rounded transition">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link href={`/dashboard/invoices/${sale.invoiceId || sale._id}/print`}>
                            <button className="p-1 text-green-600 hover:bg-green-100 rounded transition">
                              <FileText className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد مبيعات</h3>
              <p className="text-gray-500 mb-4">لم يتم العثور على مبيعات تطابق معايير البحث</p>
              <Link href="/dashboard/sales/create">
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                  إنشاء بيع جديد
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}