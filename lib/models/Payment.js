// lib/models/Payment.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  type: { type: String, enum: ['sale', 'purchase'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // اختياري للدفعات العامة
  referenceNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'credit', 'bank_transfer', 'check'], default: 'cash' },
  receivedFrom: { type: String }, // للمبيعات
  paidTo: { type: String }, // للمشتريات
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  checkNumber: { type: String },
  bankName: { type: String },
  notes: { type: String },
  transactionDate: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);