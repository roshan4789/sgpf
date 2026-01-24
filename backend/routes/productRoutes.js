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
  getRelatedProducts,
  getCategoryHierarchy,
  updateProductStock,
} = require('../controllers/productController');
const { protect, admin, worker } = require('../middleware/authMiddleware');

// 1. PUBLIC ROUTES (Order matters!)
router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/top').get(getTopProducts);
router.route('/categories').get(getCategoryHierarchy); // New route for category hierarchy

// 2. REVIEW ROUTE
router.route('/:id/reviews').post(protect, createProductReview);

// 3. RELATED ROUTE
router.route('/:id/related').get(getRelatedProducts);

// 3.5 STOCK UPDATE ROUTE (Worker or Admin)
router.route('/:id/stock').put(protect, (req, res, next) => {
  if (req.user && (req.user.isAdmin || req.user.isWorker)) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as admin or worker');
  }
}, updateProductStock);

// 4. ID ROUTES (Must be last so 'top' isn't treated as an ID)
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