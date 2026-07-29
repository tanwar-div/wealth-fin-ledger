const express = require('express');
const { body } = require('express-validator');
const { getAssets, addAsset, updateAsset, deleteAsset } = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();
router.use(protect);

router.get('/', getAssets);
router.post(
  '/',
  [
    body('type')
      .isIn(['Cash', 'Mutual Funds', 'Stocks', 'Gold', 'Crypto', 'Property', 'Other'])
      .withMessage('Invalid asset type'),
    body('value').isFloat({ gte: 0 }).withMessage('Value must be zero or positive'),
  ],
  validateRequest,
  addAsset
);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

module.exports = router;
