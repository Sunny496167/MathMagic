const Question = require('./question.model');
const Exercise = require('../curriculum/models/exercise.model');
const PracticeLevel = require('../curriculum/models/practiceLevel.model');
const ApiError = require('../../utils/apiError');

class QuestionService {
  async createQuestion(data, userId) {
    const { context, exerciseId, practiceLevelId, ...questionFields } = data;

    let exercise = null;
    let practiceLevel = null;
    let gradeId = null;
    let topicId = null;

    if (context === 'learn') {
      if (!exerciseId) {
        throw ApiError.badRequest('exerciseId is required when context is "learn"');
      }
      exercise = await Exercise.findById(exerciseId);
      if (!exercise) throw ApiError.notFound('Exercise not found');
      gradeId = exercise.grade;
      topicId = exercise.topic;
    } else if (context === 'practice') {
      if (!practiceLevelId) {
        throw ApiError.badRequest('practiceLevelId is required when context is "practice"');
      }
      practiceLevel = await PracticeLevel.findById(practiceLevelId);
      if (!practiceLevel) throw ApiError.notFound('Practice level not found');
      exercise = await Exercise.findById(practiceLevel.exercise);
      gradeId = practiceLevel.grade;
      topicId = practiceLevel.topic;
    }

    const question = await Question.create({
      ...questionFields,
      context,
      exercise: exerciseId || (practiceLevel ? practiceLevel.exercise : null),
      practiceLevel: practiceLevelId || null,
      grade: gradeId,
      topic: topicId,
      createdBy: userId,
    });

    return question;
  }

  async bulkCreateQuestions(payload, userId) {
    const { context, exerciseId, practiceLevelId, questions } = payload;

    let gradeId = null;
    let topicId = null;
    let exerciseRef = null;
    let practiceLevelRef = null;

    if (context === 'learn') {
      if (!exerciseId) {
        throw ApiError.badRequest('exerciseId is required when context is "learn"');
      }
      const exercise = await Exercise.findById(exerciseId);
      if (!exercise) throw ApiError.notFound('Exercise not found');
      exerciseRef = exercise._id;
      gradeId = exercise.grade;
      topicId = exercise.topic;
    } else if (context === 'practice') {
      if (!practiceLevelId) {
        throw ApiError.badRequest('practiceLevelId is required when context is "practice"');
      }
      const practiceLevel = await PracticeLevel.findById(practiceLevelId);
      if (!practiceLevel) throw ApiError.notFound('Practice level not found');
      practiceLevelRef = practiceLevel._id;
      exerciseRef = practiceLevel.exercise;
      gradeId = practiceLevel.grade;
      topicId = practiceLevel.topic;
    }

    const questionDocs = questions.map((q, idx) => ({
      ...q,
      context,
      exercise: exerciseRef,
      practiceLevel: practiceLevelRef,
      grade: gradeId,
      topic: topicId,
      order: q.order || idx + 1,
      createdBy: userId,
    }));

    const inserted = await Question.insertMany(questionDocs);
    return {
      count: inserted.length,
      questions: inserted,
    };
  }

  async getQuestions(filter = {}) {
    const query = {};
    if (filter.exerciseId) query.exercise = filter.exerciseId;
    if (filter.practiceLevelId) query.practiceLevel = filter.practiceLevelId;
    if (filter.context) query.context = filter.context;
    if (filter.topicId) query.topic = filter.topicId;
    if (filter.gradeId) query.grade = filter.gradeId;
    if (filter.difficulty) query.difficulty = filter.difficulty;
    if (filter.type) query.type = filter.type;

    return await Question.find(query).sort({ order: 1 });
  }

  async getQuestionById(id) {
    const question = await Question.findById(id);
    if (!question) throw ApiError.notFound('Question not found');
    return question;
  }

  async updateQuestion(id, updates) {
    const question = await Question.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!question) throw ApiError.notFound('Question not found');
    return question;
  }

  async deleteQuestion(id) {
    const question = await Question.findByIdAndDelete(id);
    if (!question) throw ApiError.notFound('Question not found');
    return { message: 'Question deleted successfully' };
  }
}

module.exports = new QuestionService();
