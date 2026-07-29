const asyncHandler = require('express-async-handler');
const Habit = require('../models/Habit');
const { applyCompletion } = require('../utils/streak');

// @desc    Get all habits for logged-in user
// @route   GET /api/habits
// @access  Private
const getHabits = asyncHandler(async (req, res) => {
  const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: habits.length, data: habits });
});

// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
const createHabit = asyncHandler(async (req, res) => {
  const { title, frequency } = req.body;
  const habit = await Habit.create({ userId: req.user._id, title, frequency });
  res.status(201).json({ success: true, data: habit });
});

// @desc    Mark a habit as complete for the current period (updates streaks)
// @route   PATCH /api/habits/:id/complete
// @access  Private
const completeHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);
  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }
  if (habit.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this habit');
  }

  const result = applyCompletion(habit);
  if (result.alreadyCompleted) {
    return res.status(200).json({ success: true, message: 'Already completed for this period', data: habit });
  }

  habit.completedDates.push(new Date());
  habit.currentStreak = result.currentStreak;
  habit.bestStreak = result.bestStreak;
  await habit.save();

  res.status(200).json({ success: true, data: habit });
});

// @desc    Skip / un-mark today's completion (removes the most recent completion)
// @route   PATCH /api/habits/:id/skip
// @access  Private
const skipHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);
  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }
  if (habit.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this habit');
  }

  if (habit.completedDates.length > 0) {
    habit.completedDates.pop();
    habit.currentStreak = Math.max(0, habit.currentStreak - 1);
  }
  await habit.save();

  res.status(200).json({ success: true, data: habit });
});

// @desc    Update habit details (title/frequency/active)
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = asyncHandler(async (req, res) => {
  let habit = await Habit.findById(req.params.id);
  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }
  if (habit.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this habit');
  }

  const { title, frequency, isActive } = req.body;
  if (title !== undefined) habit.title = title;
  if (frequency !== undefined) habit.frequency = frequency;
  if (isActive !== undefined) habit.isActive = isActive;

  await habit.save();
  res.status(200).json({ success: true, data: habit });
});

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);
  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }
  if (habit.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this habit');
  }

  await habit.deleteOne();
  res.status(200).json({ success: true, message: 'Habit deleted' });
});

module.exports = { getHabits, createHabit, completeHabit, skipHabit, updateHabit, deleteHabit };
