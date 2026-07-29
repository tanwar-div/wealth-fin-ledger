const asyncHandler = require('express-async-handler');
const Asset = require('../models/Asset');

// @desc    Get all assets/liabilities for logged-in user
// @route   GET /api/assets
// @access  Private
const getAssets = asyncHandler(async (req, res) => {
  const assets = await Asset.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: assets.length, data: assets });
});

// @desc    Add an asset or liability
// @route   POST /api/assets
// @access  Private
const addAsset = asyncHandler(async (req, res) => {
  const { type, name, value, isLiability } = req.body;
  const asset = await Asset.create({ userId: req.user._id, type, name, value, isLiability });
  res.status(201).json({ success: true, data: asset });
});

// @desc    Update an asset
// @route   PUT /api/assets/:id
// @access  Private
const updateAsset = asyncHandler(async (req, res) => {
  let asset = await Asset.findById(req.params.id);
  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }
  if (asset.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this asset');
  }

  asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: asset });
});

// @desc    Delete an asset
// @route   DELETE /api/assets/:id
// @access  Private
const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }
  if (asset.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this asset');
  }

  await asset.deleteOne();
  res.status(200).json({ success: true, message: 'Asset deleted' });
});

module.exports = { getAssets, addAsset, updateAsset, deleteAsset };
