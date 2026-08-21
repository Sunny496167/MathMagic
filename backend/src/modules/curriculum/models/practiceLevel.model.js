const mongoose = require('mongoose');

const practiceLevelSchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: [true, 'Exercise reference is required'],
      index: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic reference is required'],
      index: true,
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: [true, 'Grade reference is required'],
      index: true,
    },
    number: {
      type: Number,
      required: [true, 'Level number is required (1, 2, 3...)'],
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'easy', 'medium', 'hard', 'advanced'],
      default: 'easy',
    },
    order: {
      type: Number,
      default: 1, // Sequential level order inside exercise practice
    },
    questionCount: {
      type: Number,
      default: 30, // 30-50 questions configured by admin
      min: [1, 'Question count must be at least 1'],
    },
    passingScore: {
      type: Number,
      default: 70, // Min % score to complete this practice level
    },
    timeLimit: {
      type: Number,
      default: 0, // 0 = no time limit, or seconds
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

practiceLevelSchema.index({ exercise: 1, number: 1 }, { unique: true });
practiceLevelSchema.index({ exercise: 1, order: 1 });

const PracticeLevel = mongoose.model('PracticeLevel', practiceLevelSchema);
module.exports = PracticeLevel;
