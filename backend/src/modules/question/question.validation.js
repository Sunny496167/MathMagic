const { z } = require('zod');

const questionItemSchema = z.object({
  type: z.enum(['mcq', 'numeric', 'fill_blank', 'true_false', 'matching', 'ordering', 'image_mcq']).default('mcq'),
  text: z.string().min(1, 'Question text is required'),
  options: z.array(z.string()).optional().default([]),
  correctAnswer: z.any({ required_error: 'Correct answer is required' }),
  acceptableAnswers: z.array(z.string()).optional().default([]),
  matchPairs: z.array(z.object({ left: z.string(), right: z.string() })).optional().default([]),
  correctOrder: z.array(z.string()).optional().default([]),
  imageUrl: z.string().optional().default(''),
  explanation: z.string().optional().default(''),
  hint: z.string().optional().default(''),
  difficulty: z.enum(['beginner', 'easy', 'medium', 'hard']).optional().default('easy'),
  xpReward: z.number().optional().default(5),
  order: z.number().optional().default(1),
  isPublished: z.boolean().optional().default(true),
});

const createQuestionSchema = z.object({
  body: questionItemSchema.extend({
    context: z.enum(['learn', 'practice']),
    exerciseId: z.string().optional(),
    practiceLevelId: z.string().optional(),
  }),
});

const bulkCreateQuestionsSchema = z.object({
  body: z.object({
    context: z.enum(['learn', 'practice']),
    exerciseId: z.string().optional(),
    practiceLevelId: z.string().optional(),
    questions: z.array(questionItemSchema).min(1, 'At least one question is required in bulk payload'),
  }),
});

const updateQuestionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Question ID is required'),
  }),
  body: questionItemSchema.partial(),
});

module.exports = {
  questionItemSchema,
  createQuestionSchema,
  bulkCreateQuestionsSchema,
  updateQuestionSchema,
};
