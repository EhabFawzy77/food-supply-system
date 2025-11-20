import connectDB from '../../../../../lib/mongodb.js';
import Sale from '../../../../../lib/models/Sale.js';
import authenticate from '../../../../../lib/middleware/authenticate.js';
import errorHandler from '../../../../../lib/middleware/errorHandler.js';

export async function POST(req, context) {
  try {
    await connectDB();
    
    const { params } = context;
    const saleId = (await params).id;

    // التحقق من المستخدم
    const user = await authenticate(req);
    if (!user) {
      return errorHandler(new Error('غير مصرح'), 401);
    }

    // البحث عن البيع
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return errorHandler(new Error('البيع غير موجود'), 404);
    }

    // التحقق من أن طريقة الدفع كانت كاش
    if (sale.paymentMethod !== 'cash') {
      return errorHandler(new Error('يمكن إلغاء الكاش فقط'), 400);
    }

    // التحقق من أن البيع لم يتم إلغاؤه من قبل
    if (sale.paymentStatus === 'cancelled') {
      return errorHandler(new Error('تم إلغاء هذا البيع من قبل'), 400);
    }

    // تحديث حالة البيع
    sale.paymentStatus = 'cancelled';
    sale.cancelledAt = new Date();
    sale.cancelledBy = user._id;
    sale.paidAmount = 0;

    await sale.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم إلغاء الدفع بنجاح وإرجاع المبلغ',
        data: sale
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
