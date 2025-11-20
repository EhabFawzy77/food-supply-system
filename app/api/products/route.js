// app/api/products/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Product from '../../../lib/models/Product.js';
import Supplier from '../../../lib/models/Supplier.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

// إعداد multer لرفع الملفات
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'public', 'products');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يجب أن تكون الصورة من نوع صورة صحيح'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const uploadMiddleware = promisify(upload.single('image'));

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

    const formData = await request.formData();

    // استخراج البيانات النصية
    const productData = {
      name: formData.get('name'),
      category: formData.get('category'),
      unit: formData.get('unit'),
      purchasePrice: parseFloat(formData.get('purchasePrice')),
      sellingPrice: parseFloat(formData.get('sellingPrice')),
      minStockLevel: parseFloat(formData.get('minStockLevel')) || 0,
      supplier: formData.get('supplier') || null,
      color: formData.get('color') || '',
      size: formData.get('size') || '',
      brand: formData.get('brand') || ''
    };

    // التحقق من صحة البيانات
    if (!productData.name || !productData.category || !productData.purchasePrice || !productData.sellingPrice) {
      return NextResponse.json(
        { success: false, error: 'البيانات المطلوبة مفقودة' },
        { status: 400 }
      );
    }

    // معالجة الصورة إذا كانت موجودة
    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
      // إنشاء اسم فريد للصورة
      const fileExtension = path.extname(imageFile.name);
      const fileName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${fileExtension}`;

      // حفظ الصورة
      const uploadDir = path.join(process.cwd(), 'public', 'products');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // إضافة مسار الصورة للبيانات
      productData.image = `/products/${fileName}`;
    }

    const product = await Product.create(productData);

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (error) {
    console.error('خطأ في إضافة المنتج:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
