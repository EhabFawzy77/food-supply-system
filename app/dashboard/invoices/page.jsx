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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [currentPage, filterStatus, searchTerm, router]);

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
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filterStatus !== 'all' && { paymentStatus: filterStatus }),
        ...(searchTerm && { search: searchTerm })
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
        alert('✅ تم حذف الفاتورة بنجاح');
      } else {
        alert('❌ حدث خطأ في حذف الفاتورة');
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
      <div className="min-h-screen bg-gray-100" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="inline-block animate-spin">
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
              <p className="mt-4 text-gray-600">جاري التحميل...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-gray-800">الفواتير</h1>
            <Link href="/dashboard/sales/create">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                <Plus className="w-5 h-5" />
                فاتورة جديدة
              </button>
            </Link>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                icon={FileText}
                label="إجمالي الفواتير"
                value={stats.totalInvoices || 0}
                color="border-blue-600"
              />
              <StatCard
                icon={TrendingUp}
                label="إجمالي المبيعات"
                value={formatPrice(stats.totalAmount || 0)}
                color="border-green-600"
              />
              <StatCard
                icon={CheckCircle}
                label="الفواتير المدفوعة"
                value={stats.paidCount || 0}
                color="border-emerald-600"
              />
              <StatCard
                icon={Clock}
                label="في الانتظار"
                value={stats.unpaidCount || 0}
                color="border-orange-600"
              />
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن رقم الفاتورة أو اسم العميل..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="relative">
              <Filter className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="paid">مدفوع</option>
                <option value="partial">جزئي</option>
                <option value="unpaid">غير مدفوع</option>
                <option value="overdue">متأخر</option>
              </select>
            </div>

            <button
              onClick={() => fetchData()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              تحديث
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">لا توجد فواتير</p>
              <p className="text-gray-500 text-sm">
                {searchTerm || filterStatus !== 'all' 
                  ? 'حاول تغيير معايير البحث أو الفلترة'
                  : 'ابدأ بإنشاء فاتورة جديدة'
                }
              </p>
              <Link href="/dashboard/sales/create">
                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                  إنشاء فاتورة
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-2 text-right font-semibold text-gray-800">رقم الفاتورة</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-800">العميل</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-800">التاريخ</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-800">المبلغ</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-800">الحالة</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-800">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-800">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{invoice.customerName}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDate(invoice.invoiceDate)}</td>
                      <td className="px-4 py-3 text-gray-700">{formatPrice(invoice.total)}</td>
                      <td className="px-4 py-3">{getStatusBadge(invoice.paymentStatus)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/invoices/${invoice._id}`}>
                            <button className="p-2 hover:bg-blue-100 rounded-lg transition" title="عرض">
                              <Eye className="w-5 h-5 text-blue-600" />
                            </button>
                          </Link>
                          <Link href={`/dashboard/invoices/${invoice._id}/print`}>
                            <button className="p-2 hover:bg-green-100 rounded-lg transition" title="طباعة">
                              <Printer className="w-5 h-5 text-green-600" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(invoice._id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition"
                            title="حذف"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
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
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
            >
              السابق
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 border rounded-lg transition ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}