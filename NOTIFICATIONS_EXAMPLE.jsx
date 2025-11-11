// مثال عملي: استخدام نظام الإشعارات في جميع العمليات
// انسخ هذا المثال كمرجع عند إضافة العمليات الجديدة

import { useApp } from '@/contexts/AppContext';

export default function ExampleComponent() {
  const { success, error, warning, info, addNotification } = useApp();

  // مثال 1: عملية بيع ناجحة
  const handleSuccessfulSale = async () => {
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: '123',
          total: 5000,
          items: []
        })
      });

      const result = await response.json();

      if (result.success) {
        // ✅ إشعار النجاح مع معلومات مفيدة
        success(
          `تم البيع بنجاح! الإجمالي: ${result.data.total} جنيه`,
          '✓ تم إتمام البيع',
          { duration: 4000 } // اختياري: مدة مخصصة
        );
      } else {
        // ❌ إشعار الخطأ مع الرسالة من الخادم
        error(
          result.error || 'فشل إتمام البيع',
          '❌ خطأ في البيع'
        );
      }
    } catch (err) {
      // ❌ إشعار الخطأ عند مشكلة في الاتصال
      error(
        'حدث خطأ في الاتصال بالخادم',
        '❌ خطأ في الاتصال'
      );
    }
  };

  // مثال 2: عملية حذف مع تأكيد
  const handleDelete = async (itemId) => {
    if (!window.confirm('هل تريد بالفعل حذف هذا العنصر؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        success('تم حذف العنصر بنجاح', '✓ تم الحذف');
        // إعادة تحميل البيانات
        refreshData();
      } else {
        error(result.error || 'فشل حذف العنصر', '❌ فشل الحذف');
      }
    } catch (err) {
      error('حدث خطأ في الاتصال', '❌ خطأ');
    }
  };

  // مثال 3: عملية تحديث بيانات
  const handleUpdate = async (itemId, formData) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        success('تم تحديث البيانات بنجاح', '✓ تم التحديث');
        // إعادة تحميل البيانات
        refreshData();
      } else {
        error(result.error || 'فشل تحديث البيانات', '❌ فشل التحديث');
      }
    } catch (err) {
      error('حدث خطأ في الاتصال', '❌ خطأ');
    }
  };

  // مثال 4: تنبيه للمستخدم قبل عملية حساسة
  const handleSensitiveOperation = () => {
    warning(
      'هذه العملية قد تؤثر على البيانات الأخرى',
      '⚠ تنبيه هام'
    );
  };

  // مثال 5: معلومة عامة للمستخدم
  const handleShowInfo = () => {
    info(
      'تم تحديث النظام إلى الإصدار الجديد',
      'ℹ معلومة'
    );
  };

  // مثال 6: استخدام addNotification مباشرة (للحالات المتقدمة)
  const handleCustomNotification = () => {
    addNotification({
      type: 'success',
      title: 'عملية مخصصة',
      message: 'هذا إشعار مخصص تماماً',
      duration: 6000
    });
  };

  return (
    <div className="p-6 space-y-4">
      <button onClick={handleSuccessfulSale} className="btn btn-success">
        اختبر إشعار النجاح
      </button>

      <button onClick={() => handleDelete('123')} className="btn btn-danger">
        اختبر إشعار الحذف
      </button>

      <button onClick={() => handleUpdate('123', {})} className="btn btn-info">
        اختبر إشعار التحديث
      </button>

      <button onClick={handleSensitiveOperation} className="btn btn-warning">
        اختبر إشعار التحذير
      </button>

      <button onClick={handleShowInfo} className="btn btn-info">
        اختبر إشعار المعلومة
      </button>

      <button onClick={handleCustomNotification} className="btn btn-secondary">
        اختبر الإشعار المخصص
      </button>
    </div>
  );
}

// ========================================
// نمط قياسي للعمليات - استخدم هذا كنموذج
// ========================================

export function StandardAPIPattern() {
  const { success, error, warning } = useApp();

  const apiOperation = async (endpoint, method, data) => {
    try {
      // 1. طلب API
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'GET' ? undefined : JSON.stringify(data)
      });

      const result = await response.json();

      // 2. التعامل مع النتيجة
      if (result.success) {
        // ✅ نجح - اعرض إشعار نجاح
        success(result.message || 'تمت العملية بنجاح', '✓ نجح');
        return result.data;
      } else {
        // ❌ فشل - اعرض إشعار خطأ
        error(result.error || 'حدث خطأ', '❌ خطأ');
        return null;
      }
    } catch (error) {
      // ❌ خطأ اتصال - اعرض إشعار خطأ
      error('حدث خطأ في الاتصال بالخادم', '❌ خطأ');
      return null;
    }
  };

  return { apiOperation };
}

/**
 * ملخص النمط:
 * 
 * 1. استخدم `success()` لكل عملية ناجحة ✓
 * 2. استخدم `error()` لكل عملية فاشلة ✗
 * 3. استخدم `warning()` للتنبيهات المهمة ⚠
 * 4. استخدم `info()` للمعلومات العامة ℹ
 * 
 * 5. اجعل الرسائل موجزة وواضحة
 * 6. أضف معلومات مفيدة (الكميات، الأسعار، إلخ)
 * 7. تعامل مع جميع حالات الخطأ
 * 8. لا تستخدم alert() بعد الآن
 */
