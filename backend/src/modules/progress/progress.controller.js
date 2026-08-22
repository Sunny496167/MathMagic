const progressService = require('./progress.service');
const ApiResponse = require('../../utils/apiResponse');

class ProgressController {
  getProgressTree = async (req, res, next) => {
    try {
      const gradeId = req.query.gradeId || null;
      const data = await progressService.getFullProgressTree(req.user._id, gradeId);
      return ApiResponse.success(res, 'Progress tree fetched successfully', data);
    } catch (error) {
      next(error);
    }
  };

  submitLearnAnswer = async (req, res, next) => {
    try {
      const result = await progressService.submitLearnAnswer(
        req.user._id,
        req.params.exerciseId,
        req.body
      );
      return ApiResponse.success(res, 'Answer submitted', result);
    } catch (error) {
      next(error);
    }
  };

  completeLearnExercise = async (req, res, next) => {
    try {
      const result = await progressService.completeLearnExercise(
        req.user._id,
        req.params.exerciseId
      );
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  };

  submitPracticeSession = async (req, res, next) => {
    try {
      const result = await progressService.submitPracticeSession(
        req.user._id,
        req.params.practiceLevelId,
        req.body
      );
      return ApiResponse.success(res, 'Practice session submitted', result);
    } catch (error) {
      next(error);
    }
  };

  getHomeDashboard = async (req, res, next) => {
    try {
      const data = await progressService.getHomeDashboard(req.user._id);
      return ApiResponse.success(res, 'Home dashboard data fetched', data);
    } catch (error) {
      next(error);
    }
  };

  claimDailyMissionReward = async (req, res, next) => {
    try {
      const result = await progressService.claimDailyMissionReward(req.user._id);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ProgressController();
