const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  originalPrompt: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'building', 'preview', 'complete', 'failed'],
    default: 'draft'
  },
  gameType: {
    type: String,
    enum: ['fps', 'adventure', 'puzzle', 'racing', 'platformer', 'other'],
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  gameDesignDocument: {
    type: Object
  },
  buildConfiguration: {
    type: Object
  },
  assets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  }],
  buildInfo: {
    buildId: String,
    startTime: Date,
    endTime: Date,
    logs: [String],
    buildUrl: String,
    previewUrl: String
  },
  versions: [{
    versionNumber: Number,
    prompt: String,
    changes: [String],
    buildInfo: Object,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;