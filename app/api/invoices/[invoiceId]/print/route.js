import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Invoice from '../../../../../lib/models/Invoice';

export async function POST(req, { params }) {
  try {
    await connectDB();

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
    return NextResponse.json(
      { success: false, error: 'خطأ في تسجيل الطباعة' },
      { status: 500 }
    );
  }
}
