const GameSession = require('./gameSession.model');
const UserProgress = require('../progress/progress.model');
const User = require('../user/user.model');
const Grade = require('../curriculum/models/grade.model');
const Topic = require('../curriculum/models/topic.model');
const Exercise = require('../curriculum/models/exercise.model');
const Question = require('../question/question.model');
const ApiError = require('../../utils/apiError');

const GAME_CATALOG = [
  {
    gameType: 'quick_math',
    title: 'Quick Math',
    subtitle: 'Speed Runner',
    description: '60-second speed challenge with combo multipliers for streaks!',
    icon: 'flash-outline',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#6D28D9'],
    minCompletedTopics: 0, // Unlocked by default
    defaultQuestionCount: 15,
  },
  {
    gameType: 'number_match',
    title: 'Number Match',
    subtitle: 'Tile Pairer',
    description: 'Match equation tiles to their correct solutions to clear the board.',
    icon: 'grid-outline',
    color: '#10B981',
    gradient: ['#10B981', '#047857'],
    minCompletedTopics: 0,
    defaultQuestionCount: 8,
  },
  {
    gameType: 'memory_math',
    title: 'Memory Math',
    subtitle: 'Card Flip Grid',
    description: 'Flip face-down cards to discover matching math problem pairs.',
    icon: 'albums-outline',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#1D4ED8'],
    minCompletedTopics: 0,
    defaultQuestionCount: 6,
  },
  {
    gameType: 'math_catch',
    title: 'Math Catch',
    subtitle: 'Falling Numbers',
    description: 'Catch numbers that match the target rule before they drop!',
    icon: 'tennisball-outline',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
    minCompletedTopics: 1,
    defaultQuestionCount: 12,
  },
  {
    gameType: 'shape_hunt',
    title: 'Shape Hunt',
    subtitle: 'Visual Explorer',
    description: 'Identify 2D/3D shapes and complete visual pattern sequences.',
    icon: 'shapes-outline',
    color: '#EC4899',
    gradient: ['#EC4899', '#BE185D'],
    minCompletedTopics: 1,
    defaultQuestionCount: 10,
  },
  {
    gameType: 'clock_challenge',
    title: 'Clock Challenge',
    subtitle: 'Time Reader',
    description: 'Read analog clock dials and match target hours and minutes.',
    icon: 'time-outline',
    color: '#06B6D4',
    gradient: ['#06B6D4', '#0E7490'],
    minCompletedTopics: 1,
    defaultQuestionCount: 10,
  },
  {
    gameType: 'money_market',
    title: 'Market Stall',
    subtitle: 'Coin & Shop Sim',
    description: 'Buy grocery items with coins and calculate exact change.',
    icon: 'cart-outline',
    color: '#14B8A6',
    gradient: ['#14B8A6', '#0F766E'],
    minCompletedTopics: 1,
    defaultQuestionCount: 10,
  },
  {
    gameType: 'mixed_recall',
    title: 'Boss Arena',
    subtitle: 'Mixed Recall',
    description: 'Cross-topic boss challenge drawing questions from all learned skills!',
    icon: 'trophy-outline',
    color: '#EF4444',
    gradient: ['#EF4444', '#B91C1C'],
    minCompletedTopics: 1,
    defaultQuestionCount: 15,
  },
];

class GameService {
  /**
   * Returns available game types with unlock statuses and student high scores
   */
  async getAvailableGames(userId) {
    const user = await User.findById(userId);
    const gradeId = user?.selectedGrade?._id || user?.selectedGrade;

    let completedTopicsCount = 0;
    if (gradeId) {
      const progress = await UserProgress.findOne({ user: userId, grade: gradeId });
      completedTopicsCount = progress?.stats?.topicsCompleted || 0;
    }

    // Fetch user's best game sessions
    const gameSessions = await GameSession.find({ user: userId });
    const highScoreMap = {};
    const starsMap = {};

    gameSessions.forEach((s) => {
      if (!highScoreMap[s.gameType] || s.score > highScoreMap[s.gameType]) {
        highScoreMap[s.gameType] = s.score;
      }
      if (!starsMap[s.gameType] || s.starsEarned > starsMap[s.gameType]) {
        starsMap[s.gameType] = s.starsEarned;
      }
    });

    const games = GAME_CATALOG.map((g) => {
      const isUnlocked = completedTopicsCount >= g.minCompletedTopics;
      return {
        ...g,
        isUnlocked,
        highScore: highScoreMap[g.gameType] || 0,
        stars: starsMap[g.gameType] || 0,
        requiredTopics: g.minCompletedTopics,
      };
    });

    return games;
  }

