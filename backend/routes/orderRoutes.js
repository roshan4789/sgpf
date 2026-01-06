const express = require('express');
const router = express.Router();
const { addOrderItems, verifyOrder, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems);
router.route('/verify').post(protect, verifyOrder);
router.route('/myorders').get(protect, getMyOrders);

module.exports = router;