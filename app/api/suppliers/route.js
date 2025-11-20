// app/api/suppliers/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Supplier from '../../../lib/models/Supplier.js';

// GET - جلب كل الموردين
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const suppliers = await Supplier.find(query).sort({ name: 1 });
    
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Error in GET /api/suppliers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - إضافة مورد جديد
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'الاسم ورقم الهاتف مطلوبان' },
        { status: 400 }
      );
    }
    
    // التحقق من عدم تكرار رقم الهاتف
    const existingSupplier = await Supplier.findOne({ phone: body.phone });
    if (existingSupplier) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف موجود بالفعل' },
        { status: 400 }
      );
    }
    
    const supplier = await Supplier.create(body);
    
    return NextResponse.json(
      { success: true, data: supplier },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/suppliers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}