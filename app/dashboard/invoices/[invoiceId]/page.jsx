'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Printer, Download, Trash2, Edit, Save, X } from 'lucide-react';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.invoiceId;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await res.json();

      if (data.success) {
        setInvoice(data.data);
        setNotes(data.data.notes || '');
      } else {
        console.error('خطأ في تحميل الفاتورة');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    const { generateInvoiceHTML } = await import('../../../../lib/utils/invoice/template');
    const html = generateInvoiceHTML(invoice, {
      name: 'شركة توريد الأغذية',
      phone: '+20 100 000 0000',
      email: 'info@foodsupply.com',
      address: 'القاهرة، مصر'
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      // Record print
      fetch(`/api/invoices/${invoiceId}/print`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
    }, 250);
  };

  const handleSaveNotes = async () => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      const data = await res.json();

      if (data.success) {
        setInvoice(data.data);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('هل تريد حذف هذه الفاتورة؟')) return;

    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await res.json();

      if (data.success) {
        router.push('/dashboard/invoices');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <Printer className="w-12 h-12 text-blue-600" />
          </div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-gray-600">لم يتم العثور على الفاتورة</p>
          <button
            onClick={() => router.push('/dashboard/invoices')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const paymentStatusArabic = {
    paid: 'مدفوع',
    partial: 'جزئي',
    unpaid: 'غير مدفوع',
    overdue: 'متأخر'
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/dashboard/invoices')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowRight className="w-5 h-5" />
            العودة
          </button>

          <h1 className="text-3xl font-bold text-gray-800">تفاصيل الفاتورة</h1>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Printer className="w-5 h-5" />
              طباعة
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 className="w-5 h-5" />
              حذف
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            {/* Invoice Header */}
            <div className="border-b pb-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                فاتورة رقم: {invoice.invoiceNumber}
              </h2>
              <p className="text-gray-600">
                التاريخ: {formatDate(invoice.invoiceDate)}
              </p>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">بيانات العميل</h3>
                <p className="text-gray-700">
                  <span className="font-medium">الاسم:</span> {invoice.customerName}
                </p>
                {invoice.customerPhone && (
                  <p className="text-gray-700">
                    <span className="font-medium">الهاتف:</span> {invoice.customerPhone}
                  </p>
                )}
                {invoice.customerEmail && (
                  <p className="text-gray-700">
                    <span className="font-medium">البريد:</span> {invoice.customerEmail}
                  </p>
                )}
                {invoice.customerAddress && (
                  <p className="text-gray-700">
                    <span className="font-medium">العنوان:</span> {invoice.customerAddress}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">بيانات الدفع</h3>
                <p className="text-gray-700">
                  <span className="font-medium">طريقة الدفع:</span> {invoice.paymentMethod}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">حالة الدفع:</span>{' '}
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    invoice.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : invoice.paymentStatus === 'partial'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {paymentStatusArabic[invoice.paymentStatus]}
                  </span>
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">المنتجات</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-right">المنتج</th>
                      <th className="px-4 py-2 text-center">الكمية</th>
                      <th className="px-4 py-2 text-right">السعر الواحد</th>
                      <th className="px-4 py-2 text-right">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-2">{item.productName}</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2">{formatPrice(item.unitPrice)}</td>
                        <td className="px-4 py-2">{formatPrice(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">ملاحظات</h3>
              {editing ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows="4"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditing(false);
                        setNotes(invoice.notes || '');
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                      <X className="w-4 h-4" />
                      إلغاء
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Save className="w-4 h-4" />
                      حفظ
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditing(true)}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                >
                  <p className="text-gray-700">{invoice.notes || 'لا توجد ملاحظات'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Totals */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <h3 className="font-semibold text-gray-800 text-lg mb-4 pb-4 border-b">
              الملخص
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-700">الإجمالي:</span>
                <span className="font-semibold text-gray-800">{formatPrice(invoice.subtotal)}</span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">الخصم:</span>
                  <span className="font-semibold text-gray-800">
                    -{formatPrice(invoice.discount)}
                  </span>
                </div>
              )}

              {invoice.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">الضريبة:</span>
                  <span className="font-semibold text-gray-800">{formatPrice(invoice.tax)}</span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-800">المجموع:</span>
                <span className="font-bold text-2xl text-green-600">
                  {formatPrice(invoice.total)}
                </span>
              </div>

              {(() => {
                const prevDebt = (() => {
                  if (invoice?.previousDebt !== undefined && invoice.previousDebt !== null && invoice.previousDebt >= 0) {
                    return invoice.previousDebt;
                  }
                  // Fallback للفواتير القديمة: احسب previousDebt من totalOutstanding
                  const invoiceRemaining = Math.max(0, (invoice.total || 0) - (invoice.paidAmount || 0));
                  return Math.max(0, (invoice.totalOutstanding || 0) - invoiceRemaining);
                })();
                
                const invoiceRemaining = Math.max(0, (invoice.total || 0) - (invoice.paidAmount || 0));
                const totalOutstanding = (typeof invoice.totalOutstanding === 'number')
                  ? invoice.totalOutstanding
                  : prevDebt + invoiceRemaining;

                return (
                  invoice.paidAmount > 0 && (
                    <>
                      <div className="border-t pt-3 flex justify-between">
                        <span className="text-gray-700">المبلغ المدفوع:</span>
                        <span className="font-semibold text-gray-800">
                          {formatPrice(invoice.paidAmount)}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>الديون السابقة:</span>
                          <span className="font-semibold">{formatPrice(prevDebt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>المتبقي من الفاتورة:</span>
                          <span className="font-semibold">{formatPrice(invoiceRemaining)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between mt-3">
                        <span className="text-gray-700">الإجمالي المتبقي على العميل:</span>
                        <span className={`font-semibold ${totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatPrice(totalOutstanding)}
                        </span>
                      </div>
                    </>
                  )
                );
              })()}
            </div>

            {/* Print Info */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="text-gray-600 mb-2">
                <span className="font-medium">عدد الطباعات:</span> {invoice.printCount || 0}
              </p>
              {invoice.printedAt && (
                <p className="text-gray-600">
                  <span className="font-medium">آخر طباعة:</span>{' '}
                  {formatDate(invoice.printedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
