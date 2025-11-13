#!/usr/bin/env node
console.log('Starting auto-test-sales script');
import connectDB from '../lib/mongodb.js';
import Product from '../lib/models/Product.js';
import Stock from '../lib/models/Stock.js';
import Customer from '../lib/models/Customer.js';
import Sale from '../lib/models/Sale.js';
import StockMovement from '../lib/models/StockMovement.js';
import Invoice from '../lib/models/Invoice.js';

async function resetTestData(marker) {
  // remove any previous test records created by this script
  await Sale.deleteMany({ invoiceNumber: new RegExp(marker) });
  await Invoice.deleteMany({ invoiceNumber: new RegExp(marker) });
  await Product.deleteMany({ name: new RegExp(marker) });
  await Customer.deleteMany({ name: new RegExp(marker) });
  await Stock.deleteMany({ batchNumber: new RegExp(marker) });
  await StockMovement.deleteMany({ reference: new RegExp(marker) });
}

async function createProductAndStock(marker) {
  const product = await Product.create({
    name: `TEST-PROD-${marker}`,
    category: 'test',
    unit: 'pcs',
    purchasePrice: 10,
    sellingPrice: 20
  });

  await Stock.create({
    product: product._id,
    quantity: 50,
    batchNumber: `BATCH-${marker}`,
    status: 'available'
  });

  return product;
}

async function createCustomer(marker, creditLimit = 1000) {
  const customer = await Customer.create({
    name: `TEST-CUST-${marker}`,
    phone: `0100${Math.floor(Math.random()*9000)+1000}`,
    creditLimit,
    currentDebt: 0
  });
  return customer;
}

async function performSaleFlow({ invoiceNumber, customer, items, paymentMethod = 'cash', paidAmount = 0, createdBy = 'script' }) {
  // basic totals
  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const total = subtotal; // ignore tax/discount for simplicity

  // check stock availability
  for (const it of items) {
    const stocks = await Stock.find({ product: it.product, status: 'available' });
    const available = stocks.reduce((s, x) => s + x.quantity, 0);
    if (available < it.quantity) {
      throw new Error(`Insufficient stock for product ${it.product}. Available ${available}`);
    }
  }

  // credit limit check
  if (paymentMethod === 'credit') {
    const cust = await Customer.findById(customer);
    const paymentTowardsInvoice = Math.min(paidAmount, total);
    const addedDebt = Math.max(0, total - paymentTowardsInvoice);
    if ((cust.currentDebt || 0) + addedDebt > (cust.creditLimit || 0)) {
      throw new Error('Credit limit exceeded');
    }
  }

  // ensure items include total field expected by schema
  const itemsWithTotals = items.map(i => ({ ...i, total: (i.total != null) ? i.total : i.quantity * i.unitPrice }));

  const sale = await Sale.create({
    invoiceNumber,
    customer,
    items: itemsWithTotals,
    subtotal,
    total,
    paidAmount,
    paymentMethod,
    paymentStatus: paidAmount >= total ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid'),
    createdBy
  });

  // deduct stock FIFO
  for (const it of items) {
    let remaining = it.quantity;
    const stockItems = await Stock.find({ product: it.product, status: 'available' }).sort({ expiryDate: 1 });
    for (const s of stockItems) {
      if (remaining <= 0) break;
      const deduct = Math.min(s.quantity, remaining);
      await Stock.findByIdAndUpdate(s._id, { $inc: { quantity: -deduct } });
      remaining -= deduct;
      if (s.quantity - deduct === 0) {
        await Stock.findByIdAndDelete(s._id);
      }
    }

    const agg = await Stock.aggregate([{ $match: { product: it.product } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]);
    await StockMovement.create({ product: it.product, type: 'out', quantity: it.quantity, reference: invoiceNumber, referenceType: 'sale', reason: 'test sale', afterQuantity: agg[0]?.total || 0, createdBy });
  }

  // update customer debt
  const custRec = await Customer.findById(customer);
  const prevDebt = custRec ? (custRec.currentDebt || 0) : 0;
  const paymentTowardsInvoice = Math.min(paidAmount, total);
  const paymentTowardsPrevious = Math.max(0, paidAmount - paymentTowardsInvoice);
  const addedDebt = paymentMethod === 'credit' ? Math.max(0, total - paymentTowardsInvoice) : 0;
  const deltaDebt = addedDebt - paymentTowardsPrevious;
  if (deltaDebt !== 0) {
    await Customer.findByIdAndUpdate(customer, { $inc: { currentDebt: deltaDebt } });
  }

  // create invoice snapshot
  const invoice = await Invoice.create({
    invoiceNumber,
    sale: sale._id,
    customer,
    customerName: custRec.name,
    items: items.map(i => ({ product: i.product, productName: i.productName || '', quantity: i.quantity, unitPrice: i.unitPrice, total: i.quantity * i.unitPrice })),
    subtotal,
    total,
    previousDebt: prevDebt,
    totalOutstanding: Math.max(0, prevDebt + deltaDebt),
    paymentStatus: sale.paymentStatus,
    paidAmount,
    paymentMethod
  });

  return { sale, invoice };
}

async function main() {
  const marker = String(Date.now()).slice(-6);
  console.log('Attempting DB connection...');
  const start = Date.now();
  await connectDB();
  console.log('Connected to DB in', (Date.now() - start), 'ms');

  await resetTestData(marker);
  const product = await createProductAndStock(marker);
  const customer = await createCustomer(marker, 100); // low credit limit for testing

  console.log('\n--- Test 1: Cash sale (should succeed) ---');
  try {
    const res = await performSaleFlow({
      invoiceNumber: `TEST-${marker}-CASH-1`,
      customer: customer._id,
      items: [{ product: product._id, productName: product.name, quantity: 2, unitPrice: product.sellingPrice }],
      paymentMethod: 'cash',
      paidAmount: 40,
      createdBy: 'auto-test'
    });
    console.log('Cash sale result:', res.sale.invoiceNumber, 'Invoice:', res.invoice.invoiceNumber);
  } catch (e) {
    console.error('Cash sale failed:', e.message);
  }

  console.log('\n--- Test 2: Credit sale within limit (should succeed) ---');
  try {
    const res = await performSaleFlow({
      invoiceNumber: `TEST-${marker}-CREDIT-1`,
      customer: customer._id,
      items: [{ product: product._id, productName: product.name, quantity: 3, unitPrice: product.sellingPrice }],
      paymentMethod: 'credit',
      paidAmount: 0,
      createdBy: 'auto-test'
    });
    console.log('Credit sale result:', res.sale.invoiceNumber, 'Invoice outstanding:', res.invoice.totalOutstanding);
  } catch (e) {
    console.error('Credit sale failed:', e.message);
  }

  console.log('\n--- Test 3: Credit sale exceeding limit (should be rejected) ---');
  try {
    const res = await performSaleFlow({
      invoiceNumber: `TEST-${marker}-CREDIT-EXCEED`,
      customer: customer._id,
      items: [{ product: product._id, productName: product.name, quantity: 10, unitPrice: product.sellingPrice }],
      paymentMethod: 'credit',
      paidAmount: 0,
      createdBy: 'auto-test'
    });
    console.log('Credit exceed sale result (unexpected):', res.sale.invoiceNumber);
  } catch (e) {
    console.error('Expected failure:', e.message);
  }

  console.log('\nAuto-tests finished');
  process.exit(0);
}

export { main };

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
