import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import  Customer  from '../../../../lib/models/Customer';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const customer = await Customer.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'العميل غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: customer });
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
    const customer = await Customer.findByIdAndDelete(params.id);
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'العميل غير موجود' },
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