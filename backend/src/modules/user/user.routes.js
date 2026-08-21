const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.post('/progress', userController.updateGamification);
router.patch('/select-grade', userController.selectGrade);

module.exports = router;

