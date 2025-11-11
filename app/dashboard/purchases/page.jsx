'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ShoppingBag, Truck, Calendar, DollarSign } from 'lucide-react';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'unpaid',
    items: [{ product: '', quantity: '', unitPrice: '', total: '' }],
    tax: 0,
    subtotal: 0,
    total: 0,
    notes: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // حساب الإجماليات
  const calculateTotals = (items, tax = 0) => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.total || 0);
      return sum + itemTotal;
    }, 0);
    
    const total = subtotal + tax;
    return { subtotal, total };
  };

  const fetchAllData = async () => {
    try {
      const [purchasesRes, suppliersRes, productsRes] = await Promise.all([
        fetch('/api/purchases'),
        fetch('/api/suppliers'),
        fetch('/api/products')
      ]);

      const purchasesData = await purchasesRes.json();
      const suppliersData = await suppliersRes.json();
      const productsData = await productsRes.json();

      if (purchasesData.success) setPurchases(purchasesData.data || []);
      if (suppliersData.success) setSuppliers(suppliersData.data || []);
      if (productsData.success) setProducts(productsData.data || []);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.supplier || formData.items.some(i => !i.product || !i.quantity || !i.unitPrice)) {
      alert('أكمل جميع البيانات المطلوبة (المورد، المنتج، الكمية، السعر)');
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
    const { subtotal, total } = calculateTotals(items, parseFloat(formData.tax || 0));

    const url = editingPurchase ? `/api/purchases/${editingPurchase._id}` : '/api/purchases';
    const method = editingPurchase ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          invoiceNumber,
          items,
          subtotal,
          total,
          tax: parseFloat(formData.tax || 0)
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        fetchAllData();
        resetForm();
        setShowModal(false);
        alert('تم بنجاح!');
      } else {
        alert('خطأ: ' + data.error);
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
      items: purchase.items || [],
      tax: purchase.tax || 0,
      subtotal: purchase.subtotal || 0,
      total: purchase.total || 0,
      notes: purchase.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه المشتريات؟')) return;
    
    try {
      const res = await fetch(`/api/purchases/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        fetchAllData();
        alert('تم الحذف بنجاح');
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
      items: [{ product: '', quantity: '', unitPrice: '', total: '' }],
      tax: 0,
      subtotal: 0,
      total: 0,
      notes: ''
    });
    setEditingPurchase(null);
  };

  const filteredPurchases = purchases.filter(p =>
    p.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">إدارة المشتريات</h1>
                <p className="text-gray-600">إضافة وإدارة الطلبات من الموردين</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              طلب شراء جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <ShoppingBag className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{purchases.length}</span>
              </div>
              <p className="text-sm">إجمالي المشتريات</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{purchases.filter(p => p.paymentStatus === 'paid').length}</span>
              </div>
              <p className="text-sm">مدفوعة</p>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{purchases.filter(p => p.paymentStatus === 'unpaid').length}</span>
              </div>
              <p className="text-sm">قيد الانتظار</p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Truck className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{suppliers.length}</span>
              </div>
              <p className="text-sm">الموردين</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <input
            type="text"
            placeholder="ابحث عن مشتريات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المورد</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الكمية</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المبلغ</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/purchases/${purchase._id}`} className="contents">
                        <div className="flex items-center gap-3">
                          <Truck className="w-5 h-5 text-indigo-600" />
                          <span className="font-semibold">{purchase.supplier?.name || 'غير معروف'}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/purchases/${purchase._id}`} className="contents">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {new Date(purchase.purchaseDate).toLocaleDateString('ar-EG')}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/purchases/${purchase._id}`} className="contents">
                        <div>{purchase.items?.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0) || 0}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/purchases/${purchase._id}`} className="contents">
                        <div className="flex items-center gap-2 font-semibold text-green-600">
                          <DollarSign className="w-4 h-4" />
                          {purchase.totalAmount?.toLocaleString() || 0}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/purchases/${purchase._id}`} className="contents">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          purchase.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                          purchase.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {purchase.paymentStatus === 'paid' ? 'مدفوعة' : purchase.paymentStatus === 'partial' ? 'جزئية' : 'لم تدفع'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(purchase)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(purchase._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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

          {filteredPurchases.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد مشتريات</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingPurchase ? 'تعديل المشتريات' : 'إضافة مشتريات جديدة'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">رقم الفاتورة</label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      placeholder="سيتم توليده تلقائياً"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">المورد *</label>
                    <select
                      required
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                    <label className="block text-gray-700 font-semibold mb-2">التاريخ *</label>
                    <input
                      type="date"
                      required
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">حالة الدفع</label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="unpaid">لم تدفع</option>
                      <option value="partial">جزئية</option>
                      <option value="paid">مدفوعة</option>
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-bold text-gray-800">المنتجات</h3>

                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-xs text-gray-600">المنتج *</label>
                        <select
                          required
                          value={item.product}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].product = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="">اختر</option>
                          {products.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">الكمية *</label>
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
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">السعر *</label>
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
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">الإجمالي</label>
                        <div className="w-full px-2 py-2 border border-gray-300 rounded text-sm bg-gray-100 flex items-center">
                          {(parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">تاريخ الانتهاء</label>
                        <input
                          type="date"
                          value={item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].expiryDate = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">رقم الدفعة</label>
                        <input
                          type="text"
                          value={item.batchNumber || ''}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].batchNumber = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        items: [...formData.items, { product: '', quantity: '', unitPrice: '', total: '' }]
                      });
                    }}
                    className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                  >
                    + إضافة منتج
                  </button>
                </div>

                {/* Totals */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mt-6">
                  <div>
                    <label className="text-sm text-gray-600">الضريبة</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.tax}
                      onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">المجموع الفرعي</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white mt-1 font-semibold">
                      {calculateTotals(formData.items, parseFloat(formData.tax || 0)).subtotal.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">المجموع النهائي</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white mt-1 font-semibold text-lg text-green-600">
                      {calculateTotals(formData.items, parseFloat(formData.tax || 0)).total.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="ملاحظات إضافية..."
                  ></textarea>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                  >
                    {editingPurchase ? 'تحديث' : 'إضافة'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
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