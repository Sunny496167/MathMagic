const adminService = require('./admin.service');
const ApiResponse = require('../../utils/apiResponse');

class AdminController {
  // Grades
  createGrade = async (req, res, next) => {
    try {
      const result = await adminService.createGrade(req.body, req.user._id);
      return ApiResponse.created(res, 'Grade created successfully', result);
    } catch (error) {
      next(error);
    }
  };

  getAllGrades = async (req, res, next) => {
    try {
      const grades = await adminService.getAllGrades();
      return ApiResponse.success(res, 'All grades fetched', grades);
    } catch (error) {
      next(error);
    }
  };

  updateGrade = async (req, res, next) => {
    try {
      const result = await adminService.updateGrade(req.params.id, req.body);
      return ApiResponse.success(res, 'Grade updated successfully', result);
    } catch (error) {
      next(error);
    }
  };

  toggleGrade = async (req, res, next) => {
    try {
      const result = await adminService.toggleGrade(req.params.id);
      return ApiResponse.success(res, `Grade ${result.isEnabled ? 'enabled' : 'disabled'} successfully`, result);
    } catch (error) {
      next(error);
    }
  };

  deleteGrade = async (req, res, next) => {
    try {
      const result = await adminService.deleteGrade(req.params.id);
      return ApiResponse.success(res, result.message, {});
    } catch (error) {
      next(error);
    }
  };

  // Topics
  createTopic = async (req, res, next) => {
    try {
      const result = await adminService.createTopic(req.body, req.user._id);
      return ApiResponse.created(res, 'Topic created successfully', result);
    } catch (error) {
      next(error);
    }
  };

  getTopicsByGrade = async (req, res, next) => {
    try {
      const topics = await adminService.getTopicsByGrade(req.params.gradeId);
      return ApiResponse.success(res, 'Topics fetched', topics);
    } catch (error) {
      next(error);
    }
  };

  updateTopic = async (req, res, next) => {
    try {
      const result = await adminService.updateTopic(req.params.id, req.body);
      return ApiResponse.success(res, 'Topic updated successfully', result);
    } catch (error) {
      next(error);
    }
  };

  toggleTopicPublish = async (req, res, next) => {
    try {
      const result = await adminService.toggleTopicPublish(req.params.id);
      return ApiResponse.success(res, `Topic ${result.isPublished ? 'published' : 'unpublished'} successfully`, result);
    } catch (error) {
      next(error);
    }
  };

  deleteTopic = async (req, res, next) => {
    try {
      const result = await adminService.deleteTopic(req.params.id);
      return ApiResponse.success(res, result.message, {});
    } catch (error) {
      next(error);
    }
  };

  // Exercises
  createExercise = async (req, res, next) => {
    try {
      const result = await adminService.createExercise(req.body, req.user._id);
      return ApiResponse.created(res, 'Exercise created successfully', result);
    } catch (error) {
      next(error);
    }
  };

  getExercisesByTopic = async (req, res, next) => {
    try {
      const exercises = await adminService.getExercisesByTopic(req.params.topicId);
      return ApiResponse.success(res, 'Exercises fetched', exercises);
    } catch (error) {
      next(error);
    }
  };

  updateExercise = async (req, res, next) => {
    try {
      const result = await adminService.updateExercise(req.params.id, req.body);
      return ApiResponse.success(res, 'Exercise updated successfully', result);
    } catch (error) {
      next(error);
    }
  };

  updateExerciseContent = async (req, res, next) => {
    try {
      const result = await adminService.updateExerciseContent(req.params.id, req.body.blocks);
      return ApiResponse.success(res, 'Exercise content updated successfully', result);
    } catch (error) {
      next(error);
    }
  };

  toggleExercisePublish = async (req, res, next) => {
    try {
      const result = await adminService.toggleExercisePublish(req.params.id);
      return ApiResponse.success(res, `Exercise ${result.isPublished ? 'published' : 'unpublished'} successfully`, result);
    } catch (error) {
      next(error);
    }
  };

  deleteExercise = async (req, res, next) => {
    try {
      const result = await adminService.deleteExercise(req.params.id);
      return ApiResponse.success(res, result.message, {});
    } catch (error) {
      next(error);
    }
  };

  // Practice Levels
  createPracticeLevel = async (req, res, next) => {
    try {
      const result = await adminService.createPracticeLevel(req.body, req.user._id);
      return ApiResponse.created(res, 'Practice level created successfully', result);
    } catch (error) {
      next(error);
    }
  };

  getPracticeLevelsByExercise = async (req, res, next) => {
    try {
      const levels = await adminService.getPracticeLevelsByExercise(req.params.exerciseId);
      return ApiResponse.success(res, 'Practice levels fetched', levels);
    } catch (error) {
      next(error);
    }
  };

  updatePracticeLevel = async (req, res, next) => {
    try {
      const result = await adminService.updatePracticeLevel(req.params.id, req.body);
      return ApiResponse.success(res, 'Practice level updated successfully', result);
    } catch (error) {
      next(error);
    }
  };

  togglePracticeLevelPublish = async (req, res, next) => {
    try {
      const result = await adminService.togglePracticeLevelPublish(req.params.id);
      return ApiResponse.success(res, `Practice level ${result.isPublished ? 'published' : 'unpublished'} successfully`, result);
    } catch (error) {
      next(error);
    }
  };

  deletePracticeLevel = async (req, res, next) => {
    try {
      const result = await adminService.deletePracticeLevel(req.params.id);
      return ApiResponse.success(res, result.message, {});
    } catch (error) {
      next(error);
    }
  };

  // Dashboard Stats
  getDashboardStats = async (req, res, next) => {
    try {
      const stats = await adminService.getDashboardStats();
      return ApiResponse.success(res, 'Dashboard stats fetched', stats);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AdminController();
