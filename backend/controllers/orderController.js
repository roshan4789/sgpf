const asyncHandler = require('express-async-handler');
const orderService = require('../services/orderService'); // 👈 Imports the Service Layer

// @desc    Initialize Payment (Delegate to Service)
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  try {
    const { orderItems, itemsPrice } = req.body;
    
    // 1. Call Service to handle Logic & Razorpay
    const response = await orderService.createRazorpayOrder(orderItems, itemsPrice);
    
    // 2. Return result
    res.status(200).json(response);
  } catch (error) {
    res.status(400); 
    throw new Error(error.message);
  }
});

// @desc    Verify & Save Order (Delegate to Service)
// @route   POST /api/orders/verify
// @access  Private
const verifyOrder = asyncHandler(async (req, res) => {
  try {
    // 1. Call Service to Verify Signature, Save DB, Reduce Stock
    const order = await orderService.verifyAndSaveOrder(req.body, req.user);
    
    // 2. Return the saved order
    res.status(201).json(order);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get my orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id);
  res.json(orders);
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders();
  res.json(orders);
});

module.exports = { addOrderItems, verifyOrder, getMyOrders, getOrders };