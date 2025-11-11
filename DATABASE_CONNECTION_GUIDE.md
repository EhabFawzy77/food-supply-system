# 🔗 دليل الربط مع قاعدة البيانات MongoDB

## 🎯 متطلبات التشغيل

### **1. تثبيت MongoDB**

#### **على Windows:**
```bash
# تحميل من: https://www.mongodb.com/try/download/community
# أو استخدام Chocolatey:
choco install mongodb-community

# بدء الخدمة:
net start MongoDB
```

#### **على Mac:**
```bash
# باستخدام Homebrew:
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### **على Linux:**
```bash
# Ubuntu/Debian:
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### **أو استخدام MongoDB Atlas (Cloud):**
```
https://www.mongodb.com/cloud/atlas
```

---

## ⚙️ إعدادات المشروع

### **1. ملف `.env.local`**

```env
# قاعدة البيانات
MONGODB_URI=mongodb://localhost:27017/food_supply_system

# للاتصال بـ MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food_supply_system

# المصادقة
JWT_SECRET=your-secret-key-change-in-production

# البيئة
NODE_ENV=development

# الـ API
NEXT_PUBLIC_API_URL=http://localhost:3010
```

### **2. التحقق من الاتصال**

```bash
# افتح terminal جديد:
cd d:\project\food-supply-system

# تأكد من تشغيل MongoDB:
mongosh  # أو mongo (في الإصدارات القديمة)

# يجب أن ترى:
test>
```

---

## 🚀 بدء المشروع

### **الخطوة 1: تثبيت المتعلقات**
```bash
npm install
```

### **الخطوة 2: التحقق من `.env.local`**
```bash
# تأكد من وجود الملف
ls .env.local

# يجب أن تراه
```

### **الخطوة 3: بدء الخادم**
```bash
npm run dev
```

### **الخطوة 4: فتح الموقع**
```
http://localhost:3010
```

---

## 📊 هيكل قاعدة البيانات

### **Collections الأساسية:**

```
food_supply_system/
├── users                    # المستخدمين
├── customers               # العملاء
├── suppliers               # الموردين
├── products                # المنتجات
├── sales                   # فواتير المبيعات
├── purchases               # فواتير المشتريات
├── stock                   # المخزون
├── stock_movements         # حركات المخزون
├── payments                # الدفعات
├── payments_received       # الدفعات المستلمة
├── expenses                # النفقات
└── settings                # الإعدادات
```

---

## 🔄 العمليات الرئيسية

### **1. المبيعات (Sales)**

```javascript
// POST /api/sales
{
  customer: "ObjectId",
  items: [
    {
      product: "ObjectId",
      quantity: 5,
      unitPrice: 100
    }
  ],
  paymentMethod: "cash", // cash, credit, bank_transfer, check
  paidAmount: 500,
  discount: 0,
  notes: "ملاحظات"
}

// ✅ العملية:
// 1. التحقق من توفر المخزون
// 2. إنشاء فاتورة مبيعات
// 3. تحديث المخزون (طرح)
// 4. تسجيل حركة المخزون
// 5. تحديث ديون العميل (إذا كان الدفع آجل)
```

### **2. المشتريات (Purchases)**

```javascript
// POST /api/purchases
{
  supplier: "ObjectId",
  items: [
    {
      product: "ObjectId",
      quantity: 10,
      unitPrice: 50,
      batchNumber: "B001",
      expiryDate: "2025-12-31"
    }
  ],
  paymentMethod: "bank_transfer",
  paidAmount: 500,
  notes: "ملاحظات"
}

// ✅ العملية:
// 1. إنشاء فاتورة مشتريات
// 2. إضافة المنتجات للمخزون
// 3. تسجيل حركة المخزون
// 4. تحديث ديون المورد (إذا كان الدفع آجل)
```

### **3. إدارة المخزون (Inventory)**

```javascript
// GET /api/inventory - جلب المخزون
{
  product: "ObjectId",
  quantity: 100,
  status: "available", // available, reserved, expired
  batchNumber: "B001",
  expiryDate: "2025-12-31"
}

// ✅ التحديثات:
// 1. عند كل مبيعة: طرح الكمية
// 2. عند كل شراء: إضافة الكمية
// 3. عند انتهاء الصلاحية: تحديث الحالة
```

