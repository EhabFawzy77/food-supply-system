import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  batchNumber: { type: String },
  manufactureDate: { type: Date },
  expiryDate: { type: Date },
  location: { type: String }, // موقع التخزين
  status: { type: String, enum: ['available', 'reserved', 'expired'], default: 'available' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Stock || mongoose.model('Stock', StockSchema);
