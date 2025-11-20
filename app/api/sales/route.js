// app/api/sales/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Sale from '../../../lib/models/Sale.js';
import Stock from '../../../lib/models/Stock.js';
import StockMovement from '../../../lib/models/StockMovement.js';
import Customer from '../../../lib/models/Customer.js';
import Product from '../../../lib/models/Product.js';
import Invoice from '../../../lib/models/Invoice.js';

// GET - جلب كل المبيعات
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const customer = searchParams.get('customer');
    const paymentStatus = searchParams.get('paymentStatus');

    let query = {};

    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (customer) {
      query.customer = customer;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    const sales = await Sale.find(query)
      .populate('customer')
      .populate('items.product')
      .sort({ saleDate: -1 });
    
    return NextResponse.json({ success: true, data: sales });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - إضافة عملية بيع جديدة
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Basic payload validation
    if (!body) {
      return NextResponse.json({ success: false, error: 'جسم الطلب فارغ' }, { status: 400 });
    }

    if (!body.invoiceNumber) {
      return NextResponse.json({ success: false, error: 'مطلوب رقم فاتورة (invoiceNumber)' }, { status: 400 });
    }

    if (!body.customer) {
      return NextResponse.json({ success: false, error: 'مطلوب عميل (customer)' }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'قائمة الأصناف فارغة' }, { status: 400 });
    }

    for (const [i, item] of body.items.entries()) {
      if (!item.product) {
        return NextResponse.json({ success: false, error: `العنصر ${i} يفتقد الحقل product` }, { status: 400 });
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json({ success: false, error: `العنصر ${i} يحتوي على كمية غير صالحة` }, { status: 400 });
      }
      if (typeof item.unitPrice !== 'number') {
        return NextResponse.json({ success: false, error: `العنصر ${i} يفتقد الحقل unitPrice` }, { status: 400 });
      }
      if (typeof item.total !== 'number') {
        return NextResponse.json({ success: false, error: `العنصر ${i} يفتقد الحقل total` }, { status: 400 });
      }
    }

    if (typeof body.subtotal !== 'number') {
      return NextResponse.json({ success: false, error: 'الحقل subtotal مفقود أو غير رقمي' }, { status: 400 });
    }

    if (typeof body.total !== 'number') {
      return NextResponse.json({ success: false, error: 'الحقل total مفقود أو غير رقمي' }, { status: 400 });
    }
    
    // التحقق من توفر المخزون
    for (const item of body.items) {
      const stockItems = await Stock.find({
        product: item.product,
        status: 'available'
      });
      
      const totalAvailable = stockItems.reduce((sum, s) => sum + s.quantity, 0);
      
      if (totalAvailable < item.quantity) {
        return NextResponse.json(
          { 
            success: false, 
            error: `المخزون غير كافٍ للمنتج ${item.product}. المتاح: ${totalAvailable}` 
          },
          { status: 400 }
        );
      }
    }

    const paymentMethod = body.paymentMethod || 'cash';
    let paymentStatus;

    if (paymentMethod === 'cash') {
      paymentStatus = 'paid';
    } else {
      paymentStatus = 'unpaid';
    }

    // إنشاء فاتورة البيع (Sale)
    let sale;
    try {
      sale = await Sale.create({
        ...body,
        paymentStatus,
        paymentMethod
      });
    } catch (createErr) {
      console.error('Sale.create failed:', createErr);
      const msg = createErr?.message || 'فشل إنشاء الفاتورة';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    // تحديث إجمالي المشتريات للعميل
    try {
      await Customer.findByIdAndUpdate(body.customer, {
        $inc: { totalLifetimePurchases: body.total }
      });
    } catch (updateErr) {
      console.error('Error updating customer total purchases:', updateErr);
    }
    
    // خصم من المخزون
    for (const item of body.items) {
      let remainingQuantity = item.quantity;
      
      const stockItems = await Stock.find({
        product: item.product,
        status: 'available'
      }).sort({ expiryDate: 1 });
      
      for (const stockItem of stockItems) {
        if (remainingQuantity <= 0) break;
        
        const deductQuantity = Math.min(stockItem.quantity, remainingQuantity);
        
        await Stock.findByIdAndUpdate(stockItem._id, {
          $inc: { quantity: -deductQuantity }
        });
        
        remainingQuantity -= deductQuantity;
        
        if (stockItem.quantity - deductQuantity === 0) {
          await Stock.findByIdAndDelete(stockItem._id);
        }
      }
      
      // تسجيل حركة المخزون
      const currentStock = await Stock.aggregate([
        { $match: { product: item.product } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      
      await StockMovement.create({
        product: item.product,
        type: 'out',
        quantity: item.quantity,
        reference: sale.invoiceNumber,
        referenceType: 'sale',
        reason: 'بيع للعميل',
        afterQuantity: currentStock[0]?.total || 0,
        createdBy: body.createdBy
      });
    }
    
    // جلب بيانات العميل
    const customerRecord = await Customer.findById(body.customer);
    const previousDebt = customerRecord?.currentDebt || 0;
    const grandTotal = body.total + previousDebt;

    // إنشاء فاتورة البيع
    let createdInvoice = null;
    let invoiceData = null;
    try {
      const productIds = (body.items || []).map(i => i.product).filter(Boolean);
      let productsMap = {};
      if (productIds.length > 0) {
        const prods = await Product.find({ _id: { $in: productIds } }).lean();
        productsMap = prods.reduce((m, p) => (m[p._id.toString()] = p.name, m), {});
      }

      const invoiceItems = (body.items || []).map(it => ({
        ...it,
        productName: productsMap[it.product?.toString?.()] || it.productName || 'منتج'
      }));

      invoiceData = {
        invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
        sale: sale._id,
        customer: body.customer,
        customerName: customerRecord?.name || body.customerName || 'عميل',
        customerPhone: body.customerPhone || customerRecord?.phone || '',
        customerEmail: body.customerEmail || customerRecord?.email || '',
        customerAddress: body.customerAddress || customerRecord?.address || '',
        items: invoiceItems || [],
        subtotal: body.subtotal || 0,
        tax: body.tax || 0,
        discount: body.discount || 0,
        total: body.total || 0,
        paymentStatus,
        paymentMethod,
        paidAmount: body.paidAmount || 0,
        notes: body.notes || '',
        createdBy: body.createdBy || null
      };

      createdInvoice = await Invoice.create(invoiceData);
    } catch (e) {
      console.error('Error creating invoice:', e);
    }

    // تحديث ديون العميل للآجل
    if (body.paymentMethod === 'credit') {
      let remainingPaid = body.paidAmount || 0;
      const invoiceTotal = body.total;

      // أولاً: دفع الديون السابقة
      const paidToPrevious = Math.min(remainingPaid, previousDebt);
      remainingPaid -= paidToPrevious;

      // تسجيل الدفع على الدين السابق كمبيعة منفصلة
      if (paidToPrevious > 0) {
        try {
          await Sale.create({
            invoiceNumber: `DEBT-${sale.invoiceNumber}`,
            customer: body.customer,
            items: [{
              product: null,
              productName: 'دفع دين سابق',
              quantity: 1,
              unitPrice: paidToPrevious,
              total: paidToPrevious
            }],
            subtotal: paidToPrevious,
            tax: 0,
            discount: 0,
            total: paidToPrevious,
            paymentStatus: 'paid',
            paymentMethod: body.paymentMethod,
            paidAmount: paidToPrevious,
            notes: `دفع على دين سابق مرتبط بفاتورة ${sale.invoiceNumber}`,
            createdBy: body.createdBy
          });
        } catch (err) {
          console.warn('Failed to create debt payment sale:', err.message);
        }
      }

      // ثانياً: دفع الفاتورة الحالية
      const paidToInvoice = Math.min(remainingPaid, invoiceTotal);
      remainingPaid -= paidToInvoice;
      const outstanding = invoiceTotal - paidToInvoice;

      // ثالثاً: إذا كان هناك مبلغ زائد
      const excessPayment = remainingPaid;

      // تحديث ديون العميل
      const debtChange = -paidToPrevious + outstanding - excessPayment;

      try {
        await Customer.findByIdAndUpdate(body.customer, {
          $inc: { currentDebt: debtChange }
        });
      } catch (debtErr) {
        console.error('Error updating customer debt:', debtErr);
      }

      if (invoiceData) {
        invoiceData.paidAmount = paidToInvoice;
        invoiceData.previousDebt = previousDebt - paidToPrevious;
        invoiceData.totalOutstanding = outstanding;
      }

      if (paidToInvoice >= invoiceTotal) {
        paymentStatus = 'paid';
      } else if (paidToInvoice > 0) {
        paymentStatus = 'partial';
      } else {
        paymentStatus = 'unpaid';
      }

      await Sale.findByIdAndUpdate(sale._id, {
        paymentStatus,
        paidAmount: paidToInvoice,
        total: paidToInvoice
      });

      if (createdInvoice) {
        await Invoice.findByIdAndUpdate(createdInvoice._id, {
          paymentStatus,
          paidAmount: paidToInvoice,
          previousDebt: previousDebt - paidToPrevious,
          totalOutstanding: outstanding
        });
      }
    } else {
      // للكاش: تسوية الديون
      
      // تسجيل دفع الدين السابق كمبيعة منفصلة
      if (previousDebt > 0) {
        try {
          await Sale.create({
            invoiceNumber: `DEBT-${sale.invoiceNumber}`,
            customer: body.customer,
            items: [{
              product: null,
              productName: 'دفع دين سابق (كاش)',
              quantity: 1,
              unitPrice: previousDebt,
              total: previousDebt
            }],
            subtotal: previousDebt,
            tax: 0,
            discount: 0,
            total: previousDebt,
            paymentStatus: 'paid',
            paymentMethod: 'cash',
            paidAmount: previousDebt,
            notes: `دفع دين سابق (كاش) مرتبط بفاتورة ${sale.invoiceNumber}`,
            createdBy: body.createdBy
          });
        } catch (err) {
          console.warn('Failed to create debt payment sale for cash:', err.message);
        }
      }

      if (previousDebt > 0) {
        try {
          await Customer.findByIdAndUpdate(body.customer, {
            currentDebt: 0
          });
        } catch (debtErr) {
          console.error('Error clearing customer debt:', debtErr);
        }
      }

      if (invoiceData) {
        invoiceData.paidAmount = grandTotal;
        invoiceData.previousDebt = previousDebt;
        invoiceData.totalOutstanding = 0;
        invoiceData.total = grandTotal;
      }

      await Sale.findByIdAndUpdate(sale._id, {
        paymentStatus: 'paid',
        paidAmount: grandTotal,
        total: grandTotal
      });

      if (createdInvoice) {
        await Invoice.findByIdAndUpdate(createdInvoice._id, {
          paymentStatus: 'paid',
          paidAmount: grandTotal,
          total: grandTotal,
          previousDebt: previousDebt,
          totalOutstanding: 0
        });
      }
    }

    // إعادة جلب البيانات المحدثة
    const updatedSale = await Sale.findById(sale._id);
    const updatedInvoice = createdInvoice ? await Invoice.findById(createdInvoice._id) : null;

    // حساب المبالغ للاستجابة
    let excessPayment = 0;
    let finalDebt = 0;

    if (body.paymentMethod === 'cash') {
      finalDebt = 0;
    } else {
      const paidAmount = body.paidAmount || 0;
      const totalOwed = previousDebt + body.total;
      excessPayment = Math.max(0, paidAmount - totalOwed);
      finalDebt = Math.max(0, totalOwed - paidAmount);
      if (excessPayment > 0) {
        finalDebt = -excessPayment;
      }
    }

    const responseData = {
      sale: updatedSale,
      invoice: updatedInvoice,
      paymentSummary: {
        saleAmount: body.total,
        previousDebt: previousDebt,
        grandTotal: grandTotal,
        paidAmount: body.paymentMethod === 'cash' ? grandTotal : (body.paidAmount || 0),
        excessPayment: excessPayment,
        finalDebt: finalDebt
      }
    };

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/sales error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}