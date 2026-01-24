const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/userModel');

dotenv.config();
connectDB();

const createAdminAndWorker = async () => {
  try {
    // 1. ADMIN CREDENTIALS
    const newAdmin = {
      name: "Admin",
      username: "admin",
      email: "admin@ganpati.com",
      phone: "9999999998",
      password: "admin123",
      isAdmin: true,
      isWorker: false,
    };

    // 2. WORKER CREDENTIALS
    const newWorker = {
      name: "Worker",
      username: "worker",
      email: "worker@ganpati.com",
      phone: "9999999999",
      password: "worker123",
      isAdmin: false,
      isWorker: true,
    };

    // 3. DELETE OLD ACCOUNTS (Prevents duplicates)
    await User.deleteMany({ email: { $in: [newAdmin.email, newWorker.email] } });
    await User.deleteMany({ phone: { $in: [newAdmin.phone, newWorker.phone] } });

    // 4. CREATE ADMIN AND WORKER
    const admin = await User.create(newAdmin);
    const worker = await User.create(newWorker);

    console.log('\n===================================');
    console.log('✅ ADMIN & WORKER CREATED!');
    console.log('===================================\n');
    
    console.log('👨‍💼 ADMIN ACCOUNT:');
    console.log(`   📧 Email: ${admin.email}`);
    console.log(`   🔑 Password: ${newAdmin.password}`);
    console.log(`   📱 Phone: ${admin.phone}\n`);
    
    console.log('👷 WORKER ACCOUNT:');
    console.log(`   📧 Email: ${worker.email}`);
    console.log(`   🔑 Password: ${newWorker.password}`);
    console.log(`   📱 Phone: ${worker.phone}\n`);
    
    console.log('===================================\n');

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

createAdminAndWorker();