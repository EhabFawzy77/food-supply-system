// lib/models/Expense.js
import mongoose from "mongoose";
const ExpenseSchema = new mongoose.Schema({
  category: { type: String, required: true }, // رواتب، كهرباء، إيجار، صيانة
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'bank_transfer', 'check'], 
    required: true 
  },
  paidTo: { type: String },
  date: { type: Date, default: Date.now },
  receipt: { type: String }, // رقم الإيصال
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

