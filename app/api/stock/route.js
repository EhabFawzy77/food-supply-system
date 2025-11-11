import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Stock from '../../../lib/models/Stock.js';
import Product from '../../../lib/models/Product.js';

// GET - جلب كل المخزون
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');
    
    let query = {};
    
    if (productId) {
      query.product = productId;
    }
    
    if (status) {
      query.status = status;
    }
    
    const stock = await Stock.find(query)
      .populate('product')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: stock });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - إضافة مخزون
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const stock = await Stock.create(body);
    
    return NextResponse.json(
      { success: true, data: stock },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT - تحديث المخزون
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const stock = await Stock.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!stock) {
      return NextResponse.json(
        { success: false, error: 'المخزون غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: stock });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}