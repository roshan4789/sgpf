const express = require('express');
const router = express.Router();
const { addOrderItems, verifyOrder, getMyOrders, getOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/verify').post(protect, verifyOrder);
router.route('/myorders').get(protect, getMyOrders);

module.exports = router;