const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/orderModel'); // We will create this model next

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create new order (Razorpay)
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, itemsPrice } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // 1. Create Razorpay Order
  const options = {
    amount: itemsPrice * 100, // Amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  res.status(201).json({
    id: razorpayOrder.id,
    currency: razorpayOrder.currency,
    amount: razorpayOrder.amount,
  });
});

// @desc    Verify Payment & Save Order
// @route   POST /api/orders/verify
// @access  Private
const verifyOrder = asyncHandler(async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    orderItems,
    itemsPrice,
    shippingAddress 
  } = req.body;

  // Verify Signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // Payment Successful -> Save to DB
    const order = new Order({
      user: req.user._id,
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x._id || x.id,
      })),
      shippingAddress,
      paymentMethod: "Razorpay",
      paymentResult: {
        id: razorpay_payment_id,
        status: "paid",
        update_time: Date.now(),
        email_address: req.user.email,
      },
      itemsPrice,
      isPaid: true,
      paidAt: Date.now(),
    });

    const createdOrder = await order.save();
    res.json(createdOrder);
  } else {
    res.status(400);
    throw new Error("Payment Verification Failed");
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

module.exports = { addOrderItems, verifyOrder, getMyOrders };