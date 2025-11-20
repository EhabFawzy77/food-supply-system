// scripts/seed.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// استيراد الموديلات
import User from "../lib/models/User.js";
import Product from "../lib/models/Product.js";
import Customer from "../lib/models/Customer.js";
import Supplier from "../lib/models/Supplier.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/paint_center_system";

async function seedDatabase() {
  try {
    console.log("🔌 الاتصال بقاعدة البيانات...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ تم الاتصال بنجاح");

    console.log("🗑️  مسح البيانات القديمة...");
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Customer.deleteMany({}),
      Supplier.deleteMany({}),
    ]);
    console.log("✅ تم حذف البيانات القديمة");

    // 🔑 إنشاء المستخدمين
    console.log("👥 إنشاء المستخدمين...");
    const users = [
      {
        fullName: 'مدير النظام',
        username: 'admin',
        email: 'admin@paintcenter.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        fullName: 'مستخدم تجريبي',
        username: 'user',
        email: 'user@paintcenter.com',
        password: 'user123',
        role: 'user'
      }
    ];

    for (const user of users) {
      await User.create(user);
    }
    console.log(`✅ تم إنشاء ${users.length} مستخدم`);

    // 🚚 الموردين
    console.log("🚚 إنشاء الموردين...");
    const suppliers = [
      {
        name: "شركة الدهانات الوطنية",
        phone: "+20 100 123 4567",
        email: "info@nationalpaint.com",
        address: "شارع الهرم، الجيزة، مصر"
      },
      {
        name: "مورد مواد البناء الممتاز",
        phone: "+20 101 234 5678",
        email: "sales@buildmaterials.com",
        address: "مدينة نصر، القاهرة، مصر"
      }
    ];

    for (const supplier of suppliers) {
      await Supplier.create(supplier);
    }
    console.log(`✅ تم إنشاء ${suppliers.length} مورد`);

    // 📦 المنتجات
    console.log("📦 إنشاء المنتجات...");
    const products = [
      // دهانات
      { name: 'دهان أبيض', category: 'دهانات', unit: 'لتر', purchasePrice: 120, sellingPrice: 150, minStockLevel: 10, image: '/products/paint-white.jpg', supplier: null },
      { name: 'دهان أزرق', category: 'دهانات', unit: 'لتر', purchasePrice: 130, sellingPrice: 160, minStockLevel: 8, image: '/products/paint-blue.jpg', supplier: null },
      { name: 'دهان أحمر', category: 'دهانات', unit: 'لتر', purchasePrice: 125, sellingPrice: 155, minStockLevel: 8, image: '/products/paint-red.jpg', supplier: null },
      { name: 'دهان أخضر', category: 'دهانات', unit: 'لتر', purchasePrice: 128, sellingPrice: 158, minStockLevel: 8, image: '/products/paint-white.jpg', supplier: null },
      { name: 'دهان أصفر', category: 'دهانات', unit: 'لتر', purchasePrice: 122, sellingPrice: 152, minStockLevel: 8, image: '/products/paint-blue.jpg', supplier: null },
      { name: 'دهان أسود', category: 'دهانات', unit: 'لتر', purchasePrice: 135, sellingPrice: 165, minStockLevel: 6, image: '/products/paint-red.jpg', supplier: null },
      { name: 'دهان بني', category: 'دهانات', unit: 'لتر', purchasePrice: 140, sellingPrice: 170, minStockLevel: 6, image: '/products/paint-white.jpg', supplier: null },

      // أدوات الطلاء
      { name: 'فرشاة طلاء كبيرة', category: 'أدوات', unit: 'قطعة', purchasePrice: 20, sellingPrice: 25, minStockLevel: 20, image: '/products/brush.jpg', supplier: null },
      { name: 'فرشاة طلاء متوسطة', category: 'أدوات', unit: 'قطعة', purchasePrice: 15, sellingPrice: 20, minStockLevel: 25, image: '/products/brush.jpg', supplier: null },
      { name: 'فرشاة طلاء صغيرة', category: 'أدوات', unit: 'قطعة', purchasePrice: 10, sellingPrice: 15, minStockLevel: 30, image: '/products/brush.jpg', supplier: null },
      { name: 'رول طلاء كبير', category: 'أدوات', unit: 'قطعة', purchasePrice: 25, sellingPrice: 35, minStockLevel: 15, image: '/products/roller.jpg', supplier: null },
      { name: 'رول طلاء متوسط', category: 'أدوات', unit: 'قطعة', purchasePrice: 20, sellingPrice: 28, minStockLevel: 20, image: '/products/roller.jpg', supplier: null },

      // مواد كيميائية
      { name: 'مذيب طلاء', category: 'مواد كيميائية', unit: 'لتر', purchasePrice: 35, sellingPrice: 45, minStockLevel: 12, image: '/products/paint-white.jpg', supplier: null },
      { name: 'طبقة أساس', category: 'مواد كيميائية', unit: 'لتر', purchasePrice: 95, sellingPrice: 120, minStockLevel: 8, image: '/products/paint-blue.jpg', supplier: null },
      { name: 'ورنيش شفاف', category: 'مواد كيميائية', unit: 'لتر', purchasePrice: 150, sellingPrice: 180, minStockLevel: 5, image: '/products/paint-red.jpg', supplier: null },
      { name: 'ورنيش ملون', category: 'مواد كيميائية', unit: 'لتر', purchasePrice: 160, sellingPrice: 190, minStockLevel: 5, image: '/products/paint-white.jpg', supplier: null },

      // مواد إضافية
      { name: 'شريط لاصق مقاوم للطلاء', category: 'أدوات', unit: 'رول', purchasePrice: 8, sellingPrice: 12, minStockLevel: 50, image: '/products/brush.jpg', supplier: null },
      { name: 'قفازات واقية', category: 'أدوات', unit: 'زوج', purchasePrice: 3, sellingPrice: 5, minStockLevel: 100, image: '/products/roller.jpg', supplier: null },
      { name: 'كيس قماش للرول', category: 'أدوات', unit: 'قطعة', purchasePrice: 2, sellingPrice: 4, minStockLevel: 200, image: '/products/paint-blue.jpg', supplier: null }
    ];

    // ربط المنتجات بالموردين
    const createdSuppliers = await Supplier.find({});
    if (createdSuppliers.length > 0) {
      products.forEach((product, index) => {
        product.supplier = createdSuppliers[index % createdSuppliers.length]._id;
      });
    }

    for (const product of products) {
      await Product.create(product);
    }
    console.log(`✅ تم إنشاء ${products.length} منتج`);

    // 👤 العملاء
    console.log("👤 إنشاء العملاء...");
    const customers = [
      { name: 'محمد أحمد', phone: '01012345678', email: 'mohamed.ahmed@email.com', address: 'شارع النيل، الجيزة', creditLimit: 5000, currentDebt: 500 },
      { name: 'أحمد علي', phone: '01123456789', email: 'ahmed.ali@email.com', address: 'مدينة نصر، القاهرة', creditLimit: 3000, currentDebt: 0 },
      { name: 'فاطمة محمود', phone: '01234567890', email: 'fatima.mahmoud@email.com', address: 'المعادي، القاهرة', creditLimit: 4000, currentDebt: 250 },
      { name: 'علي حسن', phone: '01098765432', email: 'ali.hassan@email.com', address: 'العبور، القاهرة', creditLimit: 2500, currentDebt: 150 },
      { name: 'سارة إبراهيم', phone: '01187654321', email: 'sara.ibrahim@email.com', address: 'الزمالك، القاهرة', creditLimit: 6000, currentDebt: 0 },
      { name: 'محمود سعيد', phone: '01276543210', email: 'mahmoud.saeed@email.com', address: 'شبرا، القاهرة', creditLimit: 3500, currentDebt: 300 },
      { name: 'لينا محمد', phone: '01011111111', email: 'lina.mohamed@email.com', address: 'المهندسين، الجيزة', creditLimit: 4500, currentDebt: 0 },
      { name: 'كريم عبدالله', phone: '01122222222', email: 'karim.abdullah@email.com', address: 'الهرم، الجيزة', creditLimit: 2800, currentDebt: 120 }
    ];

    for (const customer of customers) {
      await Customer.create(customer);
    }
    console.log(`✅ تم إنشاء ${customers.length} عميل`);

    // 🧾 ملخص
    console.log("\n🎉 تم تهيئة قاعدة البيانات بنجاح!");
    console.log("📋 ملخص التهيئة:");
    console.log(`   - الموردين: ${suppliers.length} مورد`);
    console.log(`   - المنتجات: ${products.length} منتج`);
    console.log(`   - العملاء: ${customers.length} عميل`);
    console.log(`   - المستخدمين: ${users.length} مستخدم`);
    console.log("\n🔐 بيانات تسجيل الدخول:");
    console.log("   👑 المدير:");
    console.log("      - اسم المستخدم: admin");
    console.log("      - كلمة المرور: admin123");
    console.log("      - البريد الإلكتروني: admin@paintcenter.com");
    console.log("   👤 المستخدم:");
    console.log("      - اسم المستخدم: user");
    console.log("      - كلمة المرور: user123");
    console.log("      - البريد الإلكتروني: user@paintcenter.com");
    console.log("\n💡 للبدء في استخدام النظام:");
    console.log("   1. تشغيل الخادم: npm run dev");
    console.log("   2. تسجيل الدخول باستخدام البيانات أعلاه");
    console.log("   3. البدء في إدارة مركز الدهانات");

    await mongoose.disconnect();
    console.log("👋 تم قطع الاتصال بقاعدة البيانات");
    process.exit(0);
  } catch (error) {
    console.error("❌ حدث خطأ:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();
