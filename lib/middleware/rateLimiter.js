
// lib/middleware/rateLimiter.js
// حد الطلبات (Rate Limiting)
import { NextResponse } from 'next/server';

const rateLimitMap = new Map();

export function rateLimit(limit = 100, windowMs = 60000) {
  return (handler) => {
    return async (request, context) => {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      
      const now = Date.now();
      const windowStart = now - windowMs;

      // تنظيف السجلات القديمة
      if (rateLimitMap.has(ip)) {
        const requests = rateLimitMap.get(ip).filter(time => time > windowStart);
        rateLimitMap.set(ip, requests);
      }

      const requests = rateLimitMap.get(ip) || [];

      if (requests.length >= limit) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'تم تجاوز الحد المسموح من الطلبات. حاول مرة أخرى لاحقاً.' 
          },
          { status: 429 }
        );
      }

      requests.push(now);
      rateLimitMap.set(ip, requests);

      return handler(request, context);
    };
  };
}
