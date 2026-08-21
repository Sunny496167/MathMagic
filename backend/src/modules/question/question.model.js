const mongoose = require('mongoose');

const matchPairSchema = new mongoose.Schema(
  {
    left: { type: String, required: true },
    right: { type: String, required: true },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    context: {
      type: String,
      enum: ['learn', 'practice'],
      required: [true, 'Question context is required (learn or practice)'],
      index: true,
    },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      default: null,
      index: true,
    },
    practiceLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PracticeLevel',
      default: null,
      index: true,
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      default: null,
      index: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['mcq', 'numeric', 'fill_blank', 'true_false', 'matching', 'ordering', 'image_mcq'],
      required: [true, 'Question type is required'],
      default: 'mcq',
    },
    text: {
      type: String,
      required: [true, 'Question text / prompt is required'],
      trim: true,
    },
    // For MCQ and Image MCQ
    options: {
      type: [String],
      default: [],
    },
    // The correct answer (string, number, boolean)
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Correct answer is required'],
    },
    // For fill in the blank variations (e.g. ["5", "five", "Five"])
    acceptableAnswers: {
      type: [String],
      default: [],
    },
    // For matching question type
    matchPairs: [matchPairSchema],
    // For ordering question type
    correctOrder: {
      type: [String],
      default: [],
    },
    // For image-based questions
    imageUrl: {
      type: String,
      default: '',
    },
    explanation: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'easy', 'medium', 'hard'],
      default: 'easy',
    },
    xpReward: {
      type: Number,
      default: 5,
    },
    order: {
      type: Number,
      default: 1,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ exercise: 1, context: 1, order: 1 });
questionSchema.index({ practiceLevel: 1, context: 1, order: 1 });

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
