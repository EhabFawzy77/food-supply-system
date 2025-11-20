// app/api/payments/stats/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Payment from '../../../../lib/models/Payment.js';
import Sale from '../../../../lib/models/Sale.js';
import Purchase from '../../../../lib/models/Purchase.js';

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
    
    // جلب المدفوعات في الفترة المحددة
    const payments = await Payment.find({
      transactionDate: { $gte: startDate }
    });
    
    // حساب المقبوضات (من المبيعات)
    const received = payments
      .filter(p => p.type === 'sale')
      .reduce((sum, p) => sum + p.amount, 0);
    
    // حساب المدفوعات (للمشتريات)
    const paid = payments
      .filter(p => p.type === 'purchase')
      .reduce((sum, p) => sum + p.amount, 0);
    
    // حساب المدفوعات المعلقة (الديون)
    const unpaidSales = await Sale.find({
      paymentStatus: { $in: ['unpaid', 'partial'] }
    });
    
    const pendingReceivables = unpaidSales.reduce(
      (sum, s) => sum + (s.total - s.paidAmount), 
      0
    );
    
    const unpaidPurchases = await Purchase.find({
      paymentStatus: { $in: ['unpaid', 'partial'] }
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
        netCashFlow: received - paid,
        paymentsCount: payments.length,
        receivedCount: payments.filter(p => p.type === 'sale').length,
        paidCount: payments.filter(p => p.type === 'purchase').length
      }
    });
  } catch (error) {
    console.error('Error in GET /api/payments/stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}