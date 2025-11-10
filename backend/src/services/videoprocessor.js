// backend/src/services/videoProcessor.js
const Video = require('../models/video');

/**
 * Simulates video processing with fake progress updates.
 * Later you'll replace this with FFmpeg + Socket.io logic.
 */
async function startVideoProcessing(videoId) {
  try {
    const video = await Video.findById(videoId);
    if (!video) {
      console.log('Video not found for processing');
      return;
    }

    console.log(`🟢 Starting simulated processing for: ${video.filename}`);

    // Set initial status
    video.status = 'processing';
    video.processingProgress = 0;
    await video.save();

    // Fake progress updates
    let progress = 0;
    const interval = setInterval(async () => {
      progress += 20;

      if (progress >= 100) {
        clearInterval(interval);
        video.status = 'complete';
        video.sensitivity = Math.random() > 0.5 ? 'safe' : 'flagged';
        video.processingProgress = 100;
        await video.save();
        console.log(`✅ Processing completed for: ${video.filename}`);
      } else {
        video.processingProgress = progress;
        await video.save();
        console.log(`Progress: ${progress}%`);
      }
    }, 1000);
  } catch (err) {
    console.error('Processing error:', err.message);
  }
}

module.exports = { startVideoProcessing };
