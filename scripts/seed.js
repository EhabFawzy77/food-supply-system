// scripts/seed.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// استيراد الموديلات
import User from "../lib/models/User.js";
import Product from "../lib/models/Product.js";
import Customer from "../lib/models/Customer.js";
import Supplier from "../lib/models/Supplier.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/food_supply_system";

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
    const users = await User.create([
      {
        username: "admin",
        password: "admin123",
        fullName: "المدير العام",
        email: "admin@company.com",
        phone: "01012345678",
        role: "admin",
      },
      {
        username: "manager",
        password: "manager123",
        fullName: "أحمد محمود",
        email: "manager@company.com",
        phone: "01123456789",
        role: "manager",
      },
      {
        username: "user1",
        password: "user123",
        fullName: "محمد علي",
        email: "user@company.com",
        phone: "01234567890",
        role: "user",
      },
      {
        username: "guest",
        password: "guest123",
        fullName: "خالد حسن",
        email: "guest@company.com",
        phone: "01098765432",
        role: "guest",
      },
    ]);
    console.log(`✅ تم إنشاء ${users.length} مستخدم`);

    // 🚚 الموردين
    console.log("🚚 إنشاء الموردين...");
    const suppliers = await Supplier.create([
      {
        name: "شركة النيل للتوريدات",
        phone: "0225551234",
        email: "info@nile-supply.com",
        address: "القاهرة، مصر الجديدة",
        taxNumber: "123-456-789",
      },
      {
        name: "مؤسسة الأهرام التجارية",
        phone: "0225555678",
        email: "contact@ahram-trade.com",
        address: "الجيزة، الهرم",
        taxNumber: "987-654-321",
      },
      {
        name: "شركة الدلتا للمواد الغذائية",
        phone: "0505559999",
        email: "sales@delta-foods.com",
        address: "المنصورة، الدقهلية",
        taxNumber: "456-789-123",
      },
    ]);
    console.log(`✅ تم إنشاء ${suppliers.length} مورد`);

    // 📦 المنتجات
    console.log("📦 إنشاء المنتجات...");
    const products = await Product.create([
      {
        name: "أرز أبيض",
        category: "حبوب",
        unit: "كجم",
        purchasePrice: 20,
        sellingPrice: 25,
        minStockLevel: 200,
        supplier: suppliers[0]._id,
      },
      {
        name: "زيت عباد الشمس",
        category: "زيوت",
        unit: "لتر",
        purchasePrice: 38,
        sellingPrice: 45,
        minStockLevel: 150,
        supplier: suppliers[0]._id,
      },
      {
        name: "سكر أبيض",
        category: "سكريات",
        unit: "كجم",
        purchasePrice: 25,
        sellingPrice: 30,
        minStockLevel: 200,
        supplier: suppliers[1]._id,
      },
    ]);
    console.log(`✅ تم إنشاء ${products.length} منتج`);

    // 👤 العملاء
    console.log("👤 إنشاء العملاء...");
    const customers = await Customer.create([
      {
        name: "أحمد محمود",
        businessName: "سوبر ماركت النور",
        phone: "01012345678",
        address: "شارع النصر، المنصورة",
        taxNumber: "111-222-333",
        creditLimit: 100000,
        customerType: "wholesale",
      },
      {
        name: "محمد علي",
        businessName: "محل الأمل",
        phone: "01123456789",
        address: "شارع الجمهورية، القاهرة",
        creditLimit: 50000,
        customerType: "retail",
      },
    ]);
    console.log(`✅ تم إنشاء ${customers.length} عميل`);

    // 🧾 ملخص
    console.log("\n🎉 تم إنشاء البيانات الأولية بنجاح!");
    console.log("📋 ملخص البيانات:");
    console.log(`   - المستخدمين: ${users.length}`);
    console.log(`   - الموردين: ${suppliers.length}`);
    console.log(`   - المنتجات: ${products.length}`);
    console.log(`   - العملاء: ${customers.length}`);
    console.log("\n🔐 بيانات الدخول الافتراضية:");
    console.table([
      { المستخدم: "admin", "كلمة المرور": "admin123" },
      { المستخدم: "manager", "كلمة المرور": "manager123" },
      { المستخدم: "user1", "كلمة المرور": "user123" },
      { المستخدم: "guest", "كلمة المرور": "guest123" },
    ]);

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
