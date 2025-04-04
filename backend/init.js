// backend/init.js
require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');
const templateService = require('./services/templateService');
const { createDirectoryIfNotExists } = require('./utils/fileUtils');
const path = require('path');

async function initDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create required directories
    const dirs = [
      path.join(__dirname, '../builds'),
      path.join(__dirname, '../assets'),
      path.join(__dirname, '../templates')
    ];

    for (const dir of dirs) {
      await createDirectoryIfNotExists(dir);
    }

    // Initialize templates
    await templateService.initializeDefaultTemplates();
    
    console.log('Setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initDatabase();