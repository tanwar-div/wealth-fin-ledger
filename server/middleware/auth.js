const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Protect routes - verifies JWT from Authorization header or httpOnly cookie
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user no longer exists');
    }

    if (user.status === 'suspended') {
      res.status(403);
      throw new Error('This account has been suspended');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }
});

module.exports = { protect };
