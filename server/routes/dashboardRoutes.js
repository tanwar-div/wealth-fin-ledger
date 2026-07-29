const express = require('express');
const { getDashboard, getAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getDashboard);
router.get('/analytics', getAnalytics);

module.exports = router;
