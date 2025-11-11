// app/api/settings/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Settings from '../../../lib/models/Settings.js';

// GET - جلب جميع الإعدادات
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = {};
    if (category) {
      query.category = category;
    }
    
    const settings = await Settings.find(query);
    
    // تحويل لصيغة سهلة الاستخدام
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    return NextResponse.json({ success: true, data: settingsObj });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - تحديث الإعدادات
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const userId = request.user?.userId; // من middleware
    
    // تحديث كل إعداد
    const updates = [];
    for (const [key, value] of Object.entries(body)) {
      const update = await Settings.findOneAndUpdate(
        { key },
        { 
          value, 
          updatedAt: new Date(),
          updatedBy: userId 
        },
        { upsert: true, new: true }
      );
      updates.push(update);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم تحديث الإعدادات بنجاح',
      data: updates
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
