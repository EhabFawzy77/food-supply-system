'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ShoppingBag, Truck, Calendar, DollarSign, Package, FileText, X } from 'lucide-react';

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
    items: [{ product: '', productName: '', quantity: '', unitPrice: '', total: '' }],
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
    const { subtotal, total } = calculateTotals(items, 0);

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
          tax: 0
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
      items: [{ product: '', productName: '', quantity: '', unitPrice: '', total: '' }],
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
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                <h2 className="text-2xl font-bold">
                  {editingPurchase ? 'تعديل المشتريات' : 'إضافة مشتريات جديدة'}
                </h2>
                <p className="text-indigo-100 mt-1">
                  {editingPurchase ? 'قم بتعديل بيانات المشتريات' : 'أدخل بيانات المشتريات الجديدة'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-600" />
                    معلومات أساسية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Package className="w-5 h-5 text-indigo-600" />
                      المنتجات
                    </h3>
                    <span className="text-sm text-gray-500">{formData.items.length} منتج</span>
                  </div>

                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">المنتج {index + 1}</span>
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = formData.items.filter((_, i) => i !== index);
                                setFormData({ ...formData, items: newItems });
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
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
                    className="w-full mt-4 py-3 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة منتج آخر
                  </button>
                </div>



                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    {editingPurchase ? 'تحديث المشتريات' : 'إضافة المشتريات'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
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