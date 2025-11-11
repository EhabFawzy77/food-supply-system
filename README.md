# 🍎 نظام إدارة سلسلة التوريد الغذائية

نظام متكامل لإدارة سلسلة التوريد الغذائية بالكامل - من الشراء إلى البيع مع إدارة المخزون والدفعات.

## ✨ المميزات الرئيسية

### 📊 إدارة شاملة
- ✅ إدارة **المنتجات** (إضافة + تعديل + حذف)
- ✅ إدارة **العملاء** مع حدود الائتمان
- ✅ إدارة **الموردين** مع تتبع الديون
- ✅ إدارة **المستخدمين** والأدوار

### 💰 البيع والشراء
- ✅ **تسجيل مبيعات** مع تحديث مخزون تلقائي
- ✅ **تسجيل مشتريات** مع إضافة للمخزون
- ✅ التحقق التلقائي من **توفر المخزون**
- ✅ حساب **الأرباح** تلقائياً

### 📦 المخزون
- ✅ تتبع **المخزون الحالي**
- ✅ **تنبيهات** المخزون المنخفض
- ✅ منتجات قريبة من **انتهاء الصلاحية**
- ✅ تسجيل **حركات المخزون** بالكامل

### 💳 الدفعات والديون
- ✅ تسجيل **دفعات متعددة** (كاش + شيك + بنك)
- ✅ تتبع **ديون العملاء**
- ✅ تتبع **ديون الموردين**
- ✅ تحديث الديون **تلقائياً**

### 📊 التقارير والإحصائيات
- ✅ تقارير **شاملة** للمبيعات والمشتريات
- ✅ إحصائيات **المخزون**
- ✅ تحليل **الأرباح**
- ✅ تقارير **الديون**

## 🚀 البدء السريع

### المتطلبات
- Node.js >= 18
- MongoDB (محلي أو سحابي)
- npm أو yarn

### التثبيت والتشغيل

```bash
# تثبيت المتعلقات
npm install

# تشغيل خادم التطوير
npm run dev

# سيعمل على http://localhost:3010
```

### إعداد البيانات

```bash
# 1. إنشاء ملف .env
cp .env.example .env

# 2. إعدادات قاعدة البيانات
# عدّل MONGODB_URI في .env

# 3. تشغيل التطبيق
npm run dev

# 4. أنشئ حسابك وابدأ العمل!
```

## 📁 بنية المشروع

```
food-supply-system/
├── app/
│   ├── api/              # REST API endpoints
│   │   ├── sales/       # API المبيعات
│   │   ├── purchases/   # API المشتريات
│   │   ├── customers/   # API العملاء
│   │   ├── suppliers/   # API الموردين
│   │   ├── products/    # API المنتجات
│   │   ├── payments/    # API الدفعات
│   │   └── ...
│   └── dashboard/       # صفحات لوحة التحكم
│       ├── sales/       # إدارة المبيعات
│       ├── purchases/   # إدارة المشتريات
│       ├── inventory/   # إدارة المخزون
│       ├── customers/   # إدارة العملاء
│       └── ...
├── lib/
│   ├── models/          # Mongoose schemas
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Helper functions
│   └── mongodb.js       # DB connection
├── contexts/            # React Context providers
├── components/          # Reusable UI components
└── scripts/             # Setup & utility scripts
```

## 🔧 التكنولوجيات المستخدمة

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts & graphs

### Backend
- **Next.js API Routes** - REST API
- **Node.js** - Runtime
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📚 التوثيق

جميع الملفات الموثقة متاحة في المجلد الرئيسي:

- 📄 **QUICK_START.md** - دليل البدء السريع
- 📄 **PROJECT_GUIDE.md** - دليل المشروع الشامل
- 📄 **SYSTEM_STATUS.md** - حالة النظام والجاهزية
- 📄 **.github/copilot-instructions.md** - إرشادات المطورين
- 📄 **INTERACTIVITY_FIX_REPORT.md** - إصلاح التفاعل
- 📄 **CLEANUP_SUMMARY.md** - ملخص التنظيف
- 📄 **FINAL_AUDIT_REPORT.md** - التدقيق النهائي
- 📄 **DOCUMENTATION_MAP.md** - خريطة الملفات

## 📱 الصفحات المتاحة

### لوحة التحكم
- `/dashboard` - الصفحة الرئيسية
- `/dashboard/sales` - إدارة المبيعات
- `/dashboard/purchases` - إدارة المشتريات
- `/dashboard/customers` - إدارة العملاء
- `/dashboard/suppliers` - إدارة الموردين
- `/dashboard/products` - إدارة المنتجات
- `/dashboard/users` - إدارة المستخدمين
- `/dashboard/inventory` - المخزون الحالي
- `/dashboard/payments` - الدفعات
- `/dashboard/reports` - التقارير والإحصائيات
- `/dashboard/settings` - الإعدادات

### المصادقة
- `/login` - تسجيل الدخول
- `/register` - إنشاء حساب

## 🔒 الأمان

### الحماية المطبقة
- ✅ **JWT Authentication** - توثيق آمن
- ✅ **Password Hashing** - تشفير كلمات المرور
- ✅ **No Hardcoded Data** - بدون بيانات مدرجة
- ✅ **Role-Based Access** - صلاحيات حسب الدور
- ✅ **Input Validation** - التحقق من البيانات
- ✅ **CORS Protection** - حماية CORS

## 💾 متغيرات البيئة

### ملف `.env.local` الأساسي:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/food_supply_system
# أو استخدم MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/food_supply_system

