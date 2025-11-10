// app/api/payments/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Payment from '../../../lib/models/Payment';
import Sale from '../../../lib/models/Sale';
import Purchase from '../../../lib/models/Purchase';
import Customer from "../../../lib/models/Customer";
import Supplier from '../../../lib/models/Supplier';

// GET - جلب كل المدفوعات
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (startDate && endDate) {
      query.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const payments = await Payment.find(query)
      .populate('createdBy')
      .sort({ transactionDate: -1 });
    
    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - تسجيل دفعة جديدة
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // إنشاء سجل الدفعة
    const payment = await Payment.create(body);
    
    if (body.type === 'sale') {
      // تحديث حالة الفاتورة
      const sale = await Sale.findById(body.referenceId);
      
      if (!sale) {
        return NextResponse.json(
          { success: false, error: 'الفاتورة غير موجودة' },
          { status: 404 }
        );
      }
      
      const newPaidAmount = sale.paidAmount + body.amount;
      let newStatus = 'unpaid';
      
      if (newPaidAmount >= sale.total) {
        newStatus = 'paid';
      } else if (newPaidAmount > 0) {
        newStatus = 'partial';
      }
      
      await Sale.findByIdAndUpdate(body.referenceId, {
        paidAmount: newPaidAmount,
        paymentStatus: newStatus
      });
      
      // تحديث ديون العميل
      await Customer.findByIdAndUpdate(sale.customer, {
        $inc: { currentDebt: -body.amount }
      });
      
    } else if (body.type === 'purchase') {
      // تحديث حالة فاتورة المشتريات
      const purchase = await Purchase.findById(body.referenceId);
      
      if (!purchase) {
        return NextResponse.json(
          { success: false, error: 'فاتورة المشتريات غير موجودة' },
          { status: 404 }
        );
      }
      
      const newPaidAmount = purchase.paidAmount + body.amount;
      let newStatus = 'unpaid';
      
      if (newPaidAmount >= purchase.total) {
        newStatus = 'paid';
      } else if (newPaidAmount > 0) {
        newStatus = 'partial';
      }
      
      await Purchase.findByIdAndUpdate(body.referenceId, {
        paidAmount: newPaidAmount,
        paymentStatus: newStatus
      });
      
      // تحديث ديون المورد
      await Supplier.findByIdAndUpdate(purchase.supplier, {
        $inc: { currentDebt: -body.amount }
      });
    }
    
    return NextResponse.json(
      { success: true, data: payment },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
