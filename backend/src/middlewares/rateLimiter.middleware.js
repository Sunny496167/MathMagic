const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/apiError');

/**
 * Standard API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      ApiError.tooManyRequests('Too many requests from this IP, please try again in 15 minutes')
    );
  },
});

/**
 * Strict rate limiter for Authentication endpoints (login, register, forgot-password)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      ApiError.tooManyRequests(
        'Too many authentication attempts, please try again after 15 minutes'
      )
    );
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
