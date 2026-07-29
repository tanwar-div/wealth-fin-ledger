const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    source: {
      type: String,
      required: [true, 'Income source is required'],
      enum: ['Salary', 'Freelance', 'Scholarship', 'Investments', 'Gifts', 'Business', 'Other'],
    },
    amount: { type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be positive'] },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, maxlength: 300, trim: true },
  },
  { timestamps: true }
);

incomeSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Income', incomeSchema);
