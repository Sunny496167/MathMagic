const User = require('./user.model');
const ApiResponse = require('../../utils/apiResponse');

class UserController {
  getProfile = async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate(
        'selectedGrade',
        'number name description icon color isEnabled'
      );
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

  selectGrade = async (req, res, next) => {
    try {
      const { gradeId } = req.body;
      const Grade = require('../curriculum/models/grade.model');
      const grade = await Grade.findById(gradeId);
      if (!grade || !grade.isEnabled) {
        return next(require('../../utils/apiError').badRequest('Selected grade is not available or enabled'));
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { selectedGrade: gradeId },
        { new: true }
      ).populate('selectedGrade', 'number name description icon color');

      return ApiResponse.success(res, 'Grade selected successfully', { user });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();

