// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Authentication middleware
 * - Expects `Authorization: Bearer <token>` header or `?token=<token>` query param
 * - Verifies JWT and attaches a sanitized user object to `req.user` (password excluded)
 */
module.exports = async (req, res, next) => {
  try {
    // Support Authorization header or fallback to query param
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Distinguish expired tokens from other errors
      if (err && err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      console.error('JWT verify error:', err && err.message ? err.message : err);
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Fetch user and exclude sensitive fields like password
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Attach plain object to req to avoid accidental mongoose mutation in downstream code
    req.user = typeof user.toObject === 'function' ? user.toObject() : user;
    next();
  } catch (err) {
    console.error('Auth error:', err && err.message ? err.message : err);
    res.status(401).json({ message: 'Authentication failed' });
  }
};
