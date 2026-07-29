const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Food', 'Rent', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Health', 'Others'],
    },
    amount: { type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be positive'] },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, maxlength: 300, trim: true },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
