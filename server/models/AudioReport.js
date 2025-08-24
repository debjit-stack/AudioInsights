// server/models/AudioReport.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  // --- NEW FIELDS ---
  videoTitle: {
    type: String,
    default: 'Untitled Report'
  },
  videoThumbnailUrl: String,
  // ------------------
  contextualAnalysis: String,
  mainViewpoints: [{
    viewpoint: String,
    speaker: String,
  }],
  keyQuestions: [String],
  bigPictureExplanation: String,
  transcript: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AudioReport', ReportSchema);