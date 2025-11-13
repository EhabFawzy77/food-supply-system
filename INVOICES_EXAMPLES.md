# أمثلة عملية - نظام الفواتير

## 📌 أمثلة استخدام API

### 1. جلب جميع الفواتير

**Request:**
```bash
curl -X GET "http://localhost:3010/api/invoices?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "invoiceNumber": "INV-000001",
      "customerName": "محمد الأحمد",
      "total": 5000,
      "paymentStatus": "paid",
      "invoiceDate": "2025-11-12T10:30:00.000Z",
      "printCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

### 2. البحث عن فاتورة

**Request:**
```bash
curl -X GET "http://localhost:3010/api/invoices?search=INV-000001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. فلترة حسب حالة الدفع

**Request:**
```bash
curl -X GET "http://localhost:3010/api/invoices?paymentStatus=unpaid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. إنشاء فاتورة جديدة

**Request:**
```bash
curl -X POST "http://localhost:3010/api/invoices" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "saleId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "paymentMethod": "cash",
    "notes": "تم الدفع كاملاً"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64a2c3d4e5f6g7h8i9j0k1l2",
    "invoiceNumber": "INV-000002",
    "sale": "64a1b2c3d4e5f6g7h8i9j0k1",
    "customerName": "محمد الأحمد",
    "items": [...],
    "total": 5000,
    "paymentStatus": "paid",
    "printCount": 0
  },
  "message": "تم إنشاء الفاتورة بنجاح"
}
```

---

### 5. جلب تفاصيل فاتورة واحدة

**Request:**
```bash
curl -X GET "http://localhost:3010/api/invoices/64a2c3d4e5f6g7h8i9j0k1l2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. تحديث ملاحظات الفاتورة

**Request:**
```bash
curl -X PUT "http://localhost:3010/api/invoices/64a2c3d4e5f6g7h8i9j0k1l2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "ملاحظات محدثة - عميل مهم"
  }'
```

---

### 7. تسجيل الطباعة

**Request:**
```bash
curl -X POST "http://localhost:3010/api/invoices/64a2c3d4e5f6g7h8i9j0k1l2/print" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64a2c3d4e5f6g7h8i9j0k1l2",
    "invoiceNumber": "INV-000002",
    "printCount": 1,
    "printedAt": "2025-11-12T14:45:00.000Z"
  },
  "message": "تم تسجيل الطباعة بنجاح"
}
```

---

### 8. جلب الإحصائيات

**Request:**
```bash
curl -X GET "http://localhost:3010/api/invoices/stats?period=month" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInvoices": 15,
    "totalAmount": 75000,
    "totalPaid": 50000,
    "totalDue": 25000,
    "paidCount": 10,
    "unpaidCount": 3,
    "partialCount": 2
  },
  "period": "month"
}
```

---

### 9. حذف (أرشفة) فاتورة

**Request:**
```bash
curl -X DELETE "http://localhost:3010/api/invoices/64a2c3d4e5f6g7h8i9j0k1l2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64a2c3d4e5f6g7h8i9j0k1l2",
    "isArchived": true
  },
  "message": "تم حذف الفاتورة بنجاح"
}
```

---

## 🎯 أمثلة الاستخدام من Frontend

