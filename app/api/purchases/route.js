// app/api/purchases/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import  Purchase  from '../../../lib/models/Purchase';
import  Stock  from '../../../lib/models/Stock';
import  StockMovement  from '../../../lib/models/StockMovement';
import Product from '../../../lib/models/Product';

// GET - جلب كل المشتريات
export async function GET(request) {
  try {
    await connectDB();
    
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
    
    const body = await request.json();
    
    // إنشاء فاتورة المشتريات
    const purchase = await Purchase.create(body);
    
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
