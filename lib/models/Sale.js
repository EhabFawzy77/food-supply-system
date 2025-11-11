import mongoose from "mongoose";
const SaleSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'unpaid', 'cancelled'],
    default: 'unpaid'
  },
  paidAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['cash', 'credit', 'bank_transfer'] },
  notes: { type: String },
  createdBy: { type: String },
  saleDate: { type: Date, default: Date.now },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Sale || mongoose.model('Sale', SaleSchema);