const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/userModel');

dotenv.config();
connectDB();

const grantRoles = async () => {
    try {
        const email = process.argv[2];

        if (!email) {
            console.error('❌ Please provide an email address.');
            console.log('Usage: node backend/grant_roles.js <email>');
            process.exit(1);
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`❌ User with email ${email} not found.`);
            process.exit(1);
        }

        user.isAdmin = true;
        user.isWorker = true;
        await user.save();

        console.log('\n===================================');
        console.log(`✅ Roles updated for ${user.name} (${user.email})!`);
        console.log('   👑 Admin Access: GRANTED');
        console.log('   👷 Worker Access: GRANTED');
        console.log('===================================\n');

        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

grantRoles();
