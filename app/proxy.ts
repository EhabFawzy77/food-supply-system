// proxy.ts
import { NextResponse, NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// المسارات التي لا تحتاج مصادقة
const publicPaths = [
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/register'
];

// المسارات التي تحتاج صلاحيات خاصة
const protectedPaths = {
  '/dashboard/users': ['admin'],
  '/dashboard/settings': ['admin'],
  '/api/users': ['admin'],
  '/api/settings': ['admin'],
  '/api/backup': ['admin'],
  '/dashboard/reports': ['admin', 'manager'],
  '/dashboard/purchases': ['admin', 'manager'],
  '/api/purchases': ['admin', 'manager']
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // السماح بالمسارات العامة
  if (publicPaths.includes(pathname) || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/static') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // التحقق من التوكن
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('authToken')?.value;
  const token = authHeader?.replace('Bearer ', '') || cookieToken;

  // إذا لم يوجد توكن
  if (!token) {
    console.log('No token found, redirecting to login...');
    
    // إعادة توجيه للـ login
    if (pathname.startsWith('/dashboard')) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // رفض طلبات API
    if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }
    
    return NextResponse.next();
  }

  try {
    // فك تشفير التوكن (بدون مكتبة لتجنب الأخطاء)
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    
    // التحقق من الصلاحيات
    for (const [path, roles] of Object.entries(protectedPaths)) {
      if (pathname.startsWith(path)) {
        if (!roles.includes(payload.role)) {
          // إعادة توجيه أو رفض
          if (pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
          
          if (pathname.startsWith('/api')) {
            return NextResponse.json(
              { success: false, error: 'ليس لديك صلاحية للوصول' },
              { status: 403 }
            );
          }
        }
      }
    }

    // إضافة معلومات المستخدم للطلب
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // توكن غير صالح - السماح بالمرور للصفحات العامة
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
      return NextResponse.json(
        { success: false, error: 'جلسة غير صالحة' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};