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

// Index for queries by uploader and recent uploads
videoSchema.index({ uploadedBy: 1, createdAt: -1 });

// Transform output to hide internal fields (path) and __v, expose id
function sanitizeVideo(doc, ret) {
  if (ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // Do not expose server file system paths in API responses
    if (ret.path) delete ret.path;
  }
  return ret;
}

videoSchema.set('toJSON', { transform: sanitizeVideo });
videoSchema.set('toObject', { transform: sanitizeVideo });

module.exports = mongoose.models.Video || mongoose.model('Video', videoSchema);
