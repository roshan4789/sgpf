const mongoose = require('mongoose');
const dotenv = require('dotenv');
const products = require('./data/products'); // Ensure this file exists!
const User = require('./models/userModel');
const Product = require('./models/productModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. CLEAR OLD PRODUCTS (But keep Users!)
    await Product.deleteMany(); 
    
    // 2. FIND YOUR ADMIN USER
    // We need an admin ID to "own" the products we are uploading
    const adminUser = await User.findOne({ isAdmin: true });
    
    if (!adminUser) {
        console.error("❌ Error: No Admin user found in database. Run 'node createAdmin.js' first.");
        process.exit(1);
    }

    // 3. PREPARE PRODUCTS
    // Add the admin's ID to every product
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser._id };
    });

    // 4. INSERT INTO DATABASE
    await Product.insertMany(sampleProducts);

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log('🔴 Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Check if user ran "node seeder.js -d" (to delete) or just "node seeder.js" (to import)
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}