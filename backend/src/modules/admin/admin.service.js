const Grade = require('../curriculum/models/grade.model');
const Topic = require('../curriculum/models/topic.model');
const Exercise = require('../curriculum/models/exercise.model');
const PracticeLevel = require('../curriculum/models/practiceLevel.model');
const Question = require('../question/question.model');
const User = require('../user/user.model');
const ApiError = require('../../utils/apiError');

class AdminService {
  // --- GRADES ---
  async createGrade(data, userId) {
    const existing = await Grade.findOne({ number: data.number });
    if (existing) {
      throw ApiError.conflict(`Grade number ${data.number} already exists`);
    }
    return await Grade.create({ ...data, createdBy: userId });
  }

  async getAllGrades() {
    return await Grade.find().sort({ order: 1, number: 1 });
  }

  async updateGrade(id, updates) {
    const grade = await Grade.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!grade) throw ApiError.notFound('Grade not found');
    return grade;
  }

  async toggleGrade(id) {
    const grade = await Grade.findById(id);
    if (!grade) throw ApiError.notFound('Grade not found');
    grade.isEnabled = !grade.isEnabled;
    await grade.save();
    return grade;
  }

  async deleteGrade(id) {
    const grade = await Grade.findByIdAndDelete(id);
    if (!grade) throw ApiError.notFound('Grade not found');
    return { message: 'Grade deleted successfully' };
  }

  // --- TOPICS ---
  async createTopic(data, userId) {
    const grade = await Grade.findById(data.gradeId);
    if (!grade) throw ApiError.notFound('Grade not found');

    const topic = await Topic.create({
      ...data,
      grade: data.gradeId,
      createdBy: userId,
    });
    return topic;
  }

  async getTopicsByGrade(gradeId) {
    return await Topic.find({ grade: gradeId }).sort({ order: 1 });
  }

  async updateTopic(id, updates) {
    const topic = await Topic.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!topic) throw ApiError.notFound('Topic not found');
    return topic;
  }

  async toggleTopicPublish(id) {
    const topic = await Topic.findById(id);
    if (!topic) throw ApiError.notFound('Topic not found');
    topic.isPublished = !topic.isPublished;
    await topic.save();
    return topic;
  }

  async deleteTopic(id) {
    const topic = await Topic.findByIdAndDelete(id);
    if (!topic) throw ApiError.notFound('Topic not found');
    return { message: 'Topic deleted successfully' };
  }

  // --- EXERCISES ---
  async createExercise(data, userId) {
    const topic = await Topic.findById(data.topicId);
    if (!topic) throw ApiError.notFound('Topic not found');

    const exercise = await Exercise.create({
      ...data,
      topic: data.topicId,
      grade: topic.grade,
      createdBy: userId,
    });
    return exercise;
  }

  async getExercisesByTopic(topicId) {
    return await Exercise.find({ topic: topicId }).sort({ order: 1 });
  }

  async updateExercise(id, updates) {
    const exercise = await Exercise.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!exercise) throw ApiError.notFound('Exercise not found');
    return exercise;
  }

  async updateExerciseContent(id, blocks) {
    const exercise = await Exercise.findById(id);
    if (!exercise) throw ApiError.notFound('Exercise not found');
    exercise.learningContent = { blocks };
    await exercise.save();
    return exercise;
  }

  async toggleExercisePublish(id) {
    const exercise = await Exercise.findById(id);
    if (!exercise) throw ApiError.notFound('Exercise not found');
    exercise.isPublished = !exercise.isPublished;
    await exercise.save();
    return exercise;
  }

  async deleteExercise(id) {
    const exercise = await Exercise.findByIdAndDelete(id);
    if (!exercise) throw ApiError.notFound('Exercise not found');
    return { message: 'Exercise deleted successfully' };
  }

  // --- PRACTICE LEVELS ---
  async createPracticeLevel(data, userId) {
    const exercise = await Exercise.findById(data.exerciseId);
    if (!exercise) throw ApiError.notFound('Exercise not found');

    const existing = await PracticeLevel.findOne({
      exercise: data.exerciseId,
      number: data.number,
    });
    if (existing) {
      throw ApiError.conflict(`Practice level ${data.number} already exists for this exercise`);
    }

    const practiceLevel = await PracticeLevel.create({
      ...data,
      exercise: data.exerciseId,
      topic: exercise.topic,
      grade: exercise.grade,
      createdBy: userId,
    });
    return practiceLevel;
  }

  async getPracticeLevelsByExercise(exerciseId) {
    return await PracticeLevel.find({ exercise: exerciseId }).sort({ order: 1, number: 1 });
  }

  async updatePracticeLevel(id, updates) {
    const level = await PracticeLevel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!level) throw ApiError.notFound('Practice level not found');
    return level;
  }

  async togglePracticeLevelPublish(id) {
    const level = await PracticeLevel.findById(id);
    if (!level) throw ApiError.notFound('Practice level not found');
    level.isPublished = !level.isPublished;
    await level.save();
    return level;
  }

  async deletePracticeLevel(id) {
    const level = await PracticeLevel.findByIdAndDelete(id);
    if (!level) throw ApiError.notFound('Practice level not found');
    return { message: 'Practice level deleted successfully' };
  }

  // --- DASHBOARD STATS ---
  async getDashboardStats() {
    const [gradesCount, topicsCount, exercisesCount, levelsCount, questionsCount, studentsCount] =
      await Promise.all([
        Grade.countDocuments(),
        Topic.countDocuments(),
        Exercise.countDocuments(),
        PracticeLevel.countDocuments(),
        Question.countDocuments(),
        User.countDocuments({ role: { $ne: 'admin' } }),
      ]);

    return {
      grades: gradesCount,
      topics: topicsCount,
      exercises: exercisesCount,
      practiceLevels: levelsCount,
      questions: questionsCount,
      students: studentsCount,
    };
  }
}

module.exports = new AdminService();
