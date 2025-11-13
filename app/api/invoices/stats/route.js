import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Invoice from '../../../../lib/models/Invoice';
import authenticate from '../../../../lib/middleware/authenticate';
import errorHandler from '../../../../lib/middleware/errorHandler';

export async function GET(req) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month';

    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const stats = await Invoice.aggregate([
      {
        $match: {
          invoiceDate: { $gte: startDate },
          isArchived: false
        }
      },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$total' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: { $subtract: ['$total', '$paidAmount'] } },
          paidCount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0]
            }
          },
          unpaidCount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0]
            }
          },
          partialCount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'partial'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const data = stats.length > 0 ? stats[0] : {
      totalInvoices: 0,
      totalAmount: 0,
      totalPaid: 0,
      totalDue: 0,
      paidCount: 0,
      unpaidCount: 0,
      partialCount: 0
    };

    return NextResponse.json({
      success: true,
      data,
      period
    });
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    return errorHandler(error, 'خطأ في جلب إحصائيات الفواتير');
  }
}
