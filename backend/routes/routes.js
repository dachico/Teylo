// backend/routes/routes.js

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes'); 
const projectRoutes = require('./projectRoutes');
const assetRoutes = require('./assetRoutes');
const templateRoutes = require('./templateRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/assets', assetRoutes);
router.use('/templates', templateRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running'
  });
});

module.exports = router;