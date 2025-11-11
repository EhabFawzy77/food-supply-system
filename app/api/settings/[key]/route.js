// app/api/settings/[key]/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Settings from '../../../../lib/models/Settings.js';

// GET - جلب إعداد واحد
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { key } = await params;
    const setting = await Settings.findOne({ key });
    
    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'الإعداد غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: setting.value 
    });
  } catch (error) {
    console.error('Error in GET /api/settings/[key]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - تحديث إعداد
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { key } = await params;
    const body = await request.json();
    
    const setting = await Settings.findOneAndUpdate(
      { key },
      { 
        value: body.value,
        category: body.category || 'general',
        description: body.description,
        updatedAt: new Date(),
        updatedBy: body.updatedBy
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      data: setting 
    });
  } catch (error) {
    console.error('Error in PUT /api/settings/[key]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - حذف إعداد
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { key } = await params;
    const setting = await Settings.findOneAndDelete({ key });
    
    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'الإعداد غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم حذف الإعداد بنجاح',
      data: {} 
    });
  } catch (error) {
    console.error('Error in DELETE /api/settings/[key]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}