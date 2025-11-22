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
    const users = [];
    console.log(`⚠️  يجب إنشاء المستخدمين يدوياً عبر واجهة التطبيق أو API`);

    // 🚚 الموردين
    console.log("🚚 إنشاء الموردين...");
    const suppliers = [];
    console.log(`⚠️  يجب إنشاء الموردين يدوياً عبر واجهة التطبيق أو API`);

    // 📦 المنتجات
    console.log("📦 إنشاء المنتجات...");
    const products = [];
    console.log(`⚠️  يجب إنشاء المنتجات يدوياً عبر واجهة التطبيق أو API`);

    // 👤 العملاء
    console.log("👤 إنشاء العملاء...");
    const customers = [];
    console.log(`⚠️  يجب إنشاء العملاء يدوياً عبر واجهة التطبيق أو API`);

    // 🧾 ملخص
    console.log("\n🎉 تم تهيئة قاعدة البيانات بنجاح!");
    console.log("📋 ملخص التهيئة:");
    console.log(`   - المستخدمين: يجب إنشاؤهم يدوياً`);
    console.log(`   - الموردين: يجب إنشاؤهم يدوياً`);
    console.log(`   - المنتجات: يجب إنشاؤها يدوياً`);
    console.log(`   - العملاء: يجب إنشاؤهم يدوياً`);

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
