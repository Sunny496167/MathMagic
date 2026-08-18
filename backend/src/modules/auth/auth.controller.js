const authService = require('./auth.service');
const ApiResponse = require('../../utils/apiResponse');

class AuthController {
  register = async (req, res, next) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await authService.register({
        ...req.body,
        ipAddress,
      });

      return ApiResponse.created(res, 'User registered successfully', result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await authService.login({
        ...req.body,
        ipAddress,
      });

      return ApiResponse.success(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  };

  googleAuth = async (req, res, next) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await authService.googleAuth({
        ...req.body,
        ipAddress,
      });

      return ApiResponse.success(res, 'Google authentication successful', result);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req, res, next) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const { refreshToken, deviceInfo } = req.body;

      const result = await authService.refreshToken({
        refreshToken,
        deviceInfo,
        ipAddress,
      });

      return ApiResponse.success(res, 'Token refreshed successfully', result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const refreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
      await authService.logout(refreshToken);

      return ApiResponse.success(res, 'Logged out successfully', {});
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req, res, next) => {
    try {
      return ApiResponse.success(res, 'Current user profile fetched', {
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return ApiResponse.success(res, result.message, {});
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const result = await authService.resetPassword(req.body);
      return ApiResponse.success(res, result.message, {});
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const result = await authService.changePassword(req.user._id, req.body);
      return ApiResponse.success(res, result.message, {});
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req, res, next) => {
    try {
      const result = await authService.verifyEmail(req.body.token);
      return ApiResponse.success(res, result.message, {});
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (req, res, next) => {
    try {
      const result = await authService.resendVerification(req.body.email);
      return ApiResponse.success(res, result.message, {});
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuthController();
