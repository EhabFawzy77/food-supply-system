// app/api/purchases/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Purchase from '../../../lib/models/Purchase.js';
import Stock from '../../../lib/models/Stock.js';
import StockMovement from '../../../lib/models/StockMovement.js';
import Product from '../../../lib/models/Product.js';
import Supplier from '../../../lib/models/Supplier.js';
import authenticate from '../../../lib/middleware/authenticate.js';
import errorHandler from '../../../lib/middleware/errorHandler.js';

// GET - جلب كل المشتريات
export async function GET(request) {
  try {
    await connectDB();
    const auth = await authenticate(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'غير مصرح', statusCode: 401 }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const supplier = searchParams.get('supplier');
    const status = searchParams.get('status');
    
    let query = {};
    
    if (startDate && endDate) {
      query.purchaseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (supplier) {
      query.supplier = supplier;
    }
    
    if (status) {
      query.paymentStatus = status;
    }
    
    const purchases = await Purchase.find(query)
      .populate('supplier')
      .populate('items.product')
      .sort({ purchaseDate: -1 });
    
    return NextResponse.json({ success: true, data: purchases });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - إضافة مشتريات جديدة
export async function POST(request) {
  try {
    await connectDB();
    
    console.log('[POST /api/purchases] Starting purchase creation');
    
    const auth = await authenticate(request);
    if (!auth) {
      console.error('[POST /api/purchases] Authentication failed - returning 401');
      return NextResponse.json({ 
        success: false, 
        error: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مجددا',
        statusCode: 401,
        code: 'TOKEN_EXPIRED'
      }, { status: 401 });
    }
    
    console.log('[POST /api/purchases] Auth successful for user:', auth.username);
    
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.invoiceNumber) {
      body.invoiceNumber = `PUR-${Date.now()}`;
    }
    
    // حساب الإجماليات إذا لم تكن موجودة
    if (!body.subtotal || !body.total) {
      const subtotal = body.items.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice));
      }, 0);
      
      body.subtotal = subtotal;
      body.total = subtotal + (parseFloat(body.tax) || 0);
    }
    
    // إنشاء فاتورة المشتريات
    const purchase = await Purchase.create(body);

    // تحديث إجمالي المشتريات وآخر مشتريات للمورد
    await Supplier.findByIdAndUpdate(body.supplier, {
      $inc: { totalPurchases: body.total },
      lastPurchase: new Date()
    });

    // إضافة المنتجات للمخزون
    for (const item of body.items) {
      // إضافة للمخزون
      await Stock.create({
        product: item.product,
        quantity: item.quantity,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        status: 'available'
      });

      // تحديث سعر الشراء للمنتج
      await Product.findByIdAndUpdate(item.product, {
        purchasePrice: item.unitPrice
      });

      // تسجيل حركة المخزون
      const currentStock = await Stock.aggregate([
        { $match: { product: item.product } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);

      await StockMovement.create({
        product: item.product,
        type: 'in',
        quantity: item.quantity,
        reference: purchase.invoiceNumber,
        referenceType: 'purchase',
        reason: 'شراء من المورد',
        afterQuantity: currentStock[0]?.total || item.quantity,
        createdBy: body.createdBy
      });
    }

    // تحديث ديون المورد (سالب عندما الشركة مدينة)
    if (body.paymentStatus === 'unpaid') {
      await Supplier.findByIdAndUpdate(body.supplier, {
        $inc: { currentDebt: -body.total }
      });
    } else if (body.paymentStatus === 'partial') {
      const debtIncrease = -(body.total - (body.paidAmount || 0));
      if (debtIncrease < 0) {
        await Supplier.findByIdAndUpdate(body.supplier, {
          $inc: { currentDebt: debtIncrease }
        });
      }
    }
    // للمدفوعة بالكامل لا نحتاج لتغيير الدين

    return NextResponse.json(
      { success: true, data: purchase },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
