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

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filterType, dateRange]);

  const fetchPayments = async () => {
    // محاكاة جلب المدفوعات
    setPayments([
      {
        _id: '1',
        type: 'sale',
        amount: 5000,
        paymentMethod: 'cash',
        referenceNumber: 'INV-001',
        receivedFrom: 'محل الأمل',
        transactionDate: '2024-11-09T10:30:00',
        createdBy: 'أحمد محمود'
      },
      {
        _id: '2',
        type: 'sale',
        amount: 3500,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'INV-002',
        receivedFrom: 'سوبر ماركت النور',
        transactionDate: '2024-11-09T11:15:00',
        createdBy: 'محمد علي'
      },
      {
        _id: '3',
        type: 'purchase',
        amount: 15000,
        paymentMethod: 'cash',
        referenceNumber: 'PUR-001',
        paidTo: 'شركة النيل للتوريدات',
        transactionDate: '2024-11-09T14:20:00',
        createdBy: 'أحمد محمود'
      },
      {
        _id: '4',
        type: 'sale',
        amount: 2000,
        paymentMethod: 'check',
        referenceNumber: 'INV-003',
        receivedFrom: 'مطعم الفردوس',
        checkNumber: 'CHK-12345',
        transactionDate: '2024-11-08T16:45:00',
        createdBy: 'محمد علي'
      }
    ]);
  };

  const fetchStats = async () => {
    // محاكاة جلب الإحصائيات
    setStats({
      totalReceived: 45230,
      totalPaid: 28500,
      pendingReceivables: 8230,
      pendingPayables: 5000
    });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesType = filterType === 'all' || payment.type === filterType;
    const matchesSearch = 
      payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.receivedFrom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.paidTo?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesType && matchesSearch;
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
    <div className={`bg-white rounded-lg shadow-lg p-6 border-r-4 ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${color.replace('border', 'bg').replace('600', '100')}`}>
          <Icon className={`w-6 h-6 ${color.replace('border', 'text')}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">
        {value.toLocaleString()} جنيه
      </div>
      <div className="text-gray-600 font-semibold">{label}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={TrendingUp}
            label="إجمالي المقبوضات"
            value={stats.totalReceived}
            color="border-green-600"
            trend={12.5}
            sublabel="هذا الشهر"
          />
          <StatCard
            icon={TrendingDown}
            label="إجمالي المدفوعات"
            value={stats.totalPaid}
            color="border-red-600"
            trend={-8.3}
            sublabel="هذا الشهر"
          />
          <StatCard
            icon={Clock}
            label="مستحقات معلقة"
            value={stats.pendingReceivables}
            color="border-orange-600"
            sublabel="من العملاء"
          />
          <StatCard
            icon={DollarSign}
            label="التزامات معلقة"
            value={stats.pendingPayables}
            color="border-purple-600"
            sublabel="للموردين"
          />
        </div>

        {/* Net Cash Flow */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold mb-2 opacity-90">صافي التدفق النقدي</div>
              <div className="text-4xl font-bold">
                {(stats.totalReceived - stats.totalPaid).toLocaleString()} جنيه
              </div>
              <div className="text-sm mt-2 opacity-80">
                {stats.totalReceived > stats.totalPaid ? 'فائض نقدي' : 'عجز نقدي'}
              </div>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">النوع</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المرجع</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">من/إلى</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المبلغ</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">طريقة الدفع</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المسؤول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
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
                      <div className="font-semibold text-gray-800">
                        {payment.receivedFrom || payment.paidTo}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-lg font-bold ${
                        payment.type === 'sale' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {payment.type === 'sale' ? '+' : '-'} {payment.amount.toLocaleString()} جنيه
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
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{payment.createdBy}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد مدفوعات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}