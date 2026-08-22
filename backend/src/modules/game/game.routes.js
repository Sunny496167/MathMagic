const express = require('express');
const gameController = require('./game.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { generateGameQuestionsSchema, submitGameSessionSchema } = require('./game.validation');

const router = express.Router();

// All game endpoints require user authentication
router.use(authenticate);

router.get('/available', gameController.getAvailableGames);
router.post('/generate', validate(generateGameQuestionsSchema), gameController.generateGameQuestions);
router.post('/session', validate(submitGameSessionSchema), gameController.submitGameSession);

module.exports = router;
