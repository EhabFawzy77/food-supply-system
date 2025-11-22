
// lib/middleware/logger.js
// تسجيل الطلبات
export function loggerMiddleware(handler) {
  return async (request, context) => {
    const start = Date.now();
    const { method, url } = request;

    console.log(`[${new Date().toISOString()}] ${method} ${url}`);

    const response = await handler(request, context);
    
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${response.status} (${duration}ms)`);

    return response;
  };
}