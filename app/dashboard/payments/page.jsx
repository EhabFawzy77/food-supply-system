'use client';
import { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, TrendingUp, TrendingDown, Calendar,
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
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filterType, dateRange]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const res = await fetch(`/api/payments?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setPayments(data.data || []);
      }
    } catch (error) {
      console.error('خطأ في جلب المدفوعات:', error);
      alert('حدث خطأ في جلب البيانات');
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
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">إدارة المدفوعات</h1>
                <p className="text-gray-600 text-sm">تتبع جميع المدفوعات الواردة والصادرة</p>
              </div>
            </div>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
              <Download className="w-5 h-5" />
              تصدير التقرير
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={TrendingUp}
            label="إجمالي المقبوضات"
            value={stats.received || 0}
            color="border-green-600"
            sublabel="هذا الشهر"
          />
          <StatCard
            icon={TrendingDown}
            label="إجمالي المدفوعات"
            value={stats.paid || 0}
            color="border-red-600"
            sublabel="هذا الشهر"
          />
          <StatCard
            icon={Clock}
            label="مستحقات معلقة"
            value={stats.pendingReceivables || 0}
            color="border-orange-600"
            sublabel="من العملاء"
          />
          <StatCard
            icon={DollarSign}
            label="التزامات معلقة"
            value={stats.pendingPayables || 0}
            color="border-purple-600"
            sublabel="للموردين"
          />
        </div>


        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث برقم الفاتورة أو الاسم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                  filterType === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterType('sale')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                  filterType === 'sale'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                مقبوضات
              </button>
              <button
                onClick={() => setFilterType('purchase')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                  filterType === 'purchase'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                مدفوعات
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-right text-sm font-bold text-gray-700">النوع</th>
                  <th className="px-4 py-2 text-right text-sm font-bold text-gray-700">المرجع</th>
                  <th className="px-4 py-2 text-right text-sm font-bold text-gray-700">رقم الفاتورة</th>
                  <th className="px-4 py-2 text-right text-sm font-bold text-gray-700">من/إلى</th>
                  <th className="px-4 py-2 text-right text-sm font-bold text-gray-700">المبلغ</th>
                  <th className="px-4 py-2 text-right text-sm font-bold text-gray-700">طريقة الدفع</th>
                  <th className="px-4 py-2 text-right text-sm font-bold text-gray-700">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      {payment.type === 'sale' ? (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-600">مقبوض</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-600">مدفوع</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-semibold text-indigo-600">
                        {payment.referenceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payment.invoiceId ? (
                        <a href={`/dashboard/invoices/${payment.invoiceId}`} className="text-blue-600 underline font-bold text-sm" target="_blank" rel="noopener noreferrer">
                          {payment.invoiceNumber || payment.invoiceId}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                      {payment.paymentMethod === 'credit' && (
                        <div className="text-xs text-orange-600 mt-1">دفعة آجل مرتبطة بفاتورة</div>
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
                        <div className="text-xs text-gray-500 mt-1">
                          شيك: {payment.checkNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(payment.transactionDate).toLocaleDateString('ar-EG')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.transactionDate).toLocaleTimeString('ar-EG')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد مدفوعات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}