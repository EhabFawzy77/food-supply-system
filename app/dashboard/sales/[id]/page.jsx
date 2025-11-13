import connectDB from '../../../../lib/mongodb';
import Sale from '../../../../lib/models/Sale';
import React from 'react';

export default async function SalePage({ params }) {
  try {
    await connectDB();
    const { id } = await params;
    const sale = await Sale.findById(id)
      .populate('customer')
      .populate('items.product')
      .lean();

    if (!sale) {
      return (
        <div className="min-h-screen p-6 bg-gray-50" dir="rtl">
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">فاتورة غير موجودة</div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">تفاصيل الفاتورة</h1>
              <div className="text-sm text-gray-600">رقم الفاتورة: <span className="font-semibold">{sale.invoiceNumber}</span></div>
              <div className="text-sm text-gray-600">التاريخ: <span className="font-semibold">{new Date(sale.saleDate || sale.createdAt || Date.now()).toLocaleString('ar-EG')}</span></div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{sale.customer?.name || 'عميل عام'}</div>
              <div className="text-sm text-gray-600">{sale.customer?.phone || ''}</div>
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
                {sale.items && sale.items.map((it, idx) => (
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
              <div className="font-semibold">{sale.notes || '—'}</div>
            </div>
            <div className="text-right">
              <div className="flex justify-between"><span className="text-gray-600">المجموع الفرعي:</span><span className="font-semibold">{(sale.subtotal || 0).toLocaleString()} جنيه</span></div>
              <div className="flex justify-between"><span className="text-gray-600">الخصم:</span><span className="font-semibold">{(sale.discount || 0).toLocaleString()} جنيه</span></div>
              <div className="flex justify-between"><span className="text-gray-600">الإجمالي:</span><span className="font-semibold text-green-600">{(sale.total || 0).toLocaleString()} جنيه</span></div>
              <div className="flex justify-between"><span className="text-gray-600">المدفوع:</span><span className="font-semibold">{(sale.paidAmount || 0).toLocaleString()} جنيه</span></div>
              <div className="flex justify-between"><span className="text-gray-600">حالة الدفع:</span><span className="font-semibold">{sale.paymentStatus || '—'}</span></div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => window.print()} className="bg-gray-200 px-4 py-2 rounded">طباعة</button>
            <a href="/dashboard/sales" className="bg-indigo-600 text-white px-4 py-2 rounded">رجوع</a>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading sale page', error);
    return (
      <div className="min-h-screen p-6 bg-gray-50" dir="rtl">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">حدث خطأ أثناء جلب الفاتورة</div>
      </div>
    );
  }
}
