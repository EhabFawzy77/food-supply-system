// app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Product from '../../../../lib/models/Product.js';
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const product = await Product.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: product });
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
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
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