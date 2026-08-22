const Grade = require('../curriculum/models/grade.model');
const Topic = require('../curriculum/models/topic.model');
const Exercise = require('../curriculum/models/exercise.model');
const PracticeLevel = require('../curriculum/models/practiceLevel.model');
const Question = require('../question/question.model');
const User = require('../user/user.model');
const UserProgress = require('../progress/progress.model');
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
    return await Exercise.find({ topic: topicId }).sort({ order: 1, subtopicNumber: 1 });
  }

  async updateExercise(id, updates) {
    const exercise = await Exercise.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!exercise) throw ApiError.notFound('Exercise not found');
    return exercise;
  }

  async updateExerciseContent(id, contentData) {
    const exercise = await Exercise.findById(id);
    if (!exercise) throw ApiError.notFound('Exercise not found');
    exercise.learningContent = contentData;
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

  // --- STUDENTS & PROGRESS ---
  async getStudents(filters = {}) {
    const { search, gradeId } = filters;
    const query = { role: { $ne: 'admin' } };

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    if (gradeId) {
      query.selectedGrade = gradeId;
    }

    const students = await User.find(query)
      .populate('selectedGrade', 'number name description icon color')
      .sort({ createdAt: -1 });

    const studentList = await Promise.all(
      students.map(async (student) => {
        const targetGradeId = student.selectedGrade?._id || student.selectedGrade;
        let progress = null;
        if (targetGradeId) {
          progress = await UserProgress.findOne({ user: student._id, grade: targetGradeId });
        }

        const stats = progress?.stats || {
          totalQuestionsAnswered: 0,
          totalCorrectAnswers: 0,
          overallAccuracy: 0,
          exercisesCompleted: 0,
          topicsCompleted: 0,
          practiceLevelsCompleted: 0,
          totalXp: student.xp || 0,
          currentStreak: student.streak || 0,
        };

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          avatar: student.avatar,
          role: student.role,
          isActive: student.isActive,
          selectedGrade: student.selectedGrade,
          xp: student.xp || 0,
          streak: student.streak || 0,
          stats,
          createdAt: student.createdAt,
          lastLoginAt: student.lastLoginAt,
        };
      })
    );

    return studentList;
  }

  async getStudentProgress(studentId, gradeId) {
    const student = await User.findById(studentId).populate('selectedGrade', 'number name description icon color');
    if (!student) throw ApiError.notFound('Student not found');

    const targetGradeId = gradeId || student.selectedGrade?._id || student.selectedGrade;
    if (!targetGradeId) {
      return {
        student,
        grade: null,
        stats: {
          totalQuestionsAnswered: 0,
          totalCorrectAnswers: 0,
          overallAccuracy: 0,
          exercisesCompleted: 0,
          topicsCompleted: 0,
          practiceLevelsCompleted: 0,
          totalXp: student.xp || 0,
          currentStreak: student.streak || 0,
        },
        topics: [],
      };
    }

    const grade = await Grade.findById(targetGradeId);
    let progress = await UserProgress.findOne({ user: studentId, grade: targetGradeId });
    if (!progress) {
      progress = await UserProgress.create({
        user: studentId,
        grade: targetGradeId,
        exerciseProgress: [],
        practiceLevelProgress: [],
      });
    }

    const rawTopics = await Topic.find({ grade: targetGradeId, isPublished: true }).sort({ order: 1 });
    const fullTopics = await Promise.all(
      rawTopics.map(async (topic) => {
        const exercises = await Exercise.find({ topic: topic._id, isPublished: true }).sort({ order: 1 });
        const exWithProgress = await Promise.all(
          exercises.map(async (ex) => {
            const ep = progress.exerciseProgress.find((p) => p.exercise.toString() === ex._id.toString());
            const practiceLevels = await PracticeLevel.find({ exercise: ex._id, isPublished: true }).sort({ order: 1 });

            const levelsWithProgress = practiceLevels.map((lvl) => {
              const plp = progress.practiceLevelProgress.find((p) => p.practiceLevel.toString() === lvl._id.toString());
              return {
                _id: lvl._id,
                number: lvl.number,
                title: lvl.title,
                difficulty: lvl.difficulty,
                questionCount: lvl.questionCount,
                passingScore: lvl.passingScore,
                status: plp?.status || 'locked',
                bestScore: plp?.bestScore || 0,
                mastery: plp?.mastery || 0,
                attemptsCount: plp?.attempts?.length || 0,
                completed: plp?.completed || false,
                completedAt: plp?.completedAt || null,
              };
            });

            return {
              _id: ex._id,
              title: ex.title,
              subtopicNumber: ex.subtopicNumber,
              status: ep?.status || 'locked',
              contentRead: ep?.contentRead || false,
              score: ep?.score || 0,
              answersCount: ep?.answers?.length || 0,
              completedAt: ep?.completedAt || null,
              practiceLevels: levelsWithProgress,
            };
          })
        );

        const allCompleted = exWithProgress.length > 0 && exWithProgress.every((e) => e.status === 'completed');
        const topicStatus = allCompleted ? 'completed' : exWithProgress.some((e) => e.status !== 'locked') ? 'in_progress' : 'locked';

        return {
          _id: topic._id,
          title: topic.title,
          icon: topic.icon,
          color: topic.color,
          order: topic.order,
          status: topicStatus,
          exercises: exWithProgress,
        };
      })
    );

    return {
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        selectedGrade: student.selectedGrade,
        xp: student.xp || 0,
        streak: student.streak || 0,
        createdAt: student.createdAt,
        lastLoginAt: student.lastLoginAt,
      },
      grade,
      stats: progress.stats,
      topics: fullTopics,
    };
  }
}

module.exports = new AdminService();
