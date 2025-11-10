// app/api/payments/stats/route.js
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    }
    
    const payments = await Payment.find({
      transactionDate: { $gte: startDate }
    });
    
    const received = payments
      .filter(p => p.type === 'sale')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const paid = payments
      .filter(p => p.type === 'purchase')
      .reduce((sum, p) => sum + p.amount, 0);
    
    // حساب المدفوعات المعلقة
    const unpaidSales = await Sale.find({
      paymentStatus: { $ne: 'paid' }
    });
    
    const pendingReceivables = unpaidSales.reduce(
      (sum, s) => sum + (s.total - s.paidAmount), 
      0
    );
    
    const unpaidPurchases = await Purchase.find({
      paymentStatus: { $ne: 'paid' }
    });
    
    const pendingPayables = unpaidPurchases.reduce(
      (sum, p) => sum + (p.total - p.paidAmount), 
      0
    );
    
    return NextResponse.json({
      success: true,
      data: {
        received,
        paid,
        pendingReceivables,
        pendingPayables,
        netCashFlow: received - paid
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
