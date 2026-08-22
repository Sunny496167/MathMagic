const UserProgress = require('./progress.model');
const User = require('../user/user.model');
const Grade = require('../curriculum/models/grade.model');
const Topic = require('../curriculum/models/topic.model');
const Exercise = require('../curriculum/models/exercise.model');
const PracticeLevel = require('../curriculum/models/practiceLevel.model');
const Question = require('../question/question.model');
const ApiError = require('../../utils/apiError');

class ProgressService {
  async getOrCreateProgress(userId, gradeId) {
    let progress = await UserProgress.findOne({ user: userId, grade: gradeId });
    if (!progress) {
      progress = await UserProgress.create({
        user: userId,
        grade: gradeId,
        exerciseProgress: [],
        practiceLevelProgress: [],
        stats: {
          totalQuestionsAnswered: 0,
          totalCorrectAnswers: 0,
          overallAccuracy: 0,
          exercisesCompleted: 0,
          topicsCompleted: 0,
          practiceLevelsCompleted: 0,
          gamesPlayed: 0,
          totalXp: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: new Date(),
        },
      });
    }
    return progress;
  }

  /**
   * Returns the entire hierarchical tree: Grade -> Topics -> Exercises -> Practice Levels with statuses
   */
  async getFullProgressTree(userId, gradeId) {
    let targetGradeId = gradeId;
    if (!targetGradeId) {
      const user = await User.findById(userId);
      if (user && user.selectedGrade) {
        targetGradeId = user.selectedGrade;
      } else {
        const firstGrade = await Grade.findOne({ isEnabled: true }).sort({ order: 1 });
        if (firstGrade) targetGradeId = firstGrade._id;
      }
    }

    if (!targetGradeId) {
      return { grade: null, topics: [], stats: {} };
    }

    const grade = await Grade.findById(targetGradeId);
    if (!grade) throw ApiError.notFound('Grade not found');

    const progress = await this.getOrCreateProgress(userId, targetGradeId);
    const topics = await Topic.find({ grade: targetGradeId, isPublished: true }).sort({ order: 1 });

    const epMap = {};
    progress.exerciseProgress.forEach((ep) => {
      epMap[ep.exercise.toString()] = ep;
    });

    const plpMap = {};
    progress.practiceLevelProgress.forEach((plp) => {
      plpMap[plp.practiceLevel.toString()] = plp;
    });

    const tree = [];
    let completedTopicsCount = 0;
    let completedExercisesCount = 0;
    let completedPracticeLevelsCount = 0;

    for (let tIdx = 0; tIdx < topics.length; tIdx++) {
      const topic = topics[tIdx];
      const exercises = await Exercise.find({ topic: topic._id, isPublished: true }).sort({ order: 1 });

      const exerciseNodes = [];
      let allExercisesInTopicDone = exercises.length > 0;

      for (let eIdx = 0; eIdx < exercises.length; eIdx++) {
        const ex = exercises[eIdx];
        const ep = epMap[ex._id.toString()];

        let exStatus = 'locked';
        if (ep && ep.status === 'completed') {
          exStatus = 'completed';
          completedExercisesCount++;
        } else if (ep && ep.status === 'in_progress') {
          exStatus = 'in_progress';
          allExercisesInTopicDone = false;
        } else if (eIdx === 0 && (tIdx === 0 || tree[tIdx - 1]?.status === 'completed')) {
          exStatus = 'unlocked';
          allExercisesInTopicDone = false;
        } else {
          const prevExNode = exerciseNodes[eIdx - 1];
          if (prevExNode && prevExNode.status === 'completed') {
            exStatus = 'unlocked';
          }
          allExercisesInTopicDone = false;
        }

        // Fetch practice levels for this exercise
        const practiceLevels = await PracticeLevel.find({ exercise: ex._id, isPublished: true }).sort({ order: 1, number: 1 });
        const practiceLevelNodes = [];

        for (let pIdx = 0; pIdx < practiceLevels.length; pIdx++) {
          const pl = practiceLevels[pIdx];
          const plp = plpMap[pl._id.toString()];

          let plStatus = 'locked';
          if (exStatus !== 'completed') {
            plStatus = 'locked';
          } else if (plp && plp.status === 'completed') {
            plStatus = 'completed';
            completedPracticeLevelsCount++;
          } else if (plp && plp.status === 'in_progress') {
            plStatus = 'in_progress';
          } else if (pIdx === 0) {
            plStatus = 'unlocked';
          } else {
            const prevPlNode = practiceLevelNodes[pIdx - 1];
            if (prevPlNode && prevPlNode.status === 'completed') {
              plStatus = 'unlocked';
            }
          }

          practiceLevelNodes.push({
            _id: pl._id,
            number: pl.number,
            title: pl.title || `Level ${pl.number}`,
            difficulty: pl.difficulty,
            questionCount: pl.questionCount,
            passingScore: pl.passingScore,
            status: plStatus,
            bestScore: plp?.bestScore || 0,
            mastery: plp?.mastery || 0,
          });
        }

        exerciseNodes.push({
          _id: ex._id,
          title: ex.title,
          description: ex.description,
          icon: ex.icon,
          color: ex.color,
          order: ex.order,
          status: exStatus,
          learnScore: ep?.score || 0,
          practiceLevels: practiceLevelNodes,
        });
      }

      let topicStatus = 'locked';
      if (allExercisesInTopicDone && exercises.length > 0) {
        topicStatus = 'completed';
        completedTopicsCount++;
      } else if (tIdx === 0 || tree[tIdx - 1]?.status === 'completed') {
        topicStatus = exerciseNodes.some((e) => e.status === 'in_progress' || e.status === 'completed')
          ? 'in_progress'
          : 'unlocked';
      }

      tree.push({
        _id: topic._id,
        title: topic.title,
        description: topic.description,
        icon: topic.icon,
        color: topic.color,
        order: topic.order,
        status: topicStatus,
        exercises: exerciseNodes,
      });
    }

    // Refresh aggregated counts
    progress.stats.topicsCompleted = completedTopicsCount;
    progress.stats.exercisesCompleted = completedExercisesCount;
    progress.stats.practiceLevelsCompleted = completedPracticeLevelsCount;
    await progress.save();

    return {
      grade: {
        _id: grade._id,
        number: grade.number,
        name: grade.name,
        description: grade.description,
        icon: grade.icon,
        color: grade.color,
      },
      topics: tree,
      stats: progress.stats,
    };
  }

