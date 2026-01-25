const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '.env');
console.log('\n--- 🔍 EC2 BACKEND DIAGNOSTIC TOOL ---\n');

if (fs.existsSync(envPath)) {
    console.log('✅ .env file found at:', envPath);
    dotenv.config({ path: envPath });
} else {
    console.error('❌ .env file NOT found at:', envPath);
    console.error('   👉 FIX: Create a .env file in this directory with your secrets.');
}

// Check Critical Variables
const checks = [
    { key: 'PORT', required: false, default: 5000 },
    { key: 'MONGO_URI', required: true },
    { key: 'JWT_SECRET', required: true },
    { key: 'RAZORPAY_KEY_ID', required: false },
    { key: 'CLOUDINARY_CLOUD_NAME', required: false },
];

console.log('\n--- 🛠 Checking Environment Variables ---');
let hasError = false;

checks.forEach(check => {
    const value = process.env[check.key];
    if (value) {
        console.log(`✅ ${check.key} is set.`);
    } else if (check.required) {
        console.error(`❌ ${check.key} is MISSING! This is critical.`);
        hasError = true;
    } else {
        console.warn(`⚠️  ${check.key} is missing (using default/optional).`);
    }
});

if (hasError) {
    console.log('\n❌ CRITICAL ENV VARS MISSING. Server will likely fail to start.');
} else {
    console.log('\n✅ Environment variables look okay.');
    testDbConnection();
}

async function testDbConnection() {
    console.log('\n--- ⏳ Testing Database Connection ---');
    console.log('   Target:', process.env.MONGO_URI);

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected Successfully!');
        console.log('   The server should be able to connect.');
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB Connection FAILED:');
        console.error(`   ${error.message}`);
        console.log('\n👉 COMMON CAUSES:');
        console.log('   1. IP Whitelist: Go to MongoDB Atlas -> Network Access -> Add IP Address -> Allow Access from Anywhere (0.0.0.0/0) or add your EC2 Public IP.');
        console.log('   2. Invalid Credentials: Check username/password in MONGO_URI.');
        console.log('   3. Database Down: Ensure the cluster is active.');
        process.exit(1);
    }
}
