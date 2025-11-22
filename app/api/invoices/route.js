import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Invoice from '../../../lib/models/Invoice';
import Sale from '../../../lib/models/Sale';
import Customer from '../../../lib/models/Customer';
import authenticate from '../../../lib/middleware/authenticate';
import errorHandler from '../../../lib/middleware/errorHandler';

// GET all invoices with filters
export async function GET(req) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filter = { isArchived: false };

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .sort({ invoiceDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return errorHandler(error, 'خطأ في جلب الفواتير');
  }
}

// POST create invoice
export async function POST(req) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Invoice POST received body:', body);
    
    const { 
      sale, 
      saleId,
      invoiceNumber, 
      customer,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      items,
      subtotal,
      discount,
      total,
      paymentStatus,
      paidAmount,
      paymentMethod,
      notes,
      tax
    } = body;

    // Handle two cases:
    // 1. Full invoice data sent from client (from sales page)
    // 2. Just saleId sent (from other sources)
    
    let invoiceData;

  if (sale || (invoiceNumber && customerName && items)) {
      // Case 1: Full invoice data provided
      if (!invoiceNumber || !customerName || !items) {
        return NextResponse.json({
          success: false,
          error: 'رقم الفاتورة واسم العميل والمنتجات مطلوبة'
        }, { status: 400 });
      }

      if (!customer) {
        return NextResponse.json({
          success: false,
          error: 'معرف العميل مطلوب'
        }, { status: 400 });
      }

      // Validate items structure
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'قائمة المنتجات فارغة'
        }, { status: 400 });
      }

      for (const item of items) {
        if (!item.productName || typeof item.quantity !== 'number' || typeof item.unitPrice !== 'number') {
          return NextResponse.json({
            success: false,
            error: 'بيانات المنتج غير صحيحة'
          }, { status: 400 });
        }
      }

      // Get customer's current debt and compute debt BEFORE this sale (snapshot)
      let customerRecord = null;
      try {
        customerRecord = await Customer.findById(customer);
      } catch (e) {
        console.warn('Unable to fetch customer record for previousDebt:', e);
      }

      const customerCurrent = customerRecord ? (customerRecord.currentDebt || 0) : 0;
      const addedDebt = (total || 0) - (paidAmount || 0);
      // previous debt before applying this invoice's added debt
      const prevDebt = customerCurrent;

      invoiceData = {
        invoiceNumber,
        sale: sale || saleId,
        customer: customer,
        customerName,
        customerPhone: customerPhone || '',
        customerEmail: customerEmail || '',
        customerAddress: customerAddress || '',
        items: items,
        subtotal: subtotal || 0,
        tax: tax || 0,
        discount: discount || 0,
  total: total || 0,
  previousDebt: prevDebt,
  totalOutstanding: customerCurrent + addedDebt,
        paymentStatus: paymentStatus || 'unpaid',
        paidAmount: paidAmount || 0,
        paymentMethod: paymentMethod || 'cash',
        notes: notes || '',
        createdBy: auth.userId
      };
    } else if (saleId) {
      // Case 2: Only saleId provided - fetch from sale
      const sale = await Sale.findById(saleId).populate('customer');
      if (!sale) {
        return NextResponse.json({
          success: false,
          error: 'لم يتم العثور على المبيعة'
        }, { status: 404 });
      }

      const customer = await Customer.findById(sale.customer._id);
      if (!customer) {
        return NextResponse.json({
          success: false,
          error: 'لم يتم العثور على العميل'
        }, { status: 404 });
      }

      // Generate unique invoice number if not provided
      let finalInvoiceNumber = invoiceNumber;
      if (!finalInvoiceNumber) {
        const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
        const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[1]) : 0;
        finalInvoiceNumber = `INV-${String(lastNumber + 1).padStart(6, '0')}`;
      }

      const customerCurrent = customer.currentDebt || 0;
      const addedDebt = (sale.total || 0) - (sale.paidAmount || 0);
      const prevDebt = customerCurrent;

      invoiceData = {
        invoiceNumber: finalInvoiceNumber,
        sale: saleId,
        customer: customer._id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerAddress: customer.address,
        items: sale.items.map(item => ({
          product: item.product,
          productName: item.productName || 'منتج',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        subtotal: sale.subtotal,
        tax: sale.tax || 0,
        discount: sale.discount || 0,
  total: sale.total,
  previousDebt: prevDebt,
  totalOutstanding: customerCurrent,
        paymentStatus: sale.paymentStatus,
        paidAmount: sale.paidAmount,
        paymentMethod: paymentMethod || sale.paymentMethod,
        createdBy: auth.userId
      };
    } else {
      return NextResponse.json({
        success: false,
        error: 'معرّف المبيعة أو بيانات الفاتورة مطلوبة'
      }, { status: 400 });
    }

    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();
    console.log('Invoice saved successfully:', savedInvoice._id);

    return NextResponse.json({
      success: true,
      data: savedInvoice.toObject(),
      message: 'تم إنشاء الفاتورة بنجاح'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Invoice data that failed:', invoiceData);
    return errorHandler(error, 500);
  }
}
