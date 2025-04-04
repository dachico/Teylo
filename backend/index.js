const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const { errorHandler } = require('./middleware/errorHandler');
const templateService = require('./services/templateService');
const { createDirectoryIfNotExists } = require('./utils/fileUtils');
const path = require('path');
require('./models/Asset');
require('./models/User');
require('./models/Template');
require('./models/BuildJob');
require('./models/Project');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/builds', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  express.static(path.join(__dirname, '../builds'))(req, res, next);
});

// Create required directories
const setupDirectories = async () => {
  const dirs = [
    path.join(__dirname, '../builds'),
    path.join(__dirname, '../assets'),
    path.join(__dirname, '../templates')
  ];

  for (const dir of dirs) {
    await createDirectoryIfNotExists(dir);
  }
};

// Serve the builds directory for WebGL previews
app.use('/builds', express.static(path.join(__dirname, '../builds')));

// Simple route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// API Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB (if configured)
const startServer = async () => {
  try {
    // Create directories
    await setupDirectories();
    
    // Connect to MongoDB
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB');
      
      // Initialize default templates
      await templateService.initializeDefaultTemplates();
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;