const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimeType: { type: String, default: 'video/mp4' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ['pending', 'processing', 'complete', 'failed'], default: 'pending' },
  processingProgress: { type: Number, default: 0, min: 0, max: 100 },
  sensitivity: { type: String, enum: ['safe', 'flagged'], default: null },
  fileSize: { type: Number },
  duration: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Video", videoSchema);
