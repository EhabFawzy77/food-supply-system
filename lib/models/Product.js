// lib/models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  unit: { type: String, required: true }, // كجم، لتر، قطعة
  purchasePrice: { type: Number, required: true }, // سعر الشراء
  sellingPrice: { type: Number, required: true }, // سعر البيع
  minStockLevel: { type: Number, default: 0 }, // الحد الأدنى للمخزون
  expiryAlert: { type: Number, default: 30 }, // تنبيه قبل انتهاء الصلاحية بـ X يوم
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