  /**
   * Submit an answer to a single learn question
   */
  async submitLearnAnswer(userId, exerciseId, data) {
    const { questionId, userAnswer, timeSpentMs = 0 } = data;

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) throw ApiError.notFound('Exercise not found');

    const question = await Question.findById(questionId);
    if (!question) throw ApiError.notFound('Question not found');

    // Check correctness
    let isCorrect = false;
    if (question.type === 'fill_blank') {
      const trimmedUser = String(userAnswer).trim().toLowerCase();
      const acceptable = [question.correctAnswer, ...(question.acceptableAnswers || [])].map((a) =>
        String(a).trim().toLowerCase()
      );
      isCorrect = acceptable.includes(trimmedUser);
    } else if (question.type === 'numeric') {
      isCorrect = Number(userAnswer) === Number(question.correctAnswer);
    } else if (question.type === 'true_false') {
      isCorrect = String(userAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase();
    } else {
      isCorrect = String(userAnswer).trim() === String(question.correctAnswer).trim();
    }

    const progress = await this.getOrCreateProgress(userId, exercise.grade);

    let ep = progress.exerciseProgress.find((e) => e.exercise.toString() === exerciseId.toString());
    if (!ep) {
      progress.exerciseProgress.push({
        exercise: exerciseId,
        topic: exercise.topic,
        status: 'in_progress',
        contentRead: true,
        answers: [],
        score: 0,
      });
      ep = progress.exerciseProgress[progress.exerciseProgress.length - 1];
    }

    // Check if question was already answered
    const existingAnsIdx = ep.answers.findIndex((a) => a.question.toString() === questionId.toString());
    if (existingAnsIdx >= 0) {
      ep.answers[existingAnsIdx] = {
        question: questionId,
        userAnswer,
        isCorrect,
        timeSpentMs,
        answeredAt: new Date(),
      };
    } else {
      ep.answers.push({
        question: questionId,
        userAnswer,
        isCorrect,
        timeSpentMs,
        answeredAt: new Date(),
      });
    }

    // Update stats
    progress.stats.totalQuestionsAnswered += 1;
    if (isCorrect) {
      progress.stats.totalCorrectAnswers += 1;
      const xpGained = question.xpReward || 5;
      progress.stats.totalXp += xpGained;
      await User.findByIdAndUpdate(userId, { $inc: { xp: xpGained } });
    }
    progress.stats.overallAccuracy = Math.round(
      (progress.stats.totalCorrectAnswers / Math.max(progress.stats.totalQuestionsAnswered, 1)) * 100
    );
    progress.stats.lastActiveDate = new Date();

    await progress.save();

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      xpEarned: isCorrect ? question.xpReward || 5 : 0,
    };
  }

  /**
   * Mark Learn exercise completed
   */
  async completeLearnExercise(userId, exerciseId) {
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) throw ApiError.notFound('Exercise not found');

    const totalQuestions = await Question.countDocuments({ exercise: exerciseId, context: 'learn', isPublished: true });
    const progress = await this.getOrCreateProgress(userId, exercise.grade);
    let ep = progress.exerciseProgress.find((e) => e.exercise.toString() === exerciseId.toString());

    const correctCount = ep ? ep.answers.filter((a) => a.isCorrect).length : 0;
    const finalScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    const requiredScore = exercise.completionRequirement?.minScore || 80;
    const passed = finalScore >= requiredScore;

    if (!ep) {
      progress.exerciseProgress.push({
        exercise: exerciseId,
        topic: exercise.topic,
        status: 'completed',
        contentRead: true,
        answers: [],
        score: finalScore,
        completedAt: new Date(),
      });
    } else {
      ep.score = finalScore;
      ep.status = 'completed';
      ep.completedAt = new Date();
    }

    await progress.save();
    return {
      success: true,
      score: finalScore,
      totalCorrect: correctCount,
      totalQuestions,
      requiredScore,
      passed,
      message: 'Exercise marked completed. Practice levels unlocked!',
    };
  }

  /**
   * Submit complete practice drill session
   */
  async submitPracticeSession(userId, practiceLevelId, data) {
    const { answers = [], totalTimeMs = 0 } = data;

    const practiceLevel = await PracticeLevel.findById(practiceLevelId);
    if (!practiceLevel) throw ApiError.notFound('Practice level not found');

    let totalCorrect = 0;
    const mistakes = [];
    const answerDocs = [];

    for (const ans of answers) {
      const q = await Question.findById(ans.questionId);
      if (!q) continue;

      let isCorrect = false;
      if (q.type === 'fill_blank') {
        const trimmedUser = String(ans.userAnswer).trim().toLowerCase();
        const acceptable = [q.correctAnswer, ...(q.acceptableAnswers || [])].map((a) =>
          String(a).trim().toLowerCase()
        );
        isCorrect = acceptable.includes(trimmedUser);
      } else if (q.type === 'numeric') {
        isCorrect = Number(ans.userAnswer) === Number(q.correctAnswer);
      } else {
        isCorrect = String(ans.userAnswer).trim() === String(q.correctAnswer).trim();
      }

      if (isCorrect) {
        totalCorrect++;
      } else {
        mistakes.push(q._id);
      }

      answerDocs.push({
        question: q._id,
        userAnswer: ans.userAnswer,
        isCorrect,
        timeSpentMs: ans.timeSpentMs || 0,
        answeredAt: new Date(),
      });
    }

    const totalQuestions = answers.length;
    const score = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const passed = score >= (practiceLevel.passingScore || 70);

    const progress = await this.getOrCreateProgress(userId, practiceLevel.grade);

    let plp = progress.practiceLevelProgress.find(
      (p) => p.practiceLevel.toString() === practiceLevelId.toString()
    );

    if (!plp) {
      progress.practiceLevelProgress.push({
        practiceLevel: practiceLevelId,
        exercise: practiceLevel.exercise,
        topic: practiceLevel.topic,
        status: passed ? 'completed' : 'in_progress',
        attempts: [],
        bestScore: score,
        mastery: score,
        completed: passed,
        completedAt: passed ? new Date() : null,
      });
      plp = progress.practiceLevelProgress[progress.practiceLevelProgress.length - 1];
    } else {
      plp.bestScore = Math.max(plp.bestScore, score);
      plp.mastery = Math.max(plp.mastery, score);
      if (passed) {
        plp.status = 'completed';
        plp.completed = true;
        plp.completedAt = new Date();
      }
    }

    plp.attempts.push({
      answers: answerDocs,
      score,
      totalCorrect,
      totalQuestions,
      accuracy: score,
      totalTimeMs,
      mistakes,
      completedAt: new Date(),
    });

    const xpGained = totalCorrect * 5;
    progress.stats.totalQuestionsAnswered += totalQuestions;
    progress.stats.totalCorrectAnswers += totalCorrect;
    progress.stats.totalXp += xpGained;
    progress.stats.overallAccuracy = Math.round(
      (progress.stats.totalCorrectAnswers / Math.max(progress.stats.totalQuestionsAnswered, 1)) * 100
    );
    progress.stats.lastActiveDate = new Date();

    await progress.save();
    await User.findByIdAndUpdate(userId, { $inc: { xp: xpGained } });

    return {
      score,
      totalCorrect,
      totalQuestions,
      accuracy: score,
      totalTimeMs,
      mistakesCount: mistakes.length,
      xpEarned: xpGained,
      passed,
      bestScore: plp.bestScore,
    };
  }
}

module.exports = new ProgressService();
