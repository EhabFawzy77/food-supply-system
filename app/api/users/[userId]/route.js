// app/api/users/[userId]/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb.js';
import User from '../../../../../lib/models/User.js';

// PUT - تحديث مستخدم
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { userId } = params;
    const body = await request.json();

    // البحث عن المستخدم
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // تحديث البيانات
    if (body.fullName) user.fullName = body.fullName;
    if (body.email !== undefined) user.email = body.email;
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.role) user.role = body.role;
    if (body.isActive !== undefined) user.isActive = body.isActive;
    if (body.password) user.password = body.password;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'تم تحديث المستخدم بنجاح',
      data: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error in PUT /api/users/[userId]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE - حذف مستخدم
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { userId } = params;

    // البحث عن المستخدم
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // منع حذف المدراء
    if (user.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'لا يمكن حذف المدراء' },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });
  } catch (error) {
    console.error('Error in DELETE /api/users/[userId]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}