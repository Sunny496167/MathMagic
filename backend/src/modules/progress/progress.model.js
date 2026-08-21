const mongoose = require('mongoose');

const answerRecordSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    userAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    timeSpentMs: {
      type: Number,
      default: 0,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const practiceAttemptSchema = new mongoose.Schema(
  {
    answers: [answerRecordSchema],
    score: {
      type: Number,
      required: true,
    },
    totalCorrect: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    totalTimeMs: {
      type: Number,
      default: 0,
    },
    mistakes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const exerciseProgressSchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    status: {
      type: String,
      enum: ['locked', 'unlocked', 'in_progress', 'completed'],
      default: 'locked',
    },
    contentRead: {
      type: Boolean,
      default: false,
    },
    answers: [answerRecordSchema],
    score: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const practiceLevelProgressSchema = new mongoose.Schema(
  {
    practiceLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PracticeLevel',
      required: true,
    },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    status: {
      type: String,
      enum: ['locked', 'unlocked', 'in_progress', 'completed'],
      default: 'locked',
    },
    attempts: [practiceAttemptSchema],
    bestScore: {
      type: Number,
      default: 0,
    },
    mastery: {
      type: Number,
      default: 0, // 0 - 100 percentage
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const userProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: true,
      index: true,
    },
    exerciseProgress: [exerciseProgressSchema],
    practiceLevelProgress: [practiceLevelProgressSchema],
    stats: {
      totalQuestionsAnswered: { type: Number, default: 0 },
      totalCorrectAnswers: { type: Number, default: 0 },
      overallAccuracy: { type: Number, default: 0 },
      exercisesCompleted: { type: Number, default: 0 },
      topicsCompleted: { type: Number, default: 0 },
      practiceLevelsCompleted: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      totalXp: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

userProgressSchema.index({ user: 1, grade: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
module.exports = UserProgress;
