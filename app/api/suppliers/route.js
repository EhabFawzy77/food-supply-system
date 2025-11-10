// app/api/suppliers/route.js
import { Supplier } from '../../../lib/models/Supplier';

export async function GET(request) {
  try {
    await connectDB();
    
    const suppliers = await Supplier.find().sort({ name: 1 });
    
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const supplier = await Supplier.create(body);
    
    return NextResponse.json(
      { success: true, data: supplier },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
