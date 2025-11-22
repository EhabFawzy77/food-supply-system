// lib/utils/print.js
// طباعة

export const printUtils = {
  // طباعة عنصر
  printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found');
      return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>طباعة</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; direction: rtl; }
      @media print {
        body { margin: 0; }
        .no-print { display: none !important; }
      }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  },

  // طباعة الصفحة الحالية
  printPage() {
    window.print();
  }
};