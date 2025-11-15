//lib/models/Purchase.js
import mongoose from "mongoose";
const PurchaseSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    expiryDate: { type: Date },
    batchNumber: { type: String },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['paid', 'partial', 'unpaid'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['cash', 'credit', 'bank_transfer', 'check'], default: 'cash' },
  paidAmount: { type: Number, default: 0 },
  notes: { type: String },
  purchaseDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);