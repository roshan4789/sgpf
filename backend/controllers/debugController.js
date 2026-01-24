const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Development-only: list users (email, username, phone, roles)
const listUsers = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403);
    throw new Error('Debug endpoints disabled in production');
  }

  const users = await User.find({}, 'email username phone isWorker isAdmin').lean();
  res.json(users);
});

// Development-only: force-create worker account
const createWorkerAccount = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403);
    throw new Error('Debug endpoints disabled in production');
  }

  const workerEmail = 'worker@ganpati.com';
  const workerPhone = '9999999997';

  // Delete old worker if exists
  await User.deleteOne({ email: workerEmail });

  // Create fresh worker
  const worker = await User.create({
    name: 'Worker',
    username: 'worker',
    email: workerEmail,
    phone: workerPhone,
    password: 'worker123',
    isAdmin: false,
    isWorker: true
  });

  res.json({ message: 'Worker account created', worker: { email: worker.email, phone: worker.phone, isWorker: worker.isWorker } });
});

module.exports = { listUsers, createWorkerAccount };
