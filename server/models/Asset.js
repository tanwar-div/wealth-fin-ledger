const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: [true, 'Asset type is required'],
      enum: ['Cash', 'Mutual Funds', 'Stocks', 'Gold', 'Crypto', 'Property', 'Other'],
    },
    name: { type: String, trim: true, maxlength: 100 },
    value: { type: Number, required: [true, 'Value is required'], min: 0 },
    isLiability: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
