const mongoose = require('mongoose');

const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['text', 'heading', 'example', 'tip', 'image', 'formula', 'note'],
      default: 'text',
    },
    content: {
      type: String,
      required: [true, 'Block content is required'],
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const exerciseSchema = new mongoose.Schema(
  {
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
    subtopicNumber: {
      type: Number,
      default: 1, // Subtopic 1, Subtopic 2, etc.
    },
    title: {
      type: String,
      required: [true, 'Exercise/Subtopic title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    icon: {
      type: String,
      default: 'happy-outline',
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    order: {
      type: Number,
      default: 1, // Sequential order inside the topic
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    learningContent: {
      summary: {
        type: String,
        default: '',
      },
      blocks: [contentBlockSchema],
    },
    completionRequirement: {
      minScore: {
        type: Number,
        default: 80, // Minimum % to pass the learn exercise
      },
      mustAnswerAll: {
        type: Boolean,
        default: true,
      },
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

exerciseSchema.index({ topic: 1, order: 1 });

const Exercise = mongoose.model('Exercise', exerciseSchema);
module.exports = Exercise;
