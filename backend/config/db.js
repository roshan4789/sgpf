const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shri_ganpati_db');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ DATABASE ERROR: ${error.message}`);
    console.error("⚠️  SUGGESTION: Make sure MongoDB Community Server is installed and RUNNING.");
    // We removed process.exit(1) so the server stays alive to tell you the error!
  }
};

module.exports = connectDB;