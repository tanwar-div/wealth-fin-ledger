const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Habit = require('../models/Habit');
const Feedback = require('../models/Feedback');

// @desc    List all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Suspend/reactivate a user
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    res.status(400);
    throw new Error('Status must be "active" or "suspended"');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot change status of an admin account');
  }

  user.status = status;
  await user.save();
  res.status(200).json({ success: true, data: user });
});

// @desc    Delete a user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete an admin account');
  }

  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted' });
});

// @desc    Platform-wide statistics for the admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
  const [userCount, incomeCount, expenseCount, totalIncomeAgg, totalExpenseAgg, activeHabitCount, openFeedback] =
    await Promise.all([
      User.countDocuments(),
      Income.countDocuments(),
      Expense.countDocuments(),
      Income.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Habit.countDocuments({ isActive: true }),
      Feedback.countDocuments({ status: 'open' }),
    ]);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activeUsersLast30Days = await Promise.all([
    Income.distinct('userId', { date: { $gte: thirtyDaysAgo } }),
    Expense.distinct('userId', { date: { $gte: thirtyDaysAgo } }),
  ]).then(([a, b]) => new Set([...a.map(String), ...b.map(String)]).size);

  res.status(200).json({
    success: true,
    data: {
      totalUsers: userCount,
      activeUsersLast30Days,
      totalTransactions: incomeCount + expenseCount,
      totalIncomeTracked: totalIncomeAgg[0]?.total || 0,
      totalExpensesTracked: totalExpenseAgg[0]?.total || 0,
      activeHabits: activeHabitCount,
      openFeedback,
    },
  });
});

module.exports = { getUsers, updateUserStatus, deleteUser, getStats };
