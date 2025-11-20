// app/api/reports/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Sale from '../../../lib/models/Sale.js';
import Purchase from '../../../lib/models/Purchase.js';
import Product from '../../../lib/models/Product.js';
import Customer from '../../../lib/models/Customer.js';
import Expense from '../../../lib/models/Expense.js';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let reportData = {};

    switch (reportType) {
      case 'profit-loss':
        reportData = await getProfitLossReport(dateFilter);
        break;
      case 'sales-summary':
        reportData = await getSalesSummaryReport(dateFilter);
        break;
      case 'inventory-value':
        reportData = await getInventoryValueReport();
        break;
      case 'customer-analysis':
        reportData = await getCustomerAnalysisReport(dateFilter);
        break;
      case 'product-performance':
        reportData = await getProductPerformanceReport(dateFilter);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'نوع التقرير غير صحيح' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: reportData });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// تقرير الأرباح والخسائر
async function getProfitLossReport(dateFilter) {
  const sales = await Sale.find(dateFilter).populate('items.product');
  const purchases = await Purchase.find(dateFilter);
  const expenses = await Expense.find(dateFilter);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  const totalCost = sales.reduce((sum, sale) => {
    return sum + sale.items.reduce((itemSum, item) => {
      return itemSum + (item.product.purchasePrice * item.quantity);
    }, 0);
  }, 0);

  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const grossProfit = totalRevenue - totalCost;
  const netProfit = grossProfit - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCost,
    grossProfit,
    totalExpenses,
    netProfit,
    profitMargin,
    salesCount: sales.length,
    purchasesCount: purchases.length,
    expensesCount: expenses.length
  };
}

// تقرير ملخص المبيعات
async function getSalesSummaryReport(dateFilter) {
  const sales = await Sale.find(dateFilter).populate('customer');

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const cashSales = sales.filter(s => s.paymentMethod === 'cash')
    .reduce((sum, sale) => sum + sale.total, 0);
  const creditSales = sales.filter(s => s.paymentMethod === 'credit')
    .reduce((sum, sale) => sum + sale.total, 0);
  
  const paidSales = sales.filter(s => s.paymentStatus === 'paid').length;
  const unpaidSales = sales.filter(s => s.paymentStatus === 'unpaid').length;
  const partialSales = sales.filter(s => s.paymentStatus === 'partial').length;

  // أفضل العملاء
  const customerSales = {};
  sales.forEach(sale => {
    const customerId = sale.customer._id.toString();
    if (!customerSales[customerId]) {
      customerSales[customerId] = {
        customer: sale.customer,
        totalSales: 0,
        salesCount: 0
      };
    }
    customerSales[customerId].totalSales += sale.total;
    customerSales[customerId].salesCount++;
  });

  const topCustomers = Object.values(customerSales)
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 10);

  // المبيعات حسب اليوم
  const salesByDay = {};
  sales.forEach(sale => {
    const day = sale.saleDate.toISOString().split('T')[0];
    if (!salesByDay[day]) {
      salesByDay[day] = { date: day, total: 0, count: 0 };
    }
    salesByDay[day].total += sale.total;
    salesByDay[day].count++;
  });

  return {
    totalSales,
    cashSales,
    creditSales,
    averageSale: sales.length > 0 ? totalSales / sales.length : 0,
    salesCount: sales.length,
    paidSales,
    unpaidSales,
    partialSales,
    topCustomers,
    salesByDay: Object.values(salesByDay)
  };
}

// تقرير قيمة المخزون
async function getInventoryValueReport() {
  const products = await Product.find().populate('supplier');
  const { Stock } = await import('../../../lib/models/Stock');
  
  const inventoryData = [];
  let totalValue = 0;
  let totalItems = 0;

  for (const product of products) {
    const stockItems = await Stock.find({ 
      product: product._id, 
      status: 'available' 
    });
    
    const quantity = stockItems.reduce((sum, item) => sum + item.quantity, 0);
    const value = quantity * product.purchasePrice;
    
    totalValue += value;
    totalItems += quantity;

    if (quantity > 0) {
      inventoryData.push({
        product: {
          name: product.name,
          category: product.category,
          unit: product.unit
        },
        quantity,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        value,
        potentialRevenue: quantity * product.sellingPrice,
        potentialProfit: quantity * (product.sellingPrice - product.purchasePrice)
      });
    }
  }

  return {
    totalValue,
    totalItems,
    itemCount: inventoryData.length,
    items: inventoryData.sort((a, b) => b.value - a.value),
    potentialRevenue: inventoryData.reduce((sum, item) => sum + item.potentialRevenue, 0),
    potentialProfit: inventoryData.reduce((sum, item) => sum + item.potentialProfit, 0)
  };
}

// تقرير تحليل العملاء
async function getCustomerAnalysisReport(dateFilter) {
  const customers = await Customer.find();
  const sales = await Sale.find(dateFilter);

  const customerData = [];

  for (const customer of customers) {
    const customerSales = sales.filter(
      s => s.customer.toString() === customer._id.toString()
    );

    if (customerSales.length > 0) {
      const totalPurchases = customerSales.reduce((sum, s) => sum + s.total, 0);
      const averagePurchase = totalPurchases / customerSales.length;
      const lastPurchase = customerSales[customerSales.length - 1].saleDate;

      customerData.push({
        customer: {
          name: customer.name,
          businessName: customer.businessName,
          customerType: customer.customerType
        },
        totalPurchases,
        purchaseCount: customerSales.length,
        averagePurchase,
        currentDebt: customer.currentDebt,
        creditLimit: customer.creditLimit,
        creditUsage: (customer.currentDebt / customer.creditLimit) * 100,
        lastPurchase
      });
    }
  }

  return {
    totalCustomers: customers.length,
    activeCustomers: customerData.length,
    totalDebt: customerData.reduce((sum, c) => sum + c.currentDebt, 0),
    customers: customerData.sort((a, b) => b.totalPurchases - a.totalPurchases)
  };
}

// تقرير أداء المنتجات
async function getProductPerformanceReport(dateFilter) {
  const sales = await Sale.find(dateFilter).populate('items.product');

  const productData = {};

  sales.forEach(sale => {
    sale.items.forEach(item => {
      const productId = item.product._id.toString();
      
      if (!productData[productId]) {
        productData[productId] = {
          product: {
            name: item.product.name,
            category: item.product.category,
            unit: item.product.unit
          },
          quantitySold: 0,
          revenue: 0,
          profit: 0,
          salesCount: 0
        };
      }

      productData[productId].quantitySold += item.quantity;
      productData[productId].revenue += item.total;
      productData[productId].profit += item.quantity * 
        (item.unitPrice - item.product.purchasePrice);
      productData[productId].salesCount++;
    });
  });

  const products = Object.values(productData);

  return {
    totalProducts: products.length,
    topByRevenue: products.sort((a, b) => b.revenue - a.revenue).slice(0, 10),
    topByQuantity: products.sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 10),
    topByProfit: products.sort((a, b) => b.profit - a.profit).slice(0, 10)
  };
}
