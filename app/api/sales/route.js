// app/api/sales/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Sale from '../../../lib/models/Sale.js';
import Stock from '../../../lib/models/Stock.js';
import StockMovement from '../../../lib/models/StockMovement.js';
import Customer from '../../../lib/models/Customer.js';

// GET - جلب كل المبيعات
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const customer = searchParams.get('customer');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    
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
    
    if (status) {
      query.paymentStatus = status;
    }
    
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
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

    // فحص حد الائتمان للعميل إذا كانت طريقة الدفع آجل
    try {
      const invoiceAmount = body.total || 0;
      const paidAmount = body.paidAmount || 0;
      const paymentTowardsInvoice = Math.min(paidAmount, invoiceAmount);
      const addedDebt = body.paymentMethod === 'credit' ? Math.max(0, invoiceAmount - paymentTowardsInvoice) : 0;

      if (body.paymentMethod === 'credit') {
        const cust = await Customer.findById(body.customer);
        if (cust) {
          const projectedDebt = (cust.currentDebt || 0) + addedDebt;
          const limit = cust.creditLimit || 0;
          if (projectedDebt > limit) {
            return NextResponse.json({ success: false, error: `تجاوز حد الائتمان للعميل. الحد: ${limit}، المجموع المتوقع: ${projectedDebt}` }, { status: 400 });
          }
        }
      }
    } catch (e) {
      console.error('Credit limit check failed:', e);
      // لا نرمي الخطأ لأن الفشل هنا لا يعني أن العملية يجب أن تتوقف، نستمر
    }
    
    // إنشاء فاتورة البيع (Sale)
    let sale;
    try {
      sale = await Sale.create(body);
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
    
    // تحديث ديون العميل في حالة الآجل
    let createdInvoice = null;
    try {
      // Fetch customer to snapshot previous debt
      const customerRecord = await Customer.findById(body.customer);
      const prevDebt = customerRecord ? (customerRecord.currentDebt || 0) : 0;

      const invoiceAmount = body.total || 0;
      const paidAmount = body.paidAmount || 0;

      // amount applied to invoice first, then remainder (if any) reduces previous debt
      const paymentTowardsInvoice = Math.min(paidAmount, invoiceAmount);
      const paymentTowardsPrevious = Math.max(0, paidAmount - paymentTowardsInvoice);

      // For credit sales, any unpaid portion of the invoice becomes added debt
      const addedDebt = body.paymentMethod === 'credit' ? Math.max(0, invoiceAmount - paymentTowardsInvoice) : 0;

      // Net change to customer's currentDebt: increase by addedDebt, decrease by paymentTowardsPrevious
      const deltaDebt = addedDebt - paymentTowardsPrevious;

      if (deltaDebt !== 0) {
        await Customer.findByIdAndUpdate(body.customer, {
          $inc: { currentDebt: deltaDebt }
        });
      }

      const newCustomerDebt = Math.max(0, prevDebt + deltaDebt);

      // Create invoice snapshot on server to ensure consistency
      const invoiceData = {
        invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
        sale: sale._id,
        customer: body.customer,
        customerName: body.customerName || '',
        customerPhone: body.customerPhone || '',
        customerEmail: body.customerEmail || '',
        customerAddress: body.customerAddress || '',
        items: body.items || [],
        subtotal: body.subtotal || 0,
        tax: body.tax || 0,
        discount: body.discount || 0,
        total: body.total || 0,
        previousDebt: prevDebt,
        totalOutstanding: newCustomerDebt,
        paymentStatus: body.paymentStatus || 'unpaid',
        paidAmount: body.paidAmount || 0,
        paymentMethod: body.paymentMethod || 'cash',
        notes: body.notes || '',
        createdBy: body.createdBy || null
      };

      const invoice = await (await import('../../../lib/models/Invoice.js')).default;
      createdInvoice = await invoice.create(invoiceData);
    } catch (e) {
      console.error('Error creating invoice snapshot after sale:', e);
      // proceed without failing the sale - return sale but with invoice null
    }

    return NextResponse.json(
      { success: true, data: { sale, invoice: createdInvoice } },
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
