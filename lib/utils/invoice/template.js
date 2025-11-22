// تنسيق الفاتورة وإنشاء HTML للطباعة

export function generateInvoiceHTML(invoice, companyInfo = {}) {
  // Defensive: ensure invoice is provided
  if (!invoice || typeof invoice !== 'object') {
    return `<!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head><meta charset="utf-8"><title>خطأ في الفاتورة</title></head>
      <body style="font-family:Arial, sans-serif;direction:rtl;text-align:right;padding:20px;">
        <h2>خطأ</h2>
        <p>لا توجد بيانات للفاتورة للطباعة.</p>
      </body>
      </html>`;
  }

  const {
    name = 'شركة توريد الأغذية',
    phone = '+20 100 000 0000',
    email = 'info@foodsupply.com',
    address = 'القاهرة، مصر',
    taxNumber = ''
  } = companyInfo;

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(price);
  };

  const items = (invoice.items || [])
    .map(
      (item, idx) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${idx + 1}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${item.productName}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${formatPrice(item.unitPrice)}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${formatPrice(item.total)}</td>
    </tr>
  `
    )
    .join('');

  const paymentStatusArabic = {
    paid: 'مدفوع',
    partial: 'جزئي',
    unpaid: 'غير مدفوع',
    overdue: 'متأخر'
  };

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>فاتورة - ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      background-color: #f5f5f5;
      direction: rtl;
      text-align: right;
      color: #333;
    }

    .page {
      width: 210mm;
      height: 297mm;
      background: white;
      margin: 10mm auto;
      padding: 20mm;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #2c3e50;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    .company-info {
      text-align: right;
      flex: 1;
    }

    .company-info h1 {
      font-size: 28px;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .company-info p {
      font-size: 11px;
      color: #555;
      margin: 2px 0;
    }

    .invoice-title {
      text-align: center;
      flex: 1;
    }

    .invoice-title h2 {
      font-size: 24px;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .invoice-number {
      font-size: 14px;
      color: #666;
      font-weight: bold;
    }

    .logo {
      width: 80px;
      height: 80px;
      background-color: #2c3e50;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
      font-weight: bold;
    }

    .invoice-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
      padding: 15px 0;
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
    }

    .detail-section {
      font-size: 12px;
    }

    .detail-section h3 {
      color: #2c3e50;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .detail-section p {
      margin: 3px 0;
      color: #555;
    }

    .detail-label {
      font-weight: bold;
      color: #333;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 12px;
    }

    table thead {
      background-color: #f8f9fa;
      border-top: 2px solid #2c3e50;
      border-bottom: 2px solid #2c3e50;
    }

    table thead th {
      padding: 12px;
      text-align: right;
      font-weight: bold;
      color: #2c3e50;
    }

    table tbody td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    table tbody tr:hover {
      background-color: #f9f9f9;
    }

    .totals {
      display: flex;
      justify-content: flex-end;
      margin: 20px 0;
    }

    .totals-section {
      width: 300px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #ddd;
      font-size: 13px;
    }

    .total-row.final {
      border-top: 2px solid #2c3e50;
      border-bottom: 2px solid #2c3e50;
      font-size: 16px;
      font-weight: bold;
      color: #2c3e50;
      padding: 12px 0;
    }

    .total-row.final .amount {
      color: #27ae60;
    }

    .payment-info {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      font-size: 12px;
      border-right: 4px solid #2c3e50;
    }

    .payment-info p {
      margin: 5px 0;
    }

    .payment-status {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: bold;
    }

    .payment-status.paid {
      background-color: #d4edda;
      color: #155724;
    }

    .payment-status.partial {
      background-color: #fff3cd;
      color: #856404;
    }

    .payment-status.unpaid {
      background-color: #f8d7da;
      color: #721c24;
    }

    .payment-status.overdue {
      background-color: #f5c6cb;
      color: #721c24;
    }

    .notes {
      background-color: #f9f9f9;
      padding: 12px;
      border-radius: 5px;
      margin: 20px 0;
      font-size: 12px;
      border-left: 3px solid #2c3e50;
    }

    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      font-size: 11px;
      color: #999;
    }

    .signature-section {
      display: flex;
      justify-content: space-between;
      margin: 30px 0;
      text-align: center;
    }

    .signature {
      width: 150px;
      border-top: 1px solid #333;
      margin-top: 40px;
      font-size: 11px;
    }

    @media print {
      body {
        background: white;
      }

      .page {
        margin: 0;
        box-shadow: none;
        padding: 0;
        page-break-after: always;
      }

      .no-print {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .page {
        width: 100%;
        height: auto;
        margin: 0;
        padding: 15mm;
      }

      .header {
        flex-direction: column-reverse;
      }

      .invoice-details {
        grid-template-columns: 1fr;
      }

      table {
        font-size: 11px;
      }

      table thead th,
      table tbody td {
        padding: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>${name}</h1>
        <p>البريد الإلكتروني: ${email}</p>
        <p>الهاتف: ${phone}</p>
        <p>العنوان: ${address}</p>
        ${taxNumber ? `<p>الرقم الضريبي: ${taxNumber}</p>` : ''}
      </div>

      <div class="invoice-title">
        <h2>فاتورة</h2>
        <p class="invoice-number">${invoice.invoiceNumber}</p>
      </div>

      <div class="logo">💼</div>
    </div>

    <!-- Invoice Details -->
    <div class="invoice-details">
      <div class="detail-section">
        <h3>بيانات العميل</h3>
        <p><span class="detail-label">الاسم:</span> ${invoice.customerName}</p>
        ${invoice.customerPhone ? `<p><span class="detail-label">الهاتف:</span> ${invoice.customerPhone}</p>` : ''}
        ${invoice.customerEmail ? `<p><span class="detail-label">البريد الإلكتروني:</span> ${invoice.customerEmail}</p>` : ''}
        ${invoice.customerAddress ? `<p><span class="detail-label">العنوان:</span> ${invoice.customerAddress}</p>` : ''}
      </div>

      <div class="detail-section">
        <h3>بيانات الفاتورة</h3>
        <p><span class="detail-label">التاريخ:</span> ${formatDate(invoice.invoiceDate)}</p>
        ${invoice.dueDate ? `<p><span class="detail-label">تاريخ الاستحقاق:</span> ${formatDate(invoice.dueDate)}</p>` : ''}
        <p><span class="detail-label">طريقة الدفع:</span> ${invoice.paymentMethod}</p>
        <p><span class="detail-label">حالة الدفع:</span> <span class="payment-status ${invoice.paymentStatus}">${paymentStatusArabic[invoice.paymentStatus]}</span></p>
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>المنتج</th>
          <th>الكمية</th>
          <th>السعر الواحد</th>
          <th>الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        ${items}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-section">
        <div class="total-row">
          <span>الإجمالي:</span>
          <span>${formatPrice(invoice.subtotal)}</span>
        </div>
        ${invoice.discount > 0 ? `
        <div class="total-row">
          <span>الخصم:</span>
          <span>-${formatPrice(invoice.discount)}</span>
        </div>
        ` : ''}
        ${invoice.tax > 0 ? `
        <div class="total-row">
          <span>الضريبة (${((invoice.tax / (invoice.subtotal - invoice.discount)) * 100).toFixed(1)}%):</span>
          <span>${formatPrice(invoice.tax)}</span>
        </div>
        ` : ''}
        <div class="total-row final">
          <span>المجموع:</span>
          <span class="amount">${formatPrice(invoice.total)}</span>
        </div>
        ${invoice.paidAmount > 0 ? `
        <div class="total-row">
          <span>المبلغ المدفوع:</span>
          <span>${formatPrice(invoice.paidAmount)}</span>
        </div>
        <div class="total-row" style="color: ${invoice.total - invoice.paidAmount > 0 ? '#e74c3c' : '#27ae60'};">
          <span>المتبقي:</span>
          <span>${formatPrice(invoice.total - invoice.paidAmount)}</span>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- Payment Info -->
    <div class="payment-info">
      <p><strong>معلومات الدفع:</strong></p>
      <p>الحالة: <span class="payment-status ${invoice.paymentStatus}">${paymentStatusArabic[invoice.paymentStatus]}</span></p>
      ${invoice.paidAmount > 0 ? `
      <p>تم دفع: ${formatPrice(invoice.paidAmount)} من أصل ${formatPrice(invoice.total)}</p>
      ` : ''}
    </div>

    ${invoice.notes ? `
    <!-- Notes -->
    <div class="notes">
      <strong>ملاحظات:</strong>
      <p>${invoice.notes}</p>
    </div>
    ` : ''}

    <!-- Signature Section -->
    <div class="signature-section">
      <div class="signature">
        <p>توقيع المستقبل</p>
      </div>
      <div class="signature">
        <p>توقيع المسؤول</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>شكراً لك على تعاملك معنا</p>
      <p>تم الطباعة في: ${new Date().toLocaleString('ar-EG')}</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

export function printInvoice(invoiceHTML) {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(invoiceHTML);
  printWindow.document.close();

  // Wait for content to load before printing
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

export function downloadInvoiceAsPDF(invoiceHTML, invoiceNumber) {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(invoiceHTML);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
  }, 250);
}
