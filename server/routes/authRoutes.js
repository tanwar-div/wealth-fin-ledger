const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  login
);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
