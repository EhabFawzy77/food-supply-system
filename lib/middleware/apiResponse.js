import { NextResponse } from 'next/server';

/**
 * API Error Response Handler
 * Provides consistent error responses across all API routes
 */
export function apiError(message, status = 400, additionalData = {}) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode: status,
      ...additionalData
    },
    { status }
  );
}

export function apiSuccess(data, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      statusCode: status
    },
    { status }
  );
}

export const ERRORS = {
  UNAUTHORIZED: { message: 'غير مصرح', status: 401 },
  TOKEN_EXPIRED: { message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجددا', status: 401 },
  FORBIDDEN: { message: 'ممنوع', status: 403 },
  NOT_FOUND: { message: 'غير موجود', status: 404 },
  INVALID_REQUEST: { message: 'طلب غير صحيح', status: 400 },
  SERVER_ERROR: { message: 'خطأ في الخادم', status: 500 }
};
