const asyncHandler = require('express-async-handler');
const SavingsGoal = require('../models/SavingsGoal');

// @desc    Get all savings goals for logged-in user
// @route   GET /api/goals
// @access  Private
const getGoals = asyncHandler(async (req, res) => {
  const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });

  const data = goals.map((g) => {
    const goal = g.toObject();
    goal.percentComplete = goal.targetAmount > 0
      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
      : 0;
    goal.remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    return goal;
  });

  res.status(200).json({ success: true, count: data.length, data });
});

// @desc    Create a savings goal
// @route   POST /api/goals
// @access  Private
const createGoal = asyncHandler(async (req, res) => {
  const { goalName, targetAmount, currentAmount, deadline } = req.body;
  const goal = await SavingsGoal.create({
    userId: req.user._id,
    goalName,
    targetAmount,
    currentAmount: currentAmount || 0,
    deadline,
  });
  res.status(201).json({ success: true, data: goal });
});

// @desc    Update a savings goal (e.g. contribute towards it, edit target)
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = asyncHandler(async (req, res) => {
  let goal = await SavingsGoal.findById(req.params.id);
  if (!goal) {
    res.status(404);
    throw new Error('Savings goal not found');
  }
  if (goal.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this goal');
  }

  goal = await SavingsGoal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
    goal.status = 'completed';
    await goal.save();
  }

  res.status(200).json({ success: true, data: goal });
});

// @desc    Delete a savings goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findById(req.params.id);
  if (!goal) {
    res.status(404);
    throw new Error('Savings goal not found');
  }
  if (goal.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this goal');
  }

  await goal.deleteOne();
  res.status(200).json({ success: true, message: 'Savings goal deleted' });
});

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
