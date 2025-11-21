// app/api/auth/refresh/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Refresh token endpoint
 * Takes old token and returns a new one with extended expiration
 */
export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'لا يوجد توكن' },
        { status: 400 }
      );
    }

    // Verify token (even if expired)
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // If token is expired, decode without verification to get user info
      if (err.name === 'TokenExpiredError') {
        decoded = jwt.decode(token);
        if (!decoded) {
          return NextResponse.json(
            { success: false, error: 'توكن غير صحيح' },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'توكن غير صحيح' },
          { status: 401 }
        );
      }
    }

    // Create new token
    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
        permissions: decoded.permissions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json(
      {
        success: true,
        token: newToken,
        expiresIn: 86400 // 24 hours in seconds
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
