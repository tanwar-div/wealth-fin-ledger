const express = require('express');
const { body } = require('express-validator');
const { getExpenses, addExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();
router.use(protect);

const expenseRules = [
  body('category')
    .isIn(['Food', 'Rent', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Health', 'Others'])
    .withMessage('Invalid expense category'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('date').optional().isISO8601().withMessage('Date must be valid'),
];

router.get('/', getExpenses);
router.post('/', expenseRules, validateRequest, addExpense);
router.put('/:id', expenseRules, validateRequest, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
