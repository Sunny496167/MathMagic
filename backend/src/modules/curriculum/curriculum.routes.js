const express = require('express');
const curriculumController = require('./curriculum.controller');
const authenticate = require('../../middlewares/auth.middleware');

const router = express.Router();

// Grades can be read without auth or with auth
router.get('/grades', curriculumController.getEnabledGrades);
router.get('/grades/:gradeId', curriculumController.getGradeById);

// Protected routes (require user to calculate lock state)
router.use(authenticate);

router.get('/grades/:gradeId/topics', curriculumController.getTopicsForGrade);
router.get('/topics/:topicId/exercises', curriculumController.getExercisesForTopic);
router.get('/exercises/:exerciseId', curriculumController.getExerciseDetail);
router.get('/exercises/:exerciseId/practice-levels', curriculumController.getPracticeLevelsForExercise);
router.get('/practice-levels/:practiceLevelId/questions', curriculumController.getPracticeLevelQuestions);

module.exports = router;
