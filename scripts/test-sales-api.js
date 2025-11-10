// scripts/test-sales-api.js
// اختبار API المبيعات للتحقق من طرق الدفع

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000'; // افتراضياً Next.js يعمل على 3000

// بيانات اختبار للمبيعات
const testSalesData = {
  cash: {
    invoiceNumber: `TEST-CASH-${Date.now()}`,
    date: new Date().toLocaleDateString('ar-EG'),
    customer: 'محل الأمل', // يجب أن يكون ObjectId في الواقع
    items: [
      {
        product: 'أرز أبيض', // يجب أن يكون ObjectId في الواقع
        name: 'أرز أبيض',
        quantity: 2,
        unitPrice: 25,
        total: 50
      }
    ],
    subtotal: 50,
    discount: 0,
    total: 50,
    paymentMethod: 'cash',
    paidAmount: 60, // أكثر من الإجمالي
    change: 10,
    notes: 'اختبار دفع كاش'
  },

  credit: {
    invoiceNumber: `TEST-CREDIT-${Date.now()}`,
    date: new Date().toLocaleDateString('ar-EG'),
    customer: 'محل الأمل', // يجب أن يكون ObjectId في الواقع
    items: [
      {
        product: 'زيت عباد الشمس', // يجب أن يكون ObjectId في الواقع
        name: 'زيت عباد الشمس',
        quantity: 1,
        unitPrice: 45,
        total: 45
      }
    ],
    subtotal: 45,
    discount: 0,
    total: 45,
    paymentMethod: 'credit',
    paidAmount: 0,
    change: 0,
    notes: 'اختبار دفع آجل'
  },

  invalidCredit: {
    invoiceNumber: `TEST-INVALID-${Date.now()}`,
    date: new Date().toLocaleDateString('ar-EG'),
    customer: 'محل الأمل',
    items: [
      {
        product: 'عسل نحل',
        name: 'عسل نحل',
        quantity: 10,
        unitPrice: 150,
        total: 1500
      }
    ],
    subtotal: 1500,
    discount: 0,
    total: 1500, // أكبر من حد الائتمان المتاح
    paymentMethod: 'credit',
    paidAmount: 0,
    change: 0,
    notes: 'اختبار دفع آجل غير صالح'
  }
};

// دالة لإرسال طلب اختبار
async function testSale(type, data) {
  console.log(`\n🧪 اختبار ${type}:`);
  console.log(`طريقة الدفع: ${data.paymentMethod}`);
  console.log(`الإجمالي: ${data.total} جنيه`);
  console.log(`المدفوع: ${data.paidAmount} جنيه`);

  try {
    const response = await fetch(`${BASE_URL}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ نجح الطلب');
      console.log('الرد:', result);
    } else {
      console.log('❌ فشل الطلب');
      console.log('الحالة:', response.status);
      console.log('الخطأ:', result.error);
    }
  } catch (error) {
    console.log('❌ خطأ في الشبكة:', error.message);
  }
}

// تشغيل الاختبارات
async function runTests() {
  console.log('🚀 بدء اختبارات API المبيعات\n');

  // التأكد من أن الخادم يعمل
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/sales`);
    if (!healthCheck.ok) {
      console.log('⚠️  تأكد من أن خادم Next.js يعمل على http://localhost:3000');
      return;
    }
  } catch (error) {
    console.log('❌ لا يمكن الوصول للخادم. تأكد من تشغيل: npm run dev');
    return;
  }

  // اختبار دفع كاش
  await testSale('دفع كاش', testSalesData.cash);

  // اختبار دفع آجل صالح
  await testSale('دفع آجل صالح', testSalesData.credit);

  // اختبار دفع آجل غير صالح (يتجاوز حد الائتمان)
  await testSale('دفع آجل غير صالح', testSalesData.invalidCredit);

  console.log('\n✨ انتهت الاختبارات');
  console.log('\n📋 ملاحظات:');
  console.log('- تأكد من وجود بيانات العملاء والمنتجات في قاعدة البيانات');
  console.log('- استخدم ObjectId صحيحة للعملاء والمنتجات بدلاً من الأسماء');
  console.log('- راقب تحديث ديون العميل في حالة الدفع الآجل');
}

// تشغيل الاختبارات إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runTests();
}

module.exports = { testSale, runTests };