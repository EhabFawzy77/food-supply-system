# 📡 API Reference - Food Supply System

وثيقة كاملة لجميع API endpoints في النظام.

---

## 📋 جدول المحتويات

1. [Authentication](#-المصادقة)
2. [Products](#-المنتجات)
3. [Customers](#-العملاء)
4. [Suppliers](#-الموردين)
5. [Sales](#-المبيعات)
6. [Purchases](#-المشتريات)
7. [Payments](#-الدفعات)
8. [Inventory](#-المخزون)
9. [Reports](#-التقارير)
10. [Errors](#-الأخطاء)

---

## 🔐 المصادقة

### تسجيل حساب جديد
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "SecurePassword123",
  "role": "user"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### تسجيل الدخول
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "SecurePassword123"
}

Response 200:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### استخدام التوكن
```javascript
// في كل request بعد تسجيل الدخول:
const token = localStorage.getItem('authToken');

fetch('/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🏪 المنتجات

### احصل على جميع المنتجات
```http
GET /api/products
Authorization: Bearer {token}

Query Parameters:
- skip=0        # تخطي عدد المنتجات
- limit=10      # عدد المنتجات المطلوب
- search=rice   # البحث بالاسم
- sort=name     # الترتيب

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "أرز مصري",
      "description": "أرز مصري عالي الجودة",
      "category": "حبوب",
      "unit": "كيس",
      "unitSize": 50,
      "costPrice": 25,
      "sellingPrice": 35,
      "suppliers": ["507f1f77bcf86cd799439012"],
      "minimumStock": 10,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 45
}
```

### احصل على منتج واحد
```http
GET /api/products/{productId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "أرز مصري",
    ...
  }
}
```

### أضف منتج جديد
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "أرز مصري",
  "description": "أرز مصري عالي الجودة",
  "category": "حبوب",
  "unit": "كيس",
  "unitSize": 50,
  "costPrice": 25,
  "sellingPrice": 35,
  "suppliers": ["507f1f77bcf86cd799439012"],
  "minimumStock": 10
}

Response 201:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "أرز مصري",
    ...
  }
}
```

### عدّل منتج
```http
PUT /api/products/{productId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "أرز مصري محسّن",
  "sellingPrice": 40
}

Response 200:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "أرز مصري محسّن",
    "sellingPrice": 40,
    ...
  }
}
```

### احذف منتج
```http
DELETE /api/products/{productId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 👥 العملاء

### احصل على جميع العملاء
```http
GET /api/customers
Authorization: Bearer {token}

Query Parameters:
- skip=0
- limit=10
- search=محمد
- type=retail  # retail, wholesale

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "محل الفاتح",
      "type": "retail",
      "phone": "+20123456789",
      "email": "fatah@example.com",
      "address": "القاهرة",
      "creditLimit": 5000,
      "debt": 2500,
      "totalPurchases": 15000,
      "lastPurchaseDate": "2025-01-10T00:00:00Z"
    }
  ],
  "total": 120
}
```

### احصل على عميل واحد
```http
GET /api/customers/{customerId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "محل الفاتح",
    ...
  }
}
```

### أضف عميل جديد
```http
POST /api/customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "محل الفاتح",
  "type": "retail",
  "phone": "+20123456789",
  "email": "fatah@example.com",
  "address": "القاهرة",
  "creditLimit": 5000
}

Response 201:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    ...
  }
}
```

### عدّل عميل
```http
PUT /api/customers/{customerId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "creditLimit": 7000,
  "phone": "+20987654321"
}

