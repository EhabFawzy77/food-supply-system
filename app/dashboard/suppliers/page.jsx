'use client';
import { useState, useEffect } from 'react';
import { 
  Truck, Plus, Edit, Trash2, Phone, Mail, MapPin, 
  DollarSign, AlertCircle, Search, X, FileText
} from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    notes: ''
  });

  const loadSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data || []);
      }
    } catch (error) {
      console.error('خطأ في جلب الموردين:', error);
      setSuppliers([]);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSubmit = async () => {
    const url = editingSupplier 
      ? `/api/suppliers/${editingSupplier._id}`
      : '/api/suppliers';
    
    const method = editingSupplier ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        resetForm();
        // Reload suppliers من API
        await loadSuppliers();
      }
    } catch (error) {
      console.error('خطأ في حفظ المورد:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedSupplier || !paymentAmount) return;

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'purchase',
          amount: parseFloat(paymentAmount),
          supplierId: selectedSupplier._id,
          paymentMethod: 'cash',
          paidTo: selectedSupplier.name,
          notes: `دفعة للمورد: ${selectedSupplier.name}`,
          transactionDate: new Date().toISOString()
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuppliers(suppliers.map(s => 
          s._id === selectedSupplier._id 
            ? { ...s, currentDebt: Math.max(0, s.currentDebt - parseFloat(paymentAmount)) }
            : s
        ));
        setSelectedSupplier({
          ...selectedSupplier,
          currentDebt: Math.max(0, selectedSupplier.currentDebt - parseFloat(paymentAmount))
        });
        setShowPaymentModal(false);
        setPaymentAmount('');
        alert('✅ تم تسجيل الدفعة بنجاح');
      } else {
        alert(`❌ خطأ: ${data.error || data.message || 'فشل تسجيل الدفعة'}`);
      }
    } catch (error) {
      console.error('خطأ:', error);
      alert('❌ حدث خطأ في تسجيل الدفعة');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      taxNumber: supplier.taxNumber,
      notes: supplier.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Reload من API بدلاً من التحديث اليدوي
        await loadSuppliers();
      }
    } catch (error) {
      console.error('خطأ في حذف المورد:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      taxNumber: '',
      notes: ''
    });
    setEditingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDebt = suppliers.reduce((sum, s) => sum + s.currentDebt, 0);
  const suppliersWithDebt = suppliers.filter(s => s.currentDebt > 0).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stats */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">إدارة الموردين</h1>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              إضافة مورد جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Truck className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{suppliers.length}</span>
              </div>
              <div className="text-sm font-semibold">إجمالي الموردين</div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{suppliersWithDebt}</span>
              </div>
              <div className="text-sm font-semibold">موردين لديهم مستحقات</div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{totalDebt.toLocaleString()}</span>
              </div>
              <div className="text-sm font-semibold">إجمالي المستحقات (جنيه)</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن مورد (الاسم، الهاتف، البريد)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier._id} className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{supplier.name}</h3>
                    <p className="text-xs text-gray-500">مورد</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">{supplier.address}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">إجمالي المشتريات:</span>
                  <span className="font-semibold text-green-600">
                    {supplier.totalPurchases ? supplier.totalPurchases.toLocaleString() : '0'} جنيه
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المستحقات:</span>
                  <span className={`font-semibold ${
                    supplier.currentDebt > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {supplier.currentDebt.toLocaleString()} جنيه
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">آخر مشتريات:</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(supplier.lastPurchase).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-semibold text-sm flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  تعديل
                </button>
                {supplier.currentDebt > 0 && (
                  <button
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setShowPaymentModal(true);
                    }}
                    className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-semibold text-sm flex items-center justify-center gap-1"
                  >
                    <DollarSign className="w-4 h-4" />
                    دفع
                  </button>
                )}
                <button
                  onClick={() => handleDelete(supplier._id)}
                  className="py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">اسم المورد</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">الرقم الضريبي</label>
                  <input
                    type="text"
                    value={formData.taxNumber}
                    onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">العنوان</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  {editingSupplier ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">تسجيل دفعة للمورد</h2>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">المورد:</span>
                  <span className="font-semibold">{selectedSupplier.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المستحقات:</span>
                  <span className="font-bold text-red-600">
                    {selectedSupplier.currentDebt.toLocaleString()} جنيه
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">المبلغ المدفوع</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={selectedSupplier.currentDebt}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) > selectedSupplier.currentDebt}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  تأكيد الدفع
                </button>
                <button
                  onClick={() => { setShowPaymentModal(false); setPaymentAmount(''); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}