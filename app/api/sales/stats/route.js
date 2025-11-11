// app/api/sales/stats/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Sale from '../../../../lib/models/Sale.js';
import Product from '../../../../lib/models/Product.js'; // ensure model is registered for populate

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    if (period === 'yesterday') {
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
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
    
    // حساب الإجماليات
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    
    // حساب الربح
    let totalProfit = 0;
    let totalCost = 0;
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.product && item.product.purchasePrice) {
          const cost = item.product.purchasePrice * item.quantity;
          const revenue = item.unitPrice * item.quantity;
          totalCost += cost;
          totalProfit += (revenue - cost);
        }
      });
    });
    
    // حساب المبيعات حسب طريقة الدفع
    const cashSales = sales
      .filter(s => s.paymentMethod === 'cash')
      .reduce((sum, s) => sum + s.total, 0);
    
    const creditSales = sales
      .filter(s => s.paymentMethod === 'credit')
      .reduce((sum, s) => sum + s.total, 0);
    
    const bankTransferSales = sales
      .filter(s => s.paymentMethod === 'bank_transfer')
      .reduce((sum, s) => sum + s.total, 0);
    
    // حساب المدفوعات المعلقة
    const pendingPayments = sales
      .filter(s => s.paymentStatus !== 'paid')
      .reduce((sum, s) => sum + (s.total - s.paidAmount), 0);
    
    return NextResponse.json({
      success: true,
      data: {
        totalSales,
        totalProfit,
        totalCost,
        cashSales,
        creditSales,
        bankTransferSales,
        pendingPayments,
        transactions: sales.length,
        averageTransaction: sales.length > 0 ? totalSales / sales.length : 0,
        profitMargin: totalSales > 0 ? (totalProfit / totalSales) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error in GET /api/sales/stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}