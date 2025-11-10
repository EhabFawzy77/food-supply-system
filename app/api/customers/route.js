import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { Customer } from '../../../lib/models/Customer';

export async function GET() {
  try {
    await connectDB();
    const customers = await Customer.find().sort({ name: 1 });
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const customer = await Customer.create(body);
    return NextResponse.json(
      { success: true, data: customer },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}