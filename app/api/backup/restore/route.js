// app/api/backup/restore/route.js
export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('backup');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم رفع ملف' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const backup = JSON.parse(text);

    if (!backup.version || !backup.data) {
      return NextResponse.json(
        { success: false, error: 'ملف النسخة الاحتياطية غير صالح' },
        { status: 400 }
      );
    }

    // مسح البيانات الحالية (حذر!)
    await User.deleteMany({});
    await Product.deleteMany({});
    await Stock.deleteMany({});
    await Sale.deleteMany({});
    await Purchase.deleteMany({});
    await Customer.deleteMany({});
    await Supplier.deleteMany({});
    await Payment.deleteMany({});
    await Expense.deleteMany({});
    await StockMovement.deleteMany({});

    // استعادة البيانات
    if (backup.data.users?.length) await User.insertMany(backup.data.users);
    if (backup.data.products?.length) await Product.insertMany(backup.data.products);
    if (backup.data.stock?.length) await Stock.insertMany(backup.data.stock);
    if (backup.data.sales?.length) await Sale.insertMany(backup.data.sales);
    if (backup.data.purchases?.length) await Purchase.insertMany(backup.data.purchases);
    if (backup.data.customers?.length) await Customer.insertMany(backup.data.customers);
    if (backup.data.suppliers?.length) await Supplier.insertMany(backup.data.suppliers);
    if (backup.data.payments?.length) await Payment.insertMany(backup.data.payments);
    if (backup.data.expenses?.length) await Expense.insertMany(backup.data.expenses);
    if (backup.data.stockMovements?.length) await StockMovement.insertMany(backup.data.stockMovements);

    return NextResponse.json({
      success: true,
      message: 'تم استعادة البيانات بنجاح',
      stats: backup.stats
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
