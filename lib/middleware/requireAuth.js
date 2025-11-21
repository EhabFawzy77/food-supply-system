import authenticate from './authenticate.js';
import { NextResponse } from 'next/server';

/**
 * Middleware for API routes that require authentication
 * Automatically handles token expiration and sends appropriate error responses
 */
export async function requireAuth(request) {
  const auth = await authenticate(request);
  
  if (!auth) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجددا',
          statusCode: 401,
          code: 'TOKEN_EXPIRED'
        },
        { status: 401 }
      )
    };
  }

  return {
    authenticated: true,
    auth,
    response: null
  };
}
