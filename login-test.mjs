import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function testLogin() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_supply_system';
    
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    
    // Define User schema
    const UserSchema = new mongoose.Schema({
      username: String,
      password: String,
      fullName: String,
      email: String,
      role: String,
      permissions: [String],
      isActive: Boolean,
      lastLogin: Date,
      createdAt: { type: Date, default: Date.now }
    });

    // Add comparePassword method
    UserSchema.methods.comparePassword = function(enteredPassword) {
      return bcryptjs.compareSync(enteredPassword, this.password);
    };

    const User = mongoose.model('User', UserSchema);

    console.log('\n🔍 Checking users in database...');
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\n📝 Creating default admin user...');
      
      const salt = bcryptjs.genSaltSync(10);
      const hashedPassword = bcryptjs.hashSync('admin123', salt);
      
      const newUser = await User.create({
        username: 'admin',
        password: hashedPassword,
        fullName: 'المدير العام',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['manage_all'],
        isActive: true
      });
      
      console.log('✅ Admin user created');
      users.push(newUser);
    }

    console.log('\n👥 Available users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.fullName}) - Role: ${user.role}`);
    });

    // Try to login
    console.log('\n🔐 Testing login...');
    const adminUser = users.find(u => u.username === 'admin');
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    console.log(`Attempting to login as: ${adminUser.username}`);
    
    // Test password comparison
    const isPasswordCorrect = await adminUser.comparePassword('admin123');
    
    if (!isPasswordCorrect) {
      console.log('❌ Password is incorrect');
      console.log('Trying to update password...');
      
      const salt = bcryptjs.genSaltSync(10);
      const hashedPassword = bcryptjs.hashSync('admin123', salt);
      
      adminUser.password = hashedPassword;
      await adminUser.save();
      console.log('✅ Password updated to: admin123');
    } else {
      console.log('✅ Password is correct');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: adminUser._id,
        username: adminUser.username,
        role: adminUser.role,
        permissions: adminUser.permissions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('\n✅ JWT Token generated successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('─'.repeat(50));
    console.log(`Username: ${adminUser.username}`);
    console.log(`Password: admin123`);
    console.log(`Token: ${token}`);
    console.log('─'.repeat(50));
    
    console.log('\n💡 Steps to login:');
    console.log('1. Go to http://localhost:3010/login');
    console.log('2. Enter username: admin');
    console.log('3. Enter password: admin123');
    console.log('4. Click "تسجيل الدخول"');
    console.log('\nThe token will be stored in localStorage automatically.');
    console.log('It will be valid for 24 hours from now.');

    await mongoose.disconnect();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLogin();
