import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Invoice from '../../../../../lib/models/Invoice';
import authenticate from '../../../../../lib/middleware/authenticate';
import errorHandler from '../../../../../lib/middleware/errorHandler';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    const { invoiceId } = await params;

    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      {
        printedAt: new Date(),
        $inc: { printCount: 1 },
        updatedAt: new Date()
      },
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
      message: 'تم تسجيل الطباعة بنجاح'
    });
  } catch (error) {
    console.error('Error recording print:', error);
    return errorHandler(error, 'خطأ في تسجيل الطباعة');
  }
}
