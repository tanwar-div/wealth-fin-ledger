const express = require('express');
const { getUsers, updateUserStatus, deleteUser, getStats } = require('../controllers/adminController');
const { getAllFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();
router.use(protect, admin);

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);
router.get('/feedback', getAllFeedback);
router.patch('/feedback/:id', updateFeedbackStatus);

module.exports = router;
