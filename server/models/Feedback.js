const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 1000 },
    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
