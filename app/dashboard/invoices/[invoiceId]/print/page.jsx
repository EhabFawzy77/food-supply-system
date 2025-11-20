'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Printer, X } from 'lucide-react';

export default function InvoicePrintPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.invoiceId;
  const [invoice, setInvoice] = useState(null);
  const [customerDebt, setCustomerDebt] = useState(0);
  const [customerDebtIsSnapshot, setCustomerDebtIsSnapshot] = useState(false);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!invoiceId) {
      console.error('Invoice ID is missing from params');
      setLoading(false);
      return;
    }

    fetchInvoice();
  }, [invoiceId]);

  // Auto-print when invoice data loads and DOM is rendered
  useEffect(() => {
    if (invoice && !loading) {
      // Wait for DOM to render
      setTimeout(() => {
        printInvoice(invoice);
      }, 500);
    }
  }, [invoice, loading]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      console.log('Fetching invoice with ID:', invoiceId);
      
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await res.json();
      console.log('Invoice fetch response:', { status: res.status, success: data.success, data: data.data, error: data.error });

      if (data.success && data.data) {
        console.log('Invoice loaded successfully:', data.data);
        setInvoice(data.data);
        setLoading(false);
        // Auto-print is now handled by useEffect watching invoice state
      } else {
        console.error('Invoice fetch error:', data);
        setLoading(false);
        const errorMessage = data.error || data.message || 'غير معروف';
        console.error(`خطأ في تحميل الفاتورة: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setLoading(false);
    }
  };

  const fetchCustomerDebt = async (customerId) => {
    try {
      if (!customerId) {
        setCustomerDebt(0);
        return;
      }

      const res = await fetch(`/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      // Read raw text first to avoid throwing on empty or invalid JSON responses
      const text = await res.text();
      if (!text) {
        // no body
        setCustomerDebt(0);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.warn('fetchCustomerDebt: invalid JSON response', parseErr);
        setCustomerDebt(0);
        return;
      }

      if (data && data.success && data.data) {
        setCustomerDebt(data.data.currentDebt || 0);
        setCustomerDebtIsSnapshot(false);
      } else {
        setCustomerDebt(0);
        setCustomerDebtIsSnapshot(false);
      }
    } catch (e) {
      console.error('Error fetching customer debt for print page:', e);
      setCustomerDebt(0);
      setCustomerDebtIsSnapshot(false);
    }
  };

  const printInvoice = async (invoiceData) => {
    if (!invoiceData) {
      return;
    }

    setPrinting(true);
    try {
      // Get the invoice content div and print it directly
      const invoiceContent = document.querySelector('.invoice-print-content');

      if (!invoiceContent) {
        console.error('Invoice content not found');
        setPrinting(false);
        return;
      }

      // open print window
      const printWindow = window.open('', '_blank');

      if (!printWindow) {
        setPrinting(false);
        return;
      }

      // copy existing page styles (link and style tags) so Tailwind / global CSS is available
      const headNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
      const headHtml = headNodes.map(n => n.outerHTML).join('\n');
      const baseTag = `<base href="${location.origin}">`;

      // minimal print overrides (keeps original styles but hides UI extras)
      const overrideStyles = `
        <style>
          @media print { .no-print { display: none !important; } }
          body { background: white; }
        </style>
      `;

      const printContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>فاتورة - ${invoiceData.invoiceNumber}</title>
          ${baseTag}
          ${headHtml}
          ${overrideStyles}
        </head>
        <body>
          ${invoiceContent.outerHTML}

          <script>
            (function(){
              // Try to scale the invoice to fit the printable viewport if it's too tall.
              const content = document.querySelector('.invoice-print-content') || document.body;

              function fitAndPrint() {
                try {
                  const pageHeight = window.innerHeight * 0.96; // leave a small margin
                  const contentHeight = content.scrollHeight;
                  const scale = Math.min(1, pageHeight / contentHeight);

                  if (scale < 1) {
                    content.style.transform = 'scale(' + scale + ')';
                    content.style.transformOrigin = 'top center';
                    // Ensure body height matches the scaled content so print area is correct
                    document.body.style.height = Math.ceil(contentHeight * scale) + 'px';
                  }
                } catch (e) {
                  // ignore measurement errors and proceed to print
                  console.error('print scale error', e);
                }

                // Give the browser a moment to layout after scaling, then print
                setTimeout(() => {
                  try { window.focus(); } catch(e){}
                  try { window.print(); } catch(e){}
                }, 250);
              }

              if (document.readyState === 'complete') fitAndPrint();
              else window.addEventListener('load', fitAndPrint);
            })();
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Small delay before printing to ensure content is loaded
      await new Promise(resolve => setTimeout(resolve, 250));
      printWindow.print();

      // Record print after user closes print dialog
      setTimeout(() => {
        recordPrint();
      }, 500);
      
      setPrinting(false);
    } catch (error) {
      console.error('Error printing:', error);
      setPrinting(false);
    }
  };

  const recordPrint = async () => {
    try {
      if (!invoiceId) {
        console.error('Invoice ID is missing');
        return;
      }

      const response = await fetch(`/api/invoices/${invoiceId}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        console.error('Print recording failed:', response.status);
      } else {
        console.log('Print recorded successfully');
      }
    } catch (error) {
      console.error('Error recording print:', error);
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

  // استخدم البيانات المحفوظة في الفاتورة مباشرة
  const getPreviousDebt = () => {
    return invoice?.previousDebt || 0;
  };

  const getInvoiceTotal = () => {
    return invoice?.total || 0;
  };

  const getTotalBeforePayment = () => {
    return getPreviousDebt() + getInvoiceTotal();
  };

  const getPaidAmount = () => {
    return invoice?.paidAmount || 0;
  };

  const getTotalOutstanding = () => {
    // totalOutstanding = previousDebt + (invoiceTotal - paidAmount)
    return invoice?.totalOutstanding || 0;
  };

  const paymentStatusArabic = {
    paid: 'مدفوع',
    partial: 'جزئي',
    unpaid: 'غير مدفوع',
    overdue: 'متأخر'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <Printer className="w-12 h-12 text-blue-600" />
          </div>
          <p className="mt-4 text-gray-600">جاري تحميل الفاتورة...</p>
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
            onClick={() => router.push('/dashboard/sales/create')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/dashboard/sales/create')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للمبيعات
          </button>

          <h1 className="text-3xl font-bold text-gray-800">طباعة الفاتورة</h1>

          <button
            onClick={() => router.push('/dashboard/invoices')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <X className="w-5 h-5" />
            إغلاق
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Invoice Content */}
          <div className="invoice-print-content p-8 md:p-12">
            {/* Company Header */}
            <div className="border-b-2 border-gray-300 pb-8 mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">فاتورة بيع</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 font-semibold text-lg">
                    مركز الدهانات
                  </p>
                  <p className="text-gray-500 text-sm">+20 100 000 0000</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-700 font-bold text-lg">
                    الفاتورة: <span className="text-blue-600">{invoice.invoiceNumber}</span>
                  </p>
                  <p className="text-gray-600">التاريخ: {formatDate(invoice.invoiceDate)}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase">العميل</h3>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-800">
                    {invoice.customerName}
                  </p>
                  {invoice.customerPhone && (
                    <p className="text-gray-600 text-sm">الهاتف: {invoice.customerPhone}</p>
                  )}
                  {invoice.customerEmail && (
                    <p className="text-gray-600 text-sm">البريد: {invoice.customerEmail}</p>
                  )}
                  {invoice.customerAddress && (
                    <p className="text-gray-600 text-sm">العنوان: {invoice.customerAddress}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase">معلومات الدفع</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">طريقة الدفع:</span>
                    <span className="font-semibold text-gray-800">
                      {invoice.paymentMethod === 'cash' ? 'كاش' : 
                       invoice.paymentMethod === 'credit' ? 'آجل' : 
                       invoice.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">حالة الدفع:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      invoice.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.paymentStatus === 'partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {paymentStatusArabic[invoice.paymentStatus]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table - Optimized for 20 items per page */}
            <div className="mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-right py-2 px-3 text-gray-700 font-bold text-sm">المنتج</th>
                    <th className="text-center py-2 px-3 text-gray-700 font-bold text-sm">الكمية</th>
                    <th className="text-right py-2 px-3 text-gray-700 font-bold text-sm">السعر</th>
                    <th className="text-right py-2 px-3 text-gray-700 font-bold text-sm">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-1.5 px-3 text-gray-800 text-xs">{item.productName}</td>
                      <td className="py-1.5 px-3 text-center text-gray-800 text-xs font-medium">{item.quantity}</td>
                      <td className="py-1.5 px-3 text-right text-gray-800 text-xs">
                        {formatPrice(item.unitPrice)}
                      </td>
                      <td className="py-1.5 px-3 text-right text-gray-800 text-xs font-semibold">
                        {formatPrice(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations and Payment Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Left - Notes (if exists) */}
              {invoice.notes && (
                <div className="lg:col-span-1 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2 text-sm">ملاحظات:</h3>
                  <p className="text-gray-700 text-xs whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {/* Right - Invoice Summary */}
              <div className={`${invoice.notes ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-2`}>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="text-gray-800 font-bold">
                    {formatPrice(invoice.subtotal)}
                  </span>
                </div>

                {invoice.discount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">الخصم:</span>
                    <span className="text-red-600 font-bold">
                      -{formatPrice(invoice.discount)}
                    </span>
                  </div>
                )}

                {invoice.tax > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">الضريبة:</span>
                    <span className="text-gray-800 font-bold">
                      {formatPrice(invoice.tax)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                  <span className="text-gray-800 font-bold">إجمالي الفاتورة:</span>
                  <span className="text-blue-600 font-bold text-lg">
                    {formatPrice(invoice.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details Section - Main Focus */}
            <div className="border-t-2 border-gray-300 pt-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">ملخص الدفع والدين</h3>
              
              {/* Debt Calculation Breakdown */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-5 border-2 border-gray-200 mb-6">
                <div className="space-y-3">
                  {/* Previous Debt */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium">الديون السابقة:</span>
                    <span className="text-red-600 font-bold text-base">
                      {formatPrice(getPreviousDebt())}
                    </span>
                  </div>

                  {/* Plus: Current Invoice */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium">+ إجمالي الفاتورة الحالية:</span>
                    <span className="text-blue-600 font-bold text-base">
                      {formatPrice(getInvoiceTotal())}
                    </span>
                  </div>

                  {/* Equals: Total Before Payment */}
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center text-sm">
                    <span className="text-gray-800 font-bold">= الإجمالي المستحق:</span>
                    <span className="text-orange-600 font-bold text-lg">
                      {formatPrice(getTotalBeforePayment())}
                    </span>
                  </div>

                  {/* Minus: Paid Amount */}
                  {getPaidAmount() > 0 && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 font-medium">- المبلغ المدفوع:</span>
                        <span className="text-green-600 font-bold text-base">
                          {formatPrice(getPaidAmount())}
                        </span>
                      </div>

                      {/* Final: Remaining Debt */}
                      <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                        <span className="text-gray-900 font-bold text-base">= الدين المتبقي:</span>
                        <span className={`font-bold text-2xl ${
                          getTotalOutstanding() > 0 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {formatPrice(getTotalOutstanding())}
                        </span>
                      </div>
                    </>
                  )}

                  {/* If no payment (unpaid) */}
                  {getPaidAmount() === 0 && (
                    <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                      <span className="text-gray-900 font-bold text-base">الدين المستحق:</span>
                      <span className="text-red-600 font-bold text-2xl">
                        {formatPrice(getTotalOutstanding())}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Paid Amount Card */}
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
                  <p className="text-gray-600 text-xs font-semibold mb-1">المبلغ المدفوع</p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatPrice(getPaidAmount())}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {invoice.paymentMethod === 'cash' ? 'كاش' : 'آجل / الجزء المدفوع'}
                  </p>
                </div>

                {/* Total Outstanding Card */}
                <div className={`rounded-lg p-4 border-2 ${
                  getTotalOutstanding() > 0 
                    ? 'bg-red-50 border-red-300' 
                    : 'bg-green-50 border-green-300'
                }`}>
                  <p className="text-gray-600 text-xs font-semibold mb-1">الدين المتبقي</p>
                  <p className={`text-xl font-bold ${
                    getTotalOutstanding() > 0 
                      ? 'text-red-700' 
                      : 'text-green-700'
                  }`}>
                    {formatPrice(getTotalOutstanding())}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {getTotalOutstanding() === 0 ? '✓ مدفوع بالكامل' : 'دين متبقي'}
                  </p>
                </div>

                {/* Payment Status Card */}
                <div className={`rounded-lg p-4 border-2 ${
                  invoice.paymentStatus === 'paid'
                    ? 'bg-green-50 border-green-300'
                    : invoice.paymentStatus === 'partial'
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-red-50 border-red-300'
                }`}>
                  <p className="text-gray-600 text-xs font-semibold mb-1">حالة الدفع</p>
                  <p className={`text-xl font-bold ${
                    invoice.paymentStatus === 'paid'
                      ? 'text-green-700'
                      : invoice.paymentStatus === 'partial'
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}>
                    {invoice.paymentStatus === 'paid' ? 'مدفوع' :
                     invoice.paymentStatus === 'partial' ? 'جزئي' :
                     'غير مدفوع'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {invoice.paymentMethod === 'cash' ? 'كاش' : 'آجل'}
                  </p>
                </div>
              </div>

              {/* Alert Box for Outstanding Debt */}
              {getTotalOutstanding() > 0 && (
                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                  <p className="text-red-800 font-bold mb-2 text-sm">⚠️ ملخص الدين المستحق:</p>
                  <p className="text-red-900 text-sm mb-2">
                    الدين الكلي على العميل <strong className="text-base">{invoice.customerName}</strong>
                  </p>
                  <p className="text-red-900 font-bold text-lg">
                    {formatPrice(getTotalOutstanding())}
                  </p>
                  {getPreviousDebt() > 0 && (
                    <p className="text-red-800 text-xs mt-2">(يتضمن {formatPrice(getPreviousDebt())} دين سابق)</p>
                  )}
                </div>
              )}

              {/* Success Message if Paid */}
              {getTotalOutstanding() === 0 && invoice.paymentStatus === 'paid' && (
                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                  <p className="text-green-800 font-bold text-sm">✓ تم دفع الفاتورة بالكامل</p>
                  <p className="text-green-700 text-sm mt-1">
                    لا يوجد دين متبقي على العميل {invoice.customerName}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 mt-8 pt-8 text-center">
              <p className="text-gray-600 text-sm">
                تم إصدار هذه الفاتورة بواسطة نظام إدارة الدهانات
              </p>
              <p className="text-gray-500 text-xs mt-2">
                {formatDate(new Date())} - تم الطباعة في
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-8 py-4 flex gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard/sales/create')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              بيع جديد
            </button>
            <button
              onClick={() => printInvoice(invoice)}
              disabled={printing}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
            >
              <Printer className="w-5 h-5" />
              {printing ? 'جاري الطباعة...' : 'طباعة مرة أخرى'}
            </button>
            <button
              onClick={() => router.push('/dashboard/invoices')}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-semibold"
            >
              الفواتير
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
