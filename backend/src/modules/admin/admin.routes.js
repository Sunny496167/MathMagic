const express = require('express');
const adminController = require('./admin.controller');
const questionController = require('../question/question.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../constants/roles');
const adminValidation = require('./admin.validation');
const questionValidation = require('../question/question.validation');

const router = express.Router();

// Role-gated for admins only
router.use(authenticate, authorize(ROLES.ADMIN));

// Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// Grades CRUD
router.post('/grades', validate(adminValidation.createGradeSchema), adminController.createGrade);
router.get('/grades', adminController.getAllGrades);
router.patch('/grades/:id', validate(adminValidation.updateGradeSchema), adminController.updateGrade);
router.patch('/grades/:id/toggle', adminController.toggleGrade);
router.delete('/grades/:id', adminController.deleteGrade);

// Topics CRUD
router.post('/topics', validate(adminValidation.createTopicSchema), adminController.createTopic);
router.get('/grades/:gradeId/topics', adminController.getTopicsByGrade);
router.patch('/topics/:id', validate(adminValidation.updateTopicSchema), adminController.updateTopic);
router.patch('/topics/:id/publish', adminController.toggleTopicPublish);
router.delete('/topics/:id', adminController.deleteTopic);

// Exercises CRUD
router.post('/exercises', validate(adminValidation.createExerciseSchema), adminController.createExercise);
router.get('/topics/:topicId/exercises', adminController.getExercisesByTopic);
router.patch('/exercises/:id', validate(adminValidation.updateExerciseSchema), adminController.updateExercise);
router.put('/exercises/:id/content', adminController.updateExerciseContent);
router.patch('/exercises/:id/publish', adminController.toggleExercisePublish);
router.delete('/exercises/:id', adminController.deleteExercise);

// Practice Levels CRUD
router.post('/practice-levels', validate(adminValidation.createPracticeLevelSchema), adminController.createPracticeLevel);
router.get('/exercises/:exerciseId/practice-levels', adminController.getPracticeLevelsByExercise);
router.patch('/practice-levels/:id', validate(adminValidation.updatePracticeLevelSchema), adminController.updatePracticeLevel);
router.patch('/practice-levels/:id/publish', adminController.togglePracticeLevelPublish);
router.delete('/practice-levels/:id', adminController.deletePracticeLevel);

// Question Bank CRUD & Bulk Ingestion
router.post('/questions', validate(questionValidation.createQuestionSchema), questionController.createQuestion);
router.post('/questions/bulk', validate(questionValidation.bulkCreateQuestionsSchema), questionController.bulkCreateQuestions);
router.get('/questions', questionController.getQuestions);
router.get('/questions/:id', questionController.getQuestionById);
router.patch('/questions/:id', validate(questionValidation.updateQuestionSchema), questionController.updateQuestion);
router.delete('/questions/:id', questionController.deleteQuestion);

// Student Progress Viewer
router.get('/students', adminController.getStudents);
router.get('/students/:id/progress', adminController.getStudentProgress);

module.exports = router;
