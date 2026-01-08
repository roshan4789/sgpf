const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import protect
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { message: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true, 
    legacyHeaders: false, 
});

router.post('/', registerUser);
router.post('/login', loginLimiter, authUser);

// 🔒 PROTECTED PROFILE ROUTES
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

module.exports = router;