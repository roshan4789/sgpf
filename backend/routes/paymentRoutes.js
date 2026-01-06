const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: 'YOUR_KEY_ID_HERE',
  key_secret: 'YOUR_KEY_SECRET_HERE',
});

router.post('/order', async (req, res) => {
  const options = {
    amount: req.body.amount * 100, // Amount in paise (multiply by 100)
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;