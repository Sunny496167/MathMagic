const Grade = require('./models/grade.model');
const Topic = require('./models/topic.model');
const Exercise = require('./models/exercise.model');
const PracticeLevel = require('./models/practiceLevel.model');
const Question = require('../question/question.model');
const UserProgress = require('../progress/progress.model');
const ApiError = require('../../utils/apiError');

class CurriculumService {
  async getEnabledGrades() {
    return await Grade.find({ isEnabled: true }).sort({ order: 1, number: 1 });
  }

  async getGradeById(gradeId) {
    const grade = await Grade.findById(gradeId);
    if (!grade) throw ApiError.notFound('Grade not found');
    return grade;
  }

  /**
   * Returns topics for a grade with lock statuses computed from user progress
   */
  async getTopicsForGrade(gradeId, userId) {
    const topics = await Topic.find({ grade: gradeId, isPublished: true }).sort({ order: 1 });
    let progress = await UserProgress.findOne({ user: userId, grade: gradeId });

    // Build map of exercise completion
    const completedExerciseIds = new Set();
    if (progress && progress.exerciseProgress) {
      progress.exerciseProgress.forEach((ep) => {
        if (ep.status === 'completed') {
          completedExerciseIds.add(ep.exercise.toString());
        }
      });
    }

    // Determine lock status for each topic
    const results = [];
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const exercises = await Exercise.find({ topic: topic._id, isPublished: true }).sort({ order: 1 });
      const totalExercises = exercises.length;
      let completedInThisTopic = 0;

      exercises.forEach((ex) => {
        if (completedExerciseIds.has(ex._id.toString())) {
          completedInThisTopic++;
        }
      });

      let status = 'locked';
      if (i === 0) {
        // First topic is always unlocked
        status = totalExercises > 0 && completedInThisTopic === totalExercises ? 'completed' : 'unlocked';
      } else {
        // Topic i is unlocked if all exercises in Topic i-1 are completed
        const prevTopic = results[i - 1];
        if (prevTopic && prevTopic.status === 'completed') {
          status = totalExercises > 0 && completedInThisTopic === totalExercises ? 'completed' : 'unlocked';
        }
      }

      results.push({
        _id: topic._id,
        grade: topic.grade,
        title: topic.title,
        description: topic.description,
        icon: topic.icon,
        color: topic.color,
        order: topic.order,
        status,
        totalExercises,
        completedExercises: completedInThisTopic,
      });
    }

    return results;
  }

  /**
   * Returns exercises for a topic with sequential lock status
   */
  async getExercisesForTopic(topicId, userId) {
    const topic = await Topic.findById(topicId);
    if (!topic) throw ApiError.notFound('Topic not found');

    const exercises = await Exercise.find({ topic: topicId, isPublished: true }).sort({ order: 1 });
    let progress = await UserProgress.findOne({ user: userId, grade: topic.grade });

    const exerciseStatusMap = {};
    if (progress && progress.exerciseProgress) {
      progress.exerciseProgress.forEach((ep) => {
        exerciseStatusMap[ep.exercise.toString()] = ep.status;
      });
    }

    const results = [];
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const recordedStatus = exerciseStatusMap[ex._id.toString()];

      let status = 'locked';
      if (recordedStatus === 'completed') {
        status = 'completed';
      } else if (recordedStatus === 'in_progress') {
        status = 'in_progress';
      } else if (i === 0) {
        status = 'unlocked';
      } else {
        const prevEx = results[i - 1];
        if (prevEx && prevEx.status === 'completed') {
          status = 'unlocked';
        }
      }

      results.push({
        _id: ex._id,
        topic: ex.topic,
        grade: ex.grade,
        title: ex.title,
        description: ex.description,
        icon: ex.icon,
        color: ex.color,
        order: ex.order,
        status,
        completionRequirement: ex.completionRequirement,
      });
    }

    return results;
  }

  async getExerciseDetail(exerciseId, userId) {
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) throw ApiError.notFound('Exercise not found');

    // Fetch learn questions for this exercise
    const questions = await Question.find({
      exercise: exerciseId,
      context: 'learn',
      isPublished: true,
    }).sort({ order: 1 });

    return {
      exercise,
      questions,
    };
  }

  /**
   * Returns practice levels for an exercise.
   * Only accessible if the exercise was completed in Learn.
   */
  async getPracticeLevelsForExercise(exerciseId, userId) {
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) throw ApiError.notFound('Exercise not found');

    // Check if exercise is completed in Learn
    const progress = await UserProgress.findOne({ user: userId, grade: exercise.grade });
    const isLearnCompleted = progress && progress.exerciseProgress?.some(
      (ep) => ep.exercise.toString() === exerciseId.toString() && ep.status === 'completed'
    );

    const levels = await PracticeLevel.find({ exercise: exerciseId, isPublished: true }).sort({ order: 1, number: 1 });

    const practiceProgressMap = {};
    if (progress && progress.practiceLevelProgress) {
      progress.practiceLevelProgress.forEach((plp) => {
        practiceProgressMap[plp.practiceLevel.toString()] = plp;
      });
    }

    const results = [];
    for (let i = 0; i < levels.length; i++) {
      const lvl = levels[i];
      const plp = practiceProgressMap[lvl._id.toString()];

      let status = 'locked';
      if (!isLearnCompleted) {
        status = 'locked';
      } else if (plp && plp.status === 'completed') {
        status = 'completed';
      } else if (plp && plp.status === 'in_progress') {
        status = 'in_progress';
      } else if (i === 0) {
        status = 'unlocked';
      } else {
        const prevLvl = results[i - 1];
        if (prevLvl && prevLvl.status === 'completed') {
          status = 'unlocked';
        }
      }

      results.push({
        _id: lvl._id,
        exercise: lvl.exercise,
        topic: lvl.topic,
        grade: lvl.grade,
        number: lvl.number,
        title: lvl.title || `Level ${lvl.number}`,
        description: lvl.description,
        difficulty: lvl.difficulty,
        questionCount: lvl.questionCount,
        passingScore: lvl.passingScore,
        timeLimit: lvl.timeLimit,
        status,
        bestScore: plp?.bestScore || 0,
        mastery: plp?.mastery || 0,
      });
    }

    return {
      exercise: {
        _id: exercise._id,
        title: exercise.title,
        isLearnCompleted,
      },
      levels: results,
    };
  }

  async getPracticeLevelQuestions(practiceLevelId, userId) {
    const practiceLevel = await PracticeLevel.findById(practiceLevelId);
    if (!practiceLevel) throw ApiError.notFound('Practice level not found');

    const questions = await Question.find({
      practiceLevel: practiceLevelId,
      context: 'practice',
      isPublished: true,
    }).sort({ order: 1 });

    return {
      practiceLevel,
      questions,
    };
  }
}

module.exports = new CurriculumService();
