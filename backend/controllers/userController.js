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
      { username: email }
    ]
  });

  // Diagnostics: log attempt (avoid logging raw password)
  console.debug(`[authUser] login attempt for identifier='${email}'`);
  console.debug(`[authUser] user found: ${user ? 'YES' : 'NO'}`);

  const passwordMatches = user ? await user.matchPassword(password) : false;
  console.debug(`[authUser] password match: ${passwordMatches ? 'YES' : 'NO'}`);

  if (user && passwordMatches) {
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      isWorker: user.isWorker,
      addresses: user.addresses,
      cart: user.cart,
      wishlist: user.wishlist,
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
      wishlist: user.wishlist,
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
      wishlist: user.wishlist,
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
  console.log('[updateUserProfile] Starting update for user:', req.user._id);
  console.log('[updateUserProfile] Request body:', JSON.stringify(req.body));

  const user = await User.findById(req.user._id);

  if (user) {
    console.log('[updateUserProfile] User found, applying updates...');
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
      user.markModified('addresses'); // Explicitly mark mixed array as modified
      console.log('[updateUserProfile] Added address, total addresses:', user.addresses.length);
    }
    if (req.body.addresses) {
      user.addresses = req.body.addresses;
      console.log('[updateUserProfile] Set addresses array, total:', user.addresses.length);
    }

    console.log('[updateUserProfile] Saving user...');
    try {
      const updatedUser = await user.save();
      console.log('[updateUserProfile] User saved successfully');

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        isAdmin: updatedUser.isAdmin,
        isWorker: updatedUser.isWorker,
        addresses: updatedUser.addresses,
        cart: updatedUser.cart,
        wishlist: updatedUser.wishlist,
        token: generateToken(updatedUser._id),
      });
    } catch (saveError) {
      console.error('[updateUserProfile] Error saving user:', saveError);
      res.status(500);
      throw saveError;
    }
  } else {
    console.log('[updateUserProfile] User not found');
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  if (user) {
    res.json(user.wishlist);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user wishlist (Toggle)
// @route   PUT /api/users/wishlist
// @access  Private
const updateWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    const alreadyAdded = user.wishlist.find((id) => id.toString() === productId);

    if (alreadyAdded) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json(user.wishlist);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { authUser, registerUser, getUserProfile, updateUserProfile, getWishlist, updateWishlist };