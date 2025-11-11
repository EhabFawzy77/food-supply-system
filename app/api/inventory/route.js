import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Stock from '../../../lib/models/Stock.js';
import Product from '../../../lib/models/Product.js';
import Supplier from '../../../lib/models/Supplier.js';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get('lowStock');
    const expiringSoon = searchParams.get('expiringSoon');
    
    // جلب كل المنتجات مع المخزون
    const products = await Product.find();
    
    const inventory = [];
    
    for (const product of products) {
      const stockItems = await Stock.find({ 
        product: product._id,
        status: 'available'
      });
      
      const totalQuantity = stockItems.reduce((sum, item) => sum + item.quantity, 0);
      
      // تحديد الحالة
      let status = 'normal';
      if (totalQuantity <= product.minStockLevel) {
        status = 'low';
      }
      
      // التحقق من الصلاحية
      const now = new Date();
      const expiringSoonDate = new Date();
      expiringSoonDate.setDate(expiringSoonDate.getDate() + 30);
      
      const hasExpiringSoon = stockItems.some(item => 
        item.expiryDate && item.expiryDate <= expiringSoonDate
      );
      
      if (hasExpiringSoon) {
        status = 'expiring';
      }
      
      const inventoryItem = {
        _id: product._id,
        product: {
          name: product.name,
          category: product.category,
          unit: product.unit,
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice
        },
        quantity: totalQuantity,
        minStockLevel: product.minStockLevel,
        stockItems: stockItems.map(item => ({
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          expiryDate: item.expiryDate,
          location: item.location
        })),
        status
      };
      
      // تطبيق الفلاتر
      if (lowStock === 'true' && status !== 'low') continue;
      if (expiringSoon === 'true' && status !== 'expiring') continue;
      
      inventory.push(inventoryItem);
    }
    
    return NextResponse.json({ 
      success: true, 
      data: inventory 
    });
  } catch (error) {
    console.error('Error in GET /api/inventory:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}