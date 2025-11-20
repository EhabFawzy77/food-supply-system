'use client';

import React, { useState, useEffect } from 'react';

export default function PurchasePage({ params }) {
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/purchases/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch purchase');
        const data = await response.json();
        if (data.success) {
          setPurchase(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch purchase');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50" dir="rtl">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">جاري التحميل...</div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen p-6 bg-gray-50" dir="rtl">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">{error || 'فاتورة شراء غير موجودة'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">تفاصيل فاتورة الشراء</h1>
            <div className="text-sm text-gray-600">رقم الفاتورة: <span className="font-semibold">{purchase.invoiceNumber}</span></div>
            <div className="text-sm text-gray-600">التاريخ: <span className="font-semibold">{new Date(purchase.purchaseDate || purchase.createdAt || Date.now()).toLocaleString('ar-EG')}</span></div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{purchase.supplier?.name || 'مورد عام'}</div>
            <div className="text-sm text-gray-600">{purchase.supplier?.phone || ''}</div>
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right bg-gray-100">
                <th className="p-2">المنتج</th>
                <th className="p-2">الكمية</th>
                <th className="p-2">سعر الوحدة</th>
                <th className="p-2">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items && purchase.items.map((it, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 text-right">{it.product?.name || it.product || '—'}</td>
                  <td className="p-2 text-center">{it.quantity}</td>
                  <td className="p-2 text-center">{(it.unitPrice || it.price || 0).toLocaleString()} جنيه</td>
                  <td className="p-2 text-center">{(it.total || (it.quantity * (it.unitPrice || it.price || 0))).toLocaleString()} جنيه</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">ملاحظات</div>
            <div className="font-semibold">{purchase.notes || '—'}</div>
          </div>
          <div className="text-right">
            <div className="flex justify-between"><span className="text-gray-600">المجموع الفرعي:</span><span className="font-semibold">{(purchase.subtotal || 0).toLocaleString()} جنيه</span></div>
            <div className="flex justify-between"><span className="text-gray-600">الخصم:</span><span className="font-semibold">{(purchase.discount || 0).toLocaleString()} جنيه</span></div>
            <div className="flex justify-between"><span className="text-gray-600">الإجمالي:</span><span className="font-semibold text-green-600">{(purchase.total || 0).toLocaleString()} جنيه</span></div>
            <div className="flex justify-between"><span className="text-gray-600">المدفوع:</span><span className="font-semibold">{(purchase.paidAmount || 0).toLocaleString()} جنيه</span></div>
            <div className="flex justify-between"><span className="text-gray-600">حالة الدفع:</span><span className="font-semibold">{purchase.paymentStatus || '—'}</span></div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => window.print()} className="bg-gray-200 px-4 py-2 rounded">طباعة</button>
          <a href="/dashboard/purchases" className="bg-indigo-600 text-white px-4 py-2 rounded">رجوع</a>
        </div>
      </div>
    </div>
  );
}
