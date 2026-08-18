const User = require('./user.model');
const ApiResponse = require('../../utils/apiResponse');

class UserController {
  getProfile = async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      return ApiResponse.success(res, 'User profile', { user });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      const { name, phone, avatar } = req.body;
      const updates = {};
      if (name) updates.name = name;
      if (phone !== undefined) updates.phone = phone;
      if (avatar !== undefined) updates.avatar = avatar;

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });

      return ApiResponse.success(res, 'Profile updated successfully', { user });
    } catch (error) {
      next(error);
    }
  };

  updateGamification = async (req, res, next) => {
    try {
      const { xpEarned, streak } = req.body;
      const updates = {};
      if (xpEarned) updates.$inc = { xp: xpEarned };
      if (streak !== undefined) updates.streak = streak;

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
      });

      return ApiResponse.success(res, 'Progress updated', { user });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();
