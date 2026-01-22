const asyncHandler = require('express-async-handler');
const orderService = require('../services/orderService');
const Order = require('../models/orderModel');

// @desc    Initialize Payment
// @route   POST /api/orders
// @access  Private
  const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod: 'PENDING',
    isPaid: false,
    orderStatus: 'pending'
  });

  const createdOrder = await order.save();

  res.status(201).json({
    message: 'Order created',
    orderId: createdOrder._id
  });
});

// @desc    Verify & Save Order
// @route   POST /api/orders/verify
// @access  Private
const verifyOrder = asyncHandler(async (req, res) => {
  try {
    const order = await orderService.verifyAndSaveOrder(req.body, req.user);
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

// @desc    Get all orders (Admin & Worker)
// @route   GET /api/orders
// @access  Private/Admin/Worker
const getOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders();
  res.json(orders);
});

// @desc    Get pending orders (Worker)
// @route   GET /api/orders/worker/pending
// @access  Private/Worker
const getPendingOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ orderStatus: { $in: ['pending', 'processing'] } })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order status (Worker)
// @route   PUT /api/orders/:id/status
// @access  Private/Worker
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingId, courier, estimatedDelivery } = req.body;

  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

if (orderStatus && !allowedStatuses.includes(orderStatus)) {
  res.status(400);
  throw new Error('Invalid order status');
}


  let order;

try {
  order = await Order.findById(req.params.id);
} catch (error) {
  res.status(400);
  throw new Error('Invalid order ID');
}

if (!order) {
  res.status(404);
  throw new Error('Order not found');
}


  order.orderStatus = orderStatus || order.orderStatus;
  order.trackingId = trackingId || order.trackingId;
  order.courier = courier || order.courier;
  order.estimatedDelivery = estimatedDelivery || order.estimatedDelivery;
  order.lastUpdate = `${new Date().toLocaleDateString()} - Order ${orderStatus}`;

  if (orderStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Get order by ID (Worker/Admin)
// @route   GET /api/orders/:id
// @access  Private/Worker/Admin
const getOrderById = asyncHandler(async (req, res) => {
  let order;

try {
  order = await Order.findById(req.params.id).populate('user', 'name email phone address');
} catch (error) {
  res.status(400);
  throw new Error('Invalid order ID');
}

if (!order) {
  res.status(404);
  throw new Error('Order not found');
}

  res.json(order);
});

// @desc    Track order by order ID (Public)
// @route   POST /api/orders/track
// @access  Public
const trackOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    res.status(400);
    throw new Error('Please provide an order ID');
  }

  let order;

try {
  order = await Order.findById(orderId).populate('user', 'name email');
} catch (error) {
  res.status(400);
  throw new Error('Invalid order ID');
}

if (!order) {
  res.status(404);
  throw new Error('Order not found. Please check your order ID and try again.');
}


  // Return order details without sensitive user information
  res.json({
    _id: order._id,
    orderItems: order.orderItems,
    shippingAddress: order.shippingAddress,
    orderStatus: order.orderStatus,
    trackingId: order.trackingId,
    trackingUrl: order.trackingUrl,
    courier: order.courier,
    estimatedDelivery: order.estimatedDelivery,
    lastUpdate: order.lastUpdate,
    isPaid: order.isPaid,
    paidAt: order.paidAt,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt,
    createdAt: order.createdAt,
    itemsPrice: order.itemsPrice,
  });
});

module.exports = {
  addOrderItems,
  verifyOrder,
  getMyOrders,
  getOrders,
  getPendingOrders,
  updateOrderStatus,
  getOrderById,
  trackOrder
};