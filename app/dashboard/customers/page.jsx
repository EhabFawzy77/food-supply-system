"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Users, Plus, Edit, Trash2, Phone, MapPin, CreditCard, 
  TrendingUp, AlertCircle, Search, X, DollarSign
} from 'lucide-react';


export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const filter = searchParams.get('filter');

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    address: '',
    taxNumber: '',
    creditLimit: '',
    customerType: 'retail'
  });

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('خطأ في جلب العملاء:', error);
      setCustomers([]);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSubmit = async () => {
    const url = editingCustomer 
      ? `/api/customers/${editingCustomer._id}`
      : '/api/customers';
    
    const method = editingCustomer ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        // تحديث القائمة من API
        await loadCustomers();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('خطأ في حفظ العميل:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedCustomer || !paymentAmount) return;

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sale',
          amount: parseFloat(paymentAmount),
          customerId: selectedCustomer._id,
          paymentMethod: 'cash',
          receivedFrom: selectedCustomer.name,
          notes: `دفعة من العميل: ${selectedCustomer.name}`,
          transactionDate: new Date().toISOString()
        })
      });

      // Parse response defensively
      let data = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try { data = JSON.parse(text); } catch (e) { data = { success: res.ok, message: text }; }
      }

      if (data && data.success) {
        // تحديث الديون محلياً
        setCustomers(customers.map(c => 
          c._id === selectedCustomer._id 
            ? { ...c, currentDebt: Math.max(0, (Number(c.currentDebt) || 0) - parseFloat(paymentAmount)) }
            : c
        ));
        setSelectedCustomer({
          ...selectedCustomer,
          currentDebt: Math.max(0, (Number(selectedCustomer.currentDebt) || 0) - parseFloat(paymentAmount))
        });
        setShowPaymentModal(false);
        setPaymentAmount('');
      } else {
        console.error('خطأ في تسجيل الدفعة:', data && (data.error || data.message) ? (data.error || data.message) : 'فشل تسجيل الدفعة');
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدفعة:', error);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      businessName: customer.businessName,
      phone: customer.phone,
      address: customer.address,
      taxNumber: customer.taxNumber,
      creditLimit: customer.creditLimit,
      customerType: customer.customerType
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Reload من API بدلاً من التحديث اليدوي
        await loadCustomers();
      }
    } catch (error) {
      console.error('خطأ في حذف العميل:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      businessName: '',
      phone: '',
      address: '',
      taxNumber: '',
      creditLimit: '',
      customerType: 'retail'
    });
    setEditingCustomer(null);
  };

  let filtered = customers;
  if (filter === 'debt') {
    filtered = customers.filter(c => (Number(c.currentDebt) || 0) > 0);
  }
  const filteredCustomers = filtered.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  const totalDebt = customers.reduce((sum, c) => sum + (Number(c.currentDebt) || 0), 0);
  const totalCreditLimit = customers.reduce((sum, c) => sum + (Number(c.creditLimit) || 0), 0);
  const customersWithDebt = customers.filter(c => (Number(c.currentDebt) || 0) > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stats */}
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl border border-white/20 p-6 mb-8 animate-fadeIn">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  إدارة العملاء
                </h1>
                <p className="text-gray-600 mt-1">إدارة شاملة لعملاء الشركة</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في العملاء..."
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
                إضافة عميل جديد
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={() => router.push('/dashboard/customers')}
              className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-200/20 cursor-pointer hover:bg-blue-500/20 transition-all duration-300 hover:shadow-xl transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-blue-600">{customers.length}</span>
              </div>
              <div className="text-sm font-semibold text-gray-700">إجمالي العملاء</div>
            </div>

            <div
              onClick={() => router.push('/dashboard/customers?filter=debt')}
              className="backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl p-6 border border-red-200/20 cursor-pointer hover:bg-red-500/20 transition-all duration-300 hover:shadow-xl transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-red-600">{customersWithDebt}</span>
              </div>
              <div className="text-sm font-semibold text-gray-700">عملاء لديهم ديون</div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl p-6 border border-orange-200/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-orange-600">{totalDebt.toLocaleString()}</span>
              </div>
              <div className="text-sm font-semibold text-gray-700">إجمالي الديون (جنيه)</div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl p-6 border border-green-200/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-green-600">{totalCreditLimit.toLocaleString()}</span>
              </div>
              <div className="text-sm font-semibold text-gray-700">حد الائتمان الكلي</div>
            </div>
          </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer._id}
              className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.businessName}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  customer.customerType === 'wholesale'
                    ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700'
                    : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700'
                }`}>
                  {customer.customerType === 'wholesale' ? 'جملة' : 'قطاعي'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">{customer.address}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">إجمالي المشتريات:</span>
                  <span className="font-semibold text-green-600">
                    {(Number(customer.totalLifetimePurchases) || 0).toLocaleString()} جنيه
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">حد الائتمان:</span>
                  <span className="font-semibold text-blue-600">
                    {(Number(customer.creditLimit) || 0).toLocaleString()} جنيه
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">الديون الحالية:</span>
                  <span className={`font-semibold ${
                    (Number(customer.currentDebt) || 0) > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {(Number(customer.currentDebt) || 0).toLocaleString()} جنيه
                  </span>
                </div>
              </div>

              {(Number(customer.currentDebt) || 0) > 0 && (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>الائتمان المستخدم</span>
                      <span className="font-semibold">{
                        customer.creditLimit && Number(customer.creditLimit) > 0
                          ? (((Number(customer.currentDebt) || 0) / Number(customer.creditLimit)) * 100).toFixed(0)
                          : '0'
                      }%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          ((Number(customer.currentDebt) || 0) / (Number(customer.creditLimit) || 1)) > 0.8
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : 'bg-gradient-to-r from-orange-500 to-orange-600'
                        }`}
                        style={{ width: `${((Number(customer.currentDebt) || 0) / (Number(customer.creditLimit) || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(customer)}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  تعديل
                </button>
                {customer.currentDebt > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setPaymentAmount(''); // مسح المبلغ السابق
                      setShowPaymentModal(true);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    دفع
                  </button>
                )}
                <button
                  onClick={() => handleDelete(customer._id)}
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
                    {editingCustomer ? 'تعديل العميل' : 'إضافة عميل جديد'}
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
                    <label className="block text-gray-700 font-semibold mb-2">الاسم</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="أدخل اسم العميل"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">اسم النشاط</label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="أدخل اسم النشاط"
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

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">نوع العميل</label>
                    <select
                      value={formData.customerType}
                      onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="retail">قطاعي</option>
                      <option value="wholesale">جملة</option>
                    </select>
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

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">الرقم الضريبي</label>
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="أدخل الرقم الضريبي"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">حد الائتمان (جنيه)</label>
                    <input
                      type="number"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    {editingCustomer ? 'تحديث العميل' : 'إضافة العميل'}
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
        {showPaymentModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-4 animate-scaleIn">
              <div className="p-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                  تسجيل دفعة
                </h2>

                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">العميل:</span>
                    <span className="font-semibold text-gray-800">{selectedCustomer.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">الدين الحالي:</span>
                    <span className="font-bold text-red-600 text-lg">
                      {selectedCustomer.currentDebt.toLocaleString()} جنيه
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-3">المبلغ المدفوع</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      // السماح بأي رقم، التحقق سيتم في الزر
                      setPaymentAmount(value);
                    }}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm text-lg font-semibold text-center"
                    placeholder="0"
                  />
                  {paymentAmount && parseFloat(paymentAmount) > selectedCustomer.currentDebt && (
                    <p className="text-red-500 text-sm mt-2 text-center">
                      المبلغ المدخل أكبر من الدين الحالي ({selectedCustomer.currentDebt} جنيه)
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handlePayment}
                    disabled={!paymentAmount || parseFloat(paymentAmount) > selectedCustomer.currentDebt}
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

        {filteredCustomers.length === 0 && (
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/20 p-12 text-center animate-fadeIn">
            <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد عملاء</h3>
            <p className="text-gray-500">ابدأ بإضافة عملاء جدد لإدارة مبيعاتك</p>
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
  );
}