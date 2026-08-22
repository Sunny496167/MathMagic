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

  /**
   * Home Dashboard: Assembles greeting, enrolled grade, next continue lesson,
   * daily missions, 7-day activity history, and math fact of the day.
   */
  async getHomeDashboard(userId) {
    const user = await User.findById(userId).populate('selectedGrade');
    let grade = user?.selectedGrade;

    if (!grade) {
      grade = await Grade.findOne({ isEnabled: true }).sort({ order: 1, number: 1 });
    }

    const progress = grade ? await this.getOrCreateProgress(userId, grade._id) : null;

    // 1. Next "Continue Learning" lesson
    let continueLesson = null;
    if (grade) {
      const topics = await Topic.find({ grade: grade._id, isPublished: true }).sort({ order: 1 });
      const topicIds = topics.map((t) => t._id);
      const exercises = await Exercise.find({ topic: { $in: topicIds }, isPublished: true }).sort({
        order: 1,
        subtopicNumber: 1,
      });

      const completedExIds = new Set(
        (progress?.exerciseProgress || [])
          .filter((ep) => ep.status === 'completed')
          .map((ep) => ep.exercise.toString())
      );

      // Find first uncompleted exercise
      let nextExercise = exercises.find((ex) => !completedExIds.has(ex._id.toString()));
      if (!nextExercise && exercises.length > 0) {
        nextExercise = exercises[exercises.length - 1]; // All completed, review last
      }

      if (nextExercise) {
        const parentTopic = topics.find((t) => t._id.toString() === nextExercise.topic.toString());
        continueLesson = {
          exerciseId: nextExercise._id,
          exerciseTitle: nextExercise.title,
          subtopicNumber: nextExercise.subtopicNumber,
          topicId: parentTopic?._id,
          topicTitle: parentTopic?.title || 'Current Topic',
          color: nextExercise.color || parentTopic?.color || '#8B5CF6',
          icon: nextExercise.icon || 'book-outline',
          isCompleted: completedExIds.has(nextExercise._id.toString()),
        };
      }
    }

    // 2. Daily Missions calculation for today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Count today's learn lessons
    let learnCompletedToday = 0;
    let practiceQuestionsToday = 0;

    (progress?.exerciseProgress || []).forEach((ep) => {
      if (ep.completedAt && new Date(ep.completedAt) >= startOfToday) {
        learnCompletedToday++;
      }
    });

    (progress?.practiceLevelProgress || []).forEach((plp) => {
      (plp.attempts || []).forEach((att) => {
        if (att.completedAt && new Date(att.completedAt) >= startOfToday) {
          practiceQuestionsToday += att.totalQuestions || 0;
        }
      });
    });

    // Count today's games played
    const GameSession = require('../game/gameSession.model');
    const gamesPlayedToday = await GameSession.countDocuments({
      user: userId,
      completedAt: { $gte: startOfToday },
    });

    const missions = [
      {
        id: 'mission_learn',
        title: 'Complete 1 Learn Lesson',
        description: 'Read concepts and answer lesson questions',
        icon: 'book-outline',
        color: '#8B5CF6',
        target: 1,
        current: Math.min(learnCompletedToday, 1),
        isCompleted: learnCompletedToday >= 1,
        targetTab: 'learn',
      },
      {
        id: 'mission_practice',
        title: 'Solve 10 Practice Drill Questions',
        description: 'Boost speed and accuracy in practice drills',
        icon: 'calculator-outline',
        color: '#3B82F6',
        target: 10,
        current: Math.min(practiceQuestionsToday, 10),
        isCompleted: practiceQuestionsToday >= 10,
        targetTab: 'practice',
      },
      {
        id: 'mission_game',
        title: 'Play 1 Arcade Game',
        description: 'Challenge your mind in Quick Math or Number Match',
        icon: 'game-controller-outline',
        color: '#10B981',
        target: 1,
        current: Math.min(gamesPlayedToday, 1),
        isCompleted: gamesPlayedToday >= 1,
        targetTab: 'game',
      },
    ];

    const allMissionsCompleted = missions.every((m) => m.isCompleted);
    const missionRewardClaimedToday =
      user.lastDailyRewardClaimed && new Date(user.lastDailyRewardClaimed) >= startOfToday;

    // 3. 7-Day Weekly Activity
    const weeklyActivity = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      let dayQuestions = 0;
      (progress?.practiceLevelProgress || []).forEach((plp) => {
        (plp.attempts || []).forEach((att) => {
          if (att.completedAt && new Date(att.completedAt) >= dayStart && new Date(att.completedAt) <= dayEnd) {
            dayQuestions += att.totalQuestions || 0;
          }
        });
      });

      weeklyActivity.push({
        day: dayNames[d.getDay()],
        date: d.toISOString().split('T')[0],
        isToday: i === 0,
        isActive: dayQuestions > 0 || (i === 0 && (learnCompletedToday > 0 || gamesPlayedToday > 0)),
        questionsCount: dayQuestions,
      });
    }

    // 4. Daily Educational Math Fact
    const MATH_FACTS = [
      {
        title: 'Shapes Around Us',
        fact: 'A triangle has exactly 3 sides and 3 corners. Triangles are the strongest shape in architecture!',
        icon: 'shapes-outline',
        color: '#EC4899',
      },
      {
        title: 'The Magic of Zero',
        fact: 'Zero means nothing, but when you put it after a number, it makes it 10 times bigger!',
        icon: 'sparkles-outline',
        color: '#8B5CF6',
      },
      {
        title: 'Number Pairs',
        fact: 'Even numbers always make matching pairs (2, 4, 6, 8, 10). Odd numbers always have one left over!',
        icon: 'ribbon-outline',
        color: '#3B82F6',
      },
      {
        title: 'Telling Time',
        fact: 'A clock face is a circle with 12 hours. When the big hand points to 12, it is exactly on the hour!',
        icon: 'time-outline',
        color: '#06B6D4',
      },
      {
        title: 'Big & Small Dimensions',
        fact: 'Length is how long something is, while height is how tall something reaches upwards!',
        icon: 'resize-outline',
        color: '#10B981',
      },
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const dailyMathFact = MATH_FACTS[dayOfYear % MATH_FACTS.length];

    // 5. Total curriculum stats
    const totalTopicsCount = grade ? await Topic.countDocuments({ grade: grade._id, isPublished: true }) : 0;
    const completedTopicsCount = progress?.stats?.topicsCompleted || 0;

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp || 0,
        streak: user.streak || progress?.stats?.currentStreak || 1,
      },
      grade: grade
        ? {
            _id: grade._id,
            name: grade.name,
            number: grade.number,
            icon: grade.icon,
            color: grade.color,
          }
        : null,
      continueLesson,
      dailyMissions: {
        missions,
        allCompleted: allMissionsCompleted,
        rewardClaimed: !!missionRewardClaimedToday,
        bonusXp: 50,
      },
      weeklyActivity,
      dailyMathFact,
      curriculumProgress: {
        completedTopics: completedTopicsCount,
        totalTopics: totalTopicsCount,
        overallAccuracy: progress?.stats?.overallAccuracy || 100,
        totalQuestionsAnswered: progress?.stats?.totalQuestionsAnswered || 0,
      },
    };
  }

  /**
   * Claim daily mission bonus XP
   */
  async claimDailyMissionReward(userId) {
    const user = await User.findById(userId);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (user.lastDailyRewardClaimed && new Date(user.lastDailyRewardClaimed) >= startOfToday) {
      throw ApiError.badRequest('Daily mission bonus has already been claimed today');
    }

    const bonusXp = 50;
    user.xp = (user.xp || 0) + bonusXp;
    user.lastDailyRewardClaimed = new Date();
    await user.save();

    return {
      bonusXp,
      newTotalXp: user.xp,
      message: '🎉 Claimed +50 XP Daily Mission Bonus!',
    };
  }
}

module.exports = new ProgressService();
