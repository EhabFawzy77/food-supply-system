import mongoose from 'mongoose';

async function checkDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_supply_system';
    
    console.log('Connecting to:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database successfully');

    // Get database stats
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📊 Collections in database:');
    collections.forEach(col => {
      console.log('  -', col.name);
    });

    // Count documents in each collection
    console.log('\n📈 Document counts:');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  ${col.name}: ${count} documents`);
    }

    // Get users
    console.log('\n👥 Users:');
    const users = await mongoose.connection.collection('users').find({}).toArray();
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.fullName}) - Role: ${user.role}`);
    });

    // Get products count
    console.log('\n📦 Products:');
    const products = await mongoose.connection.collection('products').find({}).limit(5).toArray();
    console.log(`  Total products: ${await mongoose.connection.collection('products').countDocuments()}`);
    if (products.length > 0) {
      console.log(`  Sample products: ${products.map(p => p.name).join(', ')}`);
    }

    // Get suppliers count
    console.log('\n🏢 Suppliers:');
    const suppliers = await mongoose.connection.collection('suppliers').find({}).toArray();
    console.log(`  Total suppliers: ${suppliers.length}`);
    if (suppliers.length > 0) {
      suppliers.slice(0, 3).forEach(s => {
        console.log(`  - ${s.name}`);
      });
    }

    // Get customers count
    console.log('\n👨‍💼 Customers:');
    const customers = await mongoose.connection.collection('customers').find({}).toArray();
    console.log(`  Total customers: ${customers.length}`);
    if (customers.length > 0) {
      customers.slice(0, 3).forEach(c => {
        console.log(`  - ${c.name}`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Database check complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
