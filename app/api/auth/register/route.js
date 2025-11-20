// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../lib/models/User.js';

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
    
    // التحقق من صلاحية البريد الإلكتروني إن وجد
    if (body.email) {
      const existingEmail = await User.findOne({ email: body.email });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني موجود بالفعل' },
          { status: 400 }
        );
      }
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
          role: user.role,
          email: user.email,
          phone: user.phone
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/auth/register:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}