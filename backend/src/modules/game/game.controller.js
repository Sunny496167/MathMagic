const gameService = require('./game.service');
const ApiResponse = require('../../utils/apiResponse');

class GameController {
  getAvailableGames = async (req, res, next) => {
    try {
      const games = await gameService.getAvailableGames(req.user._id);
      return ApiResponse.success(res, 'Available games fetched', games);
    } catch (error) {
      next(error);
    }
  };

  generateGameQuestions = async (req, res, next) => {
    try {
      const { gameType, questionCount } = req.body;
      const data = await gameService.generateGameQuestions(req.user._id, gameType, questionCount);
      return ApiResponse.success(res, 'Game questions generated', data);
    } catch (error) {
      next(error);
    }
  };

  submitGameSession = async (req, res, next) => {
    try {
      const result = await gameService.submitGameSession(req.user._id, req.body);
      return ApiResponse.success(res, result.message || 'Game session recorded', result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new GameController();
