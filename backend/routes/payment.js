const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create an Order
router.post('/orders', async (req, res) => {
    try {
        const options = {
            amount: req.body.amount * 100, // Amount in paise (500 INR = 50000 paise)
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };

        const order = await instance.orders.create(options);
        res.status(200).json({ data: order });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

// 2. Verify Payment (Webhook or Frontend Handler)
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

module.exports = router;