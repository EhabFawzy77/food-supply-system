'use client';
import { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, TrendingUp, TrendingDown,
  Search, Filter, Download, CheckCircle, XCircle, Clock
} from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalPaid: 0,
    pendingReceivables: 0,
    pendingPayables: 0
  });
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filterType, currentPage]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      params.append('page', currentPage);
      params.append('limit', 10);

      const res = await fetch(`/api/payments?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setPayments(data.data || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('خطأ في جلب المدفوعات:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      params.append('period', 'month');
      
      const res = await fetch(`/api/payments/stats?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receivedFrom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paidTo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getPaymentMethodBadge = (method) => {
    const badges = {
      cash: { label: 'كاش', color: 'bg-green-100 text-green-700' },
      bank_transfer: { label: 'تحويل بنكي', color: 'bg-blue-100 text-blue-700' },
      check: { label: 'شيك', color: 'bg-purple-100 text-purple-700' },
      credit: { label: 'آجل', color: 'bg-orange-100 text-orange-700' }
    };
    const badge = badges[method] || badges.cash;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color, trend, sublabel }) => (
    <div className={`bg-white rounded-lg shadow-lg p-3 border-r-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1 rounded-lg ${color.replace('border', 'bg').replace('600', '100')}`}>
          <Icon className={`w-4 h-4 ${color.replace('border', 'text')}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-lg font-bold text-gray-800 mb-1">
        {value.toLocaleString()} جنيه
      </div>
      <div className="text-gray-600 font-semibold text-xs">{label}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/20 p-8 text-center animate-fadeIn">
          <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">جاري تحميل المدفوعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl border border-white/20 p-6 mb-8 animate-fadeIn">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  إدارة المدفوعات
                </h1>
                <p className="text-gray-600 mt-1">تتبع جميع المدفوعات الواردة والصادرة</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث برقم الفاتورة أو الاسم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFilterType('all');
                    setCurrentPage(1);
                  }}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    filterType === 'all'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => {
                    setFilterType('sale');
                    setCurrentPage(1);
                  }}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    filterType === 'sale'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  مقبوضات
                </button>
                <button
                  onClick={() => {
                    setFilterType('purchase');
                    setCurrentPage(1);
                  }}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    filterType === 'purchase'
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  مدفوعات
                </button>
              </div>

              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Download className="w-5 h-5" />
                تصدير التقرير
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl p-6 border border-green-200/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-green-600">{(stats.received || 0).toLocaleString()}</span>
            </div>
            <div className="text-sm font-semibold text-gray-700">إجمالي المقبوضات</div>
            <div className="text-xs text-gray-500 mt-1">هذا الشهر</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl p-6 border border-red-200/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-red-600">{(stats.paid || 0).toLocaleString()}</span>
            </div>
            <div className="text-sm font-semibold text-gray-700">إجمالي المدفوعات</div>
            <div className="text-xs text-gray-500 mt-1">هذا الشهر</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl p-6 border border-orange-200/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-orange-600">{(stats.pendingReceivables || 0).toLocaleString()}</span>
            </div>
            <div className="text-sm font-semibold text-gray-700">مستحقات معلقة</div>
            <div className="text-xs text-gray-500 mt-1">من العملاء</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl p-6 border border-purple-200/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-purple-600">{(stats.pendingPayables || 0).toLocaleString()}</span>
            </div>
            <div className="text-sm font-semibold text-gray-700">التزامات معلقة</div>
            <div className="text-xs text-gray-500 mt-1">للموردين</div>
          </div>
        </div>



        {/* Payments List */}
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">النوع</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المرجع</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">رقم الفاتورة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">من/إلى</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المبلغ</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">طريقة الدفع</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment, index) => (
                  <tr key={payment._id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className="px-6 py-4">
                      {payment.type === 'sale' ? (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-green-600">مقبوض</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg">
                            <TrendingDown className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-red-600">مدفوع</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                        {payment.referenceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payment.invoiceId ? (
                        <a href={`/dashboard/invoices/${payment.invoiceId}`} className="text-blue-600 underline font-bold text-sm hover:text-blue-700 transition-colors" target="_blank" rel="noopener noreferrer">
                          {payment.invoiceNumber || payment.invoiceId}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                      {payment.paymentMethod === 'credit' && (
                        <div className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded">دفعة آجل مرتبطة بفاتورة</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {payment.receivedFrom || payment.paidTo}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-lg font-bold ${
                        payment.type === 'sale' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {payment.type === 'sale' ? '+' : '-'} {(payment.amount || 0).toLocaleString()} جنيه
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentMethodBadge(payment.paymentMethod)}
                      {payment.checkNumber && (
                        <div className="text-xs text-gray-500 mt-2 bg-gray-50 px-2 py-1 rounded">
                          شيك: {payment.checkNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 font-medium">
                        {new Date(payment.transactionDate).toLocaleDateString('ar-EG')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(payment.transactionDate).toLocaleTimeString('ar-EG')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد مدفوعات</h3>
              <p className="text-gray-500">لم يتم العثور على أي مدفوعات في الفترة المحددة</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pb-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                السابق
              </button>

              {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {totalPages > 10 && (
                <>
                  <span className="px-2 text-gray-500">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                التالي
              </button>
            </div>
          )}
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