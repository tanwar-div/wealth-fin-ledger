const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Habit title is required'], trim: true, maxlength: 100 },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true, default: 'daily' },
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    completedDates: [{ type: Date }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
