const curriculumService = require('./curriculum.service');
const ApiResponse = require('../../utils/apiResponse');

class CurriculumController {
  getEnabledGrades = async (req, res, next) => {
    try {
      const grades = await curriculumService.getEnabledGrades();
      return ApiResponse.success(res, 'Enabled grades fetched successfully', grades);
    } catch (error) {
      next(error);
    }
  };

  getGradeById = async (req, res, next) => {
    try {
      const grade = await curriculumService.getGradeById(req.params.gradeId);
      return ApiResponse.success(res, 'Grade fetched successfully', grade);
    } catch (error) {
      next(error);
    }
  };

  getTopicsForGrade = async (req, res, next) => {
    try {
      const topics = await curriculumService.getTopicsForGrade(req.params.gradeId, req.user._id);
      return ApiResponse.success(res, 'Topics fetched with lock states', topics);
    } catch (error) {
      next(error);
    }
  };

  getExercisesForTopic = async (req, res, next) => {
    try {
      const exercises = await curriculumService.getExercisesForTopic(req.params.topicId, req.user._id);
      return ApiResponse.success(res, 'Exercises fetched with lock states', exercises);
    } catch (error) {
      next(error);
    }
  };

  getExerciseDetail = async (req, res, next) => {
    try {
      const data = await curriculumService.getExerciseDetail(req.params.exerciseId, req.user._id);
      return ApiResponse.success(res, 'Exercise detail & learn questions fetched', data);
    } catch (error) {
      next(error);
    }
  };

  getPracticeLevelsForExercise = async (req, res, next) => {
    try {
      const data = await curriculumService.getPracticeLevelsForExercise(req.params.exerciseId, req.user._id);
      return ApiResponse.success(res, 'Practice levels fetched with lock states', data);
    } catch (error) {
      next(error);
    }
  };

  getPracticeLevelQuestions = async (req, res, next) => {
    try {
      const data = await curriculumService.getPracticeLevelQuestions(req.params.practiceLevelId, req.user._id);
      return ApiResponse.success(res, 'Practice questions fetched', data);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CurriculumController();
