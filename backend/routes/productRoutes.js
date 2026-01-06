const express = require('express');
const router = express.Router();
const { getProducts, deleteProduct, createProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/:id').delete(protect, admin, deleteProduct);

// Notify Route (Simple placeholder logic)
router.post('/notify', (req, res) => {
    // In a real app, you would save this to a Notification collection
    res.json({ message: "Notification Subscribed" });
});

module.exports = router;