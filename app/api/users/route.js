// app/api/users/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import User from '../../../../lib/models/User.js';

// GET - جلب جميع المستخدمين
export async function GET(request) {
  try {
    await connectDB();
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: users 
    });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - إنشاء مستخدم جديد
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // التحقق من البيانات المطلوبة
    if (!body.username || !body.password || !body.fullName) {
      return NextResponse.json(
        { success: false, error: 'البيانات المطلوبة ناقصة' },
        { status: 400 }
      );
    }

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ username: body.username });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم موجود بالفعل' },
        { status: 400 }
      );
    }

    // إنشاء مستخدم جديد
    const user = await User.create({
      username: body.username,
      password: body.password,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      role: body.role || 'user',
      isActive: body.isActive !== undefined ? body.isActive : true
    });

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء المستخدم بنجاح',
        data: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          role: user.role
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}