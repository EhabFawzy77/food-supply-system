// lib/models/Supplier.js
import mongoose from "mongoose";
const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  taxNumber: { type: String },
  currentDebt: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  lastPurchase: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);