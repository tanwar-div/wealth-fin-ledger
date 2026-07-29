const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');

// @desc    Get all expenses for logged-in user (supports month/category/amount filters)
// @route   GET /api/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
  const { month, year, category, minAmount, maxAmount } = req.query;
  const filter = { userId: req.user._id };

  if (category) filter.category = category;
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
    filter.date = { $gte: start, $lt: end };
  }
  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = Number(minAmount);
    if (maxAmount) filter.amount.$lte = Number(maxAmount);
  }

  const expenses = await Expense.find(filter).sort({ date: -1 });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  res.status(200).json({ success: true, count: expenses.length, total, byCategory, data: expenses });
});

// @desc    Add an expense
// @route   POST /api/expenses
// @access  Private
const addExpense = asyncHandler(async (req, res) => {
  const { category, amount, date, description } = req.body;
  const expense = await Expense.create({ userId: req.user._id, category, amount, date, description });
  res.status(201).json({ success: true, data: expense });
});

// @desc    Update an expense (owner only)
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
  let expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  if (expense.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this record');
  }

  expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: expense });
});

// @desc    Delete an expense (owner only)
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  if (expense.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this record');
  }

  await expense.deleteOne();
  res.status(200).json({ success: true, message: 'Expense deleted' });
});

module.exports = { getExpenses, addExpense, updateExpense, deleteExpense };
