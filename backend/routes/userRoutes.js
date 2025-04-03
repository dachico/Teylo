const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

// Protect all routes
router.use(authMiddleware);

// GET: Get user profile
router.get('/profile', userController.getUserProfile);

// PUT: Update user profile
router.put('/profile', userController.updateUserProfile);

// POST: Change password
router.post('/change-password', userController.changePassword);

// GET: Get user's usage statistics
router.get('/stats', userController.getUserStats);

// DELETE: Delete account
router.delete('/account', userController.deleteAccount);

module.exports = router;