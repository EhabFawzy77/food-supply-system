// app/api/products/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Product from '../../../lib/models/Product.js';
import Supplier from '../../../lib/models/Supplier.js';

// GET - جلب كل المنتجات
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    let products;
    try {
      products = await Product.find(query)
        .populate('supplier')
        .sort({ createdAt: -1 });
    } catch (dbErr) {
      console.error('Products query failed:', dbErr);
      return NextResponse.json(
        { success: false, error: 'فشل في جلب المنتجات: ' + dbErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - إضافة منتج جديد
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const product = await Product.create(body);
    
    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
