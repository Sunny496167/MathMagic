const express = require('express');
const progressController = require('./progress.controller');
const authenticate = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

// Fetch full progress tree
router.get('/', progressController.getProgressTree);

// Home Dashboard & Daily Missions
router.get('/home-dashboard', progressController.getHomeDashboard);
router.post('/daily-missions/claim', progressController.claimDailyMissionReward);

// Learn actions
router.post('/exercises/:exerciseId/answer', progressController.submitLearnAnswer);
router.post('/exercises/:exerciseId/complete', progressController.completeLearnExercise);

// Practice actions
router.post('/practice-levels/:practiceLevelId/submit', progressController.submitPracticeSession);

module.exports = router;
