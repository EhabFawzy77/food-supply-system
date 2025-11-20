// app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Product from '../../../../lib/models/Product.js';
import path from 'path';
import fs from 'fs';
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
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

      // حذف الصورة القديمة إذا كانت موجودة
      const existingProduct = await Product.findById(id);
      if (existingProduct && existingProduct.image) {
        const oldImagePath = path.join(process.cwd(), 'public', existingProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('خطأ في تحديث المنتج:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}