const mongoose = require('mongoose');

const gameAnswerRecordSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
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

const gameSessionSchema = new mongoose.Schema(
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
    gameType: {
      type: String,
      enum: [
        'quick_math',
        'number_match',
        'memory_math',
        'math_catch',
        'shape_hunt',
        'clock_challenge',
        'money_market',
        'mixed_recall',
      ],
      required: true,
      index: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    maxCombo: {
      type: Number,
      default: 0,
    },
    totalTimeMs: {
      type: Number,
      default: 0,
    },
    questionsPlayed: [gameAnswerRecordSchema],
    totalQuestions: {
      type: Number,
      default: 0,
    },
    totalCorrect: {
      type: Number,
      default: 0,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    starsEarned: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,
    },
    isHighScore: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

gameSessionSchema.index({ user: 1, gameType: 1, score: -1 });

const GameSession = mongoose.model('GameSession', gameSessionSchema);
module.exports = GameSession;
