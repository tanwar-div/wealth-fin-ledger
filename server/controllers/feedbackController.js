const asyncHandler = require('express-async-handler');
const Feedback = require('../models/Feedback');

// @desc    Submit feedback / a complaint
// @route   POST /api/feedback
// @access  Private
const submitFeedback = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const feedback = await Feedback.create({ userId: req.user._id, message });
  res.status(201).json({ success: true, data: feedback });
});

// @desc    List all feedback (admin)
// @route   GET /api/admin/feedback
// @access  Private/Admin
const getAllFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find().populate('userId', 'name email').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: feedback.length, data: feedback });
});

// @desc    Update feedback status (admin)
// @route   PATCH /api/admin/feedback/:id
// @access  Private/Admin
const updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['open', 'in_progress', 'resolved'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  res.status(200).json({ success: true, data: feedback });
});

module.exports = { submitFeedback, getAllFeedback, updateFeedbackStatus };
