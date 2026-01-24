const asyncHandler = require('express-async-handler');
const Contact = require('../models/contactModel');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const contact = await Contact.create({
        name,
        email,
        phone,
        subject,
        message,
    });

    if (contact) {
        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!',
            contact: {
                _id: contact._id,
                name: contact.name,
                email: contact.email,
                subject: contact.subject,
            },
        });
    } else {
        res.status(400);
        throw new Error('Failed to submit contact form');
    }
});

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private/Admin
const getContactSubmissions = asyncHandler(async (req, res) => {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json(contacts);
});

// @desc    Update contact submission status
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateContactStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        res.status(404);
        throw new Error('Contact submission not found');
    }

    contact.status = status || contact.status;
    const updatedContact = await contact.save();

    res.json(updatedContact);
});

module.exports = {
    submitContactForm,
    getContactSubmissions,
    updateContactStatus,
};
