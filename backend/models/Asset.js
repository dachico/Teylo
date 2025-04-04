// backend/models/Asset.js
const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['model', 'texture', 'audio', 'script', 'prefab', 'other'],
    default: 'other'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  filePath: {
    type: String,
    required: true
  },
  projectPath: {
    type: String,
    required: true
  },
  metadata: {
    type: Object,
    default: {}
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt timestamp
assetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;