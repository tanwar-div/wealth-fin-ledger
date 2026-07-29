const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goalName: { type: String, required: [true, 'Goal name is required'], trim: true, maxlength: 100 },
    targetAmount: { type: Number, required: [true, 'Target amount is required'], min: [1, 'Target must be positive'] },
    currentAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: Date },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
