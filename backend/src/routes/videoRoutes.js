// backend/routes/videoRoutes.js
const express = require('express');
const multer = require('multer');
const authMiddleware  = require('../middleware/authMiddleware');
const videoController = require('../controllers/videoController');

const router = express.Router();

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/**
 * @route   POST /api/videos/upload
 * @desc    Upload a new video
 * @access  Private (Editor/Admin)
 */

router.post('/upload', authMiddleware, upload.single('video'), videoController.uploadVideo);

/**
 * @route   GET /api/videos
 * @desc    Get all videos for the logged-in user's tenant
 * @access  Private
 */
router.get('/', authMiddleware, videoController.getVideos);

/**
 * @route   GET /api/videos/stream/:id
 * @desc    Stream video using HTTP range requests
 * @access  Private
 */
router.get('/stream/:id', authMiddleware, videoController.streamVideo);

module.exports = router;
