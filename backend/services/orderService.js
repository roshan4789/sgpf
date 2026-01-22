const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {Array} orderItems - Array of order items
 * @param {Number} itemsPrice - Total price of items
 * @returns {Object} Razorpay order details
 */
const createRazorpayOrder = async (orderItems, itemsPrice) => {
    if (!orderItems || orderItems.length === 0) {
        throw new Error('No order items provided');
    }

    // Validate all products exist and have sufficient stock
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
            throw new Error(`Product not found: ${item.product}`);
        }
        if (product.countInStock < item.qty) {
            throw new Error(`Insufficient stock for ${product.name}`);
        }
    }

    const amount = Math.round(itemsPrice * 100); // Convert to paise

    const options = {
        amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        };
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        throw new Error('Failed to create payment order');
    }
};

/**
 * Verify Razorpay payment and save order
 * @param {Object} paymentData - Payment verification data
 * @param {Object} user - User object
 * @returns {Object} Saved order
 */
const verifyAndSaveOrder = async (paymentData, user) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderItems,
        shippingAddress,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = paymentData;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        throw new Error('Invalid payment signature');
    }

    // Create order
    const order = await Order.create({
        user: user._id,
        orderItems,
        shippingAddress,
        paymentMethod: 'Razorpay',
        paymentResult: {
            id: razorpay_payment_id,
            status: 'paid',
            update_time: new Date(),
            email_address: user.email,
        },
        itemsPrice,
        taxPrice: taxPrice || 0,
        shippingPrice: shippingPrice || 0,
        totalPrice,
        isPaid: true,
        paidAt: new Date(),
    });

    // Update product stock
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            product.countInStock -= item.qty;
            await product.save();
        }
    }

    return order;
};

/**
 * Get user's orders
 * @param {String} userId - User ID
 * @returns {Array} User's orders
 */
const getUserOrders = async (userId) => {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return orders;
};

/**
 * Get all orders (Admin/Worker)
 * @returns {Array} All orders
 */
const getAllOrders = async () => {
    const orders = await Order.find({})
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 });
    return orders;
};

module.exports = {
    createRazorpayOrder,
    verifyAndSaveOrder,
    getUserOrders,
    getAllOrders,
};
