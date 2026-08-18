const ApiError = require('../utils/apiError');

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Access forbidden: requires one of [${allowedRoles.join(', ')}] role`)
      );
    }

    next();
  };
};

module.exports = authorize;
