const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// --- HELPER: Reduce Stock Safely ---
const updateStock = async (orderItems) => {
    for (const item of orderItems) {
        const product = await Product.findById(item.id || item._id || item.product);
        if (product) {
            // Prevent negative stock
            product.countInStock = Math.max(0, product.countInStock - item.quantity);
            await product.save();
        }
    }
};

// @desc    Create new order & Initialize Razorpay
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, itemsPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // 1. VERIFY STOCK BEFORE PAYMENT
  for (const item of orderItems) {
      const product = await Product.findById(item.id || item._id);
      if (!product) {
          res.status(404);
          throw new Error(`Product not found: ${item.name}`);
      }
      if (product.countInStock < item.quantity) {
          res.status(400);
          throw new Error(`Out of Stock: ${product.name}`);
      }
  }

  // 2. INITIALIZE RAZORPAY
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: Math.round(itemsPrice * 100), // Amount in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1, // Auto-capture payment
  };

  try {
      const razorpayOrder = await razorpay.orders.create(options);

      // 3. CREATE ORDER IN DB (Pending Payment)
      const order = new Order({
        user: req.user._id,
        orderItems: orderItems.map((x) => ({
          ...x,
          product: x.id || x._id,
        })),
        itemsPrice,
        paymentMethod: "Razorpay",
        paymentResult: {
          id: razorpayOrder.id,
          status: 'created',
        },
      });

      const createdOrder = await order.save();

      res.status(201).json({
        ...createdOrder._doc,
        id: razorpayOrder.id, // Order ID for Frontend
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      });
  } catch (error) {
      res.status(500);
      throw new Error('Razorpay Error: ' + error.message);
  }
});

// @desc    Verify Payment, Handle Retries & Reduce Stock
// @route   POST /api/orders/verify
// @access  Private
const verifyOrder = asyncHandler(async (req, res) => {
  const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      shippingAddress 
  } = req.body;

  // 1. FIND ORDER
  const order = await Order.findOne({ 'paymentResult.id': razorpay_order_id });
  if (!order) {
      res.status(404);
      throw new Error('Order not found');
  }

  // 🛡️ IDEMPOTENCY CHECK (Fixes Retry Handling)
  // If order is already paid, return success immediately.
  // This prevents double-stock reduction or crashes on page refresh.
  if (order.isPaid) {
      return res.json({ message: "Order already verified", order });
  }

  // 2. CRYPTOGRAPHIC VERIFICATION (Fixes Blind Trust)
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
      // 3. MARK AS PAID
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'success',
        update_time: Date.now(),
        email_address: req.user.email,
      };
      
      if(shippingAddress) {
          order.shippingAddress = shippingAddress;
      }

      // 4. REDUCE STOCK (Only happens once due to Idempotency check above)
      await updateStock(order.orderItems);
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
  } else {
      res.status(400);
      throw new Error('Invalid Payment Signature');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name')
    .sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = { addOrderItems, verifyOrder, getMyOrders, getOrders };