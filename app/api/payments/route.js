// app/api/payments/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Payment from '../../../lib/models/Payment.js';
import Sale from '../../../lib/models/Sale.js';
import Purchase from '../../../lib/models/Purchase.js';
import Customer from '../../../lib/models/Customer.js';
import Supplier from '../../../lib/models/Supplier.js';
import User from '../../../lib/models/User.js';

// GET - جلب كل المدفوعات
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

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

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('createdBy', 'fullName username')
      .sort({ transactionDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
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
        { success: false, error: 'البيانات المطلوبة ناقصة (type, amount, paymentMethod)' },
        { status: 400 }
      );
    }

    // إنشاء رقم مرجعي إذا لم يكن موجوداً
    const referenceNumber = body.referenceNumber || `PAY-${Date.now()}`;

    // إنشاء سجل الدفعة
    const payment = await Payment.create({
      type: body.type,
      referenceId: body.referenceId || null,
      referenceNumber: referenceNumber,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      receivedFrom: body.receivedFrom || null,
      paidTo: body.paidTo || null,
      customer: body.customerId || null,
      supplier: body.supplierId || null,
      notes: body.notes || null,
      checkNumber: body.checkNumber || null,
      bankName: body.bankName || null,
      transactionDate: body.transactionDate || new Date(),
      createdBy: body.createdBy || null
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

          // تحديث الفاتورة المرتبطة بالبيع
          const Invoice = (await import('../../../lib/models/Invoice.js')).default;
          await Invoice.findOneAndUpdate(
            { sale: body.referenceId },
            {
              paidAmount: newPaidAmount,
              paymentStatus: newStatus
            }
          );

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
          
          // تحديث ديون المورد (زيادة الدين عند الدفع لأنه سالب)
          if (purchase.supplier) {
            await Supplier.findByIdAndUpdate(purchase.supplier, {
              $inc: { currentDebt: body.amount }
            });
          }
        }
      }
    }

    // إذا لم يكن هناك referenceId ولكن تم تمرير customerId/supplierId
    // يعني الدفعة مباشرة على العميل/المورد (بدون فاتورة محددة)
    if (!body.referenceId) {
      if (body.type === 'sale' && body.customerId) {
        try {
          // إنشاء سجل مبيع للدفعة على الدين
          const debtPaymentSale = await Sale.create({
            invoiceNumber: `DEBT-${referenceNumber}`,
            customer: body.customerId,
            items: [{
              product: null,
              productName: 'دفعة على دين سابق',
              quantity: 1,
              unitPrice: body.amount,
              total: body.amount
            }],
            subtotal: body.amount,
            tax: 0,
            discount: 0,
            total: body.amount,
            paymentStatus: 'paid',
            paymentMethod: body.paymentMethod,
            paidAmount: body.amount,
            notes: `دفعة على دين سابق - ${body.notes || ''}`,
            createdBy: body.createdBy
          });

          // تحديث ديون العميل
          await Customer.findByIdAndUpdate(body.customerId, { 
            $inc: { currentDebt: -body.amount } 
          });
          
          console.log('✅ تم إنشاء سجل مبيع للدفعة على الدين:', debtPaymentSale.invoiceNumber);
        } catch (err) {
          console.warn('⚠️ فشل إنشاء سجل مبيع للدفعة على الدين:', err.message);
        }
      }

      if (body.type === 'purchase' && body.supplierId) {
        try {
          // تحديث ديون المورد (زيادة الدين عند الدفع)
          await Supplier.findByIdAndUpdate(body.supplierId, {
            $inc: { currentDebt: body.amount }
          });

          console.log('✅ تم تحديث ديون المورد');
        } catch (err) {
          console.warn('⚠️ فشل تحديث ديون المورد:', err.message);
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