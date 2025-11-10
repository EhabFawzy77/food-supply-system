// lib/models/StockMovement.js
import mongoose from "mongoose";

const StockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['in', 'out', 'adjustment'], required: true },
  quantity: { type: Number, required: true },
  reference: { type: String }, // رقم المرجع (فاتورة، إرجاع، تعديل)
  referenceType: { type: String, enum: ['sale', 'purchase', 'return', 'adjustment'] },
  reason: { type: String },
  beforeQuantity: { type: Number },
  afterQuantity: { type: Number },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.StockMovement || mongoose.model('StockMovement', StockMovementSchema);