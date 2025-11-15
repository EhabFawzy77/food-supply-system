import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Invoice from '../../../../../lib/models/Invoice';
import Customer from '../../../../../lib/models/Customer';

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { customerId } = await params;
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'معرف العميل مطلوب' }, { status: 400 });
    }

    // جلب الفواتير الغير مدفوعة جزئياً أو كلياً
    const invoices = await Invoice.find({
      customer: customerId,
      isArchived: false,
      paymentStatus: { $in: ['unpaid', 'partial'] }
    }).sort({ invoiceDate: -1 }).lean();

    // إجمالي الديون المحسوبة من الفواتير
    const outstandingFromInvoices = invoices.reduce((sum, inv) => {
      const remaining = (inv.total || 0) - (inv.paidAmount || 0);
      return sum + (remaining > 0 ? remaining : 0);
    }, 0);

    // جلب حقل currentDebt من العميل (للمقارنة/عرض مباشر)
    const customer = await Customer.findById(customerId).lean();

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        total: outstandingFromInvoices,
        currentDebt: customer?.currentDebt || 0
      }
    });
  } catch (error) {
    console.error('Error fetching customer debts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
