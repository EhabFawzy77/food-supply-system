import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Supplier from '../../../../lib/models/Supplier.js';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const supplier = await Supplier.findById(id);
    
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'المورد غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: supplier });
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
    
    const supplier = await Supplier.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'المورد غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: supplier });
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
    const supplier = await Supplier.findByIdAndDelete(id);
    
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'المورد غير موجود' },
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