// Deprecated upload route handler
// Uploads are now handled in `videoRoutes.js`. This route returns 410 Gone
// to signal clients that this endpoint is deprecated and should not be used.

const express = require('express');
const router = express.Router();

router.all('*', (req, res) => {
	res.status(410).json({
		status: 'gone',
		message: 'This upload endpoint is deprecated. Use /api/videos endpoints instead.'
	});
});

module.exports = router;
