const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/userModel');

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    // 1. DEFINE YOUR NEW CREDENTIALS HERE
    const newAdmin = {
      name: "Admin",
      username: "admin",
      email: "admin@example.com",     // CHANGE THIS
      phone: "9999999999",           // CHANGE THIS
      password: "StrongPassword123!", // CHANGE THIS TO YOUR STRONG PASSWORD
      isAdmin: true,
    };

    // 2. DELETE OLD ADMINS (Optional: Cleans up old accounts)
    // This deletes ANY user with the same email or phone to prevent duplicates
    await User.deleteMany({ email: newAdmin.email });
    await User.deleteMany({ phone: newAdmin.phone });

    // 3. CREATE THE NEW ADMIN
    const user = await User.create(newAdmin);

    console.log('-----------------------------------');
    console.log('✅ ADMIN CREATED SUCCESSFULLY!');
    console.log(`👤 Name: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Password: ${newAdmin.password}`);
    console.log('-----------------------------------');

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();