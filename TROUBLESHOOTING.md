# 🔧 دليل حل المشاكل - Food Supply System

كل المشاكل الشائعة وحلولها بالتفصيل.

---

## 📋 جدول المحتويات
1. [مشاكل MongoDB](#مشاكل-mongodb)
2. [مشاكل التطبيق](#مشاكل-التطبيق)
3. [مشاكل الإنترفيس](#مشاكل-الإنترفيس)
4. [مشاكل الأداء](#مشاكل-الأداء)
5. [أسئلة شائعة](#أسئلة-شائعة)

---

## 🗄️ مشاكل MongoDB

### ❌ "Error: connect ECONNREFUSED 127.0.0.1:27017"

**المشكلة:**
```
MongooseError: Cannot connect to MongoDB at mongodb://localhost:27017
```

**الأسباب:**
- MongoDB لم تُشغّل
- MongoDB لم تُثبّت
- Port مختلف

**الحل:**

#### **على Windows:**
```powershell
# الطريقة 1: استخدام MongoDB Community Edition
# 1. حمّل من: https://www.mongodb.com/try/download/community
# 2. ثبّت واختر "Install MongoDB as a Service"
# 3. تأكد من Service يعمل:

Get-Service mongodb | Select-Object Name, Status

# يجب ترى: running
```

#### **على Mac:**
```bash
brew services start mongodb-community
# أو
sudo systemctl start mongod
```

#### **على Linux:**
```bash
sudo systemctl start mongod
# تحقق من الحالة:
sudo systemctl status mongod
```

**التحقق من الاتصال:**
```bash
mongosh

# يجب ترى:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017/?directConnection=true
# 
# test>  # النافذة الفعالة
```

---

### ❌ "MongoServerSelectionError: connect ETIMEDOUT"

**المشكلة:**
انتظار طويل ثم خطأ اتصال

**الأسباب:**
- اتصال الإنترنت منقطع (MongoDB Atlas)
- Connection String خاطئ
- IP Address غير مضاف

**الحل:**

**إذا كنت تستخدم MongoDB المحلي:**
```bash
# تأكد من MongoDB يعمل
mongosh

# إذا فشل، أعدّ التثبيت:
# Windows: uninstall ثم أعد تثبيت
# Mac: brew reinstall mongodb-community
# Linux: sudo apt-get install --reinstall mongodb-org
```

**إذا كنت تستخدم MongoDB Atlas:**
```env
# 1. تحقق من Connection String في .env.local
# يجب يكون بهذا الشكل:
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/food_supply_system

# 2. تأكد من:
# - USERNAME و PASSWORD صحيحان
# - IP Address مضاف في "Network Access"
# - Database اسمه food_supply_system
```

**إضافة IP Address:**
1. اذهب إلى MongoDB Atlas
2. اختر "Network Access" 
3. اضغط "ADD IP ADDRESS"
4. اختر "Allow Access from Anywhere" (للتطوير فقط)

---

### ❌ "Database drops all data after restart"

**المشكلة:**
البيانات تختفي عند إعادة تشغيل التطبيق

**الأسباب:**
- استخدام في-الذاكرة database
- خطأ في اسم Database

**الحل:**
```env
# تأكد من MONGODB_URI صحيح:
MONGODB_URI=mongodb://localhost:27017/food_supply_system
#                                       ^^^^^^^^^^^^^^
#                                       Database name

# يجب يكون نفس الاسم في كل مرة
```

---

## 🚀 مشاكل التطبيق

### ❌ "ERR_MODULE_NOT_FOUND: Cannot find module"

**المشكلة:**
```
Cannot find module 'next'
Cannot find module 'react'
```

**الحل:**
```bash
# 1. احذف المتعلقات القديمة
rm -rf node_modules
rm package-lock.json

# 2. أعد التثبيت
npm install

# 3. شغّل التطبيق
npm run dev
```

---

### ❌ "Port 3010 already in use"

**المشكلة:**
```
Error: listen EADDRINUSE: address already in use :::3010
```

**الحل:**

#### **على Windows:**
```powershell
# 1. اعرف العملية
netstat -ano | findstr :3010

# 2. اقتل العملية (غيّر PID بالرقم الفعلي)
taskkill /PID <PID> /F

# أو استخدم port مختلف:
npm run dev -- -p 3011
```

#### **على Mac/Linux:**
```bash
# 1. اعرف العملية
lsof -i :3010

# 2. اقتل العملية (غيّر PID بالرقم الفعلي)
kill -9 <PID>

# أو استخدم port مختلف:
npm run dev -- -p 3011
```

---

### ❌ "Cannot GET /api/products" (404)

**المشكلة:**
```
404 Not Found
```

**الحل:**
```bash
# 1. تأكد من API file يوجد:
# يجب يكون في: app/api/products/route.js

# 2. تأكد من MongoDB متصل:
mongosh

# 3. جرّب مع curl:
curl http://localhost:3010/api/products

# يجب ترى:
# {"success":true,"data":[]}

# 4. إذا ما في بيانات اعرضها في UI:
# - اذهب إلى /dashboard/products
# - اضغط "Add Product"
# - اضف product جديد
```

---

### ❌ "TypeError: Cannot read property 'map' of undefined"

**المشكلة:**
```
Cannot read property 'map' of undefined
  at SupplierList (suppliers/page.jsx:45)
```

**الأسباب:**
- البيانات لم تُحمّل بعد
- API أرجع خطأ
- State undefined

**الحل:**
```javascript
// ❌ خاطئ
{suppliers.map(s => <div>{s.name}</div>)}

// ✅ صحيح
{suppliers && suppliers.length > 0 ? (
  suppliers.map(s => <div>{s.name}</div>)
) : (
  <p>No suppliers</p>
)}
```

---

### ❌ "SyntaxError: Unexpected token"

**المشكلة:**
```
SyntaxError: Unexpected token < in JSON at position 0
```

**الأسباب:**
- Response ليست JSON (HTML error page)
- API فشل مع error

**الحل:**
```bash
# 1. افتح DevTools (F12)
# 2. انظر Network tab
# 3. اختبر API calls
# 4. افتح Response لتشوف الخطأ

# مثال للاختبار:
curl -X GET http://localhost:3010/api/products
```

---

## 🎨 مشاكل الإنترفيس

### ❌ "لا يظهر شيء عند الضغط على الأزرار"

**المشكلة:**
- الصفحة لا تستجيب
- البيانات لا تُحدّث

**الحل:**
```javascript
// تأكد أن الدالة تُشغّل:
const handleAdd = async () => {
  console.log("Add clicked"); // أضف log
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error("API error:", error);
      return;
    }
    
    const data = await response.json();
    console.log("Success:", data);
    await loadProducts(); // أعد التحميل
  } catch (error) {
    console.error("Error:", error);
  }
};
```

---

### ❌ "البيانات تختفي بعد Refresh"

**المشكلة:**
- إضافة منتج ثم Refresh يختفي

**الحل:**
```bash
# 1. تأكد أن البيانات تُحفظ في MongoDB
# افتح mongosh وتحقق:
mongosh
use food_supply_system
db.products.find()

# 2. إذا ما في بيانات، المشكلة في POST
# اختبر مع curl:
curl -X POST http://localhost:3010/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":100}'
```

---

### ❌ "النص مقلوب أو الترتيب غلط"

**المشكلة:**
- العربية تظهر مقلوبة أو من اليسار

**الحل:**
```html
<!-- تأكد من RTL في كل صفحة -->
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <!-- المحتوى -->
  </body>
</html>
```

---

### ❌ "الأيقونات لا تظهر"

**المشكلة:**
- Lucide icons تظهر كـ rectangles

**الحل:**
```bash
# 1. تأكد من تثبيت lucide-react
npm install lucide-react

# 2. تأكد من الاستخدام الصحيح
import { Plus, Trash2, Edit } from 'lucide-react';

// ✅ صحيح
<Plus size={20} />

// ❌ خاطئ
<Plus />
```

---

## ⚡ مشاكل الأداء

### ❌ "التطبيق بطيء جداً"

**المشكلة:**
- الصفحات تحمّل ببطء
- API calls أخذ وقت طويل

**الحل:**
```javascript
// 1. استخدم loading state
const [loading, setLoading] = useState(true);

const loadData = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    setProducts(data.data);
  } finally {
    setLoading(false);
  }
};

// 2. أضف timeout
const timeout = setTimeout(() => {
  console.error("Request timeout");
}, 5000);
```

**للتحقق:**
```bash
# افتح DevTools F12
# Network tab
# اعرف API calls time
# يجب تكون أقل من 1 ثانية
```

---

### ❌ "Memory leak عند تحميل بيانات كثيرة"

**المشكلة:**
- استهلاك memory عالي
- التطبيق يتفريز

**الحل:**
```javascript
// استخدم Pagination بدل تحميل كل شيء
const [page, setPage] = useState(1);
const PAGE_SIZE = 10;

const loadProducts = async () => {
  const response = await fetch(
    `/api/products?skip=${(page - 1) * PAGE_SIZE}&limit=${PAGE_SIZE}`
  );
  const data = await response.json();
  setProducts(data.data);
};
```

---

## ❓ أسئلة شائعة

### س: كيف أغيّر port التطبيق؟
```bash
npm run dev -- -p 3011
# الآن يعمل على port 3011
```

### س: كيف أحفظ البيانات في ملف؟
```bash
# استخدم MongoDB Backup/Restore
mongodump --db food_supply_system --out ./backup
mongorestore --db food_supply_system ./backup/food_supply_system
```

### س: كيف أمسح كل البيانات وابدأ من جديد؟
```bash
mongosh
use food_supply_system
db.dropDatabase()
# الآن قاعدة البيانات فارغة
```

### س: كيف أنسخ البيانات من MongoDB Local إلى Atlas؟
```bash
# 1. Export من Local
mongodump --db food_supply_system --out ./backup

# 2. Import إلى Atlas
mongorestore \
  --uri "mongodb+srv://user:pass@cluster.mongodb.net" \
  --db food_supply_system \
  ./backup/food_supply_system
```

### س: كيف أسجّل الأخطاء؟
```bash
# الأخطاء تُسجّل في server.log
tail -f server.log

# على Windows:
Get-Content server.log -Wait
```

### س: كيف أفعّل Debug Mode؟
```bash
# على Mac/Linux:
DEBUG=* npm run dev

# على Windows:
$env:DEBUG="*"; npm run dev
```

---

## 📞 للمساعدة الإضافية

إذا لم تجد الحل:

1. ✅ اقرأ `SYSTEM_STATUS.md`
2. ✅ اقرأ `DATABASE_CONNECTION_GUIDE.md`
3. ✅ اقرأ `PROJECT_GUIDE.md`
4. ✅ افتح DevTools (F12) وشوف الخطأ
5. ✅ اختبر APIs بـ curl أو Postman

---

**آخر تحديث:** نوفمبر 11, 2025
**الإصدار:** 1.0.0
