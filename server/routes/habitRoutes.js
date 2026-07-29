const express = require('express');
const { body } = require('express-validator');
const { getHabits, createHabit, completeHabit, skipHabit, updateHabit, deleteHabit } = require('../controllers/habitController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();
router.use(protect);

router.get('/', getHabits);
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Habit title is required'),
    body('frequency').isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid frequency'),
  ],
  validateRequest,
  createHabit
);
router.patch('/:id/complete', completeHabit);
router.patch('/:id/skip', skipHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

module.exports = router;
