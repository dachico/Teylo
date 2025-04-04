// backend/models/BuildJob.js
const mongoose = require('mongoose');

const buildJobSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  config: {
    type: Object,
    required: true
  },
  buildDirectory: {
    type: String,
    required: true
  },
  publicUrl: {
    type: String
  },
  buildUrl: {
    type: String
  },
  estimatedTime: {
    type: Number,
    comment: 'Estimated build time in seconds'
  },
  error: {
    type: String
  },
  logs: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
});

const BuildJob = mongoose.model('BuildJob', buildJobSchema);

module.exports = BuildJob;