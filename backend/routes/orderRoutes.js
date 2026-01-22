const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  verifyOrder,
  getMyOrders,
  getOrders,
  getPendingOrders,
  updateOrderStatus,
  getOrderById,
  trackOrder
} = require('../controllers/orderController');
const { protect, admin, worker } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/verify').post(protect, verifyOrder);
router.route('/myorders').get(protect, getMyOrders);
router.route('/track').post(trackOrder); // Public route for order tracking

// Worker routes
router.route('/worker/pending').get(protect, worker, getPendingOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, worker, updateOrderStatus);

router.post('/paytm/callback', async (req, res) => {
    console.log('Paytm callback received');
    res.status(200).send('OK');
});

module.exports = router;