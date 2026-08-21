const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: [true, 'Grade number is required (e.g. 1, 2, 3, 4, 5)'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Grade name is required (e.g. Grade 1)'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: false, // Admin enables when content is ready
    },
    icon: {
      type: String,
      default: 'shapes-outline',
    },
    color: {
      type: String,
      default: '#8B5CF6',
    },
    order: {
      type: Number,
      default: 1,
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

gradeSchema.index({ isEnabled: 1, order: 1 });

const Grade = mongoose.model('Grade', gradeSchema);
module.exports = Grade;
