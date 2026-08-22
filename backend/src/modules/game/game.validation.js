const { z } = require('zod');

const generateGameQuestionsSchema = z.object({
  body: z.object({
    gameType: z.enum([
      'quick_math',
      'number_match',
      'memory_math',
      'math_catch',
      'shape_hunt',
      'clock_challenge',
      'money_market',
      'mixed_recall',
    ]),
    questionCount: z.number().min(4).max(30).optional().default(10),
  }),
});

const submitGameSessionSchema = z.object({
  body: z.object({
    gameType: z.enum([
      'quick_math',
      'number_match',
      'memory_math',
      'math_catch',
      'shape_hunt',
      'clock_challenge',
      'money_market',
      'mixed_recall',
    ]),
    score: z.number().min(0),
    accuracy: z.number().min(0).max(100).optional().default(0),
    maxCombo: z.number().min(0).optional().default(0),
    totalTimeMs: z.number().min(0).optional().default(0),
    answers: z
      .array(
        z.object({
          questionId: z.string().optional(),
          userAnswer: z.any(),
          isCorrect: z.boolean(),
          timeSpentMs: z.number().optional().default(0),
        })
      )
      .optional()
      .default([]),
  }),
});

module.exports = {
  generateGameQuestionsSchema,
  submitGameSessionSchema,
};
