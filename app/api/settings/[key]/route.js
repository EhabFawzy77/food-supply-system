// app/api/settings/[key]/route.js
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const setting = await Settings.findOne({ key: params.key });
    
    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'الإعداد غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: setting.value 
    });
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
    const userId = request.user?.userId;
    
    const setting = await Settings.findOneAndUpdate(
      { key: params.key },
      { 
        value: body.value,
        category: body.category || 'general',
        description: body.description,
        updatedAt: new Date(),
        updatedBy: userId
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      data: setting 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
