// backend/models/Template.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['fps', 'adventure', 'puzzle', 'racing', 'platformer', 'other'],
    required: true,
    index: true
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  unityVersion: {
    type: String,
    default: '2022.3.0f1'
  },
  templatePath: {
    type: String,
    required: true
  },
  previewImage: {
    type: String
  },
  features: [{
    name: String,
    description: String
  }],
  scripts: [{
    name: String,
    path: String,
    description: String
  }],
  defaultAssets: [{
    name: String,
    category: String,
    path: String
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
templateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;