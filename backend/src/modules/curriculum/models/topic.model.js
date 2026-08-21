const mongoose = require('mongoose');

const introBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['text', 'heading', 'example', 'tip', 'image', 'formula'],
      default: 'text',
    },
    content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema(
  {
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: [true, 'Grade reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Topic title is required (e.g. Addition)'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // Topic Introduction & Overview
    introduction: {
      summary: {
        type: String,
        default: '',
      },
      videoUrl: {
        type: String,
        default: '',
      },
      keyTakeaways: {
        type: [String],
        default: [],
      },
      blocks: [introBlockSchema],
    },
    icon: {
      type: String,
      default: 'calculator-outline',
    },
    color: {
      type: String,
      default: '#10B981',
    },
    order: {
      type: Number,
      default: 1, // Sequential order inside the grade
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

topicSchema.index({ grade: 1, order: 1 });

const Topic = mongoose.model('Topic', topicSchema);
module.exports = Topic;
