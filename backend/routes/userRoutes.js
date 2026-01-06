const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/userModel'); // Import User model directly for the reset function
const asyncHandler = require('express-async-handler');

router.post('/', registerUser);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// --- 🛑 EMERGENCY RESET ROUTE ---
// VISITING THIS LINK WILL WIPE YOUR USER DATABASE
router.get('/emergency-reset', asyncHandler(async (req, res) => {
    await User.deleteMany({}); // Deletes everyone
    
    // Create a fresh Admin
    const admin = await User.create({
        name: "Admin User",
        email: "admin@sgpf.com",
        phone: "9999999999",
        password: "admin", // Simple password
        isAdmin: true // <--- THIS MAKES IT A STAFF ACCOUNT
    });

    res.send(`
        <h1>✅ Database Cleared</h1>
        <p>All previous users have been deleted.</p>
        <p><strong>New Staff/Admin Account Created:</strong></p>
        <ul>
            <li>Phone: <strong>9999999999</strong></li>
            <li>Password: <strong>admin</strong></li>
        </ul>
        <a href="http://localhost:5173/login">Go back to Login</a>
    `);
}));

module.exports = router;