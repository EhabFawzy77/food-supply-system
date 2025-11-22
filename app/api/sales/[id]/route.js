// app/api/sales/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Sale from '../../../../lib/models/Sale.js';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const sale = await Sale.findById(id)
      .populate('customer')
      .populate('items.product');
    
    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'الفاتورة غير موجودة' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: sale });
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
    
    const { id } = await params;
    const body = await request.json();
    const sale = await Sale.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'الفاتورة غير موجودة' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: sale });
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
    
    const { id } = await params;
    const sale = await Sale.findByIdAndDelete(id);
    
    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'الفاتورة غير موجودة' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}