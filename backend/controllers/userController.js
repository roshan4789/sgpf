const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  // 'email' here actually holds whatever the user typed (Email, Phone, or Username)
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide login credentials');
  }

  // Search by Email OR Phone OR Username
  const user = await User.findOne({ 
    $or: [ 
        { email: email }, 
        { phone: email },
        { username: email } // 👈 ADDED THIS CHECK
    ] 
  });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username, // 👈 Send username back to frontend
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      cart: user.cart,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid username, email, phone or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, isAdmin } = req.body;

  // 1. INPUT VALIDATION
  if (!name || !email || !phone || !password) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  // Basic Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Invalid email format');
  }

  // Phone Validation (Simple check)
  if (phone.length < 10) {
    res.status(400);
    throw new Error('Phone number must be at least 10 digits');
  }

  // 2. CHECK FOR DUPLICATES
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });

  if (userExists) {
    res.status(400);
    if (userExists.email === email) {
        throw new Error('User with this Email already exists');
    } else {
        throw new Error('User with this Phone already exists');
    }
  }

  // 3. CREATE USER
  const user = await User.create({
    name,
    email,
    phone,
    password,
    isAdmin: isAdmin || false
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      addresses: user.addresses,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    if (req.body.cart) {
      user.cart = req.body.cart;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.address) {
        user.addresses = user.addresses || [];
        user.addresses.push(req.body.address);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      isAdmin: updatedUser.isAdmin,
      cart: updateUser.cart,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { authUser, registerUser, getUserProfile, updateUserProfile };