const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Order = require('./models/orderModel');
const User = require('./models/userModel');
const Product = require('./models/productModel');

dotenv.config();
connectDB();

const seedOrders = async () => {
  try {
    // Get a user and products
    const user = await User.findOne({ email: 'admin@ganpati.com' });
    const products = await Product.find().limit(3);

    if (!user || products.length === 0) {
      console.log('⚠️  No users or products found. Please create products first.');
      process.exit();
    }

    // Delete existing orders
    await Order.deleteMany({});

    // Sample orders with different statuses
    const sampleOrders = [
      {
        user: user._id,
        orderItems: [
          {
            name: products[0]?.name || 'Premium Frame',
            quantity: 2,
            image: products[0]?.image || 'https://via.placeholder.com/300',
            price: 1250,
            product: products[0]?._id,
          }
        ],
        shippingAddress: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400001',
        },
        paymentMethod: 'razorpay',
        itemsPrice: 2500,
        isPaid: true,
        paidAt: new Date(),
        orderStatus: 'pending',
        lastUpdate: new Date().toLocaleDateString() + ' - Order Pending',
      },
      {
        user: user._id,
        orderItems: [
          {
            name: products[1]?.name || 'Religious Poster',
            quantity: 1,
            image: products[1]?.image || 'https://via.placeholder.com/300',
            price: 450,
            product: products[1]?._id,
          }
        ],
        shippingAddress: {
          street: '456 Oak Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zip: '110001',
        },
        paymentMethod: 'razorpay',
        itemsPrice: 450,
        isPaid: true,
        paidAt: new Date(),
        orderStatus: 'processing',
        trackingId: 'TRK-002',
        courier: 'FedEx',
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date().toLocaleDateString() + ' - Processing',
      },
      {
        user: user._id,
        orderItems: [
          {
            name: products[2]?.name || 'Tanjore Art',
            quantity: 1,
            image: products[2]?.image || 'https://via.placeholder.com/300',
            price: 3200,
            product: products[2]?._id,
          }
        ],
        shippingAddress: {
          street: '789 Pine Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zip: '560001',
        },
        paymentMethod: 'razorpay',
        itemsPrice: 3200,
        isPaid: true,
        paidAt: new Date(),
        orderStatus: 'shipped',
        trackingId: 'TRK-003',
        courier: 'DHL',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date().toLocaleDateString() + ' - Out for Delivery',
      },
      {
        user: user._id,
        orderItems: [
          {
            name: products[0]?.name || 'Premium Frame',
            quantity: 3,
            image: products[0]?.image || 'https://via.placeholder.com/300',
            price: 1250,
            product: products[0]?._id,
          }
        ],
        shippingAddress: {
          street: '321 Elm Street',
          city: 'Pune',
          state: 'Maharashtra',
          zip: '411001',
        },
        paymentMethod: 'razorpay',
        itemsPrice: 3750,
        isPaid: true,
        paidAt: new Date(),
        orderStatus: 'delivered',
        trackingId: 'TRK-001',
        courier: 'FedEx',
        isDelivered: true,
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString() + ' - Delivered',
      }
    ];

    // Create orders
    await Order.insertMany(sampleOrders);

    console.log('\n===================================');
    console.log('✅ SAMPLE ORDERS CREATED!');
    console.log('===================================\n');
    console.log('📦 Created 4 sample orders:');
    console.log('   1. Pending Order');
    console.log('   2. Processing Order');
    console.log('   3. Shipped Order');
    console.log('   4. Delivered Order\n');
    console.log('✨ Worker Dashboard now has data to display!\n');
    console.log('===================================\n');

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedOrders();
