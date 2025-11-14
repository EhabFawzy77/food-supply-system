'use client';
import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, Search, Users, 
  CreditCard, Banknote, Printer, Calculator, Check, X
} from 'lucide-react';

export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    // محاكاة جلب المنتجات
    setProducts([
      { _id: '1', name: 'أرز أبيض', unit: 'كجم', sellingPrice: 25, stock: 500 },
      { _id: '2', name: 'زيت عباد الشمس', unit: 'لتر', sellingPrice: 45, stock: 200 },
      { _id: '3', name: 'سكر أبيض', unit: 'كجم', sellingPrice: 30, stock: 300 },
      { _id: '4', name: 'ملح طعام', unit: 'كجم', sellingPrice: 8, stock: 400 },
      { _id: '5', name: 'مكرونة', unit: 'كجم', sellingPrice: 18, stock: 250 }
    ]);

    // محاكاة جلب العملاء
    setCustomers([
      { _id: '1', name: 'محل الأمل', phone: '01012345678', creditLimit: 50000, currentDebt: 5000 },
      { _id: '2', name: 'سوبر ماركت النور', phone: '01123456789', creditLimit: 100000, currentDebt: 15000 },
      { _id: '3', name: 'مطعم الفردوس', phone: '01234567890', creditLimit: 30000, currentDebt: 0 }
    ]);
  }, []);

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
    if (paymentMethod === 'cash' && paidAmount) {
      return parseFloat(paidAmount) - calculateTotal();
    }
    return 0;
  };

  const canCompleteSale = () => {
    if (cart.length === 0) return false;
    if (!selectedCustomer) return false;
    
    if (paymentMethod === 'credit') {
      const total = calculateTotal();
      const availableCredit = selectedCustomer.creditLimit - selectedCustomer.currentDebt;
      return total <= availableCredit;
    }
    
    if (paymentMethod === 'cash') {
      return parseFloat(paidAmount || 0) >= calculateTotal();
    }
    
    return true;
  };

  const completeSale = async () => {
    if (!canCompleteSale()) return;

    const saleData = {
      customer: selectedCustomer._id,
      items: cart.map(item => ({
        product: item._id,
        quantity: item.quantity,
        unitPrice: item.sellingPrice,
        total: item.sellingPrice * item.quantity
      })),
      subtotal: calculateSubtotal(),
      discount: discount,
      total: calculateTotal(),
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'paid' : 'unpaid',
      paidAmount: paymentMethod === 'cash' ? parseFloat(paidAmount) : 0,
      notes: notes
    };

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      if (res.ok) {
        setShowInvoice(true);
      }
    } catch (error) {
      alert('حدث خطأ في إتمام البيع');
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

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-indigo-600" />
            نقطة البيع
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product._id}
                  onClick={() => addToCart(product)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-right"
                >
                  <div className="font-bold text-gray-800 mb-1">{product.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{product.stock} {product.unit}</div>
                  <div className="text-lg font-bold text-indigo-600">{product.sellingPrice} جنيه</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart & Checkout */}
          <div className="space-y-6">
            {/* Customer Selection */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <label className="block font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                العميل
              </label>
              <select
                value={selectedCustomer?._id || ''}
                onChange={(e) => {
                  const customer = customers.find(c => c._id === e.target.value);
                  setSelectedCustomer(customer);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">اختر العميل</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              
              {selectedCustomer && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">رقم الهاتف:</span>
                    <span className="font-semibold">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">حد الائتمان:</span>
                    <span className="font-semibold text-green-600">{selectedCustomer.creditLimit.toLocaleString()} جنيه</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الديون الحالية:</span>
                    <span className="font-semibold text-red-600">{selectedCustomer.currentDebt.toLocaleString()} جنيه</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                <span>المنتجات ({cart.length})</span>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-red-500 text-sm hover:text-red-700">
                    مسح الكل
                  </button>
                )}
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.sellingPrice} جنيه</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <Minus className="w-4 h-4 mx-auto" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center border border-gray-300 rounded-lg py-1"
                      />
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                      >
                        <Plus className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="w-8 h-8 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Total */}
            {cart.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>المجموع الفرعي:</span>
                    <span className="font-semibold">{calculateSubtotal().toLocaleString()} جنيه</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الخصم:</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-left"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="flex justify-between text-xl font-bold text-indigo-600 pt-2 border-t">
                    <span>الإجمالي:</span>
                    <span>{calculateTotal().toLocaleString()} جنيه</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-2">طريقة الدفع</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3 rounded-lg border-2 transition ${
                        paymentMethod === 'cash'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <Banknote className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-semibold">كاش</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('credit')}
                      className={`p-3 rounded-lg border-2 transition ${
                        paymentMethod === 'credit'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 hover:border-orange-300'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-semibold">آجل</div>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'cash' && (
                  <div>
                    <label className="block font-semibold text-gray-800 mb-2">المبلغ المدفوع</label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="0"
                    />
                    {paidAmount && calculateChange() >= 0 && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg text-center">
                        <span className="text-sm text-gray-600">الباقي: </span>
                        <span className="font-bold text-blue-600">{calculateChange().toLocaleString()} جنيه</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={completeSale}
                  disabled={!canCompleteSale()}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">تم البيع بنجاح!</h2>
                <p className="text-gray-600">رقم الفاتورة: INV-{Date.now()}</p>
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">العميل:</span>
                  <span className="font-semibold">{selectedCustomer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الإجمالي:</span>
                  <span className="font-semibold">{calculateTotal().toLocaleString()} جنيه</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">طريقة الدفع:</span>
                  <span className="font-semibold">{paymentMethod === 'cash' ? 'كاش' : 'آجل'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetSale}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  بيع جديد
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 flex items-center justify-center gap-2">
                  <Printer className="w-5 h-5" />
                  طباعة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}