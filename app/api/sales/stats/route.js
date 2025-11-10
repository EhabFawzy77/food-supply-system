
// app/api/sales/stats/route.js
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    if (period === 'yesterday') {
      startDate.setDate(startDate.getDate() - 1);
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    const sales = await Sale.find({
      saleDate: { $gte: startDate }
    }).populate('items.product');
    
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalProfit = sales.reduce((sum, s) => {
      return sum + s.items.reduce((itemSum, item) => {
        const profit = (item.unitPrice - item.product.purchasePrice) * item.quantity;
        return itemSum + profit;
      }, 0);
    }, 0);
    
    const cashSales = sales.filter(s => s.paymentMethod === 'cash')
      .reduce((sum, s) => sum + s.total, 0);
    
    const creditSales = sales.filter(s => s.paymentMethod === 'credit')
      .reduce((sum, s) => sum + s.total, 0);
    
    const pendingPayments = sales.filter(s => s.paymentStatus !== 'paid')
      .reduce((sum, s) => sum + (s.total - s.paidAmount), 0);
    
    return NextResponse.json({
      success: true,
      data: {
        totalSales,
        totalProfit,
        cashSales,
        creditSales,
        pendingPayments,
        transactions: sales.length,
        averageTransaction: sales.length > 0 ? totalSales / sales.length : 0
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
