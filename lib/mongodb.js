// lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_supply_system';

if (!MONGODB_URI) {
  throw new Error('يرجى تعريف متغير البيئة MONGODB_URI');
}

// Use globalThis for broader environment compatibility (Next.js, Vercel, Node)
let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    // rethrow after clearing promise so subsequent calls can retry
    throw e;
  }

  return cached.conn;
}

export default connectDB;