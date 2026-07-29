const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res);
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.status === 'suspended') {
    res.status(403);
    throw new Error('This account has been suspended. Contact support.');
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Logout - clears auth cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out' });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// @desc    Update profile (name, currency, monthly income target)
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, currency, monthlyIncomeTarget } = req.body;

  const user = await User.findById(req.user._id);
  if (name !== undefined) user.name = name;
  if (currency !== undefined) user.currency = currency;
  if (monthlyIncomeTarget !== undefined) user.monthlyIncomeTarget = monthlyIncomeTarget;

  await user.save();
  res.status(200).json({ success: true, user });
});

module.exports = { register, login, logout, getMe, updateMe };
