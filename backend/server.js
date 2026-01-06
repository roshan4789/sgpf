const express = require('express');
const dotenv = require('dotenv');

// 1. LOAD ENV VARIABLES BEFORE ANYTHING ELSE
dotenv.config(); 

const connectDB = require('./config/db'); 
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const orderRoutes = require('./routes/orderRoutes'); 
const cors = require('cors');

// Connect to Database
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); 

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/orders', orderRoutes);

// Send Razorpay Key to Frontend
app.get('/api/config/razorpay', (req, res) => {
  res.send(process.env.RAZORPAY_KEY_ID);
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on port ${PORT}`));