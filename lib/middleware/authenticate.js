import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Authenticate request using JWT token from Authorization header
 * Returns decoded token or null if authentication fails
 * For token expiration, check server logs for TokenExpiredError
 */
export default async function authenticate(request) {
  try {
    if (!request) {
      return null;
    }

    let authHeader = null;
    
    // Try to get authorization header
    if (request.headers) {
      // Next.js Request object with Headers API
      if (typeof request.headers.get === 'function') {
        authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      } 
      // Plain object headers (shouldn't happen in Next.js 16 but be safe)
      else if (typeof request.headers === 'object') {
        authHeader = request.headers['authorization'] || request.headers['Authorization'];
      }
    }

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH] Header present:', !!authHeader);
      if (authHeader) {
        console.log('[AUTH] Header format:', authHeader.substring(0, 20) + '...');
      }
    }

    if (!authHeader) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH] No authorization header found');
      }
      return null;
    }

    if (!authHeader.startsWith('Bearer ')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH] Invalid Bearer format');
      }
      return null;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH] No token after Bearer prefix');
      }
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH] Token verified for user:', decoded.username);
    }
    return decoded;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH] Token error:', err.name, '-', err.message);
      if (err.name === 'TokenExpiredError') {
        console.log('[AUTH] Token expired at:', new Date(err.expiredAt).toLocaleString());
        console.log('[AUTH] Current time:', new Date().toLocaleString());
      }
    }
    return null;
  }
}
