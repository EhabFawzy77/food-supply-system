// app/api/sales/[id]/route.js
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const sale = await Sale.findById(params.id)
      .populate('customer')
      .populate('items.product');
    
    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'الفاتورة غير موجودة' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: sale });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const body = await request.json();
    const sale = await Sale.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'الفاتورة غير موجودة' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: sale });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const sale = await Sale.findByIdAndDelete(params.id);
    
    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'الفاتورة غير موجودة' },
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