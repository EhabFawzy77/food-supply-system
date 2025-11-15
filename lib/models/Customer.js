// lib/models/Customer.js
import mongoose from "mongoose";
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  businessName: { type: String },
  phone: { type: String, required: true },
  address: { type: String },
  taxNumber: { type: String },
  customerType: { type: String, enum: ['retail', 'wholesale'], default: 'retail' },
  currentDebt: { type: Number, default: 0 },
  creditLimit: { type: Number, default: 0 },
  creditStatus: { type: String, enum: ['active', 'suspended', 'blocked'], default: 'active' },
  paymentTerms: { type: Number, default: 30 }, // days allowed for payment
  lastPaymentDate: { type: Date },
  totalLifetimePurchases: { type: Number, default: 0 },
  totalLifetimePayments: { type: Number, default: 0 },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
