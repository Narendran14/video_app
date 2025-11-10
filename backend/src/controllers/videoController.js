// backend/controllers/videoController.js
const Video = require('../models/video');
const path = require('path');
const fs = require('fs');

// Upload handler (called after multer)
exports.uploadVideo = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ 
        status: 'error',
        message: 'No video file provided',
        code: 'MISSING_FILE'
      });
    }

    if (!req.body.title) {
      return res.status(400).json({
        status: 'error',
        message: 'Video title is required',
        code: 'MISSING_TITLE'
      });
    }

    const user = req.user;

    const video = await Video.create({
      title: req.body.title,
      filename: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedBy: user._id,
      status: 'pending', // Initial status before processing
      processingProgress: 0
    });

    res.status(201).json({
      status: 'success',
      message: 'Video uploaded successfully',
      data: { video }
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload video',
      code: 'UPLOAD_FAILED',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


// Get all videos for the logged-in user
exports.getVideos = async (req, res) => {
  try {
    const user = req.user;
    const videos = await Video.find({ uploadedBy: user._id })
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

// Stream a video (supports HTTP range)
exports.streamVideo = async (req, res) => {
  try {
    // Validate video ID
    if (!req.params.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Video ID is required',
        code: 'MISSING_VIDEO_ID'
      });
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        status: 'error',
        message: 'Video not found',
        code: 'VIDEO_NOT_FOUND'
      });
    }

    // Check if video is processed and ready for streaming
    if (video.status !== 'complete') {
      return res.status(400).json({
        status: 'error',
        message: 'Video is not ready for streaming',
        code: 'VIDEO_NOT_READY',
        data: { status: video.status, progress: video.processingProgress }
      });
    }

    const filePath = path.resolve(video.path);
    
    // Check if file exists
    try {
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        
        if (start >= fileSize || end >= fileSize) {
          return res.status(416).json({
            status: 'error',
            message: 'Requested range not satisfiable',
            code: 'INVALID_RANGE'
          });
        }

        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': video.mimeType || 'video/mp4',
        };
        res.writeHead(206, head);
        
        file.on('error', (error) => {
          console.error('Stream error:', error);
          // Only send error if headers haven't been sent
          if (!res.headersSent) {
            res.status(500).json({
              status: 'error',
              message: 'Failed to stream video',
              code: 'STREAM_ERROR'
            });
          }
        });

        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': video.mimeType || 'video/mp4',
        };
        res.writeHead(200, head);
        
        const file = fs.createReadStream(filePath);
        file.on('error', (error) => {
          console.error('Stream error:', error);
          if (!res.headersSent) {
            res.status(500).json({
              status: 'error',
              message: 'Failed to stream video',
              code: 'STREAM_ERROR'
            });
          }
        });

        file.pipe(res);
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({
          status: 'error',
          message: 'Video file not found on server',
          code: 'FILE_NOT_FOUND'
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('Streaming error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to process streaming request',
        code: 'STREAMING_FAILED',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
};
