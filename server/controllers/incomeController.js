const asyncHandler = require('express-async-handler');
const Income = require('../models/Income');

// @desc    Get all income records for logged-in user (supports month & source filters)
// @route   GET /api/income
// @access  Private
const getIncomes = asyncHandler(async (req, res) => {
  const { month, year, source } = req.query;
  const filter = { userId: req.user._id };

  if (source) filter.source = source;
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
    filter.date = { $gte: start, $lt: end };
  }

  const incomes = await Income.find(filter).sort({ date: -1 });
  const total = incomes.reduce((sum, i) => sum + i.amount, 0);

  res.status(200).json({ success: true, count: incomes.length, total, data: incomes });
});

// @desc    Add an income record
// @route   POST /api/income
// @access  Private
const addIncome = asyncHandler(async (req, res) => {
  const { source, amount, date, notes } = req.body;
  const income = await Income.create({ userId: req.user._id, source, amount, date, notes });
  res.status(201).json({ success: true, data: income });
});

// @desc    Update an income record (owner only)
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = asyncHandler(async (req, res) => {
  let income = await Income.findById(req.params.id);
  if (!income) {
    res.status(404);
    throw new Error('Income record not found');
  }
  if (income.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this record');
  }

  income = await Income.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: income });
});

// @desc    Delete an income record (owner only)
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = asyncHandler(async (req, res) => {
  const income = await Income.findById(req.params.id);
  if (!income) {
    res.status(404);
    throw new Error('Income record not found');
  }
  if (income.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this record');
  }

  await income.deleteOne();
  res.status(200).json({ success: true, message: 'Income record deleted' });
});

module.exports = { getIncomes, addIncome, updateIncome, deleteIncome };