### مثال 1: جلب الفواتير
```javascript
const fetchInvoices = async () => {
  try {
    const res = await fetch('/api/invoices?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    const data = await res.json();
    console.log(data.data); // الفواتير
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### مثال 2: إنشاء فاتورة
```javascript
const createInvoice = async (saleId) => {
  try {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        saleId,
        paymentMethod: 'cash',
        notes: 'ملاحظات'
      })
    });
    
    const data = await res.json();
    if (data.success) {
      console.log('تم إنشاء الفاتورة:', data.data._id);
      // انتقل إلى صفحة الفاتورة
      window.location.href = `/dashboard/invoices/${data.data._id}`;
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### مثال 3: طباعة الفاتورة
```javascript
import { generateInvoiceHTML } from '@/lib/utils/invoice/template';

const handlePrint = (invoice) => {
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
    // تسجيل الطباعة
    fetch(`/api/invoices/${invoice._id}/print`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
  }, 250);
};
```

### مثال 4: البحث والفلترة
```javascript
const handleSearch = async (searchTerm, status) => {
  const params = new URLSearchParams({
    search: searchTerm,
    ...(status !== 'all' && { paymentStatus: status })
  });
  
  const res = await fetch(`/api/invoices?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  
  const data = await res.json();
  setInvoices(data.data);
};
```

### مثال 5: تحديث الملاحظات
```javascript
const handleSaveNotes = async (invoiceId, newNotes) => {
  const res = await fetch(`/api/invoices/${invoiceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ notes: newNotes })
  });
  
  const data = await res.json();
  if (data.success) {
    console.log('تم تحديث الملاحظات');
    setInvoice(data.data);
  }
};
```

---

## 🎨 أمثلة على قالب الطباعة

### الإنشاء اليدوي
```javascript
import { generateInvoiceHTML } from '@/lib/utils/invoice/template';

const invoice = {
  invoiceNumber: 'INV-000001',
  customerName: 'محمد الأحمد',
  customerPhone: '01001234567',
  customerEmail: 'mohammed@example.com',
  customerAddress: 'القاهرة - مصر',
  items: [
    {
      productName: 'أرز أبيض',
      quantity: 10,
      unitPrice: 50,
      total: 500
    },
    {
      productName: 'زيت نباتي',
      quantity: 5,
      unitPrice: 100,
      total: 500
    }
  ],
  subtotal: 1000,
  tax: 200,
  discount: 50,
  total: 1150,
  paymentStatus: 'paid',
  paidAmount: 1150,
  paymentMethod: 'cash',
  notes: 'ملاحظات الفاتورة'
};

const html = generateInvoiceHTML(invoice, {
  name: 'شركة توريد الأغذية',
  phone: '+20 100 000 0000',
  email: 'info@foodsupply.com',
  address: 'القاهرة، مصر'
});

// طباعة أو عرض الـ HTML
```

---

## 🧪 اختبار سريع

### الخطوة 1: إنشاء حساب وتسجيل الدخول
```
1. اذهب إلى http://localhost:3010/login
2. أدخل بيانات المستخدم
3. ستحصل على JWT token
```

### الخطوة 2: إنشاء مبيعة
```
1. اذهب إلى /dashboard/sales/create
2. أكمل البيانات
3. احفظ المبيعة
```

### الخطوة 3: إنشاء فاتورة
```
1. اذهب إلى /dashboard/invoices
2. اضغط "فاتورة جديدة"
3. اختر المبيعة التي أنشأتها
4. اضغط "إنشاء الفاتورة"
```

### الخطوة 4: طباعة الفاتورة
```
1. من صفحة تفاصيل الفاتورة
2. اضغط زر الطباعة
3. ستفتح نافذة جديدة بقالب الطباعة
4. اضغط Ctrl+P لطباعة أو حفظ كـ PDF
```

---

## 📊 حالات الاستخدام المختلفة

### حالة 1: متجر يومي
```
- ينشئ فواتير يومية
- ينسخ الفواتير في نهاية اليوم
- يحفظها كـ PDF للأرشفة
```

### حالة 2: مجموعة عملاء مهمين
```
- يفلتر الفواتير غير المدفوعة
- ينسخ الفواتير المتأخرة
- يراقب إحصائيات الديون
```

### حالة 3: تقارير شهرية
```
- يستخدم الإحصائيات لفترات زمنية
- يتتبع الفواتير المدفوعة
- يحسب النسب المئوية للتحصيل
```

---

## 🚨 رموز الأخطاء

| الكود | الرسالة | الحل |
|------|--------|------|
| 400 | معرّف المبيعة مطلوب | تأكد من وجود saleId |
| 401 | غير مخول | تحقق من الـ token |
| 404 | لم يتم العثور على الفاتورة | تحقق من الـ ID |
| 500 | خطأ في الخادم | تحقق من سجلات الخادم |

---

**آخر تحديث:** 12 نوفمبر 2025
