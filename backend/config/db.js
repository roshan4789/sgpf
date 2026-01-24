const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  while (retries > 0) {
    try {
      // Attempt to connect
      const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shri_ganpati_db');
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ DATABASE ERROR: ${error.message}`);
      retries -= 1;
      console.log(`Stubbornly retrying... (${retries} attempts left)`);
      if (retries === 0) {
        console.error("⚠️  SUGGESTION: Make sure MongoDB Community Server is installed and RUNNING.");
        throw error;
      }
      // Wait 5 seconds before retrying
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

module.exports = connectDB;