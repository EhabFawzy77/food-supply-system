import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function verifyToken(request) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    return decoded;
  } catch (error) {
    return null;
  }
}

export function requireAuth(handler) {
  return async (request, context) => {
    const user = verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }
    
    request.user = user;
    return handler(request, context);
  };
}

export function requirePermission(permission) {
  return (handler) => {
    return async (request, context) => {
      const user = verifyToken(request);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'يجب تسجيل الدخول' },
          { status: 401 }
        );
      }
      
      if (!user.permissions[permission] && user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'ليس لديك صلاحية للوصول' },
          { status: 403 }
        );
      }
      
      request.user = user;
      return handler(request, context);
    };
  };
}