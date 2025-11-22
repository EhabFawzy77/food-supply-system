'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, FileText, Eye, Trash2, Download, Printer, Search,
  Calendar, Filter, MoreVertical, AlertCircle, CheckCircle,
  Clock, XCircle, TrendingUp
} from 'lucide-react';

export default function InvoicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        // Week starts on Saturday, ends on Friday
        const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const daysToSaturday = (dayOfWeek + 1) % 7; // Days back to Saturday
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - daysToSaturday);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6); // Friday
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
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [currentPage, filterStatus, searchTerm, filterPeriod, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching invoices data...');

      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('❌ No auth token found');
        router.push('/login');
        return;
      }

      // Fetch invoices
      const dateRange = getDateRange(filterPeriod);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filterStatus !== 'all' && { paymentStatus: filterStatus }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      });

      console.log('📡 Request params:', params.toString());
      console.log('🔑 Using token:', token.substring(0, 20) + '...');

      const invoicesRes = await fetch(`/api/invoices?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Invoices response status:', invoicesRes.status);

      if (invoicesRes.status === 401) {
        console.error('❌ Unauthorized - redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        router.push('/login');
        return;
      }

      const invoicesData = await invoicesRes.json();
      console.log('📦 Invoices data:', invoicesData);

      if (invoicesData.success) {
        setInvoices(invoicesData.data || []);
        if (invoicesData.pagination) {
          setTotalPages(invoicesData.pagination.pages || 1);
        }
        console.log('✅ Loaded', (invoicesData.data || []).length, 'invoices');
      } else {
        console.error('❌ Invoice fetch failed:', invoicesData.error);
        if (invoicesData.error === 'غير مصرح' || invoicesData.error === 'Unauthorized') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          router.push('/login');
          return;
        }
        setInvoices([]);
      }

      // Fetch stats
      const statsRes = await fetch('/api/invoices/stats?period=month', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('📊 Stats data:', statsData);

        if (statsData.success) {
          setStats(statsData.data);
        }
      }
    } catch (error) {
      console.error('💥 Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm('هل تريد حذف هذه الفاتورة؟')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        setInvoices(invoices.filter(inv => inv._id !== invoiceId));
      } else {
        console.error('خطأ في حذف الفاتورة');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('❌ حدث خطأ في حذف الفاتورة');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-EG');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'مدفوع' },
      partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'جزئي' },
      unpaid: { bg: 'bg-red-100', text: 'text-red-800', label: 'غير مدفوع' },
      overdue: { bg: 'bg-red-200', text: 'text-red-900', label: 'متأخر' }
    };

    const config = statusConfig[status] || statusConfig.unpaid;

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-white rounded-lg shadow-lg p-3 border-r-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1 rounded-lg ${color.replace('border', 'bg').replace('600', '100')}`}>
          <Icon className={`w-4 h-4 ${color.replace('border', 'text')}`} />
        </div>
      </div>
      <div className="text-lg font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-gray-600 font-semibold text-xs">{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/20 p-8 text-center animate-fadeIn">
            <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">جاري تحميل الفواتير...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl border border-white/20 p-6 mb-8 animate-fadeIn">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  إدارة الفواتير
                </h1>
                <p className="text-gray-600 mt-1">إدارة شاملة لفواتير المبيعات</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الفواتير..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white"
                />
              </div>

              <div className="relative">
                <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white appearance-none"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="paid">مدفوع</option>
                  <option value="partial">جزئي</option>
                  <option value="unpaid">غير مدفوع</option>
                  <option value="overdue">متأخر</option>
                </select>
              </div>

              <div className="relative">
                <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterPeriod}
                  onChange={(e) => {
                    setFilterPeriod(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white appearance-none"
                >
                  <option value="all">جميع الفترات</option>
                  <option value="today">اليوم</option>
                  <option value="yesterday">أمس</option>
                  <option value="week">الأسبوع</option>
                  <option value="month">الشهر</option>
                  <option value="year">السنة</option>
                </select>
              </div>

              <button
                onClick={() => fetchData()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                تحديث البيانات
              </button>

              <Link href="/dashboard/sales/create">
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <Plus className="w-5 h-5" />
                  فاتورة جديدة
                </button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-4 border border-blue-200/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats.totalInvoices || 0}</span>
                </div>
                <div className="text-xs font-semibold text-gray-700">إجمالي الفواتير</div>
              </div>

              <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl p-4 border border-green-200/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-green-600">{formatPrice(stats.totalAmount || 0)}</span>
                </div>
                <div className="text-xs font-semibold text-gray-700">إجمالي المبيعات</div>
              </div>

              <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-2xl p-4 border border-emerald-200/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">{stats.paidCount || 0}</span>
                </div>
                <div className="text-xs font-semibold text-gray-700">الفواتير المدفوعة</div>
              </div>

              <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl p-4 border border-orange-200/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-orange-600">{stats.unpaidCount || 0}</span>
                </div>
                <div className="text-xs font-semibold text-gray-700">في الانتظار</div>
              </div>
            </div>
          )}
        </div>


        {/* Invoices Table */}
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-fadeIn">
          {invoices.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد فواتير</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all'
                  ? 'حاول تغيير معايير البحث أو الفلترة'
                  : 'ابدأ بإنشاء فاتورة جديدة لبدء إدارة مبيعاتك'
                }
              </p>
              <Link href="/dashboard/sales/create">
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  إنشاء فاتورة جديدة
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">رقم الفاتورة</th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">العميل</th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">التاريخ</th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">المبلغ</th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">الحالة</th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice, index) => (
                    <tr key={invoice._id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                          {invoice.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          {invoice.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-medium">
                          {formatDate(invoice.invoiceDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-green-600">
                          {formatPrice(invoice.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(invoice.paymentStatus)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/invoices/${invoice._id}`}>
                            <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:scale-110" title="عرض">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link href={`/dashboard/invoices/${invoice._id}/print`}>
                            <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-200 hover:scale-110" title="طباعة">
                              <Printer className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(invoice._id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 hover:scale-110"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && invoices.length > 0 && (
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/20 p-6 mt-8 animate-fadeIn">
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold"
              >
                السابق
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 font-semibold ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold"
              >
                التالي
              </button>
            </div>
          </div>
        )}
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