---

## 🔐 أمثلة على الـ API Calls

### **1. إضافة مورد جديد**

```bash
curl -X POST http://localhost:3010/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "شركة النيل للتوريدات",
    "phone": "01012345678",
    "email": "info@nile.com",
    "address": "القاهرة",
    "taxNumber": "123-456-789"
  }'
```

### **2. إضافة عميل جديد**

```bash
curl -X POST http://localhost:3010/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أحمد محمود",
    "businessName": "سوبر ماركت النور",
    "phone": "01012345678",
    "address": "المنصورة",
    "creditLimit": 100000,
    "customerType": "wholesale"
  }'
```

### **3. إضافة منتج جديد**

```bash
curl -X POST http://localhost:3010/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أرز أبيض",
    "category": "حبوب",
    "unit": "كجم",
    "purchasePrice": 20,
    "sellingPrice": 25,
    "minStockLevel": 200,
    "supplier": "ObjectId"
  }'
```

### **4. عملية مبيعة**

```bash
curl -X POST http://localhost:3010/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "ObjectId",
    "items": [
      {
        "product": "ObjectId",
        "quantity": 5,
        "unitPrice": 25
      }
    ],
    "paymentMethod": "cash",
    "paidAmount": 125,
    "discount": 0
  }'
```

---

## ✅ قائمة الفحص قبل البدء

### **✓ المتطلبات:**
- [ ] MongoDB قيد التشغيل
- [ ] ملف `.env.local` موجود
- [ ] `npm install` تم تنفيذها
- [ ] لا توجد أخطاء في console

### **✓ الاتصال:**
- [ ] المتصفح يفتح `http://localhost:3010`
- [ ] الصفحة تحمل بدون أخطاء
- [ ] console بدون أخطاء اتصال

### **✓ العمليات:**
- [ ] يمكن إضافة مستخدم
- [ ] يمكن إضافة مورد
- [ ] يمكن إضافة عميل
- [ ] يمكن إضافة منتج
- [ ] يمكن عمل مبيعة
- [ ] يمكن عمل شراء

---

## 🐛 حل المشاكل الشائعة

### **مشكلة: "Cannot connect to MongoDB"**
```
✅ الحل:
1. تأكد من تشغيل MongoDB: mongosh
2. تحقق من MONGODB_URI في .env.local
3. تأكد من اسم قاعدة البيانات
```

### **مشكلة: "Port 3010 already in use"**
```
✅ الحل:
# قتل العملية:
lsof -i :3010
kill -9 <PID>

# أو استخدم port مختلف:
npm run dev -- -p 3011
```

### **مشكلة: "JWT_SECRET not defined"**
```
✅ الحل:
# أضف JWT_SECRET إلى .env.local
JWT_SECRET=your-secret-key
```

### **مشكلة: "Cannot find module"**
```
✅ الحل:
npm install
npm run dev
```

---

## 📈 الخطوات التالية

### **بعد البدء الناجح:**

1. **إنشاء بيانات أولية:**
   - أضف 2-3 موردين
   - أضف 2-3 عملاء
   - أضف 5-10 منتجات

2. **اختبار العمليات:**
   - سجل عملية شراء
   - تحقق من تحديث المخزون
   - سجل عملية مبيعة
   - تحقق من تحديث الديون

3. **عرض التقارير:**
   - شاهد إحصائيات المبيعات
   - شاهد تقرير المخزون
   - شاهد ديون العملاء والموردين

---

## 📚 الملفات المرجعية

| الملف | الهدف |
|------|-------|
| `lib/mongodb.js` | اتصال قاعدة البيانات |
| `lib/models/*.js` | تصاميم البيانات |
| `app/api/*/route.js` | API endpoints |
| `.env.local` | إعدادات البيئة |

---

## ✨ النتيجة

بعد متابعة هذا الدليل:
- ✅ قاعدة البيانات متصلة
- ✅ جميع العمليات تعمل
- ✅ المشروع جاهز للاستخدام

---

**تم التحديث:** نوفمبر 11, 2025  
**الحالة:** ✅ **المشروع متصل وجاهز**
