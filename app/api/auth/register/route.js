export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ username: body.username });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم موجود بالفعل' },
        { status: 400 }
      );
    }
    
    // إنشاء مستخدم جديد
    const user = await User.create(body);
    
    return NextResponse.json(
      { 
        success: true, 
        data: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          role: user.role
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
