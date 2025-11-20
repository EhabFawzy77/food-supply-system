'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Trash2, Users,
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
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastSaleId, setLastSaleId] = useState(null);
  const [lastInvoiceId, setLastInvoiceId] = useState(null);
  const [lastPaymentMethod, setLastPaymentMethod] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [activeProductSearch, setActiveProductSearch] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const quantityRefs = useRef({});
  const [quantityValues, setQuantityValues] = useState({});
  const [lastSaleTotal, setLastSaleTotal] = useState(0);
  const [lastSalePaidAmount, setLastSalePaidAmount] = useState(0);
  const [lastCustomerDebt, setLastCustomerDebt] = useState(0);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [customerSuggestionIndex, setCustomerSuggestionIndex] = useState(-1);
  const [productSuggestionIndices, setProductSuggestionIndices] = useState({});

  useEffect(() => {
    loadProductsAndCustomers();
    // إضافة صف فارغ جاهز عند بدء التشغيل
    setCart([{
      _id: `temp-${Date.now()}`,
      name: '',
      quantity: 1,
      sellingPrice: 0,
      unit: 'لتر'
    }]);
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
      if (!productsRes.ok) {
        throw new Error(`HTTP error! status: ${productsRes.status}`);
      }
      const productsData = await productsRes.json();
      if (productsData.success) {
        setProducts(productsData.data || []);
      } else {
        showError('فشل جلب المنتجات', '❌ خطأ في جلب البيانات');
      }

      const customersRes = await fetch('/api/customers');
      if (!customersRes.ok) {
        throw new Error(`HTTP error! status: ${customersRes.status}`);
      }
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

  const updateQuantity = (productId, newQuantity, newPrice = null) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item._id === productId
        ? {
            ...item,
            quantity: newQuantity,
            ...(newPrice !== null && { sellingPrice: newPrice })
          }
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

  const filteredProductSuggestions = products.filter(p =>
    p.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const filteredCustomerSuggestions = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const handleProductSearch = (itemId, value) => {
    setProductSearchTerm(value);

    if (value.trim() === '') {
      setActiveProductSearch(null);
      setProductSuggestionIndices(prev => {
        const newIndices = { ...prev };
        delete newIndices[itemId];
        return newIndices;
      });
      return;
    }

    setActiveProductSearch(itemId);
    setProductSuggestionIndices(prev => ({ ...prev, [itemId]: -1 }));
  };

  const selectProductFromTable = (itemId, product) => {
    setCart(cart.map(item => {
      if (item._id === itemId) {
        return {
          ...item,
          _id: product._id,
          name: product.name,
          sellingPrice: product.sellingPrice,
          unit: product.unit,
          image: product.image
        };
      }
      return item;
    }));

    setActiveProductSearch(null);
    setProductSearchTerm('');
    setProductSuggestionIndices(prev => ({ ...prev, [itemId]: -1 }));

    // الانتقال لمربع الكمية
    setTimeout(() => {
      if (quantityRefs.current[itemId]) {
        quantityRefs.current[itemId].focus();
      }
    }, 100);
  };

  const canCompleteSale = () => {
    if (!selectedCustomer) return false;

    // التحقق من وجود منتج واحد على الأقل له اسم
    const hasValidItems = cart.some(item => item.name && item.name.trim() !== '');
    if (!hasValidItems) return false;

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
    
    // حفظ البيانات للعرض في modal الفاتورة
    setLastSaleTotal(total);
    setLastCustomerDebt(selectedCustomer?.currentDebt || 0);
    
    // للكاش: يدفع المبلغ الكامل من الفاتورة
    // للآجل: يدفع المبلغ المدخل (أو 0 إذا لم يدخل شيء)
    let paidAmountNum;
    if (paymentMethod === 'cash') {
      paidAmountNum = total;
    } else {
      paidAmountNum = parseFloat(paidAmount || 0);
    }

    setLastSalePaidAmount(paidAmountNum);

    // تحديد حالة الدفع
    let paymentStatus;
    if (paidAmountNum >= total) {
      paymentStatus = 'paid';
    } else if (paidAmountNum > 0) {
      paymentStatus = 'partial';
    } else {
      paymentStatus = 'unpaid';
    }

    // تصفية المنتجات الصالحة فقط (التي لها أسماء)
    const validItems = cart.filter(item => item.name && item.name.trim() !== '');

    const saleData = {
      invoiceNumber: `INV-${Date.now()}`,
      customer: selectedCustomer._id,
      items: validItems.map(item => ({
        product: item._id.startsWith('temp-') ? null : item._id, // null for custom products
        productName: item.name,
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

          // تحديث بيانات العميل
          await loadProductsAndCustomers();
          
          // إعادة تعيين الشاشة
          resetSale();
          
          // الانتقال لصفحة الطباعة
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
              
              // تحديث بيانات العميل
              await loadProductsAndCustomers();
              
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
        
        // تحديث بيانات العميل
        await loadProductsAndCustomers();
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
    setCart([{
      _id: `temp-${Date.now()}`,
      name: '',
      quantity: 1,
      sellingPrice: 0,
      unit: 'لتر'
    }]);
    setSelectedCustomer(null);
    setPaidAmount('');
    setDiscount(0);
    setNotes('');
    setPaymentMethod('cash');
    setShowInvoice(false);
  };



  const handleQuantityKeyPress = (e, itemId) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // البحث عن الصف التالي
      const currentIndex = cart.findIndex(item => item._id === itemId);

      if (currentIndex < cart.length - 1) {
        // الانتقال للمنتج التالي
        const nextItem = cart[currentIndex + 1];
        const nextInput = document.querySelector(`#product-search-${nextItem._id}`);
        if (nextInput) nextInput.focus();
      } else {
        // إضافة صف جديد
        const newId = Date.now(); // استخدام timestamp لضمان فرادة المعرف
        const newCart = [...cart, {
          _id: `temp-${newId}`,
          name: '',
          quantity: 1,
          sellingPrice: 0,
          unit: 'لتر'
        }];
        setCart(newCart);

        setTimeout(() => {
          const newInput = document.querySelector(`#product-search-temp-${newId}`);
          if (newInput) newInput.focus();
        }, 100);
      }
    }
  };

  const handleCustomerKeyDown = (e) => {
    if (!showCustomerSuggestions || filteredCustomerSuggestions.length === 0) return;

    if (e.key === 'ArrowDown' || e.key === 'Down' || e.key === 'PageDown') {
      e.preventDefault();
      setCustomerSuggestionIndex(prev => prev < filteredCustomerSuggestions.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp' || e.key === 'Up' || e.key === 'PageUp') {
      e.preventDefault();
      setCustomerSuggestionIndex(prev => {
        if (prev > 0) {
          return prev - 1;
        } else if (prev === 0) {
          return -1;
        } else {
          return filteredCustomerSuggestions.length - 1;
        }
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (customerSuggestionIndex >= 0) {
        const customer = filteredCustomerSuggestions[customerSuggestionIndex];
        setSelectedCustomer(customer);
        setCustomerSearchTerm('');
        setShowCustomerSuggestions(false);
        setCustomerSuggestionIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowCustomerSuggestions(false);
      setCustomerSuggestionIndex(-1);
    }
  };

  const handleProductKeyDown = (e, itemId) => {
    if (activeProductSearch !== itemId || filteredProductSuggestions.length === 0) return;

    const clampedIndex = Math.max(-1, Math.min(productSuggestionIndices[activeProductSearch] ?? -1, filteredProductSuggestions.length - 1));

    if (e.key === 'ArrowDown' || e.key === 'Down' || e.key === 'PageDown') {
      e.preventDefault();
      const newIndex = clampedIndex < filteredProductSuggestions.length - 1 ? clampedIndex + 1 : 0;
      setProductSuggestionIndices(prev => ({ ...prev, [activeProductSearch]: newIndex }));
    } else if (e.key === 'ArrowUp' || e.key === 'Up' || e.key === 'PageUp') {
      e.preventDefault();
      let newIndex;
      if (clampedIndex > 0) {
        newIndex = clampedIndex - 1;
      } else {
        newIndex = filteredProductSuggestions.length - 1;
      }
      setProductSuggestionIndices(prev => ({ ...prev, [activeProductSearch]: newIndex }));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if ((productSuggestionIndices[activeProductSearch] ?? -1) >= 0) {
        const product = filteredProductSuggestions[productSuggestionIndices[activeProductSearch] ?? -1];
        selectProductFromTable(itemId, product);
        setProductSuggestionIndices(prev => ({ ...prev, [activeProductSearch]: -1 }));
      } else {
        // Move to quantity
        setTimeout(() => {
          if (quantityRefs.current[itemId]) {
            quantityRefs.current[itemId].focus();
          }
        }, 100);
      }
    } else if (e.key === 'Escape') {
      setActiveProductSearch(null);
      setProductSearchTerm('');
      setProductSuggestionIndices(prev => ({ ...prev, [activeProductSearch]: -1 }));
    }
  };

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeProductSearch && !event.target.closest('.product-search-container')) {
        setActiveProductSearch(null);
        setProductSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeProductSearch]);

  // إغلاق القائمة بالضغط على Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveProductSearch(null);
        setProductSearchTerm('');
        setShowCustomerSuggestions(false);
        setCustomerSearchTerm('');
        setCustomerSuggestionIndex(-1);
        setProductSuggestionIndices({});
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // إغلاق قائمة العملاء عند النقر خارجها
  // Removed to keep suggestions open while typing


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              فاتورة بيع
            </h1>

            {/* Customer Name and Info */}
            <div className="flex justify-center items-center gap-6 mb-6">
              <div className="border-2 border-indigo-500 px-6 py-3 w-96 rounded-xl bg-white/50 relative customer-search-container">
                <input
                  type="text"
                  value={selectedCustomer?.name || customerSearchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomerSearchTerm(value);
                    setSelectedCustomer(null);
                    setShowCustomerSuggestions(value.trim() !== '');
                    setCustomerSuggestionIndex(-1);
                  }}
                  onKeyDown={handleCustomerKeyDown}
                  placeholder="اكتب اسم العميل أو اختر من القائمة"
                  className="w-full text-center text-xl font-semibold outline-none bg-transparent"
                  tabIndex="0"
                />

                {/* Customer Suggestions */}
                {showCustomerSuggestions && (
                  <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-32 overflow-y-scroll mt-2" style={{ left: '0' }} onMouseDown={(e) => e.preventDefault()}>
                    {filteredCustomerSuggestions.length > 0 ? (
                      filteredCustomerSuggestions.map((customer, index) => (
                        <div
                          key={customer._id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerSearchTerm('');
                            setShowCustomerSuggestions(false);
                            setCustomerSuggestionIndex(-1);
                          }}
                          className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            customerSuggestionIndex === index ? 'bg-blue-300' : 'hover:bg-indigo-50'
                          }`}
                        >
                          <div className="font-semibold">{customer.name}</div>
                          <div className="text-sm text-gray-600">
                            الهاتف: {customer.phone} - الدين: {customer.currentDebt} جنيه
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-gray-500 text-center">
                        {customerSearchTerm ? 'لا توجد عملاء بهذا الاسم' : 'ابدأ الكتابة للبحث...'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedCustomer && (
                <>
                  <div className="flex items-center gap-3">
                    <label className="text-xl font-semibold text-gray-700">الدين الحالي:</label>
                    <div className="text-xl font-bold text-red-600">
                      {(selectedCustomer.currentDebt || 0).toLocaleString()} جنيه
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xl font-semibold text-gray-700">رقم الهاتف:</label>
                    <div className="text-xl font-semibold text-gray-800">
                      {selectedCustomer.phone || 'غير محدد'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mb-6 relative product-search-container">
            <table className="w-full border-2 border-indigo-500 rounded-xl">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <th className="border border-indigo-400 p-4 text-lg font-bold w-16">حذف</th>
                  <th className="border border-indigo-400 p-4 text-lg font-bold w-20">الصورة</th>
                  <th className="border border-indigo-400 p-4 text-lg font-bold">اسم المنتج</th>
                  <th className="border border-indigo-400 p-4 text-lg font-bold">الكمية</th>
                  <th className="border border-indigo-400 p-4 text-lg font-bold">سعر الواحد</th>
                  <th className="border border-indigo-400 p-4 text-lg font-bold">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={item._id} className="hover:bg-indigo-50/50 transition-colors">
                    <td className="border border-indigo-300 p-3 text-center">
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                    <td className="border border-indigo-300 p-3 text-center">
                      <img
                        src={item.image || '/images/product-placeholder.png'}
                        alt={item.name || 'منتج'}
                        className="w-12 h-12 object-cover rounded-lg mx-auto border border-gray-200"
                        onError={(e) => {
                          e.target.src = '/images/product-placeholder.png';
                        }}
                      />
                    </td>
                    <td className="border border-indigo-300 p-3 relative">
                      <div className="relative product-search-container">
                        <input
                          id={`product-search-${item._id}`}
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            // تحديث اسم المنتج في السلة
                            setCart(cart.map(cartItem =>
                              cartItem._id === item._id
                                ? { ...cartItem, name: e.target.value }
                                : cartItem
                            ));
                            // تشغيل البحث
                            handleProductSearch(item._id, e.target.value);
                          }}
                          onFocus={() => {
                            if (item.name.trim()) {
                              handleProductSearch(item._id, item.name);
                            }
                          }}
                          onKeyDown={(e) => handleProductKeyDown(e, item._id)}
                          className="w-full text-center text-sm font-semibold bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded p-0.5"
                          placeholder="اكتب اسم المنتج..."
                          tabIndex="0"
                        />

                        {/* قائمة الاقتراحات */}
                        {activeProductSearch === item._id && filteredProductSuggestions.length > 0 && (
                          <div
                            className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-32 overflow-y-scroll" onMouseDown={(e) => e.preventDefault()}
                            style={{
                              top: '100%',
                              left: 0,
                              width: '100%'
                            }}
                          >
                            {filteredProductSuggestions.map((product, index) => (
                              <div
                                key={product._id}
                                onClick={() => {
                                  selectProductFromTable(item._id, product);
                                  setProductSuggestionIndices(prev => ({ ...prev, [item._id]: -1 }));
                                }}
                                className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                  (activeProductSearch === item._id ? (productSuggestionIndices[activeProductSearch] ?? -1) : -1) === index ? 'bg-blue-500 text-white' : 'hover:bg-indigo-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.image || '/images/product-placeholder.png'}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded border border-gray-200"
                                    onError={(e) => {
                                      e.target.src = '/images/product-placeholder.png';
                                    }}
                                  />
                                  <div className="flex-1">
                                    <div className="font-semibold">{product.name}</div>
                                    <div className="text-sm text-gray-600">
                                      السعر: {product.sellingPrice} جنيه - الوحدة: {product.unit}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border border-indigo-300 p-3">
                      <input
                        ref={(el) => {
                          if (el) {
                            quantityRefs.current[item._id] = el;
                          }
                        }}
                        type="number"
                        value={quantityValues[item._id] !== undefined ? quantityValues[item._id] : (item.quantity || 1).toString()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuantityValues(prev => ({ ...prev, [item._id]: val }));
                          const num = parseInt(val) || 0;
                          if (num <= 0) {
                            removeFromCart(item._id);
                          } else {
                            updateQuantity(item._id, num, item.sellingPrice);
                          }
                        }}
                        onFocus={() => {
                          if (quantityValues[item._id] === undefined && item.quantity === 1) {
                            setQuantityValues(prev => ({ ...prev, [item._id]: '' }));
                          }
                        }}
                        onBlur={() => {
                          if (quantityValues[item._id] === '') {
                            setQuantityValues(prev => {
                              const newValues = { ...prev };
                              delete newValues[item._id];
                              return newValues;
                            });
                            updateQuantity(item._id, 1, item.sellingPrice);
                          }
                        }}
                        onKeyPress={(e) => handleQuantityKeyPress(e, item._id)}
                        className="w-full text-center text-sm font-semibold bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded p-0.5"
                        placeholder="الكمية"
                      />
                    </td>
                    <td className="border border-indigo-300 p-3">
                      <input
                        type="number"
                        value={item.sellingPrice || ''}
                        onChange={(e) => {
                          const newPrice = parseFloat(e.target.value) || 0;
                          updateQuantity(item._id, item.quantity, newPrice);
                        }}
                        className="w-full text-center text-sm font-semibold bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded p-0.5"
                        placeholder="0"
                        step="0.01"
                      />
                    </td>
                    <td className="border border-indigo-300 p-3">
                      <div className="text-center text-lg font-bold text-indigo-600">
                        {((item.quantity || 0) * (item.sellingPrice || 0)).toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" className="p-4">
                    <div className="border-2 border-indigo-500 rounded-xl p-0.5 bg-gradient-to-r from-indigo-50 to-purple-50">
                      {/* Calculations */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">المجموع الفرعي</div>
                          <div className="text-2xl font-bold text-indigo-600">{calculateSubtotal().toFixed(2)} جنيه</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">الخصم</div>
                          <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                            onFocus={(e) => {
                              if (e.target.value === '0') {
                                e.target.value = '';
                              }
                            }}
                            className="w-full text-center text-lg font-bold border-2 border-indigo-400 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            min="0"
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">الإجمالي</div>
                          <div className="text-2xl font-bold text-indigo-600">{calculateTotal().toFixed(2)} جنيه</div>
                        </div>
                      </div>

                      <div className="text-center mb-3">
                        <div className="text-3xl font-bold text-indigo-600">
                          الإجمالي الكلي: {calculateTotal().toFixed(2)} جنيه
                        </div>
                        {selectedCustomer && (selectedCustomer.currentDebt || 0) > 0 && (
                          <div className="text-xl font-semibold text-red-600 mt-2">
                            + الديون السابقة: {(selectedCustomer.currentDebt || 0).toLocaleString()} جنيه
                            = الإجمالي الكلي: {((selectedCustomer.currentDebt || 0) + calculateTotal()).toFixed(2)} جنيه
                          </div>
                        )}
                      </div>

                      {/* Payment Method Selection */}
                      <div className="flex justify-center items-center gap-4 mb-4">
                        <button
                          onClick={() => {
                            setPaymentMethod('cash');
                            setPaidAmount('');
                          }}
                          className={`flex items-center gap-3 px-8 py-3 text-lg font-bold rounded-xl transition-all duration-300 ${
                            paymentMethod === 'cash'
                              ? 'bg-green-500 text-white shadow-lg transform scale-105'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <Banknote size={24} />
                          كاش
                        </button>

                        {paymentMethod === 'credit' && (
                          <input
                            type="number"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            className="px-6 py-2 text-center text-base font-bold border-2 border-orange-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                            placeholder="0.00"
                          />
                        )}

                        <button
                          onClick={() => {
                            setPaymentMethod('credit');
                            setPaidAmount('');
                          }}
                          className={`flex items-center gap-3 px-8 py-3 text-lg font-bold rounded-xl transition-all duration-300 ${
                            paymentMethod === 'credit'
                              ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <CreditCard size={24} />
                          آجل
                        </button>
                      </div>

                      {/* Complete Sale and Print Button */}
                      <div className="text-center">
                        <button
                          onClick={completeSale}
                          disabled={!canCompleteSale()}
                          className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xl font-bold transition-all duration-300 shadow-lg mx-auto ${
                            canCompleteSale()
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          }`}
                        >
                          <Printer size={28} />
                          <span>إتمام البيع وطباعة</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

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
                  <p className="text-gray-600 text-sm">رقم الفاتورة: INV-{lastInvoiceId || '000'}</p>
                </div>

                <div className="space-y-3 mb-6 text-sm bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">العميل:</span>
                      <span className="font-semibold">{selectedCustomer?.name || 'عميل عام'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">الديون السابقة:</span>
                      <span className="font-semibold text-red-700">{lastCustomerDebt.toLocaleString()} جنيه</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">إجمالي الفاتورة:</span>
                      <span className="font-semibold text-green-600">{lastSaleTotal.toLocaleString()} جنيه</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">الإجمالي الكلي:</span>
                      <span className="font-semibold text-indigo-700">{(lastCustomerDebt + lastSaleTotal).toLocaleString()} جنيه</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">المبلغ المسدد:</span>
                      <span className="font-semibold">
                        {lastSalePaidAmount.toLocaleString()} جنيه
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">الطريقة:</span>
                      <span className="font-semibold">{lastPaymentMethod === 'cash' ? 'كاش' : 'آجل'}</span>
                    </div>

                    {lastPaymentMethod === 'credit' && (
                      <div className="col-span-2">
                        <div className="mt-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                          <div className="text-xs text-gray-600 mb-1">الدين المتبقي بعد السداد</div>
                          <div className="font-bold text-lg text-yellow-700">
                            {(lastCustomerDebt + lastSaleTotal - lastSalePaidAmount).toLocaleString()} جنيه
                          </div>
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
                  <button 
                    onClick={() => {
                      if (lastInvoiceId) {
                        router.push(`/dashboard/invoices/${lastInvoiceId}/print`);
                      }
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-300 flex items-center justify-center gap-2 transition text-sm"
                  >
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
                  سيتم إرجاع المبلغ: <span className="font-bold">{lastSaleTotal.toLocaleString()} جنيه</span>
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
  );
}