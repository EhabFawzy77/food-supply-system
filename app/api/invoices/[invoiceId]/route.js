import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Invoice from '../../../../lib/models/Invoice';
// Ensure related models are registered before calling populate()
import Customer from '../../../../lib/models/Customer';
import Product from '../../../../lib/models/Product';
import authenticate from '../../../../lib/middleware/authenticate';
import errorHandler from '../../../../lib/middleware/errorHandler';

export async function GET(req, { params }) {
  try {
    await connectDB();
    
    // Allow unauthenticated access for print purposes (invoices are customer-specific)
    // In production, consider using time-limited print tokens or adding more security
    const auth = await authenticate(req);
    // if (!auth) {
    //   return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    // }

  const { invoiceId } = await params;
  console.log('Fetching invoice with ID:', invoiceId);

    // Validate invoiceId format
    if (!invoiceId) {
      console.error('Invoice ID is missing');
      return NextResponse.json({
        success: false,
        error: 'معرف الفاتورة غير صحيح'
      }, { status: 400 });
    }

    // Check if invoiceId is a valid ObjectId
    if (invoiceId.length !== 24) {
      console.error('Invalid ObjectId format:', invoiceId);
      return NextResponse.json({
        success: false,
        error: 'معرف الفاتورة غير صحيح'
      }, { status: 400 });
    }

    // Don't use .lean() with .populate() - it can cause issues
    const invoice = await Invoice.findById(invoiceId)
      .populate('customer')
      .populate('items.product');

    if (!invoice) {
      console.warn('Invoice not found with ID:', invoiceId);
      return NextResponse.json({
        success: false,
        error: 'لم يتم العثور على الفاتورة'
      }, { status: 404 });
    }

    // Convert to plain object for response
    const invoiceData = invoice.toObject ? invoice.toObject() : invoice;
    console.log('Invoice found and returning:', invoiceData._id);
    
    return NextResponse.json({
      success: true,
      data: invoiceData
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return errorHandler(error, 500);
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

  const { invoiceId } = await params;
    const updates = await req.json();

    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!invoice) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم العثور على الفاتورة'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'تم تحديث الفاتورة بنجاح'
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return errorHandler(error, 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

  const { invoiceId } = await params;

    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { isArchived: true },
      { new: true }
    );

    if (!invoice) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم العثور على الفاتورة'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'تم حذف الفاتورة بنجاح'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return errorHandler(error, 500);
  }
}
