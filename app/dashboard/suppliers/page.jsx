'use client';
import { useState, useEffect } from 'react';
import {
  Truck, Plus, Edit, Trash2, Phone, MapPin,
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
    address: ''
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
      } else {
        console.error('خطأ في تسجيل الدفعة:', data.error || data.message || 'فشل تسجيل الدفعة');
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدفعة:', error);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
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
      address: ''
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stats */}
        <div className="backdrop-blur-xl bg-white/30 rounded-2xl shadow-2xl border border-white/20 p-6 mb-8 animate-fadeIn">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  إدارة الموردين
                </h1>
                <p className="text-gray-600 mt-1">إدارة شاملة لموردي الشركة</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الموردين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                إضافة مورد جديد
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl p-3 border border-purple-200/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-purple-600">{suppliers.length}</span>
              </div>
              <div className="text-sm font-semibold text-gray-700">إجمالي الموردين</div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl p-3 border border-orange-200/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-orange-600">{suppliersWithDebt}</span>
              </div>
              <div className="text-sm font-semibold text-gray-700">موردين لديهم مستحقات</div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl p-3 border border-red-200/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-red-600">{totalDebt.toLocaleString()}</span>
              </div>
              <div className="text-sm font-semibold text-gray-700">إجمالي المستحقات (جنيه)</div>
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSuppliers.map((supplier, index) => (
            <div
              key={supplier._id}
              className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/20 p-4 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{supplier.name}</h3>
                    <p className="text-sm text-gray-600">مورد</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">{supplier.address}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">إجمالي المشتريات:</span>
                  <span className="font-semibold text-green-600">
                    {supplier.totalPurchases ? supplier.totalPurchases.toLocaleString() : '0'} جنيه
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">المستحقات:</span>
                  <span className={`font-semibold ${
                    supplier.currentDebt > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {supplier.currentDebt.toLocaleString()} جنيه
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">آخر مشتريات:</span>
                  <span className="font-semibold text-gray-700">
                    {supplier.lastPurchase ? new Date(supplier.lastPurchase).toLocaleDateString('ar-EG') : 'غير محدد'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-sm flex items-center justify-center gap-2"
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
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    دفع
                  </button>
                )}
                <button
                  onClick={() => handleDelete(supplier._id)}
                  className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
                  </h2>
                  <button
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="أدخل اسم المورد"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>



                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2">العنوان</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="أدخل العنوان"
                    />
                  </div>

                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    {editingSupplier ? 'تحديث المورد' : 'إضافة المورد'}
                  </button>
                  <button
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

         {/* Payment Modal */}
         {showPaymentModal && selectedSupplier && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
             <div className="backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-4 animate-scaleIn">
               <div className="p-6">
                 <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                   تسجيل دفعة للمورد
                 </h2>

                 <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                   <div className="flex justify-between items-center mb-3">
                     <span className="text-gray-600 font-medium">المورد:</span>
                     <span className="font-semibold text-gray-800">{selectedSupplier.name}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 font-medium">المستحقات:</span>
                     <span className="font-bold text-red-600 text-lg">
                       {selectedSupplier.currentDebt.toLocaleString()} جنيه
                     </span>
                   </div>
                 </div>

                 <div className="mb-6">
                   <label className="block text-gray-700 font-semibold mb-3">المبلغ المدفوع</label>
                   <input
                     type="number"
                     value={paymentAmount}
                     onChange={(e) => setPaymentAmount(e.target.value)}
                     max={selectedSupplier.currentDebt}
                     className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm text-lg font-semibold text-center"
                     placeholder="0"
                   />
                 </div>

                 <div className="flex gap-4">
                   <button
                     onClick={handlePayment}
                     disabled={!paymentAmount || parseFloat(paymentAmount) > selectedSupplier.currentDebt}
                     className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     تأكيد الدفع
                   </button>
                   <button
                     onClick={() => { setShowPaymentModal(false); setPaymentAmount(''); }}
                     className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                   >
                     إلغاء
                   </button>
                 </div>
               </div>
             </div>
           </div>
         )}
 
         {filteredSuppliers.length === 0 && (
           <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/20 p-12 text-center animate-fadeIn">
             <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
               <Truck className="w-10 h-10 text-gray-400" />
             </div>
             <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد موردين</h3>
             <p className="text-gray-500">ابدأ بإضافة موردين جدد لإدارة مشترياتك</p>
           </div>
         )}
 
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
 
           @keyframes scaleIn {
             from {
               opacity: 0;
               transform: scale(0.9);
             }
             to {
               opacity: 1;
               transform: scale(1);
             }
           }
 
           .animate-fadeIn {
             animation: fadeIn 0.6s ease-out forwards;
           }
 
           .animate-scaleIn {
             animation: scaleIn 0.3s ease-out forwards;
           }
         `}</style>
       </div>
     </div>
   );
 }