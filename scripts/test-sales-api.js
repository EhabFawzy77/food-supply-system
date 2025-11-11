// scripts/test-sales-api.js
// اختبار API المبيعات للتحقق من طرق الدفع

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000'; // افتراضياً Next.js يعمل على 3000

// بيانات اختبار للمبيعات - يجب تحديثها بقيم ObjectId فعلية من قاعدة البيانات
const testSalesData = {
  cash: {
    // invoiceNumber, date, customer, items, subtotal, discount, total, paymentMethod, paidAmount, change, notes
    // يجب استخدام ObjectId فعلية للعميل والمنتجات من قاعدة البيانات
  },
  credit: {
    // بيانات اختبار دفع آجل - استخدم ObjectId فعلية
  },
  invalidCredit: {
    // بيانات اختبار غير صالحة - استخدم ObjectId فعلية
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