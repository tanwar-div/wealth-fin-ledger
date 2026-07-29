const express = require('express');
const { body } = require('express-validator');
const { submitFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();
router.use(protect);

router.post(
  '/',
  [body('message').trim().notEmpty().withMessage('Feedback message is required')],
  validateRequest,
  submitFeedback
);

module.exports = router;
