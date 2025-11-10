export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const purchase = await Purchase.findById(params.id)
      .populate('supplier')
      .populate('items.product');
    
    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'المشتريات غير موجودة' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: purchase });
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
    const purchase = await Purchase.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'المشتريات غير موجودة' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: purchase });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