Response 200:
{
  "success": true,
  "data": { ... }
}
```

### احذف عميل
```http
DELETE /api/customers/{customerId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

## 🏭 الموردين

### احصل على جميع الموردين
```http
GET /api/suppliers
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "مطحن النيل",
      "category": "حبوب",
      "phone": "+20234567890",
      "email": "supplier@example.com",
      "address": "الجيزة",
      "debt": 1000,
      "totalPurchases": 25000,
      "lastPurchaseDate": "2025-01-08T00:00:00Z"
    }
  ],
  "total": 30
}
```

### أضف مورد جديد
```http
POST /api/suppliers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "مطحن النيل",
  "category": "حبوب",
  "phone": "+20234567890",
  "email": "supplier@example.com",
  "address": "الجيزة",
  "paymentTerms": "net_30"
}

Response 201:
{
  "success": true,
  "data": { ... }
}
```

### عدّل مورد
```http
PUT /api/suppliers/{supplierId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "phone": "+20111111111"
}

Response 200:
{
  "success": true,
  "data": { ... }
}
```

### احذف مورد
```http
DELETE /api/suppliers/{supplierId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Supplier deleted successfully"
}
```

---

## 🛒 المبيعات

### احصل على جميع المبيعات
```http
GET /api/sales
Authorization: Bearer {token}

Query Parameters:
- skip=0
- limit=10
- startDate=2025-01-01
- endDate=2025-01-31
- status=completed  # pending, completed, cancelled

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "customerId": "507f1f77bcf86cd799439012",
      "items": [
        {
          "productId": "507f1f77bcf86cd799439013",
          "quantity": 5,
          "unitPrice": 35,
          "subtotal": 175
        }
      ],
      "total": 175,
      "paymentMethod": "cash",
      "paidAmount": 175,
      "status": "completed",
      "date": "2025-01-10T00:00:00Z"
    }
  ],
  "total": 523
}
```

### احصل على مبيعة واحدة
```http
GET /api/sales/{saleId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": { ... }
}
```

### أضف مبيعة جديدة
```http
POST /api/sales
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "507f1f77bcf86cd799439012",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "quantity": 5,
      "unitPrice": 35
    }
  ],
  "paymentMethod": "cash",
  "paidAmount": 175
}

Response 201:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "total": 175,
    "status": "completed"
  }
}
```

### احصل على إحصائيات المبيعات
```http
GET /api/sales/stats
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "totalSales": 50000,
    "totalQty": 1200,
    "totalProfit": 15000,
    "salesCount": 45,
    "avgSaleValue": 1111.11,
    "topProducts": [
      {
        "productId": "507f1f77bcf86cd799439013",
        "name": "أرز مصري",
        "quantity": 500,
        "total": 17500
      }
    ]
  }
}
```

---

## 📦 المشتريات

### احصل على جميع المشتريات
```http
GET /api/purchases
Authorization: Bearer {token}

Query Parameters:
- skip=0
- limit=10
- startDate=2025-01-01
- endDate=2025-01-31

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "supplierId": "507f1f77bcf86cd799439012",
      "items": [
        {
          "productId": "507f1f77bcf86cd799439013",
          "quantity": 100,
          "unitPrice": 25,
          "subtotal": 2500
        }
      ],
      "total": 2500,
      "paymentMethod": "check",
      "paidAmount": 2500,
      "status": "completed",
      "date": "2025-01-10T00:00:00Z"
    }
  ],
  "total": 156
}
```

### أضف مشتراة جديدة
```http
POST /api/purchases
Authorization: Bearer {token}
Content-Type: application/json

{
  "supplierId": "507f1f77bcf86cd799439012",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "quantity": 100,
      "unitPrice": 25
    }
  ],
  "paymentMethod": "check",
  "paidAmount": 2500
}

Response 201:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "total": 2500
  }
}
```

---

## 💰 الدفعات

### احصل على جميع الدفعات
```http
GET /api/payments
Authorization: Bearer {token}

Query Parameters:
- skip=0
- limit=10
- type=sale    # sale, purchase
- status=paid  # paid, pending

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "relatedId": "507f1f77bcf86cd799439012",
      "type": "sale",
      "amount": 175,
      "method": "cash",
      "status": "paid",
      "date": "2025-01-10T00:00:00Z"
    }
  ],
  "total": 234
}
```

### احصل على إحصائيات الدفعات
```http
GET /api/payments/stats
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "totalPaid": 45000,
    "totalPending": 5000,
    "paymentMethods": {
      "cash": 30000,
      "check": 10000,
      "bank": 5000
    },
    "customerDebts": 5000,
    "supplierDebts": 2000
  }
}
```

---

## 📦 المخزون

### احصل على حالة المخزون
```http
GET /api/inventory
Authorization: Bearer {token}

Query Parameters:
- skip=0
- limit=10
- lowStockOnly=false  # عرض المنخفض فقط

Response 200:
{
  "success": true,
  "data": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "name": "أرز مصري",
      "quantity": 250,
      "minimumStock": 50,
      "unit": "كيس",
      "costValue": 6250,
      "lastUpdate": "2025-01-10T00:00:00Z",
      "lowStock": false
    }
  ],
  "total": 45,
  "lowStockCount": 3
}
```

### احصل على المخزون المنخفض
```http
GET /api/stock
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "lowStockItems": [
      {
        "productId": "507f1f77bcf86cd799439013",
        "name": "أرز مصري",
        "quantity": 5,
        "minimumStock": 50,
        "missing": 45
      }
    ],
    "totalValue": 1125,
    "itemCount": 3
  }
}
```

---

## 📊 التقارير

### احصل على التقرير الشامل
```http
GET /api/reports
Authorization: Bearer {token}

Query Parameters:
- startDate=2025-01-01
- endDate=2025-01-31
- type=summary  # summary, detailed

Response 200:
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    },
    "sales": {
      "total": 50000,
      "quantity": 1200,
      "count": 45,
      "profit": 15000
    },
    "purchases": {
      "total": 30000,
      "quantity": 1000,
      "count": 15
    },
    "inventory": {
      "totalValue": 45000,
      "totalQuantity": 8500,
      "lowStockItems": 3
    },
    "payments": {
      "totalPaid": 48000,
      "totalPending": 2000,
      "customerDebts": 5000
    }
  }
}
```

### صدّر التقرير
```http
GET /api/reports/export
Authorization: Bearer {token}

Query Parameters:
- format=csv    # csv, excel, pdf
- type=sales    # sales, purchases, inventory
- startDate=2025-01-01
- endDate=2025-01-31

Response 200: (ملف مرفق)
```

---

## ⚠️ الأخطاء

### Response Format للأخطاء
```json
{
  "success": false,
  "error": "Error message",
  "message": "User-friendly message"
}
```

### Codes الشائعة

| Code | المعنى | الحل |
|------|--------|------|
| 400 | Bad Request | تحقق من بيانات الـ request |
| 401 | Unauthorized | تأكد من التوكن في Authorization header |
| 403 | Forbidden | ليس لديك صلاحية |
| 404 | Not Found | المورد غير موجود |
| 500 | Server Error | جرّب مرة أخرى أو اتصل بـ Support |

### مثال: خطأ Authentication
```json
{
  "success": false,
  "error": "No authorization token",
  "message": "تسجيل الدخول مطلوب"
}
```

---

## 🧪 أمثلة الاستخدام

### استخدام curl

```bash
# احصل على المنتجات
curl -X GET http://localhost:3010/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# أضف منتج
curl -X POST http://localhost:3010/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أرز",
    "sellingPrice": 35,
    "costPrice": 25
  }'
```

### استخدام JavaScript

```javascript
// احصل على البيانات
const token = localStorage.getItem('authToken');

const response = await fetch('/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

### استخدام Postman

1. أنشئ New Request
2. اختر POST وضع URL
3. اذهب إلى Headers
4. أضف:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN`
5. اذهب إلى Body وأضف JSON

---

**آخر تحديث:** نوفمبر 11, 2025  
**Version:** 1.0.0  
**Base URL:** `http://localhost:3010`
