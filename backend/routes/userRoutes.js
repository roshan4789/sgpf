const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, updateUserProfile, getWishlist, updateWishlist } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import protect

router.post('/', registerUser);
router.post('/login', authUser);

// 🔒 PROTECTED PROFILE ROUTES
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// 🔒 WISHLIST ROUTES
router.route('/wishlist')
    .get(protect, getWishlist)
    .put(protect, updateWishlist);

module.exports = router;