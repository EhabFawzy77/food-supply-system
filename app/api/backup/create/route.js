// app/api/backup/create/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../lib/models/User.js';
import Product from '../../../../lib/models/Product.js';
import Stock from '../../../../lib/models/Stock.js';
import Sale from '../../../../lib/models/Sale.js';
import Purchase from '../../../../lib/models/Purchase.js';
import Customer from '../../../../lib/models/Customer.js';
import Supplier from '../../../../lib/models/Supplier.js';
import Payment from '../../../../lib/models/Payment.js';
import Expense from '../../../../lib/models/Expense.js';
import StockMovement from '../../../../lib/models/StockMovement.js';

export async function POST(request) {
  try {
    await connectDB();

    // جمع كل البيانات
    const backup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        users: await User.find().select('-password'),
        products: await Product.find(),
        stock: await Stock.find(),
        sales: await Sale.find(),
        purchases: await Purchase.find(),
        customers: await Customer.find(),
        suppliers: await Supplier.find(),
        payments: await Payment.find(),
        expenses: await Expense.find(),
        stockMovements: await StockMovement.find()
      },
      stats: {
        users: await User.countDocuments(),
        products: await Product.countDocuments(),
        sales: await Sale.countDocuments(),
        purchases: await Purchase.countDocuments(),
        customers: await Customer.countDocuments(),
        suppliers: await Supplier.countDocuments()
      }
    };

    // تحويل لـ JSON
    const json = JSON.stringify(backup, null, 2);
    
    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=backup-${Date.now()}.json`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
