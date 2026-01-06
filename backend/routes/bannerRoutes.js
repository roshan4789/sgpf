const express = require('express');
const router = express.Router();
const Banner = require('../models/bannerModel');
const { protect, admin } = require('../middleware/authMiddleware');

// Get Banners
router.get('/', async (req, res) => {
  const banners = await Banner.find({});
  res.json(banners);
});

// Update Banners (Admin Only)
// We will use a bulk update/replace logic for simplicity
router.post('/', protect, admin, async (req, res) => {
    await Banner.deleteMany({}); // Clear old banners
    const banners = await Banner.insertMany(req.body); // Insert new ones
    res.json(banners);
});

module.exports = router;