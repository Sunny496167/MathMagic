const questionService = require('./question.service');
const ApiResponse = require('../../utils/apiResponse');

class QuestionController {
  createQuestion = async (req, res, next) => {
    try {
      const result = await questionService.createQuestion(req.body, req.user._id);
      return ApiResponse.created(res, 'Question created successfully', result);
    } catch (error) {
      next(error);
    }
  };

  bulkCreateQuestions = async (req, res, next) => {
    try {
      const result = await questionService.bulkCreateQuestions(req.body, req.user._id);
      return ApiResponse.created(res, `${result.count} questions added successfully`, result);
    } catch (error) {
      next(error);
    }
  };

  getQuestions = async (req, res, next) => {
    try {
      const questions = await questionService.getQuestions(req.query);
      return ApiResponse.success(res, 'Questions fetched successfully', {
        count: questions.length,
        questions,
      });
    } catch (error) {
      next(error);
    }
  };

  getQuestionById = async (req, res, next) => {
    try {
      const question = await questionService.getQuestionById(req.params.id);
      return ApiResponse.success(res, 'Question details fetched', question);
    } catch (error) {
      next(error);
    }
  };

  updateQuestion = async (req, res, next) => {
    try {
      const question = await questionService.updateQuestion(req.params.id, req.body);
      return ApiResponse.success(res, 'Question updated successfully', question);
    } catch (error) {
      next(error);
    }
  };

  deleteQuestion = async (req, res, next) => {
    try {
      const result = await questionService.deleteQuestion(req.params.id);
      return ApiResponse.success(res, result.message, {});
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new QuestionController();
