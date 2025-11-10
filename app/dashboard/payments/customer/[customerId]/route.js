import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import  Payment  from '../../../../../lib/models/Payment';
import  Sale  from '../../../../../lib/models/Sale';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // جلب كل فواتير العميل
    const sales = await Sale.find({ 
      customer: params.customerId 
    });
    
    const saleIds = sales.map(s => s._id);
    
    // جلب المدفوعات المرتبطة بهذه الفواتير
    const payments = await Payment.find({
      type: 'sale',
      referenceId: { $in: saleIds }
    }).sort({ transactionDate: -1 });
    
    // حساب الإحصائيات
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const pendingAmount = totalSales - totalPaid;
    
    return NextResponse.json({ 
      success: true, 
      data: {
        payments,
        stats: {
          totalPaid,
          totalSales,
          pendingAmount,
          paymentCount: payments.length
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
