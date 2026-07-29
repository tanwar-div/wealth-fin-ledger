const express = require('express');
const { body } = require('express-validator');
const { getGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();
router.use(protect);

router.get('/', getGoals);
router.post(
  '/',
  [
    body('goalName').trim().notEmpty().withMessage('Goal name is required'),
    body('targetAmount').isFloat({ gt: 0 }).withMessage('Target amount must be a positive number'),
  ],
  validateRequest,
  createGoal
);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
