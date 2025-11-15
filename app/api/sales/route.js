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
    const paymentStatus = searchParams.get('paymentStatus'); // 'paid', 'unpaid', 'partial', or null for all

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
    // Basic payload validation to provide clearer errors
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
      // سيتم تحديده بعد حساب المبالغ الفعلية
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
      // return validation messages from mongoose if present
      const msg = createErr?.message || 'فشل إنشاء الفاتورة';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
    
    // خصم من المخزون
    for (const item of body.items) {
      let remainingQuantity = item.quantity;
      
      const stockItems = await Stock.find({
        product: item.product,
        status: 'available'
      }).sort({ expiryDate: 1 }); // FIFO - أقدم صلاحية أولاً
      
      for (const stockItem of stockItems) {
        if (remainingQuantity <= 0) break;
        
        const deductQuantity = Math.min(stockItem.quantity, remainingQuantity);
        
        await Stock.findByIdAndUpdate(stockItem._id, {
          $inc: { quantity: -deductQuantity }
        });
        
        remainingQuantity -= deductQuantity;
        
        // حذف السجل إذا أصبحت الكمية صفر
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
    
    // إنشاء فاتورة البيع
    let createdInvoice = null;
    let invoiceData = null;
    try {
      const customerRecord = await Customer.findById(body.customer);

      // Enrich items with productName
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
      console.error('Error creating invoice snapshot after sale:', e);
    }

    // إعداد معلومات الدفع للاستجابة
    const customerRecord = await Customer.findById(body.customer);
    const previousDebt = customerRecord?.currentDebt || 0;
    const grandTotal = body.total + previousDebt;

    // تحديث ديون العميل للآجل
    if (body.paymentMethod === 'credit') {
      let remainingPaid = body.paidAmount || 0;
      const invoiceTotal = body.total;

      // أولاً: دفع الديون السابقة
      const paidToPrevious = Math.min(remainingPaid, previousDebt);
      remainingPaid -= paidToPrevious;

      // ثانياً: دفع الفاتورة الحالية
      const paidToInvoice = Math.min(remainingPaid, invoiceTotal);
      remainingPaid -= paidToInvoice;
      const outstanding = invoiceTotal - paidToInvoice;

      // ثالثاً: إذا كان هناك مبلغ زائد، يتم تحويله لرصيد للعميل (دين سالب)
      const excessPayment = remainingPaid;

      // تحديث ديون العميل: تقليل الديون السابقة + إضافة الديون الجديدة - المبلغ الزائد
      const debtChange = -paidToPrevious + outstanding - excessPayment;

      try {
        await Customer.findByIdAndUpdate(body.customer, {
          $inc: { currentDebt: debtChange }
        });
      } catch (debtErr) {
        console.error('Error updating customer debt:', debtErr);
      }

      // تحديث الفاتورة بالمبالغ الصحيحة (إذا تم إنشاؤها بنجاح)
      if (invoiceData) {
        invoiceData.paidAmount = paidToInvoice;
        invoiceData.previousDebt = previousDebt - paidToPrevious;
        invoiceData.totalOutstanding = outstanding;
      }

      // تحديد حالة الدفع للفاتورة والمبيع
      if (paidToInvoice >= invoiceTotal) {
        paymentStatus = 'paid';
      } else if (paidToInvoice > 0) {
        paymentStatus = 'partial';
      } else {
        paymentStatus = 'unpaid';
      }

      // تحديث حالة المبيع - للدفع الجزئي، المبلغ المدفوع هو المبيع المكتمل
      await Sale.findByIdAndUpdate(sale._id, {
        paymentStatus,
        paidAmount: paidToInvoice,
        total: paidToInvoice // تحديث إجمالي المبيع للمبلغ المدفوع فقط
      });

      // تحديث حالة الفاتورة
      if (createdInvoice) {
        await Invoice.findByIdAndUpdate(createdInvoice._id, {
          paymentStatus,
          paidAmount: paidToInvoice,
          previousDebt: previousDebt - paidToPrevious,
          totalOutstanding: outstanding
        });
      }
    } else {
      // للكاش: التحقق من الديون السابقة وتسويتها
      // الكاش يتطلب دفع المبلغ كاملاً دائماً

      // تحديث ديون العميل - تسوية جميع الديون
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
        // تحديث إجمالي الفاتورة لتشمل الديون السابقة
        invoiceData.total = grandTotal;
      }

      // تحديث المبيع
      await Sale.findByIdAndUpdate(sale._id, {
        paymentStatus: 'paid',
        paidAmount: grandTotal,
        total: grandTotal // تحديث الإجمالي للمبيع أيضاً
      });

      // تحديث الفاتورة
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
      // الكاش: دائماً يسوي كل الديون
      finalDebt = 0;
    } else {
      // الآجل: حساب الدين النهائي
      const paidAmount = body.paidAmount || 0;
      const totalOwed = previousDebt + body.total;
      excessPayment = Math.max(0, paidAmount - totalOwed);
      finalDebt = Math.max(0, totalOwed - paidAmount);
      if (excessPayment > 0) {
        finalDebt = -excessPayment; // رصيد للعميل
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
