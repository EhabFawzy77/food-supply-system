'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, ShoppingBag, Truck, Calendar, DollarSign, Package, FileText, X, CheckCircle, Clock, XCircle, Search } from 'lucide-react';

export default function PurchasesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'unpaid',
    paidAmount: 0,
    items: [{ product: '', productName: '', quantity: '', unitPrice: '', total: '' }],
    tax: 0,
    subtotal: 0,
    total: 0,
    notes: ''
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchAllData();
  }, [router, filterPeriod]);

  // حساب الإجماليات
  const calculateTotals = (items, tax = 0) => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.total || 0);
      return sum + itemTotal;
    }, 0);
    
    const total = subtotal + tax;
    return { subtotal, total };
  };

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

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        router.push('/login');
        return;
      }

      const dateRange = getDateRange(filterPeriod);
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const [purchasesRes, suppliersRes, productsRes] = await Promise.all([
        fetch(`/api/purchases?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/suppliers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const purchasesData = await purchasesRes.json();
      const suppliersData = await suppliersRes.json();
      const productsData = await productsRes.json();

      // التحقق من أخطاء المصادقة والجلسة المنتهية
      if (purchasesRes.status === 401 || purchasesData.statusCode === 401 || purchasesData.code === 'TOKEN_EXPIRED') {
        console.warn('Token expired, redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
        return;
      }

      if (purchasesData.success) setPurchases(purchasesData.data || []);
      if (suppliersData.success) setSuppliers(suppliersData.data || []);
      if (productsData.success) setProducts(productsData.data || []);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.supplier || formData.items.some(i => !i.product || !i.quantity || !i.unitPrice)) {
      alert('أكمل جميع البيانات المطلوبة (المورد، المنتج، الكمية، السعر)');
      return;
    }

    // التحقق من وجود التوكن
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('جلسة انتهت الرجاء تسجيل الدخول مجددا');
      router.push('/login');
      return;
    }

    // إنشاء رقم الفاتورة إذا لم يكن موجوداً
    let invoiceNumber = formData.invoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = `PUR-${Date.now()}`;
    }

    // حساب إجمالي كل منتج
    const items = formData.items.map(item => ({
      ...item,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      total: parseFloat(item.quantity) * parseFloat(item.unitPrice)
    }));

    // حساب الإجماليات
    const { subtotal, total } = calculateTotals(items, 0);

    const url = editingPurchase ? `/api/purchases/${editingPurchase._id}` : '/api/purchases';
    const method = editingPurchase ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          invoiceNumber,
          items,
          subtotal,
          total,
          tax: 0
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        fetchAllData();
        resetForm();
        setShowModal(false);
      } else {
        console.error('خطأ في حفظ المشتريات:', data.error);
        
        // التحقق من أخطاء المصادقة والجلسة المنتهية
        if (data.statusCode === 401 || data.code === 'TOKEN_EXPIRED' || res.status === 401) {
          alert('انتهت صلاحية جلستك. سيتم إعادة توجيهك لصفحة تسجيل الدخول');
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          window.location.href = '/login';
        } else {
          alert(`خطأ: ${data.error || 'فشل حفظ المشتريات'}`);
        }
      }
    } catch (error) {
      console.error('خطأ في حفظ المشتريات:', error);
      alert('حدث خطأ في الاتصال');
    }
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      invoiceNumber: purchase.invoiceNumber || '',
      supplier: purchase.supplier?._id || '',
      purchaseDate: new Date(purchase.purchaseDate).toISOString().split('T')[0],
      paymentStatus: purchase.paymentStatus,
      paidAmount: purchase.paidAmount || 0,
      items: (purchase.items || []).map(item => ({
        ...item,
        productName: item.product?.name || ''
      })),
      tax: purchase.tax || 0,
      subtotal: purchase.subtotal || 0,
      total: purchase.total || 0,
      notes: purchase.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/purchases/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();

      if (data.success) {
        fetchAllData();
      }
    } catch (error) {
      console.error('خطأ في حذف المشتريات:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      supplier: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'unpaid',
      paidAmount: 0,
      items: [{ product: '', productName: '', quantity: '', unitPrice: '', total: '' }],
      tax: 0,
      subtotal: 0,
      total: 0,
      notes: ''
    });
    setEditingPurchase(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          مدفوعة
        </span>;
      case 'partial':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          جزئية
        </span>;
      case 'unpaid':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          غير مدفوعة
        </span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">غير محدد</span>;
    }
  };

  const filteredPurchases = purchases.filter(p =>
    p.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const paginatedPurchases = filteredPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">جاري تحميل المشتريات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  إدارة المشتريات
                </h1>
                <p className="text-gray-600 mt-2">إضافة وإدارة الطلبات من الموردين</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 bg-gray-100 rounded-lg">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="البحث في المشتريات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm"
                />
              </div>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm font-medium"
              >
                <option value="all">جميع الفترات</option>
                <option value="today">اليوم</option>
                <option value="yesterday">أمس</option>
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
                <option value="year">هذا العام</option>
              </select>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                طلب شراء جديد
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">{purchases.length}</div>
                <div className="text-xs text-gray-500">قطعة</div>
              </div>
            </div>
            <div className="text-gray-600 font-semibold text-sm">إجمالي المشتريات</div>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-3 opacity-20"></div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">{purchases.filter(p => p.paymentStatus === 'paid').length}</div>
                <div className="text-xs text-gray-500">مدفوعة</div>
              </div>
            </div>
            <div className="text-gray-600 font-semibold text-sm">المشتريات المدفوعة</div>
            <div className="w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mt-3 opacity-20"></div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">{purchases.filter(p => p.paymentStatus === 'unpaid').length}</div>
                <div className="text-xs text-gray-500">قيد الانتظار</div>
              </div>
            </div>
            <div className="text-gray-600 font-semibold text-sm">قيد الانتظار</div>
            <div className="w-full h-1 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full mt-3 opacity-20"></div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">{suppliers.length}</div>
                <div className="text-xs text-gray-500">مورد</div>
              </div>
            </div>
            <div className="text-gray-600 font-semibold text-sm">إجمالي الموردين</div>
            <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-3 opacity-20"></div>
          </div>
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">المورد</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">التاريخ</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الكمية</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">المبلغ</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPurchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/purchases/${purchase._id}`} className="contents">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold text-sm">{purchase.supplier?.name || 'غير معروف'}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/purchases/${purchase._id}`} className="contents">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-indigo-600" />
                          <span className="font-semibold text-sm">{purchase.invoiceNumber || 'غير محدد'}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/purchases/${purchase._id}`} className="contents">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span className="text-sm">{new Date(purchase.purchaseDate).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/purchases/${purchase._id}`} className="contents">
                        <span className="text-sm">{purchase.items?.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0) || 0}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/purchases/${purchase._id}`} className="contents">
                        <div className="flex items-center gap-1 font-semibold text-green-600 text-sm">
                          <DollarSign className="w-3 h-3" />
                          {(purchase.total || 0).toLocaleString()}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/purchases/${purchase._id}`} className="contents">
                        {getStatusBadge(purchase.paymentStatus)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(purchase)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(purchase._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPurchases.length === 0 && (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">لا توجد مشتريات</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>

                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-xs font-medium border rounded ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>

              <div className="text-xs text-gray-700">
                صفحة {currentPage} من {totalPages}
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-screen overflow-y-auto">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-xl">
                <h2 className="text-xl font-bold">
                  {editingPurchase ? 'تعديل المشتريات' : 'إضافة مشتريات جديدة'}
                </h2>
                <p className="text-indigo-100 mt-1 text-sm">
                  {editingPurchase ? 'قم بتعديل بيانات المشتريات' : 'أدخل بيانات المشتريات الجديدة'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-3 space-y-3">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-indigo-600" />
                    معلومات أساسية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رقم الفاتورة</label>
                      <input
                        type="text"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        placeholder="سيتم توليده تلقائياً"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">المورد <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      >
                        <option value="">اختر مورد</option>
                        {suppliers.map(supplier => (
                          <option key={supplier._id} value={supplier._id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الشراء <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        required
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">حالة الدفع</label>
                      <select
                        value={formData.paymentStatus}
                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      >
                        <option value="unpaid">لم تدفع</option>
                        <option value="partial">جزئية</option>
                        <option value="paid">مدفوعة</option>
                      </select>
                    </div>

                    {formData.paymentStatus === 'partial' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ المدفوع <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.paidAmount}
                          onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          placeholder="0"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Package className="w-4 h-4 text-indigo-600" />
                      المنتجات
                    </h3>
                    <span className="text-xs text-gray-500">{formData.items.length} منتج</span>
                  </div>

                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-700">المنتج {index + 1}</span>
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = formData.items.filter((_, i) => i !== index);
                                setFormData({ ...formData, items: newItems });
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">المنتج <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={item.productName || ''}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].productName = e.target.value;
                                // Find matching product by name
                                const matchingProduct = products.find(p => p.name.toLowerCase() === e.target.value.toLowerCase());
                                if (matchingProduct) {
                                  newItems[index].product = matchingProduct._id;
                                } else {
                                  newItems[index].product = '';
                                }
                                setFormData({ ...formData, items: newItems });
                              }}
                              list={`products-list-${index}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                              placeholder="اكتب اسم المنتج"
                            />
                            <datalist id={`products-list-${index}`}>
                              {products.map(p => (
                                <option key={p._id} value={p.name} />
                              ))}
                            </datalist>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">الكمية <span className="text-red-500">*</span></label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].quantity = e.target.value;
                                setFormData({ ...formData, items: newItems });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">سعر الوحدة <span className="text-red-500">*</span></label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={item.unitPrice}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].unitPrice = e.target.value;
                                setFormData({ ...formData, items: newItems });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">الإجمالي</label>
                            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-semibold text-green-600 flex items-center">
                              {(parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)).toFixed(2)} جنيه
                            </div>
                          </div>


                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">رقم الدفعة</label>
                            <input
                              type="text"
                              value={item.batchNumber || ''}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].batchNumber = e.target.value;
                                setFormData({ ...formData, items: newItems });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                              placeholder="اختياري"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        items: [...formData.items, { product: '', productName: '', quantity: '', unitPrice: '', total: '' }]
                      });
                    }}
                    className="w-full mt-3 py-2 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center gap-2 font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة منتج آخر
                  </button>
                </div>



                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold flex items-center justify-center gap-2 shadow-lg text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {editingPurchase ? 'تحديث المشتريات' : 'إضافة المشتريات'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}