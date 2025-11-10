// lib/models/Customer.js
import mongoose from "mongoose";
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  businessName: { type: String },
  phone: { type: String, required: true },
  address: { type: String },
  taxNumber: { type: String },
  creditLimit: { type: Number, default: 0 },
  currentDebt: { type: Number, default: 0 },
  customerType: { type: String, enum: ['retail', 'wholesale'], default: 'retail' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
