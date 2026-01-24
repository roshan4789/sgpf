const express = require('express');
const router = express.Router();
const {
    submitContactForm,
    getContactSubmissions,
    updateContactStatus,
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route for submitting contact form
router.route('/').post(submitContactForm).get(protect, admin, getContactSubmissions);

// Admin route for updating contact status
router.route('/:id').put(protect, admin, updateContactStatus);

module.exports = router;
