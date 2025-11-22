import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Purchase from '../../../../lib/models/Purchase.js';
import Supplier from '../../../../lib/models/Supplier.js';
import authenticate from '../../../../lib/middleware/authenticate.js';
import errorHandler from '../../../../lib/middleware/errorHandler.js';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const auth = await authenticate(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }
    
    const { id } = await params;
    const purchase = await Purchase.findById(id)
      .populate('supplier')
      .populate('items.product');
    
    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'المشتريات غير موجودة' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: purchase });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const auth = await authenticate(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // جلب المشتريات الحالية
    const currentPurchase = await Purchase.findById(id);
    if (!currentPurchase) {
      return NextResponse.json(
        { success: false, error: 'المشتريات غير موجودة' },
        { status: 404 }
      );
    }

    // تحديث ديون المورد - إعادة الدين القديم وتطبيق الجديد (سالب عندما الشركة مدينة)
    const oldDebt = currentPurchase.paymentStatus === 'unpaid' ? -currentPurchase.total :
                     currentPurchase.paymentStatus === 'partial' ? -(currentPurchase.total - (currentPurchase.paidAmount || 0)) : 0;

    const newDebt = body.paymentStatus === 'unpaid' ? -body.total :
                     body.paymentStatus === 'partial' ? -(body.total - (body.paidAmount || 0)) : 0;

    const debtChange = newDebt - oldDebt;

    if (debtChange !== 0) {
      await Supplier.findByIdAndUpdate(currentPurchase.supplier, {
        $inc: { currentDebt: debtChange }
      });
    }

    const purchase = await Purchase.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: purchase });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const auth = await authenticate(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = await params;
    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'المشتريات غير موجودة' },
        { status: 404 }
      );
    }

    // تعديل ديون المورد عند الحذف (عكس الإضافة)
    const debtToAdjust = purchase.paymentStatus === 'unpaid' ? -purchase.total :
                         purchase.paymentStatus === 'partial' ? -(purchase.total - (purchase.paidAmount || 0)) : 0;

    if (debtToAdjust !== 0) {
      await Supplier.findByIdAndUpdate(purchase.supplier, {
        $inc: { currentDebt: -debtToAdjust }
      });
    }

    await Purchase.findByIdAndDelete(id);

    return NextResponse.json({ success: true, data: { message: 'تم الحذف بنجاح' } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
