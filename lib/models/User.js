// lib/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['admin', 'user'], 
    default: 'user' 
  },
  permissions: {
    sales: { type: Boolean, default: true },
    purchases: { type: Boolean, default: false },
    inventory: { type: Boolean, default: true },
    customers: { type: Boolean, default: true },
    suppliers: { type: Boolean, default: false },
    reports: { type: Boolean, default: false },
    users: { type: Boolean, default: false },
    settings: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// تشفير كلمة المرور قبل الحفظ
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// مقارنة كلمة المرور
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// تعيين الصلاحيات حسب الدور
UserSchema.pre('save', function(next) {
  if (this.role === 'admin') {
    this.permissions = {
      sales: true,
      purchases: true,
      inventory: true,
      customers: true,
      suppliers: true,
      reports: true,
      users: true,
      settings: true
    };
  } else if (this.role === 'user') {
    this.permissions = {
      sales: true,
      purchases: true,
      inventory: true,
      customers: true,
      suppliers: false,
      reports: false,
      users: false,
      settings: false
    };
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema)