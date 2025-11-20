'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Trash2, Save } from 'lucide-react';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [formData, setFormData] = useState({
    paymentMethod: 'cash',
    notes: ''
  });
  const [loadingSales, setLoadingSales] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoadingSales(true);
      const res = await fetch('/api/sales?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await res.json();

      if (data.success) {
        // Filter only sales that don't have invoices yet
        setSales(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoadingSales(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSale) {
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          saleId: selectedSale._id,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes
        })
      });

      const data = await res.json();

      if (data.success) {
        // Navigate to the new invoice
        router.push(`/dashboard/invoices/${data.data._id}`);
      } else {
        console.error('خطأ في إنشاء الفاتورة:', data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-EG');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard/invoices')}
            className="p-2 hover:bg-gray-300 rounded-lg transition"
          >
            <ArrowRight className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">فاتورة جديدة</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {/* Select Sale */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">
              اختر المبيعة
            </label>

            {loadingSales ? (
              <div className="p-4 text-center text-gray-600">جاري التحميل...</div>
            ) : sales.length === 0 ? (
              <div className="p-4 text-center text-gray-600">
                لا توجد مبيعات متاحة
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sales.map((sale) => (
                  <div
                    key={sale._id}
                    onClick={() => setSelectedSale(sale)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedSale?._id === sale._id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">
                        رقم الفاتورة الأصلية: {sale.invoiceNumber}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(sale.total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600 text-sm">
                      <span>التاريخ: {formatDate(sale.saleDate || sale.createdAt)}</span>
                      <span>الحالة: {sale.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sale Details */}
          {selectedSale && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
              <h3 className="font-semibold text-gray-800 mb-4">تفاصيل المبيعة</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 text-sm">رقم المبيعة</p>
                  <p className="font-semibold text-gray-800">{selectedSale.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">التاريخ</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(selectedSale.saleDate || selectedSale.createdAt)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">المنتجات</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.productName}</span>
                      <span className="text-gray-600">{item.quantity}x</span>
                      <span className="text-gray-800 font-medium">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">الإجمالي:</span>
                  <span className="font-semibold text-gray-800">
                    {formatPrice(selectedSale.subtotal)}
                  </span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">الخصم:</span>
                    <span className="font-semibold text-gray-800">
                      -{formatPrice(selectedSale.discount)}
                    </span>
                  </div>
                )}
                {selectedSale.tax > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">الضريبة:</span>
                    <span className="font-semibold text-gray-800">
                      {formatPrice(selectedSale.tax)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span className="text-gray-800">المجموع:</span>
                  <span className="text-green-600">{formatPrice(selectedSale.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                طريقة الدفع
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="cash">نقد</option>
                <option value="credit">دين</option>
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="check">شيك</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                ملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="أضف أي ملاحظات بخصوص الفاتورة..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.push('/dashboard/invoices')}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-gray-800 font-semibold"
            >
              <ArrowRight className="w-5 h-5" />
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || !selectedSale}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'جاري الحفظ...' : 'إنشاء الفاتورة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
