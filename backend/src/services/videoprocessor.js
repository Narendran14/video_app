// backend/src/services/videoprocessor.js
const Video = require('../models/video');

// Keep track of running intervals so processing can be stopped if needed
const processingIntervals = new Map();

/**
 * Simulates video processing with fake progress updates.
 * Accepts an optional emitter callback: (event, payload) => void
 * which can be used to emit progress via Socket.io or other mechanisms.
 * Returns a Promise that resolves when processing completes.
 */
async function startVideoProcessing(videoId, emitProgress) {
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

    // Notify initial progress
    if (typeof emitProgress === 'function') emitProgress('processing_started', { id: videoId });

    // Fake progress updates using atomic updates to avoid concurrent save races
    let progress = 0;

    // Faster processing during tests so unit tests don't need long waits
    const intervalMs = process.env.NODE_ENV === 'test' ? 10 : 1000;

    const interval = setInterval(async () => {
      try {
        progress += 20;

        if (progress >= 100) {
          clearInterval(interval);
          processingIntervals.delete(videoId);

          // Finalize using atomic update
          const sensitivity = Math.random() > 0.5 ? 'safe' : 'flagged';
          await Video.findByIdAndUpdate(videoId, { status: 'complete', processingProgress: 100, sensitivity }, { new: true });

          if (typeof emitProgress === 'function') {
            emitProgress('processing_progress', { id: videoId, progress: 100 });
            emitProgress('processing_complete', { id: videoId, sensitivity });
          }

          console.log(`✅ Processing completed for: ${video.filename}`);
        } else {
          // Atomic update for progress
          await Video.findByIdAndUpdate(videoId, { processingProgress: progress }, { new: true });

          if (typeof emitProgress === 'function') emitProgress('processing_progress', { id: videoId, progress });
          console.log(`Progress: ${progress}%`);
        }
      } catch (err) {
        console.error('Processing interval error:', err && err.message ? err.message : err);
        clearInterval(interval);
        processingIntervals.delete(videoId);
        // Mark failed
        try {
          await Video.findByIdAndUpdate(videoId, { status: 'failed' });
        } catch (e) {
          console.error('Failed to mark video as failed:', e && e.message ? e.message : e);
        }
      }
    }, intervalMs);

    processingIntervals.set(videoId, interval);
    return;
  } catch (err) {
    console.error('Processing error:', err && err.message ? err.message : err);
    // Mark video as failed if possible
    try {
      const video = await Video.findById(videoId);
      if (video) {
        video.status = 'failed';
        await video.save();
      }
    } catch (e) {
      console.error('Error marking video failed after processing error:', e && e.message ? e.message : e);
    }
  }
}

function stopProcessing(videoId) {
  const interval = processingIntervals.get(videoId);
  if (interval) {
    clearInterval(interval);
    processingIntervals.delete(videoId);
    console.log(`Stopped processing for video ${videoId}`);
    return true;
  }
  return false;
}

module.exports = { startVideoProcessing, stopProcessing, _processingIntervals: processingIntervals };
