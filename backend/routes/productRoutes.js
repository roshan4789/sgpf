const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// 1. PUBLIC ROUTES (Order matters!)
router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/top').get(getTopProducts); // Keep specific routes BEFORE /:id

// 2. REVIEW ROUTE
router.route('/:id/reviews').post(protect, createProductReview);

// 3. ID ROUTES (Must be last so 'top' isn't treated as an ID)
router
  .route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

// Notification route
router.post('/notify', protect, (req, res) => {
    res.json({ message: "Notification Subscribed" });
});

module.exports = router;