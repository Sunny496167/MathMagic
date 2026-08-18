const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');
const User = require('../modules/user/user.model');

/**
 * Mobile-First JWT Bearer Authentication Middleware
 * Validates 'Authorization: Bearer <token>'
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Extract Bearer token from headers (Mobile & Web standard)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (!token) {
      return next(
        ApiError.unauthorized(
          'Authentication token is missing. Please provide Authorization header.'
        )
      );
    }

    // 2. Verify token signature and expiration
    const decoded = verifyAccessToken(token);

    // 3. Ensure user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return next(ApiError.unauthorized('User not found or account is deactivated'));
    }

    // 4. Attach user to request
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token has expired. Please refresh your token.'));
    }
    return next(ApiError.unauthorized('Invalid or malformed authentication token.'));
  }
};

module.exports = authenticate;
