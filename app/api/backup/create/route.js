// app/api/backup/create/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import Product from '../../../lib/models/Product';
import { Stock } from '../../../lib/models/Stock';
import { Sale } from '../../../lib/models/Sale';
import { Purchase } from '../../../lib/models/Purchase';
import { Customer } from '../../../lib/models/Customer';
import { Supplier } from '../../../lib/models/Supplier';
import { Payment } from '../../../lib/models/Payment';
import { Expense } from '../../../lib/models/Expense';
import { StockMovement } from '../../../lib/models/StockMovement';

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
