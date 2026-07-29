const express = require('express');
const { body } = require('express-validator');
const { getIncomes, addIncome, updateIncome, deleteIncome } = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();
router.use(protect);

const incomeRules = [
  body('source')
    .isIn(['Salary', 'Freelance', 'Scholarship', 'Investments', 'Gifts', 'Business', 'Other'])
    .withMessage('Invalid income source'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('date').optional().isISO8601().withMessage('Date must be valid'),
];

router.get('/', getIncomes);
router.post('/', incomeRules, validateRequest, addIncome);
router.put('/:id', incomeRules, validateRequest, updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;
