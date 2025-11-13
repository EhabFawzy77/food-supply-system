import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function authenticate(request) {
  try {
    // Handle both Next.js Request and raw header objects
    let authHeader = null;
    
    if (request.headers instanceof Headers || typeof request.headers.get === 'function') {
      // Next.js Request object with Headers API
      authHeader = request.headers.get('authorization');
    } else if (typeof request.headers === 'object') {
      // Plain object headers
      authHeader = request.headers.authorization || request.headers['authorization'];
    }

    console.log('Auth header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Invalid or missing Bearer token');
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token extraction failed');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified for user:', decoded.userId);
    return decoded;
  } catch (err) {
    console.error('Authentication error:', err.message);
    return null;
  }
}
