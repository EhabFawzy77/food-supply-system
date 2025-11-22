// app/api/backup/auto/route.js
// النسخ الاحتياطي التلقائي
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectDB from '../../../lib/mongodb';
export async function POST(request) {
  try {
    await connectDB();

    const backupsDir = path.join(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // جمع البيانات
    const backup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      type: 'auto',
      data: {
        users: await User.find().select('-password'),
        products: await Product.find(),
        stock: await Stock.find(),
        sales: await Sale.find(),
        purchases: await Purchase.find(),
        customers: await Customer.find(),
        suppliers: await Supplier.find(),
        payments: await Payment.find(),
        expenses: await Expense.find(),
        stockMovements: await StockMovement.find()
      }
    };

    const filename = `auto-backup-${Date.now()}.json`;
    const filePath = path.join(backupsDir, filename);
    
    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

    // حذف النسخ القديمة (الاحتفاظ بآخر 7 نسخ)
    const files = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith('auto-backup-'))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(backupsDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 7) {
      files.slice(7).forEach(f => {
        fs.unlinkSync(path.join(backupsDir, f.name));
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء النسخة الاحتياطية التلقائية',
      filename
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
