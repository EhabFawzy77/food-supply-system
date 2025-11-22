import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  customerEmail: { type: String },
  customerAddress: { type: String },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  previousDebt: { type: Number, default: 0 },
  totalOutstanding: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'unpaid', 'overdue', 'credit'],
    default: 'unpaid'
  },
  paidAmount: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit', 'bank_transfer', 'check'],
    default: 'cash'
  },
  invoiceDate: { type: Date, default: Date.now, index: true },
  dueDate: { type: Date },
  installmentPlan: {
    enabled: { type: Boolean, default: false },
    numberOfInstallments: { type: Number, default: 1 },
    installmentAmount: { type: Number, default: 0 },
    frequency: { type: String, enum: ['weekly', 'monthly', 'quarterly'], default: 'monthly' }
  },
  paymentSchedule: [{
    installmentNumber: { type: Number },
    dueDate: { type: Date },
    amount: { type: Number },
    paid: { type: Boolean, default: false },
    paidDate: { type: Date },
    paidAmount: { type: Number, default: 0 }
  }],
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  lastPaymentDate: { type: Date },
  nextPaymentDue: { type: Date },
  notes: { type: String },
  printedAt: { type: Date },
  printCount: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'invoices'
});

// Index for faster queries (invoiceNumber already has index: true in schema)
InvoiceSchema.index({ customer: 1, invoiceDate: -1 });
InvoiceSchema.index({ paymentStatus: 1, invoiceDate: -1 });
InvoiceSchema.index({ invoiceDate: -1 });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
