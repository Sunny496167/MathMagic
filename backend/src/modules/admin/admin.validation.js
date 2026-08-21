const { z } = require('zod');

// Grade schemas
const createGradeSchema = z.object({
  body: z.object({
    number: z.number().int().min(1, 'Grade number must be positive integer (1, 2, 3...)'),
    name: z.string().min(1, 'Grade name is required'),
    description: z.string().optional().default(''),
    isEnabled: z.boolean().optional().default(false),
    icon: z.string().optional().default('shapes-outline'),
    color: z.string().optional().default('#8B5CF6'),
    order: z.number().optional().default(1),
  }),
});

const updateGradeSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    number: z.number().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    isEnabled: z.boolean().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    order: z.number().optional(),
  }),
});

// Topic schemas
const introBlockSchema = z.object({
  type: z.enum(['text', 'heading', 'example', 'tip', 'image', 'formula']).default('text'),
  content: z.string().min(1, 'Block content is required'),
  order: z.number().optional().default(1),
});

const createTopicSchema = z.object({
  body: z.object({
    gradeId: z.string().min(1, 'gradeId is required'),
    title: z.string().min(1, 'Topic title is required'),
    description: z.string().optional().default(''),
    introduction: z
      .object({
        summary: z.string().optional().default(''),
        videoUrl: z.string().optional().default(''),
        keyTakeaways: z.array(z.string()).optional().default([]),
        blocks: z.array(introBlockSchema).optional().default([]),
      })
      .optional()
      .default({ summary: '', videoUrl: '', keyTakeaways: [], blocks: [] }),
    icon: z.string().optional().default('calculator-outline'),
    color: z.string().optional().default('#10B981'),
    order: z.number().optional().default(1),
    isPublished: z.boolean().optional().default(true),
  }),
});

const updateTopicSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    introduction: z
      .object({
        summary: z.string().optional(),
        videoUrl: z.string().optional(),
        keyTakeaways: z.array(z.string()).optional(),
        blocks: z.array(introBlockSchema).optional(),
      })
      .optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    order: z.number().optional(),
    isPublished: z.boolean().optional(),
  }),
});

// Exercise schemas
const contentBlockSchema = z.object({
  type: z.enum(['text', 'heading', 'example', 'tip', 'image', 'formula', 'note']).default('text'),
  content: z.string().min(1, 'Content is required'),
  order: z.number().optional().default(1),
});

const createExerciseSchema = z.object({
  body: z.object({
    topicId: z.string().min(1, 'topicId is required'),
    subtopicNumber: z.number().optional().default(1),
    title: z.string().min(1, 'Exercise/Subtopic title is required'),
    description: z.string().optional().default(''),
    icon: z.string().optional().default('happy-outline'),
    color: z.string().optional().default('#3B82F6'),
    order: z.number().optional().default(1),
    isPublished: z.boolean().optional().default(true),
    learningContent: z
      .object({
        summary: z.string().optional().default(''),
        blocks: z.array(contentBlockSchema).default([]),
      })
      .optional()
      .default({ summary: '', blocks: [] }),
    completionRequirement: z
      .object({
        minScore: z.number().min(0).max(100).default(80),
        mustAnswerAll: z.boolean().default(true),
      })
      .optional()
      .default({ minScore: 80, mustAnswerAll: true }),
  }),
});

const updateExerciseSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    subtopicNumber: z.number().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    order: z.number().optional(),
    isPublished: z.boolean().optional(),
    learningContent: z
      .object({
        summary: z.string().optional(),
        blocks: z.array(contentBlockSchema),
      })
      .optional(),
    completionRequirement: z
      .object({
        minScore: z.number().optional(),
        mustAnswerAll: z.boolean().optional(),
      })
      .optional(),
  }),
});

// Practice level schemas
const createPracticeLevelSchema = z.object({
  body: z.object({
    exerciseId: z.string().min(1, 'exerciseId is required'),
    number: z.number().int().min(1, 'Level number must be 1, 2, 3...'),
    title: z.string().optional().default(''),
    description: z.string().optional().default(''),
    difficulty: z.enum(['beginner', 'easy', 'medium', 'hard', 'advanced']).default('easy'),
    order: z.number().optional().default(1),
    questionCount: z.number().min(1).default(30),
    passingScore: z.number().min(0).max(100).default(70),
    timeLimit: z.number().min(0).default(0),
    isPublished: z.boolean().optional().default(true),
  }),
});

const updatePracticeLevelSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    number: z.number().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    difficulty: z.enum(['beginner', 'easy', 'medium', 'hard', 'advanced']).optional(),
    order: z.number().optional(),
    questionCount: z.number().optional(),
    passingScore: z.number().optional(),
    timeLimit: z.number().optional(),
    isPublished: z.boolean().optional(),
  }),
});

module.exports = {
  createGradeSchema,
  updateGradeSchema,
  createTopicSchema,
  updateTopicSchema,
  createExerciseSchema,
  updateExerciseSchema,
  createPracticeLevelSchema,
  updatePracticeLevelSchema,
};
