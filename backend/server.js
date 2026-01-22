const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 1. LOAD ENV VARIABLES BEFORE ANYTHING ELSE
dotenv.config();

const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const contactRoutes = require('./routes/contactRoutes');
const cors = require('cors');
const User = require('./models/userModel');
const debugRoutes = require('./routes/debugRoutes');
// Import the new Safety Net
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Connect to Database
// connectDB() is now called in startServer()

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory at:', uploadsDir);
  } else {
    console.log('✅ Uploads directory exists at:', uploadsDir);
  }
  // Verify write permissions
  const testFile = path.join(uploadsDir, '.test-write');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✅ Uploads directory is writable');
} catch (error) {
  console.error('❌ Error setting up uploads directory:', error.message);
  console.error('   Directory path:', uploadsDir);
  process.exit(1);
}


app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase JSON payload limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Support URL-encoded bodies 

// --- ROUTE HANDLERS ---
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);
// Development-only debug routes
app.use('/api/debug', debugRoutes);

// Send Razorpay Key to Frontend
app.get('/api/config/razorpay', (req, res) => {
  res.send(process.env.RAZORPAY_KEY_ID);
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Make the 'uploads' folder static (publicly accessible)
// This must be BEFORE the error handlers
app.use('/uploads', express.static(uploadsDir, {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: (res, path) => {
    res.set('x-timestamp', Date.now().toString());
  }
}));

// --- 🛑 ERROR HANDLERS (Must be at the bottom) ---
app.use(notFound);      // 1. Catch 404s
app.use(errorHandler);  // 2. Catch server crashes & bad tokens

const PORT = process.env.PORT || 5000;

// Ensure default admin & worker accounts exist (development convenience)
const ensureDefaultAccounts = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const workerEmail = process.env.DEFAULT_WORKER_EMAIL;

    if (!adminEmail || !process.env.DEFAULT_ADMIN_PASSWORD) {
      console.warn('⚠️  Values for DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD not found in .env. Skipping default admin check.');
    } else {
      const adminPhone = process.env.DEFAULT_ADMIN_PHONE || '0000000000';
      const admin = await User.findOne({ email: adminEmail });
      if (!admin) {
        await User.create({
          name: 'Admin',
          username: 'admin',
          email: adminEmail,
          phone: adminPhone,
          password: process.env.DEFAULT_ADMIN_PASSWORD,
          isAdmin: true,
          isWorker: false
        });
        console.log('✅ Default ADMIN created from .env');
      } else {
        console.log('ℹ️  Default ADMIN already exists.');
      }
    }

    if (!workerEmail || !process.env.DEFAULT_WORKER_PASSWORD) {
      console.warn('⚠️  Values for DEFAULT_WORKER_EMAIL or DEFAULT_WORKER_PASSWORD not found in .env. Skipping default worker check.');
    } else {
      const workerPhone = process.env.DEFAULT_WORKER_PHONE || '0000000000';
      const worker = await User.findOne({ email: workerEmail });
      if (!worker) {
        await User.create({
          name: 'Worker',
          username: 'worker',
          email: workerEmail,
          phone: workerPhone,
          password: process.env.DEFAULT_WORKER_PASSWORD,
          isAdmin: false,
          isWorker: true
        });
        console.log('✅ Default WORKER created from .env');
      } else {
        console.log('ℹ️  Default WORKER already exists.');
      }
    }
  } catch (err) {
    console.error('❌ Error ensuring default accounts:', err.message);
  }
};

const startServer = async () => {
  try {
    // 1. Connect to Database (with retries)
    await connectDB();

    // 2. Ensure accounts
    await ensureDefaultAccounts();

    // 3. Start Server
    app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on port ${PORT}`));

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();