"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, Plus, Edit, Trash2, Phone, MapPin, CreditCard, 
  TrendingUp, AlertCircle, Search, X, DollarSign
} from 'lucide-react';

// مكون لجلب وعرض الفواتير الآجلة وجدول الدفعات للعميل
function AsyncCustomerInvoices({ customerId }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers/${customerId}/debts`);
        const data = await res.json();
        if (data.success) {
          setInvoices(data.data.invoices || []);
        } else {
          setInvoices([]);
        }
      } catch {
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [customerId]);

  if (loading) return <div className="text-xs text-gray-500">جاري التحميل...</div>;
  if (!invoices.length) return <div className="text-xs text-gray-500">لا توجد فواتير آجل مفتوحة</div>;

  return (
    <div className="space-y-2">
      {invoices.slice(0, 3).map(inv => (
        <div key={inv._id} className="flex flex-col gap-1 p-2 bg-white rounded border">
          <div className="flex justify-between text-xs">
            <span>فاتورة #{inv.invoiceNumber || inv._id}</span>
            <span className="font-bold text-red-600">{((inv.total || 0) - (inv.paidAmount || 0)).toLocaleString()} جنيه متبقي</span>
          </div>
          {inv.dueDate && (
            <div className="flex justify-between text-xs text-gray-600">
              <span>تاريخ الاستحقاق:</span>
              <span>{new Date(inv.dueDate).toLocaleDateString('ar-EG')}</span>
            </div>
          )}
          {inv.paymentSchedule && inv.paymentSchedule.length > 0 && (
            <div className="mt-1 text-xs">
              <span className="font-bold text-gray-700">جدول الدفعات:</span>
              <ul className="list-disc ml-4">
                {inv.paymentSchedule.map((p, idx) => (
                  <li key={idx} className={p.paid ? 'text-green-600' : 'text-orange-600'}>
                    قسط {p.installmentNumber}: {p.amount.toLocaleString()} جنيه - {p.paid ? 'مدفوع' : 'مستحق'} {p.dueDate ? `(${new Date(p.dueDate).toLocaleDateString('ar-EG')})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
      {invoices.length > 3 && <div className="text-xs text-gray-500">عرض 3 من {invoices.length} فاتورة</div>}
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

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
        alert('✅ تم تسجيل الدفعة بنجاح');
      } else {
        alert(`❌ خطأ: ${data && (data.error || data.message) ? (data.error || data.message) : 'فشل تسجيل الدفعة'}`);
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدفعة:', error);
      alert('❌ حدث خطأ في تسجيل الدفعة');
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
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    
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

  const filteredCustomers = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  const totalDebt = customers.reduce((sum, c) => sum + (Number(c.currentDebt) || 0), 0);
  const totalCreditLimit = customers.reduce((sum, c) => sum + (Number(c.creditLimit) || 0), 0);
  const customersWithDebt = customers.filter(c => (Number(c.currentDebt) || 0) > 0).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">إدارة العملاء</h1>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              إضافة عميل جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{customers.length}</span>
              </div>
              <div className="text-sm font-semibold">إجمالي العملاء</div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{customersWithDebt}</span>
              </div>
              <div className="text-sm font-semibold">عملاء لديهم ديون</div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{totalDebt.toLocaleString()}</span>
              </div>
              <div className="text-sm font-semibold">إجمالي الديون (جنيه)</div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{totalCreditLimit.toLocaleString()}</span>
              </div>
              <div className="text-sm font-semibold">حد الائتمان الكلي</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن عميل (الاسم، النشاط، الهاتف)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-lg">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.businessName}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  customer.customerType === 'wholesale'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {customer.customerType === 'wholesale' ? 'جملة' : 'قطاعي'}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{customer.address}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">إجمالي المشتريات:</span>
                  <span className="font-semibold text-green-600">
                    {(Number(customer.totalPurchases) || 0).toLocaleString()} جنيه
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">حد الائتمان:</span>
                  <span className="font-semibold text-blue-600">
                    {(Number(customer.creditLimit) || 0).toLocaleString()} جنيه
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الديون الحالية:</span>
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
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>الائتمان المستخدم</span>
                      <span>{
                        customer.creditLimit && Number(customer.creditLimit) > 0
                          ? (((Number(customer.currentDebt) || 0) / Number(customer.creditLimit)) * 100).toFixed(0)
                          : '0'
                      }%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          ((Number(customer.currentDebt) || 0) / (Number(customer.creditLimit) || 1)) > 0.8 
                            ? 'bg-red-500' 
                            : 'bg-orange-500'
                        }`}
                        style={{ width: `${((Number(customer.currentDebt) || 0) / (Number(customer.creditLimit) || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  {/* جدول الفواتير الآجلة والدفعات */}
                  <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="font-bold text-sm text-orange-700 mb-2">فواتير آجل غير مسددة:</div>
                    <AsyncCustomerInvoices customerId={customer._id} />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(customer)}
                  className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-semibold text-sm flex items-center justify-center gap-1"
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
                    className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-semibold text-sm flex items-center justify-center gap-1"
                  >
                    <DollarSign className="w-4 h-4" />
                    دفع
                  </button>
                )}
                <button
                  onClick={() => handleDelete(customer._id)}
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
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingCustomer ? 'تعديل العميل' : 'إضافة عميل جديد'}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">اسم النشاط</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
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
                  <label className="block text-gray-700 font-semibold mb-2">نوع العميل</label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">حد الائتمان (جنيه)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  {editingCustomer ? 'تحديث' : 'إضافة'}
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
        {showPaymentModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">تسجيل دفعة</h2>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">العميل:</span>
                  <span className="font-semibold">{selectedCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الدين الحالي:</span>
                  <span className="font-bold text-red-600">
                    {selectedCustomer.currentDebt.toLocaleString()} جنيه
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">المبلغ المدفوع</label>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
                {paymentAmount && parseFloat(paymentAmount) > selectedCustomer.currentDebt && (
                  <p className="text-red-500 text-sm mt-1">
                    المبلغ المدخل أكبر من الدين الحالي ({selectedCustomer.currentDebt} جنيه)
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) > selectedCustomer.currentDebt}
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