  /**
   * Smart Question Selection Engine (Recall & Spaced Repetition)
   */
  async generateGameQuestions(userId, gameType, requestedCount = 10) {
    const user = await User.findById(userId);
    let gradeId = user?.selectedGrade?._id || user?.selectedGrade;

    if (!gradeId) {
      const g1 = await Grade.findOne({ number: 1, isEnabled: true });
      if (g1) gradeId = g1._id;
    }

    let progress = null;
    if (gradeId) {
      progress = await UserProgress.findOne({ user: userId, grade: gradeId });
    }

    // 1. Identify completed exercises & weak practice levels
    const completedExerciseIds = [];
    const weakPracticeLevelIds = [];
    const olderTopicIds = [];

    if (progress) {
      // Completed exercises
      (progress.exerciseProgress || []).forEach((ep) => {
        if (ep.status === 'completed' || ep.contentRead) {
          completedExerciseIds.push(ep.exercise);
        }
      });

      // Weak practice levels (mastery < 75 or attempted but not completed)
      (progress.practiceLevelProgress || []).forEach((plp) => {
        if (plp.mastery < 75 || plp.status === 'in_progress') {
          weakPracticeLevelIds.push(plp.practiceLevel);
        }
      });
    }

    let questionPool = [];

    // 2. If user has completed exercises, query from completed pool
    if (completedExerciseIds.length > 0) {
      // Weak questions (Weight 40%)
      let weakQuestions = [];
      if (weakPracticeLevelIds.length > 0) {
        weakQuestions = await Question.find({
          practiceLevel: { $in: weakPracticeLevelIds },
          isPublished: true,
        }).limit(20);
      }

      // Exercise questions from completed exercises (Weight 60%)
      const completedQuestions = await Question.find({
        $or: [
          { exercise: { $in: completedExerciseIds } },
          { grade: gradeId },
        ],
        isPublished: true,
      }).limit(50);

      questionPool = [...weakQuestions, ...completedQuestions];
    } else {
      // Fallback: Grade 1 published questions
      questionPool = await Question.find({
        grade: gradeId,
        isPublished: true,
      }).limit(40);
    }

    // 3. Deduplicate question pool
    const seenTexts = new Set();
    const uniquePool = [];
    for (const q of questionPool) {
      const textKey = String(q.text || '').trim().toLowerCase();
      if (!seenTexts.has(textKey)) {
        seenTexts.add(textKey);
        uniquePool.push(q);
      }
    }

    // 4. Shuffle and select target count
    const shuffled = uniquePool.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, requestedCount);

    // 5. Build specialized matching pairs if game is number_match or memory_math
    let formattedPairs = [];
    if (gameType === 'number_match' || gameType === 'memory_math') {
      formattedPairs = selectedQuestions.map((q, idx) => {
        // Extract clean prompt and answer
        let promptText = q.text.replace(/^Q\d+:\s*/, '').replace(/Calculate:\s*/, '').replace(/\s*=\s*\?/, '');
        let answerText = String(q.correctAnswer || '');
        return {
          id: `pair_${idx}`,
          left: promptText,
          right: answerText,
        };
      });
    }

    return {
      gameType,
      questionCount: selectedQuestions.length,
      questions: selectedQuestions,
      pairs: formattedPairs,
    };
  }

  /**
   * Submit and evaluate complete mini-game session
   */
  async submitGameSession(userId, data) {
    const { gameType, score = 0, accuracy = 0, maxCombo = 0, totalTimeMs = 0, answers = [] } = data;

    const user = await User.findById(userId);
    let gradeId = user?.selectedGrade?._id || user?.selectedGrade;
    if (!gradeId) {
      const g1 = await Grade.findOne({ number: 1 });
      gradeId = g1?._id;
    }

    const totalQuestions = answers.length;
    const totalCorrect = answers.filter((a) => a.isCorrect).length;
    const calculatedAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : accuracy;

    // Stars Calculation:
    // 3 Stars: Accuracy >= 90% or maxCombo >= 5
    // 2 Stars: Accuracy >= 70% or score >= 500
    // 1 Star: Accuracy >= 40%
    let starsEarned = 1;
    if (calculatedAccuracy >= 90 || maxCombo >= 5) {
      starsEarned = 3;
    } else if (calculatedAccuracy >= 70) {
      starsEarned = 2;
    }

    // XP calculation: Base XP (score / 10) + Combo bonus + Star bonus
    const comboBonus = maxCombo * 5;
    const starBonus = starsEarned * 15;
    const xpEarned = Math.max(Math.round(score / 5) + comboBonus + starBonus, 20);

    // Check high score
    const existingBest = await GameSession.findOne({ user: userId, gameType }).sort({ score: -1 });
    const isHighScore = !existingBest || score > (existingBest.score || 0);

    // Save GameSession
    const session = await GameSession.create({
      user: userId,
      grade: gradeId,
      gameType,
      score,
      accuracy: calculatedAccuracy,
      maxCombo,
      totalTimeMs,
      questionsPlayed: answers.map((a) => ({
        question: a.questionId || null,
        userAnswer: a.userAnswer,
        isCorrect: a.isCorrect,
        timeSpentMs: a.timeSpentMs || 0,
      })),
      totalQuestions,
      totalCorrect,
      xpEarned,
      starsEarned,
      isHighScore,
      completedAt: new Date(),
    });

    // Update User XP & Streak
    await User.findByIdAndUpdate(userId, {
      $inc: { xp: xpEarned },
      lastActiveDate: new Date(),
    });

    // Update Progress Stats
    if (gradeId) {
      let progress = await UserProgress.findOne({ user: userId, grade: gradeId });
      if (progress) {
        progress.stats.gamesPlayed = (progress.stats.gamesPlayed || 0) + 1;
        progress.stats.totalXp = (progress.stats.totalXp || 0) + xpEarned;
        progress.stats.lastActiveDate = new Date();
        await progress.save();
      }
    }

    const updatedUser = await User.findById(userId);

    return {
      sessionId: session._id,
      gameType,
      score,
      accuracy: calculatedAccuracy,
      maxCombo,
      totalTimeMs,
      totalCorrect,
      totalQuestions,
      starsEarned,
      xpEarned,
      isHighScore,
      newTotalXp: updatedUser?.xp || 0,
      message: isHighScore ? '🎉 New High Score Record!' : 'Game Session Completed!',
    };
  }
}

module.exports = new GameService();
