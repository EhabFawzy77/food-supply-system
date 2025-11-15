'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, Plus, Minus, Trash2, Search, Users, 
  CreditCard, Banknote, Printer, Calculator, Check, X, AlertCircle,
  Package, Grid, List, Zap
} from 'lucide-react';
import { useApp } from '../../../../contexts/AppContext.jsx';

export default function SalesPage() {
  const router = useRouter();
  const { success, error: showError, warning } = useApp();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [debts, setDebts] = useState([]);
  const [outstandingTotal, setOutstandingTotal] = useState(0);
  const [fetchingDebts, setFetchingDebts] = useState(false);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastSaleId, setLastSaleId] = useState(null);
  const [lastInvoiceId, setLastInvoiceId] = useState(null);
  const [lastPaymentMethod, setLastPaymentMethod] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [gridView, setGridView] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadProductsAndCustomers();
  }, []);

  // Fetch debts for selected customer
  useEffect(() => {
    const fetchDebts = async () => {
      if (!selectedCustomer || !selectedCustomer._id) {
        setDebts([]);
        setOutstandingTotal(0);
        return;
      }

      try {
        setFetchingDebts(true);
        const res = await fetch(`/api/customers/${selectedCustomer._id}/debts`);
        const data = await res.json();
        if (data.success) {
          setDebts(data.data.invoices || []);
          setOutstandingTotal(data.data.total || 0); // Update to read total instead of outstanding
        } else {
          setDebts([]);
          setOutstandingTotal(0);
        }
      } catch (err) {
        console.error('Error fetching debts:', err);
        setDebts([]);
        setOutstandingTotal(0);
      } finally {
        setFetchingDebts(false);
      }
    };

    fetchDebts();
  }, [selectedCustomer]);

  const loadProductsAndCustomers = async () => {
    try {
      const productsRes = await fetch('/api/products');
      const productsData = await productsRes.json();
      if (productsData.success) {
        setProducts(productsData.data || []);
      } else {
        showError('فشل جلب المنتجات', '❌ خطأ في جلب البيانات');
      }

      const customersRes = await fetch('/api/customers');
      const customersData = await customersRes.json();
      if (customersData.success) {
        setCustomers(customersData.data || []);
      } else {
        showError('فشل جلب العملاء', '❌ خطأ في جلب البيانات');
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      showError('حدث خطأ في الاتصال بالخادم', '❌ خطأ في جلب البيانات');
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item._id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - discount;
  };

  const calculateChange = () => {
    // فقط للكاش: المدفوع - الإجمالي
    if (paymentMethod === 'cash') {
      const paid = parseFloat(paidAmount || 0);
      const total = calculateTotal();
      return paid - total;
    }
    return 0;
  };

  const calculateRemainingDebt = () => {
    // فقط للآجل: الدين الحالي + الفاتورة الحالية - المبلغ المدفوع
    if (paymentMethod === 'credit') {
      const paid = parseFloat(paidAmount || 0);
      const total = calculateTotal();
      const currentDebt = selectedCustomer ? (selectedCustomer.currentDebt || 0) : 0;
      const totalDebtBeforePayment = currentDebt + total;
      const remaining = Math.max(0, totalDebtBeforePayment - paid);
      return remaining;
    }
    return 0;
  };

  const canCompleteSale = () => {
    if (cart.length === 0) return false;
    if (!selectedCustomer) return false;
    
    const total = calculateTotal();

    if (paymentMethod === 'cash') {
      // الكاش: دائماً جاهز لأن العميل يدفع كل الإجمالي
      return true;
    }

    if (paymentMethod === 'credit') {
      const paid = parseFloat(paidAmount || 0);
      
      // للآجل: التحقق من أن الدين الكلي لا يتجاوز حد الائتمان
      const currentDebt = selectedCustomer.currentDebt || 0;
      const totalDebtNeeded = currentDebt + total;
      const remainingDebtAfterPayment = totalDebtNeeded - paid;
      const availableCredit = (selectedCustomer.creditLimit || 0);
      
      return remainingDebtAfterPayment <= availableCredit;
    }
    
    return true;
  };

  const getErrorMessage = () => {
    if (cart.length === 0) return 'السلة فارغة';
    if (!selectedCustomer) return 'اختر عميل';
    
    const total = calculateTotal();

    if (paymentMethod === 'cash') {
      return null;
    }

    if (paymentMethod === 'credit') {
      const paid = parseFloat(paidAmount || 0);
      const currentDebt = selectedCustomer.currentDebt || 0;
      const totalDebtNeeded = currentDebt + total;
      const remainingDebtAfterPayment = totalDebtNeeded - paid;
      const availableCredit = (selectedCustomer.creditLimit || 0);
      
      if (remainingDebtAfterPayment > availableCredit) {
        return `تجاوز حد الائتمان. المتاح: ${availableCredit.toLocaleString()} جنيه`;
      }
    }

    return null;
  };

  const completeSale = async () => {
    if (!canCompleteSale()) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const total = calculateTotal();
    
    // للكاش: يدفع المبلغ الكامل من الفاتورة
    // للآجل: يدفع المبلغ المدخل (أو 0 إذا لم يدخل شيء)
    let paidAmountNum;
    if (paymentMethod === 'cash') {
      paidAmountNum = total;
    } else {
      paidAmountNum = parseFloat(paidAmount || 0);
    }

    // تحديد حالة الدفع
    let paymentStatus;
    if (paidAmountNum >= total) {
      paymentStatus = 'paid';
    } else if (paidAmountNum > 0) {
      paymentStatus = 'partial';
    } else {
      paymentStatus = 'unpaid';
    }

    const saleData = {
      invoiceNumber: `INV-${Date.now()}`,
      customer: selectedCustomer._id,
      items: cart.map(item => ({
        product: item._id,
        quantity: item.quantity,
        unitPrice: item.sellingPrice,
        total: item.quantity * item.sellingPrice
      })),
      subtotal: calculateSubtotal(),
      discount: discount,
      total: total,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      paidAmount: paidAmountNum,
      notes: notes,
      createdBy: currentUser._id || null
    };

    try {
      console.log('Creating sale with data:', saleData);
      const saleRes = await fetch('/api/sales', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(saleData)
      });

      let saleResult = {};
      try {
        const saleText = await saleRes.text();
        saleResult = saleText ? JSON.parse(saleText) : {};
      } catch (err) {
        console.error('Invalid JSON from sale creation response:', err);
        saleResult = {};
      }
      console.log('Sale result:', saleResult);

      if (saleResult.success) {
        const saleId = saleResult.data && saleResult.data.sale ? saleResult.data.sale._id : null;
        console.log('Sale created with ID:', saleId);
        setLastSaleId(saleId);
        setLastPaymentMethod(paymentMethod);

        const invoiceObj = saleResult.data && saleResult.data.invoice ? saleResult.data.invoice : null;

        if (invoiceObj && invoiceObj._id) {
          const invoiceId = invoiceObj._id;
          setLastInvoiceId(invoiceId);

          success(`تم البيع بنجاح! الإجمالي: ${total.toLocaleString()} جنيه`, '✓ تم إتمام البيع', {
            duration: 2000
          });

          resetSale();
          setTimeout(() => {
            router.push(`/dashboard/invoices/${invoiceId}/print`);
          }, 500);
        } else {
          try {
            const invoiceRes = await fetch('/api/invoices', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              },
              body: JSON.stringify({ saleId })
            });

            let invoiceResult = {};
            try {
              const text = await invoiceRes.text();
              invoiceResult = text ? JSON.parse(text) : {};
            } catch (err) {
              console.error('Invalid JSON from invoice creation response:', err);
              invoiceResult = {};
            }

            if (invoiceRes.ok && invoiceResult && invoiceResult.success) {
              const invoiceId = invoiceResult.data._id || (invoiceResult.data && invoiceResult.data._id);
              setLastInvoiceId(invoiceId);
              success(`تم البيع بنجاح! الإجمالي: ${total.toLocaleString()} جنيه`, '✓ تم إتمام البيع', { duration: 2000 });
              resetSale();
              setTimeout(() => { router.push(`/dashboard/invoices/${invoiceId}/print`); }, 500);
            } else {
              const errorMsg = (invoiceResult && (invoiceResult.error || invoiceResult.message)) || invoiceRes.statusText || 'فشل إنشاء الفاتورة';
              showError(errorMsg, '❌ خطأ في إنشاء الفاتورة');
              setShowInvoice(true);
            }
          } catch (err) {
            console.error('Invoice creation fallback error:', err);
            showError('فشل إنشاء الفاتورة', '❌ خطأ في إنشاء الفاتورة');
            setShowInvoice(true);
          }
        }
      } else {
        const errorMsg = saleResult.error || saleResult.message || 'فشل إتمام البيع';
        showError(errorMsg, '❌ خطأ في البيع');
      }
    } catch (error) {
      console.error('خطأ في إتمام البيع:', error);
      showError('حدث خطأ في الاتصال بالخادم', '❌ خطأ في الاتصال');
    }
  };

  const cancelCashPayment = async () => {
    if (!lastSaleId) return;

    try {
      const res = await fetch(`/api/sales/${lastSaleId}/cancel-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await res.json();

      if (result.success) {
        success('تم إلغاء الدفع بنجاح', '✓ تم الإلغاء');
        setShowInvoice(false);
        setShowCancelConfirm(false);
        setLastSaleId(null);
      } else {
        const errorMsg = result.error || result.message || 'فشل إلغاء الدفع';
        showError(errorMsg, '❌ خطأ في الإلغاء');
      }
    } catch (error) {
      console.error('خطأ في إلغاء الدفع:', error);
      showError('حدث خطأ في الاتصال بالخادم', '❌ خطأ في الاتصال');
    }
  };

  const resetSale = () => {
    setCart([]);
    setSelectedCustomer(null);
    setPaidAmount('');
    setDiscount(0);
    setNotes('');
    setPaymentMethod('cash');
    setShowInvoice(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const subtotal = calculateSubtotal();
    const currentDebt = selectedCustomer ? selectedCustomer.currentDebt || 0 : 0;
    setTotalAmount(subtotal + currentDebt);
  }, [cart, selectedCustomer]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Main Invoice Container */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left: Products Grid */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Products Grid */}
            <div className="bg-white rounded-xl shadow-md p-4 max-h-[700px] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all hover:shadow-md"
                  >
                    <div className="text-sm font-bold text-gray-800 truncate">{product.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{product.unit}</div>
                    <div className="text-indigo-600 font-bold text-lg">{product.sellingPrice}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Invoice Form */}
          <div className="space-y-4">
            {/* Invoice Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="mb-4 pb-4 border-b-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">فاتورة بيع</h2>
                <p className="text-sm text-gray-600">#{Date.now().toString().slice(-6)}</p>
              </div>

              {/* Customer Section */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">العميل</label>
                <select
                  value={selectedCustomer?._id || ''}
                  onChange={(e) => {
                    const customer = customers.find(c => c._id === e.target.value);
                    setSelectedCustomer(customer);
                    // fetch debts will be triggered by useEffect that listens to selectedCustomer
                  }}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="">اختر العميل</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>

                {selectedCustomer && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">رقم الهاتف:</span>
                        <div className="font-semibold text-gray-800">{selectedCustomer.phone}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">الرصيد المتاح:</span>
                        <div className={`font-semibold ${((selectedCustomer.creditLimit || 0) - (selectedCustomer.currentDebt || 0)) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {((selectedCustomer.creditLimit || 0) - (selectedCustomer.currentDebt || 0)).toLocaleString()} جنيه
                        </div>
                      </div>
                    </div>
                    {/* ديون العميل */}
                    <div className="mt-3 border-t pt-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-600">الديون الحالية:</span>
                          <div className="font-semibold text-red-700">{(selectedCustomer.currentDebt || 0).toLocaleString()} جنيه</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-600">فواتير غير مسددة:</div>
                          <div className="font-semibold text-gray-800">{debts.length} فاتورة</div>
                        </div>
                      </div>

                      {fetchingDebts ? (
                        <div className="mt-2 text-xs text-gray-600">جاري جلب الديون...</div>
                      ) : debts && debts.length > 0 ? (
                        <div className="mt-2 text-xs text-gray-700">
                          <div>إجمالي مستحق من الفواتير: <span className="font-semibold">{outstandingTotal.toLocaleString()} جنيه</span></div>
                          <div className="mt-2 space-y-1">
                            {debts.slice(0,3).map(inv => (
                              <div key={inv._id} className="flex items-center justify-between bg-white p-2 rounded border">
                                <div className="text-xs">{inv.invoiceNumber || inv._id}</div>
                                <div className="text-xs font-semibold text-red-600">{((inv.total || 0) - (inv.paidAmount || 0)).toLocaleString()} جنيه</div>
                              </div>
                            ))}
                            {debts.length > 3 && <div className="text-xs text-gray-600 mt-1">عرض 3 من {debts.length} فاتورة</div>}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-gray-600">لا توجد فواتير غير مسددة</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b-2 border-gray-200">
                <h3 className="font-bold text-gray-800">المنتجات ({cart.length})</h3>
              </div>

              {cart.length > 0 ? (
                <div className="divide-y-2 divide-gray-100 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item._id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.quantity} × {item.sellingPrice} = {(item.quantity * item.sellingPrice).toLocaleString()} جنيه
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">السلة فارغة</p>
                </div>
              )}
            </div>

            {/* Calculations */}
            {cart.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-700">المجموع الفرعي:</span>
                  <span className="font-bold text-gray-900">{calculateSubtotal().toLocaleString()} جنيه</span>
                </div>

                {/* Discount */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-700">الخصم:</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-left text-sm font-bold"
                    min="0"
                  />
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="font-bold text-gray-900">الإجمالي:</span>
                  <span className="font-bold text-indigo-600 text-2xl">{calculateTotal().toLocaleString()} جنيه</span>
                </div>

                {/* Current Customer Debt */}
                {selectedCustomer && (
                  <div className="flex justify-between items-center pt-3 pb-3 border-b border-gray-200">
                    <span className="text-gray-700">الديون الحالية على العميل:</span>
                    <span className="font-bold text-red-600 text-lg">{(selectedCustomer.currentDebt || 0).toLocaleString()} جنيه</span>
                  </div>
                )}

                {/* Total Amount (including debts) */}
                <div className="flex justify-between items-center pt-2 text-lg">
                  <span className="font-bold text-gray-900">الإجمالي الكلي:</span>
                  <span className="font-bold text-red-600 text-2xl">{totalAmount.toLocaleString()} جنيه</span>
                </div>
              </div>
            )}

            {/* Payment Method */}
            {cart.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                <h4 className="font-bold text-gray-800">طريقة الدفع</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setPaymentMethod('cash');
                      setPaidAmount('');
                    }}
                    className={`p-3 rounded-lg border-2 transition font-semibold text-sm ${
                      paymentMethod === 'cash'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:border-green-400'
                    }`}
                  >
                    <Banknote className="w-5 h-5 mx-auto mb-1" />
                    كاش
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setPaymentMethod('credit');
                        setPaidAmount('');
                      }}
                      className={`p-3 rounded-lg border-2 transition font-semibold text-sm w-full ${
                        paymentMethod === 'credit'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 text-gray-700 hover:border-orange-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      آجل
                    </button>
                    <span className="absolute left-0 top-full mt-1 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1 shadow border border-orange-200">سيتم تسجيل الفاتورة كدين للعميل ويمكن تحصيل دفعات لاحقًا</span>
                  </div>
                </div>

                {/* Total Amount Section */}
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">الفاتورة الحالية:</span>
                      <span className="font-bold text-blue-600">{calculateTotal().toLocaleString()} جنيه</span>
                    </div>
                    
                    {selectedCustomer && (selectedCustomer.currentDebt || 0) > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">+ الديون السابقة:</span>
                        <span className="font-bold text-red-600">{(selectedCustomer.currentDebt || 0).toLocaleString()} جنيه</span>
                      </div>
                    )}
                    
                    {selectedCustomer && (selectedCustomer.currentDebt || 0) > 0 && (
                      <div className="border-t border-blue-300 pt-2 flex justify-between items-center">
                        <span className="font-bold text-gray-900">= الإجمالي الكلي:</span>
                        <span className="font-bold text-lg text-orange-600">
                          {((selectedCustomer.currentDebt || 0) + calculateTotal()).toLocaleString()} جنيه
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Paid Amount Input - only for credit */}
                {paymentMethod === 'credit' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      المبلغ المسدد
                    </label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold text-lg"
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ادخل أي مبلغ من الإجمالي الكلي - الباقي سيكون ديون متبقية
                    </p>
                  </div>
                )}

                {/* Cash Info - shows that full payment is required */}
                {paymentMethod === 'cash' && (
                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Banknote className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-800">دفع كاش - يجب دفع المبلغ كاملاً</span>
                    </div>
                    <p className="text-sm text-green-700">
                      المبلغ المطلوب: <span className="font-bold text-lg">{calculateTotal().toLocaleString()} جنيه</span>
                      {selectedCustomer && (selectedCustomer.currentDebt || 0) > 0 &&
                        ` (يشمل الديون السابقة: ${(selectedCustomer.currentDebt || 0).toLocaleString()} جنيه)`}
                    </p>
                  </div>
                )}

                {/* Remaining Debt Display - Only for credit */}
                {paymentMethod === 'credit' && (
                  <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="text-xs text-gray-600 mb-1">الدين المتبقي بعد الدفع:</div>
                    <div className="font-bold text-lg text-yellow-700">
                      {calculateRemainingDebt().toLocaleString()} جنيه
                    </div>
                  </div>
                )}

                {/* Error Message - Only for credit */}
                {paymentMethod === 'credit' && !canCompleteSale() && getErrorMessage() && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-700">{getErrorMessage()}</span>
                  </div>
                )}

                {/* Complete Sale Button */}
                <button
                  onClick={completeSale}
                  disabled={!canCompleteSale()}
                  className={`w-full py-3 rounded-lg font-bold text-white text-lg transition flex items-center justify-center gap-2 ${
                    canCompleteSale()
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-6 h-6" />
                  إتمام البيع
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Modal */}
        {showInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              {!showCancelConfirm ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">تم البيع بنجاح!</h2>
                    <p className="text-gray-600 text-sm">رقم الفاتورة: INV-{Date.now()}</p>
                  </div>

                  <div className="space-y-3 mb-6 text-sm bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">العميل:</span>
                        <span className="font-semibold">{selectedCustomer?.name}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">الديون السابقة:</span>
                        <span className="font-semibold text-red-700">{(selectedCustomer?.currentDebt || 0).toLocaleString()} جنيه</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">إجمالي الفاتورة:</span>
                        <span className="font-semibold text-green-600">{calculateTotal().toLocaleString()} جنيه</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">الإجمالي الكلي (بما في ذلك الديون):</span>
                        <span className="font-semibold text-indigo-700">{(totalAmount).toLocaleString()} جنيه</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">المبلغ المسدد:</span>
                        <span className="font-semibold">
                          {paymentMethod === 'cash'
                            ? total.toLocaleString()
                            : (parseFloat(paidAmount || 0)).toLocaleString()}
                          {' جنيه'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">الطريقة:</span>
                        <span className="font-semibold">{lastPaymentMethod === 'cash' ? 'كاش' : 'آجل'}</span>
                      </div>

                      {paymentMethod === 'credit' && (
                        <div className="col-span-2">
                          <div className="mt-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                            <div className="text-xs text-gray-600">سيتم تسجيل الفاتورة كدين للعميل ويمكن تحصيل دفعات لاحقًا من صفحة الدفعات أو العميل.</div>
                            <div className="font-bold text-lg text-yellow-700">{calculateRemainingDebt().toLocaleString()} جنيه</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={resetSale}
                      className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm"
                    >
                      بيع جديد
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-300 flex items-center justify-center gap-2 transition text-sm">
                      <Printer className="w-4 h-4" />
                      طباعة
                    </button>
                  </div>

                  {lastPaymentMethod === 'cash' && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full mt-3 bg-red-100 text-red-700 py-2 rounded-lg font-semibold hover:bg-red-200 flex items-center justify-center gap-2 border border-red-300 transition text-sm"
                    >
                      <X className="w-4 h-4" />
                      إلغاء الدفع
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">تأكيد الإلغاء</h2>
                    <p className="text-gray-600 text-sm">هل تريد بالفعل إلغاء هذه العملية؟</p>
                  </div>

                  <div className="bg-red-50 p-3 rounded-lg mb-6 text-sm text-red-700 border border-red-200">
                    سيتم إرجاع المبلغ: <span className="font-bold">{calculateTotal().toLocaleString()} جنيه</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={cancelCashPayment}
                      className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                    >
                      تأكيد الإلغاء
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-400 transition text-sm"
                    >
                      إلغاء
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}