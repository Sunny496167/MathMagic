const express = require('express');
const ApiResponse = require('../../utils/apiResponse');

const router = express.Router();

// Public / Protected Math routes (for curriculum, questions, topic mastery)
router.get('/curriculum/grade-1', (req, res) => {
  return ApiResponse.success(res, 'Grade 1 curriculum topics', {
    sections: [
      { id: 'numbers', title: 'Numbers & Counting', icon: 'calculator' },
      { id: 'addition', title: 'Addition', icon: 'add' },
      { id: 'subtraction', title: 'Subtraction', icon: 'remove' },
      { id: 'shapes', title: 'Shapes & Space', icon: 'shapes' },
      { id: 'measurement', title: 'Measurement', icon: 'ruler' },
      { id: 'time', title: 'Time', icon: 'time' },
      { id: 'money', title: 'Money', icon: 'cash' },
      { id: 'patterns', title: 'Patterns', icon: 'grid' },
      { id: 'data', title: 'Data Handling', icon: 'bar-chart' },
      { id: 'mental-math', title: 'Mental Math', icon: 'flash' },
      { id: 'word-problems', title: 'Word Problems', icon: 'book' },
    ],
  });
});

module.exports = router;