# JWT Secret (غيّره في الإنتاج!)
JWT_SECRET=your-secret-key-change-in-production

# Environment
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3010

# Server Port
PORT=3010
```

### ملاحظات مهمة:
- ✅ ملف `.env.local` يجب أن يكون في جذر المشروع
- ✅ لا تضع `.env.local` في git (مدرج في .gitignore)
- ✅ غيّر `JWT_SECRET` قبل الإنتاج لأسباب أمان
- ✅ تأكد من أن MongoDB يعمل قبل بدء التطبيق

## 🎯 حالة النظام

🟢 **جاهز 100%** للاستخدام الفعلي

### المتوفر:
- ✅ جميع عمليات CRUD (إضافة + تعديل + حذف)
- ✅ المبيعات والمشتريات
- ✅ إدارة المخزون
- ✅ الدفعات والديون
- ✅ التقارير الشاملة
- ✅ توثيق كامل

## 🗄️ إعداد قاعدة البيانات

### تثبيت MongoDB:

**على Windows:**
```powershell
# تحميل MongoDB من:
# https://www.mongodb.com/try/download/community

# أو استخدم Windows Subsystem for Linux (WSL):
# وثائق تثبيت MongoDB على WSL متاحة هنا:
# https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-database
```

**على macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**على Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### التحقق من التثبيت:
```bash
# افتح terminal جديد وشغّل:
mongosh

# يجب ترى:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017/?directConnection=true
# test>

# اكتب exit للخروج
```

### التشغيل الأول:
```bash
# 1. في terminal الأول - شغّل MongoDB
mongosh

# 2. في terminal الثاني - شغّل التطبيق
npm run dev

# 3. تفتح http://localhost:3010
# 4. ستحتاج لإنشاء حساب أولاً عبر Register
```

## 🌐 البيانات السحابية (MongoDB Atlas)

إذا أردت استخدام MongoDB Atlas بدلاً من المحلي:

1. اذهب إلى https://www.mongodb.com/cloud/atlas
2. أنشئ حساب مجاني
3. اضغط "Build a Database"
4. اختر "Shared"
5. اختر المنطقة الأقرب (أفريقيا)
6. انسخ Connection String
7. غيّر `.env.local`:
```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/food_supply_system
```

## 📊 اختبار قاعدة البيانات

```bash
# تأكد من أن MongoDB يعمل:
mongosh

# ثم جرّب API:
curl http://localhost:3010/api/products
# يجب ترى: { "success": true, "data": [] }

# إذا رأيت خطأ في الاتصال:
# تأكد من:
# 1. MongoDB يعمل (mongosh متصل)
# 2. MONGODB_URI صحيح في .env.local
# 3. قاعدة البيانات موجودة (ستُنشأ تلقائياً)
```

## 🎯 حالة النظام

🟢 **جاهز 100%** للاستخدام الفعلي

### المتوفر:
- ✅ جميع عمليات CRUD (إضافة + تعديل + حذف)
- ✅ المبيعات والمشتريات
- ✅ إدارة المخزون
- ✅ الدفعات والديون
- ✅ التقارير الشاملة
- ✅ توثيق كامل

## 🤝 المساهمة

نرحب بمساهماتك! يرجى:

1. Fork المشروع
2. إنشاء branch جديد
3. إجراء التغييرات
4. عمل commit واضح
5. عمل push والطلب دمج

## � حل المشاكل الشائعة

### ❌ "Error: connect ECONNREFUSED 127.0.0.1:27017"
**الحل:**
```bash
# تأكد من تشغيل MongoDB:
mongosh

# إذا فشل التثبيت، أعد تثبيت MongoDB:
# Windows: https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install -y mongodb-org
```

### ❌ "ERR_MODULE_NOT_FOUND: Cannot find module 'next'"
**الحل:**
```bash
# أعد تثبيت المتعلقات:
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ❌ "Port 3010 is already in use"
**الحل:**
```powershell
# على Windows:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3010).OwningProcess | Stop-Process -Force

# أو استخدم port مختلف:
npm run dev -- -p 3011
```

### ❌ "MongoServerSelectionError: connect ETIMEDOUT"
**الحل:**
- ✅ تأكد من اتصال الإنترنت (MongoDB Atlas)
- ✅ تأكد من صحة Connection String
- ✅ تأكد من أن عنوان IP مضاف في MongoDB Atlas (Network Access)

### ❌ "TypeError: Cannot read property 'map' of undefined"
**الحل:**
```bash
# تأكد من أن API يرد بيانات صحيحة:
# 1. اضغط F12 في المتصفح
# 2. انظر لـ Network tab
# 3. تحقق من response في API calls
```

### ❌ "NEXT_RUNTIME set to 'nodejs' is not supported in the pages"
**الحل:**
```bash
# ليس مشكلة في الإصدار الحالي
# إذا حدثت، حدّث Next.js:
npm install next@latest
```

## �📞 الدعم

عند وجود مشكلة:

1. تحقق من `QUICK_START.md`
2. اقرأ `DATABASE_CONNECTION_GUIDE.md`
3. اقرأ `SYSTEM_STATUS.md`
4. اقرأ توثيق المشكلة المتعلقة

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License

## 👨‍💻 المطورون

تم تطويره بواسطة: **EhabFawzy77**

## 🎉 شكر وتقدير

شكراً لاستخدامك نظام إدارة التوريدات الغذائية!

---

**آخر تحديث:** نوفمبر 11, 2025  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز للإنتاج

