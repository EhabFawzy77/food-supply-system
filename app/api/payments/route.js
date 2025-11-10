// app/api/payments/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Payment from '../../../lib/models/Payment';
import Sale from '../../../lib/models/Sale';
import Purchase from '../../../lib/models/Purchase';
import Customer from '../../../lib/models/Customer';
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
      .populate('createdBy', 'fullName username')
      .sort({ transactionDate: -1 });
    
    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error in GET /api/payments:', error);
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
    
    // التحقق من البيانات المطلوبة
    if (!body.type || !body.amount || !body.paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'البيانات المطلوبة ناقصة' },
        { status: 400 }
      );
    }

    // إنشاء سجل الدفعة
    const payment = await Payment.create({
      type: body.type,
      referenceId: body.referenceId,
      referenceNumber: body.referenceNumber || `PAY-${Date.now()}`,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      receivedFrom: body.receivedFrom,
      paidTo: body.paidTo,
      notes: body.notes,
      checkNumber: body.checkNumber,
      bankName: body.bankName,
      transactionDate: body.transactionDate || new Date(),
      createdBy: body.createdBy
    });
    
    // تحديث الفواتير إذا كان هناك referenceId
    if (body.referenceId) {
      if (body.type === 'sale') {
        // تحديث حالة فاتورة البيع
        const sale = await Sale.findById(body.referenceId);
        
        if (sale) {
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
          if (sale.customer) {
            await Customer.findByIdAndUpdate(sale.customer, {
              $inc: { currentDebt: -body.amount }
            });
          }
        }
        
      } else if (body.type === 'purchase') {
        // تحديث حالة فاتورة المشتريات
        const purchase = await Purchase.findById(body.referenceId);
        
        if (purchase) {
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
          if (purchase.supplier) {
            await Supplier.findByIdAndUpdate(purchase.supplier, {
              $inc: { currentDebt: -body.amount }
            });
          }
        }
      }
    }
    
    return NextResponse.json(
      { success: true, data: payment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/payments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}